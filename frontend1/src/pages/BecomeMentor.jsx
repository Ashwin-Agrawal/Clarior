import { useEffect, useState, useMemo } from "react";
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
import RequestCollegeModal from "../components/RequestCollegeModal";


function BecomeMentorIcon({ name, className = "h-6 w-6 text-primary" }) {
  const icons = {
    wallet: <><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><path d="M16 14h2"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

function BecomeMentor() {
  useSEO({
    title: "Become a Senior Mentor",
    description: "Apply to become a senior mentor on Clarior. Help juniors and earn ₹52 per call."
  });

  const { user, fetchUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ phone: "", college: "", domain: "", branch: "", year: "", cgpa: "", bio: "", linkedin: "", upiId: "", affiliatedCollege: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [colleges, setColleges] = useState([]);
  const [showCollegesDropdown, setShowCollegesDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    const loadColleges = async () => {
      try {
        const res = await api.get("/colleges");
        setColleges(res.data.colleges || []);
      } catch (err) {
        console.error("Failed to load colleges for suggestions", err);
      }
    };
    loadColleges();
  }, []);

  const matchingColleges = useMemo(() => {
    if (!form.college.trim()) return [];
    return colleges.filter((c) =>
      c.name.toLowerCase().includes(form.college.toLowerCase())
    ).slice(0, 5);
  }, [colleges, form.college]);

  const isNewGen = useMemo(() => {
    if (!form.college.trim()) return false;
    const match = colleges.find(c => c.name.toLowerCase() === form.college.trim().toLowerCase());
    return match?.type === "New Gen" || match?.type === "New-Gen";
  }, [colleges, form.college]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { state: { from: location.pathname }, replace: true });
    }
  }, [authLoading, user, navigate, location.pathname]);

  const alreadyVerifiedMessage = user?.role === "senior" && user?.isVerified
    ? "You are already a verified senior."
    : "";

  const isPendingReview = user?.applicationStatus === "pending" || (user?.role === "senior" && !user?.isVerified);

  if (authLoading || !user) {
    return null;
  }

  if (isPendingReview) {
    return (
      <AppShell title="Application Under Review">
        <div className="text-center py-20 animate-scale-in">
          <div className="mb-8 flex justify-center">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary relative shadow-md">
              <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-black text-fg mb-3">Your application is under review</h2>
          <p className="text-muted max-w-sm mx-auto leading-relaxed">Our team is reviewing your profile. You will be notified once approved.</p>
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
    
    if (!form.college.trim()) {
      errs.college = "College is required";
    } else {
      const match = colleges.some(c => c.name.toLowerCase() === form.college.trim().toLowerCase());
      if (!match) {
        errs.college = "Please select a valid college from the suggestions dropdown list";
      }
    }

    if (isNewGen) {
      if (!form.affiliatedCollege || !form.affiliatedCollege.trim()) {
        errs.affiliatedCollege = "Affiliated College/University is required for New-Gen colleges";
      }
    }
    
    if (!form.domain) errs.domain = "Domain is required";
    if (!form.branch.trim()) errs.branch = "Branch is required";
    
    if (!form.year) {
      errs.year = "Current Year of study is required";
    } else {
      const yr = Number(form.year);
      if (isNaN(yr) || yr < 1 || yr > 5) {
        errs.year = "Enter a valid year (1-5)";
      }
    }

    if (!form.linkedin.trim()) {
      errs.linkedin = "LinkedIn URL is required";
    } else if (!/^https?:\/\/.+/i.test(form.linkedin.trim())) {
      errs.linkedin = "Enter a valid URL";
    }

    if (!form.bio.trim()) {
      errs.bio = "Short Bio is required";
    } else if (form.bio.trim().length < 20) {
      errs.bio = "Bio must be at least 20 characters";
    }

    if (!form.upiId.trim()) errs.upiId = "UPI ID is required";
    else if (!/^[\w.]+@[\w]+$/.test(form.upiId.trim())) errs.upiId = "Enter a valid UPI ID (e.g. username@bank)";
    
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login", { state: { from: location.pathname } });
    if (user.applicationStatus === "pending") {
      setError("Your senior application is already under review.");
      return;
    }
    if (!validate()) return;
    setError(""); setMessage(""); setLoading(true);
    try {
      await api.post("/users/apply-senior", { ...form, phone: form.phone.replace(/\s+/g, ""), year: form.year ? Number(form.year) : undefined, cgpa: form.cgpa ? Number(form.cgpa) : undefined });
      await fetchUser?.();
      setMessage("Application submitted. Our team will verify your profile within 48 hours.");
      setForm({ phone: "", college: "", domain: "", branch: "", year: "", cgpa: "", bio: "", linkedin: "", upiId: "", affiliatedCollege: "" });
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
            <h1 className="heading-display text-5xl md:text-8xl lg:text-[100px] font-black text-fg tracking-tighter leading-[0.85]">
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
                    <h3 className="text-sm font-bold text-muted border-b border-border/60 pb-3 text-center uppercase tracking-wider">Academic Profile</h3>
                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="relative">
                        <Input
                          label="College Name *"
                          placeholder="Type to search college (e.g. IIT Delhi)..."
                          value={form.college}
                          onChange={(e) => {
                            update("college", e.target.value);
                            setShowCollegesDropdown(true);
                          }}
                          onFocus={() => setShowCollegesDropdown(true)}
                          onBlur={() => {
                            // Delay to allow suggestion click to be registered
                            setTimeout(() => setShowCollegesDropdown(false), 200);
                          }}
                          error={fieldErrors.college}
                          className="rounded-2xl"
                        />
                        {showCollegesDropdown && matchingColleges.length > 0 && (
                          <div className="absolute z-50 left-0 right-0 mt-1 bg-surface border border-border backdrop-blur-md rounded-2xl shadow-lg max-h-60 overflow-y-auto animate-scale-in">
                            {matchingColleges.map((c) => (
                              <button
                                key={c._id}
                                type="button"
                                className="w-full text-left px-4 py-3 text-sm font-bold text-fg hover:bg-primary/10 hover:text-primary transition-all border-b border-border/40 last:border-0 cursor-pointer"
                                onClick={() => {
                                  update("college", c.name);
                                  setShowCollegesDropdown(false);
                                }}
                              >
                                {c.name} <span className="text-xs text-muted font-normal font-sans">({c.city}, {c.state})</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {form.college.trim() && (
                          <div className="mt-2 text-xs text-muted text-left px-1">
                            Can't find your college?{" "}
                            <button
                              type="button"
                              onClick={() => setIsModalOpen(true)}
                              className="text-primary font-black hover:underline cursor-pointer outline-none"
                            >
                              Request to add it
                            </button>
                          </div>
                        )}
                      </div>

                      {isNewGen && (
                        <div className="animate-scale-in">
                          <Input
                            label="Affiliated College/University *"
                            placeholder="e.g. Rishihood University"
                            value={form.affiliatedCollege}
                            onChange={(e) => update("affiliatedCollege", e.target.value)}
                            error={fieldErrors.affiliatedCollege}
                            className="rounded-2xl"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="text-sm font-bold text-fg ml-1">Domain *</div>
                        <select className={`w-full rounded-2xl border bg-surface px-4 py-3.5 text-sm text-fg outline-none focus:ring-2 focus:ring-primary/20 transition shadow-sm ${fieldErrors.domain ? "border-danger" : "border-border"}`} value={form.domain} onChange={(e) => update("domain", e.target.value)}>
                          {["", "Engineering", "Medical", "Commerce", "Arts", "Law", "Other"].map(d => <option key={d} value={d}>{d || "Select Domain"}</option>)}
                        </select>
                        {fieldErrors.domain && <div className="mt-1.5 text-xs text-danger ml-1">{fieldErrors.domain}</div>}
                      </div>
                      <Input label="Branch/Department *" placeholder="CSE, MBBS..." value={form.branch} onChange={(e) => update("branch", e.target.value)} error={fieldErrors.branch} className="rounded-2xl" />
                      <Input label="Current Year *" type="number" placeholder="3" value={form.year} onChange={(e) => update("year", e.target.value)} error={fieldErrors.year} className="rounded-2xl" />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-sm font-bold text-muted border-b border-border/60 pb-3 text-center uppercase tracking-wider">Social & Bio</h3>
                    <div className="grid sm:grid-cols-2 gap-8">
                      <Input label="Phone Number *" placeholder="+91..." value={form.phone} onChange={(e) => update("phone", e.target.value)} error={fieldErrors.phone} className="rounded-2xl" />
                      <Input label="LinkedIn URL *" placeholder="https://..." value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} error={fieldErrors.linkedin} className="rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-bold text-fg ml-1">Short Bio *</div>
                      <textarea className={`w-full rounded-2xl border bg-surface px-4 py-4 text-sm text-fg outline-none focus:ring-2 focus:ring-primary/20 transition resize-none shadow-sm ${fieldErrors.bio ? "border-danger" : "border-border"}`} rows={4} placeholder="Describe how you can help juniors..." value={form.bio} onChange={(e) => update("bio", e.target.value)} />
                      {fieldErrors.bio && <div className="mt-1.5 text-xs text-danger ml-1">{fieldErrors.bio}</div>}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-sm font-bold text-muted border-b border-border/60 pb-3 text-center uppercase tracking-wider">Payout Details</h3>
                    <div className="grid sm:grid-cols-2 gap-8">
                      <Input label="UPI ID * (For receiving earnings)" placeholder="username@bank" value={form.upiId} onChange={(e) => update("upiId", e.target.value)} error={fieldErrors.upiId} className="rounded-2xl" />
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
                    { i: "wallet", t: "Earn ₹52 per call", d: "Highest payout rates for seniors." },
                    { i: "clock", t: "Your own timing", d: "No minimum hours required. Ever." },
                    { i: "shield", t: "Verified community", d: "Trusted by students from top colleges." },
                  ].map(f => (
                    <li key={f.t} className="flex gap-5 items-start">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                        <BecomeMentorIcon name={f.i} />
                      </div>
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
        <RequestCollegeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </main>
      <Footer />
    </>
  );
}

export default BecomeMentor;
