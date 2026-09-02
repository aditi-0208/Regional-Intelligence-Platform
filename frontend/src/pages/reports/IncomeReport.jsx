// src/pages/reports/IncomeReport.jsx
import { useEffect, useMemo, useState } from "react";
import USChoropleth from "./USchoroplethMap.jsx";

/* -------------------------------------------------------------------------- */
/*                            Helpers & tiny API                              */
/* -------------------------------------------------------------------------- */
const fmtUSD = (n) =>
  typeof n === "number"
    ? n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })
    : "—";

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

  // --------------------------- MOCK DATA (demo) ----------------------------
  if (path === "/dim_state") {
    // FIPS + names
    return [
      { state_code: 1, state_name: "Alabama" }, { state_code: 2, state_name: "Alaska" },
      { state_code: 4, state_name: "Arizona" }, { state_code: 5, state_name: "Arkansas" },
      { state_code: 6, state_name: "California" }, { state_code: 8, state_name: "Colorado" },
      { state_code: 9, state_name: "Connecticut" }, { state_code: 10, state_name: "Delaware" },
      { state_code: 11, state_name: "District of Columbia" }, { state_code: 12, state_name: "Florida" },
      { state_code: 13, state_name: "Georgia" }, { state_code: 15, state_name: "Hawaii" },
      { state_code: 16, state_name: "Idaho" }, { state_code: 17, state_name: "Illinois" },
      { state_code: 18, state_name: "Indiana" }, { state_code: 19, state_name: "Iowa" },
      { state_code: 20, state_name: "Kansas" }, { state_code: 21, state_name: "Kentucky" },
      { state_code: 22, state_name: "Louisiana" }, { state_code: 23, state_name: "Maine" },
      { state_code: 24, state_name: "Maryland" }, { state_code: 25, state_name: "Massachusetts" },
      { state_code: 26, state_name: "Michigan" }, { state_code: 27, state_name: "Minnesota" },
      { state_code: 28, state_name: "Mississippi" }, { state_code: 29, state_name: "Missouri" },
      { state_code: 30, state_name: "Montana" }, { state_code: 31, state_name: "Nebraska" },
      { state_code: 32, state_name: "Nevada" }, { state_code: 33, state_name: "New Hampshire" },
      { state_code: 34, state_name: "New Jersey" }, { state_code: 35, state_name: "New Mexico" },
      { state_code: 36, state_name: "New York" }, { state_code: 37, state_name: "North Carolina" },
      { state_code: 38, state_name: "North Dakota" }, { state_code: 39, state_name: "Ohio" },
      { state_code: 40, state_name: "Oklahoma" }, { state_code: 41, state_name: "Oregon" },
      { state_code: 42, state_name: "Pennsylvania" }, { state_code: 44, state_name: "Rhode Island" },
      { state_code: 45, state_name: "South Carolina" }, { state_code: 46, state_name: "South Dakota" },
      { state_code: 47, state_name: "Tennessee" }, { state_code: 48, state_name: "Texas" },
      { state_code: 49, state_name: "Utah" }, { state_code: 50, state_name: "Vermont" },
      { state_code: 51, state_name: "Virginia" }, { state_code: 53, state_name: "Washington" },
      { state_code: 54, state_name: "West Virginia" }, { state_code: 55, state_name: "Wisconsin" },
      { state_code: 56, state_name: "Wyoming" },
    ];
  }

  if (path === "/dim_county") {
    if (String(params.state_code) === "12") {
      return [
        { county_id: 101, county_name: "Hillsborough County", county_fips: "12057", state_code: 12 },
        { county_id: 102, county_name: "Pinellas County", county_fips: "12103", state_code: 12 },
        { county_id: 103, county_name: "Pasco County", county_fips: "12101", state_code: 12 },
        { county_id: 104, county_name: "Hernando County", county_fips: "12053", state_code: 12 },
        { county_id: 105, county_name: "Manatee County", county_fips: "12081", state_code: 12 },
      ];
    }
    return [];
  }

  if (path === "/income/timeseries") {
    const start = Number(params.start_year ?? 2013);
    const end = Number(params.end_year ?? 2023);
    const base = 52000 + (params.state_id ? (Number(params.state_id) % 5) * 1000 : 0);
    const bump = params.county_id ? (Number(params.county_id) % 3000) : 0;
    const arr = [];
    for (let y = start; y <= end; y++) {
      const i = y - start;
      const val = base + i * 1500 + bump;
      arr.push({ year: y, median_income_total: val, gini_index: 0.44 + ((i % 6) * 0.008) });
    }
    return arr;
  }

  if (path === "/income/by-county") {
    return [
      { county_name: "Hillsborough", median_income_total: 69000 },
      { county_name: "Pinellas",    median_income_total: 65000 },
      { county_name: "Pasco",       median_income_total: 61000 },
      { county_name: "Hernando",    median_income_total: 58000 },
      { county_name: "Manatee",     median_income_total: 72000 },
    ];
  }

  // Mobility mock
  if (path === "/income/mobility") {
    const base = 65000;
    const noise = (n) => Math.round(n + (Math.random() - 0.5) * 4000);
    return {
      same_house_1yr: noise(base - 3000),
      moved_within_county: noise(base + 2000),
      moved_from_different_state: noise(base + 5000),
    };
  }

  // State snapshot mock (value by FIPS), deterministic for demo
  if (path === "/income/state-snapshot") {
    const year = Number(params.year || 2023);
    const fipsList = [1,2,4,5,6,8,9,10,11,12,13,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,44,45,46,47,48,49,50,51,53,54,55,56];
    return fipsList.map((f) => {
      const pseudo = 52000 + (f % 9) * 2500 + (year - 2013) * 1200;
      return { state_code: f, value: pseudo };
    });
  }

  return [];
}

