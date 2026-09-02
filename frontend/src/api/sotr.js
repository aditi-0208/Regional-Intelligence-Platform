// src/api/sotr.js
// CRA env vars (not Vite). Put these in .env.local at the project root:
//   REACT_APP_API_BASE=http://localhost:4000
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

async function get(path, params = {}) {
  const url = new URL(API_BASE + path);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export const fetchCategories = () => get('/api/explore/categories');
export const fetchStates = () => get('/api/explore/states');
export const fetchGeographies = ({ level, state, q }) =>
  get('/api/explore/geographies', { level, state, q });
export const fetchSeries = ({ indicator, geos, from, to }) =>
  get('/api/explore/series', { indicator, geos: geos.join(','), from, to });
export const fetchRankings = ({ indicator, level, period, geos }) =>
  get('/api/explore/rankings', { indicator, level, period, geos: geos.join(',') });

/* ----------------------------- formatting ----------------------------- */

export function formatValue(value, unit, { compact = false } = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  switch (unit) {
    case 'usd':
      return compact
        ? `$${Math.round(value / 1000)}k`
        : value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    case 'percent': return `${value.toFixed(1)}%`;
    case 'index':   return value.toFixed(3);
    case 'rate':    return value.toFixed(1);
    case 'count':   return compact ? `${Math.round(value / 1000)}k` : value.toLocaleString('en-US');
    default:        return String(value);
  }
}

/** Difference between two values. Percentages move in points, not percent. */
export function formatDelta(delta, unit) {
  if (delta === null || delta === undefined || Number.isNaN(delta)) return '—';
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : '';
  const mag = Math.abs(delta);
  if (unit === 'percent') return `${sign}${mag.toFixed(1)}pp`;
  if (unit === 'usd') return `${sign}${formatValue(mag, 'usd')}`;
  if (unit === 'index') return `${sign}${mag.toFixed(3)}`;
  return `${sign}${mag.toFixed(1)}`;
}

/* -------------------------- summary statistics -------------------------- */

/**
 * Computed client-side rather than as an endpoint -- it's a handful of
 * array operations over data already in memory, so a round trip would
 * buy nothing.
 */
export function summarize(rows, geoId) {
  const points = rows
    .map((r) => ({ period: r.period, value: r[geoId] }))
    .filter((p) => p.value !== null && p.value !== undefined);

  if (points.length === 0) return null;

  const first = points[0];
  const last = points[points.length - 1];

  let peak = points[0];
  for (const p of points) if (p.value > peak.value) peak = p;

  let biggestMove = null;
  for (let i = 1; i < points.length; i++) {
    const change = points[i].value - points[i - 1].value;
    if (!biggestMove || Math.abs(change) > Math.abs(biggestMove.change)) {
      biggestMove = { change, from: points[i - 1].period, to: points[i].period };
    }
  }

  return {
    first, last, peak, biggestMove,
    change: last.value - first.value,
  };
}

/* ------------------------------ CSV export ------------------------------ */

export function toCsv(rows, geos, indicator) {
  const header = ['Year', ...geos.map((g) => g.geo_name)];
  const body = rows.map((r) => [r.period, ...geos.map((g) => r[g.geo_id] ?? '')]);
  const escape = (c) => (/[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c);
  const lines = [
    `# ${indicator?.label || 'Indicator'}${indicator?.unit ? ` (${indicator.unit})` : ''}`,
    '# Source: U.S. Census Bureau (ACS). Estimates carry a margin of error.',
    [header, ...body].map((row) => row.map(escape).join(',')).join('\n'),
  ];
  return lines.join('\n');
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
