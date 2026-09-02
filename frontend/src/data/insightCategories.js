export const CATEGORIES = [
  { slug: "income", label: "Income", icon: "ti-coin", shortDesc: "Inequality, cost of living, earnings", color: "#185FA5", bg: "#E6F1FB", overview: "Income indicators examine inequality, cost of living, per-capita income, and the distribution of public support programs across metro regions." },
  { slug: "employment", label: "Employment", icon: "ti-briefcase", shortDesc: "Labor force, jobs, participation", color: "#0F6E56", bg: "#E1F5EE", overview: "Employment indicators track labor market health across metro regions, including workforce participation, job creation, and racial disparities in employment outcomes." },
  { slug: "education", label: "Education", icon: "ti-school", shortDesc: "Attainment, degrees, earnings", color: "#533AB7", bg: "#EEEDFE", overview: "Education indicators examine attainment levels, degree completion, and the relationship between education and economic outcomes across metro regions." },
  { slug: "housing", label: "Housing", icon: "ti-building", shortDesc: "Affordability, supply, costs", color: "#854F0B", bg: "#FAEEDA", overview: "Housing indicators track affordability, home values, rental costs, and ownership rates — key measures of economic accessibility across metro regions." },
  { slug: "health", label: "Health", icon: "ti-heart", shortDesc: "Outcomes, insurance, access", color: "#A32D2D", bg: "#FCEBEB", overview: "Health indicators track population health outcomes, insurance coverage, and access to health resources across metro regions." },
  { slug: "demographics", label: "Demographics", icon: "ti-users", shortDesc: "Migration, civic engagement, mobility", color: "#0F6E56", bg: "#E1F5EE", overview: "Demographics indicators cover civic engagement, migration patterns, and population mobility across metro regions." },
  { slug: "transportation", label: "Transportation", icon: "ti-bus", shortDesc: "Transit access, commute patterns", color: "#993C1D", bg: "#FAECE7", overview: "Transportation indicators highlight racial disparities in access to mobility options, including public transit usage and car transportation." },
  { slug: "poverty", label: "Poverty", icon: "ti-trending-down", shortDesc: "Hardship, inequality, income adequacy", color: "#6B6B66", bg: "#F2F2EF", overview: "Poverty indicators highlight economic hardship and inequality across regions, focusing on income adequacy and racial disparities." },
];

