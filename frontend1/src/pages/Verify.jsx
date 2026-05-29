import { useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import SiteContainer from "../components/layout/SiteContainer";

function Verify() {
  const [college, setCollege] = useState("");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const { fetchUser } = useAuth();

  const handleSubmit = async () => {
    try {
      setMsg({ type: "", text: "" });
      setLoading(true);
      await api.patch("/users/profile", { college });
      await api.patch("/users/upi", { upiId });
      await fetchUser?.();
      setMsg({ type: "success", text: "Details saved! Your profile is now under review. ✅" });
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.message || "Failed to save details" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-[calc(100vh-72px)] flex items-center justify-center py-20 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{ background: "var(--hero-gradient)" }} />
        
        <SiteContainer className="relative z-10 max-w-xl">
          <Card className="p-10 md:p-14 shadow-hero animate-scale-in rounded-[40px]">
            <div className="text-center mb-10">
              <div className="h-20 w-20 bg-primary/10 text-primary rounded-[32px] flex items-center justify-center text-4xl mx-auto mb-6 shadow-soft">
                🛡️
              </div>
              <h2 className="heading-display text-4xl font-extrabold text-fg tracking-tight">Senior Verification</h2>
              <p className="text-base text-muted mt-3 px-2 leading-relaxed">
                Verify your credentials to unlock the ability to host sessions and receive payouts.
              </p>
            </div>

            {msg.text && (
              <div className={`mb-8 p-6 rounded-2xl text-sm font-bold animate-fade-in border text-center ${
                msg.type === "success" ? "bg-success/5 border-success/20 text-success" : "bg-danger/5 border-danger/20 text-danger"
              }`}>
                {msg.text}
              </div>
            )}

            <div className="space-y-6">
              <Input
                label="Confirm College"
                placeholder="e.g. IIT Delhi"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="rounded-2xl"
                iconLeft={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>}
              />

              <Input
                label="UPI ID (for payouts)"
                placeholder="name@bank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="rounded-2xl"
                iconLeft={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M7 15h.01M11 15h2"/></svg>}
                hint="Earnings will be transferred to this ID."
              />

              <Button
                onClick={handleSubmit}
                loading={loading}
                className="w-full rounded-full shadow-hero mt-4"
                size="xl"
              >
                Submit for Review
              </Button>
            </div>

            <div className="mt-10 pt-8 border-t border-border/50 text-center">
              <p className="text-[11px] text-muted uppercase font-black tracking-[0.2em] leading-relaxed">
                Verification usually takes 24-48 hours.<br />You'll be notified via email once approved.
              </p>
            </div>
          </Card>

          <p className="mt-10 text-center text-sm text-muted font-medium">
            Need help? <a href="/contact" className="text-primary font-bold hover:underline underline-offset-4">Contact Support</a>
          </p>
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}

export default Verify;