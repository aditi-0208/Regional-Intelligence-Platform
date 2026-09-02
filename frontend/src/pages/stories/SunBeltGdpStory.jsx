import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";

const GDP_TREND = [
  { year: "2019", tampa: 4.8, nashville: 4.5, phoenix: 4.6, national: 2.8 },
  { year: "2020", tampa: 3.2, nashville: 3.0, phoenix: 3.4, national: 1.8 },
  { year: "2021", tampa: 5.2, nashville: 5.0, phoenix: 5.1, national: 3.1 },
  { year: "2022", tampa: 5.6, nashville: 5.3, phoenix: 5.5, national: 3.3 },
  { year: "2023", tampa: 5.4, nashville: 5.1, phoenix: 5.3, national: 3.0 },
  { year: "2024", tampa: 5.4, nashville: 5.2, phoenix: 5.0, national: 2.4 },
];

const GDP_2024 = [
  { metro: "Tampa Bay", growth: 5.4 },
  { metro: "Nashville", growth: 5.2 },
  { metro: "Phoenix", growth: 5.0 },
  { metro: "Atlanta", growth: 4.8 },
  { metro: "National avg", growth: 2.4 },
];

const SECTOR_SHARE = [
  { sector: "Professional services", share: 28 },
  { sector: "Healthcare", share: 18 },
  { sector: "Construction", share: 14 },
  { sector: "Leisure & hospitality", share: 12 },
  { sector: "Other", share: 28 },
];

const chartTooltipStyle = {
  fontSize: 12,
  borderRadius: 6,
  border: "1px solid #E4E4E0",
};

export default function SunBeltGdpStory() {
  return (
    <>
      <section className="story-stat-bar">
        <div className="container story-stat-inner">
          <div className="story-stat">
            <div className="story-stat-num">2.3×</div>
            <div className="story-stat-label">
              Average Sun Belt GDP growth vs. national in 2024
            </div>
          </div>
          <div className="story-stat">
            <div className="story-stat-num">3 yrs</div>
            <div className="story-stat-label">
              Consecutive years beating the national benchmark
            </div>
          </div>
          <div className="story-stat">
            <div className="story-stat-num">+1.2M</div>
            <div className="story-stat-label">
              Net population inflow across top Sun Belt metros since 2021
            </div>
          </div>
        </div>
      </section>

      <article className="story-body">
        <div className="container story-narrow">
          <p className="story-lead">
            Something shifted after 2021. While the national economy settled into
            slower growth, a cluster of Sun Belt metros kept accelerating — not
            through a single industry boom, but through a steady stack of
            population gains, business formation, and expanding professional
            services.
          </p>
          <p>
            This data story walks through what happened in Tampa Bay, Nashville,
            and Phoenix — three metros that have outpaced the U.S. average for
            three straight years — and what that means for how we read regional
            vitality going forward.
          </p>
        </div>

        <section className="story-chart-block">
          <div className="container">
            <h2 className="story-section-title">
              Growth didn&apos;t pause — it diverged
            </h2>
            <p className="story-section-desc">
              Real GDP growth rate (%) · Tampa Bay, Nashville, Phoenix vs.
              national average · 2019–2024
            </p>
            <div className="story-chart-card">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={GDP_TREND}>
                  <CartesianGrid stroke="rgba(0,0,0,.06)" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 11, fill: "#888" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#888" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 6.5]}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(v) => [`${v}%`, ""]}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tampa"
                    name="Tampa Bay"
                    stroke="#1A5FA5"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="nashville"
                    name="Nashville"
                    stroke="#0F6E56"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="phoenix"
                    name="Phoenix"
                    stroke="#854F0B"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="national"
                    name="National avg"
                    stroke="#B0B0AA"
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="story-chart-caption">
              Source: Bureau of Economic Analysis · Real GDP by metro · Illustrative
              estimates for demonstration
            </p>
          </div>
        </section>

        <div className="container story-narrow">
          <h2 className="story-section-title">The 2020 dip, then a sharper rebound</h2>
          <p>
            All four lines fell in 2020 — but the recovery was asymmetric. Sun Belt
            metros regained pre-pandemic growth levels within two years, while the
            national average lingered closer to 3%. By 2022, Tampa Bay posted GDP
            growth above 5.5% — nearly double the national rate.
          </p>
          <p>
            Population inflows played a role, but they weren&apos;t the whole story.
            Business establishment growth and professional-services expansion
            contributed roughly half of the GDP gains in these metros between 2021
            and 2024, according to our composite economic indicators.
          </p>

          <div className="story-callout">
            <div className="story-callout-label">Key finding</div>
            <p>
              Tampa Bay&apos;s 2024 GDP growth of <strong>5.4%</strong> ranked it
              in the top quartile nationally — despite housing cost pressures that
              have slowed migration in some peer metros.
            </p>
          </div>
        </div>

        <section className="story-chart-block story-chart-block--split">
          <div className="container split-grid">
            <div>
              <h2 className="story-section-title">Who led in 2024?</h2>
              <p className="story-section-desc">
                Real GDP growth rate (%) · selected metros
              </p>
              <div className="story-chart-card">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={GDP_2024} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid stroke="rgba(0,0,0,.06)" horizontal={false} />
                    <XAxis
                      type="number"
                      domain={[0, 6]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 11, fill: "#888" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="metro"
                      width={90}
                      tick={{ fontSize: 11, fill: "#555" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(v) => [`${v}%`, "GDP growth"]}
                    />
                    <Bar dataKey="growth" radius={[0, 4, 4, 0]} barSize={22}>
                      {GDP_2024.map((entry) => (
                        <Cell
                          key={entry.metro}
                          fill={
                            entry.metro === "National avg"
                              ? "#B0B0AA"
                              : entry.metro === "Tampa Bay"
                                ? "#1A5FA5"
                                : "#85B7EB"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h2 className="story-section-title">What&apos;s driving Tampa Bay?</h2>
              <p className="story-section-desc">
                Share of metro GDP growth attributable by sector · 2021–2024
              </p>
              <div className="story-chart-card">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={SECTOR_SHARE}>
                    <CartesianGrid stroke="rgba(0,0,0,.06)" vertical={false} />
                    <XAxis
                      dataKey="sector"
                      tick={{ fontSize: 10, fill: "#888" }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 11, fill: "#888" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(v) => [`${v}%`, "Share"]}
                    />
                    <Bar
                      dataKey="share"
                      fill="#1A5FA5"
                      radius={[4, 4, 0, 0]}
                      barSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        <div className="container story-narrow">
          <h2 className="story-section-title">Three things to watch</h2>
          <ul className="story-takeaways">
            <li>
              <strong>Sustainability:</strong> Growth fueled by population alone
              is harder to maintain as housing affordability tightens in fast-growth
              metros.
            </li>
            <li>
              <strong>Diversification:</strong> Metros with broad professional-services
              bases (like Tampa Bay) showed more resilience than those reliant on a
              single sector.
            </li>
            <li>
              <strong>Comparison context:</strong> A 5% GDP growth rate means something
              different in a metro of 3 million vs. 300,000 — always check per-capita
              measures alongside totals.
            </li>
          </ul>

          <div className="story-method-note">
            <strong>Methodology note:</strong> GDP figures are drawn from BEA regional
            accounts, normalized to a common base year. See our{" "}
            <Link to="/methodology">methodology page</Link> for full indicator definitions.
          </div>
        </div>
      </article>
    </>
  );
}
