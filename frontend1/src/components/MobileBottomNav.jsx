import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function cx(...parts) { return parts.filter(Boolean).join(" "); }

// ── SVG Icons ──────────────────────────────────────────
const IconHome = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconCompass = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
);

const IconSessions = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconProfile = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconDashboard = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);

const IconCalendar = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <line x1="12" y1="14" x2="12" y2="18"/>
    <line x1="10" y1="16" x2="14" y2="16"/>
  </svg>
);

const IconGuide = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const IconLogin = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);

function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  // Pages where mobile bottom nav should be completely hidden (e.g. fullscreen video rooms, auth forms)
  const hideOnPaths = ["/login", "/register", "/session"];
  const shouldHide = hideOnPaths.some(p => location.pathname.startsWith(p));
  if (shouldHide) return null;

  // Build items based on user authentication state and role
  const navItems = useMemo(() => {
    if (!user) {
      return [
        { to: "/",              label: "Home",         icon: <IconHome /> },
        { to: "/explore",       label: "Explore",      icon: <IconCompass /> },
        { to: "/how-it-works",  label: "Guide",        icon: <IconGuide /> },
        { to: "/login",         label: "Login",        icon: <IconLogin /> }
      ];
    }

    if (user.role === "senior") {
      return [
        { to: "/dashboard",    label: "Dashboard",    icon: <IconDashboard /> },
        { to: "/bookings",     label: "Sessions",     icon: <IconSessions /> },
        { to: "/availability", label: "Availability", icon: <IconCalendar /> },
        { to: "/profile",      label: "Profile",      icon: <IconProfile /> }
      ];
    }

    // Default for students
    return [
      { to: "/",              label: "Home",         icon: <IconHome /> },
      { to: "/explore",       label: "Explore",      icon: <IconCompass /> },
      { to: "/bookings",      label: "Sessions",     icon: <IconSessions /> },
      { to: "/profile",       label: "Profile",      icon: <IconProfile /> }
    ];
  }, [user]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[60] border-t border-border/80 bg-surface/85 backdrop-blur-lg px-4 py-2.5 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] md:hidden transition-all duration-300" aria-label="Mobile Navigation">
      <div className="mx-auto flex items-center justify-around max-w-md">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cx(
                "flex flex-col items-center justify-center gap-1.5 rounded-2xl py-1 px-3 text-[10px] font-extrabold tracking-wide uppercase transition-all duration-200 relative min-w-[64px]",
                isActive 
                  ? "text-primary scale-105" 
                  : "text-muted hover:text-fg"
              )}
            >
              <span className={cx(
                "flex items-center justify-center transition-colors duration-200",
                isActive ? "text-primary" : "text-muted"
              )}>
                {item.icon}
              </span>
              <span className="leading-none text-[9px] font-black">{item.label}</span>
              
              {/* Premium active dot indicator */}
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-3 rounded-full bg-gradient-to-r from-primary to-accent animate-scale-in" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
