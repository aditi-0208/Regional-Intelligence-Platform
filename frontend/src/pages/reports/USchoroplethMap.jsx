// src/pages/reports/USchoroplethMap.jsx
import React, { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const CANDIDATE_URLS = [
  (process.env.PUBLIC_URL || "") + "/assets/states-10m.json",
  (process.env.PUBLIC_URL || "") + "/states-10m.json",
];

/**
 * Props:
 *  - data: { [fips:number]: number }  // e.g. { 12: 72000, 6: 84000, ... }
 *  - statesMeta?: { state_code:number, state_name:string }[]
 *  - valueFormatter?: (n:number)=>string
 *  - domain?: [min,max]
 *  - palette?: (t:0..1)=>string
 *  - onStateClick?: (fips:number, name:string, value:number)=>void
 */
export default function USchoroplethMap({
  data = {},
  statesMeta = [],
  valueFormatter = fmtUSD,
  domain,
  palette,
  onStateClick,
}) {
  const [topology, setTopology] = useState(null);
  const [loadError, setLoadError] = useState("");

  // Load the TopoJSON manually (try both /assets/... and /... just in case)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const url of CANDIDATE_URLS) {
        try {
          const res = await fetch(url, { cache: "force-cache" });
          if (!res.ok) continue;
          const json = await res.json();
          if (!cancelled) {
            setTopology(json);
            setLoadError("");
          }
          return;
        } catch {
          /* try next path */
        }
      }
      if (!cancelled) setLoadError("Could not load states TopoJSON from /assets/states-10m.json or /states-10m.json");
    })();
    return () => { cancelled = true; };
  }, []);

  // name lookup for tooltips
  const fipsToName = useMemo(() => {
    const m = new Map();
    statesMeta.forEach((s) => m.set(Number(s.state_code), s.state_name));
    return m;
  }, [statesMeta]);

  const values = useMemo(
    () => Object.values(data).map(Number).filter(Number.isFinite),
    [data]
  );

  const [min, max] = useMemo(() => {
    if (domain && Number.isFinite(domain[0]) && Number.isFinite(domain[1])) return domain;
    if (!values.length) return [0, 1];
    return [Math.min(...values), Math.max(...values)];
  }, [values, domain]);

  const scale = palette || ((t) => `hsl(150 55% ${90 - t * 50}%)`);
  const color = (v) => (Number.isFinite(v) ? scale((v - min) / (max - min || 1)) : "#eee");

  if (loadError) return <div className="empty">{loadError}</div>;
  if (!topology) return <div className="empty">Loading US map…</div>;

  return (
    <>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <ComposableMap projection="geoAlbersUsa" style={{ width: "100%", height: "auto" }}>
          <Geographies geography={topology}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const props = geo.properties || {};
                const fips = Number(
                  geo.id ??
                    props.STATE ??
                    props.STATEFP ??
                    props.fips ??
                    props.GEOID
                );
                const val = data[fips];
                const name = fipsToName.get(fips) || props.name || String(fips);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={color(val)}
                    stroke="#fff"
                    strokeWidth={0.6}
                    style={{ default: { outline: "none" }, hover: { fill: "#cfeede", outline: "none" } }}
                    onClick={() => onStateClick?.(fips, name, val)}
                  >
                    <title>{`${name}: ${valueFormatter(val)}`}</title>
                  </Geography>
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {/* Legend */}
      {Number.isFinite(min) && Number.isFinite(max) && (
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              height: 8,
              borderRadius: 4,
              background:
                "linear-gradient(to right, hsl(150 55% 90%), hsl(150 55% 40%))",
              maxWidth: 240,
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 240 }}>
            <span style={{ fontSize: 12 }}>{valueFormatter(min)}</span>
            <span style={{ fontSize: 12 }}>{valueFormatter(max)}</span>
          </div>
        </div>
      )}
    </>
  );
}

function fmtUSD(n) {
  return Number.isFinite(n)
    ? n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })
    : "—";
}
