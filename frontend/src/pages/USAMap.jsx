import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const CENSUS_URL =
  "https://api.census.gov/data/2023/acs/acs1/profile?get=NAME,DP05_0001E,DP03_0062E&for=state:*";

const TAMPA_BAY_COORDS = [-82.4572, 27.9506];
const DOT_FILL = "#006747";
const DOT_STROKE = "#ffffff";

const STATE_VITALITY_SCORES = {
  Alabama: 14, Alaska: 52, Arizona: 68, Arkansas: 20, California: 78,
  Colorado: 81, Connecticut: 70, Delaware: 65, Florida: 72, Georgia: 74,
  Hawaii: 61, Idaho: 58, Illinois: 71, Indiana: 55, Iowa: 60,
  Kansas: 57, Kentucky: 35, Louisiana: 28, Maine: 62, Maryland: 73,
  Massachusetts: 82, Michigan: 60, Minnesota: 76, Mississippi: 12,
  Missouri: 58, Montana: 50, Nebraska: 63, Nevada: 64, "New Hampshire": 71,
  "New Jersey": 74, "New Mexico": 34, "New York": 75, "North Carolina": 69,
  "North Dakota": 55, Ohio: 62, Oklahoma: 44, Oregon: 70, Pennsylvania: 67,
  "Rhode Island": 66, "South Carolina": 52, "South Dakota": 56, Tennessee: 66,
  Texas: 77, Utah: 80, Vermont: 68, Virginia: 76, Washington: 80,
  "West Virginia": 18, Wisconsin: 65, Wyoming: 48, "District of Columbia": 85,
};

function vitalityColor(score) {
  if (!score) return "rgba(255,255,255,.1)";
  const t = (score - 10) / 75;
  if (t > 0.65) {
    return `rgba(15,${110 + Math.round(t * 60)},${56 + Math.round(t * 30)},.7)`;
  }
  if (t > 0.4) {
    return `rgba(${200 - Math.round(t * 120)},${160 + Math.round(t * 60)},${80 - Math.round(t * 40)},.55)`;
  }
  return `rgba(${180 - Math.round(t * 80)},${100 + Math.round(t * 60)},50,.45)`;
}

function formatNumber(n) {
  if (n === null || n === undefined || n === "" || n === "null") return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString("en-US");
}

