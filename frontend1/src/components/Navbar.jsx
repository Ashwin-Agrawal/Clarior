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
  { 
    to: "/explore",     
    label: "Colleges",     
    match: "/explore",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h4" />
      </svg>
    )
  },
  { 
    to: "/how-it-works",
    label: "How It Works", 
    match: "/how-it-works",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  { 
    to: "/#footer",     
    label: "About",        
    match: "/#footer",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  { 
    to: "/dashboard",   
    label: "Dashboard",    
    match: "/dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )
  },
];

function MoonIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
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
        className="relative group flex h-9.5 w-9.5 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-primary hover:bg-primary/10 hover:border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/30 active:scale-95 transition duration-300 shadow-xs cursor-pointer"
        aria-label="View notifications"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
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
                <div className="text-2xl mb-2"></div>
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
                      {n.type === "earnings" ? "₹" : n.type === "cancellation" ? "" : ""}
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

function UserAvatarMenu({ user, handleLogout }) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstName = user?.name?.trim()?.split(" ")[0] || "Account";
  const initials = user?.name?.trim()?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "C";
  const roleLabel = user?.role === "senior" ? "Senior" : user?.role === "admin" ? "Admin" : "Student";
  const credits = user?.callCredits ?? (user?.role === "student" ? 10 : 0);
  const hasAvatar = Boolean(user?.avatar && typeof user.avatar === "string" && user.avatar.trim() !== "" && user.avatar !== "undefined" && user.avatar !== "null" && !imgError);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Luxury Startup User Pill Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-border/80 bg-surface hover:bg-surface2 hover:border-primary/30 shadow-xs hover:shadow transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
        title={`${user?.name} (${roleLabel})`}
      >
        {/* Avatar Ring Circle */}
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-accent text-white font-black text-xs tracking-wider shadow-sm overflow-hidden ring-1 ring-primary/20">
          {hasAvatar ? (
            <img
              src={user.avatar}
              alt={user.name || "User"}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover rounded-full"
            />
          ) : (
            <span className="select-none">{initials}</span>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-surface" />
        </div>

        {/* User Name & Chevron */}
        <div className="hidden sm:flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-black text-fg truncate max-w-[90px]">{firstName}</span>
          <svg
            className={`w-3.5 h-3.5 text-muted transition-transform duration-300 ${open ? "rotate-180 text-primary" : "group-hover:text-fg"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Luxury Account Dropdown Panel */}
      {open && (
        <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-border bg-surface p-2.5 shadow-card backdrop-blur-xl z-[120] animate-slide-down">
          {/* Header Card */}
          <div className="p-3.5 rounded-xl bg-surface2 border border-border/50 mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white font-black text-sm shadow-sm overflow-hidden ring-1 ring-primary/20">
                {hasAvatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "User"}
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="select-none">{initials}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-fg truncate leading-snug">{user.name}</p>
                <p className="text-[10px] text-muted font-medium truncate">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[9px] font-black uppercase text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                    {roleLabel}
                  </span>
                  <span className="text-[9px] font-black uppercase text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-md">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Wallet Credits Bar */}
            <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                <span>Credits:</span>
                <span className="text-fg font-black">{credits}</span>
              </div>
              <button
                type="button"
                onClick={() => { setOpen(false); navigate("/buy-credits"); }}
                className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider bg-transparent border-0 cursor-pointer"
              >
                + Get More
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setOpen(false); navigate("/profile"); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-fg hover:bg-primary/10 hover:text-primary transition-colors text-left cursor-pointer group"
            >
              <svg className="w-4 h-4 text-muted group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              My Profile
            </button>

            {user.role === "senior" && (
              <button
                type="button"
                onClick={() => { setOpen(false); navigate("/dashboard"); }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-fg hover:bg-primary/10 hover:text-primary transition-colors text-left cursor-pointer group"
              >
                <svg className="w-4 h-4 text-muted group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Senior Dashboard
              </button>
            )}

            <button
              type="button"
              onClick={() => { setOpen(false); navigate("/my-bookings"); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-fg hover:bg-primary/10 hover:text-primary transition-colors text-left cursor-pointer group"
            >
              <svg className="w-4 h-4 text-muted group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              My Bookings
            </button>

            <button
              type="button"
              onClick={() => { setOpen(false); navigate("/buy-credits"); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-fg hover:bg-primary/10 hover:text-primary transition-colors text-left cursor-pointer group"
            >
              <svg className="w-4 h-4 text-muted group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              Buy Credits
            </button>

            <div className="pt-1.5 mt-1 border-t border-border/50">
              <button
                type="button"
                onClick={() => { setOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-danger hover:bg-danger/10 transition-colors text-left cursor-pointer group"
              >
                <svg className="w-4 h-4 text-danger group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Log out
              </button>
            </div>
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
      { threshold: 0.15 }
    );

    observer.observe(footerEl);
    return () => observer.disconnect();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (_) {}
    setUser(null);
    navigate("/");
  };

  const filteredItems = navItems.filter(item => item.to !== "/dashboard" || user);

  return (
    <div className={cx("sticky top-0 z-[100] w-full transition-all duration-300 gpu-layer", scrolled ? "bg-bg/90 backdrop-blur-xl border-b border-border/60 py-2 shadow-sm" : "bg-transparent py-3")}>
      {/* Navbar Container */}
      <SiteContainer>
        <div className="mx-auto flex w-full max-w-[960px] items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 shadow-card transition-all duration-200 sm:rounded-full sm:px-4">
          {/* Logo + Brand (Full name visible on mobile too) */}
          <button
            type="button"
            aria-label="Clarior Home"
            onClick={() => navigate("/")}
            className="flex min-w-0 items-center gap-2 rounded-full px-2 py-1 hover:bg-surface2 transition duration-200 cursor-pointer"
          >
            <Logo size="navbar" />
            <span className="brand-text font-extrabold text-[19px] tracking-wide block">Clarior</span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden flex-1 justify-center md:flex">
            <nav aria-label="Main Navigation" className="inline-flex items-center gap-0.5 rounded-full bg-surface2/80 px-1.5 py-1.5">
              {filteredItems.map((item) => {
                const isActive = item.to === "/#footer"
                  ? footerInView
                  : location.pathname.startsWith(item.match);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cx(
                      "nav-link flex items-center gap-1.5",
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
            {/* Theme Toggle Button (Desktop top bar) */}
            <button
              type="button"
              onClick={toggleDark}
              className="hidden md:flex group h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-primary hover:bg-primary/10 hover:border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/30 active:scale-95 active:bg-primary/15 active:text-primary transition duration-300 shadow-xs cursor-pointer"
              aria-label="Toggle dark mode"
            >
              <span className="transition-transform duration-500 group-hover:rotate-45 block">
                {dark ? <SunIcon /> : <MoonIcon />}
              </span>
            </button>

            {/* Notification Bell (Desktop top bar) */}
            <div className="hidden md:block">
              <NotificationBell />
            </div>

            {user ? (
              <UserAvatarMenu user={user} handleLogout={handleLogout} />
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

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex md:hidden h-9.5 w-9.5 items-center justify-center rounded-full border border-border/80 bg-surface text-fg hover:text-primary hover:border-primary/40 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300 shadow-xs cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Glassmorphic Navigation Drawer */}
        {menuOpen && (
          <div className="md:hidden mt-2.5 w-full rounded-[24px] border border-border/80 bg-surface/98 backdrop-blur-2xl p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] space-y-3 animate-slide-down z-[110]">
            {/* Top Drawer Controls: Theme Switcher & Notifications */}
            <div className="flex items-center justify-between pb-2.5 border-b border-border/40 px-1">
              <button
                type="button"
                onClick={toggleDark}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-border/80 bg-surface2/60 text-fg hover:border-primary/40 active:scale-95 transition-all text-xs font-bold cursor-pointer"
                aria-label="Toggle dark mode"
              >
                <span className="text-primary">{dark ? <SunIcon /> : <MoonIcon />}</span>
                <span className="uppercase text-[10px] tracking-wider font-extrabold">{dark ? "Light Mode" : "Dark Mode"}</span>
              </button>

              {user && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-muted tracking-wider">Alerts</span>
                  <NotificationBell />
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="space-y-1">
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
                      "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 group",
                      isActive
                        ? "bg-gradient-to-r from-primary/15 via-accent/10 to-primary/10 border border-primary/30 text-primary shadow-xs scale-[1.01]"
                        : "text-fg/80 hover:bg-surface2 hover:text-fg hover:translate-x-1"
                    )}
                  >
                    <div className={cx(
                      "flex h-9 w-9 items-center justify-center rounded-xl border transition-colors shrink-0",
                      isActive 
                        ? "bg-primary text-white border-primary shadow-sm" 
                        : "bg-surface2/80 border-border/50 text-muted group-hover:text-fg group-hover:border-primary/30"
                    )}>
                      {item.icon}
                    </div>
                    <span className="flex-1 font-black text-xs uppercase tracking-wider">{item.label}</span>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Logged Out Login CTA */}
            {!user && (
              <div className="pt-2 border-t border-border/50">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center py-3 rounded-xl border border-border bg-surface2 text-xs font-black uppercase tracking-wider text-fg hover:border-primary/30 transition-all text-center w-full"
                >
                  Sign In to Account
                </Link>
              </div>
            )}
          </div>
        )}
      </SiteContainer>
    </div>
  );
}

export default Navbar;

























