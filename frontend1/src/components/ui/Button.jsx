function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Spinner({ size = 16 }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      className="animate-spin"
      style={{ animation: "spin 0.75s linear infinite" }}
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
    "inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-55 disabled:pointer-events-none relative overflow-hidden";

  const sizes = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-base md:text-lg",
  };

  const variants = {
    primary:
      "bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.6)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]",
    secondary:
      "bg-blue-100/50 border-2 border-blue-200/60 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-[0_10px_20px_-5px_rgba(37,99,235,0.3)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300",
    ghost:
      "bg-slate-100/80 text-slate-600 hover:bg-primary/10 hover:text-primary transition-all dark:bg-slate-800 dark:text-slate-300",
    danger:
      "bg-gradient-to-br from-rose-600 to-red-600 text-white shadow-[0_10px_30px_-10px_rgba(239,68,68,0.4)] hover:shadow-[0_15px_35px_-10px_rgba(239,68,68,0.5)] hover:-translate-y-1 active:translate-y-0",
    success:
      "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_10px_30px_-10px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_35px_-10px_rgba(16,185,129,0.5)] hover:-translate-y-1",
    outline:
      "bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white hover:-translate-y-1 hover:shadow-hero active:translate-y-0",
    dark:
      "bg-slate-950 text-white shadow-2xl hover:bg-slate-900 hover:-translate-y-1 active:translate-y-0",
  };

  return (
    <button
      className={cx(base, sizes[size], variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size={size === "sm" ? 13 : size === "lg" ? 18 : 15} />
      ) : iconLeft ? (
        <span className="flex-shrink-0">{iconLeft}</span>
      ) : null}
      {children}
      {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
}

export default Button;