function formatCurrency(n) {
  if (n === null || n === undefined || n === "" || n === "null") return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function USAMap({ variant = "default", onStateClick }) {
  const isHero = variant === "hero";
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);

  const [stateStatsByFips, setStateStatsByFips] = useState({});
  const [loading, setLoading] = useState(!isHero);
  const [fetchErr, setFetchErr] = useState("");

  const [tip, setTip] = useState({
    visible: false,
    name: "",
    fips: "",
    x: 0,
    y: 0,
  });

  const [heroTip, setHeroTip] = useState({ visible: false, name: "", x: 0, y: 0 });
  const [tipPos, setTipPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (isHero) return undefined;

    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setFetchErr("");

        const res = await fetch(CENSUS_URL);
        if (!res.ok) throw new Error(`Census fetch failed (${res.status})`);

        const rows = await res.json();
        const header = rows[0];
        const idxName = header.indexOf("NAME");
        const idxPop = header.indexOf("DP05_0001E");
        const idxIncome = header.indexOf("DP03_0062E");
        const idxState = header.indexOf("state");

        const map = {};
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i];
          const fips = String(r[idxState] ?? "").padStart(2, "0");
          map[fips] = {
            name: r[idxName],
            population: r[idxPop],
            medianIncome: r[idxIncome],
          };
        }

        if (mounted) setStateStatsByFips(map);
      } catch (e) {
        if (mounted) setFetchErr(e?.message || "Failed to load Census data");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [isHero]);

  const setTipPosition = (evt) => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  };

  const computeClampedTooltipPos = (x, y) => {
    const OFFSET = 14;
    const PAD = 10;

    let left = x + OFFSET;
    let top = y + OFFSET;

    const el = containerRef.current;
    const tt = tooltipRef.current;
    if (!el || !tt) return { left, top };

    const rect = el.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const tw = tt.offsetWidth || 0;
    const th = tt.offsetHeight || 0;

    if (left + tw + PAD > w) left = x - tw - OFFSET;
    if (top + th + PAD > h) top = y - th - OFFSET;

    left = Math.max(PAD, Math.min(left, Math.max(PAD, w - tw - PAD)));
    top = Math.max(PAD, Math.min(top, Math.max(PAD, h - th - PAD)));

    return { left, top };
  };

  const mapNote = useMemo(() => {
    if (isHero) return "";
    if (fetchErr) return "Data unavailable right now.";
    if (loading) return "Loading state stats…";
    return "Hover over a state to see summary statistics";
  }, [isHero, loading, fetchErr]);

  const current = stateStatsByFips?.[tip.fips] || {};

  useEffect(() => {
    if (!tip.visible || isHero) return;

    const id = requestAnimationFrame(() => {
      const p = computeClampedTooltipPos(tip.x, tip.y);
      setTipPos(p);
    });

    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tip.visible, tip.x, tip.y, tip.name, tip.fips, isHero]);

  const getStateName = (geo) => {
    const fips = String(geo.id).padStart(2, "0");
    return stateStatsByFips?.[fips]?.name || geo.properties?.name || "—";
  };

  const heroScore = heroTip.name ? STATE_VITALITY_SCORES[heroTip.name] : null;

  return (
    <div
      className={`map-wrap${isHero ? " map-wrap--hero" : ""}`}
      ref={containerRef}
    >
      {!isHero && mapNote && <div className="map-note">{mapNote}</div>}

      {isHero && heroTip.visible && (
        <div
          className="map-tooltip-hero"
          style={{ left: heroTip.x + 12, top: heroTip.y - 28 }}
        >
          {heroScore
            ? `${heroTip.name} — Vitality score: ${heroScore}`
            : heroTip.name}
        </div>
      )}

      {!isHero && tip.visible && (
        <div
          ref={tooltipRef}
          className="map-tooltip map-tooltip--pretty"
          style={{ left: tipPos.left, top: tipPos.top }}
          role="tooltip"
        >
          <div className="map-tooltip-head">
            <div className="map-tooltip-dot" />
            <div className="map-tooltip-title">{tip.name}</div>
            <div className="map-tooltip-chip">ACS 2023</div>
          </div>

          <div className="map-tooltip-body">
            <div className="map-tooltip-row">
              <div className="map-tooltip-label">Population</div>
              <div className="map-tooltip-value">
                {formatNumber(current.population)}
              </div>
            </div>

            <div className="map-tooltip-row">
              <div className="map-tooltip-label">Median income</div>
              <div className="map-tooltip-value">
                {formatCurrency(current.medianIncome)}
              </div>
            </div>
          </div>

          <div className="map-tooltip-foot">
            U.S. Census Bureau — ACS 1-year profile estimates
          </div>
        </div>
      )}

      <ComposableMap projection="geoAlbersUsa" className="usa-map">
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const fips = String(geo.id).padStart(2, "0");
              const name = getStateName(geo);
              const score = STATE_VITALITY_SCORES[name];

              if (isHero) {
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(evt) => {
                      setHeroTip({
                        visible: true,
                        name,
                        x: evt.clientX,
                        y: evt.clientY,
                      });
                    }}
                    onMouseMove={(evt) => {
                      setHeroTip((prev) =>
                        prev.visible
                          ? { ...prev, x: evt.clientX, y: evt.clientY }
                          : prev
                      );
                    }}
                    onMouseLeave={() => {
                      setHeroTip((prev) => ({ ...prev, visible: false }));
                    }}
                    onClick={() => onStateClick?.()}
                    style={{
                      default: {
                        fill: vitalityColor(score),
                        stroke: "rgba(255,255,255,.2)",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: "pointer",
                      },
                      hover: {
                        fill: "rgba(100,200,150,.45)",
                        stroke: "rgba(255,255,255,.2)",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "rgba(100,200,150,.45)",
                        stroke: "rgba(255,255,255,.2)",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                    }}
                  />
                );
              }

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={(evt) => {
                    const pos = setTipPosition(evt);
                    setTip({ visible: true, name, fips, x: pos.x, y: pos.y });
                  }}
                  onMouseMove={(evt) => {
                    if (!tip.visible) return;
                    const pos = setTipPosition(evt);
                    setTip((prev) => ({ ...prev, x: pos.x, y: pos.y }));
                  }}
                  onMouseLeave={() => {
                    setTip((prev) => ({ ...prev, visible: false }));
                  }}
                  style={{
                    default: {
                      fill: "#f1f0d6",
                      stroke: "#d6d0a8",
                      strokeWidth: 0.7,
                      outline: "none",
                      cursor: "pointer",
                    },
                    hover: {
                      fill: "#cfc493",
                      stroke: "#006747",
                      strokeWidth: 1.2,
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: {
                      fill: "#cfc493",
                      stroke: "#006747",
                      strokeWidth: 1.2,
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>

        {!isHero && (
          <Marker coordinates={TAMPA_BAY_COORDS}>
            <circle
              r={5.5}
              fill={DOT_FILL}
              stroke={DOT_STROKE}
              strokeWidth={2}
            />
          </Marker>
        )}
      </ComposableMap>
    </div>
  );
}
