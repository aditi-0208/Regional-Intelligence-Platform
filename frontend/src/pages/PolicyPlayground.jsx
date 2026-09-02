import { useEffect, useMemo, useState } from "react";
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
import "./PolicyPlayground.css";

const mockData = [
  { year: "2014", Tampa: 45000, Miami: 52000, Orlando: 48000 },
  { year: "2015", Tampa: 47000, Miami: 54000, Orlando: 50000 },
  { year: "2016", Tampa: 49000, Miami: 56000, Orlando: 52000 },
  { year: "2017", Tampa: 51000, Miami: 58000, Orlando: 54000 },
  { year: "2018", Tampa: 53000, Miami: 61000, Orlando: 56000 },
  { year: "2019", Tampa: 55000, Miami: 63000, Orlando: 58000 },
  { year: "2020", Tampa: 54000, Miami: 62000, Orlando: 57000 },
  { year: "2021", Tampa: 57000, Miami: 65000, Orlando: 60000 },
  { year: "2022", Tampa: 60000, Miami: 68000, Orlando: 63000 },
  { year: "2023", Tampa: 63000, Miami: 71000, Orlando: 66000 },
];

const categories = [
  { value: "economy", label: "Economy & Employment" },
  { value: "housing", label: "Housing & Real Estate" },
  { value: "health", label: "Healthcare & Wellness" },
  { value: "education", label: "Education & Training" },
  { value: "demographics", label: "Demographics & Population" },
  { value: "environment", label: "Environment & Sustainability" },
];

const indicators = {
  economy: [
    { value: "median-income", label: "Median Household Income" },
    { value: "unemployment", label: "Unemployment Rate" },
    { value: "gdp", label: "Regional GDP" },
  ],
  housing: [
    { value: "home-price", label: "Median Home Price" },
    { value: "rent", label: "Average Rent" },
    { value: "affordability", label: "Housing Affordability Index" },
  ],
  health: [
    { value: "life-expectancy", label: "Life Expectancy" },
    { value: "insurance", label: "Health Insurance Coverage" },
    { value: "hospital-access", label: "Hospital Access Rate" },
  ],
  education: [
    { value: "grad-rate", label: "Graduation Rate" },
    { value: "literacy", label: "Adult Literacy" },
    { value: "stem", label: "STEM Program Enrollment" },
  ],
  demographics: [
    { value: "population-growth", label: "Population Growth" },
    { value: "median-age", label: "Median Age" },
    { value: "migration", label: "Net Migration" },
  ],
  environment: [
    { value: "air-quality", label: "Air Quality Index" },
    { value: "green-space", label: "Green Space per Capita" },
    { value: "resilience", label: "Climate Resilience Index" },
  ],
};

const geoLevels = [
  { value: "msa", label: "Metropolitan Statistical Area (MSA)" },
  { value: "county", label: "County" },
  { value: "state", label: "State" },
];

const regions = {
  msa: ["Tampa Bay", "Miami", "Orlando", "Jacksonville"],
  county: ["Hillsborough", "Pinellas", "Pasco", "Hernando", "Polk"],
  state: ["Florida", "Georgia", "Alabama", "Texas", "California"],
};