const INDICATORS = {
  employment: [
    { id: "emp-1", title: "Labor Force Participation Rate", summary: "Tracks the share of working-age population active in the labor force.", source: "U.S. Census Bureau (ACS)" },
    { id: "emp-2", title: "Employment–Population Ratio", summary: "Measures the proportion of the population that is employed.", source: "U.S. Census Bureau (ACS)" },
    { id: "emp-3", title: "Black–White Unemployment Rate Gap", summary: "Shows disparities in unemployment rates between Black and White workers.", source: "U.S. Census Bureau (ACS)" },
    { id: "emp-4", title: "Black–White Labor Force Participation Rate Gap", summary: "Highlights participation gaps in the labor force by race.", source: "U.S. Census Bureau (ACS)" },
    { id: "emp-5", title: "Business Establishment Growth", summary: "Tracks new business establishment rates over the last 12 months.", source: "U.S. Census Bureau (ACS)" },
  ],
  education: [
    { id: "edu-1", title: "Educational Attainment by Employment Status", summary: "Distribution of educational attainment across employment status categories for adults 25–64.", source: "U.S. Census Bureau (ACS)" },
    { id: "edu-2", title: "Bachelor's Degrees Awarded", summary: "Trend over time in the number of students awarded bachelor's degrees.", source: "U.S. Census Bureau (ACS)" },
    { id: "edu-3", title: "Master's Degrees Awarded", summary: "Comparison of master's degree attainment across metros.", source: "U.S. Census Bureau (ACS)" },
    { id: "edu-4", title: "Median Earnings by Educational Attainment", summary: "Comparison of median earnings across educational attainment levels.", source: "U.S. Census Bureau (ACS)" },
    { id: "edu-5", title: "Poverty Among College Graduates", summary: "Poverty rates among adults with a bachelor's degree or higher.", source: "U.S. Census Bureau (ACS)" },
  ],
  housing: [
    { id: "hou-1", title: "Zillow Home Value Index", summary: "Trend over time for the Zillow Home Value Index (ZHVI).", source: "Zillow Research" },
    { id: "hou-2", title: "Zillow Observed Rent Index", summary: "Trend over time for the Zillow Observed Rent Index (ZORI).", source: "Zillow Research" },
    { id: "hou-3", title: "Homeownership Rate", summary: "Percentage of housing units occupied by owners over time.", source: "U.S. Census Bureau (ACS)" },
    { id: "hou-4", title: "Monthly Housing Costs Under $1,500", summary: "Share of households with monthly housing costs below $1,500.", source: "U.S. Census Bureau (ACS)" },
    { id: "hou-5", title: "Ratio of Housing Costs to Income", summary: "Housing affordability relative to household income over time.", source: "U.S. Census Bureau (ACS)" },
  ],
  health: [
    { id: "hea-1", title: "Premature Death", summary: "Premature death rates as a measure of population health outcomes.", source: "County Health Rankings" },
    { id: "hea-2", title: "Uninsured Rate (Under 65)", summary: "Percentage of adults under age 65 without health insurance.", source: "U.S. Census Bureau (ACS)" },
    { id: "hea-3", title: "HRSA Financial Assistance", summary: "Health Resources and Services Administration grant funding by region.", source: "HRSA" },
    { id: "hea-4", title: "Road Accident Deaths and Injuries", summary: "Deaths and injuries resulting from road accidents over time.", source: "NHTSA / State DOT" },
    { id: "hea-5", title: "Public Assistance and SNAP", summary: "Households receiving public assistance or SNAP benefits.", source: "U.S. Census Bureau (ACS)" },
  ],
  demographics: [
    { id: "dem-1", title: "Civic Engagement (Voting)", summary: "Voting participation as a measure of civic engagement.", source: "U.S. Census Bureau (ACS)" },
    { id: "dem-2", title: "Geographic Mobility by Income", summary: "Mobility patterns segmented by income and poverty group.", source: "U.S. Census Bureau (ACS)" },
    { id: "dem-3", title: "High-Income Migration", summary: "Trend in high-income migration into metro areas.", source: "U.S. Census Bureau (ACS)" },
    { id: "dem-4", title: "Poverty by Age Group", summary: "Poverty among children (0–17) and older adults.", source: "U.S. Census Bureau (ACS)" },
    { id: "dem-5", title: "Taxpaying Population", summary: "Trend in the taxpaying population over time.", source: "IRS / U.S. Census Bureau" },
  ],
  income: [
    { id: "inc-1", title: "Income Inequality (Gini Index)", summary: "Income inequality over time using the Gini Index.", source: "U.S. Census Bureau (ACS)" },
    { id: "inc-2", title: "Cost of Living Index", summary: "Relative cost of living using Regional Price Parities.", source: "Bureau of Economic Analysis (BEA)" },
    { id: "inc-3", title: "Per Capita Personal Income", summary: "Per-capita personal income trends across metro regions.", source: "Bureau of Economic Analysis (BEA)" },
    { id: "inc-4", title: "Social Security Income", summary: "Households receiving Social Security income.", source: "U.S. Census Bureau (ACS)" },
    { id: "inc-5", title: "Public Assistance and SNAP Income", summary: "Households receiving public assistance or SNAP.", source: "U.S. Census Bureau (ACS)" },
  ],
  transportation: [
    { id: "trans-1", title: "Black–White Public Transit Gap", summary: "Difference in public transportation usage rates by race.", source: "U.S. Census Bureau (ACS)" },
    { id: "trans-2", title: "Black–White Car Commute Gap", summary: "Difference in car transportation usage rates by race.", source: "U.S. Census Bureau (ACS)" },
  ],
  poverty: [
    { id: "pov-1", title: "Population Below 200% Poverty Level", summary: "Share of population below 200% of the federal poverty level.", source: "U.S. Census Bureau (ACS)" },
    { id: "pov-2", title: "Black–White Poverty Rate Gap", summary: "Difference between Black and White poverty rates.", source: "U.S. Census Bureau (ACS)" },
  ],
};

const CUSTOM_STORIES = [
  {
    slug: "sun-belt-gdp-growth",
    categorySlug: "income",
    type: "Data Story",
    title: "Sun Belt GDP growth outpaces the national average for the third straight year",
    desc: "Tampa Bay, Nashville, and Phoenix led a cohort of high-growth metros that consistently beat national GDP benchmarks since 2022.",
    meta: "Feb 2025 · 5 min read",
    chartLabels: ["19", "20", "21", "22", "23", "24"],
    chartData: [3.8, 4.2, 4.6, 5.1, 5.4, 5.0],
    customComponent: true,
  },
  {
    slug: "housing-affordability-divergence",
    categorySlug: "housing",
    type: "Research Brief",
    title: "Housing affordability is diverging: fast-growing metros face a growing crisis",
    desc: "Cost burden rates in high-growth metros now exceed national averages by 12–18 percentage points, reversing a decade-long trend.",
    meta: "Jan 2025 · 8 min read",
    chartLabels: ["19", "20", "21", "22", "23", "24"],
    chartData: [28, 30, 32, 35, 38, 40],
    customComponent: true,
  },
  {
    slug: "remote-work-participation",
    categorySlug: "employment",
    type: "Data Story",
    title: "Remote work reshaped workforce participation rates — and not equally",
    desc: "Knowledge-economy metros saw workforce participation recover 3× faster post-pandemic than service-dominated regions.",
    meta: "Dec 2024 · 6 min read",
    chartLabels: ["19", "20", "21", "22", "23", "24"],
    chartData: [61, 58, 60, 62, 65, 66],
    customComponent: true,
  },
  {
    slug: "patent-filings-mid-tier",
    categorySlug: "education",
    type: "Research Brief",
    title: "Patent filings in mid-tier metros: catching up to coastal innovation hubs?",
    desc: "Mid-size metros in the South and Mountain West posted the largest gains in per-capita patent filings between 2019 and 2024.",
    meta: "Nov 2024 · 7 min read",
    chartLabels: ["19", "20", "21", "22", "23", "24"],
    chartData: [12, 14, 15, 17, 19, 22],
    customComponent: true,
  },
];

