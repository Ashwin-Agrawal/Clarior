import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SiteContainer from "../components/layout/SiteContainer";
import useSEO from "../hooks/useSEO";

function LineIcon({ name, className = "h-5 w-5" }) {
  const paths = {
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    campus: <><path d="M3 21h18" /><path d="M5 21V9l7-4 7 4v12" /><path d="M9 21v-7h6v7" /><path d="M9 10h.01M15 10h.01" /></>,
    spark: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="M19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8L19 17Z" /></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    gem: <><path d="M6 3h12l4 6-10 12L2 9l4-6Z" /><path d="M2 9h20M8 3l4 18 4-18" /></>,
    call: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    check: <path d="m5 13 4 4L19 7" />,
    video: <><path d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z" /></>,
    clock: <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
  };

  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name] || paths.spark}
    </svg>
  );
}

const faqList = [
  {
    q: "How does 1:1 senior mentorship work on Clarior?",
    a: "You select a verified mentor based on your target branch, stream, or interest, pick an available time slot, and book a 20-minute session using a ₹69 credit pass. You will join an encrypted in-app video/audio call room."
  },
  {
    q: "How are mentors verified on the platform?",
    a: "Every mentor undergoes manual verification before their availability slots are listed. We verify their identity, active college enrollment status, and academic credentials."
  },
  {
    q: "Are my contact details kept private during calls?",
    a: "Yes, 100%. All sessions are hosted directly inside Clarior's secure WebRTC call room. Your personal phone number and personal email address are never shared."
  },
  {
    q: "What happens if a mentor does not join the scheduled session?",
    a: "We maintain an automatic refund policy. If a session cannot take place due to mentor absence, your credit pass is instantly refunded back to your account balance."
  },
  {
    q: "How can college seniors apply to become mentors?",
    a: "If you are currently enrolled in a college or university, click 'Become a Mentor', submit your basic details and college verification info. Once reviewed by our team, you can set your availability and earn."
  }
];

