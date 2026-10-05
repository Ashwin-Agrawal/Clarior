import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Logo } from "../components/layout/icons";
import useSEO from "../hooks/useSEO";

const trustPoints = [
  "Verified seniors from colleges worldwide",
  "Honest, experience-based guidance only",
  "20-minute focused sessions, timer-tracked",
];

function Login() {
    useSEO({
      title: "Login",
      description: "Login to your Clarior account to connect with verified mentors."
    });
  
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [googleClientId, setGoogleClientId] = useState("");
    const currentYear = new Date().getFullYear();
  
    const handleLogin = async () => {
      try {
        setError("");
        setLoading(true);
        const res = await api.post("/auth/login", { email, password });
        setUser(res.data.data.user);
        navigate("/dashboard", { replace: true });
      } catch (err) {
        setError(err?.response?.data?.message || "Login failed. Check your credentials.");
      } finally {
        setLoading(false);
      }
    };

    const handleGoogleLogin = async (response) => {
      try {
        setLoading(true);
        setError("");
        const res = await api.post("/auth/google", { idToken: response.credential });
        setUser(res.data.user);
        navigate("/dashboard", { replace: true });
      } catch (err) {
        setError(err?.response?.data?.message || "Google login failed.");
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
            document.getElementById("google-signin-button"),
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
  
    const handleKeyDown = (e) => {
      if (e.key === "Enter") handleLogin();
    };
  
    return (
      <div className="min-h-screen flex">
        {/* ── Left Panel — Branding ─────────────────────────────── */}
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
              1:1 Mentorship
            </div>
          </div>

          {/* Center Copy & Authentic Product Features */}
          <div className="relative z-10 my-auto py-8 space-y-6 max-w-lg">
            <div className="space-y-3">
              <div className="inline-block text-[11px] font-black uppercase tracking-[0.22em] text-primary">
                Unbiased College Clarity
              </div>
              <h2 className="text-3xl xl:text-4xl font-black text-fg leading-[1.18] tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                The direct path to your <span className="gradient-text">ideal college decision.</span>
              </h2>
              <p className="text-muted text-sm leading-relaxed font-medium">
                Skip promotional brochures and unverified forum claims. Get honest guidance directly from college seniors currently enrolled on campus.
              </p>
            </div>

            {/* Real Platform Feature Pillars (No Dummy Data) */}
            <div className="space-y-3 pt-2">
              <div className="rounded-2xl bg-surface2/60 border border-border/80 p-4 space-y-1 hover:border-primary/30 transition-all shadow-xs">
                <div className="flex items-center gap-2 text-xs font-black text-fg">
                  <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </span>
                  Verified Senior Community
                </div>
                <p className="text-xs text-muted leading-relaxed pl-7">
                  Every mentor on Clarior is verified with college enrollment credentials before offering guidance calls.
                </p>
              </div>

              <div className="rounded-2xl bg-surface2/60 border border-border/80 p-4 space-y-1 hover:border-primary/30 transition-all shadow-xs">
                <div className="flex items-center gap-2 text-xs font-black text-fg">
                  <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </span>
                  Timer-Tracked 20-Minute Calls
                </div>
                <p className="text-xs text-muted leading-relaxed pl-7">
                  Private, in-app video sessions designed to answer high-stakes questions with zero sales pitches.
                </p>
              </div>

              <div className="rounded-2xl bg-surface2/60 border border-border/80 p-4 space-y-1 hover:border-primary/30 transition-all shadow-xs">
                <div className="flex items-center gap-2 text-xs font-black text-fg">
                  <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-success/10 text-success">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </span>
                  Flat ₹69 Pricing & Refund Protection
                </div>
                <p className="text-xs text-muted leading-relaxed pl-7">
                  Honest, transparent pricing. In case of an unfulfilled session, credits are immediately returned.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="relative z-10 flex items-center justify-between text-muted text-xs pt-4 border-t border-border/70">
            <span>© {currentYear} Clarior</span>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <svg className="w-3.5 h-3.5 text-success" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.5a9 9 0 11-6.364 15.364A9 9 0 0112 4.5z" /></svg>
              Encrypted 1:1 In-App Rooms
            </span>
          </div>
        </div>
  
        {/* ── Right Panel — Form ────────────────────────────────── */}
        <div className="flex-1 flex flex-col justify-center items-center px-5 py-12 pb-28 md:pb-12 bg-bg min-h-screen">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8 transition hover:opacity-90">
            <Logo size="navbar" />
            <span className="font-extrabold text-xl text-fg" style={{ fontFamily: "'Playfair Display', serif" }}>Clarior</span>
          </Link>
  
          <div className="w-full max-w-md animate-fade-up">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-fg">Good to see you again </h1>
              <p className="text-muted mt-2 text-sm">Your clarity journey continues here.</p>
            </div>
  
            {error && (
              <div className="mb-5 flex items-center gap-2.5 text-sm text-danger bg-danger/8 border border-danger/25 rounded-xl px-4 py-3 animate-scale-in">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" className="flex-shrink-0">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
  
            <div className="space-y-4">
              <Input
                label="Email"
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="email"
                iconLeft={
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                }
              />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="login-password" className="text-sm font-bold text-fg">Password</label>
                  <button 
                    onClick={() => setError("Password reset coming soon. Contact support@clarior.in")}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                  iconLeft={
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  }
                />
              </div>
            </div>
  
            <Button
              id="login-submit"
              onClick={handleLogin}
              loading={loading}
              className="mt-6 w-full"
              size="lg"
              iconRight={!loading && <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" /></svg>}
            >
              Login
            </Button>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-xs text-muted uppercase font-bold tracking-wider">or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <div className="w-full flex justify-center py-1">
              <div id="google-signin-button" className="w-full flex justify-center transition-all hover:opacity-95" />
            </div>
  
            <p className="mt-5 text-center text-sm text-muted">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Create one
              </Link>
            </p>
  
            {/* Community Social Proof Badge */}
            <div className="mt-8 p-4 rounded-2xl bg-surface2 border border-border flex items-center justify-between gap-4 select-none">
              <div>
                <div className="text-[10px] font-black text-muted uppercase tracking-wider">Join the community</div>
                <div className="text-xs font-black text-fg mt-0.5">5,000+ students already inside</div>
              </div>
              <div className="flex -space-x-2.5 overflow-hidden">
                {["IITD", "IITB", "BITS", "DTU"].map((initial, i) => (
                  <div key={i} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent border-2 border-surface text-[9px] font-black text-white">
                    {initial[0]}
                  </div>
                ))}
              </div>
            </div>
  
            <div className="mt-6 pt-6 border-t border-border text-center">
              <Link to="/" className="text-xs text-muted hover:text-fg transition">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Login;
