import { useMemo, useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function cx(...parts) { return parts.filter(Boolean).join(" "); }

// ─── High-DPI Ultra-Crisp Icons ──────────────────────────────
const IcHome = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IcExplore = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
);
const IcSessions = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IcDashboard = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);
const IcCalendar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/>
  </svg>
);
const IcGuide = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const IcCredits = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const IcMentor = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);
const IcLogin = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);
const IcProfile = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4"/>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
  </svg>
);

// ─── State-of-the-Art Floating Dock Component ─────────────────
export default function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Hide on fullscreen call/session pages
  const hideOnPaths = ["/session"];
  const shouldHide  = hideOnPaths.some(p => location.pathname.startsWith(p));

  // Curated 4-5 core items per role for maximum ergonomics
  const navItems = useMemo(() => {
    if (!user) return [
      { to: "/",              label: "Home",     Icon: IcHome },
      { to: "/explore",       label: "Colleges", Icon: IcExplore },
      { to: "/how-it-works",  label: "Guide",    Icon: IcGuide },
      { to: "/become-mentor", label: "Mentor",   Icon: IcMentor },
      { to: "/login",         label: "Sign in",  Icon: IcLogin },
    ];
    if (user.role === "senior") return [
      { to: "/",             label: "Home",      Icon: IcHome },
      { to: "/bookings",     label: "Sessions",  Icon: IcSessions },
      { to: "/availability", label: "Slots",     Icon: IcCalendar },
      { to: "/dashboard",    label: "Dashboard", Icon: IcDashboard },
      { to: "/profile",      label: "Profile",   Icon: IcProfile },
    ];
    return [
      { to: "/",              label: "Home",      Icon: IcHome },
      { to: "/explore",       label: "Explore",   Icon: IcExplore },
      { to: "/bookings",      label: "Sessions",  Icon: IcSessions },
      { to: "/buy-credits",   label: "Credits",   Icon: IcCredits },
      { to: "/profile",       label: "Profile",   Icon: IcProfile },
    ];
  }, [user]);

  // Smooth auto-hide on fast scroll down, reveal on scroll up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 30) {
        setIsVisible(true);
      } else if (y > lastScrollY.current + 12) {
        setIsVisible(false);
      } else if (y < lastScrollY.current - 12) {
        setIsVisible(true);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (shouldHide) return null;

  return (
    <nav
      className={cx(
        "fixed bottom-4 inset-x-3 z-[90] max-w-lg mx-auto md:hidden gpu-layer select-none",
        "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}
      aria-label="Mobile Bottom Navigation Bar"
    >
      <div className="relative overflow-hidden rounded-[28px] border border-border/80 bg-surface/92 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.22)] p-1.5">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);

            const { to, label, Icon } = item;

            return (
              <Link
                key={to}
                to={to}
                className={cx(
                  "relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-300 cursor-pointer focus:outline-none no-underline",
                  isActive
                    ? "text-primary font-black scale-[1.03]"
                    : "text-muted hover:text-fg active:scale-95"
                )}
              >
                {/* Active Indicator Glow Background Pill */}
                {isActive && (
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/15 via-accent/10 to-primary/10 border border-primary/25 shadow-xs animate-fadeIn" />
                )}

                {/* Icon */}
                <span className={cx(
                  "relative z-10 transition-transform duration-300",
                  isActive ? "text-primary scale-110" : "group-hover:scale-105"
                )}>
                  <Icon />
                </span>

                {/* Label */}
                <span className={cx(
                  "relative z-10 mt-1 text-[10px] uppercase tracking-wider font-extrabold transition-colors duration-300",
                  isActive ? "text-primary" : "text-muted"
                )}>
                  {label}
                </span>

                {/* Micro Active Dot */}
                {isActive && (
                  <span className="relative z-10 -bottom-0.5 h-1 w-3 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