const PolicyPlayground = () => {
  const [category, setCategory] = useState("");
  const [indicator, setIndicator] = useState("");
  const [geoLevel, setGeoLevel] = useState("msa");
  const [selectedRegions, setSelectedRegions] = useState(["Tampa Bay", "Miami"]);
  const [chartType, setChartType] = useState("line");
  const [dateRange, setDateRange] = useState({ start: "2014", end: "2023" });
  const [regionMessage, setRegionMessage] = useState("");

  const currentIndicators = category ? indicators[category] || [] : [];
  const currentRegions = regions[geoLevel] || [];

  useEffect(() => {
    setIndicator("");
  }, [category]);

  useEffect(() => {
    setSelectedRegions((prev) => {
      const allowed = regions[geoLevel] || [];
      const filtered = prev.filter((region) => allowed.includes(region));
      if (filtered.length) return filtered.slice(0, 3);
      return allowed.slice(0, 2);
    });
  }, [geoLevel]);

  const filteredData = useMemo(() => {
    const start = Number(dateRange.start) || 2014;
    const end = Number(dateRange.end) || 2023;
    return mockData.filter(({ year }) => {
      const y = Number(year);
      return y >= start && y <= end;
    });
  }, [dateRange]);

  const handleRegionToggle = (region) => {
    setRegionMessage("");
    setSelectedRegions((prev) => {
      if (prev.includes(region)) {
        return prev.filter((r) => r !== region);
      }

      if (prev.length >= 3) {
        setRegionMessage("You can compare up to three regions at once.");
        return prev;
      }

      return [...prev, region];
    });
  };

  const handleDateChange = (key, value) => {
    setDateRange((prev) => {
      const next = { ...prev, [key]: value };
      if (Number(next.start) > Number(next.end)) {
        return prev;
      }
      return next;
    });
  };

  const handleSave = () => {
    window.alert("Configuration saved!");
  };

  const handleExport = () => {
    window.alert("Chart exported as PNG.");
  };

  const handleShare = () => {
    window.alert("Shareable link copied.");
  };

  const showChart = Boolean(indicator);
  const showInsights = showChart;

  return (
    <div className="policy-playground-page">
      <section className="policy-playground-hero">
        <h1 className="policy-playground-title">Policy Playground</h1>
        <p className="policy-playground-subtitle">
          Explore key indicators across categories, compare peer regions, and create compelling visuals to inform decision-making across Tampa Bay and beyond.
        </p>
      </section>

      <section className="policy-playground-layout">
        <article className="policy-card">
          <header className="policy-card-header">
            <p className="policy-card-subtitle">Choose your topic, geographies, time frame, and display type.</p>
          </header>

          <div className="policy-card-content">
            <div className="policy-field">
              <label htmlFor="policy-category" className="policy-label">
                Select Category
              </label>
              <select
                id="policy-category"
                className="policy-select"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">Choose a category…</option>
                {categories.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="policy-field">
              <label htmlFor="policy-indicator" className="policy-label">
                Select Indicator
              </label>
              <select
                id="policy-indicator"
                className="policy-select"
                value={indicator}
                onChange={(event) => setIndicator(event.target.value)}
                disabled={!category || !currentIndicators.length}
              >
                <option value="">{category ? "Choose an indicator…" : "Pick a category first"}</option>
                {currentIndicators.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="policy-field">
              <label htmlFor="policy-geo-level" className="policy-label">
                Geographic Level
              </label>
              <select
                id="policy-geo-level"
                className="policy-select"
                value={geoLevel}
                onChange={(event) => setGeoLevel(event.target.value)}
              >
                {geoLevels.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="policy-field">
              <label className="policy-label">Select Regions (max 3)</label>
              <div className="policy-region-list">
                {currentRegions.map((region) => (
                  <div key={region} className="policy-region-row">
                    <input
                      type="checkbox"
                      id={`region-${region}`}
                      checked={selectedRegions.includes(region)}
                      disabled={selectedRegions.length >= 3 && !selectedRegions.includes(region)}
                      onChange={() => handleRegionToggle(region)}
                    />
                    <label htmlFor={`region-${region}`}>{region}</label>
                  </div>
                ))}
              </div>
              <p className="policy-region-count">{selectedRegions.length} of 3 regions selected</p>
              {regionMessage && <p className="policy-region-warning">{regionMessage}</p>}
            </div>

            <div className="policy-field">
              <label className="policy-label">Date Range</label>
              <div className="policy-date-range">
                <input
                  type="number"
                  className="policy-input"
                  value={dateRange.start}
                  min="2000"
                  max="2023"
                  onChange={(event) => handleDateChange("start", event.target.value)}
                />
                <span>to</span>
                <input
                  type="number"
                  className="policy-input"
                  value={dateRange.end}
                  min="2000"
                  max="2023"
                  onChange={(event) => handleDateChange("end", event.target.value)}
                />
              </div>
              <p className="policy-hint">Use whole years between 2000 and 2023.</p>
            </div>

            <div className="policy-field">
              <label className="policy-label">Chart Type</label>
              <div className="policy-chart-type">
                <label>
                  <input
                    type="radio"
                    name="chart-type"
                    value="line"
                    checked={chartType === "line"}
                    onChange={(event) => setChartType(event.target.value)}
                  />
                  Line chart
                </label>
                <label>
                  <input
                    type="radio"
                    name="chart-type"
                    value="bar"
                    checked={chartType === "bar"}
                    onChange={(event) => setChartType(event.target.value)}
                  />
                  Bar chart
                </label>
              </div>
            </div>

            <div className="policy-actions">
              <button type="button" className="policy-primary-btn" onClick={handleSave}>
                Save configuration
              </button>
              <div className="policy-secondary-actions">
                <button type="button" className="policy-secondary-btn" onClick={handleExport}>
                  Export
                </button>
                <button type="button" className="policy-secondary-btn" onClick={handleShare}>
                  Share
                </button>
              </div>
            </div>
          </div>
        </article>

        <div className="policy-main-column">
          <article className="policy-card">
            <header className="policy-card-header">
              <h2 className="policy-card-title">
                {showChart
                  ? currentIndicators.find((item) => item.value === indicator)?.label
                  : "Select an indicator to visualize data"}
              </h2>
              {category && (
                <p className="policy-card-subtitle">
                  Category: {categories.find((item) => item.value === category)?.label}
                </p>
              )}
            </header>

            {showChart ? (
              <>
                <div style={{ height: 380 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "line" ? (
                      <LineChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {selectedRegions.includes("Tampa Bay") && (
                          <Line type="monotone" dataKey="Tampa" stroke="#16697A" strokeWidth={2} dot={false} />
                        )}
                        {selectedRegions.includes("Miami") && (
                          <Line type="monotone" dataKey="Miami" stroke="#FDB913" strokeWidth={2} dot={false} />
                        )}
                        {selectedRegions.includes("Orlando") && (
                          <Line type="monotone" dataKey="Orlando" stroke="#82A3A1" strokeWidth={2} dot={false} />
                        )}
                      </LineChart>
                    ) : (
                      <BarChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {selectedRegions.includes("Tampa Bay") && <Bar dataKey="Tampa" fill="#16697A" />}
                        {selectedRegions.includes("Miami") && <Bar dataKey="Miami" fill="#FDB913" />}
                        {selectedRegions.includes("Orlando") && <Bar dataKey="Orlando" fill="#82A3A1" />}
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>

                <div className="policy-chart-meta">
                  <div>
                    <span className="policy-chart-meta-label">Source</span>
                    <span className="policy-chart-meta-value">U.S. Census Bureau</span>
                  </div>
                  <div>
                    <span className="policy-chart-meta-label">Last updated</span>
                    <span className="policy-chart-meta-value">January 2024</span>
                  </div>
                  <div>
                    <span className="policy-chart-meta-label">Geographic Level</span>
                    <span className="policy-chart-meta-value">
                      {geoLevels.find((item) => item.value === geoLevel)?.label}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="policy-chart-empty">
                <div>
                  <p className="policy-chart-empty-title">No Data Selected</p>
                  <p className="policy-chart-empty-text">
                    Choose a category and indicator from the controls panel to generate visualizations.
                  </p>
                </div>
              </div>
            )}
          </article>

          {showInsights && (
            <article className="policy-card">
              <header className="policy-card-header">
                <h3 className="policy-card-title">Key Insights</h3>
              </header>
              <ul className="policy-insights-list">
                <li className="policy-insights-item">
                  <span className="policy-insights-bullet">•</span>
                  <span>Tampa Bay shows steady gains across the selected time horizon.</span>
                </li>
                <li className="policy-insights-item">
                  <span className="policy-insights-bullet">•</span>
                  <span>Miami maintains the highest values in the current comparison.</span>
                </li>
                <li className="policy-insights-item">
                  <span className="policy-insights-bullet">•</span>
                  <span>A modest dip appears in 2020, followed by faster recovery in 2021.</span>
                </li>
                <li className="policy-insights-item">
                  <span className="policy-insights-bullet">•</span>
                  <span>Use filters to spotlight emerging regions and indicators of interest.</span>
                </li>
              </ul>
            </article>
          )}
        </div>
      </section>
    </div>
  );
};

export default PolicyPlayground;
