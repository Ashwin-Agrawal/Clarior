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

function HowItWorks() {
  useSEO({ title: 'How It Works', description: 'Learn how Clarior connects students with verified seniors for 1:1 guidance sessions at ₹69.' });

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
