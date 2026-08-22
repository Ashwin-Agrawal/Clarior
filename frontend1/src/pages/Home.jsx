import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import CollegeCard from "../components/CollegeCard";
import SiteContainer from "../components/layout/SiteContainer";
import useSEO from "../hooks/useSEO";
import { ValueSlider, SpeedBookingBoard, FAQAccordion } from "../components/home/InteractiveWidgets";

function CollegeMarqueeCard({ college }) {
  const navigate = useNavigate();
  const { _id, name, type, image, city, state, seniorCount = 0, slug } = college || {};
  const targetId = _id || slug || encodeURIComponent(name || "");

  const getTypeBadgeStyles = (t) => {
    switch (t?.toLowerCase()) {
      case "government":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400";
      case "private":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400";
      case "new-gen":
      case "new gen":
        return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400";
      default:
        return "bg-surface2 text-muted border-border/50";
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/college/${targetId}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/college/${targetId}`);
        }
      }}
      className="group shrink-0 w-72 md:w-80 p-3.5 rounded-2xl border border-border/70 bg-surface/90 hover:bg-surface hover:border-primary/40 backdrop-blur-md transition-all duration-300 cursor-pointer shadow-card hover:shadow-lift hover:-translate-y-1 flex items-center gap-3.5 select-none"
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface2 border border-border/50 shrink-0 relative flex items-center justify-center">
        {image ? (
          <img
            src={image}
            alt={name || "College"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
              if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <span
          className="font-black text-primary text-sm flex items-center justify-center"
          style={{ display: image ? "none" : "flex" }}
        >
          {name ? name.substring(0, 2).toUpperCase() : "CL"}
        </span>
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="font-bold text-fg text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
          {name}
        </h3>

        <div className="flex items-center gap-2 text-[11px] text-muted font-medium">
          {(city || state) && (
            <span className="truncate flex items-center gap-1">
              <svg className="w-3 h-3 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {[city, state].filter(Boolean).join(", ")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          {type && (
            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${getTypeBadgeStyles(type)}`}>
              {type}
            </span>
          )}
          {seniorCount > 0 && (
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
              {seniorCount} Senior{seniorCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}



const motivationTips = [
  {
    title: "A ₹69 call can save you lakhs.",
    text: "One honest conversation can prevent a costly mistake in college choices, branches, or placements.",
    badge: "Smart Choice",
    tagColor: "text-amber-600 bg-amber-500/10 border-amber-500/25 dark:text-amber-400"
  },
  {
    title: "The best advice is often one call away.",
    text: "Get clarity from someone who already walked the path you're on right now.",
    badge: "Insider Access",
    tagColor: "text-primary bg-primary/10 border-primary/25 dark:text-primary"
  },
  {
    title: "Don't guess when you can ask a senior.",
    text: "Real guidance beats random internet opinions when the stakes are high.",
    badge: "Verified Experts",
    tagColor: "text-success bg-success/10 border-success/25 dark:text-success"
  },
];

function LineIcon({ name, className = "h-5 w-5" }) {
  const paths = {
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    campus: <><path d="M3 21h18" /><path d="M5 21V9l7-4 7 4v12" /><path d="M9 21v-7h6v7" /><path d="M9 10h.01M15 10h.01" /></>,
    spark: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="M19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8L19 17Z" /></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    gem: <><path d="M6 3h12l4 6-10 12L2 9l4-6Z" /><path d="M2 9h20M8 3l4 18 4-18" /></>,
    call: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  };

  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const testimonials = [
  {
    initials: "AA",
    name: "Ashwin Agrawal",
    role: "Senior at Newton School of Technology",
    quote: "I helped over 50 students choose the right college last year. Clarior makes it so easy to connect with those who really need guidance.",
    badge: "Top Rated Senior",
    glow: "from-blue-500/15 via-emerald-500/5 to-transparent",
    avatarGlow: "from-blue-500/20 via-emerald-400/20 to-blue-500/5 border-blue-500/30 text-blue-600 dark:text-blue-400",
    badgeGlow: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    borderGlow: "hover:border-blue-500/40 hover:shadow-[0_24px_50px_-15px_rgba(59,130,246,0.22)]",
    quoteColor: "text-blue-500/25 group-hover:text-blue-500/45",
  },
  {
    initials: "SC",
    name: "Shagun Chauhan",
    role: "Senior at Newton School of Technology",
    quote: "Talking to juniors and clearing their doubts about CSE vs AI branches is extremely rewarding. Clarior keeps the booking and call flow seamless.",
    badge: "Placement Star",
    glow: "from-purple-500/15 via-pink-500/5 to-transparent",
    avatarGlow: "from-purple-500/20 via-pink-400/20 to-purple-500/5 border-purple-500/30 text-purple-600 dark:text-purple-400",
    badgeGlow: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    borderGlow: "hover:border-purple-500/40 hover:shadow-[0_24px_50px_-15px_rgba(168,85,247,0.22)]",
    quoteColor: "text-purple-500/25 group-hover:text-purple-500/45",
  },
  {
    initials: "SA",
    name: "Satvik Agrawal",
    role: "Senior at Jk lakshmipat university",
    quote: "Juniors often have massive confusion about university placements and CGPA. A quick 1:1 call saves them months of worry.",
    badge: "Popular Mentor",
    glow: "from-amber-500/15 via-orange-500/5 to-transparent",
    avatarGlow: "from-amber-500/20 via-orange-400/20 to-amber-500/5 border-amber-500/30 text-amber-600 dark:text-amber-400",
    badgeGlow: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    borderGlow: "hover:border-amber-500/40 hover:shadow-[0_24px_50px_-15px_rgba(245,158,11,0.22)]",
    quoteColor: "text-amber-500/25 group-hover:text-amber-500/45",
  }
];

/* ═══════════════════════════════════════════════════════════════
   ANIMATION HOOKS & COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

// ── Scroll Reveal Hook ──────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    // Observe the container and all child .scroll-reveal elements
    const elements = node.querySelectorAll(".scroll-reveal");
    elements.forEach((el) => observer.observe(el));
    if (node.classList.contains("scroll-reveal")) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}

// ── Animated Counter Component ──────────────────────────────────
function AnimatedCounter({ target, suffix = "", displayAs, duration = 1800 }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [popped, setPopped] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
        setPopped(true);
        setTimeout(() => setPopped(false), 400);
      }
    };

    requestAnimationFrame(animate);
  }, [started, target, duration]);

  const display = displayAs
    ? (count >= target ? displayAs : count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count))
    : `${count}${suffix}`;

  return (
    <span ref={ref} className={popped ? "counter-pop inline-block" : "inline-block"}>
      {display}
    </span>
  );
}

const SLOGAN_ITEMS = [
  { text: "Overthinking.", gradient: "from-primary via-accent to-indigo-400" },
  { text: "Guessing.",     gradient: "from-violet-500 via-purple-400 to-pink-400" },
  { text: "Stressing.",    gradient: "from-amber-500 via-orange-400 to-rose-400" },
  { text: "Doubting.",     gradient: "from-emerald-500 via-teal-400 to-cyan-400" },
  { text: "Regretting.",   gradient: "from-sky-500 via-blue-400 to-indigo-400" },
];

function DynamicSlogan() {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % SLOGAN_ITEMS.length);
        setAnimating(false);
      }, 350);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const current = SLOGAN_ITEMS[index];

  return (
    <span className="inline-block">
      <span className="text-fg font-black">Stop{" "}</span>
      <span
        className={`inline-block transition-all duration-300 ease-out bg-gradient-to-r ${current.gradient} bg-clip-text text-transparent`}
        style={{
          transform: animating
            ? "translateY(20px) scale(0.92) rotateX(-50deg)"
            : "translateY(0) scale(1) rotateX(0deg)",
          opacity: animating ? 0 : 1,
          filter: animating ? "blur(8px)" : "blur(0px)",
        }}
      >
        {current.text}
      </span>
    </span>
  );
}


// ── Wave Section Divider ────────────────────────────────────────
function WaveDivider({ flip = false, color = "rgb(var(--bg))" }) {
  return (
    <div className="wave-divider" style={{ transform: flip ? "rotate(180deg)" : "none", marginTop: flip ? "-1px" : 0, marginBottom: flip ? 0 : "-1px" }}>
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ height: "60px" }}>
        <path
          d="M0,40 C240,100 480,0 720,50 C960,100 1200,10 1440,60 L1440,100 L0,100 Z"
          style={{ fill: color }}
        />
      </svg>
    </div>
  );
}

// ── Word-by-Word Reveal Component ───────────────────────────────
function WordReveal({ text, className = "", baseDelay = 0 }) {
  const words = text.split(" ");
  return (
    <span className={`word-reveal-container ${className}`}>
      {words.map((word, i) => (
        <span
          key={i}
          className="word-reveal"
          style={{ animationDelay: `${baseDelay + i * 0.09}s` }}
        >
          {word}{i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}

// ── 3D Tilt Handler ─────────────────────────────────────────────
function useTilt3D(intensity = 8) {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -intensity;
    const rotateY = ((x - centerX) / centerX) * intensity;
    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  }, []);

  return { ref, handleMouseMove, handleMouseLeave };
}

// ── Magnetic Button Hook ────────────────────────────────────────
function useMagnetic(strength = 0.3) {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0, 0)";
  }, []);

  return { ref, handleMouseMove, handleMouseLeave };
}


function HolographicGlobeWidget() {
  return (
    <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center select-none">
      {/* Outer ambient glow rings */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/25 via-accent/20 to-purple-500/15 blur-3xl animate-pulse" />
      <div className="absolute inset-4 rounded-full border border-primary/25 animate-spin" style={{ animationDuration: '28s' }} />
      <div className="absolute inset-12 rounded-full border border-dashed border-accent/30 animate-spin" style={{ animationDuration: '40s', animationDirection: 'reverse' }} />

      {/* Central 3D Globe Visual */}
      <div className="relative w-56 h-56 rounded-full bg-gradient-to-br from-primary/15 via-surface to-accent/15 border border-primary/40 shadow-[0_0_90px_rgba(37,99,235,0.3)] flex items-center justify-center overflow-hidden backdrop-blur-2xl">
        {/* Globe Grid lines */}
        <div className="absolute inset-0 rounded-full border border-primary/30 opacity-70" style={{ transform: 'rotateX(65deg)' }} />
        <div className="absolute inset-0 rounded-full border border-accent/30 opacity-70" style={{ transform: 'rotateY(65deg)' }} />
        <div className="absolute inset-4 rounded-full border border-primary/20 opacity-50" />
        
        {/* Pulsing Core */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary via-accent to-indigo-500 opacity-80 blur-md animate-ping" style={{ animationDuration: '2.5s' }} />
        <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent shadow-[0_0_35px_rgba(37,99,235,0.9)] flex items-center justify-center text-white">
          <LineIcon name="call" className="w-8 h-8" />
        </div>
      </div>

      {/* Floating 3D Micro Glass Badges orbiting */}
      <div className="absolute top-2 left-0 animate-float" style={{ animationDuration: '6.5s' }}>
        <div className="rounded-2xl border border-primary/30 bg-surface/90 backdrop-blur-xl px-4 py-2.5 shadow-lift flex items-center gap-2 text-xs font-black text-primary">
          <LineIcon name="gem" className="w-4 h-4 text-primary" />
          ₹69 Flat Pass
        </div>
      </div>

      <div className="absolute top-8 right-0 animate-float" style={{ animationDuration: '8.5s', animationDelay: '-2s' }}>
        <div className="rounded-2xl border border-success/30 bg-surface/90 backdrop-blur-xl px-4 py-2.5 shadow-lift flex items-center gap-2 text-xs font-black text-success">
          <LineIcon name="shield" className="w-4 h-4 text-success" />
          100% Refund
        </div>
      </div>

      <div className="absolute bottom-8 left-2 animate-float" style={{ animationDuration: '7.5s', animationDelay: '-4s' }}>
        <div className="rounded-2xl border border-accent/30 bg-surface/90 backdrop-blur-xl px-4 py-2.5 shadow-lift flex items-center gap-2 text-xs font-black text-accent">
          <LineIcon name="spark" className="w-4 h-4 text-accent" />
          Private In-App Call
        </div>
      </div>

      <div className="absolute bottom-2 right-2 animate-float" style={{ animationDuration: '9.5s', animationDelay: '-1s' }}>
        <div className="rounded-2xl border border-amber-500/30 bg-surface/90 backdrop-blur-xl px-4 py-2.5 shadow-lift flex items-center gap-2 text-xs font-black text-amber-500">
          <LineIcon name="users" className="w-4 h-4 text-amber-500" />
          Verified Insiders
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   HOME COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function Home() {
  const [scrolled, setScrolled] = useState(0);
  const [showDock, setShowDock] = useState(false);
  const [pulseLoading, setPulseLoading] = useState(true);
  const [activeTip, setActiveTip] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeHubTab, setActiveHubTab] = useState("value");
  const [showMoreFeatures, setShowMoreFeatures] = useState(false);
  const [showMoreCompare, setShowMoreCompare] = useState(false);
  const [heroSeniors, setHeroSeniors] = useState([]);
  const [collegesList, setCollegesList] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({
    collegesCount: 6,
    seniorsCount: 353,
    sessionsCount: 10
  });

  const stats = useMemo(() => [
    { label: "Active Seniors", numericValue: globalStats.seniorsCount, suffix: "+", icon: "users" },
    { label: "Colleges", numericValue: globalStats.collegesCount, suffix: globalStats.collegesCount > 6 ? "+" : "", icon: "campus" },
    { label: "Success Stories", numericValue: globalStats.sessionsCount, suffix: "", displayAs: globalStats.sessionsCount >= 1000 ? `${(globalStats.sessionsCount / 1000).toFixed(1)}k` : undefined, icon: "spark" },
  ], [globalStats]);

  const avgSeniorRating = useMemo(() => {
    if (!heroSeniors || heroSeniors.length === 0) return "4.9";
    const sum = heroSeniors.reduce((acc, s) => acc + (s.rating || 5), 0);
    return (sum / heroSeniors.length).toFixed(1);
  }, [heroSeniors]);


  // Mouse parallax for hero orbs
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);





  const sliderRef = useRef(null);
  const requestRef = useRef();
  const speedRef = useRef(1.0);
  const targetSpeedRef = useRef(1.0);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastXRef = useRef(0);

  // Scroll reveal refs for each section
  const heroRevealRef = useScrollReveal();
  const collegesRevealRef = useScrollReveal();
  const featuresRevealRef = useScrollReveal();
  const pricingRevealRef = useScrollReveal();
  const ctaRevealRef = useScrollReveal();

  // 3D tilt for pricing cards
  const tiltPricing1 = useTilt3D(6);
  const tiltPricing2 = useTilt3D(6);

  // Magnetic buttons
  const magneticCTA1 = useMagnetic(0.25);
  const magneticCTA2 = useMagnetic(0.25);

  const slicedColleges = useMemo(() => {
    return collegesList.slice(0, 15);
  }, [collegesList]);

  const repeatedList = useMemo(() => {
    if (slicedColleges.length === 0) return [];
    const base = slicedColleges.length < 6 ? [...slicedColleges, ...slicedColleges, ...slicedColleges] : slicedColleges;
    return [...base, ...base];
  }, [slicedColleges]);

  const repeatedListReverse = useMemo(() => {
    if (slicedColleges.length === 0) return [];
    const reversed = [...slicedColleges].reverse();
    const base = reversed.length < 6 ? [...reversed, ...reversed, ...reversed] : reversed;
    return [...base, ...base];
  }, [slicedColleges]);

  // ── Mouse Parallax for Hero ─────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    };

    const heroEl = heroRef.current;
    if (heroEl) {
      heroEl.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (heroEl) heroEl.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // ── Carousel Drag & Swipe Handlers ──────────────────────────
  const handleMouseDown = (e) => {
    isMouseDownRef.current = true;
    targetSpeedRef.current = 0;
    velocityRef.current = 0;
    startXRef.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftRef.current = sliderRef.current.scrollLeft;
    lastXRef.current = e.pageX;
    lastTimeRef.current = performance.now();
  };

  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current) return;
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.35;
    sliderRef.current.scrollLeft = scrollLeftRef.current - walk;

    const now = performance.now();
    const dt = now - lastTimeRef.current;
    const dx = e.pageX - lastXRef.current;
    if (dt > 0) {
      velocityRef.current = -dx / dt * 16;
    }
    lastXRef.current = e.pageX;
    lastTimeRef.current = now;
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    targetSpeedRef.current = 1.0;
  };

  const handleMouseEnter = () => {
    targetSpeedRef.current = 0;
  };

  const handleMouseLeave = () => {
    isMouseDownRef.current = false;
    targetSpeedRef.current = 1.0;
  };

  const handleTouchStart = (e) => {
    if (window.innerWidth < 768) return; // Disable custom touch tracking on mobile
    isMouseDownRef.current = true;
    targetSpeedRef.current = 0;
    velocityRef.current = 0;
    const touch = e.touches[0];
    startXRef.current = touch.pageX - sliderRef.current.offsetLeft;
    scrollLeftRef.current = sliderRef.current.scrollLeft;
    lastXRef.current = touch.pageX;
    lastTimeRef.current = performance.now();
  };

  const handleTouchMove = (e) => {
    if (window.innerWidth < 768) return; // Disable custom touch tracking on mobile
    if (!isMouseDownRef.current) return;
    const touch = e.touches[0];
    const x = touch.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.35;
    sliderRef.current.scrollLeft = scrollLeftRef.current - walk;

    const now = performance.now();
    const dt = now - lastTimeRef.current;
    const dx = touch.pageX - lastXRef.current;
    if (dt > 0) {
      velocityRef.current = -dx / dt * 16;
    }
    lastXRef.current = touch.pageX;
    lastTimeRef.current = now;
  };

  // ── Physics-based carousel ticker ───────────────────────────
  useEffect(() => {
    if (collegesLoading || repeatedList.length === 0) return;

    const container = sliderRef.current;
    if (!container) return;

    // Check if device is mobile - if so, skip auto-scrolling ticker loop
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const animate = () => {
      if (!container) return;

      const easing = 0.085;
      speedRef.current += (targetSpeedRef.current - speedRef.current) * easing;

      if (!isMouseDownRef.current) {
        if (Math.abs(velocityRef.current) > 0.05) {
          velocityRef.current *= 0.952;
          container.scrollLeft += velocityRef.current;
        } else {
          container.scrollLeft += speedRef.current;
        }
      }

      const halfWidth = container.scrollWidth / 2;
      if (container.scrollLeft >= halfWidth) {
        container.scrollLeft -= halfWidth;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += halfWidth;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [collegesLoading, repeatedList]);

  useSEO("Talk to Verified College Seniors | 1:1 College & Branch Guidance", "Talk to verified college seniors for 1:1 admission, branch, and career guidance. Explore top colleges, get honest student reviews, and clear your doubts.");

  useEffect(() => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How can I talk to verified college seniors for 1:1 guidance?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Browse the explore directory, select a verified senior studying your target branch or college, choose an available time slot, and book a 1:1 private call for personalized advice."
          }
        },
        {
          "@type": "Question",
          "name": "Can I get honest advice on college placements, branches, and campus life?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! All mentors on Clarior are verified current students or recent alumni who provide authentic, unbiased insights on placement reality, branch workload, and campus culture."
          }
        },
        {
          "@type": "Question",
          "name": "How much does a 1:1 student mentorship call cost?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "1:1 sessions start at just ₹69 for a 20-minute call, making direct senior mentorship affordable for every student."
          }
        }
      ]
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "json-ld-faq";
    script.text = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById("json-ld-faq");
      if (existing) existing.remove();
    };
  }, []);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setCollegesLoading(true);
        const res = await api.get("/colleges");
        setCollegesList(res.data.colleges || []);
      } catch (err) {
        console.error("Failed to load colleges for carousel", err);
      } finally {
        setCollegesLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await api.get("/colleges/stats");
        setGlobalStats({
          collegesCount: res.data.collegesCount || 6,
          seniorsCount: res.data.seniorsCount || 353,
          sessionsCount: res.data.sessionsCount || 10
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };

    const fetchSeniors = async () => {
      try {
        const res = await api.get("/users/seniors");
        setHeroSeniors(res.data.seniors || []);
      } catch (err) {
        console.error("Failed to load seniors for hero", err);
      }
    };

    fetchColleges();
    fetchStats();
    fetchSeniors();

    const timer = setTimeout(() => {
      setPulseLoading(false);
    }, 1500);

    const tipTimer = window.setInterval(() => {
      setActiveTip((prev) => (prev + 1) % motivationTips.length);
    }, 4200);

    const testimonialTimer = window.setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4500);

    const handleScroll = () => {
      const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setScrolled(Math.min(progress, 1));
      setShowDock(window.scrollY > 450);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.clearInterval(tipTimer);
      window.clearInterval(testimonialTimer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  return (
    <>
      <Navbar />

      {/* Grain texture overlay for premium depth */}
      <div className="grain-overlay" aria-hidden="true" />

      <main className="hero-bg-light overflow-x-hidden">
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-[3px] z-[60] pointer-events-none">
          <div 
            className={`h-full bg-primary origin-left ${pulseLoading ? "animate-pulse-width bg-gradient-to-r from-primary via-accent to-primary" : "transition-transform duration-150"}`} 
            style={{ 
              transform: pulseLoading ? 'scaleX(1)' : `scaleX(${scrolled})`,
              width: pulseLoading ? '100%' : 'auto'
            }} 
          />
        </div>

        {/* ═══════════════════════════════════════════════════════
            HERO SECTION — Sticky 3D Redesign
            ═══════════════════════════════════════════════════════ */}
        <section ref={heroRef} className="sticky top-0 z-0 min-h-[88vh] flex items-center justify-center pt-10 sm:pt-20 pb-24 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Dynamic background ambient glows & animated light mesh */}
          <div 
            className="absolute top-1/4 left-1/4 h-[550px] w-[550px] rounded-full bg-gradient-to-br from-primary/20 via-accent/15 to-purple-500/10 blur-[150px] pointer-events-none transition-transform duration-500 ease-out animate-pulse" 
            style={{
              transform: `translate(${mousePos.x * 45}px, ${mousePos.y * 45}px)`
            }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-purple-500/15 via-accent/10 to-indigo-500/10 blur-[130px] pointer-events-none transition-transform duration-500 ease-out animate-pulse" 
            style={{
              transform: `translate(${mousePos.x * -45}px, ${mousePos.y * -45}px)`
            }}
          />
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

          <SiteContainer className="relative z-10">
            <div ref={heroRevealRef} className="max-w-7xl mx-auto space-y-16">
              
              {/* Hero Grid */}
              <div className="grid lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Column: Headline & Actions */}
                <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start">
                  
                  {/* Glowing Holographic Badge */}
                  <div className="scroll-reveal reveal-up inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-surface/90 backdrop-blur-xl px-4 py-2 text-xs font-black text-primary uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                    </span>
                    Direct 1:1 Senior Advice • ₹69 Pass
                  </div>
                  
                  {/* Main Title with Gorgeous 3D Dynamic Word Rotator */}
                  <h1 className="scroll-reveal reveal-up stagger-1 heading-display text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-black text-fg leading-[0.96] tracking-tight">
                    <DynamicSlogan /> <br />
                    <span className="gradient-text-animated inline-block mt-2">
                      <WordReveal text="Talk to someone inside." baseDelay={0.2} />
                    </span>
                  </h1>
                  
                  {/* Subtext */}
                  <p className="scroll-reveal reveal-up stagger-2 mt-6 text-base sm:text-xl text-muted font-medium leading-relaxed max-w-xl">
                    Connect face-to-face with verified college seniors for 100% authentic, unsponsored advice on branches, campus life & real placements.
                  </p>

                  {/* Call-to-Action Buttons */}
                  <div className="scroll-reveal reveal-up stagger-3 mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full">
                    <Link to="/explore" className="w-full sm:w-auto">
                      <button className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary via-blue-600 to-accent text-white font-black text-sm shadow-[0_10px_40px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_50px_rgba(37,99,235,0.6)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <span className="relative z-10 flex items-center gap-2">
                          Find My Mentor — ₹69
                          <LineIcon name="arrow" className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </button>
                    </Link>
                    <Link to="/become-mentor" className="w-full sm:w-auto">
                      <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border border-border/80 bg-surface/80 backdrop-blur-md font-bold text-sm text-fg hover:border-primary/40 hover:bg-primary/5 transition-all">
                        Become a Senior & Earn
                      </button>
                    </Link>
                  </div>

                  {/* Dynamic Senior Avatar Stack */}
                  <div className="scroll-reveal reveal-up stagger-4 mt-8 flex items-center gap-3 bg-surface/60 border border-border/50 rounded-2xl p-2.5 px-4 backdrop-blur-md">
                    <div className="avatar-stack">
                      {heroSeniors.length > 0 ? (
                        heroSeniors.slice(0, 4).map((s, idx) => {
                          const initials = s.name
                            ? s.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
                            : "S";
                          return (
                            <div key={s._id || idx} className="avatar-item" title={s.name}>
                              {initials}
                            </div>
                          );
                        })
                      ) : (
                        <>
                          <div className="avatar-item">AA</div>
                          <div className="avatar-item">SC</div>
                          <div className="avatar-item">SA</div>
                        </>
                      )}
                      <div className="avatar-item font-black">+</div>
                    </div>
                    <div className="text-left">
                      <div className="flex gap-0.5 text-amber-500 mb-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <svg key={i} width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-[11px] font-extrabold text-fg">
                        {avgSeniorRating} Rating • {globalStats.seniorsCount}+ Active Campus Mentors
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Holographic Globe Visual */}
                <div className="lg:col-span-5 relative flex items-center justify-center">
                  <HolographicGlobeWidget />
                </div>

              </div>
            </div>
          </SiteContainer>
        </section>

        {/* ═══════════════════════════════════════════════════════
            OVERLAPPING SCROLL SHEET — Covers Hero as user scrolls down
            ═══════════════════════════════════════════════════════ */}
        <div className="relative z-10 bg-bg rounded-t-[44px] shadow-[0_-25px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_-25px_60px_rgba(0,0,0,0.6)] border-t border-border/60">
          
          {/* Content inside the overlapping sheet */}
          <SiteContainer className="pt-12 pb-16">
            <div className="max-w-7xl mx-auto space-y-16">
              
              {/* Platform Metrics Bar */}
              <div className="scroll-reveal reveal-up grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="group rounded-3xl border border-border/70 bg-surface/90 backdrop-blur-md p-6 shadow-card hover:border-primary/40 hover:shadow-lift transition-all duration-300 flex items-center gap-4 relative overflow-hidden"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 border border-primary/25 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <LineIcon name={s.icon} className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-3xl font-black text-fg tracking-tight">
                        <AnimatedCounter target={s.numericValue} suffix={s.suffix} displayAs={s.displayAs} />
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wider text-muted mt-0.5">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bento Grid — Why Students Choose Clarior */}
              <div className="scroll-reveal reveal-up space-y-6 pt-6">
                <div className="text-center max-w-lg mx-auto space-y-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-black uppercase tracking-widest text-primary">
                    Guaranteed Transparency
                  </div>
                  <h2 className="heading-display text-3xl md:text-4xl font-black text-fg">Built Different By Design</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pillar 1 */}
                  <div className="group rounded-3xl border border-border/70 bg-surface p-7 space-y-4 shadow-card hover:border-primary/40 hover:shadow-lift transition-all duration-300 relative overflow-hidden">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/25 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <LineIcon name="shield" className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-fg text-lg">100% Unbiased Advice</h3>
                    <p className="text-xs text-muted font-semibold leading-relaxed">
                      Mentors earn flat per-session payouts, never per admission. Zero commission means zero reason to push any specific college or branch.
                    </p>
                  </div>

                  {/* Pillar 2 */}
                  <div className="group rounded-3xl border border-border/70 bg-surface p-7 space-y-4 shadow-card hover:border-accent/40 hover:shadow-lift transition-all duration-300 relative overflow-hidden">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent border border-accent/25 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <LineIcon name="call" className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-fg text-lg">Encrypted 1:1 In-App Calls</h3>
                    <p className="text-xs text-muted font-semibold leading-relaxed">
                      Sessions run inside our private WebRTC video room. Your phone number, email, and personal contact details are never shared.
                    </p>
                  </div>

                  {/* Pillar 3 */}
                  <div className="group rounded-3xl border border-border/70 bg-surface p-7 space-y-4 shadow-card hover:border-success/40 hover:shadow-lift transition-all duration-300 relative overflow-hidden">
                    <div className="w-12 h-12 rounded-2xl bg-success/10 text-success border border-success/25 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <LineIcon name="gem" className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-fg text-lg">Flat ₹69 Credit Pass</h3>
                    <p className="text-xs text-muted font-semibold leading-relaxed">
                      No ₹50k consulting packages or recurring subscriptions. Pay per 20-min session with an instant refund if your mentor no-shows.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </SiteContainer>

        {/* Wave Divider leading to Colleges Marquee */}
        <WaveDivider color="rgb(var(--surface-2))" />

        {/* Wave Divider */}
        <WaveDivider color="rgb(var(--surface-2))" />

        {/* ═══════════════════════════════════════════════════════
            COLLEGES MARQUEE STRIP — Continuous Scroll
            ═══════════════════════════════════════════════════════ */}
        <section className="pt-10 pb-16 relative overflow-hidden bg-surface/30 border-y border-border/40">
          <SiteContainer>
            <div ref={collegesRevealRef} className="space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="scroll-reveal reveal-up">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs font-black uppercase tracking-widest text-primary mb-3">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-3.163 0-6.194.298-9.132.872V21M3 21h18" />
                    </svg>
                    Participating Campuses
                  </div>
                  <h2 className="heading-display text-3xl sm:text-4xl text-fg">
                    Explore Colleges & Institutions
                  </h2>
                  <p className="text-xs sm:text-sm text-muted font-medium mt-1">
                    Connect with verified seniors across top engineering & academic tracks nationwide.
                  </p>
                </div>
                <div className="scroll-reveal reveal-up shrink-0">
                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-border bg-surface text-xs font-black uppercase tracking-wider text-fg hover:text-primary hover:border-primary/40 transition-all shadow-sm"
                  >
                    View All Colleges ({globalStats.collegesCount || collegesList.length || 6}+)
                    <LineIcon name="arrow" className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Marquee Strip Container */}
              <div className="scroll-reveal reveal-scale relative w-full overflow-hidden mask-marquee py-2 space-y-4">
                {collegesLoading ? (
                  <div className="flex gap-4 overflow-hidden py-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-72 h-20 rounded-2xl bg-surface2 animate-pulse shrink-0" />
                    ))}
                  </div>
                ) : collegesList.length > 0 ? (
                  <>
                    <div className="animate-marquee flex gap-4">
                      {repeatedList.map((college, idx) => (
                        <CollegeMarqueeCard key={`col-top-${college._id || idx}-${idx}`} college={college} />
                      ))}
                    </div>
                    {collegesList.length >= 3 && (
                      <div className="animate-marquee-reverse flex gap-4">
                        {repeatedListReverse.map((college, idx) => (
                          <CollegeMarqueeCard key={`col-bot-${college._id || idx}-${idx}`} college={college} />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted font-semibold text-sm">No colleges available</div>
                )}
              </div>
            </div>
          </SiteContainer>
        </section>

        {/* Wave Divider */}
        <WaveDivider flip color="rgb(var(--bg))" />

        {/* ═══════════════════════════════════════════════════════
            WHY CLARIOR — Bento Box features grid
            ═══════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none section-glow" />

          <SiteContainer>
            <div ref={featuresRevealRef} className="space-y-10 md:space-y-14">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <div className="scroll-reveal reveal-up inline-flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-accent/10 via-primary/8 to-accent/10 border border-accent/25 text-[10px] font-black text-accent uppercase tracking-[0.25em] shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    The Clarior Edge
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                </div>
                <div className="scroll-reveal reveal-up stagger-1">
                  <h2 className="heading-display text-4xl md:text-6xl font-black text-fg leading-tight">
                    Because Every Question <br /> <span className="gradient-text-animated">Deserves an Answer.</span>
                  </h2>
                  {/* Animated section divider line */}
                  <div className="scroll-reveal section-divider-line w-48 mx-auto mt-6" />
                </div>
                <p className="scroll-reveal reveal-up stagger-2 text-lg text-muted leading-relaxed">
                  Most platforms give you generic advice. We give you a direct line to the people who&apos;ve actually been there. No hidden costs, no long-term commitments.
                </p>
              </div>

              {/* Bento Grid */}
              <div className="grid md:grid-cols-3 gap-6 auto-rows-[240px]">
                
                {/* Bento Card 1: Live 1:1 Guided Video Calls (Wide: Col-span-2) */}
                <div className="scroll-reveal reveal-up stagger-3 md:col-span-2 rounded-[32px] border border-border/60 bg-gradient-to-br from-surface to-primary/5 p-7 flex flex-col justify-between shadow-soft hover:shadow-lift hover:border-primary/30 transition-all duration-300 relative overflow-hidden group bento-hover-glow">
                  {/* Corner glow blob */}
                  <div className="absolute -right-8 -bottom-8 h-40 w-40 bg-primary/8 blur-3xl rounded-full group-hover:bg-primary/15 transition-all duration-500" />
                  {/* Top accent bar */}
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-primary/60 via-blue-400/80 to-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex gap-5">
                    <div className="bento-icon-badge h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/15 shadow-sm group-hover:bg-primary/15 group-hover:border-primary/30 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                      <LineIcon name="call" className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-fg">Live 1:1 Video Calls</h3>
                      <p className="text-xs font-semibold text-muted mt-1.5 leading-relaxed">
                        Get face-to-face clarity with live, high-definition video calls hosted securely in our application. No Zoom links required.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2.5 items-center bg-surface2/70 border border-border/40 px-3 py-2 rounded-xl text-[10px] font-black text-muted uppercase tracking-wider">
                      <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      Secure In-App Room Active
                    </div>
                    <span className="bento-metric text-primary border-primary/20 bg-primary/8">&lt; 2 min setup</span>
                  </div>
                </div>

                {/* Bento Card 2: Transparent ₹69 Credits (Small: Col-span-1) */}
                <div className="scroll-reveal reveal-up stagger-4 md:col-span-1 rounded-[32px] border border-border/60 bg-gradient-to-br from-surface to-accent/5 p-7 flex flex-col justify-between shadow-soft hover:shadow-lift hover:border-accent/30 transition-all duration-300 relative overflow-hidden group bento-hover-glow">
                  <div className="absolute -right-8 -bottom-8 h-40 w-40 bg-accent/8 blur-3xl rounded-full group-hover:bg-accent/15 transition-all duration-500" />
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-accent/60 via-sky-400/80 to-accent/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex gap-4">
                    <div className="bento-icon-badge h-14 w-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0 border border-accent/15 shadow-sm group-hover:bg-accent/15 group-hover:border-accent/30 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                      <LineIcon name="gem" className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-fg">₹69 Call Pass</h3>
                      <p className="text-xs font-semibold text-muted mt-1.5 leading-relaxed">
                        Flat pricing for all seniors. No subscription traps, pay as you go.
                      </p>
                    </div>
                  </div>
                  <span className="bento-metric text-accent border-accent/20 bg-accent/8">₹0 hidden fees</span>
                </div>

                {/* Bento Card 3: 100% Manual Verification (Small: Col-span-1) */}
                <div className={`scroll-reveal reveal-up stagger-5 md:col-span-1 rounded-[32px] border border-border/60 bg-gradient-to-br from-surface to-success/5 p-7 flex-col justify-between shadow-soft hover:shadow-lift hover:border-success/30 transition-all duration-300 relative overflow-hidden group bento-hover-glow ${!showMoreFeatures ? "hidden md:flex" : "flex"}`}>
                  <div className="absolute -right-8 -bottom-8 h-40 w-40 bg-success/8 blur-3xl rounded-full group-hover:bg-success/15 transition-all duration-500" />
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-success/60 via-emerald-400/80 to-success/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex gap-4">
                    <div className="bento-icon-badge h-14 w-14 rounded-2xl bg-success/10 text-success flex items-center justify-center shrink-0 border border-success/15 shadow-sm group-hover:bg-success/15 group-hover:border-success/30 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <LineIcon name="shield" className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-fg">Verified Insiders Only</h3>
                      <p className="text-xs font-semibold text-muted mt-1.5 leading-relaxed">
                        Every senior&apos;s identity and college ID are verified manually by our team.
                      </p>
                    </div>
                  </div>
                  <span className="bento-metric text-success border-success/20 bg-success/8">100% ID verified</span>
                </div>

                {/* Bento Card 4: Prep Notes Workspace (Wide: Col-span-2) */}
                <div className={`scroll-reveal reveal-up stagger-6 md:col-span-2 rounded-[32px] border border-border/60 bg-gradient-to-br from-surface to-amber-500/5 p-7 flex-col justify-between shadow-soft hover:shadow-lift hover:border-amber-400/30 transition-all duration-300 relative overflow-hidden group bento-hover-glow ${!showMoreFeatures ? "hidden md:flex" : "flex"}`}>
                  <div className="absolute -right-8 -bottom-8 h-40 w-40 bg-amber-500/8 blur-3xl rounded-full group-hover:bg-amber-500/15 transition-all duration-500" />
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-500/60 via-yellow-400/80 to-amber-500/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex gap-5">
                    <div className="bento-icon-badge h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/15 shadow-sm group-hover:bg-amber-500/15 group-hover:border-amber-400/35 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-fg">Pre-Call Prep Workspace</h3>
                      <p className="text-xs font-semibold text-muted mt-1.5 leading-relaxed">
                        List questions or placement concerns before the call. The senior reviews your notes in advance to make every minute of your session productive.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Zero Wasted Time</span>
                    <span className="bento-metric text-amber-600 dark:text-amber-400 border-amber-400/20 bg-amber-500/8">20 min sessions</span>
                  </div>
                </div>

              </div>

              {/* View More Options Toggle Button for Mobile */}
              <div className="md:hidden flex justify-center mt-6">
                <button
                  type="button"
                  onClick={() => setShowMoreFeatures(!showMoreFeatures)}
                  className="btn-view-more"
                >
                  {showMoreFeatures ? "Show Less" : "View More Options"}
                  <svg className={`h-3.5 w-3.5 transition-transform duration-300 ${showMoreFeatures ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
            </div>
          </SiteContainer>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SOCIAL PROOF & TRUST — Testimonials & Comparison Side-by-Side
            ═══════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-20 bg-surface2/35 border-y border-border/40 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

          <SiteContainer>
            <div className="grid lg:grid-cols-5 gap-10 items-start">
              
              {/* Left Column (2/5 width): Testimonials Slider */}
              <div className="lg:col-span-2 space-y-6 w-full max-w-full overflow-hidden">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/8 via-accent/5 to-primary/8 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest overflow-hidden relative">
                    <span className="shimmer-badge absolute inset-0 pointer-events-none" />
                    <span className="relative z-10 flex items-center gap-1.5">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                      Testimonials
                    </span>
                  </div>
                  <h2 className="heading-display text-2xl md:text-3xl font-black text-fg tracking-tight">
                    What Seniors Say
                  </h2>
                </div>

                <div className="relative w-full max-w-full overflow-hidden">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-primary/5 to-accent/10 rounded-[48px] blur-3xl pointer-events-none opacity-60" />
                  
                  <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-surface shadow-card w-full max-w-full">
                    <div 
                      className="flex transition-transform duration-700 ease-out w-full"
                      style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
                    >
                      {testimonials.map((t) => (
                        <div key={t.name} className="w-full shrink-0 min-w-full max-w-full box-border p-4 sm:p-6 flex flex-col justify-between group min-h-[250px] relative overflow-hidden">
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr border text-sm font-black uppercase shadow-md transition-transform duration-500 ${t.avatarGlow}`}>
                                {t.initials}
                              </div>
                              <div>
                                <div className="font-bold text-fg text-sm leading-tight">{t.name}</div>
                                <div className="text-[9px] font-bold text-muted uppercase tracking-wider mt-0.5">{t.role}</div>
                              </div>
                            </div>
                            
                            <p className="text-xs sm:text-sm text-fg/80 leading-relaxed pl-1">
                              {t.quote}
                            </p>
                          </div>
                          
                          <div className="mt-6 flex justify-between items-center pt-3 border-t border-border/20">
                            <div className="flex gap-0.5 text-amber-500 drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]">
                              {[1,2,3,4,5].map(i => <svg key={i} width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                            </div>
                            <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm ${t.badgeGlow}`}>
                              {t.badge}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="mt-5 flex items-center justify-between px-1">
                    <button
                      type="button"
                      onClick={() => setActiveTestimonial(prev => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-fg hover:border-primary/30 active:scale-95 transition-all shadow-sm cursor-pointer"
                      aria-label="Previous Testimonial"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>

                    {/* Navigation Dots */}
                    <div className="flex gap-1.5">
                      {testimonials.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveTestimonial(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            activeTestimonial === idx 
                              ? "w-5 bg-primary" 
                              : "w-1.5 bg-muted/40 hover:bg-muted/60"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTestimonial(prev => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-fg hover:border-primary/30 active:scale-95 transition-all shadow-sm cursor-pointer"
                      aria-label="Next Testimonial"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column (3/5 width): Comparison Matrix */}
              <div className="lg:col-span-3 space-y-6 w-full max-w-full overflow-hidden">
                <div className="space-y-2">
                  <div className="inline-block px-3 py-1 rounded-full bg-success/5 border border-success/20 text-[9px] font-black text-success uppercase tracking-widest">Compare & Decide</div>
                  <h2 className="heading-display text-2xl md:text-3xl font-black text-fg tracking-tight">
                    No Sales Pitch. Just Raw Clarity.
                  </h2>
                </div>

                {/* Desktop & Tablet Matrix View */}
                <div className="hidden md:block rounded-[28px] border border-border/70 bg-surface shadow-card overflow-hidden">
                  <div className="grid grid-cols-3 border-b border-border/80 bg-surface2/80 p-4 text-center font-black text-[10px] uppercase tracking-[0.2em] text-muted">
                    <div className="text-left pl-4">Decision Factor</div>
                    <div className="text-danger/90 flex items-center justify-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-danger inline-block" />
                      Traditional Advice
                    </div>
                    <div className="text-primary flex items-center justify-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                      Clarior Difference
                    </div>
                  </div>

                  {[
                    {
                      factor: "Credibility",
                      traditional: "Sponsored reviews, biased rankings, admission agents.",
                      clarior: "Direct uncensored talk with real students inside campus."
                    },
                    {
                      factor: "Cost & Terms",
                      traditional: "Up to ₹50,000 package trap, non-refundable.",
                      clarior: "Flat ₹69 credit pass per session. Refund if no-show."
                    },
                    {
                      factor: "Incentives",
                      traditional: "Commissions for pushing specific admissions.",
                      clarior: "Seniors have zero commissions or stakes in choice."
                    },
                    {
                      factor: "Time",
                      traditional: "Spam phone calls, sales visits, hours of pitching.",
                      clarior: "Instant 20-min focused check-in. Safe, in-app call."
                    }
                  ].map((row, idx) => (
                    <div key={idx} className="grid grid-cols-3 p-4.5 items-center border-b border-border/30 last:border-0 hover:bg-primary/5 transition-colors duration-200 text-left group">
                      <div className="font-extrabold text-fg text-xs pl-4 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary group-hover:scale-125 transition-all" />
                        {row.factor}
                      </div>
                      <div className="text-xs text-muted font-medium leading-relaxed pr-3 flex items-start gap-2">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-danger/10 shrink-0 mt-0.5">
                          <svg className="h-2.5 w-2.5 text-danger" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                        </span>
                        <span>{row.traditional}</span>
                      </div>
                      <div className="text-xs text-primary font-bold leading-relaxed flex items-start gap-2 bg-primary/5 p-2.5 rounded-xl border border-primary/15">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success/10 shrink-0 mt-0.5">
                          <svg className="h-2.5 w-2.5 text-success" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7"/></svg>
                        </span>
                        <span>{row.clarior}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile View: High-fidelity Comparison Cards */}
                <div className="block md:hidden space-y-3.5 w-full max-w-full overflow-hidden">
                  {[
                    {
                      factor: "Credibility",
                      traditional: "Sponsored reviews, biased rankings, admission agents.",
                      clarior: "Direct uncensored talk with real students inside campus."
                    },
                    {
                      factor: "Cost & Terms",
                      traditional: "Up to ₹50,000 package trap, non-refundable.",
                      clarior: "Flat ₹69 credit pass per session. Refund if no-show."
                    },
                    {
                      factor: "Incentives",
                      traditional: "Commissions for pushing specific admissions.",
                      clarior: "Seniors have zero commissions or stakes in choice."
                    },
                    {
                      factor: "Time",
                      traditional: "Spam phone calls, sales visits, hours of pitching.",
                      clarior: "Instant 20-min focused check-in. Safe, in-app call."
                    }
                  ].map((row, idx) => (
                    <div key={idx} className={`rounded-2xl border border-border/60 bg-surface p-4 space-y-2.5 shadow-sm ${idx >= 2 && !showMoreCompare ? "hidden" : "block"}`}>
                      <div className="flex items-center justify-between border-b border-border/30 pb-2">
                        <span className="text-xs font-black text-fg uppercase tracking-widest">{row.factor}</span>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-primary">Clarior Difference</span>
                      </div>
                      
                      <div className="space-y-2 pt-0.5">
                        <div>
                          <span className="text-[8px] font-black uppercase text-muted tracking-wider block mb-0.5">Traditional Advice</span>
                          <div className="flex items-start gap-2">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-danger/10 shrink-0 mt-0.5">
                              <svg className="h-2.5 w-2.5 text-danger" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                            </span>
                            <p className="text-xs text-muted leading-relaxed font-semibold">{row.traditional}</p>
                          </div>
                        </div>
                        <div>
                          <span className="text-[8px] font-black uppercase text-primary tracking-wider block mb-0.5">Clarior Difference</span>
                          <div className="flex items-start gap-2">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success/10 shrink-0 mt-0.5">
                              <svg className="h-2.5 w-2.5 text-success" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7"/></svg>
                            </span>
                            <p className="text-xs text-fg font-black leading-relaxed">{row.clarior}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Mobile View More Comparisons Button */}
                  <div className="md:hidden flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowMoreCompare(!showMoreCompare)}
                      className="btn-view-more"
                    >
                      {showMoreCompare ? "Show Less" : "View More Comparisons"}
                      <svg className={`h-3.5 w-3.5 transition-transform duration-300 ${showMoreCompare ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </SiteContainer>
        </section>

        {/* Wave Divider */}
        <WaveDivider color="rgb(var(--surface-2))" />

        {/* ═══════════════════════════════════════════════════════
            PRICING — 3D Tilt Cards + Animated Borders + Scroll Reveal
            ═══════════════════════════════════════════════════════ */}
        <section id="pricing" className="scroll-mt-28 py-16 md:py-20 bg-gradient-to-b from-bg to-surface2 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

          <SiteContainer className="relative">
            <div ref={pricingRevealRef}>
              <div className="mx-auto max-w-3xl text-center">
                <div className="scroll-reveal reveal-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/8 via-accent/5 to-primary/8 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.25em] shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Simple pricing
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
                <h2 className="scroll-reveal reveal-up stagger-1 mt-5 heading-display text-4xl md:text-6xl font-black text-fg tracking-tight">
                  One clear price. <span className="gradient-text-animated">No subscriptions.</span>
                </h2>
                <p className="scroll-reveal reveal-up stagger-2 mt-5 text-lg text-muted leading-relaxed">
                  Start with one call or buy a bundle when you want to compare colleges.
                </p>
              </div>
              <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
                {[
                  { 
                    label: "Single Pass", 
                    price: "₹69", 
                    originalPrice: "₹89",
                    badge: "SAVE ₹20",
                    note: "1 credit", 
                    cta: "Start with one call", 
                    variant: "secondary",
                    tilt: tiltPricing1,
                    features: [
                      "20-minute focused 1:1 session", 
                      "Verified senior profiles", 
                      "Premium in-app video calling",
                      "Ask anything about college life"
                    ] 
                  },
                  { 
                    label: "Growth Pack", 
                    price: "₹189", 
                    originalPrice: "₹249",
                    badge: "SAVE ₹60",
                    note: "3 credits", 
                    cta: "Get growth pack", 
                    variant: "primary",
                    tilt: tiltPricing2,
                    isPrimary: true,
                    features: [
                      "3 separate 20-minute sessions", 
                      "Save ₹60 overall compared to original price", 
                      "Compare multiple branches/colleges",
                      "Priority customer & booking support"
                    ] 
                  },
                ].map((plan, pi) => (
                  <div
                    key={plan.label}
                    className={`scroll-reveal reveal-up stagger-${pi + 3}`}
                  >
                    <div
                      ref={plan.tilt.ref}
                      onMouseMove={plan.tilt.handleMouseMove}
                      onMouseLeave={plan.tilt.handleMouseLeave}
                      className={`tilt-card p-8 rounded-[24px] bg-surface border border-border/70 shadow-soft ${
                        plan.isPrimary 
                          ? "animated-border animated-border-active pricing-breath border-primary/30 shadow-lift ring-4 ring-primary/8" 
                          : "animated-border hover:border-border hover:shadow-lift"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-muted">{plan.label}</div>
                        <div className="flex items-center gap-2">
                          {plan.isPrimary && (
                            <span className="flex items-center gap-1 bg-gradient-to-r from-primary to-accent text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                              <span className="popular-arrow">↓</span> Most Popular
                            </span>
                          )}
                          {plan.badge && (
                            <span className="flex items-center gap-1 bg-success/10 text-success text-[10px] font-black px-2.5 py-1 rounded-full border border-success/25 uppercase tracking-wider">
                              <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7"/></svg>
                              {plan.badge}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-5 flex items-baseline gap-2">
                        {plan.originalPrice && (
                          <span className="text-xl line-through text-muted mr-1 font-bold">{plan.originalPrice}</span>
                        )}
                        <span className="text-5xl font-black tracking-tight text-fg">{plan.price}</span>
                        <span className="font-semibold text-muted">/ {plan.note}</span>
                      </div>
                      <div className="mt-6 space-y-3">
                        {plan.features.map((item) => (
                          <div key={item} className="flex items-center gap-3 text-sm font-semibold text-fg">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/10 text-success">
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m5 13 4 4L19 7" /></svg>
                            </span>
                            {item}
                          </div>
                        ))}
                      </div>
                      <Link to="/buy-credits" className="mt-8 block">
                        <Button variant={plan.variant} className="w-full rounded-2xl" size="lg">{plan.cta}</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SiteContainer>
        </section>

        {/* Wave Divider */}
        <WaveDivider flip color="rgb(var(--bg))" />

        {/* ═══════════════════════════════════════════════════════
            CLARITY HUB — Risk Slider, Real Live Board & FAQ Accordion
            ═══════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-20 relative overflow-hidden border-t border-border/40">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          
          <SiteContainer>
            <div className="text-center max-w-xl mx-auto space-y-3 mb-10">
              <p className="text-xs font-black text-primary uppercase tracking-[0.25em] flex justify-center items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Clarity Hub
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              </p>
              <h2 className="text-3xl font-black text-fg tracking-tight sm:text-5xl leading-tight">
                Start connecting. <span className="gradient-text-animated">Stop overthinking.</span>
              </h2>
              <p className="text-sm text-muted max-w-md mx-auto leading-relaxed font-medium">
                Calculate tuition/career risks, view live active slots directly, and get clear answers.
              </p>
            </div>

            {/* Tab Switchers (Clean, Professional, No Emojis) */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex rounded-full bg-surface border border-border p-1.5 shadow-sm max-w-full overflow-x-auto scrollbar-hide">
                {[
                  { id: "value", label: "Regret Calculator" },
                  { id: "live", label: "Live Board" },
                  { id: "faq", label: "Interactive FAQ" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveHubTab(tab.id)}
                    className={`px-6 py-2.5 rounded-full text-xs font-black tracking-wider transition-all duration-300 cursor-pointer uppercase ${
                      activeHubTab === tab.id
                        ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white border-transparent tab-active-glow scale-[1.02]"
                        : "text-muted hover:text-fg"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Widget View */}
            <div className="transition-all duration-500 transform">
              {activeHubTab === "value" && <ValueSlider />}
              {activeHubTab === "live" && <SpeedBookingBoard />}
              {activeHubTab === "faq" && <FAQAccordion />}
            </div>
          </SiteContainer>
        </section>
      </div>

        {/* ═══════════════════════════════════════════════════════
            STICKY QUICK PASS DOCK (Appears on Scroll — Desktop Only)
            ═══════════════════════════════════════════════════════ */}
        <div className={`fixed bottom-6 inset-x-0 z-50 pointer-events-none transition-all duration-500 hidden md:block ${showDock ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <div className="max-w-md mx-auto px-4 pointer-events-auto">
            <div className="rounded-full border border-primary/30 bg-surface/95 p-2 pr-2.5 shadow-[0_20px_50px_rgba(37,99,235,0.22)] backdrop-blur-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 pl-3">
                <span className="flex h-3 w-3 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-success" />
                </span>
                <div>
                  <div className="text-xs font-black text-fg leading-tight">Verified Seniors Active</div>
                  <div className="text-[10px] font-bold text-muted">₹69 Fixed 1:1 Pass</div>
                </div>
              </div>

              <Link to="/explore" className="shrink-0">
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-accent text-white font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  Book Now
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Home;
