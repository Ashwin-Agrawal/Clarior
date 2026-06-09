import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import SiteContainer from "../components/layout/SiteContainer";
import useSEO from "../hooks/useSEO";
import AppShell from "../components/AppShell";

function BecomeMentor() {
  useSEO({
    title: "BecomeMentor",
    description: "Clarior BecomeMentor page"
  });

  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ phone: "", college: "", domain: "", branch: "", year: "", cgpa: "", bio: "", linkedin: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const alreadyVerifiedMessage = user?.role === "senior" && user?.isVerified
    ? "You are already a verified senior."
    : "";

  if (user?.role === 'senior' && !user?.isVerified) {
    return (
      <AppShell title="Application Under Review">
        <div className="text-center py-20">
          <div className="text-5xl mb-6">⏳</div>
          <h2 className="text-2xl font-bold text-fg mb-3">Your application is under review</h2>
          <p className="text-muted">Our team is reviewing your profile. You will be notified once approved.</p>
        </div>
      </AppShell>
    );
  }

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setFieldErrors(e => ({ ...e, [k]: "" })); };

  const validate = () => {
    const errs = {};
    const ph = form.phone.replace(/\s+/g, "");
    if (!ph) errs.phone = "Phone is required";
    else if (!/^\+?\d{10,15}$/.test(ph)) errs.phone = "Enter a valid phone number";
    if (!form.college.trim()) errs.college = "College is required";
    if (!form.branch.trim()) errs.branch = "Branch is required";
    if (form.linkedin && !/^https?:\/\/.+/i.test(form.linkedin)) errs.linkedin = "Enter a valid URL";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login", { state: { from: location.pathname } });
    if (!validate()) return;
    setError(""); setMessage(""); setLoading(true);
    try {
      await api.post("/users/apply-senior", { ...form, phone: form.phone.replace(/\s+/g, ""), year: form.year ? Number(form.year) : undefined, cgpa: form.cgpa ? Number(form.cgpa) : undefined });
      await fetchUser?.();
      setMessage("Application submitted. Our team will verify your profile within 48 hours.");
      setForm({ phone: "", college: "", domain: "", branch: "", year: "", cgpa: "", bio: "", linkedin: "" });
    } catch (err) { setError(err?.response?.data?.message || "Submission failed"); } finally { setLoading(false); }
  };

  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen">
        <div className="relative pt-32 pb-24 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] majestic-blob animate-float-slow opacity-20" />
          <div className="absolute bottom-[-10%] right-[-10%] majestic-blob animate-float-slow delay-500 opacity-15" />
          <div className="absolute inset-0 h-[600px] pointer-events-none opacity-40" style={{ background: "var(--hero-gradient)" }} />
          <SiteContainer className="relative text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-bold text-primary uppercase tracking-widest mb-4">
              Mentorship Program
            </div>
            <h1 className="heading-display text-6xl md:text-[100px] font-black text-fg tracking-tighter leading-[0.85]">
              Share your <span className="gradient-text">journey.</span>
            </h1>
            <p className="mt-10 text-2xl text-muted max-w-3xl mx-auto leading-relaxed font-medium tracking-tight">
              Help future students navigate college life while earning for your time. Join a community of top seniors from across India.
            </p>
          </SiteContainer>
        </div>

        <SiteContainer className="pb-24 max-w-4xl mx-auto">
          <div className="space-y-12">
            {/* Form */}
            <div className="animate-fade-up delay-100">
              <Card className="p-12 md:p-20 space-y-12 glass shadow-2xl rounded-[64px]">
                <div className="text-center">
                  <h2 className="heading-display text-3xl md:text-4xl font-extrabold text-fg">Application Form</h2>
                  <p className="text-lg text-muted mt-2">Tell us about your background and experience.</p>
                </div>

                {(message || alreadyVerifiedMessage) && <div className="p-6 rounded-2xl bg-success/5 border border-success/20 text-success font-bold animate-scale-in text-center">{message || alreadyVerifiedMessage}</div>}
                {error && <div className="p-6 rounded-2xl bg-danger/5 border border-danger/20 text-danger font-bold animate-scale-in text-center">{error}</div>}

                <form onSubmit={onSubmit} className="space-y-12">
                  <div className="space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-muted border-b border-border pb-4 text-center">Academic Profile</h3>
                    <div className="grid sm:grid-cols-2 gap-8">
                      <Input label="College Name *" placeholder="IIT Delhi, BITS Pilani..." value={form.college} onChange={(e) => update("college", e.target.value)} error={fieldErrors.college} className="rounded-2xl" />
                      <div className="space-y-2">
                        <div className="text-sm font-bold text-fg ml-1">Domain</div>
                        <select className="w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm text-fg outline-none focus:ring-2 focus:ring-primary/20 transition shadow-sm" value={form.domain} onChange={(e) => update("domain", e.target.value)}>
                          {["", "Engineering", "Medical", "Commerce", "Arts", "Law", "Other"].map(d => <option key={d} value={d}>{d || "Select Domain"}</option>)}
                        </select>
                      </div>
                      <Input label="Branch/Department *" placeholder="CSE, MBBS..." value={form.branch} onChange={(e) => update("branch", e.target.value)} error={fieldErrors.branch} className="rounded-2xl" />
                      <Input label="Current Year" type="number" placeholder="3" value={form.year} onChange={(e) => update("year", e.target.value)} className="rounded-2xl" />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-muted border-b border-border pb-4 text-center">Social & Bio</h3>
                    <div className="grid sm:grid-cols-2 gap-8">
                      <Input label="Phone Number *" placeholder="+91..." value={form.phone} onChange={(e) => update("phone", e.target.value)} error={fieldErrors.phone} className="rounded-2xl" />
                      <Input label="LinkedIn URL" placeholder="https://..." value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} error={fieldErrors.linkedin} className="rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-bold text-fg ml-1">Short Bio</div>
                      <textarea className="w-full rounded-2xl border border-border bg-surface px-4 py-4 text-sm text-fg outline-none focus:ring-2 focus:ring-primary/20 transition resize-none shadow-sm" rows={4} placeholder="Describe how you can help juniors..." value={form.bio} onChange={(e) => update("bio", e.target.value)} />
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button type="submit" loading={loading} className="w-full sm:w-auto px-16 rounded-full shadow-hero" size="xl">Submit Application</Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Side info - Now bottom info */}
            <div className="grid md:grid-cols-2 gap-8 animate-fade-up delay-200">
              <Card className="p-10 bg-primary/5 border-primary/20 rounded-[32px]">
                <h3 className="heading-display text-2xl font-extrabold text-fg text-center">Why join Clarior?</h3>
                <ul className="mt-8 space-y-6">
                  {[
                    { i: "💰", t: "Earn ₹52 per call", d: "Highest payout rates for seniors." },
                    { i: "⏱️", t: "Your own timing", d: "No minimum hours required. Ever." },
                    { i: "🛡️", t: "Verified community", d: "Trusted by students from top colleges." },
                  ].map(f => (
                    <li key={f.t} className="flex gap-5 items-start">
                      <span className="text-3xl filter drop-shadow-sm">{f.i}</span>
                      <div>
                        <div className="text-base font-bold text-fg">{f.t}</div>
                        <div className="text-sm text-muted mt-1 leading-relaxed">{f.d}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-10 rounded-[32px]">
                <h3 className="heading-display text-2xl font-extrabold text-fg mb-8 text-center">Application Process</h3>
                <div className="space-y-8">
                  {[
                    { n: "1", t: "Apply", d: "Fill the form with your verified academic details." },
                    { n: "2", t: "Review", d: "Our team checks your LinkedIn and credentials." },
                    { n: "3", t: "Verified", d: "Your senior profile goes live on the explore page." },
                  ].map(s => (
                    <div key={s.n} className="flex gap-5 items-start">
                      <div className="h-10 w-10 flex-shrink-0 rounded-2xl bg-surface2 border border-border flex items-center justify-center text-sm font-black text-primary shadow-sm">{s.n}</div>
                      <div className="flex-1">
                        <div className="text-base font-bold text-fg">{s.t}</div>
                        <p className="text-sm text-muted mt-1 leading-relaxed">{s.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-10 pt-8 border-t border-border text-center">
                  <Link to="/mentor-guidelines" className="text-sm font-black text-primary hover:underline uppercase tracking-widest">Read senior guidelines →</Link>
                </div>
              </Card>
            </div>
          </div>
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}

export default BecomeMentor;
