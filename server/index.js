require('dotenv').config();
const express = require('express');
const cors = require('cors');

const USE_MOCK = process.env.USE_MOCK !== 'false';
const data = USE_MOCK ? require('./mock') : require('./queries');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));

/* Cache. Census data changes a few times a year; caching hard is safe and
   keeps load off a shared 100-DTU production server. Swap for Azure Cache
   for Redis once you run more than one instance. */
const TTL = Number(process.env.CACHE_TTL_MINUTES || 60) * 60_000;
const cache = new Map();
const cached = (key, fn) => {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return Promise.resolve(hit.val);
  return Promise.resolve(fn()).then((val) => (cache.set(key, { val, at: Date.now() }), val));
};

const route = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    console.error(`[${req.method} ${req.path}]`, err.message);
    res.status(500).json({ error: 'query_failed', message: err.message });
  });

const bad = (res, message) => res.status(400).json({ error: 'invalid_request', message });
const GEO_LEVELS = new Set(['msa', 'county', 'state']);

/* ------------------------------------------------------------------ *
 * Every route below maps to something Explore.jsx actually renders.
 * ------------------------------------------------------------------ */

app.get('/api/health', route(async (req, res) => {
  if (USE_MOCK) return res.json({ status: 'ok', mode: 'mock' });
  const { query } = require('./db');
  const rows = await query('SELECT 1 AS ok');
  res.json({ status: 'ok', mode: 'live', db: rows[0].ok === 1 ? 'connected' : 'unexpected' });
}));

/** Category + Indicator dropdowns (they're dependent, so one call feeds both). */
app.get('/api/explore/categories', route(async (req, res) => {
  res.json(await cached('categories', () => data.listCategories()));
}));

/** State filter dropdown. */
app.get('/api/explore/states', route(async (req, res) => {
  res.json(await cached('states', () => data.listStates()));
}));

/** Region picker: geographic level + state filter + typeahead. */
app.get('/api/explore/geographies', route(async (req, res) => {
  const level = req.query.level || 'county';
  const state = req.query.state || null;   // FIPS, e.g. '12'
  const q = req.query.q || null;
  if (!GEO_LEVELS.has(level)) return bad(res, `Unknown level: ${level}`);
  const key = `geos:${level}:${state}:${q}`;
  res.json(await cached(key, () => data.listGeographies({ level, state, q })));
}));

/**
 * The main chart.
 * GET /api/explore/series?indicator=family_household_share&geos=12057,12086,12095&from=2013&to=2024
 *
 * Returns rows pre-pivoted and keyed by geo_id (not name — names contain
 * commas and can collide). Doing the pivot server-side keeps the page's
 * chart code trivial.
 */
app.get('/api/explore/series', route(async (req, res) => {
  const indicatorId = req.query.indicator;
  const geoIds = String(req.query.geos || '').split(',').map((s) => s.trim()).filter(Boolean);
  const from = req.query.from || null;
  const to = req.query.to || null;

  if (!indicatorId) return bad(res, 'indicator is required');
  if (!geoIds.length) return bad(res, 'geos is required');
  if (geoIds.length > 3) return bad(res, 'Maximum 3 regions');

  const key = `series:${indicatorId}:${geoIds.slice().sort().join(',')}:${from}:${to}`;
  res.json(await cached(key, async () => {
    const [rows, indicator] = await Promise.all([
      data.getSeries({ indicatorId, geoIds, from, to }),
      data.getIndicator(indicatorId),
    ]);

    const byPeriod = new Map();
    const geos = new Map();
    for (const r of rows) {
      if (!byPeriod.has(r.period)) byPeriod.set(r.period, { period: r.period });
      const row = byPeriod.get(r.period);
      row[r.geo_id] = r.value;
      row[`${r.geo_id}__moe`] = r.moe;
      if (!geos.has(r.geo_id)) geos.set(r.geo_id, { geo_id: r.geo_id, geo_name: r.geo_name });
    }

    return {
      indicator,
      // Preserve the caller's order so colour assignment stays stable
      geos: geoIds.map((id) => geos.get(id)).filter(Boolean),
      data: [...byPeriod.values()].sort((a, b) => a.period.localeCompare(b.period)),
      sources: await data.getSources([...new Set(rows.map((r) => r.source_id).filter(Boolean))]),
    };
  }));
}));

/**
 * National context table: where the selected regions rank nationally,
 * plus the national average row the page shows between them.
 */
app.get('/api/explore/rankings', route(async (req, res) => {
  const indicatorId = req.query.indicator;
  const level = req.query.level || 'county';
  const period = req.query.period || null;
  const geoIds = String(req.query.geos || '').split(',').map((s) => s.trim()).filter(Boolean);

  if (!indicatorId) return bad(res, 'indicator is required');
  if (!GEO_LEVELS.has(level)) return bad(res, `Unknown level: ${level}`);

  const key = `rank:${indicatorId}:${level}:${period}:${geoIds.slice().sort().join(',')}`;
  res.json(await cached(key, () => data.getRankings({ indicatorId, level, period, geoIds })));
}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}  [${USE_MOCK ? 'MOCK' : 'LIVE'}]`));