/* -------------------------------------------------------------------------- */
/*                               Small UI atoms                               */
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

/* -------------------------------------------------------------------------- */
/*                              Tiny chart pieces                             */
/* -------------------------------------------------------------------------- */

// Line chart used earlier
function LineChartSvg({ data, xKey, yKey, height = 320 }) {
  if (!data?.length) return null;
  const padding = { top: 16, right: 16, bottom: 28, left: 44 };
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
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#ccc" />
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#ccc" />
        {yTicks.map((t, i) => {
          const y = yScale(t);
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#eee" />
              <text x={padding.left - 8} y={y} textAnchor="end" alignmentBaseline="middle" fontSize="11" fill="#666">
                {t >= 1000 ? `$${Math.round(t / 1000)}k` : t.toFixed(0)}
              </text>
            </g>
          );
        })}
        <text x={padding.left} y={height - 6} fontSize="12" fill="#666">{firstYear}</text>
        <text x={width - padding.right - 18} y={height - 6} fontSize="12" fill="#666">{lastYear}</text>
        <polyline fill="none" stroke="#0b6" strokeWidth="2.5" points={points} />
      </svg>
    </div>
  );
}

/* YoY columns */
function YoYColumnsSvg({ ts }) {
  if (!ts?.length) return null;
  const years = ts.map((d) => d.year);
  const yoy = ts.slice(1).map((d, i) => {
    const prev = ts[i].median_income_total;
    return { year: d.year, pct: prev ? ((d.median_income_total - prev) / prev) * 100 : 0 };
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
        {/* axes */}
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={height - pad.b} stroke="#ccc" />
        <line x1={pad.l} y1={zeroY} x2={width - pad.r} y2={zeroY} stroke="#ccc" />
        {/* bars */}
        {yoy.map((d, i) => {
          const barW = 24;
          const x0 = x(i) + 6;
          const y0 = Math.min(y(d.pct), zeroY);
          const h = Math.abs(y(d.pct) - zeroY);
          const color = d.pct >= 0 ? "#0b6" : "#c33";
          return <rect key={d.year} x={x0} y={y0} width={barW} height={h} fill={color} rx="3" />;
        })}
        {/* labels */}
        {yoy.map((d, i) => (
          <text key={d.year} x={x(i) + 18} y={height - 8} textAnchor="middle" fontSize="11" fill="#666">{d.year}</text>
        ))}
        {/* y ticks */}
        {[yMin, (yMin + yMax) / 2, yMax].map((t, i) => (
          <text key={i} x={pad.l - 8} y={y(t)} textAnchor="end" alignmentBaseline="middle" fontSize="11" fill="#666">
            {t.toFixed(0)}%
          </text>
        ))}
      </svg>
    </div>
  );
}

/* Mobility grouped bars */
function MobilityBars({ mobility }) {
  if (!mobility) return null;
  const items = [
    { k: "same_house_1yr", label: "Same House", val: mobility.same_house_1yr },
    { k: "moved_within_county", label: "Moved Within County", val: mobility.moved_within_county },
    { k: "moved_from_different_state", label: "From Different State", val: mobility.moved_from_different_state },
  ];
  const max = Math.max(...items.map((d) => d.val));
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {items.map((d) => {
        const pct = max ? Math.round((d.val / max) * 100) : 0;
        return (
          <div key={d.k} style={{ display: "grid", gridTemplateColumns: "200px 1fr 90px", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 13 }}>{d.label}</div>
            <div style={{ height: 12, background: "#eee", borderRadius: 6 }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "#1b7", borderRadius: 6 }} />
            </div>
            <div style={{ fontSize: 12, textAlign: "right" }}>{fmtUSD(d.val)}</div>
          </div>
        );
      })}
    </div>
  );
}

