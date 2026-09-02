import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const YEARS = Array.from({ length: 10 }, (_, i) => 2014 + i);

/**
 * Your palette:
 * US = navy, Florida = green, Tampa Bay = yellow (highlight)
 */
const COLORS = {
  us: "#1f3a5f",
  florida: "#2f6b4f",
  tampa: "#f2c94c",
};

/** Muted color for other MSAs */
const MSA_MUTED = "#9ca3af"; // gray-400

/**
 * All 22 Florida MSAs (OMB-defined list; using the common names)
 * Tampa Bay is included here but also highlighted separately using the "tampa" key.
 */
const FL_MSAS = [
  { key: "miami", label: "Miami–Fort Lauderdale–West Palm Beach" },
  { key: "tampa", label: "Tampa–St. Petersburg–Clearwater" }, // highlight
  { key: "orlando", label: "Orlando–Kissimmee–Sanford" },
  { key: "jacksonville", label: "Jacksonville" },
  { key: "north_port", label: "North Port–Bradenton–Sarasota" },
  { key: "cape_coral", label: "Cape Coral–Fort Myers" },
  { key: "lakeland", label: "Lakeland–Winter Haven" },
  { key: "deltona", label: "Deltona–Daytona Beach–Ormond Beach" },
  { key: "palm_bay", label: "Palm Bay–Melbourne–Titusville" },
  { key: "port_st_lucie", label: "Port St. Lucie" },
  { key: "pensacola", label: "Pensacola–Ferry Pass–Brent" },
  { key: "ocala", label: "Ocala" },
  { key: "naples", label: "Naples–Marco Island" },
  { key: "tallahassee", label: "Tallahassee" },
  { key: "gainesville", label: "Gainesville" },
  { key: "crestview", label: "Crestview–Fort Walton Beach–Destin" },
  { key: "panama_city", label: "Panama City–Panama City Beach" },
  { key: "punta_gorda", label: "Punta Gorda" },
  { key: "sebastian_vero", label: "Sebastian–Vero Beach–West Vero Corridor" },
  { key: "homosassa", label: "Homosassa Springs" },
  { key: "wildwood", label: "Wildwood–The Villages" },
  { key: "sebring", label: "Sebring" },
];

/**
 * Bar charts: choose which indicators should render as BarChart.
 * Everything else becomes a multi-line chart with 22 MSAs.
 */
const BAR_INDICATORS = new Set([
  "job-growth",
  "business-formation",
  "traffic-fatalities",
  "preventable-hosp",
  "transit-ridership",
  "population-growth",
  "grp",
  "violent-crime",
  "property-crime",
]);

