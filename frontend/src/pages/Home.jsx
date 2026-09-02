import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CATEGORIES, getStoriesByCategory } from "../data/insightCategories";
import USAMap from "./USAMap";
import "./Home.css";
const GDP_DATA = {
  labels: ["2013", "2015", "2017", "2019", "2021", "2023"],
  datasets: [
    {
      label: "Tampa Bay",
      data: [4.1, 4.8, 5.2, 4.9, 5.4, 5.4],
      borderColor: "#1A5FA5",
      backgroundColor: "rgba(26,95,165,.08)",
      tension: 0.4,
      pointRadius: 3,
      borderWidth: 2,
      fill: true,
    },
    {
      label: "Atlanta",
      data: [3.8, 4.2, 4.6, 4.4, 4.9, 4.9],
      borderColor: "#0F6E56",
      backgroundColor: "rgba(15,110,86,.08)",
      tension: 0.4,
      pointRadius: 3,
      borderWidth: 2,
      fill: true,
    },
    {
      label: "National avg",
      data: [2.9, 3.1, 3.3, 2.8, 3.0, 3.0],
      borderColor: "#B0B0AA",
      backgroundColor: "transparent",
      tension: 0.4,
      pointRadius: 3,
      borderWidth: 1.5,
      borderDash: [4, 3],
    },
  ],
};

const POPULAR_REGIONS = [
  "Tampa Bay",
  "Atlanta",
  "Austin",
  "Chicago",
  "Phoenix",
];

const Home = () => {  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
    script.onload = () => {
      if (!chartRef.current) return;
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new window.Chart(chartRef.current, {
        type: "line",
        data: GDP_DATA,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "bottom",
              labels: {
                font: { size: 11, family: "DM Sans, system-ui" },
                padding: 12,
                usePointStyle: true,
                pointStyleWidth: 8,
              },
            },
            title: {
              display: true,
              text: "GDP Growth Rate (%)",
              font: { size: 11, family: "DM Sans, system-ui", weight: "500" },
              color: "#555",
              padding: { bottom: 8 },
            },
          },
          scales: {
            x: {
              grid: { color: "rgba(0,0,0,.04)" },
              ticks: { font: { size: 10, family: "DM Sans, system-ui" }, color: "#888" },
            },
            y: {
              grid: { color: "rgba(0,0,0,.04)" },
              ticks: { font: { size: 10, family: "DM Sans, system-ui" }, color: "#888" },
            },
          },
        },
      });
    };
    document.head.appendChild(script);

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, []);

  return (
    <div className="home-page">
      {/* ── HERO ────────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <h1>Tracking regional vitality across America</h1>
            <p>
              Data-driven insights on how US metro regions perform across
              income, employment, education, housing, health, demographics,
              transportation, and poverty — updated annually by USF researchers.
            </p>            <div className="hero-btns">
              <Link to="/explore" className="btn-hero-primary">
                Explore regions →
              </Link>
              <Link to="/insights" className="btn-hero-ghost">
                Read the 2025 report
              </Link>
            </div>
          </div>

          <div className="map-container">
            <USAMap
              variant="hero"
              onStateClick={() => navigate("/explore")}
            />
            <div className="map-label">
              Color-coded by overall vitality score · click any state to explore
            </div>
          </div>
        </div>
      </section>

      {/* ── STAT BAR ────────────────────────────────────── */}
      <div className="stat-bar">
        <div className="container stat-bar-inner">
          <div className="stat-item">
            <div className="stat-num">150+</div>
            <div className="stat-label">Regions tracked</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">40+</div>
            <div className="stat-label">Indicators measured</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">10</div>
            <div className="stat-label">Years of data</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">2025</div>
            <div className="stat-label">Last updated</div>
          </div>
        </div>
      </div>

      {/* ── SEARCH ──────────────────────────────────────── */}
      <div className="search-section">
        <div className="container">
          <h2 className="section-title search-title">Find your region</h2>
          <div className="search-box">
            <input
              className="search-input"
              type="text"
              placeholder="Search by city or metro area…"
            />
            <Link to="/explore" className="btn btn-primary">
              Search
            </Link>
          </div>
          <div className="chip-row">
            <span className="chip-label">Popular:</span>
            {POPULAR_REGIONS.map((region) => (
              <Link
                key={region}
                to="/explore"
                className="chip"
              >
                {region}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURED INSIGHT ────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="featured-grid">
            <div>
              <div className="featured-eyebrow">
                Featured Insight · 2025 Annual Report
              </div>
              <div className="featured-title">
                Sun Belt metros continue to outpace national GDP growth
              </div>
              <p className="featured-desc">
                Regions like Tampa Bay, Nashville, and Phoenix posted GDP
                growth 2–3× the national average in 2024, driven by population
                inflows and expanding technology and professional services
                sectors.
              </p>
              <Link to="/insights" className="btn btn-outline btn-sm">
                Read full insight →
              </Link>
            </div>
            <div className="card chart-card">
              <div className="chart-wrap">
                <canvas ref={chartRef} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────── */}
      <section className="section pillars-section">
        <div className="container">
          <h2 className="section-title pillars-title">What we measure</h2>
          <p className="pillars-subtitle">
            Eight report categories — each with indicator-level data stories.
          </p>
          <div className="pillars-grid">
            {CATEGORIES.map((category) => {
              const storyCount = getStoriesByCategory(category.slug).length;

              return (
                <Link
                  key={category.slug}
                  to={`/insights/category/${category.slug}`}
                  className="pillar-card"
                  style={{ borderTopColor: category.color }}
                >
                  <div
                    className="pillar-icon-circle"
                    style={{ background: category.bg }}
                  >
                    <i
                      className={`ti ${category.icon}`}
                      style={{ color: category.color, fontSize: "20px" }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="pillar-name">{category.label}</div>
                  <div className="pillar-desc">{category.shortDesc}</div>
                  <div className="pillar-meta">
                    {storyCount} {storyCount === 1 ? "story" : "stories"}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <div className="footer-brand">Regional Macro-Economic Insights</div>
            <div className="footer-sub">
              A research initiative by the University of South Florida · © 2025
            </div>
          </div>
          <div className="footer-links">
            <Link to="/methodology">Methodology</Link>
            <Link to="/about">About</Link>
            <Link to="/about#contact">Contact</Link>
            <Link to="/about">Cite this work</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
