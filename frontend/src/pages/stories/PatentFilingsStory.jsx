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
import {
  StoryCallout,
  StoryMethodNote,
  StoryStatBar,
  StoryTakeaways,
  chartTooltipStyle,
} from "./storyShared";

const PATENT_TREND = [
  { year: "2019", tampa: 18, raleigh: 22, saltLake: 16, sanJose: 85 },
  { year: "2020", tampa: 17, raleigh: 21, saltLake: 17, sanJose: 82 },
  { year: "2021", tampa: 19, raleigh: 24, saltLake: 19, sanJose: 84 },
  { year: "2022", tampa: 21, raleigh: 27, saltLake: 22, sanJose: 83 },
  { year: "2023", tampa: 23, raleigh: 29, saltLake: 24, sanJose: 82 },
  { year: "2024", tampa: 25, raleigh: 32, saltLake: 27, sanJose: 81 },
];

const GROWTH_2019_2024 = [
  { metro: "Raleigh", growth: 45 },
  { metro: "Salt Lake City", growth: 69 },
  { metro: "Tampa Bay", growth: 39 },
  { metro: "Austin", growth: 52 },
  { metro: "San Jose", growth: -5 },
];

const SECTOR_PATENTS = [
  { sector: "Software & IT", share: 34 },
  { sector: "Biotech & health", share: 22 },
  { sector: "Advanced mfg", share: 18 },
  { sector: "Clean energy", share: 14 },
  { sector: "Other", share: 12 },
];

export default function PatentFilingsStory() {
  return (
    <>
      <StoryStatBar
        stats={[
          { value: "+85%", label: "Median growth in per-capita patent filings across mid-tier Sun Belt & Mountain West metros (2019–2024)" },
          { value: "32", label: "Patents per 100,000 residents in Raleigh — up from 22 in 2019" },
          { value: "Closing", label: "The gap with coastal innovation hubs is narrowing, though absolute levels remain lower" },
        ]}
      />

      <article className="story-body">
        <div className="container story-narrow">
          <p className="story-lead">
            Innovation has long been concentrated on the coasts — San Jose, Boston,
            Seattle. But mid-size metros in the South and Mountain West are posting
            the fastest gains in per-capita patent filings, suggesting a geographic
            shift in where new ideas are being generated.
          </p>
          <p>
            This brief examines Tampa Bay, Raleigh, and Salt Lake City — three metros
            with different industry bases but similar trajectories of accelerating
            innovation output since 2019.
          </p>
        </div>

        <section className="story-chart-block">
          <div className="container">
            <h2 className="story-section-title">Mid-tier metros are climbing</h2>
            <p className="story-section-desc">
              Patents per 100,000 residents · selected metros · 2019–2024
            </p>
            <div className="story-chart-card">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={PATENT_TREND}>
                  <CartesianGrid stroke="rgba(0,0,0,.06)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} domain={[10, 90]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                  <Line type="monotone" dataKey="tampa" name="Tampa Bay" stroke="#533AB7" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="raleigh" name="Raleigh" stroke="#1A5FA5" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="saltLake" name="Salt Lake City" stroke="#0F6E56" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="sanJose" name="San Jose" stroke="#B0B0AA" strokeWidth={1.5} strokeDasharray="5 4" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="story-chart-caption">
              Source: USPTO patent data by metro · Per-capita normalization · Illustrative estimates
            </p>
          </div>
        </section>

        <div className="container story-narrow">
          <h2 className="story-section-title">Not catching up everywhere — but growing where it counts</h2>
          <p>
            San Jose still leads by a wide margin in absolute patent volume. But its
            per-capita filings have plateaued since 2019, while Raleigh, Salt Lake City,
            and Tampa Bay posted steady annual gains — driven by university spinoffs,
            defense-adjacent R&amp;D, and expanding tech employment.
          </p>
          <p>
            Lower cost of living and state incentive programs have helped mid-tier metros
            attract R&amp;D facilities and startup activity that might previously have
            landed in coastal hubs.
          </p>

          <StoryCallout>
            Tampa Bay&apos;s patent filings per capita grew <strong>39%</strong> from
            2019 to 2024 — the fastest pace among Florida metros and above the national
            median for mid-size regions.
          </StoryCallout>
        </div>

        <section className="story-chart-block story-chart-block--split">
          <div className="container split-grid">
            <div>
              <h2 className="story-section-title">Fastest growth, 2019–2024</h2>
              <p className="story-section-desc">Change in patents per 100,000 residents (%)</p>
              <div className="story-chart-card">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={GROWTH_2019_2024} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid stroke="rgba(0,0,0,.06)" horizontal={false} />
                    <XAxis type="number" domain={[-10, 75]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="metro" width={100} tick={{ fontSize: 10, fill: "#555" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`${v}%`, "Growth"]} />
                    <Bar dataKey="growth" radius={[0, 4, 4, 0]} barSize={22}>
                      {GROWTH_2019_2024.map((entry) => (
                        <Cell
                          key={entry.metro}
                          fill={
                            entry.growth < 0
                              ? "#B0B0AA"
                              : entry.metro === "Tampa Bay"
                                ? "#533AB7"
                                : "#9B7EDE"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h2 className="story-section-title">What&apos;s being patented?</h2>
              <p className="story-section-desc">Share of Tampa Bay patent filings by sector · 2024</p>
              <div className="story-chart-card">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={SECTOR_PATENTS}>
                    <CartesianGrid stroke="rgba(0,0,0,.06)" vertical={false} />
                    <XAxis dataKey="sector" tick={{ fontSize: 9, fill: "#888" }} axisLine={false} tickLine={false} interval={0} angle={-18} textAnchor="end" height={58} />
                    <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`${v}%`, "Share"]} />
                    <Bar dataKey="share" fill="#533AB7" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        <div className="container story-narrow">
          <StoryTakeaways
            items={[
              { title: "Quality vs. quantity", text: "Patent counts measure activity, not impact — citation rates and commercialization outcomes matter for true innovation assessment." },
              { title: "University anchors", text: "Metros with strong research universities (Raleigh, Salt Lake City) show faster filing growth than those without R&D anchors." },
              { title: "Policy opportunity", text: "Mid-tier metros gaining ground may benefit from targeted IP support, tech transfer programs, and venture capital access." },
            ]}
          />
          <StoryMethodNote source="Patent data from USPTO, assigned to metros via inventor location; per-capita rates use Census population estimates." />
        </div>
      </article>
    </>
  );
}
