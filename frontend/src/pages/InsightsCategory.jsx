import { Link, Navigate, useParams } from "react-router-dom";
import {
  Line,
  LineChart,
  ResponsiveContainer,
} from "recharts";
import {
  CATEGORIES,
  getCategoryBySlug,
  getCategoryLabel,
  getStoriesByCategory,
} from "../data/insightCategories";
import "./Insights.css";

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

function StoryCard({ story }) {
  return (
    <Link
      to={`/insights/story/${story.slug}`}
      className="insight-card insight-card--link"
    >
      <div className="insight-card-eyebrow" style={{ color: story.chartColor }}>
        {story.type} · {getCategoryLabel(story.categorySlug)}
      </div>
      <div className="insight-card-title">{story.title}</div>
      <div className="insight-card-desc">{story.desc}</div>
      <MiniChart
        labels={story.chartLabels}
        data={story.chartData}
        color={story.chartColor}
      />
      <div className="insight-card-footer">
        <span className="insight-card-meta">{story.meta}</span>
        <span className="insight-card-read">Read story →</span>
      </div>
    </Link>
  );
}

const InsightsCategory = () => {
  const { slug } = useParams();
  const category = getCategoryBySlug(slug);

  if (!category) {
    return <Navigate to="/insights" replace />;
  }

  const stories = getStoriesByCategory(slug);
  const featured = stories.filter((s) => s.customComponent);
  const indicators = stories.filter((s) => !s.customComponent);

  return (
    <div className="insights-page">
      <div className="category-hero" style={{ background: category.bg }}>
        <div className="container">
          <Link to="/insights" className="category-back">
            ← All categories
          </Link>
          <div className="category-hero-eyebrow" style={{ color: category.color }}>
            {stories.length} data {stories.length === 1 ? "story" : "stories"}
          </div>
          <h1 className="category-hero-title">{category.label}</h1>
          <p className="category-hero-desc">{category.overview}</p>
        </div>
      </div>

      <div className="category-nav-bar">
        <div className="container category-nav-inner">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/insights/category/${cat.slug}`}
              className={`category-nav-chip${cat.slug === slug ? " active" : ""}`}
              style={
                cat.slug === slug
                  ? { background: cat.color, borderColor: cat.color }
                  : {}
              }
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {featured.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title insights-section-title">Featured stories</h2>
            <div className="insights-grid">
              {featured.map((story) => (
                <StoryCard key={story.slug} story={story} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <h2 className="section-title insights-section-title">
            All {category.label.toLowerCase()} indicators
          </h2>
          <p className="category-section-desc">
            Each indicator from our regional reports is available as a narrative data story
            with trends, peer comparisons, and methodology notes.
          </p>
          <div className="insights-grid">
            {indicators.map((story) => (
              <StoryCard key={story.slug} story={story} />
            ))}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <div className="footer-brand">Regional Macro-Economic Insights</div>
            <div className="footer-sub">University of South Florida · © 2025</div>
          </div>
          <div className="footer-links">
            <Link to="/insights">All insights</Link>
            <Link to="/methodology">Methodology</Link>
            <Link to="/about">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InsightsCategory;
