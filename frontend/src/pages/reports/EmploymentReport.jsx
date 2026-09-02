// src/pages/reports/EmploymentReport.jsx
import { useEffect, useMemo, useState } from "react";

/* -------------------------------------------------------------------------- */
/*                              Helpers & tiny API                            */
/* -------------------------------------------------------------------------- */
const fmtUSD = (n) =>
  typeof n === "number"
    ? n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })
    : "—";

const fmtInt = (n) => (typeof n === "number" ? n.toLocaleString(undefined) : "—");

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

  // ------------------------------ MOCK DATA ---------------------------------
  if (path === "/dim_state") {
    return [
      { state_code: 12, state_name: "Florida" },
      { state_code: 13, state_name: "Georgia" },
      { state_code: 36, state_name: "New York" },
      { state_code: 6, state_name: "California" },
      { state_code: 48, state_name: "Texas" },
    ];
  }

  if (path === "/dim_county") {
    if (String(params.state_code) === "12") {
      return [
        { county_id: 101, county_name: "Hillsborough County", county_fips: "12057", state_code: 12 },
        { county_id: 102, county_name: "Pinellas County", county_fips: "12103", state_code: 12 },
        { county_id: 103, county_name: "Pasco County", county_fips: "12101", state_code: 12 },
      ];
    }
    return [];
  }

  // KPIs (workforce pop, avg age, avg annual salary)
  if (path === "/employment/kpis") {
    const base = 1_200_000 + (Number(params.state_id || 0) % 5) * 80_000;
    const bump = params.county_id ? (Number(params.county_id) % 200_000) : 0;
    return {
      workforce_population: base + bump, // employed persons
      avg_employee_age: 37 + ((Number(params.state_id || 0) % 7)), // 37..43
      avg_yearly_salary: 62_000 + ((Number(params.state_id || 0) % 6) * 2_500) + (params.county_id ? 3_000 : 0),
    };
  }

  // Monthly salary growth time series
  if (path === "/employment/timeseries") {
    const start = Number(params.start_year ?? 2018);
    const end = Number(params.end_year ?? 2024);
    const months = [];
    for (let y = start; y <= end; y++) for (let m = 1; m <= 12; m++) months.push({ y, m });

    const seed = (params.state_id ? Number(params.state_id) : 1) * 17 + (params.county_id ? Number(params.county_id) : 0);
    const base = 5000 + (seed % 1200); // monthly base
    const series = months.map((t, i) => {
      const growth = i * 35; // gentle trend
      const season = Math.sin((i / 12) * Math.PI * 2) * 120; // seasonality
      const shock = (i === months.length - 6) ? 900 : 0; // one spike near the end
      return {
        date: `${t.y}-${String(t.m).padStart(2, "0")}`,
        monthly_salary: Math.max(3200, Math.round(base + growth + season + shock)),
      };
    });
    return series;
  }

  // Employment by industry (counts)
  if (path === "/employment/by-industry") {
    const scale = params.county_id ? 0.6 : 1.0;
    const rnd = (n) => Math.round(n * scale);
    return [
      { industry: "Healthcare", employed: rnd(98000) },
      { industry: "Retail Trade", employed: rnd(82000) },
      { industry: "Professional Svcs", employed: rnd(76000) },
      { industry: "Accommodation & Food", employed: rnd(69000) },
      { industry: "Manufacturing", employed: rnd(54000) },
      { industry: "Construction", employed: rnd(48000) },
      { industry: "Logistics", employed: rnd(43000) },
      { industry: "Education", employed: rnd(41000) },
      { industry: "Finance & Insurance", employed: rnd(38000) },
      { industry: "Information", employed: rnd(22000) },
    ];
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

/* ------------------------------ Charts (SVG) ------------------------------- */
function LineChartSvg({ data, yKey, height = 320, yFmt = (v) => v }) {
    if (!data?.length) return null;
  
    // a bit more bottom padding to fit year labels
    const padding = { top: 16, right: 16, bottom: 44, left: 60 };
    const width = Math.max(560, data.length * 36);
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
  
    const ys = data.map((d) => d[yKey]);
    const yMin = Math.min(...ys) * 0.95;
    const yMax = Math.max(...ys) * 1.05;
  
    const xScale = (i) => padding.left + (i * innerW) / Math.max(1, data.length - 1);
    const yScale = (v) => padding.top + innerH - ((v - yMin) * innerH) / Math.max(1, yMax - yMin);
  
    const points = data.map((d, i) => `${xScale(i)},${yScale(d[yKey])}`).join(" ");
  
    // ---------------------- Build ALL year ticks dynamically ----------------------
    // data.date is "YYYY-MM"
    const allYears = Array.from(
      new Set(data.map((d) => Number(d.date.slice(0, 4)))).values()
    ).sort((a, b) => a - b);
  
    // For each year, place the tick at the FIRST index in that year
    const yearTicks = allYears
      .map((year) => {
        const idx = data.findIndex((d) => d.date.startsWith(String(year)));
        return idx >= 0 ? { year, x: xScale(idx) } : null;
      })
      .filter(Boolean);
  
    // y-axis ticks
    const yTickCount = 4;
    const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => yMin + (i * (yMax - yMin)) / yTickCount);
  
    return (
      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg width={width} height={height} role="img" aria-label="Line chart">
          {/* Axes */}
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#ccc" />
          <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#ccc" />
  
          {/* Grid + Y labels */}
          {yTicks.map((t, i) => {
            const y = yScale(t);
            return (
              <g key={`y-${i}`}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#eee" />
                <text x={padding.left - 8} y={y} textAnchor="end" alignmentBaseline="middle" fontSize="11" fill="#666">
                  {yFmt(t)}
                </text>
              </g>
            );
          })}
  
          {/* Year ticks + labels across the X axis */}
          {yearTicks.map(({ year, x }) => (
            <g key={`x-${year}`}>
              {/* optional light tick guide */}
              <line x1={x} y1={height - padding.bottom} x2={x} y2={height - padding.bottom + 6} stroke="#aaa" />
              <text x={x} y={height - 8} textAnchor="middle" fontSize="12" fill="#666">
                {year}
              </text>
            </g>
          ))}
  
          {/* The line */}
          <polyline fill="none" stroke="#0b6" strokeWidth="2.5" points={points} />
        </svg>
      </div>
    );
  }
  

