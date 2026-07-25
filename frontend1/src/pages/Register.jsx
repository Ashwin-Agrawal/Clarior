import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/layout/icons";
import useSEO from "../hooks/useSEO";
import PhoneVerificationModal from "../components/PhoneVerificationModal";

function PasswordBar({ password }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const color = score <= 1 ? "bg-danger" : score === 2 ? "bg-warning" : score === 3 ? "bg-warning" : "bg-success";
  const label = score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong";
  const labelColor = score <= 1 ? "text-danger" : score === 2 ? "text-warning" : score === 3 ? "text-warning" : "text-success";

  return (
    <div className="mt-2.5 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? color : "bg-border"}`} />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          {[["8+ chars", checks[0]], ["A-Z", checks[1]], ["0-9", checks[2]], ["#@!", checks[3]]].map(([t, ok]) => (
            <span key={t} className={`text-[10px] font-semibold transition-colors ${ok ? "text-success" : "text-muted"}`}>{t}</span>
          ))}
        </div>
        {score > 0 && <span className={`text-[10px] font-black uppercase tracking-wider ${labelColor}`}>{label}</span>}
      </div>
    </div>
  );
}

function Register() {
  useSEO({ title: "Create Account", description: "Sign up on Clarior to connect with verified senior mentors from top colleges." });

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [googleClientId, setGoogleClientId] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const currentYear = new Date().getFullYear();

  const update = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setError("");
  };

  const handleRegister = async () => {
    setError("");
    if (!form.name.trim()) { setError("Full name is required."); return; }
    if (!form.email.trim()) { setError("Email address is required."); return; }
    if (!form.phone.trim()) { setError("Mobile number is required. Please enter and verify it."); return; }
    if (!isPhoneVerified) { setError("Mobile number must be verified via OTP before creating your account."); return; }
    if (!form.password) { setError("Password is required."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }

    try {
      setLoading(true);
      await api.post("/auth/register", { ...form, role: "student", isPhoneVerified: true });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const msg = err?.response?.data?.message;
      const ve = err?.response?.data?.errors;
      setError(ve?.length > 0 ? `${msg}: ${ve[0].msg}` : msg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (response) => {
    try {
      setLoading(true);
      setError("");
      const res = await api.post("/auth/google", { idToken: response.credential });
      const loggedUser = res.data.user;
      setUser(loggedUser);
      if (!loggedUser?.isPhoneVerified || !loggedUser?.phone) {
        setIsPhoneModalOpen(true);
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Google sign-up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/auth/google-config")
      .then(res => setGoogleClientId(res.data.clientId))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!googleClientId) return;
    const init = () => {
      if (window.google) {
        window.google.accounts.id.initialize({ client_id: googleClientId, callback: handleGoogleLogin });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signup-btn"),
          { theme: "outline", size: "large", width: 420, text: "continue_with" }
        );
      } else { setTimeout(init, 100); }
    };
    init();
  }, [googleClientId]);

  const handleKeyDown = (e) => { if (e.key === "Enter") handleRegister(); };

  const features = [
    { title: "Verified Senior Network", desc: "Mentors from IITs, BITS, AIIMS, and leading colleges across India." },
    { title: "Private & Secure", desc: "Your mobile number and personal data are never shared publicly." },
    { title: "Affordable Sessions", desc: "20-minute focused calls designed for real, actionable clarity." },
  ];

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[44%] flex-col justify-between relative overflow-hidden p-12"
        style={{ background: "linear-gradient(135deg, #0f2851 0%, #1e3a8a 40%, #1d4ed8 100%)" }}>
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        {/* Glow orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-3 group">
          <Logo size="footer" />
          <span className="text-white font-extrabold text-2xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Clarior</span>
        </Link>

        {/* Main copy */}
        <div className="relative space-y-8">
          <div>
            <p className="text-blue-300 text-xs font-black uppercase tracking-widest mb-3">Start your journey</p>
            <h2 className="text-4xl font-black text-white leading-[1.15] tracking-tight">
              The clarity you need,<br />from seniors who've been there.
            </h2>
            <p className="text-blue-200/80 text-sm leading-7 mt-4">
              Get honest, experience-backed guidance from verified seniors at top colleges — before making your most important decisions.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.06] border border-white/[0.1] backdrop-blur-sm">
                <div className="h-8 w-8 rounded-xl bg-blue-500/30 border border-blue-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-blue-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{f.title}</div>
                  <div className="text-blue-200/70 text-xs mt-0.5 leading-5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-blue-300/60 text-xs">
          &copy; {currentYear} Clarior. Built for students, by students.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-5 py-10 pb-28 md:pb-10 overflow-y-auto">
        {/* Mobile logo */}
        <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8">
          <Logo size="navbar" />
          <span className="font-extrabold text-xl text-fg" style={{ fontFamily: "'Playfair Display', serif" }}>Clarior</span>
        </Link>

        <div className="w-full max-w-[420px] animate-fade-up">
          {/* Header */}
          <div className="mb-7">
            <h1 className="text-[1.75rem] font-black tracking-tight text-fg leading-tight">Create your account</h1>
            <p className="text-muted text-sm mt-1.5">Join Clarior and get guidance from verified seniors.</p>
          </div>

          {/* Success state */}
          {success && (
            <div className="mb-5 flex items-center gap-3 text-sm font-semibold text-success bg-success/8 border border-success/25 rounded-2xl px-4 py-3.5">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Account created successfully! Redirecting to login...
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="mb-5 flex items-start gap-3 text-sm font-semibold text-danger bg-danger/8 border border-danger/25 rounded-2xl px-4 py-3.5 animate-scale-in">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" className="flex-shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-3.5">
            {/* Name */}
            <div>
              <label htmlFor="reg-name" className="block text-xs font-bold text-fg mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <input
                  id="reg-name" type="text" placeholder="Your full name"
                  value={form.name} onChange={update("name")} onKeyDown={handleKeyDown}
                  autoComplete="name"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-surface text-fg text-sm font-medium placeholder:text-muted/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-bold text-fg mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <input
                  id="reg-email" type="email" placeholder="you@example.com"
                  value={form.email} onChange={update("email")} onKeyDown={handleKeyDown}
                  autoComplete="email"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-surface text-fg text-sm font-medium placeholder:text-muted/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            {/* Mobile Number with OTP */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="reg-phone" className="text-xs font-bold text-fg">Mobile Number</label>
                {isPhoneVerified ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Verified
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-warning uppercase tracking-wider">Required</span>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </span>
                  <input
                    id="reg-phone" type="tel" placeholder="9876543210"
                    value={form.phone}
                    onChange={e => { update("phone")(e); setIsPhoneVerified(false); }}
                    onKeyDown={handleKeyDown} autoComplete="tel" maxLength={10}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-surface text-fg text-sm font-medium placeholder:text-muted/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhoneModalOpen(true)}
                  className={`px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex-shrink-0 border ${
                    isPhoneVerified
                      ? "bg-success/10 border-success/25 text-success"
                      : "bg-primary text-white border-transparent hover:bg-primary/90 shadow-sm"
                  }`}
                >
                  {isPhoneVerified ? "Verified" : "Send OTP"}
                </button>
              </div>
              <p className="text-[10px] text-muted mt-1.5 font-medium">Your number is private and never displayed publicly.</p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-xs font-bold text-fg mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  id="reg-password" type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={form.password} onChange={update("password")} onKeyDown={handleKeyDown}
                  autoComplete="new-password"
                  className="w-full pl-9 pr-11 py-3 rounded-xl border border-border bg-surface text-fg text-sm font-medium placeholder:text-muted/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-fg transition-colors">
                  {showPassword
                    ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              <PasswordBar password={form.password} />
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="reg-submit"
            type="button"
            onClick={handleRegister}
            disabled={loading || success}
            className="mt-5 w-full py-3.5 rounded-xl bg-primary text-white font-black text-sm tracking-wide hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex items-center my-5">
            <div className="flex-grow border-t border-border" />
            <span className="flex-shrink mx-4 text-[10px] text-muted uppercase font-bold tracking-widest">or continue with</span>
            <div className="flex-grow border-t border-border" />
          </div>

          {/* Google Button */}
          <div id="google-signup-btn" className="w-full flex justify-center" />

          {/* Footer links */}
          <p className="mt-5 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
          </p>
          <div className="mt-5 pt-5 border-t border-border/60 text-center">
            <Link to="/" className="text-xs text-muted hover:text-fg transition">Back to home</Link>
          </div>
        </div>
      </div>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => {
          setIsPhoneModalOpen(false);
          if (user?.isPhoneVerified) {
            navigate("/dashboard", { replace: true });
          }
        }}
        onSuccess={async (verifiedUser) => {
          setIsPhoneVerified(true);
          if (verifiedUser?.phone) {
            setForm(prev => ({ ...prev, phone: verifiedUser.phone.replace("+91", "") }));
          }
          if (user) {
            // User is logged in via Google auth
            setIsPhoneModalOpen(false);
            await fetchUser();
            navigate("/dashboard", { replace: true });
          } else {
            // Form registration flow
            setIsPhoneModalOpen(false);
          }
        }}
      />
    </div>
  );
}

export default Register;
