import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function cx(...parts) { return parts.filter(Boolean).join(" "); }

// ── SVG Icons ──────────────────────────────────────────
const IconHome = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconCompass = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
);

const IconSessions = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconDashboard = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);

const IconCalendar = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <line x1="12" y1="14" x2="12" y2="18"/>
  </svg>
);

const IconGuide = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const IconLogin = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);

function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Swipe / Drag gesture state
  const navRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPx, setDragPx] = useState(0);
  const startXRef = useRef(0);

  // Hide on fullscreen/modal pages
  const hideOnPaths = ["/login", "/register", "/session"];
  const shouldHide = hideOnPaths.some(p => location.pathname.startsWith(p));

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
        { to: "/",             label: "Home",         icon: <IconHome /> },
        { to: "/my-bookings",  label: "Sessions",     icon: <IconSessions /> },
        { to: "/senior-slots", label: "Slots",        icon: <IconCalendar /> },
        { to: "/dashboard",    label: "Dashboard",    icon: <IconDashboard /> }
      ];
    }

    return [
      { to: "/",              label: "Home",         icon: <IconHome /> },
      { to: "/explore",       label: "Explore",      icon: <IconCompass /> },
      { to: "/my-bookings",   label: "Sessions",     icon: <IconSessions /> },
      { to: "/dashboard",     label: "Dashboard",    icon: <IconDashboard /> }
    ];
  }, [user]);

  // Find active index for sliding indicator
  const activeIndex = useMemo(() => {
    const idx = navItems.findIndex(item => {
      if (item.to === "/") return location.pathname === "/";
      return location.pathname.startsWith(item.to);
    });
    return idx >= 0 ? idx : 0;
  }, [location.pathname, navItems]);

  // Scroll auto-hide behavior (Slice app behavior)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 40) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY + 10) {
        setIsVisible(false); // Scroll down -> hide
      } else if (currentScrollY < lastScrollY - 10) {
        setIsVisible(true);  // Scroll up -> show
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Touch / Drag Gesture Handlers for center sliding handle
  const handleTouchStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startXRef.current;
    setDragPx(deltaX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    if (!navRef.current) {
      setIsDragging(false);
      setDragPx(0);
      return;
    }

    const containerWidth = navRef.current.clientWidth;
    const colWidth = containerWidth / navItems.length;
    const shiftCols = Math.round(dragPx / colWidth);
    const targetIndex = Math.max(0, Math.min(navItems.length - 1, activeIndex + shiftCols));

    setIsDragging(false);
    setDragPx(0);

    if (targetIndex !== activeIndex) {
      navigate(navItems[targetIndex].to);
    }
  };

  if (shouldHide) return null;

  const numItems = navItems.length;
  const colWidthPct = 100 / numItems;

  return (
    <nav
      className={cx(
        "fixed bottom-4 inset-x-4 z-[90] max-w-md mx-auto md:hidden transition-all duration-300 ease-out gpu-layer select-none",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
      )}
      aria-label="Mobile Floating Dock Navigation"
    >
      {/* Container adapting to Theme Colors (Light & Dark) */}
      <div
        ref={navRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        className="relative rounded-full border border-border/80 bg-surface/95 dark:bg-slate-950/95 dark:border-slate-800 p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden cursor-grab active:cursor-grabbing"
      >
        {/* SLIDEABLE ACTIVE PILL WITH THEME ACCENT GRADIENT */}
        <div
          className={cx(
            "absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-r from-primary to-accent shadow-md shadow-primary/30",
            isDragging ? "transition-none" : "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          )}
          style={{
            left: `calc(${activeIndex * colWidthPct}% + 6px + ${dragPx}px)`,
            width: `calc(${colWidthPct}% - 12px)`,
          }}
        >
          {/* Subtle center drag handle indicator */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-white/40" />
        </div>

        {/* Tab Items */}
        <div className="relative z-10 flex items-center justify-between pointer-events-auto">
          {navItems.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cx(
                  "flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-full transition-all duration-200 cursor-pointer active:scale-90 select-none",
                  isActive 
                    ? "text-white font-black" 
                    : "text-muted hover:text-fg dark:text-slate-400 dark:hover:text-slate-200 font-bold"
                )}
              >
                <span className={cx(
                  "flex items-center justify-center transition-transform duration-300",
                  isActive ? "scale-110 text-white" : "scale-100 text-muted dark:text-slate-400"
                )}>
                  {item.icon}
                </span>
                <span className="text-[10px] tracking-wide leading-none uppercase">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default MobileBottomNav;
