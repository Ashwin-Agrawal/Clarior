import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import SiteContainer from "./layout/SiteContainer";
import { Logo } from "./layout/icons";
import Button from "./ui/Button";

function cx(...parts) { return parts.filter(Boolean).join(" "); }

const navItems = [
  { to: "/explore",     label: "Colleges",     match: "/explore" },
  { to: "/how-it-works",label: "How It Works", match: "/how-it-works" },
  { to: "/#footer",     label: "About",        match: "/#footer" },
  { to: "/dashboard",   label: "Dashboard",    match: "/dashboard" },
];

function MoonIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"  x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"  />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22" />
    </svg>
  );
}

function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggle: toggleDark } = useTheme();
  const dark = theme === "dark";
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown menus on route transition
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Track if footer is in view to toggle About link active state
  const [footerInView, setFooterInView] = useState(false);

  useEffect(() => {
    if (location.pathname !== "/") {
      setFooterInView(false);
      return;
    }

    const footerEl = document.getElementById("footer");
    if (!footerEl) {
      setFooterInView(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setFooterInView(entry.isIntersecting);
      },
      { threshold: 0.15 } // Trigger active state when 15% of footer is in viewport
    );

    observer.observe(footerEl);
    return () => observer.disconnect();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (_) {
      // Clear UI anyway if call fails
    }
    setUser(null);
    navigate("/");
  };

  const filteredItems = navItems.filter(item => item.to !== "/dashboard" || user);

  return (
    <div className={cx("sticky top-0 z-[100] w-full transition-all duration-300", scrolled ? "bg-bg/60 backdrop-blur-lg border-b border-border/40 py-1.5" : "bg-transparent py-3")}>
      {/* Desktop floating pill navbar */}
      <SiteContainer>
        <div className="mx-auto flex w-full max-w-[960px] items-center gap-2 rounded-2xl border border-border/80 bg-surface/90 dark:bg-surface/80 px-3 py-2.5 shadow-[0_12px_40px_-12px_rgba(37,99,235,0.12)] hover:shadow-[0_16px_48px_-12px_rgba(37,99,235,0.18)] transition-all duration-300 backdrop-blur-xl sm:rounded-full sm:px-4">
          {/* Logo + Brand */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex min-w-0 items-center gap-2 rounded-full px-2 py-1 hover:bg-surface2 transition duration-300 hover:scale-[1.03] transform cursor-pointer"
          >
            <Logo size="navbar" />
            <span className="brand-text font-extrabold text-[19px] tracking-wide hidden sm:block">Clarior</span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden flex-1 justify-center md:flex">
            <nav className="inline-flex items-center gap-0.5 rounded-full bg-surface2/80 px-1.5 py-1.5">
              {filteredItems.map((item) => {
                const isActive = item.to === "/#footer"
                  ? footerInView
                  : location.pathname.startsWith(item.match);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cx(
                      "nav-link",
                      isActive ? "nav-link-active" : "nav-link-inactive"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={toggleDark}
              className="group flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-primary hover:bg-primary/10 hover:border-primary/20 focus:outline-none focus:bg-primary/10 focus:text-primary focus:border-primary/20 active:scale-95 active:bg-primary/15 active:text-primary transition duration-300 shadow-sm hover:shadow cursor-pointer"
              aria-label="Toggle dark mode"
            >
              <span className="transition-transform duration-500 group-hover:rotate-45 block">
                {dark ? <SunIcon /> : <MoonIcon />}
              </span>
            </button>

            {user ? (
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 text-xs font-black uppercase tracking-wide text-white border border-white/20 shadow-md hover:scale-110 active:scale-95 transform transition-all cursor-pointer overflow-hidden"
                title="View Profile"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/12 to-transparent rounded-lg" />
                <span className="relative z-10">{user.name?.trim()?.[0] || "C"}</span>
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-full px-4 py-2 text-sm font-semibold text-muted transition hover:bg-primary/10 hover:text-primary focus:outline-none focus:bg-primary/10 focus:text-primary active:scale-95 active:bg-primary/15 active:text-primary md:inline-flex cursor-pointer"
                >
                  Login
                </Link>
                <Link to="/register">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="shadow-sm"
                  >
                    <span className="hidden min-[420px]:inline">Join now</span>
                    <span className="min-[420px]:hidden">Join</span>
                    <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" /></svg>
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-fg hover:bg-surface2 transition md:hidden cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open menu"
            >
              {menuOpen ? (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                  <line x1="3" y1="6"  x2="21" y2="6"  />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="mx-auto mt-2 w-full max-w-[960px] animate-slide-down p-4 md:hidden rounded-2xl border border-border/80 bg-surface shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] relative z-[120]">
            <nav className="flex flex-col gap-1">
              {filteredItems.map((item) => {
                const isActive = item.to === "/#footer"
                  ? footerInView
                  : location.pathname.startsWith(item.match);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={cx(
                      "rounded-xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-gradient-to-r from-primary/10 to-accent/10 border-l-4 border-primary text-primary font-bold"
                        : "text-fg hover:bg-surface2"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-2 pt-3 border-t border-border/60 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="w-full"
                    >
                      <Button variant="primary" size="md" className="w-full rounded-xl">
                        Profile & Settings
                      </Button>
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="w-full"
                    >
                      <Button variant="secondary" size="md" className="w-full rounded-xl">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="w-full rounded-xl border border-danger/30 text-danger hover:bg-danger/10 hover:text-danger active:bg-danger/20"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="w-full">
                      <Button variant="secondary" size="md" className="w-full rounded-xl">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="w-full">
                      <Button variant="primary" size="md" className="w-full rounded-xl">
                        Join now
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </SiteContainer>
    </div>
  );
}

export default Navbar;

























