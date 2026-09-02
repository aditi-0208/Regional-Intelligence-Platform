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

const BURDEN_TREND = [
  { year: "2015", tampa: 32, phoenix: 34, austin: 30, national: 30 },
  { year: "2017", tampa: 33, phoenix: 35, austin: 32, national: 31 },
  { year: "2019", tampa: 34, phoenix: 36, austin: 34, national: 31 },
  { year: "2021", tampa: 38, phoenix: 40, austin: 38, national: 32 },
  { year: "2022", tampa: 40, phoenix: 42, austin: 41, national: 33 },
  { year: "2023", tampa: 42, phoenix: 44, austin: 43, national: 33 },
  { year: "2024", tampa: 44, phoenix: 46, austin: 45, national: 32 },
];

const BURDEN_2024 = [
  { metro: "Phoenix", burden: 46 },
  { metro: "Austin", burden: 45 },
  { metro: "Tampa Bay", burden: 44 },
  { metro: "Nashville", burden: 41 },
  { metro: "National avg", burden: 32 },
];

const RENT_VS_INCOME = [
  { year: "2019", rent: 3.2, income: 2.8 },
  { year: "2020", rent: 3.5, income: 2.4 },
  { year: "2021", rent: 5.1, income: 3.6 },
  { year: "2022", rent: 6.8, income: 4.2 },
  { year: "2023", rent: 5.4, income: 4.8 },
  { year: "2024", rent: 4.2, income: 4.1 },
];

export default function HousingAffordabilityStory() {
  return (
    <>
      <StoryStatBar
        stats={[
          { value: "+14pp", label: "Average cost-burden gap vs. national in fast-growth metros (2024)" },
          { value: "44%", label: "Share of Tampa Bay households spending 30%+ of income on housing" },
          { value: "Reversed", label: "A decade-long affordability advantage in Sun Belt metros has eroded since 2021" },
        ]}
      />

      <article className="story-body">
        <div className="container story-narrow">
          <p className="story-lead">
            For years, fast-growing Sun Belt metros offered a affordability edge —
            lower costs than coastal cities with strong job markets. That bargain is
            breaking down. Housing costs in high-growth metros are now rising faster
            than incomes, pushing cost-burden rates well above the national average.
          </p>
          <p>
            This brief traces how Tampa Bay, Phoenix, and Austin moved from
            moderately burdened to crisis territory in less than five years — and
            why GDP growth alone no longer tells the full regional vitality story.
          </p>
        </div>

        <section className="story-chart-block">
          <div className="container">
            <h2 className="story-section-title">The gap widened after 2021</h2>
            <p className="story-section-desc">
              Housing cost-burden rate (%) · households spending ≥30% of income on
              housing · 2015–2024
            </p>
            <div className="story-chart-card">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={BURDEN_TREND}>
                  <CartesianGrid stroke="rgba(0,0,0,.06)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[28, 50]} />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`${v}%`, ""]} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                  <Line type="monotone" dataKey="tampa" name="Tampa Bay" stroke="#854F0B" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="phoenix" name="Phoenix" stroke="#C0392B" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="austin" name="Austin" stroke="#1A5FA5" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="national" name="National avg" stroke="#B0B0AA" strokeWidth={1.5} strokeDasharray="5 4" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="story-chart-caption">
              Source: U.S. Census Bureau (ACS) · HUD cost-burden definitions · Illustrative estimates
            </p>
          </div>
        </section>

        <div className="container story-narrow">
          <h2 className="story-section-title">Growth attracted demand — supply couldn&apos;t keep up</h2>
          <p>
            Migration into Tampa Bay, Phoenix, and Austin surged post-2020, compressing
            vacancy rates and accelerating rent growth. Median home prices rose 40–55%
            between 2019 and 2022 in these metros, while wage growth lagged behind in
            service-heavy job sectors that employ a large share of new residents.
          </p>
          <p>
            The result: households that once spent a manageable share of income on
            housing now face the same cost pressures seen in coastal markets — but
            without the same wage premiums in many occupations.
          </p>

          <StoryCallout>
            Phoenix&apos;s 2024 cost-burden rate of <strong>46%</strong> exceeds the
            national average by 14 percentage points — a gap that was just 4 points
            in 2015.
          </StoryCallout>
        </div>

        <section className="story-chart-block story-chart-block--split">
          <div className="container split-grid">
            <div>
              <h2 className="story-section-title">Most burdened metros in 2024</h2>
              <p className="story-section-desc">Housing cost-burden rate (%) · selected metros</p>
              <div className="story-chart-card">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={BURDEN_2024} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid stroke="rgba(0,0,0,.06)" horizontal={false} />
                    <XAxis type="number" domain={[28, 50]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="metro" width={90} tick={{ fontSize: 11, fill: "#555" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`${v}%`, "Cost burden"]} />
                    <Bar dataKey="burden" radius={[0, 4, 4, 0]} barSize={22}>
                      {BURDEN_2024.map((entry) => (
                        <Cell
                          key={entry.metro}
                          fill={
                            entry.metro === "National avg"
                              ? "#B0B0AA"
                              : entry.metro === "Tampa Bay"
                                ? "#854F0B"
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
              <h2 className="story-section-title">Rent vs. income growth</h2>
              <p className="story-section-desc">Annual growth rate (%) · Tampa Bay metro · 2019–2024</p>
              <div className="story-chart-card">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={RENT_VS_INCOME}>
                    <CartesianGrid stroke="rgba(0,0,0,.06)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`${v}%`, ""]} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                    <Bar dataKey="rent" name="Rent growth" fill="#854F0B" radius={[4, 4, 0, 0]} barSize={28} />
                    <Bar dataKey="income" name="Income growth" fill="#85B7EB" radius={[4, 4, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        <div className="container story-narrow">
          <StoryTakeaways
            items={[
              { title: "Policy pressure", text: "Fast-growth metros face mounting pressure on zoning, permitting, and rental assistance as burden rates cross critical thresholds." },
              { title: "Vitality tradeoff", text: "Strong GDP growth can coexist with deteriorating housing affordability — composite scores should weight both." },
              { title: "Who bears the cost", text: "Renters and lower-income households feel burden increases first; homeownership rates mask stress in renter-heavy neighborhoods." },
            ]}
          />
          <StoryMethodNote source="Cost-burden rates use ACS household income and housing cost data, aligned with HUD 30% threshold definitions." />
        </div>
      </article>
    </>
  );
}
