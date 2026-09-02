import {
  Bar,
  BarChart,
  CartesianGrid,
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

export default function GenericDataStory({ content }) {
  const { stats, lead, paragraphs, callout, takeaways, methodSource, lineChart, barChart } =
    content;

  return (
    <>
      <StoryStatBar stats={stats} />

      <article className="story-body">
        <div className="container story-narrow">
          <p className="story-lead">{lead}</p>

          {paragraphs.map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}

          <StoryCallout>{callout}</StoryCallout>

          <div className="story-chart-block">
            <h2 className="story-section-title">{lineChart.title}</h2>
            <p className="story-chart-desc">{lineChart.desc}</p>
            <div className="story-chart-wrap">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineChart.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="tampa"
                    name="Tampa Bay"
                    stroke="#1A5FA5"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="orlando"
                    name="Orlando"
                    stroke="#0F6E56"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="jacksonville"
                    name="Jacksonville"
                    stroke="#854F0B"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="national"
                    name="National avg"
                    stroke="#6B6B66"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {lineChart.caption && (
              <p className="story-chart-caption">{lineChart.caption}</p>
            )}
          </div>

          <div className="story-chart-block">
            <h2 className="story-section-title">{barChart.title}</h2>
            <p className="story-chart-desc">{barChart.desc}</p>
            <div className="story-chart-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barChart.data} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="metro"
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="value" fill="#1A5FA5" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <StoryTakeaways items={takeaways} />
          <StoryMethodNote source={methodSource} />
        </div>
      </article>
    </>
  );
}
