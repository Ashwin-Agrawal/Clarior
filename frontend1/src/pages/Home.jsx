import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SiteContainer from "../components/layout/SiteContainer";
import iitDelhiLogo from "../assets/iitdelhi.jpg";
import iitBomabay from "../assets/iitbombay.png";
import dtuLogo from "../assets/dtu.png";
import bitsLogo from "../assets/bitapilani.jpg";
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
  },
  {
    title: "The best advice is often one call away.",
    text: "Get clarity from someone who already walked the path you’re on right now.",
  },
  {
    title: "Don’t guess when you can ask a senior.",
    text: "Real guidance beats random internet opinions when the stakes are high.",
  },
];

const colleges = [
  { name: "IIT Delhi", logo: iitDelhiLogo, isImage: true },
  { name: "IIT Bombay", logo: iitBomabay, isImage: true },
  { name: "BITS Pilani", logo: bitsLogo, isImage: true },
  { name: "DTU Delhi", logo: dtuLogo, isImage: true },
  { name: "NSUT Delhi", logo: "NS", isImage: false },
  { name: "IIIT Delhi", logo: "3D", isImage: false },
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

function Home() {
  const [scrolled, setScrolled] = useState(0);
  const [pulseLoading, setPulseLoading] = useState(true);
  const [activeTip, setActiveTip] = useState(0);

  useSEO({ title: "Home", description: "Talk to verified seniors from top Indian colleges for ₹69. Get clarity on college, branch, placements and more." });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPulseLoading(false);
    }, 1500);

    const tipTimer = window.setInterval(() => {
      setActiveTip((prev) => (prev + 1) % motivationTips.length);
    }, 4200);

    const handleScroll = () => {
      const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setScrolled(Math.min(progress, 1));
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.clearInterval(tipTimer);
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

                <div className="mt-5 mx-auto max-w-4xl animate-fade-up delay-400">
                  <div className="rounded-[24px] border border-primary/10 bg-surface/85 p-4 shadow-[0_20px_60px_-26px_rgba(37,99,235,0.24)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Why students book</div>
                        <div className="mt-1 text-sm text-muted">Short, honest guidance that feels worth way more than ₹69.</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {motivationTips.map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            aria-label={`Show tip ${index + 1}`}
                            onClick={() => setActiveTip(index)}
                            className={`h-2.5 rounded-full transition-all ${activeTip === index ? "w-7 bg-primary" : "w-2.5 bg-primary/30"}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 rounded-[20px] bg-gradient-to-br from-primary/8 via-surface to-accent/8 p-4 md:p-5 shadow-inner">
                      <div className="text-base md:text-lg font-black text-fg">{motivationTips[activeTip].title}</div>
                      <div className="mt-2 text-sm md:text-[15px] text-muted leading-relaxed">{motivationTips[activeTip].text}</div>
                    </div>
                  </div>
                </div>
              </div>
          </SiteContainer>
        </section>

        {/* Trust/Colleges Section */}
        <section className="pt-8 pb-16 relative overflow-hidden">
          <SiteContainer>
            <div className="relative overflow-hidden rounded-[40px] border border-white/20 bg-gradient-to-br from-primary/4 via-surface to-accent/4 p-6 shadow-[0_25px_90px_-35px_rgba(37,99,235,0.32)] animate-fade-up md:p-10">
              <div className="absolute -inset-10 bg-gradient-to-tr from-primary/5 to-accent/5 rounded-[64px] blur-3xl pointer-events-none opacity-60" />
              <h2 className="relative z-10 text-[12px] font-black uppercase tracking-[0.5em] text-muted mb-8 text-center">Featuring colleges</h2>
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 md:gap-8 items-center justify-items-center">
                {colleges.map(c => (
                  <div key={c.name} className="flex flex-col items-center gap-4 group cursor-default rounded-2xl px-2 py-3 transition-transform duration-500 hover:-translate-y-1">
                    <div className="relative flex items-center justify-center h-14 md:h-16 w-14 md:w-16">
                      <div className="absolute -inset-8 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      {c.isImage ? (
                        <img src={c.logo} alt={c.name} className="h-14 md:h-16 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-125 group-hover:-rotate-3" />
                      ) : (
                        <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-surface/50 border border-border flex items-center justify-center text-primary font-black text-xl tracking-tight grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-125 group-hover:-rotate-3 shadow-sm">
                          {c.logo}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted/60 group-hover:text-primary transition-colors duration-300 text-center">{c.name}</span>
                  </div>
                ))}
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

              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-accent/20 rounded-[48px] blur-3xl pointer-events-none opacity-80 animate-pulse" />
                <Card className="relative p-8 border-border/50 bg-surface  overflow-hidden shadow-hero hover:shadow-lift transition-all duration-500 hover:scale-[1.02]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">AA</div>
                    <div>
                      <div className="font-bold text-fg">Ashwin Agrawal</div>
                      <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Senior at Newton School of Technology</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-surface2 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[85%] animate-shimmer" />
                    </div>
                    <div className="h-4 w-[60%] bg-surface2 rounded-full overflow-hidden">
                      <div className="h-full bg-accent w-[40%] animate-shimmer" />
                    </div>
                  </div>
                  <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-sm italic text-fg/80 leading-relaxed">
                    "I helped over 50 students choose the right college last year. Clarior makes it so easy to connect with those who really need guidance."
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <div className="flex gap-1 text-warning">
                      {[1,2,3,4,5].map(i => <svg key={i} width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                    </div>
                    <div className="text-[10px] font-black text-primary uppercase tracking-widest">Top Rated Senior</div>
                  </div>
                </Card>
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
                    "25-minute focused 1:1 session", 
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
                    "3 separate 25-minute sessions", 
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
