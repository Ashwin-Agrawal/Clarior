function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Spinner({ size = 16 }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      className="animate-spin opacity-90"
      style={{ animation: "spin 0.75s linear infinite" }}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

function Button({
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  iconLeft,
  iconRight,
  children,
  disabled,
  ...props
}) {
  const base =
    "group relative isolate inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-semibold leading-none tracking-[0.01em] transition-all duration-300 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-55 overflow-hidden shadow-[0_8px_24px_rgba(15,23,42,0.08)]";

  const sizes = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-base md:text-lg",
  };

  const variants = {
    primary:
      "border border-blue-500/20 bg-gradient-to-br from-blue-600 via-blue-600 to-sky-500 text-white shadow-[0_16px_38px_-14px_rgba(37,99,235,0.45)] hover:-translate-y-1.5 hover:shadow-[0_20px_44px_-14px_rgba(37,99,235,0.55)] hover:brightness-110 active:translate-y-0 active:scale-[0.98] before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.28),_transparent_65%)] before:opacity-100 before:transition-opacity before:duration-300",
    secondary:
      "border border-slate-300/90 bg-gradient-to-br from-white via-slate-50 to-blue-50/80 text-slate-800 shadow-[0_14px_32px_-14px_rgba(15,23,42,0.24)] hover:border-blue-400/70 hover:from-blue-50 hover:via-sky-50 hover:to-blue-100 hover:text-blue-700 hover:shadow-[0_18px_40px_-14px_rgba(37,99,235,0.38)] hover:-translate-y-1.5 active:translate-y-0 before:absolute before:inset-[1px] before:rounded-full before:border before:border-white/90 before:opacity-90 dark:border-slate-700/80 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-800/90 dark:text-slate-100 dark:hover:border-sky-400/60 dark:hover:from-slate-800/95 dark:hover:via-slate-800/90 dark:hover:to-sky-950/80 dark:hover:text-sky-300 dark:before:border-white/10",
    ghost:
      "border border-slate-200/80 bg-slate-50/90 text-slate-700 ring-1 ring-slate-200/80 shadow-[0_8px_18px_-12px_rgba(15,23,42,0.18)] hover:border-blue-400/50 hover:bg-blue-50/90 hover:text-blue-700 hover:ring-blue-300/70 hover:shadow-[0_12px_24px_-12px_rgba(37,99,235,0.28)] hover:-translate-y-0.5 active:translate-y-0 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200 dark:ring-slate-700/70 dark:hover:border-sky-400/50 dark:hover:bg-slate-800/85 dark:hover:text-sky-300",
    danger:
      "border border-rose-500/25 bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-[0_16px_36px_-14px_rgba(239,68,68,0.42)] hover:-translate-y-1.5 hover:shadow-[0_20px_44px_-14px_rgba(239,68,68,0.5)] hover:brightness-110 active:translate-y-0 active:scale-[0.98] before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.24),_transparent_66%)] before:opacity-100",
    success:
      "border border-emerald-500/25 bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-[0_16px_36px_-14px_rgba(16,185,129,0.42)] hover:-translate-y-1.5 hover:shadow-[0_20px_44px_-14px_rgba(16,185,129,0.5)] hover:brightness-110 active:translate-y-0 active:scale-[0.98] before:absolute before:inset-0 before:rounded-full before:bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.24),_transparent_66%)] before:opacity-100",
    outline:
      "border border-blue-500/70 bg-gradient-to-br from-blue-50 to-sky-50 text-blue-700 shadow-[0_12px_28px_-14px_rgba(37,99,235,0.26)] hover:bg-gradient-to-br hover:from-blue-100 hover:to-sky-100 hover:border-blue-600 hover:text-blue-800 hover:shadow-[0_16px_34px_-14px_rgba(37,99,235,0.32)] hover:-translate-y-0.5 active:translate-y-0 dark:border-sky-400/60 dark:from-slate-900/70 dark:to-slate-800/70 dark:text-sky-300 dark:hover:from-slate-800/80 dark:hover:to-slate-700/80 dark:hover:text-sky-200",
    dark:
      "border border-slate-800/80 bg-slate-950 text-white shadow-[0_14px_32px_-12px_rgba(2,6,23,0.6)] hover:-translate-y-1.5 hover:bg-slate-900 hover:brightness-110 active:translate-y-0 before:absolute before:inset-[1px] before:rounded-full before:border before:border-white/15",
  };

  return (
    <button
      className={cx(base, sizes[size], variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      <span className="btn-shine pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:animate-[btn-shine_900ms_ease-out]" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <Spinner size={size === "sm" ? 13 : size === "lg" ? 18 : 15} />
        ) : iconLeft ? (
          <span className="shrink-0">{iconLeft}</span>
        ) : null}
        {children}
        {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
      </span>
    </button>
  );
}

export default Button;
