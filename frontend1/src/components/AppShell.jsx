import { useMemo, useState, useEffect } from "react";

function SunIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import SiteContainer from "./layout/SiteContainer";
import { Logo } from "./layout/icons";
import { useTheme } from "../context/ThemeContext";

function cx(...parts) { return parts.filter(Boolean).join(" "); }

function IconDashboard() {
  return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
}
function IconSessions() {
  return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function IconSeniors() {
  return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}
function IconCredits() {
  return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
}
function IconCalendar() {
  return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function IconLogout() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
function IconProfile() {
  return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

function NavItem({ to, label, icon, active }) {
  return (
    <Link
      to={to}
      className={cx(
        "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
        active
          ? "bg-primary/20 text-primary shadow-sm"
          : "text-muted hover:bg-surface2 hover:text-fg"
      )}
    >
      <span className={cx(
        "flex h-8 w-8 items-center justify-center rounded-xl transition-colors flex-shrink-0",
        active ? "bg-primary/25 text-primary" : "bg-surface2 text-muted"
      )}>
        {icon}
      </span>
      <span>{label}</span>
      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
    </Link>
  );
}

function AppShell({ title, subtitle, children }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle: toggleDark } = useTheme();
  const dark = theme === "dark";
  const location = useLocation();

  const nav = useMemo(() => {
    const items = [
      { to: "/profile",      label: "Profile",      icon: <IconProfile /> },
      { to: "/dashboard",    label: "Dashboard",    icon: <IconDashboard /> },
      { to: "/bookings",     label: "Sessions",     icon: <IconSessions /> },
    ];
    if (user?.role === "student") {
      items.push({ to: "/explore",      label: "Seniors",      icon: <IconSeniors /> });
      items.push({ to: "/buy-credits",  label: "Credits",      icon: <IconCredits /> });
    }
    if (user?.role === "senior") {
      items.push({ to: "/availability", label: "Availability", icon: <IconCalendar /> });
    }
    return items;
  }, [user?.role]);

  const handleLogout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (_) {}
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  const initials = user?.name?.trim()?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "C";

  return (
    <div className="min-h-screen bg-bg text-fg">
      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border/70 lg:bg-surface lg:">
        {/* Top gradient accent */}
        <div className="h-[5px] w-full bg-primary" />

        <div className="flex h-full flex-col justify-between px-4 py-5">
          {/* Logo */}
          <div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 rounded-2xl px-2 py-1.5 hover:bg-surface2 transition w-full text-left"
            >
              <Logo size="sidebar" />
              <span className="font-extrabold text-lg text-fg" style={{ fontFamily: "'Playfair Display', serif" }}>Clarior</span>
            </button>

            {/* Nav items */}
            <nav className="mt-6 space-y-1">
              {nav.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  active={location.pathname === item.to}
                />
              ))}
            </nav>
          </div>

          {/* User card + logout */}
          <div className="rounded-2xl border border-border bg-surface2/80 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-br from-primary/15 via-accent/15 to-primary/10 text-xs font-bold uppercase tracking-wide text-primary shadow-sm">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-fg">{user?.name}</div>
                <div className="flex items-center justify-between gap-1.5 mt-0.5">
                  <span className="text-xs capitalize text-muted">{user?.role}</span>
                  {user?.role === "student" && (
                    <span className="text-[10px] font-black text-success bg-success/10 border border-success/25 rounded-md px-1.5 py-0.5 uppercase tracking-wide">
                      {user?.callCredits ?? 0} Cr
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-muted transition hover:bg-surface2 hover:text-fg"
            >
              <IconLogout />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────── */}
      <main className="min-h-screen lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface  px-4 py-3 lg:hidden">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <Logo size="navbar" />
            <span className="font-extrabold text-base text-fg" style={{ fontFamily: "'Playfair Display', serif" }}>Clarior</span>
          </button>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xs text-muted px-3 py-1.5 rounded-full border border-border hover:bg-surface2">Home</Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-muted px-3 py-1.5 rounded-full border border-border hover:bg-surface2"
            >
              <IconLogout />
              Logout
            </button>
          </div>
        </div>

        <div className="min-h-screen bg-bg pb-20 lg:pb-0">
          <SiteContainer className="py-6 lg:py-8">
            {(title || subtitle) && (
              <div className="mb-8 rounded-2xl border border-border/70 bg-surface p-5 shadow-soft ">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    {title && <h1 className="text-2xl font-extrabold tracking-tight text-fg" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</h1>}
                    {subtitle && <p className="mt-1.5 max-w-3xl text-sm text-muted">{subtitle}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to="/" className="inline-flex rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition hover:bg-surface2">
                      Home
                    </Link>
                    <button 
                      type="button"
                      onClick={toggleDark}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-fg hover:bg-surface2 transition-all shadow-sm"
                      title="Toggle dark mode"
                      aria-label="Toggle dark mode"
                    >
                      {dark ? <SunIcon /> : <MoonIcon />}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {children}
          </SiteContainer>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 backdrop-blur-md px-3 py-2 shadow-lift lg:hidden" aria-label="Primary">
          <div className="mx-auto grid max-w-md gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(nav.length, 4)}, minmax(0, 1fr))` }}>
            {nav.slice(0, 4).map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cx(
                    "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold transition",
                    active ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface2 hover:text-fg"
                  )}
                >
                  {item.icon}
                  <span className="leading-none">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
}

export default AppShell;
