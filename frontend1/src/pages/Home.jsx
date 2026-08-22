import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SiteContainer from "../components/layout/SiteContainer";
import useSEO from "../hooks/useSEO";

/* ═══════════════════════════════════════════════════════════════
   CUSTOM HOOKS
   ═══════════════════════════════════════════════════════════════ */

/** Scroll-reveal: adds .revealed to elements with [data-reveal] when they enter viewport */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** 3D mouse-tracking tilt for a single element */
function use3DTilt(strength = 12) {
  const ref = useRef(null);
  const raf = useRef(null);

  const onMouseMove = useCallback(
    (e) => {
      if (!ref.current) return;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const rect = ref.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        ref.current.style.transform = `perspective(900px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) scale3d(1.03,1.03,1.03)`;
      });
    },
    [strength]
  );

  const onMouseLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (ref.current)
      ref.current.style.transform =
        "perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}

/** Animated counter — counts up from 0 to target */
function useCounter(target, duration = 1600, enabled = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!enabled || !target) return;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setVal(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, enabled]);
  return val;
}

/* ═══════════════════════════════════════════════════════════════
   SMALL UI PRIMITIVES
   ═══════════════════════════════════════════════════════════════ */

const ICONS = {
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  ),
  video: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 13 4 4L19 7" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  zap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  coin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v1m0 8v1"/>
    </svg>
  ),
  chevDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
};

function Icon({ name, className = "w-5 h-5" }) {
  return <span className={`inline-flex items-center justify-center ${className}`}>{ICONS[name]}</span>;
}

/* ─── 3D Tilt Card wrapper ─────────────────────────────────────── */
function TiltCard({ children, className = "", strength = 10 }) {
  const { ref, onMouseMove, onMouseLeave } = use3DTilt(strength);
  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={className}
      style={{ transition: "transform 0.25s cubic-bezier(0.23,1,0.32,1)", willChange: "transform" }}
    >
      {children}
    </div>
  );
}

/* ─── Drag Slider (Framer-style) ───────────────────────────────── */
function DragSlider({ children, className = "" }) {
  const trackRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeft.current = trackRef.current.scrollLeft;
    trackRef.current.style.cursor = "grabbing";
    trackRef.current.style.userSelect = "none";
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (trackRef.current) {
      trackRef.current.style.cursor = "grab";
      trackRef.current.style.userSelect = "";
    }
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.4;
    trackRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <div
      ref={trackRef}
      className={`flex gap-5 overflow-x-auto scrollbar-hide cursor-grab ${className}`}
      style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onMouseMove={onMouseMove}
    >
      {children}
    </div>
  );
}

/* ─── Animated stat counter card ───────────────────────────────── */
function StatCounter({ value, suffix = "", label, accent = "primary", enabled }) {
  const count = useCounter(value, 1800, enabled);
  return (
    <div className="text-center space-y-1 px-6">
      <div className={`text-4xl md:text-5xl font-black text-${accent} tabular-nums`}>
        {value ? count : "—"}{suffix}
      </div>
      <div className="text-xs font-bold uppercase tracking-widest text-muted">{label}</div>
    </div>
  );
}

