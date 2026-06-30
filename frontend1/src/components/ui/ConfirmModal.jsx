import { useEffect, useState } from "react";
import Button from "./Button";
import Card from "./Card";

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

export default function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "primary", // primary, danger, success
  loading = false,
}) {
  const isDark = useIsDark();

  if (!isOpen) return null;

  const bg = isDark ? "#0f1d33" : "#ffffff";
  const border = isDark ? "#233b5c" : "#d0e0f7";
  const fg = isDark ? "#dfeafc" : "#10213b";
  const muted = isDark ? "#95b0dc" : "#567198";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: isDark ? "rgba(0,0,0,0.7)" : "rgba(15,33,59,0.4)",
        backdropFilter: "blur(12px)",
        animation: "fadeIn 0.25s ease both",
      }}
    >
      {/* Backdrop click */}
      <div style={{ position: "absolute", inset: 0 }} onClick={loading ? undefined : onCancel} />

      {/* Modal Card */}
      <Card
        className="relative z-10 w-full max-w-md p-7 shadow-2xl animate-scale-in"
        style={{
          background: bg,
          border: `1.5px solid ${border}`,
          borderRadius: 24,
        }}
      >
        <h3 className="text-xl font-black text-fg mb-3" style={{ color: fg }}>
          {title}
        </h3>
        <p className="text-sm font-semibold text-muted leading-relaxed mb-6" style={{ color: muted }}>
          {message}
        </p>

        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end mt-6">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto rounded-xl px-5"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant}
            className="w-full sm:w-auto rounded-xl px-6 font-bold"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
}