function seedFromString(str) {
  let s = 0;
  for (let i = 0; i < str.length; i++) s = (s * 31 + str.charCodeAt(i)) >>> 0;
  return s;
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Small deterministic “shock events” so lines diverge clearly */
function buildShockEvents(rand) {
  // lock to realistic-looking years for demos
  const shock1Year = 2018;
  const shock2Year = 2020;
  const shock3Year = 2022;

  const drop = -(6 + rand() * 10); // -6..-16
  const spike = +(5 + rand() * 12); // +5..+17
  const aftershock = (rand() * 6) - 3; // -3..+3

  return {
    [shock1Year]: spike * 0.6,
    [shock2Year]: drop,
    [shock3Year]: spike * 0.8 + aftershock,
  };
}

function applyEvents(year, value, events) {
  return value + (events?.[year] ?? 0);
}

/**
 * Generates demo time series with:
 * - US baseline
 * - Florida baseline
 * - All 22 MSAs (each with its own slope + shocks)
 */
function makeDemoSeries(topic, indicatorId) {
  const baseRand = mulberry32(seedFromString(`${topic}:${indicatorId}`));

  const base = 35 + baseRand() * 35; // 35–70
  const usSlope = 0.35 + baseRand() * 0.9; // 0.35–1.25
  const flSlope = usSlope * (0.85 + baseRand() * 0.3); // ~0.85–1.15 of US

  const usEvents = buildShockEvents(baseRand);
  const flEvents = buildShockEvents(baseRand);

  const noise = (r) => (r() - 0.5) * 1.2; // -0.6..0.6

  return YEARS.map((year, idx) => {
    // US + Florida
    const usR = mulberry32(seedFromString(`${topic}:${indicatorId}:us:${year}`));
    const flR = mulberry32(seedFromString(`${topic}:${indicatorId}:fl:${year}`));

    let us = base + idx * usSlope + noise(usR);
    let florida = base + 2 + idx * flSlope + noise(flR);

    us = applyEvents(year, us, usEvents);
    florida = applyEvents(year, florida, flEvents);

    // Build all MSAs
    const row = {
      year,
      us: +us.toFixed(1),
      florida: +florida.toFixed(1),
    };

    for (const msa of FL_MSAS) {
      const r = mulberry32(seedFromString(`${topic}:${indicatorId}:${msa.key}:${year}`));

      // Each MSA has its own slope + offset so they spread out visually
      const msaOffset = (r() * 10) - 5; // -5..+5
      const msaSlope = flSlope * (0.55 + r() * 1.15); // 0.55–1.70 * FL slope

      // Each MSA has different shock intensity so lines are distinct
      const msaEventsRand = mulberry32(seedFromString(`${topic}:${indicatorId}:${msa.key}:events`));
      const msaEvents = buildShockEvents(msaEventsRand);

      // Tampa Bay gets slightly stronger swings (more “interesting”)
      const tampaBoost = msa.key === "tampa" ? 1.25 : 0.85 + msaEventsRand() * 0.5; // 0.85–1.35

      let msaValue =
        florida +
        msaOffset +
        idx * (msaSlope - flSlope) + // divergence over time
        noise(r);

      // Apply shocks (scaled per MSA)
      const scaledEvents = Object.fromEntries(
        Object.entries(msaEvents).map(([y, v]) => [Number(y), v * tampaBoost])
      );
      msaValue = applyEvents(year, msaValue, scaledEvents);

      row[msa.key] = +msaValue.toFixed(1);
    }

    return row;
  });
}

export default function DemoIndicatorChart({ topic, indicatorId }) {
  const data = useMemo(() => makeDemoSeries(topic, indicatorId), [topic, indicatorId]);
  const isBar = BAR_INDICATORS.has(indicatorId);

  // ===== BAR CHARTS (keep simple for readability: US / FL / Tampa) =====
  if (isBar) {
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />

          <Bar dataKey="us" name="United States" fill={COLORS.us} radius={[4, 4, 0, 0]} />
          <Bar dataKey="florida" name="Florida" fill={COLORS.florida} radius={[4, 4, 0, 0]} />
          <Bar dataKey="tampa" name="Tampa Bay MSA" fill={COLORS.tampa} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // ===== LINE CHARTS: All 22 FL MSAs + Tampa highlighted =====
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />

        {/* 21 muted MSAs (excluding Tampa line drawn separately as highlight) */}
        {FL_MSAS.filter((m) => m.key !== "tampa").map((m) => (
          <Line
            key={m.key}
            type="monotone"
            dataKey={m.key}
            name={m.label}
            stroke={MSA_MUTED}
            strokeWidth={1.2}
            dot={false}
            opacity={0.35}
          />
        ))}

        {/* Reference lines (your standard comparison) */}
        <Line
          type="monotone"
          dataKey="us"
          name="Jacksonville"
          stroke={COLORS.us}
          strokeWidth={2}
          dot={false}
          opacity={0.9}
        />
        <Line
          type="monotone"
          dataKey="florida"
          name="Orlando"
          stroke={COLORS.florida}
          strokeWidth={2}
          dot={false}
          opacity={0.9}
        />

        {/* Tampa Bay highlighted */}
        <Line
          type="monotone"
          dataKey="tampa"
          name="Tampa–St. Petersburg–Clearwater (highlight)"
          stroke={COLORS.tampa}
          strokeWidth={3.6}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
