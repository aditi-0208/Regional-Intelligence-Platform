import React, { useMemo } from "react";

/**
 * Normalize Tableau Public URLs so embeds work reliably and look "website-native".
 * We force:
 *  - :showVizHome=no
 *  - :embed=yes
 *  - :showAppBanner=false
 * Optional:
 *  - :toolbar=no
 *  - :tabs=no
 */
function normalize(url) {
  if (!url) return "";

  const hasQuery = url.includes("?");
  const join = hasQuery ? "&" : "?";

  let out = url;
  if (!out.includes(":showVizHome=no")) out = `${out}${join}:showVizHome=no`;
  if (!out.includes(":embed=yes")) out = `${out}&:embed=yes`;
  if (!out.includes(":showAppBanner=false"))
    out = `${out}&:showAppBanner=false`;

  return out;
}

export default function TableauViz({
  url,
  height = 520,
  toolbar = false,
  tabs = false,
}) {
  const base = useMemo(() => normalize(url), [url]);

  const finalUrl = useMemo(() => {
    if (!base) return "";
    const extra = [];

    if (!toolbar) extra.push(":toolbar=no");
    if (!tabs) extra.push(":tabs=no");

    const existing = base.toLowerCase();
    const filtered = extra.filter((p) => !existing.includes(p.toLowerCase()));

    return filtered.length ? `${base}&${filtered.join("&")}` : base;
  }, [base, toolbar, tabs]);

  if (!finalUrl) {
    return (
      <div style={{ padding: 12, color: "#6b7280", fontSize: 13 }}>
        Tableau URL not set yet.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", borderRadius: 12, overflow: "hidden" }}>
      <iframe
        title="Tableau Visualization"
        src={finalUrl}
        width="100%"
        height={height}
        style={{ display: "block", border: "0" }}
        allow="fullscreen"
      />
    </div>
  );
}
