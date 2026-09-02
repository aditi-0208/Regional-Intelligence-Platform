// src/pages/reports/HealthReport.jsx
import { useEffect, useMemo, useState } from "react";
import USChoropleth from "./USchoroplethMap.jsx"; // same map component you used in Income

/* -------------------------------------------------------------------------- */
/*                         Helpers & tiny (mockable) API                      */
/* -------------------------------------------------------------------------- */
const fmtPct = (n) =>
  typeof n === "number" ? `${n.toFixed(1)}%` : "—";

const fmt1 = (n) =>
  typeof n === "number" ? n.toFixed(1) : "—";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const USE_MOCK = (process.env.REACT_APP_USE_MOCK || "true") === "true";
const API_BASE = process.env.REACT_APP_API_BASE || "";

async function api(path, params = {}) {
  if (!USE_MOCK) {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
    ).toString();
    const res = await fetch(`${API_BASE}${path}${q ? `?${q}` : ""}`);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  }

  // ------------------------------- MOCK DATA --------------------------------
  if (path === "/dim_state") {
    return [
      { state_code: 12, state_name: "Florida" },
      { state_code: 13, state_name: "Georgia" },
      { state_code: 36, state_name: "New York" },
      { state_code: 6,  state_name: "California" },
      { state_code: 48, state_name: "Texas" },
    ];
  }

  if (path === "/dim_county") {
    if (String(params.state_code) === "12") {
      return [
        { county_id: 101, county_name: "Hillsborough County", county_fips: "12057", state_code: 12 },
        { county_id: 102, county_name: "Pinellas County",      county_fips: "12103", state_code: 12 },
        { county_id: 103, county_name: "Pasco County",         county_fips: "12101", state_code: 12 },
        { county_id: 104, county_name: "Hernando County",      county_fips: "12053", state_code: 12 },
        { county_id: 105, county_name: "Manatee County",       county_fips: "12081", state_code: 12 },
      ];
    }
    return [];
  }

  // Health KPI snapshot for selected scope (state/county) and year
  // - life_expectancy: years
  // - uninsured_rate: %
  // - adult_obesity_rate: %
  if (path === "/health/kpis") {
    const y = Number(params.year || 2023);
    const seed = (Number(params.state_id || 1) * 31 + Number(params.county_id || 0)) % 17;

    const baseLE = 77.2 + ((y - 2013) * 0.05) - (seed % 3) * 0.1; // slight drift
    const baseUnins = 12.0 - (y - 2013) * 0.25 + (seed % 4) * 0.2; // improving over time
    const baseOb = 27.0 + (seed % 5) * 0.4 + (y % 2 ? 0.2 : -0.1); // gentle wobble

    return {
      life_expectancy: Math.max(72, Math.min(82, Number(baseLE.toFixed(1)))),
      uninsured_rate: Math.max(4, Number(baseUnins.toFixed(1))),
      adult_obesity_rate: Math.max(20, Number(baseOb.toFixed(1))),
    };
  }

  // Health time-series (annual)
  // Returns an array of { year, life_expectancy, uninsured_rate, adult_obesity_rate }
  if (path === "/health/timeseries") {
    const start = Number(params.start_year ?? 2013);
    const end = Number(params.end_year ?? 2023);
    const sid = Number(params.state_id || 12);
    const cid = Number(params.county_id || 0);
    const seed = (sid * 19 + cid) % 23;

    const series = [];
    let le = 76.5 + (seed % 10) * 0.1;   // start life expectancy
    let un = 13.2 - (seed % 6) * 0.2;    // start uninsured
    let ob = 26.0 + (seed % 8) * 0.3;    // start obesity

    for (let y = start; y <= end; y++) {
      // small trends + gentle shocks
      le += 0.08 + ((y % 4 === 0) ? -0.12 : 0.03);
      un += -0.25 + ((y % 5 === 0) ? 0.15 : 0);
      ob += 0.15 + ((y % 3 === 0) ? 0.05 : -0.02);

      series.push({
        year: y,
        life_expectancy: Number(clamp(le, 72, 83).toFixed(1)),
        uninsured_rate: Number(clamp(un, 4, 20).toFixed(1)),
        adult_obesity_rate: Number(clamp(ob, 20, 40).toFixed(1)),
      });
    }
    return series;
  }

  // County snapshot for a year (used for bars)
  // metric can be: life_expectancy | adult_obesity_rate | uninsured_rate
  if (path === "/health/by-county") {
    const metric = params.metric || "life_expectancy";
    const base = {
      life_expectancy: 78.5,
      adult_obesity_rate: 28.5,
      uninsured_rate: 10.0,
    }[metric];

    const counties = [
      { county_name: "Hillsborough", v: base + 0.6 },
      { county_name: "Pinellas",     v: base - 0.4 },
      { county_name: "Pasco",        v: base - 1.1 },
      { county_name: "Hernando",     v: base - 1.6 },
      { county_name: "Manatee",      v: base + 1.0 },
    ];

    return counties.map((c) => {
      if (metric === "life_expectancy") return { county_name: c.county_name, life_expectancy: Number(c.v.toFixed(1)) };
      if (metric === "adult_obesity_rate") return { county_name: c.county_name, adult_obesity_rate: Number(c.v.toFixed(1)) };
      return { county_name: c.county_name, uninsured_rate: Number(c.v.toFixed(1)) };
    });
  }

  // State snapshot for choropleth (life expectancy)
  if (path === "/health/state-snapshot") {
    const year = Number(params.year || 2023);
    const fipsList = [1,2,4,5,6,8,9,10,11,12,13,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,44,45,46,47,48,49,50,51,53,54,55,56];
    return fipsList.map((f) => {
      const pseudo = 76.0 + ((f % 9) * 0.4) + ((year - 2013) * 0.05);
      return { state_code: f, value: Number(pseudo.toFixed(1)) };
    });
  }

  return [];
}

