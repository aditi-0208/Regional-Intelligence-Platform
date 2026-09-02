// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Insights from "./pages/Insights";
import DataStory from "./pages/DataStory";
import InsightsCategory from "./pages/InsightsCategory";
import Methodology from "./pages/Methodology";
import Reports from "./pages/Reports";
import About from "./pages/About";

const WIREFRAME_EXACT = ["/", "/explore", "/insights", "/methodology", "/about"];

function isWireframePage(pathname) {
  return (
    WIREFRAME_EXACT.includes(pathname) ||
    pathname.startsWith("/insights/story/") ||
    pathname.startsWith("/insights/category/")
  );
}

function AppRoutes() {
  const location = useLocation();
  const showGlobalFooter = !isWireframePage(location.pathname);

  return (
    <>
      <Header />
      <main style={{ minHeight: "80vh" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/insights/category/:slug" element={<InsightsCategory />} />
          <Route path="/insights/story/:slug" element={<DataStory />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/policy-playground" element={<Navigate to="/explore" replace />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:topic" element={<Reports />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showGlobalFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
