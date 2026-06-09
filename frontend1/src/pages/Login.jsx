import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Logo } from "../components/layout/icons";
import useSEO from "../hooks/useSEO";

const trustPoints = [
  "Verified seniors from top Indian colleges",
  "Honest, experience-based guidance only",
  "25-minute focused sessions, timer-tracked",
];

function Login() {
  useSEO({
    title: "Login",
    description: "Clarior Login page"
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel — Branding ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[44%] flex-col justify-between relative overflow-hidden bg-[#1a3a8f] p-12">

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <Logo size="footer" />
          <span className="text-white font-brand font-extrabold text-2xl tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
            Clarior
          </span>
        </div>

        {/* Center copy */}
        <div className="relative space-y-6">
          <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            Your best decision starts with the right conversation.
          </h2>
          <p className="text-blue-100 text-base leading-7">
            Thousands of students have already gotten clarity from verified seniors who've been exactly where they are.
          </p>

          {/* Trust bullets */}
          <ul className="space-y-3 mt-8">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#2563eb] text-white text-xs font-bold flex-shrink-0">✓</span>
                <span className="text-blue-50 text-sm leading-6">{point}</span>
              </li>
            ))}
          </ul>

          {/* Testimonial snippet */}
          <div className="mt-8 rounded-2xl bg-[#2563eb] border border-[#3b82f6] p-5">
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="14" height="14" fill="#fbbf24" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <p className="text-white/90 text-sm italic leading-6">
              "After one session I knew exactly which college and branch was right for me. Clarior is unlike anything else."
            </p>
            <div className="mt-3 text-blue-200 text-xs font-semibold">— Arjun M., BITS Pilani '25</div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="relative text-blue-200 text-xs">
          © {currentYear} Clarior. Trusted by students across India.
        </div>
      </div>

      {/* ── Right Panel — Form ────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-bg min-h-screen">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <Logo size="navbar" />
          <span className="font-extrabold text-xl text-fg" style={{ fontFamily: "'Playfair Display', serif" }}>Clarior</span>
        </div>

        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-fg">Good to see you again 👋</h1>
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
            <Input
              label="Password"
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

          <p className="mt-5 text-center text-sm text-muted">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </p>

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