/* -------------------------------------------------------------------------- */
/*                                   UI bits                                  */
/* -------------------------------------------------------------------------- */
function Select({ label, value, onChange, children, disabled }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <select className="field-control" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        {children}
      </select>
    </label>
  );
}
function NumberInput({ label, value, onChange, min, max }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        className="field-control"
        type="number"
        value={value ?? ""}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      />
    </label>
  );
}
function KpiCard({ title, value, sub }) {
  return (
    <div className="kpi" style={{ background: "#fff", border: "1px solid #e6e6e6", borderRadius: 12, padding: "14px 16px" }}>
      <div className="kpi-title" style={{ fontSize: ".85rem", color: "#555" }}>{title}</div>
      <div className="kpi-value" style={{ fontSize: "1.35rem", fontWeight: 700, marginTop: 4 }}>{value}</div>
      {sub ? <div className="kpi-sub" style={{ fontSize: ".8rem", color: "#777", marginTop: 2 }}>{sub}</div> : null}
    </div>
  );
}
function Empty({ children }) {
  return <div className="empty" style={{ padding: 18, border: "1px dashed #ccc", borderRadius: 10, background: "#fafafa", color: "#666", textAlign: "center" }}>{children}</div>;
}

/* ------------------------------- Charts (SVG) ------------------------------ */
function LineChartSvg({ data, xKey, yKey, height = 320, yFmt = (v) => v }) {
  if (!data?.length) return null;
  const padding = { top: 16, right: 16, bottom: 28, left: 60 };
  const width = Math.max(560, data.length * 60);
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const xs = data.map((d) => d[xKey]);
  const ys = data.map((d) => d[yKey]);
  const xMin = 0;
  const xMax = data.length - 1;
  const yMin = Math.min(...ys) * 0.95;
  const yMax = Math.max(...ys) * 1.05;

  const xScale = (i) => padding.left + (i - xMin) * (innerW / (xMax - xMin || 1));
  const yScale = (v) => padding.top + innerH - ((v - yMin) * innerH) / (yMax - yMin || 1);

  const points = data.map((d, i) => `${xScale(i)},${yScale(d[yKey])}`).join(" ");
  const firstYear = xs[0];
  const lastYear = xs[xs.length - 1];

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => yMin + (i * (yMax - yMin)) / ticks);

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg width={width} height={height} role="img" aria-label="Line chart">
        {/* axes */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#ccc" />
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#ccc" />
        {/* y grid */}
        {yTicks.map((t, i) => {
          const y = yScale(t);
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#eee" />
              <text x={padding.left - 8} y={y} textAnchor="end" alignmentBaseline="middle" fontSize="11" fill="#666">
                {yFmt(t)}
              </text>
            </g>
          );
        })}
        {/* x labels */}
        <text x={padding.left} y={height - 6} fontSize="12" fill="#666">{firstYear}</text>
        <text x={width - padding.right - 18} y={height - 6} fontSize="12" fill="#666">{lastYear}</text>
        {/* line */}
        <polyline fill="none" stroke="#0b6" strokeWidth="2.5" points={points} />
      </svg>
    </div>
  );
}

