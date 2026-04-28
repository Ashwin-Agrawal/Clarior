import { useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { waitForRazorpay } from "../services/razorpay";
import { useAuth } from "../context/AuthContext";

function BuyCredits() {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });

  const handlePayment = async (plan) => {
    setStatus({ type: "", text: "" });
    setLoadingPlan(plan);

    try {
      const key = import.meta.env.VITE_RAZORPAY_KEY;
      if (!key) {
        setStatus({
          type: "error",
          text: "Payment config missing. Add VITE_RAZORPAY_KEY in frontend env.",
        });
        return;
      }

      const ok = await waitForRazorpay();
      if (!ok) {
        setStatus({
          type: "error",
          text: "Checkout failed to load. Refresh and try again.",
        });
        return;
      }

      const { data } = await api.post("/payment/create-order", { plan });

      const options = {
        key,
        amount: data.order.amount,
        currency: "INR",
        order_id: data.order.id,
        name: "Clarior",
        description: plan === "bundle" ? "3 sessions" : "1 session",
        prefill: {
          email: user?.email,
          name: user?.name,
        },
        theme: { color: "#3525cd" },
        handler: async (response) => {
          await api.post("/payment/verify", response);
          setStatus({
            type: "success",
            text: "Payment successful. Credits were added to your account.",
          });
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setStatus({
          type: "error",
          text: "Payment did not complete. Please try again.",
        });
      });
      rzp.open();
    } catch (err) {
      setStatus({
        type: "error",
        text: err?.response?.data?.message || "Payment failed",
      });
    } finally {
      setLoadingPlan("");
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-10 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-fg">
              Invest in your growth
            </h1>
            <p className="mt-4 text-lg text-muted">
              Choose a credit pack that fits your learning journey. Every credit unlocks direct access to verified seniors.
            </p>
          </div>

          {status.text && (
            <div
              className={`mt-6 max-w-3xl mx-auto rounded-xl border px-4 py-3 text-sm ${
                status.type === "success"
                  ? "border-success bg-surface2 text-success"
                  : "border-danger bg-surface2 text-danger"
              }`}
            >
              {status.text}
            </div>
          )}

          <div className="mt-12 grid md:grid-cols-2 gap-7 max-w-5xl mx-auto">
            <div className="group relative bg-surface border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className="text-sm font-semibold text-primary">Single Session</div>
              <h3 className="mt-3 text-2xl font-extrabold">Quick clarity</h3>
              <p className="text-muted mt-2">Perfect for one focused doubt-solving session.</p>
              <div className="mt-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tracking-tight">Rs69</span>
                  <span className="text-muted">/ credit</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-muted">
                  <li>1 live senior session</li>
                  <li>25-minute focused call</li>
                  <li>Ask questions directly</li>
                </ul>
              </div>
              <button
                onClick={() => handlePayment("single")}
                disabled={loadingPlan === "single"}
                className="mt-8 w-full rounded-xl border border-border bg-surface2 text-fg px-6 py-3.5 font-semibold hover:bg-surface disabled:opacity-60"
              >
                {loadingPlan === "single" ? "Processing..." : "Buy Now"}
              </button>
            </div>

            <div className="relative bg-surface border-2 border-primary rounded-2xl p-8 shadow-xl">
              <div className="absolute top-0 right-0 bg-primary text-primaryFg px-4 py-1 rounded-bl-xl text-xs font-semibold">
                Recommended
              </div>
              <div className="text-sm font-semibold text-primary">Growth Pack</div>
              <h3 className="mt-3 text-2xl font-extrabold">Most value</h3>
              <p className="text-muted mt-2">Build a consistent routine with multiple seniors.</p>
              <div className="mt-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tracking-tight">Rs189</span>
                  <span className="text-muted">/ pack</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-muted">
                  <li>3 senior sessions</li>
                  <li>Priority slot booking</li>
                  <li>Best choice for regular guidance</li>
                </ul>
              </div>
              <button
                onClick={() => handlePayment("bundle")}
                disabled={loadingPlan === "bundle"}
                className="mt-8 w-full rounded-xl bg-primary text-primaryFg px-6 py-3.5 font-semibold hover:opacity-95 disabled:opacity-60"
              >
                {loadingPlan === "bundle" ? "Processing..." : "Buy Growth Pack"}
              </button>
            </div>
          </div>

          <section className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 bg-surface border border-border rounded-2xl p-6 md:p-8">
            <div className="text-center">
              <h4 className="font-semibold text-fg">Secure Checkout</h4>
              <p className="text-sm text-muted mt-2">All transactions are encrypted and verified through Razorpay.</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-fg">Lifetime Validity</h4>
              <p className="text-sm text-muted mt-2">Credits stay in your wallet. Use them whenever you are ready.</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-fg">24/7 Support</h4>
              <p className="text-sm text-muted mt-2">Need help with payments or credits? We are always available.</p>
            </div>
          </section>

          <section className="mt-14 rounded-2xl overflow-hidden relative h-[360px] border border-border">
            <img
              alt="Students collaborating in study area"
              className="absolute inset-0 w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent flex items-center">
              <div className="px-8 md:px-12 max-w-lg text-primaryFg">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Accelerate your career goals</h2>
                <p className="mt-3 opacity-95">
                  Join students getting real guidance on college, career planning, and placements from experienced seniors.
                </p>
                <a
                  href="/explore"
                  className="inline-block mt-6 rounded-full bg-white text-primary px-6 py-3 font-semibold hover:bg-surface2"
                >
                  Explore seniors
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default BuyCredits;