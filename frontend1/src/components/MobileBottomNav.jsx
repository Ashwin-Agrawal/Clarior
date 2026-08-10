import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function cx(...parts) { return parts.filter(Boolean).join(" "); }

// ─── Icons ────────────────────────────────────────────────────
const IcHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IcExplore = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
);
const IcSessions = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IcDashboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);
const IcCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/>
  </svg>
);
const IcGuide = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const IcCredits = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const IcMentor = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);
const IcLogin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);
const IcRegister = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/>
  </svg>
);
const IcProfile = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4"/>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
  </svg>
);

// ─── Component ────────────────────────────────────────────────
export default function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible]     = useState(true);
  const lastScrollY = useRef(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging  = useRef(false);

  // Hide on fullscreen pages
  const hideOnPaths = ["/session"];
  const shouldHide  = hideOnPaths.some(p => location.pathname.startsWith(p));

  // Nav items by role
  const navItems = useMemo(() => {
    if (!user) return [
      { to: "/",              label: "Home",     Icon: IcHome },
      { to: "/explore",       label: "Explore",  Icon: IcExplore },
      { to: "/how-it-works",  label: "Guide",    Icon: IcGuide },
      { to: "/become-mentor", label: "Mentor",   Icon: IcMentor },
      { to: "/login",         label: "Sign in",  Icon: IcLogin },
      { to: "/register",      label: "Register", Icon: IcRegister },
    ];
    if (user.role === "senior") return [
      { to: "/",             label: "Home",      Icon: IcHome },
      { to: "/my-bookings",  label: "Sessions",  Icon: IcSessions },
      { to: "/senior-slots", label: "Slots",     Icon: IcCalendar },
      { to: "/dashboard",    label: "Dashboard", Icon: IcDashboard },
      { to: "/profile",      label: "Profile",   Icon: IcProfile },
      { to: "/how-it-works", label: "Guide",     Icon: IcGuide },
    ];
    return [
      { to: "/",              label: "Home",      Icon: IcHome },
      { to: "/explore",       label: "Explore",   Icon: IcExplore },
      { to: "/my-bookings",   label: "Sessions",  Icon: IcSessions },
      { to: "/dashboard",     label: "Dashboard", Icon: IcDashboard },
      { to: "/buy-credits",   label: "Credits",   Icon: IcCredits },
      { to: "/profile",       label: "Profile",   Icon: IcProfile },
      { to: "/become-mentor", label: "Mentor",    Icon: IcMentor },
      { to: "/how-it-works",  label: "Guide",     Icon: IcGuide },
    ];
  }, [user]);

  const N = navItems.length;

  // Sync active index on route change
  useEffect(() => {
    const idx = navItems.findIndex(item =>
      item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to)
    );
    if (idx >= 0) setActiveIndex(idx);
  }, [location.pathname, navItems]);

  // Page scroll auto-hide
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if      (y < 40)                         setIsVisible(true);
      else if (y > lastScrollY.current + 10)   setIsVisible(false);
      else if (y < lastScrollY.current - 10)   setIsVisible(true);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Navigate to index with circular wrap
  const goTo = useCallback((idx) => {
    const wrapped = ((idx % N) + N) % N;
    setActiveIndex(wrapped);
    navigate(navItems[wrapped].to);
  }, [N, navItems, navigate]);

  // Touch gesture handlers
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };
  const onTouchMove = (e) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > 8) isDragging.current = true;
    if (dx > dy && isDragging.current) e.preventDefault();
  };
  const onTouchEnd = (e) => {
    if (!isDragging.current) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      goTo(activeIndex + (dx < 0 ? 1 : -1));
    }
    isDragging.current = false;
  };

  if (shouldHide) return null;

  // How many slots to render around the center
  const VISIBLE = 2; // items on each side of center

  return (
    <nav
      className={cx(
        "fixed bottom-4 inset-x-3 z-[90] max-w-md mx-auto md:hidden gpu-layer select-none",
        "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
      )}
      aria-label="Mobile Navigation Dock"
    >
      {/*
        Container: uses design system tokens only.
        Light mode:  bg = rgb(255 255 255) = white    border = rgb(226 232 240) = slate-200
        Dark mode:   bg = rgb(15 29 51)    = navy     border = rgb(35 57 92)   = navy-700
      */}
      <div
        className="relative overflow-hidden rounded-full border border-border bg-surface shadow-[0_12px_40px_rgba(0,0,0,0.10)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-3xl"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Frosted center spotlight — a soft ring exactly behind the active item */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-11 rounded-full bg-primary/8 dark:bg-primary/12 blur-sm" />
        </div>

        {/* The 3-D carousel track */}
        <div
          className="relative flex items-center justify-center h-[58px] px-4"
          style={{ perspective: "600px" }}
        >
          {Array.from({ length: N }).map((_, rawIdx) => {
            // Calculate offset from active center (-N/2 … +N/2) with circular wrap
            let offset = rawIdx - activeIndex;
            // Wrap to shortest path for smooth circular effect
            if (offset >  N / 2) offset -= N;
            if (offset < -N / 2) offset += N;

            const visible = Math.abs(offset) <= VISIBLE;
            const isActive = offset === 0;

            // Per-offset visual weights
            const absOff = Math.abs(offset);
            const scale   = isActive ? 1.0 : absOff === 1 ? 0.76 : 0.60;
            const rotateY = offset * 30; // degrees
            const tx      = offset * 64; // px horizontal shift
            const opacity = isActive ? 1 : absOff === 1 ? 0.52 : 0.28;
            const zIndex  = 10 - absOff;

            const { to, label, Icon } = navItems[rawIdx];

            return (
              <div
                key={to}
                onClick={() => goTo(rawIdx)}
                aria-hidden={!visible}
                className={cx(
                  "absolute flex flex-col items-center justify-center gap-1 cursor-pointer",
                  "transition-all duration-350 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  !visible && "pointer-events-none"
                )}
                style={{
                  transform: `translateX(${tx}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  transformStyle: "preserve-3d",
                  width: 72,
                }}
              >
                {/* Icon chip */}
                <span
                  className={cx(
                    "flex items-center justify-center w-9 h-7 rounded-xl transition-all duration-300",
                    isActive
                      ? "bg-primary/12 dark:bg-primary/20 text-primary"
                      : "text-muted"
                  )}
                >
                  <Icon />
                </span>

                {/* Label */}
                <span
                  className={cx(
                    "leading-none tracking-tight uppercase transition-all duration-300",
                    isActive
                      ? "text-[10px] font-bold text-primary"
                      : "text-[9px] font-medium text-muted"
                  )}
                >
                  {label}
                </span>

                {/* Active underline pip */}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-[3px] rounded-full bg-primary" />
                )}
              </div>
            );
          })}
        </div>


      </div>
    </nav>
  );
}
