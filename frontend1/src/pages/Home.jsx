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

// ── Dynamic Slogan Component — Letter-by-Letter Word Reveal ────
const SLOGAN_WORDS = ["guessing", "overthinking", "doubting", "stressing"];

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
    collegesCount: 6,
    seniorsCount: 353,
    sessionsCount: 10
  });

  const stats = useMemo(() => [
    { label: "Active Seniors", numericValue: globalStats.seniorsCount, suffix: "+", icon: "users" },
    { label: "Colleges", numericValue: globalStats.collegesCount, suffix: globalStats.collegesCount > 6 ? "+" : "", icon: "campus" },
    { label: "Success Stories", numericValue: globalStats.sessionsCount, suffix: "", displayAs: globalStats.sessionsCount >= 1000 ? `${(globalStats.sessionsCount / 1000).toFixed(1)}k` : undefined, icon: "spark" },
  ], [globalStats]);


  // Mouse parallax for hero orbs
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  // Simulator state
  const [tutorialRole, setTutorialRole] = useState("student");
  const [tutorialStep, setTutorialStep] = useState(1);
  const [tutorialAutoplay, setTutorialAutoplay] = useState(true);

  // Simulator autoplay: advance step every 3.8s
  useEffect(() => {
    if (!tutorialAutoplay) return;
    const timer = setTimeout(() => {
      if (tutorialStep >= 4) {
        // After student path completes, switch to senior path
        if (tutorialRole === "student") {
          setTutorialRole("senior");
          setTutorialStep(1);
        } else {
          // After senior path completes, loop back to student step 1
          setTutorialRole("student");
          setTutorialStep(1);
        }
      } else {
        setTutorialStep((prev) => prev + 1);
      }
    }, 3800);
    return () => clearTimeout(timer);
  }, [tutorialStep, tutorialAutoplay, tutorialRole]);

  // Motivation quotes auto-play: rotate quote every 6.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTip((prev) => (prev + 1) % motivationTips.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

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

  useSEO("Home", "Talk to verified seniors from colleges worldwide for ₹69. Get clarity on college, branch, placements and more.");

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
            HERO SECTION — Animated Grid + Text Reveal
            ═══════════════════════════════════════════════════════ */}
        <section ref={heroRef} className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-20 overflow-hidden">
          {/* Grid pattern overlay — matches the hero-bg-light grid but adds hover depth */}
          <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none dark:opacity-40" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Mouse-parallax premium glow blobs */}
          <div 
            className="absolute top-1/4 left-1/4 h-[450px] w-[450px] rounded-full bg-primary/10 dark:bg-primary/5 blur-[120px] pointer-events-none transition-transform duration-300 ease-out" 
            style={{
              transform: `translate(${mousePos.x * 45}px, ${mousePos.y * 45}px)`
            }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/8 dark:bg-accent/5 blur-[100px] pointer-events-none transition-transform duration-300 ease-out" 
            style={{
              transform: `translate(${mousePos.x * -45}px, ${mousePos.y * -45}px)`
            }}
          />
          <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-accent/8 dark:bg-accent/3 blur-[120px] pointer-events-none" />

          <SiteContainer className="relative">
            <div ref={heroRevealRef} className="max-w-7xl mx-auto space-y-16">
              
              {/* Top Row: Split grid for headline & mockup preview */}
              <div className="grid lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Column: Headline and Actions */}
                <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start max-w-3xl mx-auto lg:mx-0">
                  {/* Trust Badge */}
                  <div className="scroll-reveal reveal-up inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface/90 px-4 py-2 text-[11px] font-black text-primary uppercase tracking-[0.18em] mb-6 shadow-[0_10px_35px_rgba(37,99,235,0.12)] backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_0_4px_rgba(16,185,129,0.14)]" />
                    Trusted by 5000+ students
                  </div>
                  
                  {/* Hero Title — Static "Stop" + animated word */}
                  <h1 className="scroll-reveal reveal-up stagger-1 heading-display text-4xl sm:text-5xl md:text-7xl lg:text-[76px] xl:text-[84px] font-black text-fg leading-[0.95] tracking-tighter">
                    <DynamicSlogan />
                    <br />
                    <span className="gradient-text-animated inline-block mt-1">
                      <WordReveal text="Ask someone inside." baseDelay={0.4} />
                    </span>
                  </h1>
                  
                  <p className="scroll-reveal reveal-up stagger-2 mt-6 text-xl md:text-2xl text-muted leading-tight font-medium tracking-tight">
                    1:1 calls with verified seniors for just <span className="text-primary font-black animated-underline revealed">₹69</span>
                  </p>

                  {/* Magnetic CTA Buttons */}
                  <div className="scroll-reveal reveal-up stagger-3 mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <Link to="/explore" className="w-full sm:w-auto">
                      <Button size="xl" className="relative w-full sm:w-auto overflow-hidden rounded-full px-10 shadow-[0_18px_45px_rgba(37,99,235,0.24)] group hover:-translate-y-1 transition-transform">
                        <span className="relative z-10 flex items-center gap-2 justify-center">
                          Explore Seniors
                          <LineIcon name="arrow" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </span>
                        <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] translate-x-[-180%] group-hover:translate-x-[180%] transition-transform duration-700" />
                      </Button>
                    </Link>
                    <Link to="/become-mentor" className="w-full sm:w-auto">
                      <Button variant="secondary" size="xl" className="w-full sm:w-auto rounded-full px-10 hover:-translate-y-1 transition-transform shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                        Become a Senior
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Right Column: Redesigned Premium SaaS Interactive Simulator */}
                <div className="lg:col-span-5 relative flex flex-col items-center justify-center min-h-[600px] w-full mt-12 lg:mt-0 select-none">

                  <style>{`
                    @keyframes floatCard {
                      0%, 100% { transform: translateY(0px) rotate(0deg); }
                      50% { transform: translateY(-8px) rotate(0.5deg); }
                    }
                    @keyframes floatPillSlow {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(-6px); }
                    }
                    @keyframes floatPillReverse {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(6px); }
                    }
                    @keyframes spinCoin {
                      0% { transform: rotateY(0deg) translateY(0); }
                      50% { transform: rotateY(180deg) translateY(-5px); }
                      100% { transform: rotateY(360deg) translateY(0); }
                    }
                    @keyframes barProgress {
                      from { width: 0%; }
                      to { width: 100%; }
                    }
                    @keyframes audioWave {
                      0%, 100% { height: 6px; }
                      50% { height: 26px; }
                    }
                    @keyframes confettiBurst {
                      0%   { transform: translate(0,0) rotate(0deg) scale(1);   opacity: 1; }
                      60%  { opacity: 1; }
                      100% { transform: translate(var(--cx), var(--cy)) rotate(var(--cr)) scale(0.5); opacity: 0; }
                    }
                    @keyframes trophyBounce {
                      0%   { transform: scale(0.3) rotate(-10deg); opacity: 0; }
                      60%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
                      80%  { transform: scale(0.95) rotate(-2deg); }
                      100% { transform: scale(1) rotate(0deg); opacity: 1; }
                    }
                    .custom-simulator-float { animation: floatCard 6s ease-in-out infinite; }
                    .custom-float-pill-1 { animation: floatPillSlow 4.5s ease-in-out infinite; }
                    .custom-float-pill-2 { animation: floatPillReverse 5.2s ease-in-out infinite 0.5s; }
                    .custom-coin-spin { animation: spinCoin 2.5s ease-in-out infinite; }
                    .custom-audio-wave { animation: audioWave 1.2s ease-in-out infinite; }
                    .custom-confetti-burst {
                      position: absolute;
                      top: 50%;
                      left: 50%;
                      animation: confettiBurst var(--cd) cubic-bezier(0.22,1,0.36,1) var(--delay) forwards;
                      pointer-events: none;
                    }
                    .custom-trophy-bounce {
                      animation: trophyBounce 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards;
                    }
                  `}</style>

                  {/* Floating Micro Badge 1 — Top Right */}
                  <div className="custom-float-pill-1 absolute -top-5 -right-3 z-30 hidden sm:flex items-center gap-2 rounded-2xl border border-border bg-surface px-3.5 py-2 text-[10px] font-black text-fg shadow-lg backdrop-blur pointer-events-none">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span>Instant 1:1 Calls · ₹69</span>
                  </div>

                  {/* Floating Micro Badge 2 — Bottom Left */}
                  <div className="custom-float-pill-2 absolute -bottom-4 -left-3 z-30 hidden sm:flex items-center gap-2 rounded-2xl border border-border bg-surface px-3.5 py-2 text-[10px] font-black text-fg shadow-lg backdrop-blur pointer-events-none">
                    <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <span>100% Private & Verified</span>
                  </div>

                  {/* Adaptive Background Ambient Glow */}
                  <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 dark:bg-primary/5 blur-[100px] pointer-events-none" />
                  <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[90px] pointer-events-none" />

                  {/* Main Simulator Card Container */}
                  <div className="custom-simulator-float relative w-full max-w-[430px] rounded-[32px] border border-border bg-surface p-6 shadow-lift overflow-hidden transition-all duration-300">
                    
                    {/* Top Decorative Accent Line */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-emerald-400 absolute top-0 left-0 right-0" />

                    {/* Step 4 Party Popper Confetti overlay */}
                    {tutorialStep === 4 && (() => {
                      const colors = ["#2563eb","#7c3aed","#10b981","#f59e0b","#ec4899","#ef4444","#06b6d4","#f97316"];
                      const particles = Array.from({ length: 36 }, (_, i) => {
                        const angle = (i / 36) * 360;
                        const dist = 125 + (i % 5) * 28;
                        const rad = (angle * Math.PI) / 180;
                        const cx = Math.round(Math.cos(rad) * dist);
                        const cy = Math.round(Math.sin(rad) * dist);
                        const size = 5 + (i % 4) * 3;
                        const isRect = i % 3 === 0;
                        const color = colors[i % colors.length];
                        const dur = (0.7 + (i % 6) * 0.12).toFixed(2);
                        const delay = (i * 0.032).toFixed(3);
                        const rot = `${(i % 2 === 0 ? 1 : -1) * (180 + i * 15)}deg`;
                        return { cx, cy, size, isRect, color, dur, delay, rot };
                      });
                      return (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                          {particles.map((p, idx) => (
                            <span
                              key={idx}
                              className="custom-confetti-burst"
                              style={{
                                width: p.isRect ? `${p.size * 2}px` : `${p.size}px`,
                                height: `${p.size}px`,
                                borderRadius: p.isRect ? '2px' : '50%',
                                backgroundColor: p.color,
                                '--cx': `${p.cx}px`,
                                '--cy': `${p.cy}px`,
                                '--cr': p.rot,
                                '--cd': `${p.dur}s`,
                                '--delay': `${p.delay}s`,
                                marginLeft: `-${p.size / 2}px`,
                                marginTop: `-${p.size / 2}px`,
                              }}
                            />
                          ))}
                        </div>
                      );
                    })()}

                    {/* Top Role Selector Toggle (Student vs Senior) */}
                    <div className="flex p-1 rounded-2xl bg-surface2 border border-border mb-6 relative">
                      <button
                        type="button"
                        onClick={() => {
                          setTutorialRole("student");
                          setTutorialStep(1);
                          setTutorialAutoplay(true);
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                          tutorialRole === "student"
                            ? "bg-surface text-primary border border-border shadow-sm font-black scale-[1.01]"
                            : "text-muted hover:text-fg font-bold"
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                        Student Path
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTutorialRole("senior");
                          setTutorialStep(1);
                          setTutorialAutoplay(true);
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                          tutorialRole === "senior"
                            ? "bg-surface text-primary border border-border shadow-sm font-black scale-[1.01]"
                            : "text-muted hover:text-fg font-bold"
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Senior Path
                      </button>
                    </div>

                    {/* Step Navigation Progress indicators */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                      {[
                        { step: 1, label: tutorialRole === "student" ? "Credits" : "Set Slots" },
                        { step: 2, label: tutorialRole === "student" ? "Explore" : "Get Booked" },
                        { step: 3, label: tutorialRole === "student" ? "1:1 Call" : "Share Info" },
                        { step: 4, label: tutorialRole === "student" ? "Clarity" : "Success" }
                      ].map((s) => (
                        <button
                          key={s.step}
                          type="button"
                          onClick={() => {
                            setTutorialStep(s.step);
                            setTutorialAutoplay(false); // Pause autoplay
                          }}
                          className="flex flex-col items-center gap-1.5 focus:outline-none group cursor-pointer"
                        >
                          <div className={`w-full h-1.5 rounded-full transition-all duration-300 relative overflow-hidden ${
                            tutorialStep >= s.step 
                              ? "bg-primary shadow-[0_0_8px_rgba(37,99,235,0.3)]" 
                              : "bg-surface2 border border-border/50"
                          }`}>
                            {tutorialStep === s.step && tutorialAutoplay && (
                              <span 
                                className="absolute top-0 left-0 h-full bg-violet-500 rounded-full"
                                style={{ animation: 'barProgress 3.8s linear forwards' }}
                              />
                            )}
                          </div>
                          <span className={`text-[10px] uppercase tracking-wider transition-colors ${
                            tutorialStep === s.step 
                              ? "text-primary font-black scale-105" 
                              : "text-muted hover:text-fg font-bold"
                          }`}>
                            {s.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Role Content Switcher Panel */}
                    <div className="min-h-[310px] flex flex-col justify-between text-left">

                      {/* ----------------- STUDENT PATH ----------------- */}
                      {tutorialRole === "student" && (
                        <>
                          {/* Step 1: Wallet Credits */}
                          {tutorialStep === 1 && (
                            <div className="flex-1 flex flex-col justify-between animate-quote-slide">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                  Student / Step 01
                                </span>
                                <h3 className="text-lg font-black text-fg mt-1">Get Session Credits</h3>
                                <p className="text-xs text-muted font-medium mt-1.5 leading-relaxed">Load credits to your wallet. You only use credits for calls you book, with simple refundable options.</p>
                              </div>

                              <div className="my-5 p-4 rounded-2xl border border-border bg-surface2 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                  <div className="custom-coin-spin h-11 w-11 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-sm">
                                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 033 3z" /></svg>
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-black text-muted uppercase tracking-wider">Wallet Balance</div>
                                    <div className="text-base font-black text-fg flex items-center gap-1.5">
                                      10 Credits
                                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">1 Call = 1 Credit</span>
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-black text-success bg-success/10 border border-success/30 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                                  ✓ Added
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setTutorialStep(2);
                                  setTutorialAutoplay(false);
                                }}
                                className="w-full py-3.5 rounded-2xl bg-primary text-primary-fg font-black text-xs uppercase tracking-widest cursor-pointer shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2 group"
                              >
                                Find Seniors next
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                              </button>
                            </div>
                          )}

                          {/* Step 2: Choose Senior */}
                          {tutorialStep === 2 && (
                            <div className="flex-1 flex flex-col justify-between animate-quote-slide">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                  Student / Step 02
                                </span>
                                <h3 className="text-lg font-black text-fg mt-1">Choose Verified Senior</h3>
                                <p className="text-xs text-muted font-medium mt-1.5 leading-relaxed">Filter mentors from engineering, management, and arts colleges across India based on your target branch or queries.</p>
                              </div>

                              {/* Senior profile mockup */}
                              <div className="my-4 p-4 rounded-2xl border border-border bg-surface2 flex gap-3.5 shadow-sm">
                                <div className="relative shrink-0">
                                  <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-black shadow-sm">
                                    VS
                                  </div>
                                  <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-success border-2 border-surface shadow-sm" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-fg flex items-center gap-1">
                                      Verified Senior
                                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    </span>
                                    <span className="text-[10px] font-black text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/20">★ 4.9 (42)</span>
                                  </div>

                                  <div className="flex gap-1.5 mt-2 flex-wrap">
                                    <span className="text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-md">Placement scene</span>
                                    <span className="text-[9px] font-black uppercase bg-success/10 text-success border border-success/20 px-2.5 py-0.5 rounded-md">Branch change</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setTutorialStep(3);
                                  setTutorialAutoplay(false);
                                }}
                                className="w-full py-3.5 rounded-2xl bg-primary text-primary-fg font-black text-xs uppercase tracking-widest cursor-pointer shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2 group"
                              >
                                Join Video Call
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                              </button>
                            </div>
                          )}

                          {/* Step 3: Anonymous In-App Call */}
                          {tutorialStep === 3 && (
                            <div className="flex-1 flex flex-col justify-between animate-quote-slide">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                  Student / Step 03
                                </span>
                                <h3 className="text-lg font-black text-fg mt-1">1:1 Anonymous Video Call</h3>
                                <p className="text-xs text-muted font-medium mt-1.5 leading-relaxed">Ask questions face-to-face in our secure video call framework. No contact numbers or personal IDs are exposed.</p>
                              </div>

                              {/* Interactive Call Panel Mock */}
                              <div className="my-4 p-3.5 rounded-2xl border border-border bg-surface2 flex flex-col items-center justify-center h-[115px] relative overflow-hidden shadow-sm">
                                <div className="flex items-center gap-2 z-10">
                                  <span className="custom-audio-wave w-1 bg-primary rounded-full" style={{ animationDelay: '0.1s' }} />
                                  <span className="custom-audio-wave w-1 bg-accent rounded-full h-4" style={{ animationDelay: '0.3s' }} />
                                  <span className="custom-audio-wave w-1 bg-primary rounded-full h-7" style={{ animationDelay: '0.5s' }} />
                                  <span className="custom-audio-wave w-1 bg-accent rounded-full h-4" style={{ animationDelay: '0.2s' }} />
                                  <span className="custom-audio-wave w-1 bg-primary rounded-full" style={{ animationDelay: '0.4s' }} />
                                </div>
                                <div className="absolute bottom-2.5 left-3.5 text-[9px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-success animate-pulse shadow-sm" />
                                  Encrypted HD Call Connected
                                </div>
                                <div className="absolute bottom-2.5 right-3.5 text-[9px] font-black text-fg bg-surface px-2.5 py-0.5 rounded-md border border-border shadow-xs">
                                  03:45 Min
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setTutorialStep(4);
                                  setTutorialAutoplay(false);
                                }}
                                className="w-full py-3.5 rounded-2xl bg-primary text-primary-fg font-black text-xs uppercase tracking-widest cursor-pointer shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2 group"
                              >
                                Finish Call
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                              </button>
                            </div>
                          )}

                          {/* Step 4: Success Party */}
                          {tutorialStep === 4 && (
                            <div className="flex-1 flex flex-col justify-between animate-quote-slide">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-success flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
                                  Student / Step 04
                                </span>
                                <h3 className="text-lg font-black text-fg mt-1">Clarity Unlocked!</h3>
                                <p className="text-xs text-muted font-medium mt-1.5 leading-relaxed">You now have authentic insider insights, placement facts, and the real perspective to choose your target college path.</p>
                              </div>

                              <div className="my-3 flex flex-col items-center justify-center gap-2">
                                <div className="custom-trophy-bounce h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.4)] relative">
                                  <span className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
                                  <span className="absolute inset-[-6px] rounded-full border-2 border-amber-400/30 animate-[spin_4s_linear_infinite]" />
                                  <svg className="h-8 w-8 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15c-3.314 0-6-2.686-6-6V4h12v5c0 3.314-2.686 6-6 6zm0 0v4m-3 1h6M9 4H5v3c0 1.657 1.343 3 3 3m10-6h-4v3c0 1.657-1.343 3-3 3" />
                                  </svg>
                                </div>
                                <span className="text-[10px] font-black text-warning bg-warning/10 px-3 py-1 rounded-full border border-warning/20 uppercase tracking-widest">
                                  Confidence Level: Unlocked
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTutorialRole("senior");
                                    setTutorialStep(1);
                                    setTutorialAutoplay(true);
                                  }}
                                  className="px-4 py-3.5 rounded-2xl border border-border bg-surface text-fg hover:bg-surface2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                                >
                                  Senior Path
                                </button>
                                <Link to="/explore" className="flex-1">
                                  <button
                                    type="button"
                                    className="w-full py-3.5 rounded-2xl bg-primary text-primary-fg font-black text-xs uppercase tracking-widest cursor-pointer shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2 group"
                                  >
                                    Find Your Senior
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                  </button>
                                </Link>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* ----------------- SENIOR PATH ----------------- */}
                      {tutorialRole === "senior" && (
                        <>
                          {/* Step 1: Set Available Slots */}
                          {tutorialStep === 1 && (
                            <div className="flex-1 flex flex-col justify-between animate-quote-slide">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                  Senior / Step 01
                                </span>
                                <h3 className="text-lg font-black text-fg mt-1">Schedule Available Slots</h3>
                                <p className="text-xs text-muted font-medium mt-1.5 leading-relaxed">Create available time slots on your personalized dashboard that match your study and exam schedule.</p>
                              </div>

                              <div className="my-5 p-4 rounded-2xl border border-border bg-surface2 flex flex-col gap-2.5 shadow-sm">
                                <div className="text-[10px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5">
                                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  Scheduled slots (IST)
                                </div>
                                <div className="flex gap-2">
                                  <span className="px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/10 text-primary text-[10px] font-black shadow-xs flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                    6:30 PM (Today)
                                  </span>
                                  <span className="px-3 py-1.5 rounded-xl border border-border bg-surface text-muted text-[10px] font-black">8:00 PM (Tomorrow)</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setTutorialStep(2);
                                  setTutorialAutoplay(false);
                                }}
                                className="w-full py-3.5 rounded-2xl bg-primary text-primary-fg font-black text-xs uppercase tracking-widest cursor-pointer shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2 group"
                              >
                                View Booking Flow
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                              </button>
                            </div>
                          )}

                          {/* Step 2: Get Booked */}
                          {tutorialStep === 2 && (
                            <div className="flex-1 flex flex-col justify-between animate-quote-slide">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                  Senior / Step 02
                                </span>
                                <h3 className="text-lg font-black text-fg mt-1">Get Student Bookings</h3>
                                <p className="text-xs text-muted font-medium mt-1.5 leading-relaxed">Students browse your branch, college name, and expertise domains to book a live, anonymous session.</p>
                              </div>

                              {/* Booking Mock Card */}
                              <div className="my-4 p-4 rounded-2xl border border-border bg-surface2 flex gap-3 items-center justify-between shadow-sm">
                                <div className="flex items-center gap-2.5">
                                  <div className="h-8 w-8 rounded-full bg-success/10 text-success border border-success/20 flex items-center justify-center text-xs font-black">✓</div>
                                  <div>
                                    <div className="text-xs font-black text-fg">Anonymous Student Booking</div>
                                    <div className="text-[10px] text-muted font-bold mt-0.5">Topic: CSE Placement Reality</div>
                                  </div>
                                </div>
                                <span className="text-[9px] font-black uppercase bg-success/10 text-success border border-success/20 px-2.5 py-1 rounded-md shadow-xs">Confirmed</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setTutorialStep(3);
                                  setTutorialAutoplay(false);
                                }}
                                className="w-full py-3.5 rounded-2xl bg-primary text-primary-fg font-black text-xs uppercase tracking-widest cursor-pointer shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2 group"
                              >
                                Join Video Call
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                              </button>
                            </div>
                          )}

                          {/* Step 3: Share Guidance */}
                          {tutorialStep === 3 && (
                            <div className="flex-1 flex flex-col justify-between animate-quote-slide">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                  Senior / Step 03
                                </span>
                                <h3 className="text-lg font-black text-fg mt-1">Share Honest Guidance</h3>
                                <p className="text-xs text-muted font-medium mt-1.5 leading-relaxed">Join the secure call right inside your browser window. Guide juniors who need advice regarding campus life or branches.</p>
                              </div>

                              {/* Interactive Call Panel Mock */}
                              <div className="my-4 p-3.5 rounded-2xl border border-border bg-surface2 flex flex-col items-center justify-center h-[115px] relative overflow-hidden shadow-sm">
                                <div className="flex items-center gap-2 z-10">
                                  <span className="custom-audio-wave w-1 bg-success rounded-full" style={{ animationDelay: '0.1s' }} />
                                  <span className="custom-audio-wave w-1 bg-accent rounded-full h-4" style={{ animationDelay: '0.3s' }} />
                                  <span className="custom-audio-wave w-1 bg-success rounded-full h-7" style={{ animationDelay: '0.5s' }} />
                                  <span className="custom-audio-wave w-1 bg-accent rounded-full h-4" style={{ animationDelay: '0.2s' }} />
                                  <span className="custom-audio-wave w-1 bg-success rounded-full" style={{ animationDelay: '0.4s' }} />
                                </div>
                                <div className="absolute bottom-2.5 left-3.5 text-[9px] font-black text-muted uppercase tracking-wider flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-success animate-pulse shadow-sm" />
                                  Sharing Campus Insights
                                </div>
                                <div className="absolute bottom-2.5 right-3.5 text-[9px] font-black text-fg bg-surface px-2.5 py-0.5 rounded-md border border-border shadow-xs">
                                  06:18 Min
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setTutorialStep(4);
                                  setTutorialAutoplay(false);
                                }}
                                className="w-full py-3.5 rounded-2xl bg-primary text-primary-fg font-black text-xs uppercase tracking-widest cursor-pointer shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2 group"
                              >
                                View Milestones
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                              </button>
                            </div>
                          )}

                          {/* Step 4: Success & Senior Earnings */}
                          {tutorialStep === 4 && (
                            <div className="flex-1 flex flex-col justify-between animate-quote-slide">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-success flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
                                  Senior / Step 04
                                </span>
                                <h3 className="text-lg font-black text-fg mt-1">Impact & Senior Earnings</h3>
                                <p className="text-xs text-muted font-medium mt-1.5 leading-relaxed">Earn payouts for completed sessions, build your reputation, gain recommendations, and guide the next generation.</p>
                              </div>

                              <div className="my-4 flex justify-around">
                                <div className="text-center flex flex-col items-center gap-1.5">
                                  <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                  <div className="text-[10px] font-black text-muted uppercase">Top Rated</div>
                                </div>
                                <div className="text-center flex flex-col items-center gap-1.5">
                                  <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  <div className="text-[10px] font-black text-success uppercase">Senior Earnings</div>
                                </div>
                                <div className="text-center flex flex-col items-center gap-1.5">
                                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 025.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                  <div className="text-[10px] font-black text-muted uppercase">Network</div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTutorialStep(1);
                                    setTutorialAutoplay(true);
                                  }}
                                  className="px-4 py-3.5 rounded-2xl border border-border bg-surface text-fg hover:bg-surface2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                                >
                                  Loop Again
                                </button>
                                <Link to="/become-mentor" className="flex-1">
                                  <button
                                    type="button"
                                    className="w-full py-3.5 rounded-2xl bg-primary text-primary-fg font-black text-xs uppercase tracking-widest cursor-pointer shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2 group"
                                  >
                                    Apply As Senior
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                  </button>
                                </Link>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Stats & Motivation Tips */}
              <div className="space-y-12 pt-16 w-full flex flex-col items-center justify-center">
                {/* Animated Stats with Counter */}
                <div className="scroll-reveal reveal-up stagger-4 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-5xl px-4 mx-auto">
                  {stats.map((s, index) => (
                    <div key={s.label} className="group relative overflow-hidden rounded-[36px] border border-border/40 bg-gradient-to-b from-surface/90 to-surface/40 backdrop-blur-xl p-8 text-center shadow-[0_30px_90px_-20px_rgba(37,99,235,0.06)] hover:shadow-[0_45px_110px_-25px_rgba(37,99,235,0.16)] hover:border-primary/40 transition-all duration-700 ease-out hover:-translate-y-2 scroll-reveal reveal-scale stagger-5">
                      {/* Technical Micro Grid Background Overlay */}
                      <div className="absolute inset-0 bg-grid-pattern opacity-80 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />
                      
                      {/* Interactive Radial Laser Beam Reflections */}
                      <div className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 blur-3xl opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out pointer-events-none" />
                      <div className="absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-tl from-accent/15 to-indigo-500/10 blur-3xl opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out pointer-events-none" />
                      
                      {/* Ambient Edge Glow Border */}
                      <div className="absolute inset-0 border border-transparent bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[36px]" />

                      <div className="relative z-10 flex flex-col items-center justify-center">
                        {/* Premium Double Ring Hologram Badge */}
                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary/10 text-primary border border-primary/20 shadow-inner transition-all duration-700 ease-out group-hover:border-primary/50 group-hover:scale-110 group-hover:rotate-[360deg] group-hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.15)]">
                          <LineIcon name={s.icon} className="h-6 w-6 transition-transform duration-500 group-hover:scale-110" />
                        </div>
                        
                        {/* Gradient-Clipped Start Numbers */}
                        <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-fg via-primary to-accent bg-clip-text text-transparent tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          <AnimatedCounter target={s.numericValue} suffix={s.suffix} displayAs={s.displayAs} />
                        </div>
                        <div className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.32em] text-muted/80 group-hover:text-muted transition-colors duration-300">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Motivation Tips Card */}
                <div className="scroll-reveal reveal-up stagger-6 w-full max-w-4xl px-4 mx-auto">
                  <div className="rounded-[48px] border border-border/50 bg-surface/40 backdrop-blur-2xl p-7 md:p-10 shadow-[0_40px_100px_rgba(37,99,235,0.05)] dark:shadow-[0_40px_100px_rgba(96,165,250,0.03)] transition-all duration-500 relative overflow-hidden">
                    {/* Glowing background meshes */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-3xl pointer-events-none rounded-full" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 blur-3xl pointer-events-none rounded-full" />
                    
                    <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between px-3 pb-3">
                      <div>
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-primary/8 via-accent/8 to-primary/4 border border-primary/15 dark:border-primary/25 text-[10px] font-black uppercase tracking-[0.22em] text-primary shadow-sm select-none mb-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                          Why students book
                        </div>
                        <div className="mt-1.5 text-base font-semibold text-fg tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Short, honest guidance that feels worth way more than ₹69.</div>
                      </div>
                      
                      {/* Premium Indicator dots */}
                      <div className="flex items-center gap-2.5 shrink-0 bg-surface/80 border border-border/40 rounded-full px-4 py-2 shadow-inner">
                        {motivationTips.map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            aria-label={`Show tip ${index + 1}`}
                            onClick={() => setActiveTip(index)}
                            className={`h-2.5 rounded-full transition-all duration-700 cursor-pointer ${activeTip === index ? "w-8 bg-gradient-to-r from-primary to-accent shadow-md" : "w-2.5 bg-muted/20 hover:bg-muted/50"}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Highly Engaging Split-Bento Showcase Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-6 relative z-10">
                      
                      {/* Left Side: Editorial Testimonial Slider */}
                      <div className="lg:col-span-7 relative rounded-3xl bg-gradient-to-br from-primary/5 via-surface/90 to-accent/5 border border-primary/15 p-6 md:p-8 min-h-[220px] flex flex-col justify-between overflow-hidden shadow-sm hover:border-primary/25 transition-all duration-300">
                        {/* Continuous Progress Story-Loader Line */}
                        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-accent transition-all duration-700" style={{ width: `${((activeTip + 1) / motivationTips.length) * 100}%` }} />
                        
                        {/* Large decorative quotation mark background overlay */}
                        <div className="absolute -top-12 -left-6 text-[180px] font-black text-primary/5 select-none pointer-events-none leading-none font-serif">“</div>
                        
                        <div key={activeTip} className="relative z-10 animate-quote-slide space-y-5 h-full flex flex-col justify-between">
                          <div>
                            <div className="text-lg md:text-xl font-extrabold text-fg tracking-tight leading-snug" style={{ fontFamily: "'Outfit', sans-serif" }}>
                              {motivationTips[activeTip].title}
                            </div>
                            <div className="mt-3 text-xs md:text-sm text-muted font-bold leading-relaxed">
                              {motivationTips[activeTip].text}
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-primary/10 flex flex-wrap items-center gap-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${motivationTips[activeTip].tagColor} shadow-sm`}>
                              <span className="h-1 w-1 rounded-full bg-current" />
                              {motivationTips[activeTip].badge}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface text-muted border border-border/60 text-[10px] font-black uppercase tracking-wider shadow-sm">
                              <span>★</span>
                              ₹69 Fixed Price
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Interactive Comparison Matrix */}
                      <div className="lg:col-span-5 relative rounded-3xl bg-gradient-to-br from-surface/90 to-surface-2/60 border border-border/60 p-6 flex flex-col justify-between shadow-sm hover:border-primary/20 transition-all duration-300">
                        <div className="space-y-4">
                          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-accent">Value Blueprint</div>
                          
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between rounded-2xl bg-surface2/65 p-3 border border-border/40 hover:scale-[1.02] transition-transform duration-355">
                              <span className="text-xs font-bold text-muted">Traditional Consulting</span>
                              <span className="text-[10px] font-black text-danger bg-danger/10 border border-danger/20 rounded-lg px-2.5 py-1 uppercase tracking-wider">Lakhs of ₹</span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3 border border-primary/20 hover:scale-[1.02] transition-transform duration-355 shadow-sm">
                              <span className="text-xs font-extrabold text-fg">Clarior Session</span>
                              <span className="text-[10px] font-black text-success bg-success/10 border border-success/20 rounded-lg px-2.5 py-1 uppercase tracking-wider">₹69 Fixed</span>
                            </div>
                          </div>

                          <div className="space-y-2 pt-1.5 border-t border-border/40">
                            <div className="flex items-center gap-2 text-xs text-muted font-semibold">
                              <span className="text-danger font-extrabold">✗</span> Unverified, biased advice online
                            </div>
                            <div className="flex items-center gap-2 text-xs text-fg font-extrabold">
                              <span className="text-success font-extrabold">✓</span> 1-on-1 verified college seniors
                            </div>
                          </div>
                        </div>

                        <Link to="/explore" className="w-full mt-4">
                          <Button
                            size="sm"
                            className="w-full rounded-2xl cursor-pointer font-black text-xs uppercase tracking-wider shadow-hero py-3"
                            iconRight={<svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>}
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
                  className="w-full overflow-x-auto scrollbar-hide py-6 px-4 flex gap-6 snap-x snap-mandatory md:snap-none cursor-grab active:cursor-grabbing"
                  style={{ scrollBehavior: "auto" }}
                >
                  {collegesLoading ? (
                    <div className="flex gap-6 w-full">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-[calc(100vw-80px)] md:w-[320px] h-[340px] rounded-[28px] bg-surface2 animate-pulse flex-shrink-0" />
                      ))}
                    </div>
                  ) : repeatedList.length > 0 ? (
                    repeatedList.map((college, idx) => (
                      <div 
                        key={`${college._id}-${idx}`} 
                        className="w-[calc(100vw-80px)] md:w-[320px] flex-shrink-0 snap-center transition-transform duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
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
            WHY CLARIOR — Bento Box features grid
            ═══════════════════════════════════════════════════════ */}
        <section className="py-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none section-glow" />

          <SiteContainer>
            <div ref={featuresRevealRef} className="space-y-16">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <div className="scroll-reveal reveal-up inline-block px-4 py-1.5 rounded-full bg-accent/5 border border-accent/20 text-[10px] font-black text-accent uppercase tracking-widest">The Clarior Edge</div>
                <h2 className="scroll-reveal reveal-up stagger-1 heading-display text-4xl md:text-6xl font-black text-fg leading-tight">
                  Because Every Question <br /> <span className="gradient-text-animated">Deserves an Answer.</span>
                </h2>
                <p className="scroll-reveal reveal-up stagger-2 text-lg text-muted leading-relaxed">
                  Most platforms give you generic advice. We give you a direct line to the people who&apos;ve actually been there. No hidden costs, no long-term commitments.
                </p>
              </div>

              {/* Bento Grid */}
              <div className="grid md:grid-cols-3 gap-6 auto-rows-[220px]">
                
                {/* Bento Card 1: Live 1:1 Guided Video Calls (Wide: Col-span-2, Row-span-1) */}
                <div className="scroll-reveal reveal-up stagger-3 md:col-span-2 rounded-[32px] border border-border/60 bg-gradient-to-br from-surface to-primary/5 p-6 flex flex-col justify-between shadow-soft hover:shadow-lift transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-primary/5 blur-2xl rounded-full group-hover:bg-primary/10 transition-colors" />
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <LineIcon name="call" className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-fg">Live 1:1 Video Calls</h3>
                      <p className="text-xs font-semibold text-muted mt-1 leading-relaxed">
                        Get face-to-face clarity with live, high-definition video calls hosted securely in our application. No Zoom links required.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-center bg-surface2/60 border border-border/40 p-2.5 rounded-xl text-[10px] font-black text-muted uppercase tracking-wider w-fit mt-3">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    Secure In-App Room Active
                  </div>
                </div>

                {/* Bento Card 2: Transparent ₹69 Credits (Small: Col-span-1, Row-span-1) */}
                <div className="scroll-reveal reveal-up stagger-4 md:col-span-1 rounded-[32px] border border-border/60 bg-gradient-to-br from-surface to-accent/5 p-6 flex flex-col justify-between shadow-soft hover:shadow-lift transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-accent/5 blur-2xl rounded-full group-hover:bg-accent/10 transition-colors" />
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                      <LineIcon name="gem" className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-fg">₹69 Call Pass</h3>
                      <p className="text-xs font-semibold text-muted mt-1 leading-relaxed">
                        Flat pricing for all seniors. No subscription traps, pay as you go.
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-black text-primary uppercase tracking-wider">
                    No Consultancies Fee
                  </div>
                </div>

                {/* Bento Card 3: 100% Manual Verification (Small: Col-span-1, Row-span-1) */}
                <div className="scroll-reveal reveal-up stagger-5 md:col-span-1 rounded-[32px] border border-border/60 bg-gradient-to-br from-surface to-success/5 p-6 flex flex-col justify-between shadow-soft hover:shadow-lift transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-success/5 blur-2xl rounded-full group-hover:bg-success/10 transition-colors" />
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-success/10 text-success flex items-center justify-center shrink-0">
                      <LineIcon name="shield" className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-fg">Verified Insiders Only</h3>
                      <p className="text-xs font-semibold text-muted mt-1 leading-relaxed">
                        Every senior&apos;s identity and college ID are verified manually by our team.
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-black text-success uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    ID Checks Required
                  </div>
                </div>

                {/* Bento Card 4: Prep Notes Workspace (Wide: Col-span-2, Row-span-1) */}
                <div className="scroll-reveal reveal-up stagger-6 md:col-span-2 rounded-[32px] border border-border/60 bg-gradient-to-br from-surface to-amber-500/5 p-6 flex flex-col justify-between shadow-soft hover:shadow-lift transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-amber-500/5 blur-2xl rounded-full group-hover:bg-amber-500/10 transition-colors" />
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-fg">Pre-Call Prep Workspace</h3>
                      <p className="text-xs font-semibold text-muted mt-1 leading-relaxed">
                        List questions or placement concerns before the call. The senior reviews your notes in advance to make every minute of your session productive.
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Zero Wasted Time
                  </div>
                </div>

              </div>
            </div>
          </SiteContainer>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SOCIAL PROOF & TRUST — Testimonials & Comparison Side-by-Side
            ═══════════════════════════════════════════════════════ */}
        <section className="py-24 bg-surface2/35 border-y border-border/40 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

          <SiteContainer>
            <div className="grid lg:grid-cols-5 gap-10 items-start">
              
              {/* Left Column (2/5 width): Testimonials Slider */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-2">
                  <div className="inline-block px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest">Testimonials</div>
                  <h2 className="heading-display text-2xl md:text-3xl font-black text-fg tracking-tight">
                    What Seniors Say
                  </h2>
                </div>

                <div className="relative w-full">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-primary/5 to-accent/10 rounded-[48px] blur-3xl pointer-events-none opacity-60" />
                  
                  <div className="relative overflow-hidden rounded-[28px] border border-border/40 bg-surface/90 shadow-card">
                    <div 
                      className="flex transition-transform duration-700 ease-out"
                      style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
                    >
                      {testimonials.map((t) => (
                        <div key={t.name} className="w-full flex-shrink-0 p-5 flex flex-col justify-between group min-h-[250px]">
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr border text-sm font-black uppercase shadow-inner transition-transform duration-500 ${t.avatarGlow}`}>
                                {t.initials}
                              </div>
                              <div>
                                <div className="font-bold text-fg text-sm leading-tight">{t.name}</div>
                                <div className="text-[9px] font-bold text-muted uppercase tracking-wider mt-0.5">{t.role}</div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 items-start">
                              <span className={`text-3xl font-serif leading-none select-none -mt-2 transition-colors duration-500 ${t.quoteColor}`}>&ldquo;</span>
                              <p className="text-xs md:text-sm text-fg/80 italic leading-relaxed pt-0.5">
                                {t.quote}
                              </p>
                            </div>
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
              <div className="lg:col-span-3 space-y-6">
                <div className="space-y-2">
                  <div className="inline-block px-3 py-1 rounded-full bg-success/5 border border-success/20 text-[9px] font-black text-success uppercase tracking-widest">Compare & Decide</div>
                  <h2 className="heading-display text-2xl md:text-3xl font-black text-fg tracking-tight">
                    No Sales Pitch. Just Raw Clarity.
                  </h2>
                </div>

                {/* Desktop & Tablet Matrix View */}
                <div className="hidden md:block rounded-[28px] border border-border/60 bg-surface/90 shadow-card overflow-hidden backdrop-blur-xl">
                  <div className="grid grid-cols-3 border-b border-border bg-surface2/60 p-4 text-center font-black text-[10px] uppercase tracking-widest text-muted">
                    <div className="text-left pl-3">Decision Factor</div>
                    <div>Traditional Advice</div>
                    <div className="text-primary">Clarior Difference</div>
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
                    <div key={idx} className="grid grid-cols-3 p-4 items-center border-b border-border/30 last:border-0 hover:bg-surface2/20 transition-colors text-left">
                      <div className="font-bold text-fg text-xs pl-3">{row.factor}</div>
                      <div className="text-xs text-muted font-medium leading-relaxed">{row.traditional}</div>
                      <div className="text-xs text-primary font-semibold leading-relaxed">
                        {row.clarior}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile View: High-fidelity Comparison Cards */}
                <div className="block md:hidden space-y-4">
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
                    <div key={idx} className="rounded-2xl border border-border/60 bg-surface/90 p-5 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between border-b border-border/30 pb-2">
                        <span className="text-xs font-black text-fg uppercase tracking-widest">{row.factor}</span>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-primary">Clarior Difference</span>
                      </div>
                      
                      <div className="space-y-2.5 pt-1">
                        <div>
                          <span className="text-[8px] font-black uppercase text-muted tracking-wider block mb-1">Traditional Advice</span>
                          <p className="text-xs text-muted leading-relaxed font-semibold">{row.traditional}</p>
                        </div>
                        <div>
                          <span className="text-[8px] font-black uppercase text-primary tracking-wider block mb-1">Clarior Difference</span>
                          <p className="text-xs text-fg font-black leading-relaxed">{row.clarior}</p>
                        </div>
                      </div>
                    </div>
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
