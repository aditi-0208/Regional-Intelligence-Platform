import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./Methodology.css";

const PILLARS = [
  { name: "Economy", weight: "25% weight", rowClass: "pillar-row-blue" },
  { name: "Workforce", weight: "25% weight", rowClass: "pillar-row-green" },
  { name: "Housing", weight: "25% weight", rowClass: "pillar-row-amber" },
  { name: "Innovation", weight: "25% weight", rowClass: "pillar-row-purple" },
];

const FRAMEWORK_CHART = [
  { pillar: "Economy", tampa: 70, atlanta: 77 },
  { pillar: "Workforce", tampa: 73, atlanta: 82 },
  { pillar: "Housing", tampa: 68, atlanta: 74 },
  { pillar: "Innovation", tampa: 65, atlanta: 72 },
];

const DATA_SOURCES = [
  {
    abbr: "BEA",
    name: "Bureau of Economic Analysis",
    indicators: "GDP, personal income, productivity",
    frequency: "Annual",
    pillar: "Economy",
  },
  {
    abbr: "BLS",
    name: "Bureau of Labor Statistics",
    indicators: "Employment, wages, job growth",
    frequency: "Monthly / Annual",
    pillar: "Economy, Workforce",
  },
  {
    abbr: "ACS",
    name: "American Community Survey",
    indicators: "Education, income, demographics",
    frequency: "Annual",
    pillar: "Workforce, Housing",
  },
  {
    abbr: "Census Bureau / HUD",
    name: "",
    indicators: "Housing costs, supply, affordability",
    frequency: "Annual",
    pillar: "Housing",
  },
  {
    abbr: "USPTO",
    name: "",
    indicators: "Patent filings by metro",
    frequency: "Annual",
    pillar: "Innovation",
  },
  {
    abbr: "NVCA / Pitchbook",
    name: "",
    indicators: "VC investment, startup density",
    frequency: "Annual",
    pillar: "Innovation",
  },
];

const LIMITATIONS = [
  {
    title: "Data lags:",
    text: "Most indicators use data from 12–18 months prior to publication. The 2025 report reflects conditions through late 2023 or early 2024.",
  },
  {
    title: "Metro boundaries:",
    text: "We use OMB-defined Metropolitan Statistical Areas, which may differ from how residents define their region.",
  },
  {
    title: "Equal weighting:",
    text: "Equal pillar weighting (25% each) is a deliberate methodological choice. Different weights would produce different rankings.",
  },
  {
    title: "Coverage:",
    text: "We track 150+ metros with populations over 250,000. Smaller regions are not included due to data reliability concerns.",
  },
];

const Methodology = () => {
  return (
    <div className="methodology-page">
      <div className="methodology-header">
        <div className="container">
          <h1 className="page-hero-title">Methodology</h1>
          <p className="lead header-lead">
            How we measure regional vitality — data sources, indicator selection,
            and scoring framework.
          </p>
          <button type="button" className="btn btn-outline btn-sm">
            ↓ Download technical documentation (PDF)
          </button>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <h2 className="section-title framework-title">Our framework</h2>
          <div className="framework-grid">
            <div>
              <p className="framework-intro">
                We measure regional vitality across four equally-weighted pillars,
                each comprising 8–12 indicators drawn from publicly available
                federal datasets. Each pillar contributes 25% to the overall
                vitality score.
              </p>
              {PILLARS.map((pillar) => (
                <div
                  key={pillar.name}
                  className={`pillar-row ${pillar.rowClass}`}
                >
                  <div className="pillar-row-name">{pillar.name}</div>
                  <div className="pillar-weight">{pillar.weight}</div>
                </div>
              ))}
            </div>

            <div className="card framework-chart-card">
              <div className="framework-chart-label">
                Framework: Pillars → Composite Score
              </div>
              <div className="framework-chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={FRAMEWORK_CHART} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(0,0,0,.04)" vertical={false} />
                    <XAxis
                      dataKey="pillar"
                      tick={{ fontSize: 11, fill: "#666" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[50, 100]}
                      tick={{ fontSize: 11, fill: "#666" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                    />
                    <Bar
                      dataKey="tampa"
                      name="Tampa Bay"
                      fill="rgba(26,95,165,.75)"
                      stroke="#1A5FA5"
                      strokeWidth={1}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="atlanta"
                      name="Atlanta"
                      fill="rgba(15,110,86,.75)"
                      stroke="#0F6E56"
                      strokeWidth={1}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title sources-title">Data sources</h2>
          <p className="sources-intro">
            All indicators use publicly available federal datasets updated on a
            regular schedule. All data is fully reproducible from original
            sources.
          </p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Indicators covered</th>
                <th>Update frequency</th>
                <th>Pillar</th>
              </tr>
            </thead>
            <tbody>
              {DATA_SOURCES.map((row) => (
                <tr key={row.abbr}>
                  <td>
                    <strong>{row.abbr}</strong>
                    {row.name ? ` — ${row.name}` : ""}
                  </td>
                  <td>{row.indicators}</td>
                  <td>{row.frequency}</td>
                  <td className="pillar-cell">{row.pillar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title score-title">How scores are calculated</h2>
          <div className="score-explainer">
            <div>
              <p className="score-text">
                Each indicator is normalized to a 0–100 scale relative to national
                performance. A score of 50 means exactly median national
                performance; above 50 means above average.
              </p>
              <p className="score-text">
                Pillar scores are the average of their constituent indicators. The
                overall vitality score is the equally weighted average of all four
                pillar scores.
              </p>
            </div>
            <div className="example-box">
              <div className="example-box-label">Worked example</div>
              <div className="example-box-text">
                Tampa Bay scores <strong>72</strong> on Economy. This means it
                outperforms <strong>72% of tracked metros</strong> on economic
                indicators — not that it achieved 72% of some absolute target.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title limits-title">Limitations &amp; caveats</h2>
          <div className="limits-box">
            {LIMITATIONS.map((item) => (
              <div key={item.title} className="limit-item">
                <span className="limit-bullet">!</span>
                <span>
                  <strong>{item.title}</strong> {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <div className="footer-brand">Regional Macro-Economic Insights</div>
            <div className="footer-sub">
              University of South Florida · © 2025
            </div>
          </div>
          <div className="footer-links">
            <Link to="/about">About</Link>
            <Link to="/about">Cite this work</Link>
            <Link to="/about">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Methodology;