/* Gini gauge */
function GiniGauge({ gini }) {
  const v = clamp(gini ?? 0.45, 0, 1);
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const angle = Math.PI * (1 - v); // 0..1 maps to 180..0 deg
  const x2 = cx + r * Math.cos(angle);
  const y2 = cy + r * Math.sin(angle);
  return (
    <svg width={size} height={size/1.6} viewBox={`0 0 ${size} ${size/1.6}`}>
      {/* arc */}
      <path d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke="#ddd" strokeWidth="10" />
      {/* colored arc segments */}
      <path d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx},${cy}`} fill="none" stroke="#7bd" strokeWidth="10" />
      <path d={`M ${cx},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke="#f9b24d" strokeWidth="10" />
      {/* needle */}
      <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#222" strokeWidth="3" />
      <circle cx={cx} cy={cy} r="4" fill="#222" />
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize="12" fill="#333">Gini: {v.toFixed(3)}</text>
    </svg>
  );
}

/* County slopegraph (two years) */
function Slopegraph({ startYear, endYear, start, end }) {
  if (!start?.length || !end?.length) return null;
  const take = 10;
  const a = [...start].sort((x,y)=>y.median_income_total - x.median_income_total).slice(0,take);
  const b = [...end].sort((x,y)=>y.median_income_total - x.median_income_total).slice(0,take);

  const names = Array.from(new Set([...a.map(d=>d.county_name), ...b.map(d=>d.county_name)]));
  const rank = (arr, name) => arr.findIndex((d)=>d.county_name===name) + 1 || take + 2;

  const width = 640, height = 360, pad = 40;
  const innerH = height - pad*2;
  const yScale = (r) => pad + ((r-1)/(take-1)) * innerH;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      <text x={pad} y={24} fontWeight="600">{startYear}</text>
      <text x={width - pad} y={24} fontWeight="600" textAnchor="end">{endYear}</text>
      {names.map((n,i)=>{
        const r1 = rank(a, n); const r2 = rank(b, n);
        if (r1>take && r2>take) return null;
        const y1 = yScale(Math.min(r1,take));
        const y2 = yScale(Math.min(r2,take));
        return (
          <g key={n}>
            <line x1={pad+60} y1={y1} x2={width - pad-60} y2={y2} stroke="#bbb" />
            <text x={pad+56} y={y1} textAnchor="end" alignmentBaseline="middle" fontSize="12">{n}</text>
            <text x={width-pad-56} y={y2} alignmentBaseline="middle" fontSize="12">{n}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                     US Tile-map Choropleth (no libs)                       */
/* -------------------------------------------------------------------------- */
/* Row/col tile positions (common US tile grid) */
const TILE_POS = {
  WA:[1,1], MT:[2,1], ND:[3,1], MN:[4,1], WI:[5,1], MI:[6,1], VT:[8,1], NH:[9,1],
  OR:[1,2], ID:[2,2], SD:[3,2], IA:[4,2], IL:[5,2], IN:[6,2], OH:[7,2], PA:[8,2], NY:[9,2], ME:[10,1],
  CA:[1,3], NV:[2,3], WY:[3,3], NE:[4,3], MO:[5,3], KY:[6,3], WV:[7,3], VA:[8,3], MD:[9,3], MA:[10,2], CT:[10,3], RI:[10,4], NJ:[9,4], DE:[8,4], DC:[8,5],
  AZ:[2,4], UT:[3,4], CO:[4,4], KS:[5,4], AR:[6,4], TN:[7,4], NC:[8,4], SC:[9,4],
  NM:[2,5], OK:[3,5], TX:[4,5], LA:[5,5], MS:[6,5], AL:[7,5], GA:[8,5], FL:[9,5],
  AK:[1,6], HI:[2,6]
};
/* FIPS → postal */
const FIPS_TO_ABBR = {
  1:"AL",2:"AK",4:"AZ",5:"AR",6:"CA",8:"CO",9:"CT",10:"DE",11:"DC",12:"FL",13:"GA",15:"HI",16:"ID",17:"IL",18:"IN",19:"IA",20:"KS",21:"KY",22:"LA",23:"ME",24:"MD",25:"MA",26:"MI",27:"MN",28:"MS",29:"MO",30:"MT",31:"NE",32:"NV",33:"NH",34:"NJ",35:"NM",36:"NY",37:"NC",38:"ND",39:"OH",40:"OK",41:"OR",42:"PA",44:"RI",45:"SC",46:"SD",47:"TN",48:"TX",49:"UT",50:"VT",51:"VA",53:"WA",54:"WV",55:"WI",56:"WY"
};

function colorScale(min, max, v) {
  if (min === max) return "#cfe";
  const t = (v - min) / (max - min);
  const L = 90 - t * 50;     // 90..40
  const S = 55;              // constant saturation
  const H = 150;             // green-ish
  return `hsl(${H} ${S}% ${L}%)`;
}

function TileChoropleth({ states, snapshot }) {
  if (!states?.length || !snapshot) return null;
  // snapshot: { [FIPS]: value }
  const pairs = Object.entries(snapshot).map(([k,v]) => ({ fips: Number(k), value: v, abbr: FIPS_TO_ABBR[k] }));
  const values = pairs.map((p) => p.value);
  const min = Math.min(...values), max = Math.max(...values);

  const size = 42; // tile size
  const pad  = 8;
  const cols = 11, rows = 6;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={cols*(size+pad)+pad} height={rows*(size+pad)+pad + 30}>
        {pairs.map((p)=>{
          const ab = p.abbr; if (!ab || !TILE_POS[ab]) return null;
          const [c,r] = TILE_POS[ab];
          const x = pad + (c-1)*(size+pad);
          const y = pad + (r-1)*(size+pad);
          const fill = colorScale(min, max, p.value);
          return (
            <g key={ab}>
              <rect x={x} y={y} width={size} height={size} rx="6" fill={fill} stroke="#fff" />
              <text x={x+size/2} y={y+16} textAnchor="middle" fontWeight="700" fontSize="12">{ab}</text>
              <text x={x+size/2} y={y+32} textAnchor="middle" fontSize="11">{Math.round(p.value/1000)}k</text>
            </g>
          );
        })}
        {/* legend */}
        <defs>
          <linearGradient id="lg" x1="0" x2="1">
            <stop offset="0%" stopColor={colorScale(min,max,min)} />
            <stop offset="100%" stopColor={colorScale(min,max,max)} />
          </linearGradient>
        </defs>
        <rect x={pad} y={rows*(size+pad)+10} width={220} height={10} fill="url(#lg)" rx="5" />
        <text x={pad} y={rows*(size+pad)+28} fontSize="11">{fmtUSD(min)}</text>
        <text x={pad+220} y={rows*(size+pad)+28} textAnchor="end" fontSize="11">{fmtUSD(max)}</text>
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                       Country Heatmap (State × Year)                       */
/* -------------------------------------------------------------------------- */
function MatrixHeatmap({ years, rows }) {
  // rows: [{key:'FL', label:'Florida', values: {2020:65000, 2021:...}}]
  if (!years?.length || !rows?.length) return null;

  const cell = 20, gap = 4, left = 160, top = 24;
  const width = left + years.length * (cell + gap) + 20;
  const height = top + rows.length * (cell + gap) + 20;
  // compute range
  const allVals = rows.flatMap(r => years.map(y => r.values[y]).filter(v=>v!=null));
  const min = Math.min(...allVals), max = Math.max(...allVals);

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={Math.max(width, 600)} height={Math.max(height, 300)}>
        {/* year labels */}
        {years.map((y, i)=>(
          <text key={y} x={left + i*(cell+gap) + cell/2} y={16} textAnchor="middle" fontSize="11">{y}</text>
        ))}
        {/* cells + row labels */}
        {rows.map((r, ri)=>(
          <g key={r.key}>
            <text x={left-8} y={top + ri*(cell+gap) + cell/2} textAnchor="end" alignmentBaseline="middle" fontSize="11">{r.label}</text>
            {years.map((y, ci)=>{
              const v = r.values[y];
              const fill = v==null ? "#eee" : colorScale(min, max, v);
              return (
                <rect key={y} x={left + ci*(cell+gap)} y={top + ri*(cell+gap)} width={cell} height={cell} rx="3" fill={fill} />
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Main page                                   */
/* -------------------------------------------------------------------------- */
export default function IncomeReport() {
  // Filters
  const [states, setStates] = useState([]);
  const [counties, setCounties] = useState([]);
  const [stateCode, setStateCode] = useState("12"); // Florida by default
  const [countyId, setCountyId] = useState("");
  const [startYear, setStartYear] = useState(2013);
  const [endYear, setEndYear] = useState(2023);
  const [barYear, setBarYear] = useState(2023);

  // Data
  const [ts, setTs] = useState([]);
  const [byCounty, setByCounty] = useState([]);
  const [mobility, setMobility] = useState(null);
  const [stateSnapshot, setStateSnapshot] = useState({});   // {FIPS: value}
  const [heatmapRows, setHeatmapRows] = useState([]);       // rows for state×year matrix
  const [heatmapYears, setHeatmapYears] = useState([]);

  const [byCountyStart, setByCountyStart] = useState([]);
  const [byCountyEnd, setByCountyEnd] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingBar, setLoadingBar] = useState(false);
  const [error, setError] = useState("");

  // States list
  useEffect(() => {
    let cancelled = false;
    api("/dim_state")
      .then((data) => { if (!cancelled) setStates(data || []); })
      .catch((e) => !cancelled && setError(e.message));
    return () => { cancelled = true; };
  }, []);

  // Counties for selected state
  useEffect(() => {
    if (!stateCode) { setCounties([]); setCountyId(""); return; }
    let cancelled = false;
    api("/dim_county", { state_code: String(stateCode) })
      .then((data) => !cancelled && setCounties(data || []))
      .catch((e) => !cancelled && setError(e.message));
    return () => { cancelled = true; };
  }, [stateCode]);

  // Timeseries
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError("");
    api("/income/timeseries", {
      state_id: stateCode ? Number(stateCode) : undefined,
      county_id: countyId || undefined,
      start_year: startYear,
      end_year: endYear,
    })
      .then((data) => !cancelled && setTs(data || []))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [stateCode, countyId, startYear, endYear]);

  // County snapshot for barYear
  useEffect(() => {
    if (!stateCode) return;
    let cancelled = false;
    setLoadingBar(true);
    api("/income/by-county", { state_id: Number(stateCode), year: barYear })
      .then((data) => !cancelled && setByCounty(data || []))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoadingBar(false));
    return () => { cancelled = true; };
  }, [stateCode, barYear]);

  // Mobility for the selected granularity/year
  useEffect(() => {
    let cancelled = false;
    api("/income/mobility", {
      state_id: Number(stateCode),
      county_id: countyId || undefined,
      year: barYear,
    })
      .then((data) => !cancelled && setMobility(data))
      .catch(()=>{});
    return () => { cancelled = true; };
  }, [stateCode, countyId, barYear]);

  // State snapshot for tile choropleth
  useEffect(() => {
    let cancelled = false;
    api("/income/state-snapshot", { year: barYear })
      .then((arr) => {
        if (cancelled) return;
        const obj = {};
        for (const row of arr) obj[row.state_code] = row.value;
        setStateSnapshot(obj);
      })
      .catch(()=>{});
    return () => { cancelled = true; };
  }, [barYear]);

  // Build State × Year heatmap data
  useEffect(() => {
    let cancelled = false;
    const years = [];
    for (let y = startYear; y <= endYear; y++) years.push(y);

    Promise.all(years.map((y)=>api("/income/state-snapshot", { year: y })))
      .then((all) => {
        if (cancelled) return;
        const byYear = all.map((arr, idx) => {
          const y = years[idx]; const obj = {}; arr.forEach(r => obj[r.state_code] = r.value); return { y, obj };
        });
        const rows = states.map((s) => {
          const ab = FIPS_TO_ABBR[s.state_code] || s.state_name?.slice(0,2)?.toUpperCase();
          const values = {};
          byYear.forEach(({y,obj}) => { values[y] = obj[s.state_code]; });
          return { key: ab, label: ab, values };
        });
        setHeatmapRows(rows);
        setHeatmapYears(years);
      })
      .catch(()=>{});
    return () => { cancelled = true; };
  }, [states, startYear, endYear]);

  // Slopegraph data (two endpoints)
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api("/income/by-county", { state_id: Number(stateCode), year: startYear }),
      api("/income/by-county", { state_id: Number(stateCode), year: endYear }),
    ]).then(([a,b])=>{
      if (cancelled) return;
      setByCountyStart(a || []); setByCountyEnd(b || []);
    });
    return () => { cancelled = true; };
  }, [stateCode, startYear, endYear]);

  // KPIs
  const kpis = useMemo(() => {
    if (!ts?.length) return null;
    const sorted = [...ts].sort((a, b) => a.year - b.year);
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    const yoy = prev ? ((last.median_income_total - prev.median_income_total) / prev.median_income_total) * 100 : null;
    return {
      medianIncome: last?.median_income_total,
      gini: last?.gini_index,
      yoy,
      lastYear: last?.year,
    };
  }, [ts]);

  return (
    <>
      {/* KPIs & Filters */}
      <section className="panel">
        <h3>Income Overview</h3>

        <div className="kpi-row" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(160px, 1fr))", gap: 16, margin: "8px 0 16px" }}>
          <KpiCard title="Median Household Income" value={fmtUSD(kpis?.medianIncome)} sub={kpis?.lastYear ? `in ${kpis.lastYear}` : ""} />
          <KpiCard title="YoY Change" value={kpis?.yoy != null ? `${kpis.yoy.toFixed(1)}%` : "—"} sub="vs prior year" />
          <KpiCard title="Gini Index" value={kpis?.gini != null ? kpis.gini.toFixed(3) : "—"} sub="0 = equal · 1 = unequal" />
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

        {/* Trend line */}
        <div className="chart-block" style={{ marginTop: 10 }}>
          <div className="chart-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <h4>Median Household Income — by Year</h4>
            {loading ? <span className="badge" style={{ fontSize: ".8rem", color: "#0a6", background: "#e8fff4", border: "1px solid #baf0d1", padding: "2px 8px", borderRadius: 999 }}>Loading…</span> : null}
          </div>

          {error ? (
            <Empty>Couldn’t load data: {error}</Empty>
          ) : !ts?.length ? (
            <Empty>No data in the selected range.</Empty>
          ) : (
            <LineChartSvg data={ts} xKey="year" yKey="median_income_total" />
          )}
        </div>
      </section>

      {/* US choropleth on real map (react-simple-maps) */}
      <section className="panel">
        <div className="chart-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h3>US Choropleth — {barYear}</h3>
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

      {/* Country heatmap (state × year) */}
      <section className="panel">
        <h3>State × Year Heatmap</h3>
        {!heatmapYears.length ? (
          <Empty>Loading state matrix…</Empty>
        ) : (
          <MatrixHeatmap years={heatmapYears} rows={heatmapRows} />
        )}
      </section>

      {/* YoY % bars + Gini gauge */}
      <section className="panel">
        <h3>Year-over-Year % Change & Inequality</h3>
        {!ts?.length ? (
          <Empty>No time series to compute YoY.</Empty>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 16, alignItems: "center" }}>
            <YoYColumnsSvg ts={ts} />
            <div style={{ justifySelf: "center" }}>
              <GiniGauge gini={kpis?.gini} />
            </div>
          </div>
        )}
      </section>

      {/* Mobility breakdown */}
      <section className="panel">
        <h3>Mobility Breakdown — {barYear}</h3>
        {!mobility ? <Empty>Mobility info unavailable.</Empty> : <MobilityBars mobility={mobility} />}
      </section>

      {/* County slopegraph */}
      <section className="panel">
        <h3>County Rank Change — {startYear} → {endYear}</h3>
        {(!byCountyStart.length && !byCountyEnd.length) ? (
          <Empty>Need county snapshots for both years.</Empty>
        ) : (
          <Slopegraph
            startYear={startYear}
            endYear={endYear}
            start={byCountyStart}
            end={byCountyEnd}
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
          .kpi-row { grid-template-columns: 1fr !important; }
          .filters { grid-template-columns: repeat(2, minmax(140px, 1fr)) !important; }
        }
        @media (max-width: 480px) {
          .filters { grid-template-columns: 1fr !important; }
          svg { height: auto; }
        }
      `}</style>
    </>
  );
}