// Horizontal Bars for long category labels
function HBarsSvg({
    data,
    xKey = "industry",
    yKey = "employed",
    barHeight = 26,
    gap = 10,
    pad = { t: 16, r: 24, b: 16, l: 160 }, // left pad grows dynamically below
    yFmt = (v) => (v ? v.toLocaleString() : "0"),
  }) {
    if (!data?.length) return null;
  
    // Sort descending (optional, looks nicer)
    const rows = [...data].sort((a, b) => (b[yKey] || 0) - (a[yKey] || 0));
  
    // Compute a left label column width that fits longest category
    const longest = rows.reduce((m, d) => Math.max(m, String(d[xKey] || "").length), 0);
    const labelCol = Math.max(140, Math.min(280, longest * 7)); // 7px/char heuristic
    const leftPad = Math.max(pad.l, labelCol + 16);
  
    const n = rows.length;
    const height = pad.t + pad.b + n * barHeight + (n - 1) * gap;
    const width = Math.max(640, 560); // allow horizontal space; container can scroll if needed
    const innerW = width - leftPad - pad.r;
  
    const maxVal = Math.max(1, ...rows.map((d) => d[yKey] || 0));
    const x = (v) => leftPad + (innerW * (v || 0)) / maxVal;
    const y = (i) => pad.t + i * (barHeight + gap);
  
    return (
      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg width={width} height={height} role="img" aria-label="Employment by Industry">
          {/* Guide lines at 0%, 50%, 100% of max */}
          {[0, 0.5, 1].map((t, i) => {
            const val = Math.round(maxVal * t);
            const xx = x(val);
            return (
              <g key={`grid-${i}`}>
                <line x1={xx} y1={pad.t - 4} x2={xx} y2={height - pad.b + 4} stroke="#eee" />
                <text x={xx} y={height - 4} textAnchor="middle" fontSize="11" fill="#666">
                  {yFmt(val)}
                </text>
              </g>
            );
          })}
  
          {/* Bars + labels */}
          {rows.map((d, i) => {
            const v = d[yKey] || 0;
            const y0 = y(i);
            const x0 = leftPad;
            const bw = Math.max(2, x(v) - leftPad);
  
            return (
              <g key={`${d[xKey]}-${i}`}>
                {/* category label on the left */}
                <text
                  x={leftPad - 12}
                  y={y0 + barHeight / 2}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  fontSize="12"
                  fill="#333"
                >
                  {d[xKey]}
                </text>
  
                {/* bar */}
                <rect x={x0} y={y0} width={bw} height={barHeight} fill="#bbb" rx="4" />
  
                {/* value label – inside for long bars, outside for short */}
                {bw > 52 ? (
                  <text
                    x={x0 + bw - 6}
                    y={y0 + barHeight / 2}
                    textAnchor="end"
                    alignmentBaseline="middle"
                    fontSize="12"
                    fill="#222"
                  >
                    {yFmt(v)}
                  </text>
                ) : (
                  <text
                    x={x0 + bw + 6}
                    y={y0 + barHeight / 2}
                    textAnchor="start"
                    alignmentBaseline="middle"
                    fontSize="12"
                    fill="#222"
                  >
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
export default function EmploymentReport() {
  // Filters
  const [states, setStates] = useState([]);
  const [counties, setCounties] = useState([]);
  const [stateCode, setStateCode] = useState("12"); // Florida default
  const [countyId, setCountyId] = useState("");
  const [startYear, setStartYear] = useState(2019);
  const [endYear, setEndYear] = useState(2024);

  // Data
  const [kpis, setKpis] = useState(null);
  const [ts, setTs] = useState([]);
  const [byIndustry, setByIndustry] = useState([]);
  const [loadingTS, setLoadingTS] = useState(false);
  const [error, setError] = useState("");

  // States
  useEffect(() => {
    let cancelled = false;
    api("/dim_state")
      .then((data) => { if (!cancelled) setStates(data || []); })
      .catch((e) => !cancelled && setError(e.message));
    return () => { cancelled = true; };
  }, []);

  // Counties
  useEffect(() => {
    if (!stateCode) { setCounties([]); setCountyId(""); return; }
    let cancelled = false;
    api("/dim_county", { state_code: String(stateCode) })
      .then((data) => !cancelled && setCounties(data || []))
      .catch((e) => !cancelled && setError(e.message));
    return () => { cancelled = true; };
  }, [stateCode]);

  // KPIs
  useEffect(() => {
    let cancelled = false;
    api("/employment/kpis", {
      state_id: stateCode ? Number(stateCode) : undefined,
      county_id: countyId || undefined,
    })
      .then((data) => !cancelled && setKpis(data || null))
      .catch(() => {});
    return () => { cancelled = true; };
  }, [stateCode, countyId]);

  // Monthly salary time series
  useEffect(() => {
    let cancelled = false;
    setLoadingTS(true); setError("");
    api("/employment/timeseries", {
      state_id: stateCode ? Number(stateCode) : undefined,
      county_id: countyId || undefined,
      start_year: startYear,
      end_year: endYear,
    })
      .then((data) => !cancelled && setTs(data || []))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoadingTS(false));
    return () => { cancelled = true; };
  }, [stateCode, countyId, startYear, endYear]);

  // Industry bars
  useEffect(() => {
    let cancelled = false;
    api("/employment/by-industry", {
      state_id: stateCode ? Number(stateCode) : undefined,
      county_id: countyId || undefined,
      year: endYear,
    })
      .then((data) => !cancelled && setByIndustry(data || []))
      .catch(() => {});
    return () => { cancelled = true; };
  }, [stateCode, countyId, endYear]);

  // Derived YoY (latest month vs same month last year)
  const salaryYoY = useMemo(() => {
    if (!ts?.length) return null;
    const last = ts[ts.length - 1];
    const [ly, lm] = last.date.split("-").map(Number);
    const prevIdx = ts.findIndex((d) => d.date === `${ly - 1}-${String(lm).padStart(2, "0")}`);
    if (prevIdx === -1) return null;
    const prev = ts[prevIdx];
    return prev?.monthly_salary
      ? ((last.monthly_salary - prev.monthly_salary) / prev.monthly_salary) * 100
      : null;
  }, [ts]);

  return (
    <>
      <section className="panel">
        <h3>Employment Overview</h3>

        <div className="kpi-row" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(160px, 1fr))", gap: 16, margin: "8px 0 16px" }}>
          <KpiCard title="Workforce Population" value={fmtInt(kpis?.workforce_population)} sub="Employed persons" />
          <KpiCard title="Avg Employee Age" value={kpis?.avg_employee_age != null ? `${kpis.avg_employee_age}` : "—"} sub="Years" />
          <KpiCard title="Avg Yearly Salary" value={fmtUSD(kpis?.avg_yearly_salary)} sub="Estimate" />
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

          <NumberInput label="Start Year" value={startYear} onChange={setStartYear} min={2010} max={endYear} />
          <NumberInput label="End Year" value={endYear} onChange={setEndYear} min={startYear} max={2099} />
        </div>

        {/* Monthly Salary Growth */}
        <div className="chart-block" style={{ marginTop: 10 }}>
          <div className="chart-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <h4>Monthly Salary Growth</h4>
            {loadingTS ? (
              <span className="badge" style={{ fontSize: ".8rem", color: "#0a6", background: "#e8fff4", border: "1px solid #baf0d1", padding: "2px 8px", borderRadius: 999 }}>
                Loading…
              </span>
            ) : null}
          </div>

          {error ? (
            <Empty>Couldn’t load data: {error}</Empty>
          ) : !ts?.length ? (
            <Empty>No data in the selected range.</Empty>
          ) : (
            <LineChartSvg
              data={ts}
              yKey="monthly_salary"
              yFmt={(v) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${Math.round(v)}`)}
            />
          )}
        </div>

        {/* Quick YoY badge */}
        <div style={{ marginTop: 8, color: "#444", fontSize: ".9rem" }}>
          {salaryYoY != null ? (
            <>Latest month YoY change: <b>{salaryYoY.toFixed(1)}%</b></>
          ) : (
            "YoY change unavailable for the latest month."
          )}
        </div>
      </section>

      {/* Employment by Industry */}
      <section className="panel">
        <h3>Employment Level by Industry — {endYear}</h3>
        {!byIndustry?.length ? (
          <Empty>Industry breakdown unavailable.</Empty>
        ) : (
          <HBarsSvg
            data={byIndustry}
            xKey="industry"
            yKey="employed"
            yFmt={(v) => (v ? v.toLocaleString() : "0")}
          />
        )}
      </section>

      {/* Mobile tweaks */}
      <style>{`
        @media (max-width: 1024px) {
          .kpi-row { grid-template-columns: repeat(3, minmax(160px, 1fr)) !important; }
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
