// src/pages/Explore.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  fetchCategories, fetchStates, fetchGeographies, fetchSeries, fetchRankings,
  formatValue, formatDelta, summarize, toCsv, downloadCsv,fetchComparison,
} from '../api/sotr';
import { useApi } from '../hooks/useApi';
import './Explore.css';

/**
 * Colour is assigned by SLOT, not by region, so the first selected region is
 * always blue, the second green, the third amber -- and that holds across the
 * stat cards, chart, summary columns, and rankings table. Each slot bundles
 * every class name the existing CSS needs for that colour.
 */
const SLOTS = [
  { color: '#1A5FA5', stat: 'stat-card-blue',  chip: 'region-chip-blue',  name: 'summary-name-blue',  rank: 'rank-blue',  row: 'highlight-blue'  },
  { color: '#0F6E56', stat: 'stat-card-green', chip: 'region-chip-green', name: 'summary-name-green', rank: 'rank-green', row: 'highlight-green' },
  { color: '#854F0B', stat: 'stat-card-amber', chip: 'region-chip-amber', name: 'summary-name-amber', rank: 'rank-amber', row: 'highlight-amber' },
];

const MAX_REGIONS = 3;

const Explore = () => {
  /* URL is the source of truth for selections, which makes Share a one-liner
     and lets people bookmark or send a specific view. */
  const [searchParams, setSearchParams] = useSearchParams();

  const level      = searchParams.get('level')     || 'county';
  const stateFips  = searchParams.get('state')     || '';
  const categoryId = searchParams.get('category')  || '';
  const indicatorId= searchParams.get('indicator') || '';
  const yearStart  = searchParams.get('from')      || '2013';
  const yearEnd    = searchParams.get('to')        || '2024';
  const chartType  = searchParams.get('chart')     || 'line';
  const geoIds     = useMemo(
    () => (searchParams.get('geos') || '').split(',').filter(Boolean),
    [searchParams]
  );

  const setParam = useCallback((patch) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([k, v]) => {
        if (v === null || v === undefined || v === '') next.delete(k);
        else next.set(k, v);
      });
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  /* ------------------------------ lookups ------------------------------ */

  const categories = useApi(fetchCategories, []);
  const states = useApi(fetchStates, []);
  const geographies = useApi(
    () => fetchGeographies({ level, state: stateFips || undefined }),
    [level, stateFips]
  );

  const activeCategory = useMemo(
    () => (categories.data || []).find((c) => c.id === categoryId) || (categories.data || [])[0],
    [categories.data, categoryId]
  );

  const indicator = useMemo(
    () => activeCategory?.indicators.find((i) => i.id === indicatorId) || activeCategory?.indicators[0],
    [activeCategory, indicatorId]
  );

  /* Seed defaults once the lookups land, so a bare /explore URL still works. */
  useEffect(() => {
    if (!categories.data?.length) return;
    const patch = {};
    if (!categoryId) patch.category = categories.data[0].id;
    if (!indicatorId) patch.indicator = categories.data[0].indicators[0].id;
    if (Object.keys(patch).length) setParam(patch);
  }, [categories.data, categoryId, indicatorId, setParam]);

  /*useEffect(() => {
    if (geoIds.length || !geographies.data?.length) return;
    setParam({ geos: geographies.data.slice(0, 3).map((g) => g.geo_id).join(',') });
  }, [geographies.data, geoIds.length, setParam]);*/

  /* ------------------------------- data -------------------------------- */

  const series = useApi(
    () => fetchSeries({ indicator: indicator.id, geos: geoIds, from: yearStart, to: yearEnd }),
    [indicator?.id, geoIds.join(','), yearStart, yearEnd],
    { enabled: Boolean(indicator?.id) && geoIds.length > 0 }
  );

  const rankings = useApi(
    () => fetchRankings({ indicator: indicator.id, level, period: yearEnd, geos: geoIds }),
    [indicator?.id, level, yearEnd, geoIds.join(',')],
    { enabled: Boolean(indicator?.id) && geoIds.length > 0 }
  );

  const comparison = useApi(
  () => fetchComparison({
    indicator: indicator.id,
    countyA: geoIds[0],
    countyB: geoIds[1],
    startYear: yearStart,
    endYear: yearEnd,
  }),
  [indicator?.id, geoIds[0], geoIds[1], yearStart, yearEnd],
  { enabled: Boolean(indicator?.id) && geoIds.length === 2 }
);

  const unit = series.data?.indicator?.unit || indicator?.unit;
  const rows = series.data?.data || [];
  const regions = useMemo(
    () => (series.data?.geos || []).map((g, i) => ({ ...g, ...SLOTS[i % SLOTS.length] })),
    [series.data]
  );

  /* Y axis bounds from the data. The original hardcoded [59, 66], which only
     ever suited one indicator -- income or home values would render flat. */
  const yDomain = useMemo(() => {
    const values = rows.flatMap((r) => regions.map((g) => r[g.geo_id])).filter((v) => typeof v === 'number');
    if (!values.length) return ['auto', 'auto'];
    const min = Math.min(...values), max = Math.max(...values);
    const pad = (max - min || Math.abs(max) * 0.1) * 0.15;
    return [Math.max(0, min - pad), max + pad];
  }, [rows, regions]);

  const summaries = useMemo(
    () => regions.map((g) => ({ region: g, stats: summarize(rows, g.geo_id) })),
    [rows, regions]
  );

  /* ------------------------------ actions ------------------------------ */

  const addRegion = (geoId) => {
    if (!geoId || geoIds.includes(geoId) || geoIds.length >= MAX_REGIONS) return;
    setParam({ geos: [...geoIds, geoId].join(',') });
  };
  const removeRegion = (geoId) => setParam({ geos: geoIds.filter((g) => g !== geoId).join(',') });

  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); }
    catch { /* clipboard blocked; the URL bar already holds the view */ }
  };

  const exportCsv = () => {
    if (!rows.length) return;
    const name = `${indicator?.id || 'indicator'}_${yearStart}-${yearEnd}.csv`;
    downloadCsv(name, toCsv(rows, regions, series.data?.indicator));
  };

  const available = (geographies.data || []).filter((g) => !geoIds.includes(g.geo_id));

  /* ------------------------------- render ------------------------------ */

  return (
    <div className="explore-page">
      <div className="explore-header">
        <div className="container">
          <div className="explore-title">Explore regional data</div>
          <p className="lead">
            Select regions, an indicator, and a date range to visualize trends
            and compare performance.
          </p>
        </div>
      </div>

      <div className="control-panel">
        <div className="container">
          <div className="control-row">
            <div className="select-group">
              <div className="select-label">Geographic level</div>
              <select
                className="select-field"
                value={level}
                onChange={(e) => setParam({ level: e.target.value, geos: '' })}
              >
                <option value="msa">National metro (MSA)</option>
                <option value="county">County</option>
              </select>
            </div>

            <div className="select-group">
              <div className="select-label">State filter</div>
              <select
                className="select-field"
                value={stateFips}
                onChange={(e) => setParam({ state: e.target.value })}
              >
                <option value="">All states</option>
                {(states.data || []).map((s) => (
                  <option key={s.state_fips} value={s.state_fips}>{s.state_name}</option>
                ))}
              </select>
            </div>

            <div className="select-group">
              <div className="select-label">Category</div>
              <select
                className="select-field"
                value={activeCategory?.id || ''}
                onChange={(e) => {
                  const cat = categories.data.find((c) => c.id === e.target.value);
                  setParam({ category: cat.id, indicator: cat.indicators[0].id });
                }}
              >
                {(categories.data || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="select-group">
              <div className="select-label">Indicator</div>
              <select
                className="select-field"
                value={indicator?.id || ''}
                onChange={(e) => setParam({ indicator: e.target.value })}
              >
                {(activeCategory?.indicators || []).map((i) => (
                  <option key={i.id} value={i.id}>{i.label}</option>
                ))}
              </select>
            </div>

            <div className="select-group">
              <div className="select-label">From</div>
              <input
                type="text" className="year-input" value={yearStart}
                onChange={(e) => setParam({ from: e.target.value })}
              />
            </div>

            <div className="select-group">
              <div className="select-label">To</div>
              <input
                type="text" className="year-input" value={yearEnd}
                onChange={(e) => setParam({ to: e.target.value })}
              />
            </div>

            <div className="control-divider" />

            <div>
              <div className="select-label">Chart type</div>
              <div className="chart-type-toggle">
                {['line', 'bar', 'table'].map((type) => (
                  <button
                    key={type} type="button"
                    className={`chart-type-btn${chartType === type ? ' active' : ''}`}
                    onClick={() => setParam({ chart: type })}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-actions">
              <button type="button" className="btn btn-outline btn-sm" onClick={share}>↗ Share</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={exportCsv} disabled={!rows.length}>
                ↓ CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="region-chips-bar">
        <div className="container region-chips-inner">
          {regions.map((region) => (
            <div key={region.geo_id} className={`region-chip ${region.chip}`}>
              <div className="chip-dot" style={{ background: region.color }} />
              {region.geo_name}
              <span
                className="chip-remove" role="button" tabIndex={0}
                onClick={() => removeRegion(region.geo_id)}
                onKeyDown={(e) => e.key === 'Enter' && removeRegion(region.geo_id)}
              >×</span>
            </div>
          ))}

          {geoIds.length < MAX_REGIONS && (
            <select
              className="select-field" value=""
              onChange={(e) => addRegion(e.target.value)}
              disabled={!available.length}
            >
              <option value="">+ Add region</option>
              {available.map((g) => (
                <option key={g.geo_id} value={g.geo_id}>{g.geo_name}</option>
              ))}
            </select>
          )}

          <span className="region-chips-note">
            Max {MAX_REGIONS} regions · each color used consistently across all charts
          </span>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="stat-cards">
            {summaries.map(({ region, stats }) => {
              const up = stats && stats.change > 0;
              return (
                <div key={region.geo_id} className={`stat-card ${region.stat}`}>
                  <div className="stat-card-name">● {region.geo_name}</div>
                  <div className="stat-card-value">{formatValue(stats?.last.value, unit)}</div>
                  <div className={`stat-card-change ${up ? 'change-up' : 'change-down'}`}>
                    {stats
                      ? `${up ? '↑' : '↓'} ${formatDelta(stats.change, unit)} since ${stats.first.period}`
                      : '—'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="chart-area">
            <div className="chart-header">
              <div>
                <div className="chart-title">
                  {indicator?.label || 'Indicator'}{' '}
                  <span className="tag tag-blue">{activeCategory?.label}</span>
                </div>
                <div className="chart-subtitle">
                  {indicator?.description || indicator?.label} · {yearStart}–{yearEnd}
                </div>
              </div>
            </div>

            {!geoIds.length ? (
              <div className="chart-canvas-wrap" style={{ display: 'grid', placeItems: 'center', color: '#888' }}>
                Choose 2 counties to compare.
              </div>
            ) :series.loading ? (
              <div className="chart-canvas-wrap" style={{ display: 'grid', placeItems: 'center', color: '#888' }}>
                Loading…
              </div>
            ) : series.error ? (
              <div className="chart-canvas-wrap" style={{ display: 'grid', placeItems: 'center', gap: 12, color: '#888' }}>
                <div>Couldn’t load this chart. {series.error.message}</div>
                <button type="button" className="btn btn-outline btn-sm" onClick={series.refetch}>Try again</button>
              </div>
            ) : !rows.length ? (
              <div className="chart-canvas-wrap" style={{ display: 'grid', placeItems: 'center', color: '#888' }}>
                No data for this selection. Try another indicator, region, or date range.
              </div>
            ) : chartType !== 'table' ? (
              <div className="chart-canvas-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'line' ? (
                    <LineChart data={rows}>
                      <CartesianGrid stroke="rgba(0,0,0,.04)" />
                      <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#888' }} />
                      <YAxis
                        domain={yDomain}
                        tick={{ fontSize: 10, fill: '#888' }}
                        tickFormatter={(v) => formatValue(v, unit, { compact: true })}
                      />
                      <Tooltip formatter={(v) => formatValue(v, unit)} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                      {regions.map((region) => (
                        <Line
                          key={region.geo_id}
                          type="monotone"
                          dataKey={region.geo_id}
                          name={region.geo_name}
                          stroke={region.color}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 4 }}
                          connectNulls={false}
                        />
                      ))}
                    </LineChart>
                  ) : (
                    <BarChart data={rows}>
                      <CartesianGrid stroke="rgba(0,0,0,.04)" />
                      <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#888' }} />
                      <YAxis
                        domain={yDomain}
                        tick={{ fontSize: 10, fill: '#888' }}
                        tickFormatter={(v) => formatValue(v, unit, { compact: true })}
                      />
                      <Tooltip formatter={(v) => formatValue(v, unit)} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                      {regions.map((region) => (
                        <Bar
                          key={region.geo_id}
                          dataKey={region.geo_id}
                          name={region.geo_name}
                          fill={region.color}
                          radius={[4, 4, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            ) : (
              <table className="rankings-table explore-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    {regions.map((r) => <th key={r.geo_id}>{r.geo_name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.period}>
                      <td>{row.period}</td>
                      {regions.map((r) => <td key={r.geo_id}>{formatValue(row[r.geo_id], unit)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="chart-meta">
              <div className="chart-meta-item">
                <strong>Source:</strong>{' '}
                {(series.data?.sources || []).map((s) => s.source_name).join(' · ') || '—'}
              </div>
              <div className="chart-meta-item">
                <strong>Geographic level:</strong> {level === 'msa' ? 'Metro (MSA)' : 'County'}
              </div>
              <div className="chart-meta-item">
                <strong>Metric:</strong> {indicator?.label || '—'}
              </div>
              <Link to="/methodology" className="chart-meta-link">Methodology →</Link>
            </div>
          </div>

          <div className="summary-stats">
            <div className="summary-header">Summary statistics</div>
            <div className="summary-cols">
              {summaries.map(({ region, stats }) => (
                <div className="summary-col" key={region.geo_id}>
                  <div className="summary-col-name">
                    <div className="dot" style={{ background: region.color }} />
                    <span className={region.name}>{region.geo_name}</span>
                  </div>
                  {stats ? (
                    <>
                      <div className="summary-row">
                        <strong>Change {stats.first.period}→{stats.last.period}:</strong>{' '}
                        {formatValue(stats.first.value, unit)} → {formatValue(stats.last.value, unit)}{' '}
                        ({formatDelta(stats.change, unit)})
                      </div>
                      <div className="summary-row">
                        <strong>Peak:</strong> {formatValue(stats.peak.value, unit)} in {stats.peak.period}
                      </div>
                      {stats.biggestMove && (
                        <div className="summary-row">
                          <strong>Largest YoY {stats.biggestMove.change >= 0 ? 'gain' : 'drop'}:</strong>{' '}
                          {formatDelta(stats.biggestMove.change, unit)}{' '}
                          ({stats.biggestMove.from}→{stats.biggestMove.to})
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="summary-row">No observations in range.</div>
                  )}
                </div>
              ))}
            </div>
          </div>
              {comparison.data?.insights?.length > 0 && (
  <div className="insights-panel">
    <div className="insights-header">Key findings</div>
    {comparison.data.insights.map((text, i) => (
      <div className="insight-item" key={i}>
        <span className="insight-marker">→</span>
        <span>{text}</span>
      </div>
    ))}
    {comparison.data.notes?.length > 0 && (
      <div className="data-notes">
        {comparison.data.notes.map((note, i) => (
          <div className="note-item" key={i}>
            <span>⚠</span>
            <span>{note}</span>
          </div>
        ))}
      </div>
    )}
  </div>
)}
          <div className="card national-context">
            <h2 className="section-title national-title">National context</h2>
            <p className="national-desc">
              How selected regions rank nationally on this indicator · selected regions highlighted
            </p>

            {rankings.data ? (
              <table className="rankings-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Region</th>
                    <th>Value ({rankings.data.period})</th>
                    <th>vs national avg</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Ranked rows, with the national average slotted in at its
                      own position so the reader can see who sits above and below. */}
                  {insertAverageRow(rankings.data, regions, unit)}
                </tbody>
              </table>
            ) : (
              <p className="national-desc">{rankings.loading ? 'Loading rankings…' : 'Rankings unavailable.'}</p>
            )}

            <button type="button" className="rankings-link">
              View full national rankings for this indicator →
            </button>
          </div>
        </div>
      </div>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <div className="footer-brand">Regional Macro-Economic Insights</div>
            <div className="footer-sub">University of South Florida · © 2025</div>
          </div>
          <div className="footer-links">
            <Link to="/methodology">Methodology</Link>
            <Link to="/about">About</Link>
            <Link to="/about">Cite this work</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

/** Build the rankings tbody, placing the national average row in rank order. */
function insertAverageRow(ranking, regions, unit) {
  const slotFor = (geoId) => regions.find((r) => r.geo_id === geoId) || SLOTS[0];
  const sorted = [...ranking.rows].sort((a, b) => a.rank - b.rank);
  const out = [];
  let averagePlaced = false;

  const averageRow = (
    <tr className="avg-row" key="__avg">
      <td>—</td>
      <td><em>National average</em></td>
      <td>{formatValue(ranking.national_average, unit)}</td>
      <td>—</td>
    </tr>
  );

  for (const row of sorted) {
    if (!averagePlaced && ranking.national_average != null && row.value < ranking.national_average) {
      out.push(averageRow);
      averagePlaced = true;
    }
    const slot = slotFor(row.geo_id);
    out.push(
      <tr className={slot.row} key={row.geo_id}>
        <td><span className={`rank-num ${slot.rank}`}>#{row.rank}</span></td>
        <td>
          <span className="rank-region">
            <span className="dot" style={{ background: slot.color }} />
            {row.geo_name}
          </span>
        </td>
        <td>{formatValue(row.value, unit)}</td>
        <td className={row.vs_average >= 0 ? 'above-avg' : 'below-avg'}>
          {formatDelta(row.vs_average, unit)} {row.vs_average >= 0 ? 'above' : 'below'}
        </td>
      </tr>
    );
  }
  if (!averagePlaced && ranking.national_average != null) out.push(averageRow);
  return out;
}

export default Explore;
