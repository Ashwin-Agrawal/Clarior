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

const stats = [
  { label: "Active Seniors", value: "200+", icon: "users" },
  { label: "Colleges", value: "40+", icon: "campus" },
  { label: "Success Stories", value: "1.2k", icon: "spark" },
];

const colleges = [
  { name: "IIT Delhi", logo: iitDelhiLogo },
  { name: "IIT Bombay", logo: iitBomabay },
  { name: "BITS Pilani", logo: bitsLogo },
  { name: "DTU Delhi", logo: dtuLogo },
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Navbar />
      <main className="bg-bg overflow-x-hidden">
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-1 z-[60] pointer-events-none">
          <div className="h-full bg-primary origin-left transition-transform duration-150" style={{ transform: `scaleX(${scrolled ? 1 : 0})` }} />
        </div>

        {/* Hero Section */}
        <section className="relative pt-28 pb-32 md:pt-40 md:pb-48 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] majestic-blob animate-float-slow" style={{ backgroundColor: 'rgba(37, 99, 235, 0.2)' }} />
          <div className="absolute bottom-[-10%] right-[-10%] majestic-blob animate-float-slow delay-500" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)' }} />
          <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: "var(--hero-gradient)" }} />
          <SiteContainer className="relative">
              <div className="text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface/80 px-4 py-2 text-[11px] font-black text-primary uppercase tracking-[0.18em] mb-8 animate-fade-in shadow-sm backdrop-blur-xl mx-auto">
                  <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_0_4px_rgba(16,185,129,0.14)]" />
                  Trusted by 5000+ students
                </div>
                
                <h1 className="heading-display text-6xl md:text-[100px] font-black text-fg leading-[0.9] tracking-tighter animate-fade-up">
                  Stop guessing <br />
                  <span className="gradient-text">Ask someone inside.</span>
                </h1>
                
                <p className="mt-10 text-2xl md:text-3xl text-muted max-w-4xl mx-auto leading-tight animate-fade-up delay-100 font-medium tracking-tight">
                  1:1 calls with verified seniors for <span className="text-primary font-black underline underline-offset-8 decoration-primary/20">₹69</span>.
                </p>

                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-up delay-200">
                  <Link to="/explore">
                    <Button size="xl" className="w-full sm:w-auto rounded-full px-12 shadow-hero group">
                      Explore Seniors
                      <LineIcon name="arrow" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link to="/how-it-works">
                    <Button variant="secondary" size="xl" className="w-full sm:w-auto rounded-full px-12">
                      See how it works
                    </Button>
                  </Link>
                </div>

                <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fade-up delay-300">
                  {stats.map((s) => (
                    <div key={s.label} className="glass rounded-[40px] p-8 flex flex-col items-center text-center shadow-hero transition-all hover:scale-[1.05] group">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        <LineIcon name={s.icon} className="h-8 w-8" />
                      </div>
                      <div className="text-4xl md:text-5xl font-black text-fg tracking-tighter">{s.value}</div>
                      <div className="mt-3 text-[12px] font-black text-muted uppercase tracking-[0.3em]">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
          </SiteContainer>
        </section>

        {/* Trust/Colleges Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 majestic-blob opacity-10" />
          <SiteContainer>
            <div className="glass p-12 md:p-20 rounded-[64px] border border-white/20 shadow-2xl">
              <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-muted mb-16 text-center">Seniors from top institutions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-24 items-center justify-items-center">
                {colleges.map(c => (
                  <div key={c.name} className="flex flex-col items-center gap-6 group cursor-default">
                    <div className="relative">
                      <div className="absolute -inset-8 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <img src={c.logo} alt={c.name} className="h-16 md:h-20 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-125 group-hover:-rotate-3" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted/60 group-hover:text-primary transition-colors duration-300">{c.name}</span>
                  </div>
                ))}
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
                    { t: "Verified Identity", d: "We manually verify every senior's college ID and LinkedIn.", i: "shield" },
                    { t: "Fixed Price Fairness", d: "Talk to any senior for the same transparent price of ₹69.", i: "gem" },
                    { t: "Live 1:1 Calls", d: "Get direct, face-to-face clarity on Google Meet.", i: "call" },
                  ].map(f => (
                    <div key={f.t} className="flex gap-4 group">
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

              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full" />
                <Card className="relative p-8 border-border/50 bg-surface/50 backdrop-blur-3xl overflow-hidden shadow-hero hover:shadow-lift transition-all duration-500 hover:scale-[1.02]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">JD</div>
                    <div>
                      <div className="font-bold text-fg">Arjun Mehra</div>
                      <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Senior at IIT Madras</div>
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
                    "I helped over 50 students choose the right branch last year. Clarior makes it so easy to connect with those who really need guidance."
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
        <section id="pricing" className="scroll-mt-28 py-24 bg-surface/35 border-y border-border/50">
          <SiteContainer>
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
                { label: "Single Pass", price: "₹69", note: "1 credit", cta: "Start with one call", variant: "secondary" },
                { label: "Growth Pack", price: "₹189", note: "3 credits", cta: "Compare colleges", variant: "primary" },
              ].map((plan) => (
                <Card key={plan.label} className={`p-8 ${plan.variant === "primary" ? "border-primary/30 shadow-lift ring-4 ring-primary/5" : ""}`}>
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-muted">{plan.label}</div>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tight text-fg">{plan.price}</span>
                    <span className="font-semibold text-muted">/ {plan.note}</span>
                  </div>
                  <div className="mt-6 space-y-3">
                    {["25-minute focused session", "Verified senior profiles", "Google Meet booking flow"].map((item) => (
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
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 p-8 md:p-20 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.2),transparent_70%)]" />
              <div className="relative z-10 space-y-8">
                <h2 className="heading-display text-4xl md:text-7xl font-black text-white leading-tight">
                  Stop overthinking. <br /> Start <span className="gradient-text">connecting.</span>
                </h2>
                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                  Join the platform where real conversations lead to real careers. Your future self will thank you.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Link to="/register">
                    <Button size="xl" className="rounded-full px-12 bg-white text-slate-950 hover:bg-slate-100 shadow-lift group">
                      Get Started Now
                      <svg className="ml-2 group-hover:translate-x-1 transition-transform" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
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
