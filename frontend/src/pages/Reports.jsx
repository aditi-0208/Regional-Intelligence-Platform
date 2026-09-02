import React, { useMemo, useState, useRef, useEffect } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import "./Reports.css";
import TableauViz from "../components/TableauViz";

// ── Topic list ────────────────────────────────────────────────────
const TOPICS = [
  { slug: "income",         label: "Income",         icon: "ti-coin",          color: "#185FA5", bg: "#E6F1FB" },
  { slug: "employment",     label: "Employment",     icon: "ti-briefcase",     color: "#0F6E56", bg: "#E1F5EE" },
  { slug: "education",      label: "Education",      icon: "ti-school",        color: "#533AB7", bg: "#EEEDFE" },
  { slug: "housing",        label: "Housing",        icon: "ti-building",      color: "#854F0B", bg: "#FAEEDA" },
  { slug: "health",         label: "Health",         icon: "ti-heart",         color: "#A32D2D", bg: "#FCEBEB" },
  { slug: "demographics",   label: "Demographics",   icon: "ti-users",         color: "#0F6E56", bg: "#E1F5EE" },
  { slug: "transportation", label: "Transportation", icon: "ti-bus",           color: "#993C1D", bg: "#FAECE7" },
  { slug: "poverty",        label: "Poverty",        icon: "ti-trending-down", color: "#6B6B66", bg: "#F2F2EF" },
];

const STANDARD_DATE_RANGE = "Last 10 complete years (2014–2023)";
const DEFAULT_SUBTITLE    = "Standardized report comparing Jacksonville · Tampa Bay · Orlando.";

