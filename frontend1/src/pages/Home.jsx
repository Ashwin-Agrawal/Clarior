import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import CollegeCard from "../components/CollegeCard";
import SiteContainer from "../components/layout/SiteContainer";
import useSEO from "../hooks/useSEO";

const stats = [
  { label: "Active Seniors", value: "200+", icon: "users" },
  { label: "Colleges", value: "40+", icon: "campus" },
  { label: "Success Stories", value: "1.2k", icon: "spark" },
];

const motivationTips = [
  {
    title: "A ₹69 call can save you lakhs.",
    text: "One honest conversation can prevent a costly mistake in college choices, branches, or placements.",
    badge: "🔥 Smart Choice",
    tagColor: "text-amber-600 bg-amber-500/10 border-amber-500/25 dark:text-amber-400"
  },
  {
    title: "The best advice is often one call away.",
    text: "Get clarity from someone who already walked the path you’re on right now.",
    badge: "⚡ Insider Access",
    tagColor: "text-primary bg-primary/10 border-primary/25 dark:text-primary"
  },
  {
    title: "Don’t guess when you can ask a senior.",
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
    badge: "Top Rated Senior"
  },
  {
    initials: "SC",
    name: "Shagun Chauhan",
    role: "Senior at Newton School of Technology",
    quote: "Talking to juniors and clearing their doubts about CSE vs AI branches is extremely rewarding. Clarior keeps the booking and call flow seamless.",
    badge: "Placement Star"
  },
  {
    initials: "SA",
    name: "Satvik Agrawal",
    role: "Senior at Jk lakshmipat university",
    quote: "Juniors often have massive confusion about university placements and CGPA. A quick 1:1 call saves them months of worry.",
    badge: "Popular Mentor"
  }
];