const METAS = [
  "Feb 2025 · 6 min read",
  "Jan 2025 · 5 min read",
  "Dec 2024 · 7 min read",
  "Nov 2024 · 5 min read",
  "Oct 2024 · 6 min read",
];

function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/[''–]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function seedValues(id, base, count = 6) {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed += id.charCodeAt(i);
  return Array.from({ length: count }, (_, i) =>
    Math.round((base + ((seed + i * 7) % 12) - 4) * 10) / 10
  );
}

function buildGenericContent(category, indicator) {
  const lineData = ["2014", "2016", "2018", "2020", "2022", "2024"].map((year, i) => ({
    year,
    tampa: seedValues(`${indicator.id}t`, 52, 6)[i],
    orlando: seedValues(`${indicator.id}o`, 48, 6)[i],
    jacksonville: seedValues(`${indicator.id}j`, 45, 6)[i],
    national: seedValues(`${indicator.id}n`, 50, 6)[i],
  }));

  const barData = [
    { metro: "Tampa Bay", value: seedValues(`${indicator.id}b1`, 55, 1)[0] },
    { metro: "Orlando", value: seedValues(`${indicator.id}b2`, 50, 1)[0] },
    { metro: "Jacksonville", value: seedValues(`${indicator.id}b3`, 47, 1)[0] },
    { metro: "National avg", value: seedValues(`${indicator.id}b4`, 50, 1)[0] },
  ];

  return {
    stats: [
      { value: "3 metros", label: "Peer comparison: Tampa Bay, Orlando, Jacksonville" },
      { value: "2014–2024", label: "Standard analysis window" },
      { value: category.label, label: "Report category" },
    ],
    lead: `${indicator.summary} This data story examines how ${indicator.title.toLowerCase()} compares across Florida peer metros and the national benchmark.`,
    paragraphs: [
      `Regional differences in ${indicator.title.toLowerCase()} are often larger than year-to-year changes within a single metro. Understanding where Tampa Bay stands relative to Orlando, Jacksonville, and national trends is essential for informed policy and investment decisions.`,
      category.overview,
    ],
    callout: `Tampa Bay's latest reading on ${indicator.title.toLowerCase()} should be interpreted alongside peer metros — not in isolation.`,
    takeaways: [
      { title: "Peer comparison", text: "Florida metros tracked here do not always move together; divergence widened in several recent years." },
      { title: "Data quality", text: `Figures sourced from ${indicator.source}, standardized for cross-metro comparison.` },
      { title: "Go deeper", text: "Use Explore to change regions, indicators, and date ranges interactively." },
    ],
    methodSource: `Indicator data from ${indicator.source}. Comparisons use consistent geographic definitions across Jacksonville, Tampa Bay, and Orlando MSAs.`,
    lineChart: {
      title: "Trend over time",
      desc: `${indicator.title} · Tampa Bay, Orlando, Jacksonville vs. national · 2014–2024`,
      caption: `Source: ${indicator.source} · Illustrative standardized estimates`,
      data: lineData,
    },
    barChart: {
      title: "Latest regional snapshot",
      desc: `${indicator.title} · 2024 index value (normalized)`,
      data: barData,
    },
  };
}

function indicatorToStory(category, indicator, index) {
  const chartData = seedValues(indicator.id, 50, 6);
  return {
    slug: toSlug(indicator.title),
    categorySlug: category.slug,
    type: "Data Story",
    title: indicator.title,
    desc: indicator.summary,
    meta: METAS[index % METAS.length],
    chartLabels: ["14", "16", "18", "20", "22", "24"],
    chartData,
    chartColor: category.color,
    hasStory: true,
    customComponent: false,
    content: buildGenericContent(category, indicator),
  };
}

function buildAllStories() {
  const generic = CATEGORIES.flatMap((cat) => {
    const indicators = INDICATORS[cat.slug] || [];
    return indicators.map((ind, i) => indicatorToStory(cat, ind, i));
  });

  const custom = CUSTOM_STORIES.map((s) => {
    const cat = CATEGORIES.find((c) => c.slug === s.categorySlug);
    return {
      ...s,
      chartColor: cat?.color || "#1A5FA5",
      hasStory: true,
    };
  });

  return [...custom, ...generic];
}

export const ALL_STORIES = buildAllStories();

export function getCategoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getStoriesByCategory(categorySlug) {
  return ALL_STORIES.filter((s) => s.categorySlug === categorySlug);
}

export function getStoryBySlug(slug) {
  return ALL_STORIES.find((s) => s.slug === slug);
}

export function getInsightBySlug(slug) {
  return getStoryBySlug(slug);
}

export const INSIGHTS = ALL_STORIES;

export function getCategoryLabel(categorySlug) {
  return getCategoryBySlug(categorySlug)?.label || categorySlug;
}