/* ─── FAQ Item ─────────────────────────────────────────────────── */
function FaqItem({ q, a, open, onToggle, idx }) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        open
          ? "border-primary/40 bg-primary/[0.03] shadow-[0_0_0_1px_rgba(var(--primary),0.15)]"
          : "border-border/60 bg-surface hover:border-border"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer group"
      >
        <span className={`text-sm font-bold transition-colors ${open ? "text-primary" : "text-fg group-hover:text-primary"}`}>
          {q}
        </span>
        <span
          className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full border transition-all duration-300 ${
            open
              ? "bg-primary border-primary text-white rotate-180"
              : "border-border/60 text-muted"
          }`}
        >
          <Icon name="chevDown" className="w-3.5 h-3.5" />
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-muted leading-relaxed font-medium border-t border-border/30 pt-4 animate-fade-in">
          {a}
        </div>
      )}
    </div>
  );
}

/* ─── Rotating hero text ───────────────────────────────────────── */
const ROTATE_WORDS = ["Campus Reality", "Branch Insights", "Placement Truth", "Hostel Life", "Exam Secrets"];

function RotatingWord() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % ROTATE_WORDS.length);
        setVisible(true);
      }, 350);
    }, 2800);
    return () => clearInterval(iv);
  }, []);

  return (
    <span
      className="gradient-text-animated inline-block"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(-18px) scale(0.92)",
        filter: visible ? "blur(0)" : "blur(6px)",
        transition: "opacity 0.35s cubic-bezier(0.23,1,0.32,1), transform 0.35s cubic-bezier(0.23,1,0.32,1), filter 0.35s ease",
      }}
    >
      {ROTATE_WORDS[idx]}
    </span>
  );
}

/* ─── Marquee strip ────────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  "Verified Mentors", "Encrypted 1:1 Calls", "₹69 Credit Pass",
  "No Commission Bias", "Instant Booking", "20-Min Sessions",
  "Refund Guarantee", "Campus Insiders", "Real Placement Data",
  "Zero Spam Calls", "100% Authentic", "Trusted Guidance",
];

function MarqueeStrip() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="relative overflow-hidden py-4 mask-marquee border-y border-border/40 bg-surface/40 backdrop-blur-sm">
      <div className="animate-marquee flex gap-8">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-2.5 shrink-0 text-xs font-black uppercase tracking-widest text-muted/70">
            <span className="w-1 h-1 rounded-full bg-primary/60 shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Floating orb visual ─────────────────────────────────────── */
function HeroVisual() {
  return (
    <div className="relative w-full max-w-md mx-auto h-72 md:h-80 select-none pointer-events-none">
      {/* Outer glow ring */}
      <div className="absolute inset-4 rounded-full border border-primary/10 animate-float" style={{ animationDuration: "8s" }} />
      <div className="absolute inset-8 rounded-full border border-accent/10 animate-float" style={{ animationDuration: "10s", animationDelay: "-3s" }} />

      {/* Central orb */}
      <div className="absolute inset-12 rounded-full bg-gradient-to-br from-primary/20 via-accent/15 to-transparent blur-2xl animate-float" style={{ animationDuration: "7s" }} />

      {/* 3D floating cards */}
      <div className="absolute top-6 left-0 w-44 animate-float" style={{ animationDuration: "6s", animationDelay: "-1s" }}>
        <div className="rounded-2xl border border-border/60 bg-surface/90 backdrop-blur-md p-3.5 shadow-lift">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-success/15 flex items-center justify-center">
              <Icon name="check" className="w-4 h-4 text-success" />
            </div>
            <div>
              <div className="text-[10px] font-black text-fg">Slot Booked!</div>
              <div className="text-[9px] text-muted font-semibold">1 credit used</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 right-0 w-44 animate-float" style={{ animationDuration: "9s", animationDelay: "-4s" }}>
        <div className="rounded-2xl border border-border/60 bg-surface/90 backdrop-blur-md p-3.5 shadow-lift">
          <div className="flex items-center gap-2">
            <Icon name="video" className="w-4 h-4 text-primary shrink-0" />
            <div>
              <div className="text-[10px] font-black text-fg">Live Call Active</div>
              <div className="text-[9px] text-muted font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                20:00 timer running
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-6 w-40 animate-float" style={{ animationDuration: "11s", animationDelay: "-6s" }}>
        <div className="rounded-2xl border border-border/60 bg-surface/90 backdrop-blur-md p-3.5 shadow-lift">
          <div className="flex items-center gap-2">
            <Icon name="star" className="w-4 h-4 text-warning shrink-0" />
            <div>
              <div className="text-[10px] font-black text-fg">Session Rated 5★</div>
              <div className="text-[9px] text-muted font-semibold">Mentor earnings released</div>
            </div>
          </div>
        </div>
      </div>

      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/25 backdrop-blur-md shadow-hero flex items-center justify-center animate-float" style={{ animationDuration: "5s" }}>
          <Icon name="video" className="w-9 h-9 text-primary" />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VALUE PILLAR CARDS (Slider items)
   ═══════════════════════════════════════════════════════════════ */
const PILLARS = [
  {
    icon: "shield",
    color: "primary",
    title: "100% Unbiased Advice",
    desc: "Mentors earn per session, never per admission. Zero commission structure means zero reason to push any specific choice.",
    badge: "Zero Commission",
  },
  {
    icon: "lock",
    color: "accent",
    title: "Private Encrypted Calls",
    desc: "All sessions run inside our secure WebRTC room. Your phone number and email are never shared with anyone.",
    badge: "End-to-End Private",
  },
  {
    icon: "zap",
    color: "warning",
    title: "Direct Campus Insiders",
    desc: "You speak with active enrolled students — not career coaches, not admissions agents, not paid influencers.",
    badge: "Real Students",
  },
  {
    icon: "coin",
    color: "success",
    title: "₹69 Flat Credit Pass",
    desc: "No subscription traps or ₹50k packages. One credit = one 20-min call. Instant refund if your mentor no-shows.",
    badge: "Refund Guaranteed",
  },
  {
    icon: "clock",
    color: "primary",
    title: "Timer-Tracked 20 Min",
    desc: "Every session is precision-timed. No overstaying, no ghost sessions. Both parties see the same live countdown.",
    badge: "Accountability Built-In",
  },
  {
    icon: "users",
    color: "accent",
    title: "Manual Mentor Verification",
    desc: "Every mentor is verified by our team before their slots go live. College enrollment and credentials checked manually.",
    badge: "Human Reviewed",
  },
];

const COLOR_MAP = {
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20", glow: "rgba(96,165,250,0.18)" },
  accent:  { bg: "bg-accent/10",  text: "text-accent",  border: "border-accent/20",  glow: "rgba(56,189,248,0.18)" },
  warning: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20", glow: "rgba(245,158,11,0.18)" },
  success: { bg: "bg-success/10", text: "text-success", border: "border-success/20", glow: "rgba(16,185,129,0.18)" },
};

function PillarCard({ pillar }) {
  const c = COLOR_MAP[pillar.color];
  const cardRef = useRef(null);
  const { ref: tiltRef, onMouseMove, onMouseLeave: tiltLeave } = use3DTilt(8);

  const handleMouseEnter = () => {
    if (cardRef.current) cardRef.current.style.boxShadow = `0 20px 50px -10px ${c.glow}, 0 0 0 1px rgba(var(--primary),0.12)`;
  };
  const handleMouseLeave = (e) => {
    if (cardRef.current) cardRef.current.style.boxShadow = "";
    tiltLeave(e);
  };

  return (
    <div
      ref={(el) => { tiltRef.current = el; cardRef.current = el; }}
      onMouseMove={onMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className="shrink-0 w-72 md:w-80 rounded-3xl border border-border/60 bg-surface p-7 space-y-5 shadow-card"
      style={{
        scrollSnapAlign: "start",
        transition: "transform 0.28s cubic-bezier(0.23,1,0.32,1), box-shadow 0.28s ease",
        willChange: "transform",
      }}
    >
      <div className={`w-12 h-12 rounded-2xl ${c.bg} ${c.text} border ${c.border} flex items-center justify-center`}>
        <Icon name={pillar.icon} className="w-6 h-6" />
      </div>
      <div>
        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${c.bg} ${c.text} ${c.border} border mb-3`}>
          {pillar.badge}
        </div>
        <h3 className="text-lg font-black text-fg leading-tight">{pillar.title}</h3>
        <p className="text-xs text-muted font-semibold leading-relaxed mt-2">{pillar.desc}</p>
      </div>
    </div>
  );
}

