import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import CollegeCard from "../components/CollegeCard";
import SiteContainer from "../components/layout/SiteContainer";
import useSEO from "../hooks/useSEO";
import { ValueSlider, SpeedBookingBoard, FAQAccordion } from "../components/home/InteractiveWidgets";


const motivationTips = [
  {
    title: "A ₹69 call can save you lakhs.",
    text: "One honest conversation can prevent a costly mistake in college choices, branches, or placements.",
    badge: "🔥 Smart Choice",
    tagColor: "text-amber-600 bg-amber-500/10 border-amber-500/25 dark:text-amber-400"
  },
  {
    title: "The best advice is often one call away.",
    text: "Get clarity from someone who already walked the path you're on right now.",
    badge: "⚡ Insider Access",
    tagColor: "text-primary bg-primary/10 border-primary/25 dark:text-primary"
  },
  {
    title: "Don't guess when you can ask a senior.",
    text: "Real guidance beats random internet opinions when the stakes are high.",
    badge: "💡 Verified Experts",
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

// ── Dynamic Slogan Component — Letter-by-Letter Word Reveal ────
const SLOGAN_WORDS = ["guessing.", "overthinking.", "doubting.", "stressing."];

function DynamicSlogan() {
  const [index, setIndex] = useState(0);
  const [key, setKey] = useState(0); // remount trigger for re-animation

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLOGAN_WORDS.length);
      setKey((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const word = SLOGAN_WORDS[index];

  return (
    <span className="inline">
      {/* Static "Stop " — never moves */}
      <span className="text-fg">Stop{" "}</span>
      {/* Animated word — letters cascade in one by one */}
      <span
        key={key}
        className="inline"
        aria-label={word}
      >
        {word.split("").map((char, i) => (
          <span
            key={i}
            className="slogan-letter"
            style={{ animationDelay: `${i * 0.045}s` }}
          >
            {char === "." ? <span className="text-primary">{char}</span> : char}
          </span>
        ))}
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


/* ═══════════════════════════════════════════════════════════════
   HOME COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function Home() {
  const [scrolled, setScrolled] = useState(0);
  const [pulseLoading, setPulseLoading] = useState(true);
  const [activeTip, setActiveTip] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeHubTab, setActiveHubTab] = useState("value");
  const [collegesList, setCollegesList] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({
    collegesCount: 40,
    seniorsCount: 200,
    sessionsCount: 1200
  });

  const stats = useMemo(() => [
    { label: "Active Seniors", numericValue: globalStats.seniorsCount, suffix: "+", icon: "users" },
    { label: "Colleges", numericValue: globalStats.collegesCount, suffix: "+", icon: "campus" },
    { label: "Success Stories", numericValue: globalStats.sessionsCount, suffix: "", displayAs: globalStats.sessionsCount >= 1000 ? `${(globalStats.sessionsCount / 1000).toFixed(1)}k` : undefined, icon: "spark" },
  ], [globalStats]);


  // Mouse parallax for hero orbs
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  // Carousel refs
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
    return [...slicedColleges, ...slicedColleges];
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

  useSEO("Home", "Talk to verified seniors from top Indian colleges for ₹69. Get clarity on college, branch, placements and more.");

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
          collegesCount: res.data.collegesCount || 40,
          seniorsCount: res.data.seniorsCount || 200,
          sessionsCount: res.data.sessionsCount || 1200
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };

    fetchColleges();
    fetchStats();

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

      <main className="bg-bg overflow-x-hidden">
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
            HERO SECTION — Animated Grid + Text Reveal
            ═══════════════════════════════════════════════════════ */}
        <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-20 overflow-hidden bg-bg">
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <SiteContainer className="relative">
            <div ref={heroRevealRef} className="text-center max-w-4xl mx-auto">

              {/* Trust Badge */}
              <div className="scroll-reveal reveal-up inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface/90 px-4 py-2 text-[11px] font-black text-primary uppercase tracking-[0.18em] mb-6 shadow-[0_10px_35px_rgba(37,99,235,0.12)] mx-auto backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_0_4px_rgba(16,185,129,0.14)]" />
                Trusted by 5000+ students
              </div>
              
              {/* Hero Title — Static "Stop" + animated word */}
              <h1 className="scroll-reveal reveal-up stagger-1 heading-display text-4xl sm:text-5xl md:text-7xl lg:text-[92px] font-black text-fg leading-[0.95] tracking-tighter">
                <DynamicSlogan />
                <br />
                <span className="gradient-text-animated inline-block mt-1">
                  <WordReveal text="Ask someone inside." baseDelay={0.4} />
                </span>
              </h1>
              
              <p className="scroll-reveal reveal-up stagger-2 mt-6 text-xl md:text-2xl text-muted max-w-4xl mx-auto leading-tight font-medium tracking-tight">
                1:1 calls with verified seniors for just <span className="text-primary font-black animated-underline revealed">₹69</span>.
              </p>

              {/* Magnetic CTA Buttons */}
              <div className="scroll-reveal reveal-up stagger-3 mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/explore">
                  <Button size="xl" className="relative w-full sm:w-auto overflow-hidden rounded-full px-10 shadow-[0_18px_45px_rgba(37,99,235,0.24)] group hover:-translate-y-1 transition-transform">
                    <span className="relative z-10 flex items-center gap-2">
                      Explore Seniors
                      <LineIcon name="arrow" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] translate-x-[-180%] group-hover:translate-x-[180%] transition-transform duration-700" />
                  </Button>
                </Link>
                <Link to="/become-mentor">
                  <Button variant="secondary" size="xl" className="w-full sm:w-auto rounded-full px-10 hover:-translate-y-1 transition-transform shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                    Become a Senior
                  </Button>
                </Link>
              </div>

              {/* Animated Stats with Counter */}
              <div className="scroll-reveal reveal-up stagger-4 mt-8 flex flex-nowrap overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {stats.map((s, index) => (
                  <div key={s.label} className={`group relative min-w-[220px] flex-shrink-0 flex-grow overflow-hidden rounded-[28px] border border-border/70 bg-gradient-to-br from-surface via-surface/90 to-primary/5 p-5 text-center shadow-[0_20px_70px_-30px_rgba(37,99,235,0.28)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_90px_-35px_rgba(37,99,235,0.32)] sm:min-w-0 scroll-reveal reveal-scale stagger-${index + 5}`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_60%)] opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative z-10">
                      <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white">
                        <LineIcon name={s.icon} className="h-7 w-7" />
                      </div>
                      <div className="text-3xl md:text-4xl font-black text-fg tracking-tighter">
                        <AnimatedCounter target={s.numericValue} suffix={s.suffix} displayAs={s.displayAs} />
                      </div>
                      <div className="mt-2 text-[11px] font-black uppercase tracking-[0.28em] text-muted">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Motivation Tips Card */}
              <div className="scroll-reveal reveal-up stagger-6 mt-8 mx-auto max-w-4xl">
                <div className="rounded-[32px] border border-border/80 bg-surface/75 p-5 md:p-7 shadow-[0_24px_80px_-25px_rgba(37,99,235,0.18)] dark:shadow-[0_24px_80px_-25px_rgba(96,165,250,0.08)] backdrop-blur-xl transition-all duration-300">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2 pb-2">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary/8 to-accent/8 border border-primary/15 dark:border-primary/25 text-xs font-black uppercase tracking-[0.2em] text-primary shadow-sm hover:scale-[1.02] transition-transform select-none mb-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        Why students book
                      </div>
                      <div className="mt-1 text-sm font-semibold text-muted">Short, honest guidance that feels worth way more than ₹69.</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {motivationTips.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          aria-label={`Show tip ${index + 1}`}
                          onClick={() => setActiveTip(index)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${activeTip === index ? "w-6 bg-gradient-to-r from-primary to-accent shadow-soft" : "w-2 bg-muted/40 hover:bg-muted/60"}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Highly Engaging Quote Ticker Card */}
                  <div className="mt-4 relative rounded-3xl bg-gradient-to-br from-primary/8 via-surface to-accent/8 border border-primary/20 p-6 md:p-8 min-h-[170px] flex flex-col justify-between overflow-hidden shadow-inner">
                    
                    <div key={activeTip} className="relative z-10 animate-quote-slide space-y-4">
                      <div>
                        <div className="text-lg md:text-xl font-black text-fg tracking-tight leading-snug">{motivationTips[activeTip].title}</div>
                        <div className="mt-2 text-sm md:text-base text-muted font-medium leading-relaxed">{motivationTips[activeTip].text}</div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-primary/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${motivationTips[activeTip].tagColor}`}>
                            {motivationTips[activeTip].badge}
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface/85 text-muted border border-border/60 text-[10px] font-black uppercase tracking-wider">
                            ⚡️ ₹69 Fixed Price
                          </span>
                        </div>

                        <Link to="/explore">
                          <Button
                            size="sm"
                            className="rounded-full cursor-pointer font-black"
                            iconRight={<svg className="h-3.5 w-3.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>}
                          >
                            Get Clarity Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SiteContainer>
        </section>

        {/* Wave Divider */}
        <WaveDivider color="rgb(var(--surface-2))" />

        {/* ═══════════════════════════════════════════════════════
            COLLEGES CAROUSEL — Scroll Reveal
            ═══════════════════════════════════════════════════════ */}
        <section className="pt-8 pb-16 relative overflow-hidden">
          <SiteContainer>
            <div ref={collegesRevealRef} className="relative overflow-hidden rounded-[40px] border border-white/20 bg-gradient-to-br from-primary/4 via-surface to-accent/4 p-6 shadow-[0_25px_90px_-35px_rgba(37,99,235,0.32)] md:p-10">
              <div className="absolute -inset-10 bg-gradient-to-tr from-primary/5 to-accent/5 rounded-[64px] blur-3xl pointer-events-none opacity-60 section-glow" />
              
              <h2 className="scroll-reveal reveal-up relative z-10 flex justify-center mb-8">
                <span className="inline-flex items-center gap-2.5 px-4.5 py-2.5 rounded-2xl bg-gradient-to-r from-primary/8 via-accent/8 to-primary/8 border border-primary/20 dark:border-primary/30 text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-primary shadow-sm hover:scale-[1.02] transition-transform select-none">
                  <svg className="h-4.5 w-4.5 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-3.163 0-6.194.298-9.132.872V21M3 21h18" />
                  </svg>
                  Featuring Colleges
                </span>
              </h2>
              
              {/* Carousel Container */}
              <div 
                className="scroll-reveal reveal-scale stagger-2 relative z-10 w-full group/slider select-none"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
              >

                <div 
                  ref={sliderRef}
                  className="w-full overflow-x-auto scrollbar-hide py-6 px-4 flex gap-8 cursor-grab active:cursor-grabbing"
                  style={{ scrollBehavior: "auto" }}
                >
                  {collegesLoading ? (
                    <div className="flex gap-6 w-full">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-[280px] sm:w-[320px] h-[340px] rounded-[28px] bg-surface2 animate-pulse flex-shrink-0" />
                      ))}
                    </div>
                  ) : repeatedList.length > 0 ? (
                    repeatedList.map((college, idx) => (
                      <div 
                        key={`${college._id}-${idx}`} 
                        className="w-[280px] sm:w-[320px] flex-shrink-0 transition-transform duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
                      >
                        <CollegeCard college={college} index={idx} />
                      </div>
                    ))
                  ) : (
                    <div className="text-center w-full py-8 text-muted font-semibold">No colleges available</div>
                  )}
                </div>
              </div>

              <div className="scroll-reveal reveal-up stagger-3 mt-8 text-center relative z-10">
                <Link to="/explore" className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary hover:text-accent transition-colors duration-300">
                  View all colleges
                  <LineIcon name="arrow" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </SiteContainer>
        </section>

        {/* Wave Divider */}
        <WaveDivider flip color="rgb(var(--bg))" />

        {/* ═══════════════════════════════════════════════════════
            WHY CLARIOR — Scroll Reveal + 3D Tilt Testimonials
            ═══════════════════════════════════════════════════════ */}
        <section className="py-32 relative">
          {/* Background accent glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none section-glow" />

          <SiteContainer>
            <div ref={featuresRevealRef} className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                <div className="scroll-reveal reveal-left inline-block px-4 py-1.5 rounded-full bg-accent/5 border border-accent/20 text-[10px] font-black text-accent uppercase tracking-widest">The Clarior Edge</div>
                <h2 className="scroll-reveal reveal-left stagger-1 heading-display text-4xl md:text-6xl font-black text-fg leading-tight">
                  Because Every Question <br /> <span className="gradient-text-animated">Deserves an Answer.</span>
                </h2>
                <p className="scroll-reveal reveal-left stagger-2 text-lg text-muted leading-relaxed">
                  Most platforms give you generic advice. We give you a direct line to the people who&apos;ve actually been there. No hidden costs, no long-term commitments.
                </p>
                <div className="space-y-6">
                  {[
                    { t: "Verified Identity", d: "We manually verify every senior's college ID.", i: "shield" },
                    { t: "Fixed Price Fairness", d: "Talk to any senior for the same transparent price of ₹69.", i: "gem" },
                    { t: "Live 1:1 Calls", d: "Get direct, face-to-face clarity with live in-app video calls.", i: "call" },
                  ].map((f, fi) => (
                    <div key={f.t} className={`scroll-reveal reveal-left stagger-${fi + 3} flex gap-4 group`}>
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-surface border border-border text-primary shadow-soft group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <LineIcon name={f.i} />
                      </div>
                      <div>
                        <h4 className="font-bold text-fg">{f.t}</h4>
                        <p className="text-sm text-muted mt-1 leading-relaxed">{f.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonials with 3D perspective */}
              <div className="relative w-full max-w-lg mx-auto scroll-reveal reveal-right">
                {/* Glow behind the slider */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-accent/20 rounded-[48px] blur-3xl pointer-events-none opacity-80 section-glow" />
                
                <div className="relative overflow-hidden rounded-[32px] border border-border/40 shadow-card">
                  <div 
                    className="flex transition-transform duration-700 ease-out"
                    style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
                  >
                    {testimonials.map((t) => (
                      <div key={t.name} className="w-full flex-shrink-0 p-2">
                        <div className={`testimonial-card relative p-7 rounded-[28px] border border-border/50 bg-surface/90 dark:bg-surface/80 backdrop-blur-md shadow-soft hover:shadow-lift h-[260px] flex flex-col justify-between group overflow-hidden ${t.borderGlow}`}>
                          {/* Inner subtle gradient overlay */}
                          <div className={`absolute inset-0 bg-gradient-to-tr ${t.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
                          
                          <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr border text-base font-black uppercase shadow-inner group-hover:scale-110 transition-transform duration-500 ${t.avatarGlow}`}>
                                {t.initials}
                              </div>
                              <div>
                                <div className="font-bold text-fg text-base leading-tight">{t.name}</div>
                                <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-0.5">{t.role}</div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 items-start mt-3">
                              <span className={`text-3xl font-serif leading-none select-none -mt-1 transition-colors duration-500 ${t.quoteColor}`}>&ldquo;</span>
                              <p className="text-[14px] text-fg/80 italic leading-relaxed pt-0.5">
                                {t.quote}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-between items-center pt-3 border-t border-border/20 relative z-10">
                            <div className="flex gap-0.5 text-amber-500 drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]">
                              {[1,2,3,4,5].map(i => <svg key={i} width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                            </div>
                            <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm ${t.badgeGlow}`}>
                              {t.badge}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sliding Navigation Dots */}
                <div className="mt-6 flex justify-center gap-1.5">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTestimonial(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        activeTestimonial === idx 
                          ? "w-6 bg-primary" 
                          : "w-2 bg-muted/40 hover:bg-muted/60"
                      }`}
                    />
                  ))}
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
        <section id="pricing" className="scroll-mt-28 py-24 bg-gradient-to-b from-bg to-surface2 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

          <SiteContainer className="relative">
            <div ref={pricingRevealRef}>
              <div className="mx-auto max-w-3xl text-center">
                <div className="scroll-reveal reveal-up text-[10px] font-black uppercase tracking-[0.25em] text-primary">Simple pricing</div>
                <h2 className="scroll-reveal reveal-up stagger-1 mt-4 heading-display text-4xl md:text-6xl font-black text-fg tracking-tight">
                  One clear price. No subscriptions.
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
                      className={`tilt-card p-8 rounded-[24px] bg-surface/95 border border-border/70 shadow-soft backdrop-blur-sm ${
                        plan.isPrimary 
                          ? "animated-border animated-border-active pricing-glow border-primary/30 shadow-lift ring-4 ring-primary/5" 
                          : "animated-border"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-muted">{plan.label}</div>
                        {plan.badge && (
                          <span className="bg-success/10 text-success text-[10px] font-bold px-2 py-1 rounded-lg">
                            {plan.badge}
                          </span>
                        )}
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
            CTA — Particles + Scroll Reveal + Gradient Shimmer
            ═══════════════════════════════════════════════════════ */}
        {/* ═══════════════════════════════════════════════════════
            CLARITY HUB — Risk Slider, Real Live Board & FAQ Accordion
            ═══════════════════════════════════════════════════════ */}
        <section className="py-24 relative overflow-hidden bg-surface-2/40 border-t border-border/10">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          
          <SiteContainer>
            <div className="text-center max-w-xl mx-auto space-y-3 mb-10">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.25em] flex justify-center items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Clarity Hub
              </h2>
              <h2 className="text-3xl font-black text-fg tracking-tight sm:text-5xl leading-tight">
                Start connecting. Stop overthinking.
              </h2>
              <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                Calculate tuition/career risks, view live active slots directly, and get clear answers to build your future.
              </p>
            </div>

            {/* Tab Switchers */}
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
                        ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white border-transparent shadow-md shadow-blue-500/20 scale-[1.02]"
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
      </main>
      <Footer />
    </>
  );
}

export default Home;
