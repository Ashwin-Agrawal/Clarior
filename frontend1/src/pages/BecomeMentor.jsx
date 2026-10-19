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
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>,
    building: <><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/><path d="M14 9h1"/><path d="M14 13h1"/><path d="M14 17h1"/></>,
    academic: <><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>,
    spark: <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>
  };
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

const DISALLOWED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "yahoo.co.uk",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "rediffmail.com",
  "mail.com",
  "gmx.com",
  "yandex.com",
  "aol.com",
]);

function BecomeMentor() {
  useSEO({
    title: "Become a Mentor | College Seniors & Working Alumni",
    description: "Apply to become a mentor on Clarior. Guide juniors as a College Senior (₹52/call) or Working Alumni with flexible session pricing (80% payout)."
  });

  const { user, fetchUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mentor Track Switcher: "senior" | "alumni"
  const [mentorTrack, setMentorTrack] = useState("senior");

  // Senior Form State
  const [form, setForm] = useState({
    phone: "",
    college: "",
    domain: "",
    branch: "",
    year: "",
    cgpa: "",
    bio: "",
    linkedin: "",
    upiId: "",
    affiliatedCollege: ""
  });

  // Alumni Form State
  const [alumniForm, setAlumniForm] = useState({
    name: "",
    phone: "",
    isCollegeDropout: false,
    college: "",
    degree: "",
    specialization: "",
    graduationDate: "",
    hasMasters: false,
    mastersDegree: "",
    mastersCollege: "",
    mastersGraduationYear: "",
    currentJobTitle: "",
    currentCompany: "",
    joiningDate: "",
    companyEmail: "",
    linkedin: "",
    bio: "",
    upiId: "",
    sessionPrice: 499,
    weeklySessionsLimit: 5,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [alumniFieldErrors, setAlumniFieldErrors] = useState({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [colleges, setColleges] = useState([]);
  const [showCollegesDropdown, setShowCollegesDropdown] = useState(false);
  const [showAlumniCollegesDropdown, setShowAlumniCollegesDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync initial user details when loaded
  useEffect(() => {
    if (user) {
      if (user.phone) {
        setForm(f => ({ ...f, phone: user.phone }));
        setAlumniForm(a => ({ ...a, phone: user.phone }));
      }
      if (user.name) {
        setAlumniForm(a => ({ ...a, name: user.name }));
      }
      if (user.upiId) {
        setForm(f => ({ ...f, upiId: user.upiId }));
        setAlumniForm(a => ({ ...a, upiId: user.upiId }));
      }
    }
  }, [user]);

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

  const matchingAlumniColleges = useMemo(() => {
    if (!alumniForm.college.trim()) return [];
    return colleges.filter((c) =>
      c.name.toLowerCase().includes(alumniForm.college.toLowerCase())
    ).slice(0, 5);
  }, [colleges, alumniForm.college]);

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

  const isVerifiedMentor = (user?.role === "senior" || user?.role === "alumni") && user?.isVerified;
  const isPendingReview = user?.applicationStatus === "pending" || ((user?.role === "senior" || user?.role === "alumni") && !user?.isVerified);

  if (authLoading || !user) {
    return null;
  }

  if (isVerifiedMentor) {
    return (
      <AppShell title="Already Verified">
        <div className="text-center py-20 animate-scale-in">
          <div className="h-16 w-16 mx-auto mb-6 rounded-3xl bg-success/10 border border-success/20 flex items-center justify-center text-success">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
          </div>
          <h2 className="text-2xl font-black text-fg mb-3">You are already a verified {user.role === "alumni" ? "Alumni" : "Senior"} mentor</h2>
          <p className="text-muted max-w-sm mx-auto leading-relaxed">
            Your profile is active on Clarior. You can manage your availability, slots, and session earnings inside your dashboard.
          </p>
          <div className="mt-8">
            <Link to="/dashboard">
              <Button className="rounded-full px-8 shadow-hero">Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
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
          <h2 className="text-2xl font-black text-fg mb-3">Your mentor application is under review</h2>
          <p className="text-muted max-w-sm mx-auto leading-relaxed">Our verification team is reviewing your profile and credentials. You will receive an in-app notification once approved.</p>
        </div>
      </AppShell>
    );
  }

  // Senior helpers
  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setFieldErrors(e => ({ ...e, [k]: "" })); };

  const validateSenior = () => {
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

    if (!form.cgpa) {
      errs.cgpa = "CGPA is required";
    } else {
      const val = Number(form.cgpa);
      if (isNaN(val) || val < 0 || val > 10) {
        errs.cgpa = "Enter a valid CGPA (0.00-10.00)";
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

  const onSubmitSenior = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login", { state: { from: location.pathname } });
    if (!acceptedTerms) {
      setError("You must accept the Senior Guidelines and Terms of Service to proceed.");
      return;
    }
    if (!validateSenior()) return;
    setError(""); setMessage(""); setLoading(true);
    try {
      await api.post("/users/apply-senior", { ...form, phone: form.phone.replace(/\s+/g, ""), year: form.year ? Number(form.year) : undefined, cgpa: form.cgpa ? Number(form.cgpa) : undefined });
      await fetchUser?.();
      setMessage("Application submitted. Our team will verify your profile within 48 hours.");
      setAcceptedTerms(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  // Alumni helpers
  const updateAlumni = (k, v) => { setAlumniForm(a => ({ ...a, [k]: v })); setAlumniFieldErrors(e => ({ ...e, [k]: "" })); };

  const validateAlumni = () => {
    const errs = {};
    if (!alumniForm.name.trim()) errs.name = "Full name is required";

    const ph = alumniForm.phone.replace(/\s+/g, "");
    if (!ph) errs.phone = "Phone number is required";
    else if (!/^\+?\d{10,15}$/.test(ph)) errs.phone = "Enter a valid phone number";

    if (!alumniForm.isCollegeDropout) {
      if (!alumniForm.college.trim()) errs.college = "College / University name is required";
      if (!alumniForm.degree.trim()) errs.degree = "Undergraduate degree name is required";
      if (!alumniForm.graduationDate) errs.graduationDate = "Graduation completion date is required";
    }

    if (alumniForm.hasMasters) {
      if (!alumniForm.mastersDegree.trim()) errs.mastersDegree = "Master's degree name is required";
      if (!alumniForm.mastersCollege.trim()) errs.mastersCollege = "Master's college name is required";
      if (!alumniForm.mastersGraduationYear) errs.mastersGraduationYear = "Master's completion year is required";
    }

    if (!alumniForm.currentJobTitle.trim()) errs.currentJobTitle = "Current job title is required";
    if (!alumniForm.currentCompany.trim()) errs.currentCompany = "Current company name is required";
    if (!alumniForm.joiningDate) errs.joiningDate = "Date of joining current field is required";

    // Corporate email check
    const email = alumniForm.companyEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errs.companyEmail = "Official corporate work email is required";
    } else if (!emailRegex.test(email)) {
      errs.companyEmail = "Enter a valid company email address";
    } else {
      const domain = email.split("@")[1];
      if (domain && DISALLOWED_EMAIL_DOMAINS.has(domain)) {
        errs.companyEmail = "Personal email domains (Gmail, Yahoo, Outlook, etc.) are strictly prohibited. You must use your corporate work email.";
      }
    }

    if (!alumniForm.linkedin.trim()) {
      errs.linkedin = "LinkedIn URL is required";
    } else if (!/^https?:\/\/.+/i.test(alumniForm.linkedin.trim())) {
      errs.linkedin = "Enter a valid URL";
    }

    if (!alumniForm.bio.trim()) {
      errs.bio = "Short Bio is required";
    } else if (alumniForm.bio.trim().length < 20) {
      errs.bio = "Bio must be at least 20 characters";
    }

    if (!alumniForm.upiId.trim()) {
      errs.upiId = "UPI ID is required";
    } else if (!/^[\w.]+@[\w]+$/.test(alumniForm.upiId.trim())) {
      errs.upiId = "Enter a valid UPI ID (e.g. username@bank)";
    }

    const price = Number(alumniForm.sessionPrice);
    if (isNaN(price) || price < 99 || price > 9999) {
      errs.sessionPrice = "Price must be between ₹99 and ₹9,999";
    }

    setAlumniFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmitAlumni = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login", { state: { from: location.pathname } });
    if (!acceptedTerms) {
      setError("You must accept the Alumni Mentor Guidelines and Terms to proceed.");
      return;
    }
    if (!validateAlumni()) return;
    setError(""); setMessage(""); setLoading(true);
    try {
      await api.post("/alumni/apply", {
        name: alumniForm.name.trim(),
        phone: alumniForm.phone.replace(/\s+/g, ""),
        isCollegeDropout: alumniForm.isCollegeDropout,
        college: alumniForm.isCollegeDropout ? "College Dropout" : alumniForm.college.trim(),
        degree: alumniForm.isCollegeDropout ? "N/A" : alumniForm.degree.trim(),
        specialization: alumniForm.isCollegeDropout ? "" : alumniForm.specialization.trim(),
        graduationDate: alumniForm.isCollegeDropout ? undefined : alumniForm.graduationDate,
        masters: {
          hasMasters: alumniForm.hasMasters,
          degree: alumniForm.mastersDegree.trim(),
          college: alumniForm.mastersCollege.trim(),
          graduationYear: alumniForm.mastersGraduationYear ? Number(alumniForm.mastersGraduationYear) : null,
        },
        currentJobTitle: alumniForm.currentJobTitle.trim(),
        currentCompany: alumniForm.currentCompany.trim(),
        joiningDate: alumniForm.joiningDate,
        companyEmail: alumniForm.companyEmail.trim().toLowerCase(),
        linkedin: alumniForm.linkedin.trim(),
        bio: alumniForm.bio.trim(),
        upiId: alumniForm.upiId.trim(),
        sessionPrice: Number(alumniForm.sessionPrice),
        weeklySessionsLimit: Number(alumniForm.weeklySessionsLimit) || 5,
      });
      await fetchUser?.();
      setMessage("Alumni mentor application submitted successfully. Verification will take up to 48 hours.");
      setAcceptedTerms(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  // Fee calculation for Alumni live preview
  const currentAlumniFee = Number(alumniForm.sessionPrice) || 0;
  const platformFee = Math.round(currentAlumniFee * 0.20);
  const netEarnings = Math.max(0, currentAlumniFee - platformFee);

  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen">
        <div className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] majestic-blob animate-float-slow opacity-20" />
          <div className="absolute bottom-[-10%] right-[-10%] majestic-blob animate-float-slow delay-500 opacity-15" />
          <div className="absolute inset-0 h-[600px] pointer-events-none opacity-40" style={{ background: "var(--hero-gradient)" }} />
          <SiteContainer className="relative text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-bold text-primary uppercase tracking-widest mb-4">
              Mentorship Program
            </div>
            <h1 className="heading-display text-4xl sm:text-6xl md:text-8xl lg:text-[96px] font-black text-fg tracking-tighter leading-[0.9]">
              Share your <span className="gradient-text">journey.</span>
            </h1>
            <p className="mt-6 md:mt-8 text-base md:text-xl text-muted max-w-2xl mx-auto leading-relaxed font-medium tracking-tight">
              Connect with aspirants and juniors who need honest guidance. Choose your track to get started.
            </p>

            {/* Track Switcher */}
            <div className="mt-10 max-w-xl mx-auto grid grid-cols-2 p-1.5 rounded-3xl bg-surface2/80 border border-border shadow-soft">
              <button
                type="button"
                onClick={() => {
                  setMentorTrack("senior");
                  setError("");
                  setMessage("");
                }}
                className={`py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  mentorTrack === "senior"
                    ? "bg-surface text-primary border border-border shadow-md scale-[1.02]"
                    : "text-muted hover:text-fg font-bold"
                }`}
              >
                <BecomeMentorIcon name="academic" className="w-4 h-4" />
                <span>College Senior</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMentorTrack("alumni");
                  setError("");
                  setMessage("");
                }}
                className={`py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  mentorTrack === "alumni"
                    ? "bg-surface text-primary border border-border shadow-md scale-[1.02]"
                    : "text-muted hover:text-fg font-bold"
                }`}
              >
                <BecomeMentorIcon name="building" className="w-4 h-4" />
                <span>Working Alumni</span>
              </button>
            </div>
          </SiteContainer>
        </div>

        <SiteContainer className="pb-24 max-w-4xl mx-auto">
          <div className="space-y-12">
            <div className="animate-fade-up delay-100">
              <Card className="p-6 sm:p-12 md:p-16 space-y-8 sm:space-y-12 glass shadow-2xl rounded-[32px] sm:rounded-[48px]">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 mb-3">
                    {mentorTrack === "senior" ? "Current College Student Track" : "Industry Professional Track"}
                  </div>
                  <h2 className="heading-display text-3xl md:text-4xl font-extrabold text-fg">
                    {mentorTrack === "senior" ? "Senior Mentor Application" : "Alumni Mentor Application"}
                  </h2>
                  <p className="text-sm sm:text-base text-muted mt-2">
                    {mentorTrack === "senior" 
                      ? "Guide aspirants on college culture, cutoffs, and campus reality. Fixed ₹69 session."
                      : "Guide students on off-campus placements, mock interviews & referrals. Flexible pricing (keep 80%)."}
                  </p>
                </div>

                {message && <div className="p-6 rounded-2xl bg-success/5 border border-success/20 text-success font-bold animate-scale-in text-center">{message}</div>}
                {error && <div className="p-6 rounded-2xl bg-danger/5 border border-danger/20 text-danger font-bold animate-scale-in text-center">{error}</div>}

                {/* ════════════════════════════════════════════════════════
                    TRACK 1: SENIOR APPLICATION FORM
                    ════════════════════════════════════════════════════════ */}
                {mentorTrack === "senior" && (
                  <>
                    <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 text-fg text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto text-left flex items-start gap-3.5 shadow-xs">
                      <div className="mt-0.5 text-primary shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 2.625a3.375 3.375 0 00-3.75-3.375m-3.75 3.375a3.375 3.375 0 013.75-3.375M12 3a6 6 0 00-6 6c0 1.996.974 3.76 2.474 4.846M12 3a6 6 0 016 6c0 1.996-.974 3.76-2.474 4.846M9 21h6m-3 0v-2.25"/></svg>
                      </div>
                      <div>
                        <span className="font-extrabold block text-primary uppercase tracking-wide text-[11px] mb-0.5">College Student Verification</span>
                        Seniors must currently be enrolled in an undergraduate or postgraduate program. Verification is processed through your student ID and academic credentials.
                      </div>
                    </div>

                    <form onSubmit={onSubmitSenior} className="space-y-10">
                      <div className="space-y-6">
                        <h3 className="text-xs font-black text-muted border-b border-border/60 pb-3 uppercase tracking-widest text-center">Academic Profile</h3>
                        <div className="grid sm:grid-cols-2 gap-6">
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
                              onBlur={() => setTimeout(() => setShowCollegesDropdown(false), 200)}
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

                          <Input label="Branch/Department *" placeholder="CSE, AI/ML, MBBS..." value={form.branch} onChange={(e) => update("branch", e.target.value)} error={fieldErrors.branch} className="rounded-2xl" />
                          <Input label="Current Year *" type="number" placeholder="3" value={form.year} onChange={(e) => update("year", e.target.value)} error={fieldErrors.year} className="rounded-2xl" />
                          <Input label="CGPA *" type="number" step="0.01" min="0" max="10" placeholder="8.50" value={form.cgpa} onChange={(e) => update("cgpa", e.target.value)} error={fieldErrors.cgpa} className="rounded-2xl" />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-xs font-black text-muted border-b border-border/60 pb-3 uppercase tracking-widest text-center">Social & Bio</h3>
                        <div className="grid sm:grid-cols-2 gap-6">
                          <Input label="Phone Number *" placeholder="+91..." value={form.phone} onChange={(e) => update("phone", e.target.value)} error={fieldErrors.phone} className="rounded-2xl" />
                          <Input label="LinkedIn URL *" placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={(e) => update("linkedin", e.target.value)} error={fieldErrors.linkedin} className="rounded-2xl" />
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-bold text-fg ml-1">Short Bio *</div>
                          <textarea className={`w-full rounded-2xl border bg-surface px-4 py-4 text-sm text-fg outline-none focus:ring-2 focus:ring-primary/20 transition resize-none shadow-sm ${fieldErrors.bio ? "border-danger" : "border-border"}`} rows={4} placeholder="Describe how you can help juniors with campus insights, branch clarity, or placement reality..." value={form.bio} onChange={(e) => update("bio", e.target.value)} />
                          {fieldErrors.bio && <div className="mt-1.5 text-xs text-danger ml-1">{fieldErrors.bio}</div>}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-xs font-black text-muted border-b border-border/60 pb-3 uppercase tracking-widest text-center">Payout Details</h3>
                        <div className="grid sm:grid-cols-2 gap-6">
                          <Input label="UPI ID * (For receiving call earnings)" placeholder="username@bank" value={form.upiId} onChange={(e) => update("upiId", e.target.value)} error={fieldErrors.upiId} className="rounded-2xl" />
                          <div className="p-4 rounded-2xl border border-border/60 bg-surface2 flex flex-col justify-center">
                            <span className="text-[10px] font-black uppercase text-muted tracking-wider">Fixed Session Payout</span>
                            <span className="text-lg font-black text-fg mt-0.5">₹52 per 20-min Call</span>
                            <span className="text-[11px] text-muted font-semibold mt-0.5">Student pays flat ₹69 pass</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-6 pt-2">
                        <label className="flex items-start gap-3 max-w-md cursor-pointer select-none text-left">
                          <input 
                            type="checkbox" 
                            checked={acceptedTerms} 
                            onChange={(e) => {
                              setAcceptedTerms(e.target.checked);
                              setError("");
                            }}
                            className="mt-1 h-4.5 w-4.5 rounded border-border bg-surface text-primary focus:ring-primary/20 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-muted leading-relaxed">
                            I agree to the{" "}
                            <Link to="/mentor-guidelines" target="_blank" className="text-primary font-black hover:underline">
                              Senior Guidelines and Terms of Service
                            </Link>.
                          </span>
                        </label>

                        <Button 
                          type="submit" 
                          loading={loading} 
                          disabled={!acceptedTerms}
                          className="w-full sm:w-auto px-16 rounded-full shadow-hero" 
                          size="xl"
                        >
                          Submit Senior Application
                        </Button>
                      </div>
                    </form>
                  </>
                )}

                {/* ════════════════════════════════════════════════════════
                    TRACK 2: WORKING ALUMNI APPLICATION FORM
                    ════════════════════════════════════════════════════════ */}
                {mentorTrack === "alumni" && (
                  <>
                    {/* Security & Rejection Warning Box */}
                    <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-fg text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto text-left flex items-start gap-3.5 shadow-xs">
                      <div className="mt-0.5 text-amber-500 shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
                      </div>
                      <div>
                        <span className="font-black block text-amber-600 dark:text-amber-400 uppercase tracking-wide text-[11px] mb-0.5">
                          Official Corporate Email Required
                        </span>
                        Alumni applicants must provide their active corporate work email (e.g. <span className="font-mono font-bold">name@company.com</span>). Submissions using personal email providers (Gmail, Yahoo, Outlook, etc.) or domains that do not match your current company <span className="font-extrabold underline decoration-danger">will be automatically rejected</span>.
                      </div>
                    </div>

                    {/* Privacy & Confidentiality Guarantee Box */}
                    <div className="p-5 rounded-2xl bg-primary/10 border border-primary/25 text-fg text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto text-left flex items-start gap-3.5 shadow-xs">
                      <div className="mt-0.5 text-primary shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                      </div>
                      <div>
                        <span className="font-black block text-primary uppercase tracking-wide text-[11px] mb-0.5">
                          100% Privacy & Data Protection Guarantee
                        </span>
                        Your <strong>phone number, company email, and LinkedIn profile</strong> are collected strictly for manual identity verification by our team. <strong>We will NEVER display your phone, email, or LinkedIn publicly on your mentor profile</strong> or share them with students. All 1:1 sessions are conducted anonymously inside Clarior's private in-app video room.
                      </div>
                    </div>

                    <form onSubmit={onSubmitAlumni} className="space-y-10">
                      {/* Identity & Basic Info */}
                      <div className="space-y-6">
                        <h3 className="text-xs font-black text-muted border-b border-border/60 pb-3 uppercase tracking-widest text-center">Applicant Information</h3>
                        <div className="grid sm:grid-cols-2 gap-6">
                          <Input
                            label="Full Name *"
                            placeholder="Your full name"
                            value={alumniForm.name}
                            onChange={(e) => updateAlumni("name", e.target.value)}
                            error={alumniFieldErrors.name}
                            className="rounded-2xl"
                          />
                          <Input
                            label="Phone Number *"
                            placeholder="+91..."
                            value={alumniForm.phone}
                            onChange={(e) => updateAlumni("phone", e.target.value)}
                            error={alumniFieldErrors.phone}
                            hint="Private · Never displayed publicly to students"
                            className="rounded-2xl"
                          />
                        </div>
                      </div>

                      {/* Academic Background with Dropout option */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-border/60 pb-3">
                          <h3 className="text-xs font-black text-muted uppercase tracking-widest">Education Background</h3>
                          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-black text-fg bg-surface2 px-3 py-1.5 rounded-xl border border-border">
                            <input
                              type="checkbox"
                              checked={alumniForm.isCollegeDropout}
                              onChange={(e) => updateAlumni("isCollegeDropout", e.target.checked)}
                              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                            />
                            <span>College Dropout</span>
                          </label>
                        </div>

                        {!alumniForm.isCollegeDropout ? (
                          <div className="grid sm:grid-cols-2 gap-6">
                            <div className="relative sm:col-span-2">
                              <Input
                                label="Undergraduate College / University *"
                                placeholder="Type to search college (e.g. BITS Pilani)..."
                                value={alumniForm.college}
                                onChange={(e) => {
                                  updateAlumni("college", e.target.value);
                                  setShowAlumniCollegesDropdown(true);
                                }}
                                onFocus={() => setShowAlumniCollegesDropdown(true)}
                                onBlur={() => setTimeout(() => setShowAlumniCollegesDropdown(false), 200)}
                                error={alumniFieldErrors.college}
                                className="rounded-2xl"
                              />
                              {showAlumniCollegesDropdown && matchingAlumniColleges.length > 0 && (
                                <div className="absolute z-50 left-0 right-0 mt-1 bg-surface border border-border backdrop-blur-md rounded-2xl shadow-lg max-h-60 overflow-y-auto animate-scale-in">
                                  {matchingAlumniColleges.map((c) => (
                                    <button
                                      key={c._id}
                                      type="button"
                                      className="w-full text-left px-4 py-3 text-sm font-bold text-fg hover:bg-primary/10 hover:text-primary transition-all border-b border-border/40 last:border-0 cursor-pointer"
                                      onClick={() => {
                                        updateAlumni("college", c.name);
                                        setShowAlumniCollegesDropdown(false);
                                      }}
                                    >
                                      {c.name} <span className="text-xs text-muted font-normal font-sans">({c.city}, {c.state})</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            <Input
                              label="Undergraduate Degree *"
                              placeholder="e.g. B.Tech, BCA, B.Sc, B.Com"
                              value={alumniForm.degree}
                              onChange={(e) => updateAlumni("degree", e.target.value)}
                              error={alumniFieldErrors.degree}
                              className="rounded-2xl"
                            />

                            <Input
                              label="Degree Specialization / Major"
                              placeholder="e.g. Computer Science, AI/ML, Finance, Mechanical"
                              value={alumniForm.specialization}
                              onChange={(e) => updateAlumni("specialization", e.target.value)}
                              className="rounded-2xl"
                            />

                            <div className="sm:col-span-2">
                              <Input
                                label="Graduation Completion Date *"
                                type="date"
                                value={alumniForm.graduationDate}
                                onChange={(e) => updateAlumni("graduationDate", e.target.value)}
                                error={alumniFieldErrors.graduationDate}
                                className="rounded-2xl"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-2xl bg-surface2 border border-border/60 text-xs font-semibold text-muted leading-relaxed">
                            Note: You have selected <strong>College Dropout</strong>. We celebrate real-world builders and industry practitioners! You can leave traditional degree details blank and proceed directly to your career experience below.
                          </div>
                        )}

                        {/* Optional Master's Degree */}
                        <div className="p-4 sm:p-6 rounded-2xl border border-border/70 bg-surface2/50 space-y-4">
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={alumniForm.hasMasters}
                              onChange={(e) => updateAlumni("hasMasters", e.target.checked)}
                              className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                            />
                            <span className="text-sm font-black text-fg">I also completed a Master&apos;s Degree (Optional)</span>
                          </label>

                          {alumniForm.hasMasters && (
                            <div className="grid sm:grid-cols-3 gap-4 pt-2 animate-scale-in">
                              <Input
                                label="Master's Degree *"
                                placeholder="e.g. M.Tech, MBA, MS"
                                value={alumniForm.mastersDegree}
                                onChange={(e) => updateAlumni("mastersDegree", e.target.value)}
                                error={alumniFieldErrors.mastersDegree}
                                className="rounded-2xl"
                              />
                              <Input
                                label="Master's College / University *"
                                placeholder="e.g. IIM Ahmedabad, CMU"
                                value={alumniForm.mastersCollege}
                                onChange={(e) => updateAlumni("mastersCollege", e.target.value)}
                                error={alumniFieldErrors.mastersCollege}
                                className="rounded-2xl"
                              />
                              <Input
                                label="Completion Year *"
                                type="number"
                                placeholder="2023"
                                value={alumniForm.mastersGraduationYear}
                                onChange={(e) => updateAlumni("mastersGraduationYear", e.target.value)}
                                error={alumniFieldErrors.mastersGraduationYear}
                                className="rounded-2xl"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Current Professional Role & Experience */}
                      <div className="space-y-6">
                        <h3 className="text-xs font-black text-muted border-b border-border/60 pb-3 uppercase tracking-widest text-center">Professional Experience</h3>
                        <div className="grid sm:grid-cols-2 gap-6">
                          <Input
                            label="Current Job Title *"
                            placeholder="e.g. Software Engineer, Product Manager"
                            value={alumniForm.currentJobTitle}
                            onChange={(e) => updateAlumni("currentJobTitle", e.target.value)}
                            error={alumniFieldErrors.currentJobTitle}
                            className="rounded-2xl"
                          />
                          <Input
                            label="Current Company / Organization *"
                            placeholder="e.g. Google, Microsoft, Swiggy"
                            value={alumniForm.currentCompany}
                            onChange={(e) => updateAlumni("currentCompany", e.target.value)}
                            error={alumniFieldErrors.currentCompany}
                            className="rounded-2xl"
                          />
                          <Input
                            label="Date of Joining Current Field *"
                            type="date"
                            value={alumniForm.joiningDate}
                            onChange={(e) => updateAlumni("joiningDate", e.target.value)}
                            error={alumniFieldErrors.joiningDate}
                            className="rounded-2xl"
                          />
                          <Input
                            label="Official Corporate Work Email *"
                            type="email"
                            placeholder="yourname@company.com"
                            value={alumniForm.companyEmail}
                            onChange={(e) => updateAlumni("companyEmail", e.target.value)}
                            error={alumniFieldErrors.companyEmail}
                            hint="Private · Never displayed publicly. Used for corporate verification only."
                            className="rounded-2xl font-mono text-sm"
                          />
                        </div>
                      </div>

                      {/* Socials & Guidance Bio */}
                      <div className="space-y-6">
                        <h3 className="text-xs font-black text-muted border-b border-border/60 pb-3 uppercase tracking-widest text-center">Socials & Guidance Bio</h3>
                        <Input
                          label="LinkedIn Profile URL *"
                          placeholder="https://linkedin.com/in/username"
                          value={alumniForm.linkedin}
                          onChange={(e) => updateAlumni("linkedin", e.target.value)}
                          error={alumniFieldErrors.linkedin}
                          hint="Private · Never displayed publicly. Used strictly for background verification."
                          className="rounded-2xl"
                        />
                        <div className="space-y-2">
                          <div className="text-sm font-bold text-fg ml-1">Guidance Bio *</div>
                          <textarea
                            className={`w-full rounded-2xl border bg-surface px-4 py-4 text-sm text-fg outline-none focus:ring-2 focus:ring-primary/20 transition resize-none shadow-sm ${alumniFieldErrors.bio ? "border-danger" : "border-border"}`}
                            rows={4}
                            placeholder="Describe how you can help students (e.g. Resume reviews, off-campus placement strategies, mock coding rounds, referral advice)..."
                            value={alumniForm.bio}
                            onChange={(e) => updateAlumni("bio", e.target.value)}
                          />
                          {alumniFieldErrors.bio && <div className="mt-1.5 text-xs text-danger ml-1">{alumniFieldErrors.bio}</div>}
                        </div>
                      </div>

                      {/* Pricing & 20% Platform Fee Calculator */}
                      <div className="space-y-6">
                        <h3 className="text-xs font-black text-muted border-b border-border/60 pb-3 uppercase tracking-widest text-center">Session Pricing & Availability</h3>
                        <div className="grid sm:grid-cols-2 gap-6 items-start">
                          <div>
                            <Input
                              label="Your Fee for a 20-Min Session (₹) *"
                              type="number"
                              min="99"
                              max="9999"
                              step="50"
                              placeholder="499"
                              value={alumniForm.sessionPrice}
                              onChange={(e) => updateAlumni("sessionPrice", e.target.value)}
                              error={alumniFieldErrors.sessionPrice}
                              className="rounded-2xl text-lg font-black"
                            />
                            <p className="mt-1.5 text-[11px] text-muted font-semibold ml-1">
                              Set your own competitive fee (₹99 – ₹9,999).
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <div className="text-sm font-semibold text-fg ml-1">Weekly Call Availability *</div>
                            <select
                              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-fg outline-none focus:ring-2 focus:ring-primary/20 transition shadow-sm font-semibold"
                              value={alumniForm.weeklySessionsLimit}
                              onChange={(e) => updateAlumni("weeklySessionsLimit", Number(e.target.value))}
                            >
                              <option value={2}>2 sessions / week (~40 mins)</option>
                              <option value={5}>5 sessions / week (~1.5 hours) [Recommended]</option>
                              <option value={8}>8 sessions / week (~2.5 hours)</option>
                              <option value={12}>12 sessions / week (~4 hours)</option>
                              <option value={20}>20+ sessions / week (Power Mentor)</option>
                            </select>
                            <p className="text-[11px] text-muted font-semibold ml-1">
                              Target 20-min sessions you can host per week.
                            </p>
                          </div>

                          <div className="sm:col-span-2">
                            <Input
                              label="UPI ID * (For receiving weekly earnings)"
                              placeholder="username@bank"
                              value={alumniForm.upiId}
                              onChange={(e) => updateAlumni("upiId", e.target.value)}
                              error={alumniFieldErrors.upiId}
                              hint="Private · Direct weekly settlements for completed sessions"
                              className="rounded-2xl"
                            />
                          </div>
                        </div>

                        {/* Real-time 20% Fee Breakdown Card */}
                        <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/5 via-surface to-accent/5 p-6 shadow-soft space-y-4">
                          <div className="flex items-center justify-between border-b border-border/60 pb-3">
                            <span className="text-xs font-black uppercase text-primary tracking-wider flex items-center gap-1.5">
                              <BecomeMentorIcon name="spark" className="w-4 h-4 text-primary" />
                              Earnings Breakdown (Per 20-Min Call)
                            </span>
                            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                              Fixed 20% Fee
                            </span>
                          </div>

                          <div className="space-y-2 text-xs font-bold text-fg/80">
                            <div className="flex justify-between">
                              <span className="text-muted">Student Booking Fee:</span>
                              <span className="font-black text-fg text-sm">₹{currentAlumniFee}</span>
                            </div>
                            <div className="flex justify-between text-danger">
                              <span>Clarior Platform Fee (20%):</span>
                              <span className="font-black">-₹{platformFee}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-border/60 text-sm font-black text-success">
                              <span>Your Net Payout (80%):</span>
                              <span className="text-lg">₹{netEarnings}</span>
                            </div>
                          </div>
                          <p className="text-[10px] font-semibold text-muted leading-relaxed">
                            Note: Completed session earnings are held in your wallet and transferred directly to your registered UPI ID without delay.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-6 pt-2">
                        <label className="flex items-start gap-3 max-w-md cursor-pointer select-none text-left">
                          <input 
                            type="checkbox" 
                            checked={acceptedTerms} 
                            onChange={(e) => {
                              setAcceptedTerms(e.target.checked);
                              setError("");
                            }}
                            className="mt-1 h-4.5 w-4.5 rounded border-border bg-surface text-primary focus:ring-primary/20 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-muted leading-relaxed">
                            I confirm all details are authentic and agree to the{" "}
                            <Link to="/mentor-guidelines" target="_blank" className="text-primary font-black hover:underline">
                              Alumni Mentor Guidelines & Platform Terms
                            </Link>.
                          </span>
                        </label>

                        <Button 
                          type="submit" 
                          loading={loading} 
                          disabled={!acceptedTerms}
                          className="w-full sm:w-auto px-16 rounded-full shadow-hero" 
                          size="xl"
                        >
                          Submit Alumni Application
                        </Button>
                      </div>
                    </form>
                  </>
                )}
              </Card>
            </div>

            {/* Bottom Info Cards */}
            <div className="grid md:grid-cols-2 gap-8 animate-fade-up delay-200">
              <Card className="p-8 sm:p-10 bg-primary/5 border-primary/20 rounded-[32px]">
                <h3 className="heading-display text-2xl font-extrabold text-fg text-center">
                  {mentorTrack === "senior" ? "Why join as a Senior?" : "Why mentor as Alumni?"}
                </h3>
                <ul className="mt-8 space-y-6">
                  {mentorTrack === "senior" ? (
                    [
                      { i: "wallet", t: "Earn ₹52 per call", d: "Highest payout rates for current college students." },
                      { i: "clock", t: "Your own timing", d: "Open slots only when you are free from exams and classes." },
                      { i: "shield", t: "Verified community", d: "Trusted by thousands of high school & JEE aspirants." },
                    ].map(f => (
                      <li key={f.t} className="flex gap-4 sm:gap-5 items-start">
                        <div className="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                          <BecomeMentorIcon name={f.i} />
                        </div>
                        <div>
                          <div className="text-base font-bold text-fg">{f.t}</div>
                          <div className="text-sm text-muted mt-1 leading-relaxed">{f.d}</div>
                        </div>
                      </li>
                    ))
                  ) : (
                    [
                      { i: "wallet", t: "Keep 80% of your fee", d: "Set your own 20-min session rate. Transparent 20% platform commission." },
                      { i: "clock", t: "Flexible weekend/evening slots", d: "Schedule 20-minute sessions that fit around your office hours." },
                      { i: "building", t: "Build your personal brand", d: "Showcase your company credentials, mentor hungry juniors, and source top talent." },
                    ].map(f => (
                      <li key={f.t} className="flex gap-4 sm:gap-5 items-start">
                        <div className="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                          <BecomeMentorIcon name={f.i} />
                        </div>
                        <div>
                          <div className="text-base font-bold text-fg">{f.t}</div>
                          <div className="text-sm text-muted mt-1 leading-relaxed">{f.d}</div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </Card>

              <Card className="p-8 sm:p-10 rounded-[32px]">
                <h3 className="heading-display text-2xl font-extrabold text-fg mb-8 text-center">Application Process</h3>
                <div className="space-y-6 sm:space-y-8">
                  {[
                    { n: "1", t: "Submit Details", d: mentorTrack === "senior" ? "Fill your academic, branch, and college credentials." : "Submit your college, current company, and corporate email." },
                    { n: "2", t: "Background Review", d: mentorTrack === "senior" ? "Our team verifies your active student enrollment." : "Our team verifies your LinkedIn profile and corporate domain." },
                    { n: "3", t: "Go Live", d: mentorTrack === "senior" ? "Start receiving student bookings at ₹69 flat." : "Set your custom slot schedule and receive 80% direct payouts." },
                  ].map(s => (
                    <div key={s.n} className="flex gap-4 sm:gap-5 items-start">
                      <div className="h-10 w-10 flex-shrink-0 rounded-2xl bg-surface2 border border-border flex items-center justify-center text-sm font-black text-primary shadow-sm">{s.n}</div>
                      <div className="flex-1">
                        <div className="text-base font-bold text-fg">{s.t}</div>
                        <p className="text-sm text-muted mt-1 leading-relaxed">{s.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-border text-center">
                  <Link to="/mentor-guidelines" className="text-xs sm:text-sm font-black text-primary hover:underline uppercase tracking-widest">
                    Read mentor guidelines & policies →
                  </Link>
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
