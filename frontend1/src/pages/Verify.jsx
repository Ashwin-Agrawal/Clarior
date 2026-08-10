import { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import SiteContainer from "../components/layout/SiteContainer";
import useSEO from "../hooks/useSEO";

function Verify() {
  useSEO({
    title: "Verify",
    description: "Clarior Verify page"
  });

  const { user, fetchUser } = useAuth();
  const [college, setCollege] = useState("");
  const [upiId, setUpiId] = useState("");
  const [affiliatedCollege, setAffiliatedCollege] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [collegesList, setCollegesList] = useState([]);
  const [showCollegesDropdown, setShowCollegesDropdown] = useState(false);

  useEffect(() => {
    const fetchCollegesList = async () => {
      try {
        const res = await api.get("/colleges");
        setCollegesList(res.data.colleges || []);
      } catch (err) {
        console.error("Failed to fetch colleges list", err);
      }
    };
    fetchCollegesList();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.college) setCollege(user.college);
      if (user.upiId) setUpiId(user.upiId);
      if (user.affiliatedCollege) setAffiliatedCollege(user.affiliatedCollege);
    }
  }, [user]);

  const matchingColleges = useMemo(() => {
    if (!college.trim()) return [];
    return collegesList.filter((c) =>
      c.name.toLowerCase().includes(college.toLowerCase())
    ).slice(0, 5);
  }, [collegesList, college]);

  const isNewGen = useMemo(() => {
    if (!college.trim()) return false;
    const match = collegesList.find(c => c.name.toLowerCase() === college.trim().toLowerCase());
    return match?.type === "New Gen" || match?.type === "New-Gen";
  }, [collegesList, college]);

  const handleSubmit = async () => {
    try {
      setMsg({ type: "", text: "" });
      if (!college.trim() || !upiId.trim()) {
        setMsg({ type: "error", text: "College and UPI ID are required" });
        return;
      }
      const match = collegesList.some(c => c.name.toLowerCase() === college.trim().toLowerCase());
      if (!match) {
        setMsg({ type: "error", text: "Please select a valid college from the suggestions dropdown list" });
        return;
      }
      if (isNewGen && (!affiliatedCollege || !affiliatedCollege.trim())) {
        setMsg({ type: "error", text: "Affiliated College is required for New Gen colleges" });
        return;
      }
      const upiRegex = /^[\w.]+@[\w]+$/;
      if (!upiRegex.test(upiId.trim())) {
        setMsg({ type: "error", text: "Invalid UPI ID format (e.g. name@bank)" });
        return;
      }
      setLoading(true);
      await api.patch('/users/verification-details', { college: college.trim(), upiId: upiId.trim(), affiliatedCollege: isNewGen ? affiliatedCollege.trim() : null });
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
              <div className="h-20 w-20 bg-primary/10 text-primary rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-soft">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"/></svg>
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
              <div className="relative">
                <Input
                  label="Confirm College"
                  placeholder="e.g. IIT Delhi"
                  value={college}
                  onChange={(e) => {
                    setCollege(e.target.value);
                    setShowCollegesDropdown(true);
                  }}
                  onFocus={() => setShowCollegesDropdown(true)}
                  onBlur={() => {
                    // Delay to allow suggestion click to register
                    setTimeout(() => setShowCollegesDropdown(false), 200);
                  }}
                  className="rounded-2xl"
                  iconLeft={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>}
                />
                {showCollegesDropdown && matchingColleges.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-surface border border-border backdrop-blur-md rounded-2xl shadow-lg max-h-60 overflow-y-auto animate-scale-in">
                    {matchingColleges.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        className="w-full text-left px-4 py-3 text-sm font-bold text-fg hover:bg-primary/10 hover:text-primary transition-all border-b border-border/40 last:border-0 cursor-pointer"
                        onClick={() => {
                          setCollege(c.name);
                          setShowCollegesDropdown(false);
                        }}
                      >
                        {c.name} <span className="text-xs text-muted font-normal font-sans">({c.city}, {c.state})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isNewGen && (
                <div className="animate-scale-in">
                  <Input
                    label="Affiliated College/University *"
                    placeholder="e.g. Rishihood University"
                    value={affiliatedCollege}
                    onChange={(e) => setAffiliatedCollege(e.target.value)}
                    className="rounded-2xl"
                    iconLeft={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>}
                  />
                </div>
              )}

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