import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import SiteContainer from "./layout/SiteContainer";
import { Logo } from "./layout/icons";

function cx(...parts) { return parts.filter(Boolean).join(" "); }

const navItems = [
  { to: "/#pricing",    label: "Pricing",     match: "/" },
  { to: "/how-it-works",label: "How It Works",match: "/how-it-works" },
  { to: "/explore",     label: "Seniors",     match: "/explore" },
  { to: "/bookings",    label: "Sessions",    match: "/bookings" },
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

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      const isDark = saved === 'true';
      document.documentElement.classList.toggle('dark', isDark);
      return isDark;
    }
    return document.documentElement.classList.contains('dark');
  });
  const toggle = () => {
    document.documentElement.classList.add('theme-animate');
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('darkMode', String(next));
    setDark(next);
    setTimeout(() => document.documentElement.classList.remove('theme-animate'), 300);
  };
  return [dark, toggle];
}

function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dark, toggleDark] = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try { await api.get("/auth/logout"); } catch {
      // Logout should still clear local UI state even if the server session is already gone.
    }
    setUser(null);
    navigate("/");
  };

  const filteredItems = navItems.filter(item => item.to !== "/bookings" || user);

  return (
    <div className={cx("sticky top-0 z-50 w-full transition-all duration-300", scrolled ? "bg-bg/60 backdrop-blur-lg border-b border-border/40 py-1.5" : "bg-transparent py-3")}>
      {/* Desktop floating pill navbar */}
      <SiteContainer>
        <div className="mx-auto flex w-full max-w-[960px] items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2.5 shadow-[0_8px_32px_rgba(15,23,42,0.10)]  sm:rounded-full sm:px-4">
          {/* Logo + Brand */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex min-w-0 items-center gap-2 rounded-full px-1 py-0.5 hover:bg-surface2 transition"
          >
            <Logo size="navbar" />
            <span className="brand-text font-extrabold text-[19px] tracking-wide hidden sm:block">Clarior</span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden flex-1 justify-center md:flex">
            <nav className="inline-flex items-center gap-0.5 rounded-full bg-surface2/80 px-1.5 py-1.5">
              {filteredItems.map((item) => {
                const isActive = item.to === "/#pricing"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.match);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cx(
                      "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary text-primaryFg shadow-soft"
                        : "text-muted hover:bg-surface hover:text-fg"
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
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-fg hover:bg-surface2 transition"
              aria-label="Toggle dark mode"
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>

            {user ? (
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold uppercase tracking-wide text-white shadow-soft hover:shadow-lift transition-all hover:-translate-y-0.5"
                title="Open dashboard"
              >
                {user.name?.trim()?.[0] || "C"}
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:bg-surface2 hover:text-fg md:inline-flex"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primaryFg shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift sm:px-5"
                >
                  <span className="hidden min-[420px]:inline">Join now</span>
                  <span className="min-[420px]:hidden">Join</span>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" /></svg>
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-fg hover:bg-surface2 transition md:hidden"
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
          <div className="mx-auto mt-2 w-full max-w-[960px] animate-slide-down rounded-2xl border border-border bg-surface shadow-lift  p-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {filteredItems.map((item) => {
                const isActive = item.to === "/#pricing"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.match);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={cx(
                      "rounded-xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-fg hover:bg-surface2"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-2 pt-3 border-t border-border flex flex-col gap-2">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-center text-primaryFg"
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="rounded-xl border border-border px-4 py-3 text-sm font-medium text-fg hover:bg-surface2"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-xl border border-border px-4 py-3 text-sm font-medium text-center text-fg hover:bg-surface2">Login</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-center text-primaryFg">Join now</Link>
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
