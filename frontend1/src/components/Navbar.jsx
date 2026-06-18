import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
    setUserMenuOpen(false);
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
    <div className={cx("sticky top-0 z-50 w-full transition-all duration-300", scrolled ? "bg-bg/60 backdrop-blur-lg border-b border-border/40 py-1.5" : "bg-transparent py-3")}>
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
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-2 text-xs font-black uppercase tracking-wide text-fg shadow-sm transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/20 focus:outline-none focus:bg-primary/10 focus:text-primary focus:border-primary/20 active:scale-95 active:bg-primary/15 active:text-primary transform cursor-pointer"
                  title="Account menu"
                >
                  {user.name?.trim()?.[0] || "C"}
                </button>
                
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="avatar-dropdown absolute right-0 md:right-auto md:left-0 mt-3 w-72 origin-top-right md:origin-top-left p-3 z-50 animate-slide-down">
                      {/* User Profile Header */}
                      <div className="flex items-center gap-3 p-3 border-b border-border/60 mb-2">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary/20 via-accent/20 to-primary/10 border border-primary/20 text-sm font-black text-primary uppercase shadow-inner">
                          {user.name?.trim()?.[0] || "C"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Logged in as</div>
                          <div className="text-sm font-black text-fg truncate leading-none mt-1">{user.name}</div>
                          <div className="text-[11px] font-medium text-muted truncate mt-0.5">{user.email}</div>
                        </div>
                      </div>

                      {/* Wallet Balance Card */}
                      <div className="mx-1 mb-3 rounded-2xl bg-gradient-to-br from-primary/8 via-accent/4 to-transparent border border-primary/15 p-3 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted">Account Wallet</div>
                          <div className="mt-1 text-base font-black text-fg flex items-center gap-1.5 leading-none">
                            {user.role === "student" ? (
                              <>
                                <span className="text-xl">🪙</span>
                                <span>{user.callCredits || 0} Credits</span>
                              </>
                            ) : (
                              <>
                                <span className="text-lg">💰</span>
                                <span>₹{user.availableBalance || 0}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {user.role === "student" ? (
                          <Link to="/buy-credits" onClick={() => setUserMenuOpen(false)}>
                            <Button variant="primary" size="sm" className="rounded-full text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer">
                              Add
                            </Button>
                          </Link>
                        ) : (
                          <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}>
                            <Button variant="primary" size="sm" className="rounded-full text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer">
                              Withdraw
                            </Button>
                          </Link>
                        )}
                      </div>

                      {/* Navigation Links with Hover Animations */}
                      <div className="space-y-1">
                        {[
                          {
                            to: "/dashboard",
                            label: "Dashboard",
                            icon: <svg className="h-4.5 w-4.5 text-muted transition-colors group-hover:text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
                            show: true
                          },
                          {
                            to: "/explore",
                            label: "Explore Seniors",
                            icon: <svg className="h-4.5 w-4.5 text-muted transition-colors group-hover:text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>,
                            show: user.role === "student"
                          },
                          {
                            to: "/bookings",
                            label: "My Sessions",
                            icon: <svg className="h-4.5 w-4.5 text-muted transition-colors group-hover:text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                            show: true
                          },
                          {
                            to: `/profile/${user.id || user._id}`,
                            label: "Public Profile",
                            icon: <svg className="h-4.5 w-4.5 text-muted transition-colors group-hover:text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
                            show: user.role === "senior"
                          }
                        ].filter(item => item.show).map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setUserMenuOpen(false)}
                            className="group flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-semibold text-fg hover:bg-primary/8 hover:text-primary transition-all duration-300"
                          >
                            <span className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface2/60 border border-border/40 text-muted transition-colors group-hover:bg-primary/12 group-hover:text-primary group-hover:border-primary/20 shrink-0">
                                {item.icon}
                              </span>
                              <span className="transition-transform group-hover:translate-x-1 duration-300">{item.label}</span>
                            </span>
                            <svg className="h-4 w-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                          </Link>
                        ))}
                      </div>

                      {/* Divider & Logout action */}
                      <div className="my-2 border-t border-border/60" />
                      <button
                        type="button"
                        onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                        className="group flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-bold text-danger hover:bg-danger/10 transition-all duration-300 cursor-pointer text-left"
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-danger/5 border border-danger/10 text-danger transition-colors shrink-0">
                            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                          </span>
                          <span>Logout</span>
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
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
          <div className="mobile-nav-dropdown mx-auto mt-2 w-full max-w-[960px] animate-slide-down p-4 md:hidden">
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
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="w-full"
                    >
                      <Button variant="primary" size="md" className="w-full rounded-xl">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="w-full rounded-xl"
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
