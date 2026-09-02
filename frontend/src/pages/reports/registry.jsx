// src/pages/reports/registry.js
import { lazy } from "react";

// Real reports (lazy for code-splitting). Add more as you build them.
const IncomeReport = lazy(() => import("./IncomeReport.jsx"));

// Generic placeholder for the ones not built yet
import GenericReport from "./GenericReport.jsx";

export const REPORTS = [
  { label: "Health", slug: "health", element: <GenericReport title="Health" /> },
  { label: "Employment", slug: "employment", element: <GenericReport title="Employment" /> },
  { label: "Income", slug: "income", element: <IncomeReport /> }, // real example
  { label: "Public Safety", slug: "public-safety", element: <GenericReport title="Public Safety" /> },
  { label: "Demographics", slug: "demographics", element: <GenericReport title="Demographics" /> },
  { label: "Transportation", slug: "transportation", element: <GenericReport title="Transportation" /> },
  { label: "Education", slug: "education", element: <GenericReport title="Education" /> },
  { label: "Economic Indicators", slug: "economic-indicators", element: <GenericReport title="Economic Indicators" /> },
  { label: "Poverty", slug: "poverty", element: <GenericReport title="Poverty" /> },
  { label: "Unemployment", slug: "unemployment", element: <GenericReport title="Unemployment" /> },
  { label: "Housing", slug: "housing", element: <GenericReport title="Housing" /> },
  { label: "Environment", slug: "environment", element: <GenericReport title="Environment" /> },
  { label: "Tourism", slug: "tourism", element: <GenericReport title="Tourism" /> },
  { label: "Others", slug: "others", element: <GenericReport title="Others" /> },
];

export const DEFAULT_REPORT_SLUG = "employment";

export function toTitle(slug) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
