import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO";

const studentSteps = [
  {  title: "Browse senior profiles", desc: "Filter by college, domain, and branch. Read bios, check ratings, and find a senior who's been exactly where you are." },
  { title: "Pick a time slot", desc: "Book an open slot directly from the senior's profile. One credit = one 20-minute guided session." },
  { title: "Confirm & start the session", desc: "When your session begins, confirm it on the platform to start the 20-minute timer." },
  { title: "20-minute live call", desc: "Join the call, ask your questions, and get honest answers from someone who's been through it." },
  { title: "Rate your experience", desc: "After the session, submit a review. Your rating keeps quality high for everyone." },
];

const seniorSteps = [
  {  title: "Apply and get verified", desc: "Submit your profile and college details. Our team reviews and approves verified seniors within 48 hours." },
  { title: "Set your availability", desc: "Add open time slots whenever you're free. Students book directly from your profile." },
  { title: "Guide a student", desc: "Join the call and share your honest, experience-based perspective. No scripts, just real talk." },
  { title: "Earn per session", desc: "Earn ₹52 per completed session. Once you hit the payout threshold, request a withdrawal anytime." },
];

const policies = [
  { icon: "🛡️", title: "Verified seniors only", desc: "Every senior is manually reviewed before they can accept bookings." },
  { icon: "⚖️", title: "Honest guidance required", desc: "Misleading advice or repeated poor feedback leads to account removal." },
  { icon: "📊", title: "Transparent ratings", desc: "Every session is rated. Quality stays visible and accountability stays real." },
];

function Step({ number, title, desc, last = false }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-accent text-sm font-extrabold text-primaryFg shadow-soft">
          {number}
        </div>
        {!last && <div className="mt-2 w-0.5 flex-1 min-h-8 bg-linear-to-b from-primary/40 to-transparent" />}
      </div>
      <div className="flex-1 pb-8">
        <div className="rounded-2xl border border-border/70 bg-surface/95 p-5 shadow-soft transition-smooth hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lift">
          <div className="mb-2 flex items-center gap-2.5">
            <h3 className="text-base font-bold text-fg">{title}</h3>
          </div>
          <p className="text-sm leading-6 text-muted">{desc}</p>
        </div>
      </div>
    </div>
  );
}

const faqItems = [
  { group: "general", q: "What is Clarior?", a: "Clarior is a peer mentorship platform connecting students with verified college seniors for 1-on-1 counseling calls. Seniors share their honest, firsthand experience about college selection, branches, and placement preparation." },
  { group: "general", q: "How long is each guidance session?", a: "Each scheduled session is exactly 20 minutes long. This keeps the conversation focused, highly efficient, and productive." },
  { group: "students", q: "How do I book a session?", a: "Go to 'Buy Credits' to purchase a session pass (1 credit = 1 session). Then browse the 'Colleges' directory, select a verified senior's profile, choose an available time slot, and click Book." },
  { group: "students", q: "What happens if a senior cancels or misses a call?", a: "If a senior cancels a session or fails to show up, the credit is immediately refunded back to your account wallet so you can book another slot." },
  { group: "seniors", q: "How do I earn on Clarior?", a: "You earn ₹52 per completed 20-minute guidance call. Once your application is verified, you can set your open time slots and accept bookings." },
  { group: "seniors", q: "When can I withdraw my earnings?", a: "Once your session is marked complete, you can request a withdrawal via UPI directly from your dashboard balance. Withdrawals are processed within 24 hours." }
];