/* ─── HOW IT WORKS steps ───────────────────────────────────────── */
const STEPS = [
  {
    n: "01",
    icon: "search",
    title: "Browse & Choose",
    desc: "Filter mentors by academic discipline, branch, or area of study. Each profile shows real branch, year, rating, and completed sessions.",
    color: "primary",
  },
  {
    n: "02",
    icon: "coin",
    title: "Book with ₹69 Pass",
    desc: "Pick any open slot from the mentor's calendar. Confirm with one credit pass. Instant booking confirmation.",
    color: "accent",
  },
  {
    n: "03",
    icon: "video",
    title: "Join Live 1:1 Call",
    desc: "Enter the private in-app session room. 20-minute timer starts. Ask everything — get uncensored campus truth.",
    color: "success",
  },
];

/* ─── PRICING plans ────────────────────────────────────────────── */
const PLANS = [
  {
    name: "Single Pass",
    price: "₹69",
    sub: "1 Credit",
    color: "border-border",
    popular: false,
    features: ["1 × 20-min 1:1 session", "Session prep workspace", "Full refund if cancelled"],
  },
  {
    name: "Power Pass",
    price: "₹189",
    sub: "3 Credits · Save ₹18",
    color: "border-primary",
    popular: true,
    features: ["3 × 20-min 1:1 sessions", "Session prep workspace", "Priority slot access", "Credits never expire"],
  },
  {
    name: "Career Pass",
    price: "₹299",
    sub: "5 Credits · Save ₹46",
    color: "border-accent",
    popular: false,
    features: ["5 × 20-min 1:1 sessions", "Session prep workspace", "Refund guarantee", "Priority user support"],
  },
];

