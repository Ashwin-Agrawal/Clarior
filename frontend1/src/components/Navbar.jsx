import { useState, useEffect, useRef } from "react";
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

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Error loading notifications:", err.message);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Poll notifications every 45 seconds for real-time updates
      const interval = setInterval(loadNotifications, 45000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking read:", err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all read:", err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative group flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-primary hover:bg-primary/10 hover:border-primary/20 focus:outline-none focus:bg-primary/10 focus:text-primary active:scale-95 transition duration-300 shadow-sm cursor-pointer"
        aria-label="View notifications"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger"></span>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-[-40px] sm:right-0 mt-3.5 w-80 sm:w-96 rounded-[24px] border border-border/70 bg-surface/98 backdrop-blur-xl shadow-hero p-4 space-y-3 z-[110] animate-slide-down">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-fg uppercase tracking-wide">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-black bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">{unreadCount} New</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline bg-transparent border-0 cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[320px] overflow-y-auto space-y-2.5 pr-1 scrollbar-hide">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted">
                <div className="text-2xl mb-2">🔔</div>
                <div className="text-xs font-bold uppercase tracking-wider">No notifications yet</div>
              </div>
            ) : (
              notifications.map((n) => {
                const badgeColor = 
                  n.type === "earnings" ? "bg-success/10 text-success border-success/20" :
                  n.type === "cancellation" ? "bg-danger/10 text-danger border-danger/20" :
                  "bg-primary/10 text-primary border-primary/20";
                
                return (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && handleMarkRead(n._id)}
                    className={cx(
                      "p-3 rounded-2xl border transition duration-200 text-left cursor-pointer flex gap-3 relative overflow-hidden group",
                      n.isRead
                        ? "bg-surface border-border/40 hover:bg-surface2/50"
                        : "bg-primary/5 border-primary/20 hover:bg-primary/8 shadow-sm"
                    )}
                  >
                    <div className={cx(
                      "h-8 w-8 rounded-xl border shrink-0 flex items-center justify-center text-xs font-black uppercase",
                      badgeColor
                    )}>
                      {n.type === "earnings" ? "₹" : n.type === "cancellation" ? "✕" : "✓"}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-fg truncate">{n.title}</span>
                        <span className="text-[9px] font-semibold text-muted shrink-0">
                          {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed font-semibold block">{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <span className="absolute top-3.5 right-3 h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
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

            <NotificationBell />

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

























