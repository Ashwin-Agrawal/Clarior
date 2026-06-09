import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { waitForRazorpay } from "../services/razorpay";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import SiteContainer from "../components/layout/SiteContainer";
import useSEO from "../hooks/useSEO";

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-success">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function StatusIcon({ type }) {
  return (
    <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24" aria-hidden="true">
      {type === "success" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
      ) : (
        <><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.3 4.4 2.7 17.5A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.5L13.7 4.4a2 2 0 0 0-3.4 0Z" /></>
      )}
    </svg>
  );
}

function FeatureIcon({ name }) {
  const paths = {
    secure: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    clock: <><circle cx="12" cy="12" r="8" /><path d="M12 8v5l3 2" /></>,
    support: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" /><path d="M8 9h8M8 13h5" /></>,
  };
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function BuyCredits() {
  useSEO({ title: 'Buy Credits', description: 'Buy credits to book mentorship sessions on Clarior' });
  const { user, fetchUser } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });

  const handlePayment = async (plan) => {
    setStatus({ type: "", text: "" });
    setLoadingPlan(plan);

    try {
      const key = import.meta.env.VITE_RAZORPAY_KEY;
      if (!key) {
        setStatus({ type: "error", text: "Payment config missing. Please contact support." });
        return;
      }

      const ok = await waitForRazorpay();
      if (!ok) {
        setStatus({ type: "error", text: "Checkout failed to load. Please refresh." });
        return;
      }

      const { data } = await api.post("/payment/create-order", { plan });

      const options = {
        key,
        amount: data.order.amount,
        currency: "INR",
        order_id: data.order.id,
        name: "Clarior",
        description: plan === "bundle" ? "Growth Pack (3 sessions)" : "Single Session",
        prefill: { email: user?.email, name: user?.name },
        theme: { color: "#2563eb" },
        handler: async (response) => {
          try {
            await api.post('/payment/verify', response);
            await fetchUser();
            setStatus({ type: 'success', text: 'Payment successful! Credits added to your account.' });
          } catch (err) {
            setStatus({ type: 'error', text: err?.response?.data?.message || 'Payment verification failed. Contact support.' });
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => setStatus({ type: "error", text: "Payment failed. Please try again." }));
      rzp.open();
    } catch (err) {
      setStatus({ type: "error", text: err?.response?.data?.message || "Payment failed" });
    } finally {
      setLoadingPlan("");
    }
  };

  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen">
        {/* Header Section */}
        <div className="relative overflow-hidden pt-20 pb-16">
          <div className="absolute inset-x-0 top-0 h-[400px] pointer-events-none opacity-40" style={{ background: "var(--hero-gradient)" }} />
          <SiteContainer className="relative text-center max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary mb-4 uppercase tracking-widest">
              Pricing Plans
            </div>
            <h1 className="heading-display text-4xl md:text-6xl font-extrabold tracking-tight text-fg">
              Invest in your <span className="gradient-text">clarity.</span>
            </h1>
            <p className="mt-6 text-lg text-muted leading-relaxed">
              Unlock direct access to verified seniors. No hidden fees, no subscriptions. Just pure guidance when you need it.
            </p>
          </SiteContainer>
        </div>

        <SiteContainer className="pb-24">
          {/* Status Message */}
          {status.text && (
            <div className={`mb-12 max-w-2xl mx-auto rounded-2xl border px-6 py-4 text-sm font-semibold animate-scale-in flex items-center gap-3 ${
              status.type === "success" ? "border-success bg-success/5 text-success" : "border-danger bg-danger/5 text-danger"
            }`}>
              <StatusIcon type={status.type} />
              {status.text}
            </div>
          )}

          {/* Pricing Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Single Session */}
            <Card className="flex flex-col p-8 md:p-10 border-border bg-surface animate-fade-up delay-100 hover:border-primary/20 transition-all">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Single Pass</div>
                </div>
                <h3 className="mt-4 text-2xl font-extrabold text-fg">Quick Clarity</h3>
                <p className="text-sm text-muted mt-2 leading-relaxed">Perfect for getting answers to specific questions about one college or branch.</p>
                
                <div className="mt-10 mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold text-fg tracking-tight">₹69</span>
                    <span className="text-muted font-medium">/ credit</span>
                  </div>
                </div>

                <ul className="space-y-4">
                  {[
                    "1 focused 25-minute call",
                    "Direct senior access",
                    "Session timer tracking",
                    "Rate after session"
                  ].map(f => (
                    <li key={f} className="flex items-start gap-3 text-sm text-fg">
                      <CheckIcon />
                      <span className="font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button
                onClick={() => handlePayment("single")}
                loading={loadingPlan === "single"}
                className="mt-10 w-full rounded-2xl"
                size="lg"
                variant="secondary"
              >
                Choose Single Pass
              </Button>
            </Card>

            {/* Growth Pack */}
            <Card className="relative flex flex-col p-8 md:p-10 border-primary/30 bg-surface shadow-lift animate-fade-up delay-200 ring-4 ring-primary/5">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-soft">
                Most Popular
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Growth Bundle</div>
                  <span className="bg-success/10 text-success text-[10px] font-bold px-2 py-1 rounded-lg">SAVE ₹18</span>
                </div>
                <h3 className="mt-4 text-2xl font-extrabold text-fg">Growth Pack</h3>
                <p className="text-sm text-muted mt-2 leading-relaxed">Get a comprehensive perspective by talking to seniors across different colleges.</p>
                
                <div className="mt-10 mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold text-fg tracking-tight">₹189</span>
                    <span className="text-muted font-medium">/ 3 credits</span>
                  </div>
                </div>

                <ul className="space-y-4">
                  {[
                    "3 senior sessions",
                    "Compare multiple colleges",
                    "Priority slot booking",
                    "No expiry on credits",
                    "24/7 priority support"
                  ].map(f => (
                    <li key={f} className="flex items-start gap-3 text-sm text-fg">
                      <CheckIcon />
                      <span className="font-bold">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button
                onClick={() => handlePayment("bundle")}
                loading={loadingPlan === "bundle"}
                className="mt-10 w-full rounded-2xl shadow-lift"
                size="lg"
                variant="primary"
              >
                Get Growth Pack
              </Button>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-up delay-300">
            {[
              { icon: "secure", title: "Secure Checkout", desc: "Encrypted transactions via Razorpay. Your data is safe." },
              { icon: "clock", title: "Lifetime Validity", desc: "Credits never expire. Use them whenever you're ready." },
              { icon: "support", title: "Guaranteed Response", desc: "Talk to verified seniors or get your credits back." },
            ].map(f => (
              <div key={f.title} className="text-center group">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface border border-border text-primary shadow-soft group-hover:scale-110 transition-transform">
                  <FeatureIcon name={f.icon} />
                </div>
                <h4 className="mt-4 font-bold text-fg">{f.title}</h4>
                <p className="mt-2 text-sm text-muted leading-relaxed px-4">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Trust Banner */}
          <section className="mt-20 rounded-[40px] overflow-hidden relative h-[400px] border border-border/50 shadow-lift animate-fade-up delay-400">
            <img
              alt="Students collaborating"
              className="absolute inset-0 w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80"
            />
            <div className="absolute inset-0 bg-surface flex items-center">
              <div className="px-8 md:px-16 max-w-xl">
                <h2 className="heading-display text-3xl md:text-4xl font-extrabold tracking-tight text-fg leading-tight">
                  Accelerate your <br /> career goals.
                </h2>
                <p className="mt-4 text-muted text-lg leading-relaxed">
                  Join thousands of students getting real guidance on college, career planning, and placements.
                </p>
                <div className="mt-8">
                  <Link
                    to="/explore"
                    className="inline-flex rounded-full bg-primary text-white px-8 py-3.5 font-bold hover:shadow-lift hover:-translate-y-0.5 transition-all"
                  >
                    Explore Seniors
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}

export default BuyCredits;