/* ─── FAQs ─────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "How does a 1:1 mentorship session work on Clarior?",
    a: "You browse mentors, pick an available time slot, pay ₹69 (1 credit), and join a private 20-minute in-app video/audio call. A live countdown timer keeps both parties accountable. After the session, you can rate and review your experience.",
  },
  {
    q: "How are mentors verified before listing their slots?",
    a: "Every mentor goes through manual credential verification by our team — we check active college enrollment status and identity before their availability calendar goes live. No mentor self-publishes without approval.",
  },
  {
    q: "Is my personal contact information safe?",
    a: "Yes. All sessions are hosted inside Clarior's secure WebRTC room. Neither your phone number nor your personal email is ever shared with anyone on the platform.",
  },
  {
    q: "What happens if my mentor doesn't join the call?",
    a: "Your credit is automatically refunded to your account balance. You can then rebook with any other available mentor with no friction.",
  },
  {
    q: "Can I become a mentor if I'm currently enrolled in college?",
    a: "Yes. Click 'Become a Mentor', complete your application with your enrollment details and UPI ID for payouts. Once our team reviews and approves, you can publish your availability and start earning ₹55+ per session.",
  },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN HOME COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Home() {
  useSEO({
    title: "Clarior — 1:1 Guidance from Verified Campus Insiders",
    description:
      "Connect directly with verified college students for honest, unbiased guidance on campus life, branches, placements, and admissions. ₹69 per session.",
  });

  useScrollReveal();

  /* ── real backend data ── */
  const [stats, setStats] = useState({ seniors: 0, colleges: 0, sessions: 0 });
  const [mentors, setMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  /* ── FAQ state ── */
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const [statsRes, mentorsRes] = await Promise.allSettled([
        api.get("/colleges/stats"),
        api.get("/users/seniors"),
      ]);
      if (statsRes.status === "fulfilled" && statsRes.value?.data) {
        const d = statsRes.value.data;
        setStats({
          seniors: d.totalSeniors || d.verifiedSeniors || 0,
          colleges: d.totalColleges || 0,
          sessions: d.totalSessions || d.completedSessions || 0,
        });
      }
      if (mentorsRes.status === "fulfilled" && mentorsRes.value?.data) {
        const list = Array.isArray(mentorsRes.value.data)
          ? mentorsRes.value.data
          : mentorsRes.value.data.seniors || [];
        setMentors(list.slice(0, 6));
      }
      setLoadingMentors(false);
    };
    fetchData();
  }, []);

  /* ── stats counter trigger via IntersectionObserver ── */
  useEffect(() => {
    if (!statsRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.4 }
    );
    io.observe(statsRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-bg text-fg overflow-x-hidden">
      <Navbar />

      <main>
        {/* ═══════════════════════════════════════════════════════
            SECTION 1 — HERO
            ══════════════════════════════════════════════════════ */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
          {/* Background atmosphere */}
          <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
          <div className="absolute -top-20 right-0 w-80 h-80 rounded-full bg-accent/8 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

          <SiteContainer className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left: copy */}
              <div className="space-y-8">
                {/* Trust pill */}
                <div
                  className="scroll-reveal reveal-up inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-border bg-surface/80 backdrop-blur-md shadow-soft text-xs font-black uppercase tracking-widest text-fg"
                >
                  <span className="flex gap-0.5">
                    {[0,1,2,3,4].map(i => (
                      <Icon key={i} name="star" className="w-3 h-3 text-warning" />
                    ))}
                  </span>
                  Trusted Student Mentorship Platform
                </div>

                {/* Main headline */}
                <div className="scroll-reveal reveal-up stagger-1 word-reveal-container space-y-2">
                  <h1 className="heading-display text-5xl sm:text-6xl md:text-7xl text-fg leading-[1.02] tracking-tight">
                    The Real{" "}
                    <br className="hidden sm:block" />
                    <RotatingWord />
                    <br />
                    <span className="text-fg/70">from Inside Campus.</span>
                  </h1>
                </div>

                {/* Subline */}
                <p className="scroll-reveal reveal-up stagger-2 text-base md:text-lg text-muted font-medium leading-relaxed max-w-lg">
                  Skip the noise. Connect 1-on-1 with verified college students for authentic, unsponsored guidance on the choices that shape your future.
                </p>

                {/* Price badge */}
                <div className="scroll-reveal reveal-up stagger-3 inline-flex flex-wrap items-center gap-3 text-xs font-black">
                  <span className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary/10 border border-primary/25 text-primary">
                    <Icon name="coin" className="w-4 h-4" />
                    Flat ₹69 per session
                  </span>
                  <span className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-success/10 border border-success/25 text-success">
                    <Icon name="check" className="w-4 h-4" />
                    Instant Refund Guarantee
                  </span>
                  <span className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface border border-border text-muted">
                    <Icon name="lock" className="w-4 h-4" />
                    Private In-App Call
                  </span>
                </div>

                {/* CTAs */}
                <div className="scroll-reveal reveal-up stagger-4 flex flex-wrap gap-4">
                  <Link to="/explore">
                    <button className="group relative inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-primary text-white font-black text-sm overflow-hidden shadow-[0_8px_28px_rgba(37,99,235,0.35)] hover:shadow-[0_12px_40px_rgba(37,99,235,0.48)] hover:-translate-y-1 transition-all duration-300">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <Icon name="search" className="w-4 h-4" />
                      Find My Mentor
                      <Icon name="arrow" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  <a href="#how-it-works">
                    <button className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl border border-border bg-surface font-bold text-sm text-fg hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
                      How it works
                    </button>
                  </a>
                  <Link to="/become-mentor">
                    <button className="inline-flex items-center gap-2 px-5 py-4 text-sm font-bold text-muted hover:text-primary transition-colors">
                      Become a Mentor →
                    </button>
                  </Link>
                </div>
              </div>

              {/* Right: 3D hero visual */}
              <div className="scroll-reveal reveal-scale hidden lg:block">
                <HeroVisual />
              </div>
            </div>
          </SiteContainer>
        </section>

        {/* ═══════════════════════════════════════════════════════
            MARQUEE STRIP
            ══════════════════════════════════════════════════════ */}
        <MarqueeStrip />

        {/* ═══════════════════════════════════════════════════════
            SECTION 2 — LIVE STATS + MENTORS
            ══════════════════════════════════════════════════════ */}
        <section className="py-20">
          <SiteContainer>
            {/* Animated stats bar */}
            <div
              ref={statsRef}
              className="scroll-reveal reveal-up grid grid-cols-3 divide-x divide-border/40 rounded-3xl border border-border/60 bg-surface/60 backdrop-blur-md shadow-card py-8 mb-16"
            >
              <StatCounter value={stats.seniors}  label="Verified Mentors"        accent="primary" suffix="+" enabled={statsVisible} />
              <StatCounter value={stats.colleges}  label="Institutions Covered"   accent="accent"  enabled={statsVisible} />
              <StatCounter value={stats.sessions}  label="1:1 Sessions Completed" accent="success" suffix="+" enabled={statsVisible} />
            </div>

            {/* Section header */}
            <div className="scroll-reveal reveal-up flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">From the Platform</p>
                <h2 className="heading-display text-3xl md:text-4xl text-fg">
                  Verified Campus Mentors
                </h2>
              </div>
              <Link to="/explore">
                <button className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-surface text-sm font-bold text-muted hover:text-primary hover:border-primary/40 transition-all">
                  Browse All <Icon name="arrow" className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Mentor grid */}
            {loadingMentors ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="rounded-3xl border border-border/40 bg-surface p-6 space-y-4 animate-pulse">
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-2xl bg-surface2 skeleton" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 rounded bg-surface2 skeleton" />
                        <div className="h-3 w-1/2 rounded bg-surface2 skeleton" />
                      </div>
                    </div>
                    <div className="h-3 w-full rounded bg-surface2 skeleton" />
                    <div className="h-3 w-3/4 rounded bg-surface2 skeleton" />
                  </div>
                ))}
              </div>
            ) : mentors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {mentors.map((m, i) => {
                  const initials = m.name
                    ? m.name.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                    : "M";
                  const gradients = [
                    "from-blue-500/20 to-indigo-500/20",
                    "from-violet-500/20 to-purple-500/20",
                    "from-emerald-500/20 to-teal-500/20",
                    "from-amber-500/20 to-orange-500/20",
                    "from-rose-500/20 to-pink-500/20",
                    "from-cyan-500/20 to-sky-500/20",
                  ];
                  const textColors = ["text-blue-500","text-violet-500","text-emerald-500","text-amber-500","text-rose-500","text-cyan-500"];
                  return (
                    <div
                      key={m._id}
                      className={`scroll-reveal reveal-up stagger-${Math.min(i + 1, 6)}`}
                      data-reveal
                    >
                      <TiltCard
                        strength={8}
                        className="rounded-3xl border border-border/60 bg-surface p-6 space-y-4 shadow-card hover:border-primary/30 hover:shadow-lift transition-colors duration-300 h-full"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradients[i % 6]} flex items-center justify-center font-black text-lg ${textColors[i % 6]}`}>
                              {initials}
                            </div>
                            <div>
                              <div className="font-black text-fg text-sm">{m.branch || "College Student"}</div>
                              <div className="text-[11px] text-muted font-semibold">
                                {m.year ? `${m.year}${m.year === 1 ? "st" : m.year === 2 ? "nd" : m.year === 3 ? "rd" : "th"} Year` : "Active Student"}
                              </div>
                            </div>
                          </div>
                          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-success/10 border border-success/20 text-[10px] font-black text-success">
                            <Icon name="check" className="w-3 h-3" /> Verified
                          </span>
                        </div>

                        {m.bio && (
                          <p className="text-[11px] text-muted leading-relaxed font-medium line-clamp-2">
                            "{m.bio}"
                          </p>
                        )}

                        <div className="pt-3 border-t border-border/30 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[11px] font-bold">
                            <Icon name="star" className="w-3.5 h-3.5 text-warning" />
                            <span className="text-fg">{m.rating ? m.rating.toFixed(1) : "New"}</span>
                            <span className="text-muted">({m.numReviews || 0})</span>
                            <span className="text-border/60 mx-1">·</span>
                            <span className="text-muted">{m.sessionsCompleted || 0} sessions</span>
                          </div>
                          <Link
                            to={`/profile/${m._id}`}
                            className="text-[11px] font-black text-primary hover:text-accent transition-colors flex items-center gap-1"
                          >
                            Book Slot <Icon name="arrow" className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </TiltCard>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="scroll-reveal reveal-scale rounded-3xl border border-dashed border-border/60 bg-surface/40 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Icon name="users" className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-black text-fg text-xl">Discover All Mentors</h3>
                <p className="text-sm text-muted font-medium max-w-sm mx-auto">
                  Browse our roster of verified mentors across multiple disciplines and academic tracks.
                </p>
                <Link to="/explore">
                  <button className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:-translate-y-0.5 transition-all shadow-md">
                    Explore Platform <Icon name="arrow" className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            )}
          </SiteContainer>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 3 — DRAG SLIDER: VALUE PILLARS
            ══════════════════════════════════════════════════════ */}
        <section className="py-20 bg-surface/30 border-y border-border/40">
          <SiteContainer>
            <div className="scroll-reveal reveal-up mb-10 flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Why Clarior</p>
                <h2 className="heading-display text-3xl md:text-4xl text-fg">
                  Built Different, By Design
                </h2>
                <p className="text-sm text-muted font-medium mt-2 max-w-md">
                  Drag to explore. Every design decision exists to protect your time and trust.
                </p>
              </div>
              <span className="flex items-center gap-2 text-xs text-muted font-bold border border-border/50 rounded-xl px-3 py-2 bg-surface shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18"/></svg>
                Drag to explore
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </span>
            </div>

            <DragSlider className="pb-4">
              {PILLARS.map((p, i) => (
                <PillarCard key={i} pillar={p} />
              ))}
            </DragSlider>
          </SiteContainer>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 4 — HOW IT WORKS (3D steps)
            ══════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-24">
          <SiteContainer>
            <div className="scroll-reveal reveal-up max-w-2xl mx-auto text-center mb-16 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-primary">3 Simple Steps</p>
              <h2 className="heading-display text-3xl md:text-5xl text-fg">Your Session, Start to Finish</h2>
              <p className="text-sm text-muted font-medium leading-relaxed">
                From browsing to getting genuine campus clarity — the entire flow takes under 5 minutes to set up.
              </p>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* connector line desktop */}
              <div className="hidden md:block absolute top-14 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              {STEPS.map((step, i) => {
                const c = COLOR_MAP[step.color];
                return (
                  <div
                    key={i}
                    className={`scroll-reveal reveal-up stagger-${i + 1}`}
                    data-reveal
                  >
                    <TiltCard
                      strength={6}
                      className="relative rounded-3xl border border-border/60 bg-surface p-8 space-y-5 shadow-card text-center"
                    >
                      {/* Step number badge */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-xl border border-border bg-surface flex items-center justify-center text-[10px] font-black text-muted shadow-sm">
                        {step.n}
                      </div>

                      <div className={`w-14 h-14 rounded-2xl ${c.bg} ${c.text} border ${c.border} flex items-center justify-center mx-auto shadow-sm`}>
                        <Icon name={step.icon} className="w-7 h-7" />
                      </div>

                      <div>
                        <h3 className="font-black text-fg text-xl mb-2">{step.title}</h3>
                        <p className="text-xs text-muted font-semibold leading-relaxed">{step.desc}</p>
                      </div>
                    </TiltCard>
                  </div>
                );
              })}
            </div>
          </SiteContainer>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 5 — PRICING
            ══════════════════════════════════════════════════════ */}
        <section className="py-24 bg-surface/30 border-y border-border/40">
          <SiteContainer>
            <div className="scroll-reveal reveal-up max-w-xl mx-auto text-center mb-14 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-primary">Transparent Pricing</p>
              <h2 className="heading-display text-3xl md:text-5xl text-fg">Pay for What You Need</h2>
              <p className="text-sm text-muted font-medium leading-relaxed">
                No subscriptions. No hidden charges. Buy credits, use them anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-5xl mx-auto">
              {PLANS.map((plan, i) => {
                const isPopular = plan.popular;
                return (
                  <div key={i} className={`scroll-reveal reveal-up stagger-${i + 1}`} data-reveal>
                    <TiltCard
                      strength={6}
                      className={`rounded-3xl border-2 ${plan.color} ${isPopular ? "shadow-[0_20px_60px_-15px_rgba(37,99,235,0.3)] bg-primary/[0.025]" : "bg-surface shadow-card"} p-8 space-y-6 flex flex-col justify-between h-full relative overflow-hidden`}
                    >
                      {isPopular && (
                        <>
                          <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
                            Most Popular
                          </div>
                          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                        </>
                      )}

                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">{plan.name}</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-fg">{plan.price}</span>
                            <span className="text-xs text-muted font-bold">{plan.sub}</span>
                          </div>
                        </div>

                        <ul className="space-y-2.5 pt-4 border-t border-border/40">
                          {plan.features.map((f, fi) => (
                            <li key={fi} className="flex items-center gap-2.5 text-xs font-bold text-fg">
                              <div className="w-4 h-4 rounded-full bg-success/15 border border-success/25 flex items-center justify-center shrink-0">
                                <Icon name="check" className="w-2.5 h-2.5 text-success" />
                              </div>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Link to="/buy-credits" className="block w-full">
                        <button
                          className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all duration-300 ${
                            isPopular
                              ? "bg-primary text-white hover:bg-primary/90 shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-0.5"
                              : "bg-surface2 border border-border text-fg hover:border-primary/40 hover:text-primary hover:-translate-y-0.5"
                          }`}
                        >
                          Get {plan.name}
                        </button>
                      </Link>
                    </TiltCard>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-[11px] text-muted font-semibold mt-8 flex items-center justify-center gap-2">
              <Icon name="lock" className="w-3.5 h-3.5" />
              Secure payments via Razorpay · Credits never expire · Instant refund if mentor no-shows
            </p>
          </SiteContainer>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 6 — FAQ
            ══════════════════════════════════════════════════════ */}
        <section className="py-24">
          <SiteContainer>
            <div className="max-w-3xl mx-auto space-y-12">
              <div className="scroll-reveal reveal-up text-center space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Got Questions?</p>
                <h2 className="heading-display text-3xl md:text-4xl text-fg">Frequently Asked</h2>
              </div>

              <div className="space-y-3">
                {FAQS.map((faq, i) => (
                  <div key={i} className={`scroll-reveal reveal-up stagger-${Math.min(i + 1, 6)}`} data-reveal>
                    <FaqItem
                      q={faq.q}
                      a={faq.a}
                      open={openFaq === i}
                      onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                      idx={i}
                    />
                  </div>
                ))}
              </div>
            </div>
          </SiteContainer>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 7 — FINAL CTA BANNER
            ══════════════════════════════════════════════════════ */}
        <section className="py-20 relative overflow-hidden">
          {/* Ambient orbs */}
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-primary/10 blur-[100px] pointer-events-none rounded-full animate-float-slow" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/8 blur-[80px] pointer-events-none rounded-full animate-float" style={{ animationDuration: "9s" }} />

          <SiteContainer className="relative z-10">
            <TiltCard
              strength={4}
              className="scroll-reveal reveal-scale max-w-4xl mx-auto rounded-[40px] border border-border/60 bg-gradient-to-br from-surface via-surface to-surface2 p-12 md:p-20 text-center space-y-8 shadow-hero"
            >
              {/* Glow ring inside card */}
              <div className="absolute inset-0 rounded-[40px] overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-40 bg-primary/5 blur-[60px]" />
              </div>

              <div className="relative space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Mentors Available Now
                </div>
                <h2 className="heading-display text-4xl md:text-6xl text-fg leading-tight">
                  Ready for Real Campus Clarity?
                </h2>
                <p className="text-base md:text-lg text-muted font-medium max-w-xl mx-auto leading-relaxed">
                  Stop scrolling Reddit threads and watching biased YouTube rankings. Ask someone who's actually inside.
                </p>
              </div>

              <div className="relative flex flex-wrap items-center justify-center gap-4">
                <Link to="/explore">
                  <button className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-primary text-white font-black text-sm overflow-hidden shadow-[0_10px_40px_rgba(37,99,235,0.4)] hover:shadow-[0_14px_50px_rgba(37,99,235,0.55)] hover:-translate-y-1 transition-all duration-300">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    Find My Mentor — ₹69
                    <Icon name="arrow" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link to="/become-mentor">
                  <button className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl border border-border bg-surface/80 font-bold text-sm text-fg hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 backdrop-blur-sm">
                    Share Your Campus Experience
                    <span className="text-muted">& Earn</span>
                  </button>
                </Link>
              </div>

              <p className="relative text-[11px] text-muted font-bold flex flex-wrap items-center justify-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Icon name="check" className="w-3.5 h-3.5 text-success" /> No subscription needed
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="check" className="w-3.5 h-3.5 text-success" /> Instant refund guarantee
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="check" className="w-3.5 h-3.5 text-success" /> 100% private calls
                </span>
              </p>
            </TiltCard>
          </SiteContainer>
        </section>
      </main>

      <Footer />
    </div>
  );
}