// ── Interactive Call Room Mockup ────────────────────
function HeroMockupRoom() {
  const [timeLeft, setTimeLeft] = useState(1178); // 19:38
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 1200));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="relative w-full max-w-3xl mx-auto rounded-[32px] border border-border/60 bg-surface/95 shadow-soft p-4 md:p-5 select-none hover:border-primary/25 hover:shadow-lift transition-all duration-500 overflow-hidden group">
      {/* Glow background inside mockup */}
      <div className="absolute -left-20 -top-20 h-48 w-48 bg-primary/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -right-20 -bottom-20 h-48 w-48 bg-accent/5 blur-3xl pointer-events-none rounded-full" />

      <div className="grid md:grid-cols-3 gap-4 items-stretch relative z-10">
        
        {/* Left Column (2 cols wide): Jitsi Call Room Mockup */}
        <div className="md:col-span-2 rounded-[24px] overflow-hidden border border-border bg-slate-950 flex flex-col justify-between min-h-[320px] relative shadow-inner">
          {/* Top Info Overlay */}
          <div className="p-3.5 flex items-center justify-between gap-3 absolute top-0 left-0 w-full z-10 bg-gradient-to-b from-black/85 to-transparent">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-white uppercase tracking-wider">In-App Secure Connection</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 px-2.5 py-0.5 rounded-lg">
              <svg className="w-3.5 h-3.5 text-accent animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-xs font-black text-white font-mono">{timeStr}</span>
            </div>
          </div>

          {/* Video Stream Simulation Area — padded at top to prevent overlap */}
          <div className="flex-1 flex items-center justify-center pt-14 pb-12 px-6 relative overflow-hidden bg-gradient-to-br from-indigo-950/40 via-slate-900 to-blue-950/40">
            <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

            <div className="text-center space-y-3">
              {/* Senior Face Avatar simulation — smaller to fit perfectly */}
              <div className="relative mx-auto h-16 w-16 rounded-full border border-primary/20 bg-gradient-to-tr from-primary/10 to-accent/10 flex items-center justify-center text-primary shadow-[0_0_35px_rgba(37,99,235,0.12)] ring-4 ring-slate-950">
                {camOn ? (
                  <span className="text-lg font-black">AS</span>
                ) : (
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                )}
              </div>
              <div>
                <h4 className="text-sm font-black text-white leading-none">Amit S. (Senior Guide)</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">IIT Delhi · Computer Science</p>
              </div>
            </div>
          </div>

          {/* Mock In-App Controller Bar */}
          <div className="p-3 bg-gradient-to-t from-black/85 via-black/60 to-transparent flex justify-center items-center gap-3 relative z-10">
            {/* Cam Toggle Button */}
            <button
              onClick={() => setCamOn(!camOn)}
              className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-300 transform active:scale-90 cursor-pointer ${
                camOn ? "bg-white/10 border-white/20 text-white hover:bg-white/20" : "bg-rose-600 border-rose-600 text-white hover:bg-rose-700"
              }`}
            >
              {camOn ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.51 19.25h10.5a1.5 1.5 0 0 0 1.5-1.5V6.25a1.5 1.5 0 0 0-1.5-1.5H4.51a1.5 1.5 0 0 0-1.5 1.5v11.5a1.5 1.5 0 0 0 1.5 1.5z" /></svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5 18 8.25m0 0 2.25-2.25M18 8.25l2.25 2.25M18 8.25 15.75 6M3.75 6h11.25a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 3.75 6z" /></svg>
              )}
            </button>

            {/* Mic Toggle Button */}
            <button
              onClick={() => setMicOn(!micOn)}
              className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-300 transform active:scale-90 cursor-pointer ${
                micOn ? "bg-white/10 border-white/20 text-white hover:bg-white/20" : "bg-rose-600 border-rose-600 text-white hover:bg-rose-700"
              }`}
            >
              {micOn ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3z" /></svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9c0-1.657 1.343-3 3-3s3 1.343 3 3v2.5M12 18.75v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3v-6" /></svg>
              )}
            </button>

            {/* End Call Button */}
            <button className="h-9 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white border border-rose-600 flex items-center gap-1.5 font-black text-[10px] transition-all active:scale-95 cursor-pointer uppercase tracking-wider">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              End Room
            </button>
          </div>
        </div>

        {/* Right Column (1 col wide): Prep Workspace notes & validation checklist */}
        <div className="rounded-[24px] border border-border bg-surface2/30 p-5 flex flex-col justify-between space-y-4 text-left">
          <div className="space-y-3.5">
            <div className="space-y-1">
              <h4 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                Prep Workspace
              </h4>
              <p className="text-[9px] text-muted font-bold uppercase tracking-wider leading-none">Shared session goals</p>
            </div>
            
            <ul className="space-y-2">
              {[
                "Average placement package in CSE?",
                "How hard is it to maintain 9+ CGPA?",
                "Coding culture vs. campus life?",
                "Hostel life and messes quality?"
              ].map((q, qi) => (
                <li key={qi} className="text-xs font-semibold text-fg flex items-start gap-1.5 bg-surface/60 border border-border/40 p-2 rounded-xl">
                  <span className="text-primary shrink-0 mt-0.5 font-bold">Q{qi+1}.</span>
                  <span className="leading-tight">{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Secure validation checklist */}
          <div className="pt-3.5 border-t border-border/40 space-y-2">
            {[
              "Verified student client",
              "Verified senior insider",
              "Automatic refund active"
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[9px] font-black text-muted uppercase tracking-wider">
                <svg className="w-3.5 h-3.5 text-success shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12z" /></svg>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function HowItWorks() {
  useSEO({ title: 'How It Works', description: 'Learn how Clarior connects students with verified seniors for 1:1 guidance sessions at ₹69.' });

  const [faqSearch, setFaqSearch] = useState("");
  const [faqTab, setFaqTab] = useState("all");
  const [openFaq, setOpenFaq] = useState(null);

  const filteredFaqs = faqItems.filter(item => {
    const matchesSearch = item.q.toLowerCase().includes(faqSearch.toLowerCase()) || item.a.toLowerCase().includes(faqSearch.toLowerCase());
    const matchesTab = faqTab === "all" || item.group === faqTab;
    return matchesSearch && matchesTab;
  });

  return (
    <>
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden bg-linear-to-br from-primary via-primary/95 to-accent py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.16),transparent_60%)]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-primaryFg/90 backdrop-blur-sm">
            How it works
          </div>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-primaryFg sm:text-5xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Simple, transparent, and session-first.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-7 text-primaryFg/90">
            A clear guided flow for both students and seniors — built on trust, quality, and accountability.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-16">
        {/* Two column: students | seniors */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* For Students */}
          <div className="animate-fade-up">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-fg" style={{ fontFamily: "'Outfit', sans-serif" }}>For Students</h2>
                <p className="text-xs text-muted">Get guidance in 5 easy steps</p>
              </div>
            </div>
            <div>
              {studentSteps.map((step, i) => (
                <Step key={step.title} number={i + 1} title={step.title} desc={step.desc} last={i === studentSteps.length - 1} />
              ))}
            </div>
          </div>

          {/* For Seniors */}
          <div className="animate-fade-up delay-200">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-success/10 text-success">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-fg" style={{ fontFamily: "'Outfit', sans-serif" }}>For Seniors</h2>
                <p className="text-xs text-muted">Earn while helping others</p>
              </div>
            </div>
            <div>
              {seniorSteps.map((step, i) => (
                <Step key={step.title} number={i + 1} title={step.title} desc={step.desc} last={i === seniorSteps.length - 1} />
              ))}
            </div>
          </div>
        </div>

        {/* Live Call Room Preview Simulation */}
        <div className="mt-16 mb-6 text-center space-y-6 animate-fade-up">
          <div className="space-y-2">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">Live Room Demo</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Inside the Guided Session Room
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted">
              Here is exactly how the 1:1 guidance call room looks and feels during your live session.
            </p>
          </div>
          <HeroMockupRoom />
        </div>

        {/* Trust & Quality Policy */}
        <div className="section-shell mt-10 rounded-3xl p-8 animate-fade-up delay-300">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-fg" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Trust & Quality Policy
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted">
              Clarior is built on honesty. Here's how we keep the platform trustworthy for everyone.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {policies.map(p => (
              <div key={p.title} className="surface-muted rounded-2xl p-5 text-center shadow-soft">
                <div className="mb-3 text-3xl">{p.icon}</div>
                <h3 className="text-sm font-bold text-fg">{p.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link to="/mentor-guidelines" className="text-sm font-semibold text-primary transition hover:underline">
              Read full senior guidelines →
            </Link>
          </div>
        </div>

        {/* Interactive Accordion FAQs */}
        <div className="section-shell mt-10 rounded-3xl p-8 sm:p-10 animate-fade-up delay-350">
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-muted">
              Have questions about Clarior? Search our helper guide or filter by topic.
            </p>

            {/* Search FAQ */}
            <div className="mt-6 relative">
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Search questions (e.g. refund, payouts...)"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-surface text-fg text-sm focus:outline-none focus:border-primary/50 focus:shadow-glow transition-all"
              />
              <svg className="absolute left-4 top-4 h-4.5 w-4.5 text-muted" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3" />
              </svg>
            </div>

            {/* Filter Tabs */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["all", "general", "students", "seniors"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setFaqTab(tab); setOpenFaq(null); }}
                  className={`px-6 py-2.5 rounded-full text-xs font-black tracking-wider transition-all duration-300 cursor-pointer uppercase ${
                    faqTab === tab
                      ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white border-transparent shadow-md shadow-blue-500/20 scale-[1.03]"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 dark:bg-surface/50 dark:border-border/75 dark:text-muted dark:hover:text-primary"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-8 text-sm font-semibold text-muted">
                No matching questions found. Try search query "refund" or "credits".
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className="rounded-2xl border border-border/70 bg-surface/90 overflow-hidden transition-all duration-350">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-fg text-sm sm:text-base cursor-pointer hover:bg-primary/5 transition-all"
                    >
                      <span>{faq.q}</span>
                      <svg className={`h-4.5 w-4.5 text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed text-muted border-t border-border/20 bg-surface-2/45 animate-slide-down">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 flex flex-wrap justify-center gap-4 animate-fade-up delay-400">
          <Link
            to="/explore"
            className="rounded-full bg-primary px-8 py-3.5 text-base font-bold text-primaryFg shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-lift"
          >
            Find a senior now →
          </Link>
          <Link
            to="/become-senior"
            className="rounded-full border border-border bg-surface px-8 py-3.5 text-base font-semibold text-fg transition-smooth hover:-translate-y-0.5 hover:bg-surface2 hover:shadow-soft"
          >
            Become a Senior
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default HowItWorks;