// ── All category config (unchanged from original) ─────────────────
const CATEGORY_CONFIG = {
  employment: {
    title: "Employment",
    overview: "Employment indicators track labor market health across metro regions, including workforce participation, job creation, and racial disparities in employment outcomes.",
    indicators: [
      { id: "emp-1", title: "Labor Force Participation Rate", summary: "Tracks the share of working-age population active in the labor force.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/S2301_Employment_Status/LaborParticipationTrend?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "emp-2", title: "Employment–Population Ratio", summary: "Measures the proportion of the population that is employed.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/S2301_Employment_Status/Employment-PopulationTrend?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "emp-3", title: "Black–White Unemployment Rate Gap", summary: "Shows disparities in unemployment rates between Black and White workers.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/Black-WhiteUnemploymentRateGap/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "emp-4", title: "Black–White Labor Force Participation Rate Gap", summary: "Highlights participation gaps in the labor force by race.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/Black-WhiteLaborParticipationRateGap/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "emp-5", title: "Business Establishment Growth", summary: "Tracks new business establishment rates over the last 12 months.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/NewBusinessEstablishmentRateintheLast12Months/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
    ],
  },
  education: {
    title: "Education",
    overview: "Education indicators examine attainment levels, degree completion, and the relationship between education and economic outcomes across metro regions.",
    indicators: [
      { id: "edu-1", title: "Educational Attainment by Employment Status (25–64 Years)", summary: "Distribution of educational attainment across employment status categories.", source: "U.S. Census Bureau (ACS)", tableauUrl: ["https://public.tableau.com/views/B23006_HigherEducation_Website/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link","https://public.tableau.com/views/B23006_Low_education_Website/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link"] },
      { id: "edu-2", title: "Number of Students Receiving Bachelor's Degrees", summary: "Trend over time in the number of students awarded bachelor's degrees.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/BachelorsDegree/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "edu-3", title: "Number of Students Receiving Master's Degrees", summary: "Rank-based comparison of master's degree attainment across metros.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/MastersDegree/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "edu-4", title: "Median Earnings by Educational Attainment (B20004)", summary: "Comparison of median earnings across educational attainment levels.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/B20004_HigherEducation_Website/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "edu-5", title: "Poverty Status by Educational Attainment – Bachelor's Degree or Higher (S1701)", summary: "Competitive position for poverty rates among adults with a bachelor's degree or higher.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/PercentageofAdultsWithaBachelorsDegreeorHigherBelowthePovertyLevel/CompetitivePositionTrend?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
    ],
  },
  housing: {
    title: "Housing",
    overview: "Housing indicators track affordability, home values, rental costs, and ownership rates — key measures of economic accessibility across metro regions.",
    indicators: [
      { id: "hou-1", title: "Zillow Home Value Index", summary: "Trend over time for the Zillow Home Value Index (ZHVI).", source: "Zillow Research", tableauUrl: "https://public.tableau.com/views/Zillow_HomeValue/Trend?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "hou-2", title: "Zillow Observed Rent Index", summary: "Trend over time for the Zillow Observed Rent Index (ZORI).", source: "Zillow Research", tableauUrl: "https://public.tableau.com/views/Zillow_RentIndex/Trend?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "hou-3", title: "Homeownership Rate (B25003)", summary: "Trend over time for the percentage of housing units occupied by owners.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/PercentageofUnitsOccupiedbyOwner/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "hou-4", title: "Monthly Housing Costs (B25104)", summary: "Comparison of households with monthly housing costs below $1,500.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/PercentageofHouseholdswithMonthlyHousingCostLessthan1500/PercentageofHouseholdswithMonthlyHousingCostsLessthan1500?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "hou-5", title: "Ratio of Housing Costs to Income", summary: "Trend over time for housing affordability relative to income.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/RatioofHousingCoststoIncome/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
    ],
  },
  health: {
    title: "Health",
    overview: "Health indicators track population health outcomes, insurance coverage, and access to health resources across metro regions.",
    indicators: [
      { id: "hea-1", title: "Premature Death", summary: "Trend over time in premature death rates, reflecting population health outcomes.", source: "County Health Rankings", tableauUrl: "https://public.tableau.com/views/PrematureDeath_17653009774010/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "hea-2", title: "Uninsured Rate (Under 65)", summary: "Trend over time in the percentage of adults under age 65 without health insurance.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/PercentageofUninsuredAdultsAge65/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "hea-3", title: "HRSA Financial Assistance", summary: "Comparison of Health Resources and Services Administration (HRSA) grant funding.", source: "HRSA", tableauUrl: "https://public.tableau.com/views/HRSA_17652870184860/HRSAGrant?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "hea-4", title: "Deaths / Injury Due to Road Accidents", summary: "Trend over time in deaths and injuries resulting from road accidents.", source: "NHTSA / State DOT", tableauUrl: "https://public.tableau.com/views/accidentsWebsite/Sheet2?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "hea-5", title: "Public Assistance Income / SNAP", summary: "Comparison of households receiving public assistance or SNAP benefits.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/PercentageofHouseholdsReceivingPublicAssistanceIncome/PercentageofHouseholdswithPublicAssistanceIncome?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
    ],
  },
  demographics: {
    title: "Demographics",
    overview: "Demographics indicators cover civic engagement, migration patterns, and population mobility across metro regions.",
    indicators: [
      { id: "dem-1", title: "Civic Engagement (Voting)", summary: "Trend or comparative view of civic engagement measured through voting participation.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/VotingWebsite/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "dem-2", title: "Geographical Mobility by Poverty/Income (ACS B07012)", summary: "Mobility patterns segmented by income/poverty group.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/GeographicalMobilitybyPoverty/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "dem-3", title: "Migration by Income Level (High-Income Migration to an MSA)", summary: "Trend over time in high-income migration into the metro area.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/B07010_High_Income_migrants/High-IncomeMigrantsTrend?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "dem-4", title: "Poverty by Age Groups (Children / Older Adults)", summary: "Two related views: poverty among children (0–17) and poverty among older adults.", source: "U.S. Census Bureau (ACS)", tableauUrls: ["https://public.tableau.com/views/PovertyStatusAmongChildrenAges017/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link","https://public.tableau.com/views/PovertyRateAmongOlderAdults/Sheet4?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link"] },
      { id: "dem-5", title: "Taxpaying Population", summary: "Trend or comparative view of the taxpaying population over time.", source: "IRS / U.S. Census Bureau", tableauUrl: "https://public.tableau.com/views/TaxpayersWebsite/Sheet1?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
    ],
  },
  income: {
    title: "Income",
    overview: "Income indicators examine inequality, cost of living, per-capita income, and the distribution of public support programs across metro regions.",
    indicators: [
      { id: "inc-1", title: "Income Inequality (Gini Index)", summary: "Tracks income inequality over time using the Gini Index.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/IncomeInequalityGiniIndex/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "inc-2", title: "Cost of Living Index (Regional Price Parities)", summary: "Compares relative cost of living across regions using Regional Price Parities.", source: "Bureau of Economic Analysis (BEA)", tableauUrl: "https://public.tableau.com/views/MarginalRegionalPriceParitiesCostofLivingIndex_17651726792250/CostofLivingIndex?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "inc-3", title: "Per Capita Personal Income", summary: "Shows per-capita personal income trends over time.", source: "Bureau of Economic Analysis (BEA)", tableauUrl: "https://public.tableau.com/views/PerCapitaPersonalIncome_17651698300470/TrendOverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "inc-4", title: "Households Receiving Social Security Income", summary: "Percentage of households receiving Social Security income in the past 12 months.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/PercentageofHouseholdsReceivingSocialSecurityIncome/PercentageofHouseholdswithSocialSecurityIncome?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "inc-5", title: "Households Receiving Public Assistance or SNAP", summary: "Percentage of households receiving public assistance income or food stamps (SNAP).", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/PercentageofHouseholdsReceivingPublicAssistanceIncome/PercentageofHouseholdswithPublicAssistanceIncome?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
    ],
  },
  transportation: {
    title: "Transportation",
    overview: "Transportation indicators highlight racial disparities in access to mobility options, including public transit usage and car transportation.",
    indicators: [
      { id: "trans-1", title: "Black–White Public Transportation Rate Gap", summary: "Difference between Black and White public transportation usage rates over time.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/Black-WhitePublicTransportationRateGap_17640638062030/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "trans-2", title: "Black–White Car Transportation Rate Gap", summary: "Difference between Black and White car transportation usage rates over time.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/Black-WhiteCarTransportationRateGap_17640691231840/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
    ],
  },
  poverty: {
    title: "Poverty",
    overview: "Poverty indicators highlight economic hardship and inequality across regions, focusing on income adequacy and racial disparities.",
    indicators: [
      { id: "pov-1", title: "Population Below 200% of the Poverty Level", summary: "Percentage of the population with income below 200% of the federal poverty level.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/PercentageofPopulationBelow200ofthePovertyLevel/TrendoverTime?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
      { id: "pov-2", title: "Black–White Poverty Rate Gap", summary: "Difference between Black and White poverty rates, highlighting racial disparities.", source: "U.S. Census Bureau (ACS)", tableauUrl: "https://public.tableau.com/views/Black-WhitePovertyRateGap/Black-WhitePovertyRateGap?:language=en-US&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link" },
    ],
  },
};

// ── Landing page (no topic selected) ─────────────────────────────
function ReportsLanding() {
  const navigate = useNavigate();
  return (
    <div className="rpt-page">
      <div className="rpt-landing-header">
        <div className="rpt-container">
          <p className="rpt-landing-eyebrow">Regional Macro-Economic Insights</p>
          <h1 className="rpt-landing-title">Explore the data</h1>
          <p className="rpt-landing-sub">
            Select a topic to explore Tableau visualizations, trend data, and
            regional comparisons across Jacksonville, Tampa Bay, and Orlando.
          </p>
        </div>
      </div>
      <div className="rpt-container" style={{ padding: "2.5rem 2rem" }}>
        <div className="rpt-topic-grid">
          {TOPICS.map((t) => (
            <button
              key={t.slug}
              className="rpt-topic-card"
              onClick={() => navigate(`/reports/${t.slug}`)}
            >
              <div className="rpt-topic-icon" style={{ background: t.bg }}>
                <i className={`ti ${t.icon}`} style={{ color: t.color, fontSize: "22px" }} aria-hidden="true" />
              </div>
              <span className="rpt-topic-name">{t.label}</span>
              <span className="rpt-topic-count">
                {(CATEGORY_CONFIG[t.slug]?.indicators || []).length} indicators
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Individual indicator panel ────────────────────────────────────
function IndicatorPanel({ ind, index }) {
  const [open, setOpen] = useState(index === 0); // first panel open by default
  const hasMultiple = Array.isArray(ind.tableauUrls) || Array.isArray(ind.tableauUrl);
  const urls = ind.tableauUrls || (Array.isArray(ind.tableauUrl) ? ind.tableauUrl : null);

  return (
    <div className={`rpt-indicator ${open ? "rpt-indicator--open" : ""}`}>
      <button className="rpt-indicator__header" onClick={() => setOpen(v => !v)}>
        <span className="rpt-indicator__num">{String(index + 1).padStart(2, "0")}</span>
        <span className="rpt-indicator__title">{ind.title}</span>
        <span className="rpt-indicator__chevron">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="rpt-indicator__body">
          <div className="rpt-indicator__chart">
            {urls ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {urls.map((u, i) => (
                  <TableauViz key={i} url={u} height={520} toolbar={false} tabs={false} />
                ))}
              </div>
            ) : ind.tableauUrl ? (
              <TableauViz url={ind.tableauUrl} height={520} toolbar={false} tabs={false} />
            ) : (
              <div className="rpt-indicator__placeholder">
                Tableau visualization — URL not yet configured
              </div>
            )}
          </div>
          <div className="rpt-indicator__meta">
            <p className="rpt-indicator__summary">{ind.summary}</p>
            <div className="rpt-meta-row">
              <span className="rpt-meta-label">Source</span>
              <span className="rpt-meta-value">{ind.source}</span>
            </div>
            <div className="rpt-meta-row">
              <span className="rpt-meta-label">Date range</span>
              <span className="rpt-meta-value">{STANDARD_DATE_RANGE}</span>
            </div>
            <div className="rpt-meta-row">
              <span className="rpt-meta-label">Regions</span>
              <span className="rpt-meta-value">Jacksonville · Tampa Bay · Orlando</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Category report ───────────────────────────────────────────────
function CategoryReport({ topic }) {
  const config = CATEGORY_CONFIG[topic];
  const topicMeta = TOPICS.find(t => t.slug === topic);

  return (
    <div className="rpt-report">

      {/* report header */}
      <div className="rpt-report-header">
        <div className="rpt-container">
          <div className="rpt-report-header__inner">
            <div>
              <p className="rpt-report-eyebrow">Regional Macro-Economic Insights</p>
              <h1 className="rpt-report-title">
                {topicMeta && (
                  <span className="rpt-report-icon" style={{ background: topicMeta.bg }}>
                    <i className={`ti ${topicMeta.icon}`} style={{ color: topicMeta.color }} aria-hidden="true" />
                  </span>
                )}
                {config.title}
              </h1>
              <p className="rpt-report-sub">{DEFAULT_SUBTITLE}</p>
            </div>
            <div className="rpt-report-meta-pills">
              <span className="rpt-pill">
                <i className="ti ti-chart-line" aria-hidden="true" />
                {config.indicators.length} indicators
              </span>
              <span className="rpt-pill">
                <i className="ti ti-calendar" aria-hidden="true" />
                2014–2023
              </span>
              <span className="rpt-pill">
                <i className="ti ti-map-pin" aria-hidden="true" />
                3 metros
              </span>
            </div>
          </div>
          <p className="rpt-overview">{config.overview}</p>
        </div>
      </div>

      {/* indicators */}
      <div className="rpt-container rpt-indicators-wrap">
        {config.indicators.map((ind, i) => (
          <IndicatorPanel key={ind.id} ind={ind} index={i} />
        ))}
      </div>

    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────
export default function Reports() {
  const { topic: topicParam } = useParams();
  const topic = useMemo(() => (topicParam || "").toLowerCase(), [topicParam]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!topicParam)            return <ReportsLanding />;
  if (!CATEGORY_CONFIG[topic]) return <ReportsLanding />;

  return (
    <div className="rpt-page">
      <div className="rpt-layout">

        {/* sidebar */}
        <aside className={`rpt-sidebar ${sidebarOpen ? "rpt-sidebar--open" : "rpt-sidebar--closed"}`}>
          <button
            className="rpt-sidebar__toggle"
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Toggle sidebar"
            type="button"
          >
            {sidebarOpen ? "‹" : "›"}
          </button>

          {sidebarOpen && (
            <nav className="rpt-sidebar__nav">
              <p className="rpt-sidebar__heading">Topics</p>
              {TOPICS.map((t) => (
                <NavLink
                  key={t.slug}
                  to={`/reports/${t.slug}`}
                  className={({ isActive }) =>
                    `rpt-sidebar__link ${isActive ? "rpt-sidebar__link--active" : ""}`
                  }
                >
                  <span className="rpt-sidebar__link-icon" style={{ background: t.bg }}>
                    <i className={`ti ${t.icon}`} style={{ color: t.color }} aria-hidden="true" />
                  </span>
                  {t.label}
                </NavLink>
              ))}
            </nav>
          )}
        </aside>

        {/* main content */}
        <main className={`rpt-main ${!sidebarOpen ? "rpt-main--full" : ""}`}>
          <CategoryReport topic={topic} />
        </main>

      </div>
    </div>
  );
}
