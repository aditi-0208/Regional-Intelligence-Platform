import { Link, Navigate, useParams } from "react-router-dom";
import { getCategoryLabel, getInsightBySlug } from "../data/insights";
import SunBeltGdpStory from "./stories/SunBeltGdpStory";
import HousingAffordabilityStory from "./stories/HousingAffordabilityStory";
import RemoteWorkStory from "./stories/RemoteWorkStory";
import PatentFilingsStory from "./stories/PatentFilingsStory";
import GenericDataStory from "./stories/GenericDataStory";
import "./DataStory.css";

const STORY_COMPONENTS = {
  "sun-belt-gdp-growth": SunBeltGdpStory,
  "housing-affordability-divergence": HousingAffordabilityStory,
  "remote-work-participation": RemoteWorkStory,
  "patent-filings-mid-tier": PatentFilingsStory,
};

const STORY_CTA = {
  income: {
    text: "Compare income, inequality, and cost-of-living indicators across metros in the interactive explorer.",
    methodLabel: "How we measure income",
  },
  employment: {
    text: "Compare workforce participation, employment, and wage indicators across regions in the interactive explorer.",
    methodLabel: "How we measure employment",
  },
  education: {
    text: "Explore educational attainment, degree completion, and earnings indicators across metros.",
    methodLabel: "How we measure education",
  },
  housing: {
    text: "Explore housing affordability, cost burden, and home price trends across metros in the interactive explorer.",
    methodLabel: "How we measure housing",
  },
  health: {
    text: "Compare health outcomes, insurance coverage, and access indicators across regions.",
    methodLabel: "How we measure health",
  },
  demographics: {
    text: "Explore migration, civic engagement, and population indicators across metros.",
    methodLabel: "How we measure demographics",
  },
  transportation: {
    text: "Compare transit access and commute patterns across regions in the interactive explorer.",
    methodLabel: "How we measure transportation",
  },
  poverty: {
    text: "Explore poverty rates and inequality gaps across metros in the interactive explorer.",
    methodLabel: "How we measure poverty",
  },
};

const DataStory = () => {
  const { slug } = useParams();
  const insight = getInsightBySlug(slug);

  if (!insight || !insight.hasStory) {
    return <Navigate to="/insights" replace />;
  }

  const CustomStory = STORY_COMPONENTS[slug];
  const categoryLabel = getCategoryLabel(insight.categorySlug);
  const cta = STORY_CTA[insight.categorySlug] || STORY_CTA.income;

  return (
    <div className="data-story-page">
      <div className="story-hero">
        <div className="container">
          <Link
            to={`/insights/category/${insight.categorySlug}`}
            className="story-back"
          >
            ← Back to {categoryLabel}
          </Link>
          <div className="story-eyebrow">
            {insight.type} · {categoryLabel}
          </div>
          <h1 className="story-title">{insight.title}</h1>
          <p className="story-deck">{insight.desc}</p>
          <div className="story-meta">{insight.meta}</div>
        </div>
      </div>

      {CustomStory ? (
        <CustomStory />
      ) : (
        <GenericDataStory content={insight.content} />
      )}

      <section className="story-cta section">
        <div className="container">
          <h2 className="section-title">Explore the data yourself</h2>
          <p className="story-cta-text">{cta.text}</p>
          <div className="story-cta-btns">
            <Link to="/explore" className="btn btn-primary">
              Open Explore →
            </Link>
            <Link to="/methodology" className="btn btn-outline">
              {cta.methodLabel}
            </Link>
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
            <Link to="/insights">All insights</Link>
            <Link to={`/insights/category/${insight.categorySlug}`}>
              More {categoryLabel.toLowerCase()}
            </Link>
            <Link to="/methodology">Methodology</Link>
            <Link to="/about">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DataStory;
