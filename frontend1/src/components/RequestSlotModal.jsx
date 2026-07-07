import { useState } from "react";
import Button from "./ui/Button";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

function RequestSlotModal({ isOpen, onClose, seniorId, seniorName }) {
  const { showSuccess, showError } = useToast();
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("evening");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!preferredDate) {
      return showError("Please select a preferred date");
    }

    try {
      setLoading(true);
      await api.post("/slot-requests", {
        seniorId,
        preferredDate,
        preferredTime,
        notes,
      });

      showSuccess(`Slot request submitted to ${seniorName}! You will be notified once they respond.`);
      onClose();
      // Reset fields
      setPreferredDate("");
      setPreferredTime("evening");
      setNotes("");
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to submit slot request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md transform rounded-[32px] border border-border/70 bg-surface p-6 shadow-hero animate-scale-in text-fg z-10">
        <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-5">
          <h3 className="text-lg font-black text-fg tracking-tight uppercase">Request Custom Slot</h3>
          <button 
            type="button"
            onClick={onClose} 
            className="text-muted hover:text-fg p-1.5 rounded-full hover:bg-surface2 transition cursor-pointer"
            aria-label="Close modal"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-xs text-muted font-bold leading-relaxed">
            Need to talk to <span className="text-primary font-black">{seniorName}</span> but no matching slots are available? Select your preferred date and time period below.
          </p>

          <div>
            <label htmlFor="pref-date" className="block text-[10px] font-black uppercase text-muted tracking-wider mb-2">Preferred Date</label>
            <input
              id="pref-date"
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-border bg-surface2/60 text-fg text-sm font-semibold focus:outline-none focus:border-primary/50 transition"
            />
          </div>

          <div>
            <label htmlFor="pref-time" className="block text-[10px] font-black uppercase text-muted tracking-wider mb-2">Preferred Time Period</label>
            <select
              id="pref-time"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-border bg-surface2/60 text-fg text-sm font-semibold focus:outline-none focus:border-primary/50 transition cursor-pointer"
            >
              <option value="morning">Morning (10:00 AM)</option>
              <option value="afternoon">Afternoon (3:00 PM)</option>
              <option value="evening">Evening (6:00 PM)</option>
            </select>
          </div>

          <div>
            <label htmlFor="pref-notes" className="block text-[10px] font-black uppercase text-muted tracking-wider mb-2">Quick Message / Topic (Optional)</label>
            <textarea
              id="pref-notes"
              rows="3"
              maxLength="300"
              placeholder="e.g. I want to discuss CSE AI branch placements and curriculum..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-border bg-surface2/60 text-fg text-sm font-semibold focus:outline-none focus:border-primary/50 transition resize-none leading-relaxed"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose} 
              className="w-1/2 rounded-xl"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className="w-1/2 rounded-xl uppercase tracking-wider font-black text-xs"
              loading={loading}
              disabled={loading}
            >
              Send Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestSlotModal;
