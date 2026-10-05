import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Logo } from "../components/layout/icons";
import useSEO from "../hooks/useSEO";

function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ chars", ok: password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
    { label: "Special", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const barColors = ["bg-danger", "bg-danger", "bg-warning", "bg-success", "bg-success"];
  const labels = ["", "Weak", "Weak", "Good", "Strong"];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? barColors[score] : "bg-border"}`} />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          {checks.map(c => (
            <span key={c.label} className={`text-[10px] font-medium ${c.ok ? "text-success" : "text-muted"}`}>
              {c.ok ? "" : "·"} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-xs font-semibold ${score === 4 ? "text-success" : score >= 2 ? "text-warning" : "text-danger"}`}>
            {labels[score]}
          </span>
        )}
      </div>
    </div>
  );
}

function Register() {
  useSEO({ title: "Register", description: "Create an account on Clarior to connect with verified senior mentors." });
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [googleClientId, setGoogleClientId] = useState("");
  const currentYear = new Date().getFullYear();

  const handleRegister = async () => {
    try {
      setError("");
      if (!form.name || !form.email || !form.password) { setError("All fields are required."); return; }
      if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
      setLoading(true);
      await api.post("/auth/register", { ...form, role: "student" });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      const msg = err?.response?.data?.message;
      const ve = err?.response?.data?.errors;
      setError(ve?.length > 0 ? `${msg}: ${ve[0].msg}` : msg || "Registration failed.");
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async (response) => {
    try {
      setLoading(true);
      setError("");
      const res = await api.post("/auth/google", { idToken: response.credential });
      setUser(res.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Google signup failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get("/auth/google-config");
        setGoogleClientId(res.data.clientId);
      } catch (err) {
        console.error("Failed to load Google config:", err);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (!googleClientId) return;

    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleLogin,
        });
        const isDark = document.documentElement.classList.contains("dark");
        window.google.accounts.id.renderButton(
          document.getElementById("google-signup-button"),
          {
            theme: isDark ? "filled_black" : "outline",
            size: "large",
            width: 384,
            text: "continue_with",
            shape: "pill",
            logo_alignment: "center",
          }
        );
      } else {
        setTimeout(initGoogle, 100);
      }
    };

    initGoogle();
  }, [googleClientId]);

  const handleKeyDown = (e) => { if (e.key === "Enter") handleRegister(); };
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel — Production Branding & Platform Architecture ─── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[46%] flex-col justify-between relative overflow-hidden bg-surface border-r border-border/80 p-10 xl:p-14 select-none">
        {/* Subtle Ambient Glow Mesh */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        
        {/* Top Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-85 group">
            <div className="p-2 rounded-2xl bg-surface2 border border-border/80 group-hover:border-primary/40 transition-colors shadow-xs">
              <Logo size="navbar" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-fg" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Clarior
            </span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface2 border border-border text-[11px] font-black uppercase tracking-wider text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Student Access
          </div>
        </div>

        {/* Center Copy & Real Platform Architecture */}
        <div className="relative z-10 my-auto py-8 space-y-6 max-w-lg">
          <div className="space-y-3">
            <div className="inline-block text-[11px] font-black uppercase tracking-[0.22em] text-primary">
              Student Registration
            </div>
            <h2 className="text-3xl xl:text-4xl font-black text-fg leading-[1.18] tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              The peer mentorship network built for <span className="gradient-text">honest guidance.</span>
            </h2>
            <p className="text-muted text-sm leading-relaxed font-medium">
              Create your account to book 1:1 sessions with verified seniors currently enrolled in top universities nationwide.
            </p>
          </div>

          {/* Authentic Feature Architecture (Zero Dummy Data) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-2xl bg-surface2/60 border border-border/80 p-4 space-y-1.5 hover:border-primary/30 transition-all shadow-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                </span>
                <span className="text-xs font-black text-fg">Verified Seniors</span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed font-medium">Real university students verified via college credentials.</p>
            </div>

            <div className="rounded-2xl bg-surface2/60 border border-border/80 p-4 space-y-1.5 hover:border-primary/30 transition-all shadow-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                <span className="text-xs font-black text-fg">20-Min Focus</span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed font-medium">Timer-tracked private calls designed for fast clarity.</p>
            </div>

            <div className="rounded-2xl bg-surface2/60 border border-border/80 p-4 space-y-1.5 hover:border-primary/30 transition-all shadow-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-success/10 text-success">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                <span className="text-xs font-black text-fg">₹69 Flat Pass</span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed font-medium">Low barrier to entry. Zero subscriptions or lock-ins.</p>
            </div>

            <div className="rounded-2xl bg-surface2/60 border border-border/80 p-4 space-y-1.5 hover:border-primary/30 transition-all shadow-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                </span>
                <span className="text-xs font-black text-fg">Escrow Safety</span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed font-medium">Session credits refunded if a call is missed or cancelled.</p>
            </div>
          </div>
        </div>

        {/* Footer Metadata */}
        <div className="relative z-10 flex items-center justify-between text-muted text-xs pt-4 border-t border-border/70">
          <span>© {currentYear} Clarior</span>
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <svg className="w-3.5 h-3.5 text-success" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.5a9 9 0 11-6.364 15.364A9 9 0 0112 4.5z" /></svg>
            Student First • Zero Spam
          </span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 pb-28 md:pb-12 bg-bg">
        <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8 transition hover:opacity-90">
          <Logo size="navbar" />
          <span className="font-extrabold text-xl text-fg" style={{ fontFamily: "'Playfair Display', serif" }}>Clarior</span>
        </Link>
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-fg">Register as Student</h1>
            <p className="text-muted mt-2 text-sm">Start your mentorship journey in seconds.</p>
          </div>
          {success && (
            <div className="mb-5 flex items-center gap-3 text-sm text-success bg-success/8 border border-success/25 rounded-xl px-4 py-3 animate-scale-in">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20" className="flex-shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Account created! Redirecting to login...
            </div>
          )}
          {error && (
            <div className="mb-5 flex items-center gap-2.5 text-sm text-danger bg-danger/8 border border-danger/25 rounded-xl px-4 py-3 animate-scale-in">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" className="flex-shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          <div className="space-y-4">
            <Input label="Full name" id="reg-name" placeholder="Your name" value={form.name} onChange={update("name")} onKeyDown={handleKeyDown} autoComplete="name"
              iconLeft={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
            <Input label="Email" id="reg-email" type="email" placeholder="you@example.com" value={form.email} onChange={update("email")} onKeyDown={handleKeyDown} autoComplete="email"
              iconLeft={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} />
            <div>
              <Input label="Password" id="reg-password" type="password" placeholder="At least 8 characters" value={form.password} onChange={update("password")} onKeyDown={handleKeyDown} autoComplete="new-password"
                iconLeft={<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>} />
              <PasswordStrength password={form.password} />
            </div>
          </div>
          <Button id="reg-submit" onClick={handleRegister} loading={loading} className="mt-6 w-full" size="lg" iconRight={!loading && <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" /></svg>}>
            Create account
          </Button>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-xs text-muted uppercase font-bold tracking-wider">or</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <div className="w-full flex justify-center py-1">
            <div id="google-signup-button" className="w-full flex justify-center transition-all hover:opacity-95" />
          </div>
          <p className="mt-5 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Login</Link>
          </p>
          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link to="/" className="text-xs text-muted hover:text-fg transition">Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
