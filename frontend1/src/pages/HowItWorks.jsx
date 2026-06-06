import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import useSEO from "../hooks/useSEO";

const studentSteps = [
  { icon: "🔍", title: "Browse senior profiles", desc: "Filter by college, domain, and branch. Read bios, check ratings, and find a senior who's been exactly where you are." },
  { icon: "📅", title: "Pick a time slot", desc: "Book an open slot directly from the senior's profile. One credit = one 25-minute guided session." },
  { icon: "✅", title: "Confirm & start the session", desc: "When your session begins, confirm it on the platform to start the 25-minute timer." },
  { icon: "⏱", title: "25-minute live call", desc: "Join the call, ask your questions, and get honest answers from someone who's been through it." },
  { icon: "⭐", title: "Rate your experience", desc: "After the session, submit a review. Your rating keeps quality high for everyone." },
];

const seniorSteps = [
  { icon: "📝", title: "Apply and get verified", desc: "Submit your profile and college details. Our team reviews and approves verified seniors within 48 hours." },
  { icon: "🗓", title: "Set your availability", desc: "Add open time slots whenever you're free. Students book directly from your profile." },
  { icon: "💬", title: "Guide a student", desc: "Join the call and share your honest, experience-based perspective. No scripts, just real talk." },
  { icon: "💰", title: "Earn per session", desc: "Earn ₹52 per completed session. Once you hit the payout threshold, request a withdrawal anytime." },
];

const policies = [
  { icon: "🛡️", title: "Verified seniors only", desc: "Every senior is manually reviewed before they can accept bookings." },
  { icon: "⚖️", title: "Honest guidance required", desc: "Misleading advice or repeated poor feedback leads to account removal." },
  { icon: "📊", title: "Transparent ratings", desc: "Every session is rated. Quality stays visible and accountability stays real." },
];

function Step({ number, icon, title, desc, last = false }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white text-sm font-extrabold shadow-soft">
          {number}
        </div>
        {!last && <div className="mt-2 w-0.5 flex-1 bg-gradient-to-b from-primary/40 to-transparent min-h-[32px]" />}
      </div>
      <div className="pb-8 flex-1">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft hover:shadow-lift hover:border-primary/20 transition-all duration-200">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xl">{icon}</span>
            <h3 className="font-bold text-fg text-base">{title}</h3>
          </div>
          <p className="text-sm text-muted leading-6">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden bg-[#1a3a8f] py-16">
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] border border-[#3b82f6] px-4 py-1.5 text-xs font-semibold text-white mb-4">
            How it works
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Simple, transparent, and session-first.
          </h1>
          <p className="mt-4 text-blue-100 text-lg max-w-2xl mx-auto leading-7">
            A clear guided flow for both students and seniors — built on trust, quality, and accountability.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14">
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
                <Step key={step.title} number={i + 1} icon={step.icon} title={step.title} desc={step.desc} last={i === studentSteps.length - 1} />
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
                <Step key={step.title} number={i + 1} icon={step.icon} title={step.title} desc={step.desc} last={i === seniorSteps.length - 1} />
              ))}
            </div>
          </div>
        </div>

        {/* Trust & Quality Policy */}
        <div className="mt-10 rounded-3xl border border-border bg-surface p-8 shadow-soft animate-fade-up delay-300">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-fg" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Trust & Quality Policy
            </h2>
            <p className="text-muted mt-2 text-sm max-w-2xl mx-auto">
              Clarior is built on honesty. Here's how we keep the platform trustworthy for everyone.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {policies.map(p => (
              <div key={p.title} className="rounded-2xl bg-surface2/80 border border-border p-5 text-center">
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="font-bold text-fg text-sm">{p.title}</h3>
                <p className="text-xs text-muted mt-2 leading-5">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link to="/mentor-guidelines" className="text-primary font-semibold text-sm hover:underline">
              Read full senior guidelines →
            </Link>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 flex flex-wrap justify-center gap-4 animate-fade-up delay-400">
          <Link to="/explore">
            <button className="rounded-full bg-primary text-primaryFg px-8 py-3.5 text-base font-bold hover:shadow-lift hover:-translate-y-0.5 transition-all shadow-soft">
              Find a senior now →
            </button>
          </Link>
          <Link to="/become-senior">
            <button className="rounded-full border border-border bg-surface text-fg px-8 py-3.5 text-base font-semibold hover:bg-surface2 hover:-translate-y-0.5 transition-all">
              Become a Senior
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default HowItWorks;
