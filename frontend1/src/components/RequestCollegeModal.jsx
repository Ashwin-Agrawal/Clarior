import { useState } from "react";
import api from "../services/api";
import Button from "./ui/Button";

function RequestCollegeModal({ isOpen, onClose }) {
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
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Modal box */}
      <div className="relative z-10 w-full max-w-[520px] bg-surface border border-border rounded-[28px] p-8 shadow-hero max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-transparent border-none flex items-center justify-center cursor-pointer text-muted hover:text-fg transition-colors"
          aria-label="Close modal"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-widest uppercase mb-3">
          Add Platform Request
        </div>

        <h2 className="text-2xl font-black text-fg mb-1.5 leading-tight">
          Request to Add{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            College.
          </span>
        </h2>
        <p className="text-xs text-muted leading-relaxed mb-5">
          Can't find your college? Submit a request here. Once approved by the administrator, seniors can sign up under this college and students can browse it.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error */}
          {error && (
            <div className="px-3.5 py-2.5 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-xs font-bold">{error}</div>
          )}

          {/* Success */}
          {submitted && (
            <div className="px-3.5 py-2.5 rounded-2xl bg-success/10 border border-success/20 text-success text-xs font-bold">
              🎉 Request submitted! Our team will verify and add the college to the platform.
            </div>
          )}

          {/* College Name */}
          <div>
            <label htmlFor="col-name" className="block text-xs font-semibold text-fg mb-1.5">College Name <span className="text-danger">*</span></label>
            <input
              id="col-name"
              className="w-full h-11 px-3.5 rounded-xl border border-border bg-surface2/60 text-fg text-sm font-semibold focus:outline-none focus:border-primary/50 transition placeholder:text-muted/50"
              placeholder="e.g. MS Ramaiah Institute of Technology (MSRIT)"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* City + State */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="col-city" className="block text-xs font-semibold text-fg mb-1.5">City <span className="text-danger">*</span></label>
              <input
                id="col-city"
                className="w-full h-11 px-3.5 rounded-xl border border-border bg-surface2/60 text-fg text-sm font-semibold focus:outline-none focus:border-primary/50 transition placeholder:text-muted/50"
                placeholder="e.g. Bengaluru"
                value={city}
                onChange={e => setCity(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div>
              <label htmlFor="col-state" className="block text-xs font-semibold text-fg mb-1.5">State <span className="text-danger">*</span></label>
              <input
                id="col-state"
                className="w-full h-11 px-3.5 rounded-xl border border-border bg-surface2/60 text-fg text-sm font-semibold focus:outline-none focus:border-primary/50 transition placeholder:text-muted/50"
                placeholder="e.g. Karnataka"
                value={state}
                onChange={e => setState(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Type + Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="col-type" className="block text-xs font-semibold text-fg mb-1.5">College Type</label>
              <select
                id="col-type"
                className="w-full h-11 px-3.5 rounded-xl border border-border bg-surface2/60 text-fg text-sm font-semibold focus:outline-none focus:border-primary/50 transition cursor-pointer"
                value={type}
                onChange={e => setType(e.target.value)}
                disabled={loading}
              >
                <option value="Private">Private</option>
                <option value="Government">Government</option>
                <option value="New Gen">New Gen</option>
              </select>
            </div>
            <div>
              <label htmlFor="col-established" className="block text-xs font-semibold text-fg mb-1.5">Established Year</label>
              <input
                id="col-established"
                className="w-full h-11 px-3.5 rounded-xl border border-border bg-surface2/60 text-fg text-sm font-semibold focus:outline-none focus:border-primary/50 transition placeholder:text-muted/50"
                type="number"
                placeholder="e.g. 1962"
                value={established}
                onChange={e => setEstablished(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="col-email" className="block text-xs font-semibold text-fg mb-1.5">Your Email Address</label>
            <input
              id="col-email"
              className="w-full h-11 px-3.5 rounded-xl border border-border bg-surface2/60 text-fg text-sm font-semibold focus:outline-none focus:border-primary/50 transition placeholder:text-muted/50"
              type="email"
              placeholder="your.email@example.com"
              value={requesterEmail}
              onChange={e => setRequesterEmail(e.target.value)}
              disabled={loading}
            />
            <p className="text-[10px] text-muted mt-1 leading-normal">
              Optional — lets you track request status on your dashboard.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-border my-5" />

          {/* Buttons */}
          <div className="flex gap-3">
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
              className="flex-1 rounded-xl font-black uppercase text-xs tracking-wider"
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