// Year-over-year % columns for a numeric series key
function YoYColumnsSvg({ ts, yKey }) {
  if (!ts?.length) return null;
  const yoy = ts.slice(1).map((d, i) => {
    const prev = ts[i][yKey];
    const cur = d[yKey];
    return { year: d.year, pct: prev ? ((cur - prev) / prev) * 100 : 0 };
  });

  const width = Math.max(520, yoy.length * 48);
  const height = 320;
  const pad = { t: 16, r: 16, b: 28, l: 44 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;

  const yMax = Math.max(5, Math.ceil(Math.max(...yoy.map((d) => d.pct)) / 5) * 5);
  const yMin = Math.min(-5, Math.floor(Math.min(...yoy.map((d) => d.pct)) / 5) * 5);

  const x = (i) => pad.l + i * (innerW / (yoy.length || 1));
  const y = (v) => pad.t + (yMax - v) * (innerH / (yMax - yMin || 1));
  const zeroY = y(0);

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg width={width} height={height} role="img" aria-label="YoY columns">
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={height - pad.b} stroke="#ccc" />
        <line x1={pad.l} y1={zeroY} x2={width - pad.r} y2={zeroY} stroke="#ccc" />
        {yoy.map((d, i) => {
          const barW = 24;
          const x0 = x(i) + 6;
          const y0 = Math.min(y(d.pct), zeroY);
          const h = Math.abs(y(d.pct) - zeroY);
          const color = d.pct >= 0 ? "#0b6" : "#c33";
          return <rect key={d.year} x={x0} y={y0} width={barW} height={h} fill={color} rx="3" />;
        })}
        {yoy.map((d, i) => (
          <text key={d.year} x={x(i) + 18} y={height - 8} textAnchor="middle" fontSize="11" fill="#666">{d.year}</text>
        ))}
        {[yMin, (yMin + yMax) / 2, yMax].map((t, i) => (
          <text key={i} x={pad.l - 8} y={y(t)} textAnchor="end" alignmentBaseline="middle" fontSize="11" fill="#666">
            {t.toFixed(0)}%
          </text>
        ))}
      </svg>
    </div>
  );
}

