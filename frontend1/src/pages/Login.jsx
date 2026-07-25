import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/layout/icons";
import useSEO from "../hooks/useSEO";
import ResetPasswordModal from "../components/ResetPasswordModal";
import PhoneVerificationModal from "../components/PhoneVerificationModal";

function Login() {
  useSEO({ title: "Login", description: "Login to your Clarior account to connect with verified senior mentors." });

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleClientId, setGoogleClientId] = useState("");
  const { setUser, fetchUser } = useAuth();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleLogin = async () => {
    setError("");
    if (!identifier || !password) {
      setError("Please enter your email or phone number and password.");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { identifier, password });
      setUser(res.data.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Please check your credentials.");
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
      setError(err?.response?.data?.message || "Google login failed. Please try again.");
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
          document.getElementById("google-signin-button"),
          { theme: "outline", size: "large", width: 420, text: "continue_with" }
        );
      } else { setTimeout(init, 100); }
    };
    init();
  }, [googleClientId]);

  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };

  const trustPoints = [
    "Verified seniors from IITs, BITS, AIIMS and more",
    "Honest, experience-backed guidance only",
    "20-minute focused sessions, fully timed",
  ];

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Left Branding Panel */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-[44%] flex-col justify-between relative overflow-hidden p-12"
        style={{ background: "linear-gradient(135deg, #0f2851 0%, #1e3a8a 40%, #1d4ed8 100%)" }}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        {/* Glow orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-3">
          <Logo size="footer" />
          <span className="text-white font-extrabold text-2xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Clarior</span>
        </Link>

        {/* Main copy */}
        <div className="relative space-y-8">
          <div>
            <p className="text-blue-300 text-xs font-black uppercase tracking-widest mb-3">Welcome back</p>
            <h2 className="text-4xl font-black text-white leading-[1.15] tracking-tight">
              Your best decision starts with the right conversation.
            </h2>
            <p className="text-blue-200/80 text-sm leading-7 mt-4">
              Thousands of students have already gotten clarity from verified seniors who've been exactly where they are.
            </p>
          </div>

          {/* Trust bullets */}
          <ul className="space-y-3.5">
            {trustPoints.map(point => (
              <li key={point} className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-xl bg-blue-500/25 border border-blue-400/25 flex items-center justify-center flex-shrink-0">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-blue-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-blue-100/90 text-sm">{point}</span>
              </li>
            ))}
          </ul>

          {/* Testimonial */}
          <div className="rounded-2xl bg-white/[0.07] border border-white/[0.1] backdrop-blur-sm p-5">
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="13" height="13" fill="#fbbf24" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <p className="text-white/85 text-sm italic leading-6">
              "After one session I knew exactly which college and branch was right for me. Clarior is unlike anything else."
            </p>
            <div className="mt-3 text-blue-300 text-xs font-semibold">— Arjun M., JEE 2025</div>
          </div>
        </div>

        <div className="relative text-blue-300/60 text-xs">
          &copy; {currentYear} Clarior. Built for students, by students.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-5 py-12 pb-28 md:pb-12 overflow-y-auto">
        {/* Mobile logo */}
        <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8">
          <Logo size="navbar" />
          <span className="font-extrabold text-xl text-fg" style={{ fontFamily: "'Playfair Display', serif" }}>Clarior</span>
        </Link>

        <div className="w-full max-w-[420px] animate-fade-up">
          {/* Header */}
          <div className="mb-7">
            <h1 className="text-[1.75rem] font-black tracking-tight text-fg leading-tight">Welcome back</h1>
            <p className="text-muted text-sm mt-1.5">Sign in to continue your clarity journey.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 text-sm font-semibold text-danger bg-danger/8 border border-danger/25 rounded-2xl px-4 py-3.5 animate-scale-in">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" className="flex-shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {/* Identifier */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-fg mb-1.5">Email or Phone Number</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  id="login-email"
                  type="text"
                  placeholder="you@example.com or 9876543210"
                  value={identifier}
                  onChange={e => { setIdentifier(e.target.value); setError(""); }}
                  onKeyDown={handleKeyDown}
                  autoComplete="username"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-surface text-fg text-sm font-medium placeholder:text-muted/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-xs font-bold text-fg">Password</label>
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
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
            </div>
          </div>

          {/* Login Button */}
          <button
            id="login-submit"
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="mt-5 w-full py-3.5 rounded-xl bg-primary text-white font-black text-sm tracking-wide hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                Sign In
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

          {/* Google Sign In */}
          <div id="google-signin-button" className="w-full flex justify-center" />

          {/* Footer links */}
          <p className="mt-5 text-center text-sm text-muted">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-bold hover:underline">Create one</Link>
          </p>

          {/* Verified Network Badge */}
          <div className="mt-6 p-4 rounded-2xl bg-surface/80 border border-border/60 flex items-center justify-between gap-4 select-none">
            <div>
              <div className="text-[10px] font-black text-muted uppercase tracking-wider">Verified Network</div>
              <div className="text-xs font-bold text-fg mt-0.5">Connected with top university seniors</div>
            </div>
            <div className="flex -space-x-2 overflow-hidden flex-shrink-0">
              {["IIT", "BITS", "NIT", "AIIMS"].map((abbr, i) => (
                <div key={i} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent border-2 border-surface text-[8px] font-black text-white">
                  {abbr[0]}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-border/60 text-center">
            <Link to="/" className="text-xs text-muted hover:text-fg transition">Back to home</Link>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onSuccess={() => setError("")}
      />

      {/* Phone Verification Modal for Google Auth */}
      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => {
          setIsPhoneModalOpen(false);
          navigate("/dashboard", { replace: true });
        }}
        onSuccess={async () => {
          setIsPhoneModalOpen(false);
          await fetchUser();
          navigate("/dashboard", { replace: true });
        }}
      />
    </div>
  );
}

export default Login;
