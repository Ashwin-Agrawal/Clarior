import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function WidgetIcon({ name, className = "h-5 w-5" }) {
  const paths = {
    arrow: <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />,
    spark: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21l8.904-4.474L21 12l-8.904-4.474L9 3l.813 5.096L3 12l6.813 3.904Z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />,
    chevron: <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />,
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

// Helper to format date/time nicely
function formatSlotTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/* ═══════════════════════════════════════════════════════════════
   1. RISK CALCULATOR (VALUE SLIDER)
   ═══════════════════════════════════════════════════════════════ */
export function ValueSlider() {
  const [mistakeCost, setMistakeCost] = useState(250000);

  const getRiskFeedback = (val) => {
    if (val < 25000) {
      return {
        label: "Book & Exam Fees",
        description: "Buying bad prep materials or filling the wrong college forms.",
        severity: "text-blue-500 bg-blue-500/10 border-blue-500/20"
      };
    }
    if (val < 100000) {
      return {
        label: "Security Deposits & Rent",
        description: "Losing deposits on college hostels or paying rent for a campus you want to change.",
        severity: "text-amber-500 bg-amber-500/10 border-amber-500/20"
      };
    }
    if (val < 500000) {
      return {
        label: "Full Year Tuition Fees",
        description: "Selecting a wrong branch/college and wanting to drop or repeat a year.",
        severity: "text-orange-500 bg-orange-500/10 border-orange-500/20"
      };
    }
    return {
      label: "Career Placement Gap",
      description: "Entering a branch with poor placement support, losing years of job growth.",
      severity: "text-rose-500 bg-rose-500/10 border-rose-500/20"
    };
  };

  const risk = getRiskFeedback(mistakeCost);

  return (
    <div className="glass-panel rounded-[36px] p-8 md:p-10 shadow-lift max-w-3xl mx-auto relative overflow-hidden">
      <div className="space-y-6">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
            Risk Assessment
          </span>
          <h3 className="text-2xl md:text-3xl font-black text-fg tracking-tight">
            The cost of mistake vs. price of clarity
          </h3>
          <p className="text-xs md:text-sm text-muted font-medium">
            Use the slider to calculate the potential financial risk of making a wrong college choice.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center text-sm font-black text-fg">
            <span>Career Risk Slider</span>
            <span className="text-xl text-gradient-primary">
              ₹{mistakeCost.toLocaleString("en-IN")}
            </span>
          </div>

          <input
            type="range"
            min="5000"
            max="1000000"
            step="5000"
            value={mistakeCost}
            onChange={(e) => setMistakeCost(Number(e.target.value))}
            className="w-full h-2.5 rounded-lg bg-surface2 appearance-none cursor-pointer accent-primary"
            style={{
              background: `linear-gradient(to right, rgb(var(--primary)) 0%, rgb(var(--primary)) ${(mistakeCost - 5000) / 995000 * 100}%, rgb(var(--border)) ${(mistakeCost - 5000) / 995000 * 100}%, rgb(var(--border)) 100%)`
            }}
          />

          <div className="flex justify-between text-[9px] font-black uppercase text-muted tracking-wider">
            <span>₹5,000</span>
            <span>₹5,00,000</span>
            <span>₹10,00,000+</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
          <div className="p-5 rounded-2xl border border-border/80 bg-rose-500/[0.02] flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${risk.severity}`}>
                {risk.label}
              </span>
              <h4 className="text-lg font-black text-rose-500 leading-none">
                ₹{mistakeCost.toLocaleString("en-IN")} Loss
              </h4>
              <p className="text-xs text-muted leading-relaxed font-semibold">
                {risk.description}
              </p>
            </div>
            <div className="text-[10px] font-black uppercase text-rose-500 tracking-wider flex items-center gap-1.5 pt-1">
              <span>✕ High Chance of Regret</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-success/20 bg-success/[0.02] flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-success/5 blur-xl pointer-events-none" />
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-success/10 border border-success/20 text-[9px] font-black uppercase tracking-wider text-success">
                Clarior 1:1 Call
              </span>
              <h4 className="text-lg font-black text-success leading-none">
                ₹69 Fixed Cost
              </h4>
              <p className="text-xs text-muted leading-relaxed font-semibold">
                Get direct, honest answers from a senior who resides inside the branch or college you are targeting.
              </p>
            </div>
            <div className="text-[10px] font-black uppercase text-success tracking-wider flex items-center gap-1.5 pt-1">
              <span className="h-2 w-2 rounded-full bg-success live-pulse-active" />
              <span>✓ Verified Insider Information</span>
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link to="/explore">
            <button className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-success to-emerald-600 hover:opacity-95 text-white font-black text-sm rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider">
              Secure a Call for ₹69
              <WidgetIcon name="arrow" className="h-4.5 w-4.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. LIVE BOARD (REAL BACKEND SLOTS + SCROLLABLE)
   ═══════════════════════════════════════════════════════════════ */
export function SpeedBookingBoard() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealActiveSlots = async () => {
      try {
        setLoading(true);
        const res = await api.get("/slots");
        setSlots(res.data.slots || []);
      } catch (err) {
        console.error("Failed to load real active slots", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRealActiveSlots();
  }, []);

  return (
    <div className="glass-panel rounded-[36px] p-8 md:p-10 shadow-lift max-w-3xl mx-auto relative overflow-hidden">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-success">
              <span className="h-2.5 w-2.5 rounded-full bg-success live-pulse-active" />
              Live Active Slots
            </div>
            <h3 className="text-xl md:text-2xl font-black text-fg tracking-tight">
              Real-Time Available Slots
            </h3>
            <p className="text-xs text-muted font-medium">
              Verified sessions open for bookings. Scroll to view all available slots.
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary hover:text-accent transition-colors shrink-0"
          >
            All Colleges
            <WidgetIcon name="arrow" className="h-4.5 w-4.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-surface2 animate-pulse" />
            ))}
          </div>
        ) : slots.length > 0 ? (
          /* Capped Height Scrollable Feed */
          <div className="max-h-[340px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {slots.map((slot) => {
              const mentor = slot.senior || {};
              const initials = (mentor.name || "S").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div
                  key={slot._id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-border/70 bg-surface/90 hover:border-primary/20 hover:shadow-soft transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-surface2 to-border/40 text-xs font-black text-fg border border-border flex items-center justify-center shadow-sm">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-fg leading-none truncate group-hover:text-primary transition-colors">
                          {mentor.name || "Verified Senior"}
                        </span>
                        <div className="flex items-center gap-0.5 text-[9px] font-black text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-lg shrink-0">
                          <span>★</span>
                          <span>{mentor.rating?.toFixed(1) || "5.0"}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted truncate mt-2 font-bold uppercase tracking-wider">
                        {mentor.college || "Top Institute"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-xl">
                      <WidgetIcon name="calendar" className="h-4 w-4" />
                      <span>{formatSlotTime(slot.dateTime)}</span>
                    </div>
                    <Link to="/explore">
                      <button className="px-5 py-2 rounded-xl bg-primary hover:bg-accent text-white font-black text-xs transition-all cursor-pointer">
                        Book Slot
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center bg-surface2/40 border border-dashed border-border rounded-2xl">
            <p className="text-muted font-bold text-sm">No active slots available at this moment.</p>
            <Link to="/become-mentor" className="text-xs text-primary font-black uppercase tracking-wider hover:underline mt-2 inline-block">
              Are you a senior? Create a slot now →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. PREMIUM FAQ ACCORDION
   ═══════════════════════════════════════════════════════════════ */
export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "How does a 1:1 call with a senior work?",
      a: "Once you reserve a slot, a secure call page is generated. At the session start time, both you and the senior check in, join the secure room, and talk directly in-app using our integrated Jitsi video call engine."
    },
    {
      q: "What happens if a senior doesn't show up?",
      a: "Your satisfaction is completely guaranteed. If a senior fails to check in or join the call, your credit is automatically refunded to your wallet instantly so you can book another mentor."
    },
    {
      q: "How much does a call cost? Are there hidden fees?",
      a: "We believe in flat, transparent pricing. A standard 20-minute call costs exactly 1 credit, which equals ₹69. There are absolutely no hidden platform fees, subscription costs, or transactional markups."
    },
    {
      q: "How are the senior mentors verified?",
      a: "Every senior applying to mentor on Clarior undergoes manual verification. We verify their identity, active college registration, and credentials before allowing them to publish slot availabilities."
    },
    {
      q: "Can I write questions for the senior beforehand?",
      a: "Yes! We provide a Pre-Call Prep Notes Workspace on your dashboard. You can list your questions, resumes, or concerns in advance. The senior can review them to make sure your 20 minutes are highly productive."
    }
  ];

  return (
    <div className="glass-panel rounded-[36px] p-8 md:p-10 shadow-lift max-w-3xl mx-auto relative overflow-hidden">
      <div className="space-y-6">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
            FAQ Section
          </span>
          <h3 className="text-2xl md:text-3xl font-black text-fg tracking-tight">
            Frequently Asked Questions
          </h3>
          <p className="text-xs md:text-sm text-muted font-medium">
            Got questions? We have clear, straightforward answers about Clarior calls and policies.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? "border-primary/25 bg-surface shadow-soft" 
                    : "border-border bg-surface2/40 hover:border-primary/10 hover:bg-surface2/80"
                }`}
              >
                {/* Header/Question button */}
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 font-bold text-fg cursor-pointer select-none"
                >
                  <span className={`text-sm md:text-base leading-tight transition-colors ${isOpen ? "text-primary font-black" : "text-fg"}`}>
                    {faq.q}
                  </span>
                  <span className={`shrink-0 text-muted transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`}>
                    <WidgetIcon name="chevron" className="h-5 w-5" />
                  </span>
                </button>

                {/* Answer panel */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[200px] border-t border-border/40 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="p-5 text-xs md:text-sm text-muted leading-relaxed font-semibold">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
