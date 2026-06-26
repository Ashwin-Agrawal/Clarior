import { useState, useEffect } from "react";
import api from "../services/api";
import Button from "./ui/Button";

/* Detects if the page is currently in dark mode */
function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function RequestCollegeModal({ isOpen, onClose }) {
  const isDark = useIsDark();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [type, setType] = useState("Private");
  const [established, setEstablished] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  /* ── colour tokens resolved at render time ── */
  const bg       = isDark ? "#0f1d33" : "#ffffff";
  const surface  = isDark ? "#142439" : "#f8fafc";
  const border   = isDark ? "#233b5c" : "#d0e0f7";
  const fg       = isDark ? "#dfeafc" : "#10213b";
  const muted    = isDark ? "#95b0dc" : "#567198";
  const inputBg  = isDark ? "#14253d" : "#ffffff";

  const labelStyle   = { fontSize: 13, fontWeight: 600, color: fg, marginBottom: 6, display: "block" };
  const inputStyle   = {
    width: "100%", height: 44, padding: "0 14px", borderRadius: 12,
    border: `1.5px solid ${border}`, background: inputBg, color: fg,
    fontSize: 14, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };
  const selectStyle  = { ...inputStyle, cursor: "pointer" };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !city.trim() || !state.trim()) {
      setError("College Name, City, and State are required.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setSubmitted(false);
      await api.post("/colleges/request", {
        name: name.trim(),
        city: city.trim(),
        state: state.trim(),
        type,
        established: established ? parseInt(established) : undefined,
        requesterEmail: requesterEmail.trim() || undefined,
      });
      setSubmitted(true);
      setName(""); setCity(""); setState("");
      setType("Private"); setEstablished(""); setRequesterEmail("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { setError(""); setSubmitted(false); onClose(); };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        background: isDark ? "rgba(0,0,0,0.65)" : "rgba(15,33,59,0.35)",
        backdropFilter: "blur(10px)",
        animation: "fadeIn 0.25s ease both",
      }}
    >
      {/* Backdrop click */}
      <div style={{ position: "absolute", inset: 0 }} onClick={handleClose} />

      {/* Modal box */}
      <div
        style={{
          position: "relative", zIndex: 10,
          width: "100%", maxWidth: 520,
          background: bg,
          border: `1.5px solid ${border}`,
          borderRadius: 28,
          padding: "32px 28px",
          boxShadow: isDark
            ? "0 32px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)"
            : "0 32px 80px -20px rgba(15,33,59,0.18), 0 0 0 1px rgba(37,99,235,0.06)",
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "scaleIn 0.3s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute", top: 14, right: 14,
            width: 32, height: 32, borderRadius: "50%",
            background: "transparent", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: muted,
          }}
          aria-label="Close modal"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "3px 12px", borderRadius: 999,
          background: isDark ? "rgba(96,165,250,0.15)" : "rgba(37,99,235,0.1)",
          border: `1px solid ${isDark ? "rgba(96,165,250,0.25)" : "rgba(37,99,235,0.2)"}`,
          color: isDark ? "#60a5fa" : "#2563eb",
          fontSize: 10, fontWeight: 900, letterSpacing: "0.12em",
          textTransform: "uppercase", marginBottom: 12,
        }}>
          Add Platform Request
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 900, color: fg, marginBottom: 6, lineHeight: 1.15 }}>
          Request to Add{" "}
          <span style={{
            background: "linear-gradient(135deg, #2563eb, #38bdf8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            College.
          </span>
        </h2>
        <p style={{ fontSize: 12, color: muted, lineHeight: 1.7, marginBottom: 20 }}>
          Can't find your college? Submit a request here. Once approved by the administrator, seniors can sign up under this college and students can browse it.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Error */}
          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 12, marginBottom: 14,
              background: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444",
              fontSize: 12, fontWeight: 700,
            }}>{error}</div>
          )}

          {/* Success */}
          {submitted && (
            <div style={{
              padding: "10px 14px", borderRadius: 12, marginBottom: 14,
              background: isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.3)", color: "#10b981",
              fontSize: 12, fontWeight: 700,
            }}>
              🎉 Request submitted! Our team will verify and add the college to the platform.
            </div>
          )}

          {/* College Name */}
          <div style={{ marginBottom: 14 }}>
            <span style={labelStyle}>College Name <span style={{ color: "#ef4444" }}>*</span></span>
            <input
              style={inputStyle}
              className="placeholder:text-muted/60 focus:border-primary/60 outline-none"
              placeholder="e.g. MS Ramaiah Institute of Technology (MSRIT)"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* City + State */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <span style={labelStyle}>City <span style={{ color: "#ef4444" }}>*</span></span>
              <input
                style={inputStyle}
                className="placeholder:text-muted/60 focus:border-primary/60 outline-none"
                placeholder="e.g. Bengaluru"
                value={city}
                onChange={e => setCity(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div>
              <span style={labelStyle}>State <span style={{ color: "#ef4444" }}>*</span></span>
              <input
                style={inputStyle}
                className="placeholder:text-muted/60 focus:border-primary/60 outline-none"
                placeholder="e.g. Karnataka"
                value={state}
                onChange={e => setState(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Type + Year */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <span style={labelStyle}>College Type</span>
              <select
                style={selectStyle}
                value={type}
                onChange={e => setType(e.target.value)}
                disabled={loading}
              >
                <option value="Private" style={{ background: inputBg, color: fg }}>Private</option>
                <option value="Government" style={{ background: inputBg, color: fg }}>Government</option>
                <option value="New Gen" style={{ background: inputBg, color: fg }}>New Gen</option>
              </select>
            </div>
            <div>
              <span style={labelStyle}>Established Year</span>
              <input
                style={inputStyle}
                className="placeholder:text-muted/60 focus:border-primary/60 outline-none"
                type="number"
                placeholder="e.g. 1962"
                value={established}
                onChange={e => setEstablished(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <span style={labelStyle}>Your Email Address</span>
            <input
              style={inputStyle}
              className="placeholder:text-muted/60 focus:border-primary/60 outline-none"
              type="email"
              placeholder="your.email@example.com"
              value={requesterEmail}
              onChange={e => setRequesterEmail(e.target.value)}
              disabled={loading}
            />
            <p style={{ fontSize: 11, color: muted, marginTop: 5 }}>
              Optional — lets you track request status on your dashboard.
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: border, marginBottom: 20 }} />

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <Button
              type="button"
              variant="secondary"
              className="flex-1 rounded-xl"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl font-black"
              loading={loading}
            >
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestCollegeModal;