// Horizontal bars for county comparisons
function HBarsSvg({
  data,
  nameKey,
  valueKey,
  barHeight = 26,
  gap = 10,
  yFmt = (v) => v,
}) {
  if (!data?.length) return null;

  const rows = [...data].sort((a, b) => (b[valueKey] ?? 0) - (a[valueKey] ?? 0));
  const longest = rows.reduce((m, d) => Math.max(m, String(d[nameKey] || "").length), 0);
  const labelCol = Math.max(140, Math.min(280, longest * 7));

  const pad = { t: 16, r: 24, b: 24, l: labelCol + 24 };
  const n = rows.length;
  const height = pad.t + pad.b + n * barHeight + (n - 1) * gap;
  const width = Math.max(640, 560);
  const innerW = width - pad.l - pad.r;

  const maxVal = Math.max(1, ...rows.map((d) => d[valueKey] || 0));
  const x = (v) => pad.l + (innerW * (v || 0)) / maxVal;
  const y = (i) => pad.t + i * (barHeight + gap);

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg width={width} height={height} role="img" aria-label="County bars">
        {[0, 0.5, 1].map((t, i) => {
          const val = maxVal * t;
          const xx = x(val);
          return (
            <g key={`grid-${i}`}>
              <line x1={xx} y1={pad.t - 4} x2={xx} y2={height - pad.b + 4} stroke="#eee" />
              <text x={xx} y={height - 6} textAnchor="middle" fontSize="11" fill="#666">
                {yFmt(val)}
              </text>
            </g>
          );
        })}

        {rows.map((d, i) => {
          const v = d[valueKey] || 0;
          const y0 = y(i);
          const x0 = pad.l;
          const bw = Math.max(2, x(v) - pad.l);
          return (
            <g key={`${d[nameKey]}-${i}`}>
              <text
                x={pad.l - 12}
                y={y0 + barHeight / 2}
                textAnchor="end"
                alignmentBaseline="middle"
                fontSize="12"
                fill="#333"
              >
                {d[nameKey]}
              </text>

              <rect x={x0} y={y0} width={bw} height={barHeight} fill="#bbb" rx="4" />

              {bw > 52 ? (
                <text x={x0 + bw - 6} y={y0 + barHeight / 2} textAnchor="end" alignmentBaseline="middle" fontSize="12" fill="#222">
                  {yFmt(v)}
                </text>
              ) : (
                <text x={x0 + bw + 6} y={y0 + barHeight / 2} textAnchor="start" alignmentBaseline="middle" fontSize="12" fill="#222">
                  {yFmt(v)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Main page                                  */
/* -------------------------------------------------------------------------- */
export default function HealthReport() {
  // Filters (mirror Income/Employment)
  const [states, setStates] = useState([]);
  const [counties, setCounties] = useState([]);
  const [stateCode, setStateCode] = useState("12"); // Florida default
  const [countyId, setCountyId] = useState("");
  const [startYear, setStartYear] = useState(2013);
  const [endYear, setEndYear] = useState(2023);
  const [barYear, setBarYear] = useState(2023);

  // Data
  const [kpis, setKpis] = useState(null);
  const [ts, setTs] = useState([]);
  const [byCountyLE, setByCountyLE] = useState([]);  // life expectancy by county
  const [byCountyOb, setByCountyOb] = useState([]);  // obesity by county
  const [stateSnapshot, setStateSnapshot] = useState({}); // choropleth (life expectancy)
  const [loading, setLoading] = useState(false);
  const [loadingBars, setLoadingBars] = useState(false);
  const [error, setError] = useState("");

  // States & counties
  useEffect(() => {
    let cancelled = false;
    api("/dim_state")
      .then((data) => { if (!cancelled) setStates(data || []); })
      .catch((e) => !cancelled && setError(e.message));
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!stateCode) { setCounties([]); setCountyId(""); return; }
    let cancelled = false;
    api("/dim_county", { state_code: String(stateCode) })
      .then((data) => !cancelled && setCounties(data || []))
      .catch((e) => !cancelled && setError(e.message));
    return () => { cancelled = true; };
  }, [stateCode]);

  // KPI snapshot for selected scope/year
  useEffect(() => {
    let cancelled = false;
    api("/health/kpis", { state_id: Number(stateCode), county_id: countyId || undefined, year: barYear })
      .then((d) => !cancelled && setKpis(d || null))
      .catch(()=>{});
    return () => { cancelled = true; };
  }, [stateCode, countyId, barYear]);

  // Time series (annual)
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError("");
    api("/health/timeseries", {
      state_id: Number(stateCode),
      county_id: countyId || undefined,
      start_year: startYear,
      end_year: endYear,
    })
      .then((data) => !cancelled && setTs(data || []))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [stateCode, countyId, startYear, endYear]);

  // County bars (life expectancy + obesity) for barYear
  useEffect(() => {
    let cancelled = false;
    setLoadingBars(true);
    Promise.all([
      api("/health/by-county", { state_id: Number(stateCode), year: barYear, metric: "life_expectancy" }),
      api("/health/by-county", { state_id: Number(stateCode), year: barYear, metric: "adult_obesity_rate" }),
    ])
      .then(([le, ob]) => { if (!cancelled) { setByCountyLE(le || []); setByCountyOb(ob || []); } })
      .catch(()=>{})
      .finally(() => !cancelled && setLoadingBars(false));
    return () => { cancelled = true; };
  }, [stateCode, barYear]);

  // State choropleth (life expectancy)
  useEffect(() => {
    let cancelled = false;
    api("/health/state-snapshot", { year: barYear })
      .then((arr) => {
        if (cancelled) return;
        const obj = {};
        for (const row of arr) obj[row.state_code] = row.value;
        setStateSnapshot(obj);
      })
      .catch(()=>{});
    return () => { cancelled = true; };
  }, [barYear]);

  // Derived KPIs from TS
  const derived = useMemo(() => {
    if (!ts?.length) return null;
    const last = ts[ts.length - 1];
    const prev = ts[ts.length - 2];
    return {
      lastYear: last?.year,
      lifeExp: last?.life_expectancy,
      unins: last?.uninsured_rate,
      obesity: last?.adult_obesity_rate,
      lifeExpYoY: prev ? ((last.life_expectancy - prev.life_expectancy) / prev.life_expectancy) * 100 : null,
    };
  }, [ts]);

  return (
    <>
      {/* KPIs & Filters */}
      <section className="panel">
        <h3>Health Overview</h3>

        <div className="kpi-row" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 16, margin: "8px 0 16px" }}>
          <KpiCard title="Life Expectancy" value={fmt1(derived?.lifeExp)} sub={derived?.lastYear ? `years · ${derived.lastYear}` : ""} />
          <KpiCard title="Uninsured Rate" value={fmtPct(derived?.unins)} sub="Population without health insurance" />
          <KpiCard title="Adult Obesity" value={fmtPct(derived?.obesity)} sub="Share of adults with obesity" />
          <KpiCard title="Life Exp. YoY" value={derived?.lifeExpYoY != null ? `${derived.lifeExpYoY.toFixed(2)}%` : "—"} sub="vs prior year" />
        </div>

        <div className="filters" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 12, margin: "12px 0 8px" }}>
          <Select label="State" value={stateCode} onChange={(v) => { setStateCode(v); setCountyId(""); }}>
            {states.map((s) => (
              <option key={s.state_code} value={String(s.state_code)}>{s.state_name}</option>
            ))}
          </Select>

          <Select label="County (optional)" value={countyId} onChange={setCountyId} disabled={!counties.length}>
            <option value="">All counties (state level)</option>
            {counties.map((c) => (
              <option key={c.county_id} value={String(c.county_id)}>{c.county_name}</option>
            ))}
          </Select>

          <NumberInput label="Start Year" value={startYear} onChange={setStartYear} min={2000} max={endYear} />
          <NumberInput label="End Year" value={endYear} onChange={(v) => { setEndYear(v); if (v < barYear) setBarYear(v); }} min={startYear} max={2099} />
        </div>

        {/* Trend lines */}
        <div className="chart-block" style={{ marginTop: 10 }}>
          <div className="chart-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <h4>Life Expectancy — by Year</h4>
            {loading ? <span className="badge" style={{ fontSize: ".8rem", color: "#0a6", background: "#e8fff4", border: "1px solid #baf0d1", padding: "2px 8px", borderRadius: 999 }}>Loading…</span> : null}
          </div>

          {error ? (
            <Empty>Couldn’t load data: {error}</Empty>
          ) : !ts?.length ? (
            <Empty>No data in the selected range.</Empty>
          ) : (
            <LineChartSvg
              data={ts.map(d => ({ year: d.year, value: d.life_expectancy }))}
              xKey="year"
              yKey="value"
              yFmt={(v) => v.toFixed(1)}
            />
          )}
        </div>

        <div className="chart-block" style={{ marginTop: 18 }}>
          <h4>Uninsured Rate — by Year</h4>
          {!ts?.length ? (
            <Empty>No data in the selected range.</Empty>
          ) : (
            <LineChartSvg
              data={ts.map(d => ({ year: d.year, value: d.uninsured_rate }))}
              xKey="year"
              yKey="value"
              yFmt={(v) => `${v.toFixed(1)}%`}
            />
          )}
        </div>
      </section>

      {/* US choropleth for life expectancy */}
      <section className="panel">
        <div className="chart-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h3>US Choropleth — Life Expectancy ({barYear})</h3>
          <div style={{ width: 180 }}>
            <NumberInput label="Year" value={barYear} onChange={setBarYear} min={startYear} max={endYear} />
          </div>
        </div>
        {!Object.keys(stateSnapshot).length ? (
          <Empty>State snapshot unavailable.</Empty>
        ) : (
          <USChoropleth
            key={barYear}
            data={stateSnapshot}
            statesMeta={states}
            onStateClick={(fips) => { setStateCode(String(fips)); setCountyId(""); }}
          />
        )}
      </section>

      {/* YoY bars + County comparisons */}
      <section className="panel">
        <h3>Year-over-Year % Change & County Comparisons — {barYear}</h3>
        {!ts?.length ? (
          <Empty>No time series to compute YoY.</Empty>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)", gap: 16, alignItems: "start" }}>
            <div>
              <h4>Life Expectancy — YoY %</h4>
              <YoYColumnsSvg ts={ts} yKey="life_expectancy" />
            </div>
            <div>
              <h4>Adult Obesity — Counties</h4>
              {loadingBars ? (
                <Empty>Loading county data…</Empty>
              ) : !byCountyOb.length ? (
                <Empty>County data unavailable.</Empty>
              ) : (
                <HBarsSvg
                  data={byCountyOb}
                  nameKey="county_name"
                  valueKey="adult_obesity_rate"
                  yFmt={(v) => `${v.toFixed(1)}%`}
                />
              )}
            </div>
          </div>
        )}
      </section>

      {/* County life expectancy bars */}
      <section className="panel">
        <h3>Life Expectancy — Counties ({barYear})</h3>
        {loadingBars ? (
          <Empty>Loading county data…</Empty>
        ) : !byCountyLE.length ? (
          <Empty>County data unavailable.</Empty>
        ) : (
          <HBarsSvg
            data={byCountyLE}
            nameKey="county_name"
            valueKey="life_expectancy"
            yFmt={(v) => `${v.toFixed(1)}`}
          />
        )}
      </section>

      {/* Mobile tweaks */}
      <style>{`
        @media (max-width: 1024px) {
          .kpi-row { grid-template-columns: repeat(2, minmax(160px, 1fr)) !important; }
          .filters { grid-template-columns: repeat(3, minmax(140px, 1fr)) !important; }
        }
        @media (max-width: 768px) {
          .kpi-row { grid-template-columns: 1fr 1fr !important; }
          .filters { grid-template-columns: repeat(2, minmax(140px, 1fr)) !important; }
        }
        @media (max-width: 480px) {
          .kpi-row { grid-template-columns: 1fr !important; }
          .filters { grid-template-columns: 1fr !important; }
          svg { height: auto; }
        }
      `}</style>
    </>
  );
}
