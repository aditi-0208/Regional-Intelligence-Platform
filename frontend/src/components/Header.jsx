import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Header.css";

const WIREFRAME_EXACT = ["/", "/explore", "/insights", "/methodology", "/about"];

function isWireframePath(pathname) {
  return (
    WIREFRAME_EXACT.includes(pathname) ||
    pathname.startsWith("/insights/story/") ||
    pathname.startsWith("/insights/category/")
  );
}

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isWireframe = isWireframePath(location.pathname);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  if (isWireframe) {
    return (
      <header className={`header header--wireframe ${scrolled ? "scrolled" : ""}`}>
        <NavLink to="/" className="nav-brand" onClick={closeMenu}>
          Regional Macro-Economic Insights
          <span>USF Research Platform</span>
        </NavLink>

        <button
          className="nav-toggle"
          aria-label="Toggle navigation menu"
          aria-controls="primary-menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>

        <nav id="primary-menu" className={`nav nav--wireframe ${open ? "open" : ""}`}>
          <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
          <NavLink to="/explore" onClick={closeMenu}>Explore</NavLink>
          <NavLink to="/insights" onClick={closeMenu}>Insights</NavLink>
          <NavLink to="/methodology" onClick={closeMenu}>Methodology</NavLink>
          <NavLink to="/about" onClick={closeMenu}>About</NavLink>
        </nav>
      </header>
    );
  }

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="logo-group">
        <div className="logo-text">
          <div className="logo-line1">
            University of South Florida Regional Insights Dashboard
          </div>
        </div>
      </div>

      <button
        className="nav-toggle"
        aria-label="Toggle navigation menu"
        aria-controls="primary-menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      <nav id="primary-menu" className={`nav ${open ? "open" : ""}`}>
        <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
        <NavLink to="/insights" onClick={closeMenu}>Insights</NavLink>
        <NavLink to="/explore" onClick={closeMenu}>Explore</NavLink>
        <NavLink to="/reports" onClick={closeMenu}>Reports</NavLink>
        <NavLink to="/about" onClick={closeMenu}>About</NavLink>
      </nav>
    </header>
  );
};

export default Header;