function Home() {
  const [scrolled, setScrolled] = useState(0);
  const [pulseLoading, setPulseLoading] = useState(true);
  const [activeTip, setActiveTip] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [collegesList, setCollegesList] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(true);


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
    fetchColleges();

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

        {/* Hero Section */}
        <section className="relative pt-20 pb-24 md:pt-28 md:pb-30 overflow-hidden">

          <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none opacity-80" style={{ background: "var(--hero-gradient)" }} />
          <div className="absolute left-8 top-14 h-28 w-28 rounded-full bg-primary/15 blur-3xl hero-orb" />
          <div className="absolute right-10 top-24 h-40 w-40 rounded-full bg-accent/15 blur-3xl hero-orb-delayed" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <SiteContainer className="relative">
              <div className="text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface/90 px-4 py-2 text-[11px] font-black text-primary uppercase tracking-[0.18em] mb-6 animate-fade-in shadow-[0_10px_35px_rgba(37,99,235,0.12)] mx-auto backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_0_4px_rgba(16,185,129,0.14)]" />
                  Trusted by 5000+ students
                </div>
                
                <h1 className="heading-display text-4xl sm:text-5xl md:text-7xl lg:text-[92px] font-black text-fg leading-[0.9] tracking-tighter animate-fade-up">
                  Stop guessing <br />
                  <span className="gradient-text inline-block">Ask someone inside.</span>
                </h1>
                
                <p className="mt-6 text-xl md:text-2xl text-muted max-w-4xl mx-auto leading-tight animate-fade-up delay-100 font-medium tracking-tight">
                  1:1 calls with verified seniors for <span className="text-primary font-black underline underline-offset-8 decoration-primary/20">₹69</span>.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-200">
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

                <div className="mt-8 flex flex-nowrap overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 gap-4 max-w-5xl mx-auto animate-fade-up delay-300">
                  {stats.map((s, index) => (
                    <div key={s.label} className="group relative min-w-[220px] flex-shrink-0 flex-grow overflow-hidden rounded-[28px] border border-border/70 bg-gradient-to-br from-surface via-surface/90 to-primary/5 p-5 text-center shadow-[0_20px_70px_-30px_rgba(37,99,235,0.28)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_90px_-35px_rgba(37,99,235,0.32)] sm:min-w-0" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_60%)] opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="relative z-10">
                        <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white">
                          <LineIcon name={s.icon} className="h-7 w-7" />
                        </div>
                        <div className="text-3xl md:text-4xl font-black text-fg tracking-tighter">{s.value}</div>
                        <div className="mt-2 text-[11px] font-black uppercase tracking-[0.28em] text-muted">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 mx-auto max-w-4xl animate-fade-up delay-400">
                  <div className="rounded-[32px] border border-border/80 bg-surface/75 p-5 md:p-7 shadow-[0_24px_80px_-25px_rgba(37,99,235,0.18)] dark:shadow-[0_24px_80px_-25px_rgba(96,165,250,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2 pb-2">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Why students book</div>
                        <div className="mt-1.5 text-sm font-semibold text-muted">Short, honest guidance that feels worth way more than ₹69.</div>
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
                      {/* Quote Watermark */}
                      <span className="absolute top-[-40px] left-[-15px] text-[180px] font-serif font-black text-primary/8 select-none pointer-events-none leading-none">“</span>
                      
                      <div key={activeTip} className="relative z-10 animate-quote-slide space-y-4">
                        {/* Quote Text */}
                        <div>
                          <div className="text-lg md:text-xl font-black text-fg tracking-tight leading-snug">{motivationTips[activeTip].title}</div>
                          <div className="mt-2 text-sm md:text-base text-muted font-medium leading-relaxed">{motivationTips[activeTip].text}</div>
                        </div>

                        {/* Interactive Badges & Action CTA Row */}
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

        {/* Trust/Colleges Section - Dynamic Sliding Carousel */}
        <section className="pt-8 pb-16 relative overflow-hidden">
          <SiteContainer>
            <div className="relative overflow-hidden rounded-[40px] border border-white/20 bg-gradient-to-br from-primary/4 via-surface to-accent/4 p-6 shadow-[0_25px_90px_-35px_rgba(37,99,235,0.32)] animate-fade-up md:p-10">
              <div className="absolute -inset-10 bg-gradient-to-tr from-primary/5 to-accent/5 rounded-[64px] blur-3xl pointer-events-none opacity-60" />
              <h2 className="relative z-10 text-[12px] font-black uppercase tracking-[0.5em] text-muted mb-8 text-center">Featuring colleges</h2>
              
              {/* Carousel Container */}
              <div className="relative z-10 w-full overflow-hidden mask-marquee py-4">
                {collegesLoading ? (
                  <div className="flex gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-[280px] sm:w-[320px] h-[340px] rounded-[28px] bg-surface2 animate-pulse flex-shrink-0" />
                    ))}
                  </div>
                ) : collegesList.length > 0 ? (
                  <div className="flex gap-6 animate-marquee w-max">
                    {/* First copy of colleges */}
                    {collegesList.slice(0, 15).map((college, idx) => (
                      <div key={`c1-${college._id}`} className="w-[280px] sm:w-[320px] flex-shrink-0 transition-transform duration-300 hover:scale-[1.03]">
                        <CollegeCard college={college} index={idx} />
                      </div>
                    ))}
                    {/* Second copy of colleges for seamless looping */}
                    {collegesList.slice(0, 15).map((college, idx) => (
                      <div key={`c2-${college._id}`} className="w-[280px] sm:w-[320px] flex-shrink-0 transition-transform duration-300 hover:scale-[1.03]">
                        <CollegeCard college={college} index={idx} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center w-full py-8 text-muted font-semibold">No colleges available</div>
                )}
              </div>

              <div className="mt-8 text-center relative z-10">
                <Link to="/explore" className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary hover:text-accent transition-colors duration-300">
                  View all colleges
                  <LineIcon name="arrow" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </SiteContainer>
        </section>

        {/* Features: "Why Clarior" */}
        <section className="py-32 relative">
          <SiteContainer>
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                <div className="inline-block px-4 py-1.5 rounded-full bg-accent/5 border border-accent/20 text-[10px] font-black text-accent uppercase tracking-widest">The Clarior Edge</div>
                <h2 className="heading-display text-4xl md:text-6xl font-black text-fg leading-tight">
                  Because Every Question <br /> <span className="text-accent">Deserves an Answer.</span>
                </h2>
                <p className="text-lg text-muted leading-relaxed">
                  Most platforms give you generic advice. We give you a direct line to the people who've actually been there. No hidden costs, no long-term commitments.
                </p>
                <div className="space-y-6">
                  {[
                    { t: "Verified Identity", d: "We manually verify every senior's college ID.", i: "shield" },
                    { t: "Fixed Price Fairness", d: "Talk to any senior for the same transparent price of ₹69.", i: "gem" },
                    { t: "Live 1:1 Calls", d: "Get direct, face-to-face clarity on Google Meet.", i: "call" },
                  ].map(f => (
                    <div key={f.t} className="flex gap-4 group">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-surface border border-border text-primary shadow-soft group-hover:bg-primary group-hover:text-black transition-all duration-300">
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

              <div className="relative w-full max-w-lg mx-auto">
                {/* Glow behind the slider */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-accent/20 rounded-[48px] blur-3xl pointer-events-none opacity-80 animate-pulse" />
                
                <div className="relative overflow-hidden rounded-2xl border border-border/40 shadow-card">
                  <div 
                    className="flex transition-transform duration-700 ease-out"
                    style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
                  >
                    {testimonials.map((t) => (
                      <div key={t.name} className="w-full flex-shrink-0 p-1">
                        <Card className="relative p-6 border-border/60 bg-surface/95 shadow-soft hover:shadow-lift transition-all duration-500 hover:scale-[1.01] h-[250px] flex flex-col justify-between group">
                          <div>
                            <div className="flex items-center gap-4 mb-4">
                              {/* Avatar circle with neutral background */}
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-base font-bold text-fg shadow-sm">
                                {t.initials}
                              </div>
                              <div>
                                <div className="font-bold text-fg text-base leading-tight">{t.name}</div>
                                <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-0.5">{t.role}</div>
                              </div>
                            </div>
                            
                            {/* Engaging Quote */}
                            <div className="flex gap-2 items-start mt-3">
                              <span className="text-3xl font-serif text-muted/30 leading-none select-none">“</span>
                              <p className="text-sm text-fg/80 italic leading-relaxed pt-0.5">
                                {t.quote}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-between items-center pt-3 border-t border-border/30">
                            <div className="flex gap-1 text-warning">
                              {[1,2,3,4,5].map(i => <svg key={i} width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                            </div>
                            <div className="text-[10px] font-black text-primary uppercase tracking-widest">{t.badge}</div>
                          </div>
                        </Card>
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

        {/* Pricing Section */}
        <section id="pricing" className="scroll-mt-28 py-24 bg-gradient-to-b from-bg to-surface2 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
          <SiteContainer className="relative">
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Simple pricing</div>
              <h2 className="mt-4 heading-display text-4xl md:text-6xl font-black text-fg tracking-tight">
                One clear price. No subscriptions.
              </h2>
              <p className="mt-5 text-lg text-muted leading-relaxed">
                Start with one call or buy a bundle when you want to compare colleges.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
              {[
                { 
                  label: "Single Pass", 
                  price: "₹69", 
                  note: "1 credit", 
                  cta: "Start with one call", 
                  variant: "secondary",
                  features: [
                    "20-minute focused 1:1 session", 
                    "Verified senior profiles", 
                    "Direct Google Meet connection",
                    "Ask anything about college life"
                  ] 
                },
                { 
                  label: "Growth Pack", 
                  price: "₹189", 
                  note: "3 credits", 
                  cta: "Get growth pack", 
                  variant: "primary",
                  features: [
                    "3 separate 20-minute sessions", 
                    "Save 9% overall compared to single pass", 
                    "Compare multiple branches/colleges",
                    "Priority customer & booking support"
                  ] 
                },
              ].map((plan) => (
                <Card key={plan.label} className={`p-8 ${plan.variant === "primary" ? "border-primary/30 shadow-lift ring-4 ring-primary/5" : ""}`}>
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-muted">{plan.label}</div>
                  <div className="mt-5 flex items-baseline gap-2">
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
                </Card>
              ))}
            </div>
          </SiteContainer>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <SiteContainer>
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-surface/95 p-8 text-center shadow-soft md:p-20">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.10),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(96,165,250,0.18),transparent_65%)]" />
              <div className="absolute inset-0 opacity-70" style={{ background: "var(--hero-gradient)" }} />
              <div className="relative z-10 space-y-8">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface2/80 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  5000+ students already inside
                </div>
                <h2 className="heading-display text-4xl font-black leading-tight text-fg md:text-7xl">
                  Stop overthinking. <br /> Start <span className="gradient-text">connecting.</span>
                </h2>
                <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
                  Join the platform where real conversations lead to real careers. Your future self will thank you.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
                  <Link to="/register">
                    <Button size="xl" className="rounded-full px-12 shadow-lift group">
                      Get Started Now
                      <svg className="ml-2 transition-transform group-hover:translate-x-1" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                    </Button>
                  </Link>
                  <Link to="/explore">
                    <Button variant="secondary" size="xl" className="rounded-full px-12">
                      Explore Seniors
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </SiteContainer>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Home;
