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

const PARTICIPATION_TREND = [
  { year: "2019", knowledge: 67, service: 61, national: 63 },
  { year: "2020", knowledge: 58, service: 52, national: 56 },
  { year: "2021", knowledge: 62, service: 54, national: 58 },
  { year: "2022", knowledge: 65, service: 56, national: 60 },
  { year: "2023", knowledge: 66, service: 57, national: 61 },
  { year: "2024", knowledge: 67, service: 58, national: 62 },
];

const RECOVERY_BARS = [
  { metro: "San Francisco", recovery: 98 },
  { metro: "Denver", recovery: 96 },
  { metro: "Tampa Bay", recovery: 94 },
  { metro: "Las Vegas", recovery: 78 },
  { metro: "Orlando", recovery: 74 },
];

const REMOTE_SHARE = [
  { sector: "Tech & professional", share: 42 },
  { sector: "Finance", share: 38 },
  { sector: "Healthcare", share: 18 },
  { sector: "Retail & hospitality", share: 8 },
  { sector: "Manufacturing", share: 12 },
];

export default function RemoteWorkStory() {
  return (
    <>
      <StoryStatBar
        stats={[
          { value: "3×", label: "Faster participation recovery in knowledge-economy metros vs. service-dominated peers" },
          { value: "67%", label: "Workforce participation in top knowledge metros (2024), back to pre-pandemic levels" },
          { value: "12pp", label: "Participation gap between knowledge and service metros — widest since 2010" },
        ]}
      />

      <article className="story-body">
        <div className="container story-narrow">
          <p className="story-lead">
            The pandemic didn&apos;t just send workers home — it reshaped who returned
            to the labor force and how quickly. Metros built around knowledge work
            recovered participation rates within three years. Metros dependent on
            in-person service industries are still catching up.
          </p>
          <p>
            Remote and hybrid work acted as a shock absorber in some regions and an
            anchor in others. This story compares how Tampa Bay, Denver, and Las Vegas
            — three metros with very different job mixes — navigated the same national
            disruption.
          </p>
        </div>

        <section className="story-chart-block">
          <div className="container">
            <h2 className="story-section-title">Two recoveries, one national trend</h2>
            <p className="story-section-desc">
              Labor force participation rate (%) · knowledge vs. service metros vs.
              national · 2019–2024
            </p>
            <div className="story-chart-card">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={PARTICIPATION_TREND}>
                  <CartesianGrid stroke="rgba(0,0,0,.06)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[50, 70]} />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`${v}%`, ""]} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                  <Line type="monotone" dataKey="knowledge" name="Knowledge metros" stroke="#0F6E56" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="service" name="Service metros" stroke="#854F0B" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="national" name="National avg" stroke="#B0B0AA" strokeWidth={1.5} strokeDasharray="5 4" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="story-chart-caption">
              Source: U.S. Census Bureau (ACS) · BLS Local Area Unemployment Statistics · Illustrative composite indices
            </p>
          </div>
        </section>

        <div className="container story-narrow">
          <h2 className="story-section-title">Remote work changed the geography of jobs</h2>
          <p>
            In knowledge-heavy metros, remote work preserved employment relationships
            even when offices closed. Workers could maintain income without relocating,
            and participation rates rebounded as childcare and commute barriers eased for
            some households.
          </p>
          <p>
            In tourism and hospitality hubs, remote work was rarely an option. Job
            losses were deeper in 2020, and re-entry was slower — especially among
            women and workers over 55 who disproportionately left the labor force.
          </p>

          <StoryCallout>
            Tampa Bay recovered <strong>94%</strong> of its pre-pandemic participation
            rate by 2024 — driven by growth in professional services and healthcare,
            sectors with above-average remote-work adoption.
          </StoryCallout>
        </div>

        <section className="story-chart-block story-chart-block--split">
          <div className="container split-grid">
            <div>
              <h2 className="story-section-title">Recovery to pre-pandemic levels</h2>
              <p className="story-section-desc">Participation recovery index (2019 = 100) · 2024</p>
              <div className="story-chart-card">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={RECOVERY_BARS} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid stroke="rgba(0,0,0,.06)" horizontal={false} />
                    <XAxis type="number" domain={[70, 100]} tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="metro" width={90} tick={{ fontSize: 11, fill: "#555" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [v, "Recovery index"]} />
                    <Bar dataKey="recovery" radius={[0, 4, 4, 0]} barSize={22}>
                      {RECOVERY_BARS.map((entry) => (
                        <Cell
                          key={entry.metro}
                          fill={
                            entry.recovery >= 90
                              ? "#0F6E56"
                              : entry.metro === "Tampa Bay"
                                ? "#1A5FA5"
                                : "#EF9F27"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h2 className="story-section-title">Remote-eligible jobs by sector</h2>
              <p className="story-section-desc">Share of jobs with remote/hybrid option (%) · Tampa Bay · 2024</p>
              <div className="story-chart-card">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={REMOTE_SHARE}>
                    <CartesianGrid stroke="rgba(0,0,0,.06)" vertical={false} />
                    <XAxis dataKey="sector" tick={{ fontSize: 9, fill: "#888" }} axisLine={false} tickLine={false} interval={0} angle={-18} textAnchor="end" height={58} />
                    <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`${v}%`, "Remote share"]} />
                    <Bar dataKey="share" fill="#0F6E56" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        <div className="container story-narrow">
          <StoryTakeaways
            items={[
              { title: "Uneven recovery", text: "National participation averages hide sharp metro-level divergence driven by industry mix, not geography alone." },
              { title: "Workforce policy", text: "Regions reliant on in-person service work need targeted re-entry programs — remote-work infrastructure won't reach those jobs." },
              { title: "Future of work", text: "Hybrid arrangements are stabilizing in knowledge sectors, permanently shifting office demand and commute patterns in some metros." },
            ]}
          />
          <StoryMethodNote source="Participation rates combine BLS and ACS estimates; knowledge vs. service metro groups are classified by occupational employment shares." />
        </div>
      </article>
    </>
  );
}
