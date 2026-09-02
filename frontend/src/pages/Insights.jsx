import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  ALL_STORIES,
  CATEGORIES,
  getCategoryLabel,
  getStoriesByCategory,
} from "../data/insightCategories";
import "./Insights.css";

const FEATURED_SLUGS = [
  "sun-belt-gdp-growth",
  "housing-affordability-divergence",
  "remote-work-participation",
  "patent-filings-mid-tier",
];

const TOP_REGIONS = [
  { name: "Austin", score: 84 },
  { name: "Raleigh", score: 82 },
  { name: "Nashville", score: 81 },
  { name: "Denver", score: 80 },
  { name: "Atlanta", score: 79 },
  { name: "Seattle", score: 78 },
  { name: "Tampa Bay", score: 72, highlight: true },
  { name: "Phoenix", score: 71 },
  { name: "Charlotte", score: 70 },
  { name: "Dallas", score: 69 },
];

const ARCHIVE_REPORTS = [
  "Regional Macro-Economic Insights 2024",
  "Regional Macro-Economic Insights 2023",
  "Regional Macro-Economic Insights 2022",
];

function MiniChart({ labels, data, color }) {
  const chartData = labels.map((label, i) => ({ label, value: data[i] }));

  return (
    <div className="insight-chart-mini">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CategoryCard({ category }) {
  const storyCount = getStoriesByCategory(category.slug).length;

  return (
    <Link
      to={`/insights/category/${category.slug}`}
      className="category-card"
      style={{ borderTopColor: category.color }}
    >
      <div className="category-card-label" style={{ color: category.color }}>
        {storyCount} {storyCount === 1 ? "story" : "stories"}
      </div>
      <div className="category-card-title">{category.label}</div>
      <p className="category-card-desc">{category.overview}</p>
      <span className="category-card-link">Browse stories →</span>
    </Link>
  );
}

function InsightCard({ insight }) {
  return (
    <Link
      to={`/insights/story/${insight.slug}`}
      className="insight-card insight-card--link"
    >
      <div className="insight-card-eyebrow" style={{ color: insight.chartColor }}>
        {insight.type} · {getCategoryLabel(insight.categorySlug)}
      </div>
      <div className="insight-card-title">{insight.title}</div>
      <div className="insight-card-desc">{insight.desc}</div>
      <MiniChart
        labels={insight.chartLabels}
        data={insight.chartData}
        color={insight.chartColor}
      />
      <div className="insight-card-footer">
        <span className="insight-card-meta">{insight.meta}</span>
        <span className="insight-card-read">Read story →</span>
      </div>
    </Link>
  );
}

const Insights = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredInsights = useMemo(() => {
    if (activeFilter === "All") {
      return ALL_STORIES.filter((s) => FEATURED_SLUGS.includes(s.slug));
    }
    const cat = CATEGORIES.find((c) => c.label === activeFilter);
    return cat ? getStoriesByCategory(cat.slug) : [];
  }, [activeFilter]);

  const filters = ["All", ...CATEGORIES.map((c) => c.label)];

  return (
    <div className="insights-page">
      <div className="featured-report">
        <div className="container featured-report-inner">
          <div>
            <div className="report-eyebrow">Featured · Annual Report</div>
            <div className="report-title">Regional Macro-Economic Insights 2025</div>
            <p className="report-desc">
              Our comprehensive annual assessment of regional vitality across
              150+ US metros — organized across income, employment, education,
              housing, health, demographics, transportation, and poverty.
            </p>
            <div className="report-btns">
              <button type="button" className="btn-hero-primary">
                Read online →
              </button>
              <button type="button" className="btn-hero-ghost">
                Download PDF
              </button>
            </div>
            <div className="report-meta">
              Published March 2025 · USF Regional Research Lab
            </div>
          </div>

          <div className="report-chart-mock">
            <div className="report-chart-label">
              Top 10 Regions by Overall Score, 2025
            </div>
            <div className="report-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={TOP_REGIONS}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    domain={[60, 90]}
                    tick={{ fill: "rgba(255,255,255,.4)", fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={72}
                    tick={{ fill: "rgba(255,255,255,.6)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={14}>
                    {TOP_REGIONS.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          entry.highlight
                            ? "#1A5FA5"
                            : "rgba(255,255,255,.2)"
                        }
                        stroke={entry.highlight ? "#85B7EB" : "transparent"}
                        strokeWidth={entry.highlight ? 1 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <section className="section category-browse-section">
        <div className="container">
          <h2 className="section-title insights-section-title">Browse by category</h2>
          <p className="category-browse-desc">
            Eight report categories — each with multiple indicator-level data stories
            replacing the old chart-only reports.
          </p>
          <div className="category-grid">
            {CATEGORIES.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        </div>
      </section>

      <div className="filter-bar">
        <div className="container filter-tags">
          <span className="filter-label">Category:</span>
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`filter-tag${activeFilter === filter ? " active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="container">
          <h2 className="section-title insights-section-title">
            {activeFilter === "All" ? "Featured data stories" : `${activeFilter} stories`}
          </h2>
          {filteredInsights.length > 0 ? (
            <div className="insights-grid">
              {filteredInsights.map((insight) => (
                <InsightCard key={insight.slug} insight={insight} />
              ))}
            </div>
          ) : (
            <p className="insights-empty">
              No stories match this category yet. Check back soon.
            </p>
          )}
          {activeFilter !== "All" && (
            <div className="insights-view-all">
              <Link to={`/insights/category/${CATEGORIES.find((c) => c.label === activeFilter)?.slug}`}>
                View all {activeFilter.toLowerCase()} stories →
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="archive-row">
        <div className="container archive-inner">
          <span className="archive-label">Past annual reports:</span>
          {ARCHIVE_REPORTS.map((report) => (
            <button key={report} type="button" className="archive-link">
              {report} →
            </button>
          ))}
        </div>
      </div>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <div className="footer-brand">Regional Macro-Economic Insights</div>
            <div className="footer-sub">
              University of South Florida · © 2025
            </div>
          </div>
          <div className="footer-links">
            <Link to="/methodology">Methodology</Link>
            <Link to="/about">About</Link>
            <Link to="/about">Cite this work</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Insights;
