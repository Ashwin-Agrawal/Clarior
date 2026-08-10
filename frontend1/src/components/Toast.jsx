import { useEffect } from "react";
import { useToast } from "../context/ToastContext";

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }) {
  const { type, message } = toast;

  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [onClose, toast.duration]);

  const getStyles = () => {
    switch (type) {
      case "success": return "border-success/30 bg-surface text-fg ring-success/10 shadow-[0_12px_32px_rgba(16,185,129,0.12)]";
      case "error":   return "border-danger/30 bg-surface text-fg ring-danger/10 shadow-[0_12px_32px_rgba(239,68,68,0.12)]";
      case "warning": return "border-warning/30 bg-surface text-fg ring-warning/10 shadow-[0_12px_32px_rgba(245,158,11,0.12)]";
      default:        return "border-primary/30 bg-surface text-fg ring-primary/10 shadow-[0_12px_32px_rgba(37,99,235,0.12)]";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success": return <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center text-success text-sm">✓</div>;
      case "error":   return <div className="h-8 w-8 rounded-full bg-danger/10 flex items-center justify-center text-danger text-sm">✕</div>;
      case "warning": return <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center text-warning text-sm">!</div>;
      default:        return <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">i</div>;
    }
  };

  return (
    <div className={`max-w-md w-full pointer-events-auto border rounded-2xl p-4 flex items-center gap-4 animate-scale-in ring-1 ${getStyles()}`}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 text-sm font-bold tracking-tight">
        {message}
      </div>
      <button onClick={onClose} className="flex-shrink-0 h-8 w-8 rounded-xl hover:bg-surface2 flex items-center justify-center opacity-40 hover:opacity-100 transition-all">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
  );
}

export { ToastContainer, Toast };