export default function Home() {
  useSEO({
    title: "Clarior — Authentic 1:1 Guidance from Verified Campus Mentors",
    description: "Connect 1-on-1 with verified college students for uncensored campus insights, branch guidance, and placement realities starting at ₹69.",
  });

  // Real backend statistics & dynamic real mentors
  const [stats, setStats] = useState({ totalSeniors: 0, totalColleges: 0, totalSessions: 0 });
  const [realMentors, setRealMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchPlatformData = async () => {
      try {
        const [statsRes, mentorsRes] = await Promise.allSettled([
          api.get("/colleges/stats"),
          api.get("/users/seniors")
        ]);

        if (isMounted) {
          if (statsRes.status === "fulfilled" && statsRes.value?.data) {
            setStats({
              totalSeniors: statsRes.value.data.totalSeniors || statsRes.value.data.verifiedSeniors || 0,
              totalColleges: statsRes.value.data.totalColleges || 0,
              totalSessions: statsRes.value.data.totalSessions || statsRes.value.data.completedSessions || 0,
            });
          }

          if (mentorsRes.status === "fulfilled" && mentorsRes.value?.data) {
            const list = Array.isArray(mentorsRes.value.data)
              ? mentorsRes.value.data
              : mentorsRes.value.data.seniors || [];
            setRealMentors(list.slice(0, 6));
          }
        }
      } catch (err) {
        console.error("Failed to load platform stats", err);
      } finally {
        if (isMounted) setLoadingMentors(false);
      }
    };

    fetchPlatformData();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-bg text-fg overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <main>
        {/* ── 1. HERO SECTION ────────────────────────────────────────── */}
        <section className="relative pt-12 md:pt-20 pb-16 md:pb-28 overflow-hidden">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-primary/15 via-accent/15 to-transparent blur-[120px] pointer-events-none rounded-full" />
          <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 blur-[90px] pointer-events-none rounded-full" />

          <SiteContainer className="relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              
              {/* Trust Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/80 bg-surface/80 backdrop-blur-md shadow-soft">
                <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-fg">
                  Direct 1:1 Mentorship • Verified Campus Mentors
                </span>
              </div>

              {/* Hero Title */}
              <h1 className="heading-display text-4xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight">
                Stop Guessing Your Future.
                <br />
                <span className="gradient-text-animated block mt-2">
                  Get Advice From Real Campus Insiders.
                </span>
              </h1>

              {/* Hero Description */}
              <p className="text-lg md:text-xl text-muted font-medium max-w-2xl mx-auto leading-relaxed">
                Connect 1-on-1 with verified college students for authentic, unbiased guidance on campus life, branch choices, placements, and admission reality.
              </p>

              {/* Price Callout & CTAs */}
              <div className="pt-2 space-y-6">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-sm shadow-sm">
                  <span>Flat ₹69 Credit Pass Per Session</span>
                  <span className="text-border/60">•</span>
                  <span className="text-success font-extrabold flex items-center gap-1">
                    <LineIcon name="check" className="w-4 h-4 text-success" /> Refund Guarantee
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  <Link to="/explore">
                    <Button variant="primary" size="lg" className="rounded-2xl px-8 py-4 font-black shadow-lg hover:scale-105 transition-transform">
                      Explore Mentors <LineIcon name="arrow" className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                  <a href="#how-it-works">
                    <Button variant="secondary" size="lg" className="rounded-2xl px-8 py-4 font-bold">
                      How It Works
                    </Button>
                  </a>
                  <Link to="/become-mentor">
                    <Button variant="ghost" size="lg" className="rounded-2xl px-6 py-4 font-bold text-muted hover:text-fg">
                      Become a Mentor →
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Key Features Pill Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-8 border-t border-border/40 text-xs font-bold text-muted">
                <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-surface/40 border border-border/40">
                  <LineIcon name="shield" className="w-4 h-4 text-primary shrink-0" />
                  <span>100% Unbiased Talk</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-surface/40 border border-border/40">
                  <LineIcon name="video" className="w-4 h-4 text-accent shrink-0" />
                  <span>In-App Private Calls</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-surface/40 border border-border/40">
                  <LineIcon name="gem" className="w-4 h-4 text-warning shrink-0" />
                  <span>₹69 Fixed Price</span>
                </div>
                <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-surface/40 border border-border/40">
                  <LineIcon name="check" className="w-4 h-4 text-success shrink-0" />
                  <span>No-Show Refund</span>
                </div>
              </div>

            </div>
          </SiteContainer>
        </section>

        {/* ── 2. REAL BACKEND MENTORS & PLATFORM STATS ───────────────── */}
        <section className="py-16 bg-surface/30 border-y border-border/40">
          <SiteContainer>
            <div className="space-y-12">
              
              {/* Dynamic Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <Card className="p-6 border-t-4 border-t-primary bg-surface/60">
                  <div className="text-3xl md:text-4xl font-black text-fg">
                    {stats.totalSeniors > 0 ? stats.totalSeniors : "Verified"}
                  </div>
                  <div className="text-xs font-black uppercase tracking-wider text-muted mt-1">
                    Campus Mentors Registered
                  </div>
                </Card>
                <Card className="p-6 border-t-4 border-t-accent bg-surface/60">
                  <div className="text-3xl md:text-4xl font-black text-fg">
                    {stats.totalColleges > 0 ? stats.totalColleges : "Active"}
                  </div>
                  <div className="text-xs font-black uppercase tracking-wider text-muted mt-1">
                    Institutions Represented
                  </div>
                </Card>
                <Card className="p-6 border-t-4 border-t-success bg-surface/60">
                  <div className="text-3xl md:text-4xl font-black text-fg">
                    {stats.totalSessions > 0 ? stats.totalSessions : "Timer-Tracked"}
                  </div>
                  <div className="text-xs font-black uppercase tracking-wider text-muted mt-1">
                    1:1 Sessions Completed
                  </div>
                </Card>
              </div>

              {/* Dynamic Real Mentors Preview (If Mentors Exist in Backend) */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="heading-display text-2xl font-black text-fg">Discover Verified Campus Mentors</h2>
                    <p className="text-xs text-muted font-semibold mt-1">Connect directly with active students enrolled in target programs.</p>
                  </div>
                  <Link to="/explore">
                    <Button variant="secondary" size="sm" className="rounded-xl font-bold text-xs">
                      View All Mentors →
                    </Button>
                  </Link>
                </div>

                {loadingMentors ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-6 space-y-4 animate-pulse">
                        <div className="h-12 w-12 rounded-2xl bg-surface2" />
                        <div className="h-4 w-3/4 bg-surface2 rounded" />
                        <div className="h-3 w-1/2 bg-surface2 rounded" />
                      </Card>
                    ))}
                  </div>
                ) : realMentors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {realMentors.map((mentor) => {
                      const initials = mentor.name
                        ? mentor.name.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                        : "M";
                      return (
                        <Card key={mentor._id} className="p-6 hover:border-primary/40 hover:shadow-lift transition-all space-y-4 group">
                          <div className="flex items-center justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-lg border border-primary/20">
                              {initials}
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-success/10 text-success border border-success/20 flex items-center gap-1">
                              <LineIcon name="check" className="w-3 h-3 text-success" /> Verified
                            </span>
                          </div>

                          <div>
                            <h3 className="font-extrabold text-fg text-base group-hover:text-primary transition-colors">
                              {mentor.branch || "College Student"}
                            </h3>
                            <p className="text-xs text-muted font-semibold mt-0.5">
                              {mentor.year ? `${mentor.year} Year` : "Active Enrolled Student"}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs font-bold">
                            <span className="text-muted">⭐ {mentor.rating ? mentor.rating.toFixed(1) : "New"} ({mentor.numReviews || 0} reviews)</span>
                            <Link to={`/profile/${mentor._id}`} className="text-primary hover:underline">
                              View Profile & Slots →
                            </Link>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="p-8 text-center space-y-3 border-dashed">
                    <LineIcon name="users" className="w-10 h-10 text-primary mx-auto" />
                    <h3 className="font-extrabold text-fg">Browse Platform Mentors</h3>
                    <p className="text-xs text-muted max-w-md mx-auto">Explore verified mentors across various branches, academic tracks, and specializations.</p>
                    <Link to="/explore">
                      <Button variant="primary" size="sm" className="rounded-xl px-6 mt-2 font-bold">
                        Browse All Profiles
                      </Button>
                    </Link>
                  </Card>
                )}
              </div>

            </div>
          </SiteContainer>
        </section>

        {/* ── 3. VALUE PILLARS BENTO GRID ────────────────────────────── */}
        <section className="py-20">
          <SiteContainer>
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
              <span className="text-xs font-black uppercase tracking-widest text-primary">Why Choose Clarior</span>
              <h2 className="heading-display text-3xl sm:text-5xl font-black text-fg">
                Designed for Authentic Campus Clarity
              </h2>
              <p className="text-sm md:text-base text-muted font-medium">
                Traditional advice is often corrupted by sales commissions, biased ranking tables, and sponsored content. Clarior keeps it 100% genuine.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <Card className="p-6 space-y-4 border-t-4 border-t-primary hover:shadow-lift transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <LineIcon name="shield" className="w-6 h-6" />
                </div>
                <h3 className="font-black text-fg text-lg">Direct Uncensored Advice</h3>
                <p className="text-xs text-muted leading-relaxed font-semibold">
                  Talk directly to active students inside campus. Get unvarnished facts on placements, hostel life, and branch workloads.
                </p>
              </Card>

              <Card className="p-6 space-y-4 border-t-4 border-t-accent hover:shadow-lift transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <LineIcon name="video" className="w-6 h-6" />
                </div>
                <h3 className="font-black text-fg text-lg">Encrypted 1:1 In-App Calls</h3>
                <p className="text-xs text-muted leading-relaxed font-semibold">
                  All calls take place inside our secure WebRTC room. Zero phone number or email exposure ensures total user privacy.
                </p>
              </Card>

              <Card className="p-6 space-y-4 border-t-4 border-t-warning hover:shadow-lift transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10 text-warning">
                  <LineIcon name="spark" className="w-6 h-6" />
                </div>
                <h3 className="font-black text-fg text-lg">Zero Sales Commissions</h3>
                <p className="text-xs text-muted leading-relaxed font-semibold">
                  Mentors have zero financial stakes or agent commissions in pushing any specific institution. Pure honest guidance.
                </p>
              </Card>

              <Card className="p-6 space-y-4 border-t-4 border-t-success hover:shadow-lift transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
                  <LineIcon name="gem" className="w-6 h-6" />
                </div>
                <h3 className="font-black text-fg text-lg">Flat ₹69 Credit Pass</h3>
                <p className="text-xs text-muted leading-relaxed font-semibold">
                  No ₹50,000 package traps. Pay a flat ₹69 pass per 20-minute call with instant credit refund if a mentor no-shows.
                </p>
              </Card>

            </div>
          </SiteContainer>
        </section>

        {/* ── 4. HOW IT WORKS ────────────────────────────────────────── */}
        <section id="how-it-works" className="py-20 bg-surface/30 border-y border-border/40">
          <SiteContainer>
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
              <span className="text-xs font-black uppercase tracking-widest text-primary">Simple 3-Step Process</span>
              <h2 className="heading-display text-3xl sm:text-5xl font-black text-fg">
                How Your 1:1 Session Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="relative space-y-4 p-8 rounded-3xl bg-surface border border-border/60 shadow-soft">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white font-black text-lg">
                  1
                </div>
                <h3 className="font-black text-fg text-xl">Find Your Mentor</h3>
                <p className="text-xs text-muted leading-relaxed font-semibold">
                  Browse mentor profiles on the Explore page by academic branch, background, or specialization area.
                </p>
              </div>

              <div className="relative space-y-4 p-8 rounded-3xl bg-surface border border-border/60 shadow-soft">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white font-black text-lg">
                  2
                </div>
                <h3 className="font-black text-fg text-xl">Book a Slot with Pass</h3>
                <p className="text-xs text-muted leading-relaxed font-semibold">
                  Select an available date and time slot that suits you and confirm using 1 credit pass (₹69).
                </p>
              </div>

              <div className="relative space-y-4 p-8 rounded-3xl bg-surface border border-border/60 shadow-soft">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success text-white font-black text-lg">
                  3
                </div>
                <h3 className="font-black text-fg text-xl">Join Live 1:1 Call</h3>
                <p className="text-xs text-muted leading-relaxed font-semibold">
                  Enter the private, timer-tracked in-app video/audio room, ask your preparation notes, and gain total clarity.
                </p>
              </div>

            </div>
          </SiteContainer>
        </section>

        {/* ── 5. PRICING PLANS ───────────────────────────────────────── */}
        <section className="py-20">
          <SiteContainer>
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
              <span className="text-xs font-black uppercase tracking-widest text-primary">Transparent Pricing</span>
              <h2 className="heading-display text-3xl sm:text-5xl font-black text-fg">
                Simple, Honest Credit Passes
              </h2>
              <p className="text-sm text-muted font-medium">
                No subscription commitments or hidden charges. Purchase credit passes and use them whenever you need guidance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              
              {/* Plan 1 */}
              <Card className="p-8 space-y-6 flex flex-col justify-between border-t-4 border-t-border">
                <div className="space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-muted">Single Pass</span>
                  <div className="text-4xl font-black text-fg">
                    ₹69 <span className="text-xs font-bold text-muted font-sans">/ 1 Call Credit</span>
                  </div>
                  <p className="text-xs text-muted font-semibold leading-relaxed">
                    Perfect for a quick 20-minute targeted discussion with a campus mentor.
                  </p>
                  <ul className="space-y-2.5 pt-4 border-t border-border/40 text-xs font-bold text-fg">
                    <li className="flex items-center gap-2">
                      <LineIcon name="check" className="w-4 h-4 text-success shrink-0" /> 1 Full 20-Min Session
                    </li>
                    <li className="flex items-center gap-2">
                      <LineIcon name="check" className="w-4 h-4 text-success shrink-0" /> Session Prep Notes Workspace
                    </li>
                    <li className="flex items-center gap-2">
                      <LineIcon name="check" className="w-4 h-4 text-success shrink-0" /> Full Credit Refund if Cancelled
                    </li>
                  </ul>
                </div>
                <Link to="/buy-credits" className="w-full">
                  <Button variant="secondary" className="w-full rounded-2xl font-bold py-3.5">
                    Buy 1 Pass (₹69)
                  </Button>
                </Link>
              </Card>

              {/* Plan 2 - Featured */}
              <Card className="p-8 space-y-6 flex flex-col justify-between border-2 border-primary shadow-hero relative overflow-hidden bg-primary/[0.02]">
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                  Most Popular
                </div>
                <div className="space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-primary">Power Pass (3 Calls)</span>
                  <div className="text-4xl font-black text-fg">
                    ₹189 <span className="text-xs font-bold text-muted font-sans">/ 3 Call Credits</span>
                  </div>
                  <p className="text-xs text-muted font-semibold leading-relaxed">
                    Ideal for comparing multiple branches or speaking with mentors across different tracks.
                  </p>
                  <ul className="space-y-2.5 pt-4 border-t border-border/40 text-xs font-bold text-fg">
                    <li className="flex items-center gap-2">
                      <LineIcon name="check" className="w-4 h-4 text-success shrink-0" /> 3 Full 20-Min Sessions (Save ₹20)
                    </li>
                    <li className="flex items-center gap-2">
                      <LineIcon name="check" className="w-4 h-4 text-success shrink-0" /> Priority Booking Access
                    </li>
                    <li className="flex items-center gap-2">
                      <LineIcon name="check" className="w-4 h-4 text-success shrink-0" /> Credits Never Expire
                    </li>
                  </ul>
                </div>
                <Link to="/buy-credits" className="w-full">
                  <Button variant="primary" className="w-full rounded-2xl font-black py-3.5 shadow-md">
                    Get 3 Passes (₹189)
                  </Button>
                </Link>
              </Card>

              {/* Plan 3 */}
              <Card className="p-8 space-y-6 flex flex-col justify-between border-t-4 border-t-accent">
                <div className="space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-accent">Career Pass (5 Calls)</span>
                  <div className="text-4xl font-black text-fg">
                    ₹299 <span className="text-xs font-bold text-muted font-sans">/ 5 Call Credits</span>
                  </div>
                  <p className="text-xs text-muted font-semibold leading-relaxed">
                    Best value for complete counselling research across multiple parameters and reviews.
                  </p>
                  <ul className="space-y-2.5 pt-4 border-t border-border/40 text-xs font-bold text-fg">
                    <li className="flex items-center gap-2">
                      <LineIcon name="check" className="w-4 h-4 text-success shrink-0" /> 5 Full 20-Min Sessions (Save ₹46)
                    </li>
                    <li className="flex items-center gap-2">
                      <LineIcon name="check" className="w-4 h-4 text-success shrink-0" /> Full Refund Guarantee
                    </li>
                    <li className="flex items-center gap-2">
                      <LineIcon name="check" className="w-4 h-4 text-success shrink-0" /> Dedicated User Support
                    </li>
                  </ul>
                </div>
                <Link to="/buy-credits" className="w-full">
                  <Button variant="secondary" className="w-full rounded-2xl font-bold py-3.5">
                    Get 5 Passes (₹299)
                  </Button>
                </Link>
              </Card>

            </div>
          </SiteContainer>
        </section>

        {/* ── 6. FREQUENTLY ASKED QUESTIONS (FAQ) ────────────────────── */}
        <section className="py-20 bg-surface/30 border-y border-border/40">
          <SiteContainer>
            <div className="max-w-3xl mx-auto space-y-8">
              
              <div className="text-center space-y-3">
                <span className="text-xs font-black uppercase tracking-widest text-primary">Got Questions?</span>
                <h2 className="heading-display text-3xl font-black text-fg">Frequently Asked Questions</h2>
              </div>

              <div className="space-y-4">
                {faqList.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-border/60 bg-surface overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-5 text-left font-black text-fg text-sm flex items-center justify-between gap-4 cursor-pointer hover:bg-surface2/40 transition-colors"
                      >
                        <span>{faq.q}</span>
                        <span className={`text-base transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : "text-muted"}`}>
                          ▼
                        </span>
                      </button>

                      {isOpen && (
                        <div className="p-5 pt-0 text-xs font-semibold text-muted leading-relaxed border-t border-border/30">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </SiteContainer>
        </section>

        {/* ── 7. FINAL ACTION CALLOUT ────────────────────────────────── */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-accent/10 to-transparent pointer-events-none" />
          <SiteContainer className="relative z-10">
            <Card className="p-10 md:p-16 text-center space-y-6 max-w-4xl mx-auto rounded-[36px] border-primary/20 bg-gradient-to-b from-surface via-surface to-surface2">
              <h2 className="heading-display text-3xl sm:text-5xl font-black text-fg">
                Ready to Get Genuine Campus Clarity?
              </h2>
              <p className="text-sm sm:text-base text-muted font-medium max-w-xl mx-auto leading-relaxed">
                Connect with verified college mentors today. No guesswork, no sales commissions — just direct, uncensored advice.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link to="/explore">
                  <Button variant="primary" size="lg" className="rounded-2xl px-8 py-4 font-black shadow-lg">
                    Find Your Mentor Now (₹69)
                  </Button>
                </Link>
                <Link to="/become-mentor">
                  <Button variant="secondary" size="lg" className="rounded-2xl px-8 py-4 font-bold">
                    Become a Mentor
                  </Button>
                </Link>
              </div>
            </Card>
          </SiteContainer>
        </section>
      </main>

      <Footer />
    </div>
  );
}
