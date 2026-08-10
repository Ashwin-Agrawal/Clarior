function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Spinner({ size = 16 }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      className="animate-spin opacity-90"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
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
    "group relative isolate inline-flex min-h-10 items-center justify-center gap-2 whitespace-normal sm:whitespace-nowrap text-center rounded-full font-semibold leading-tight tracking-[0.01em] transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 overflow-hidden cursor-pointer";

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-3.5 text-base md:text-lg",
  };

  const variants = {
    primary:
      "border border-primary/20 bg-primary text-primary-fg shadow-card hover:-translate-y-0.5 hover:shadow-lift hover:brightness-105 active:translate-y-0 active:scale-[0.98]",
    secondary:
      "border border-slate-300/80 bg-gradient-to-b from-white via-slate-50 to-blue-50/50 text-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.08)] hover:border-primary/50 hover:text-primary hover:shadow-[0_12px_28px_-6px_rgba(37,99,235,0.22)] hover:-translate-y-0.5 dark:border-slate-700/80 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 dark:text-slate-100 dark:hover:border-primary/50 dark:hover:text-primary active:translate-y-0 active:scale-[0.98]",
    ghost:
      "border border-transparent bg-transparent text-muted hover:bg-surface2 hover:text-fg active:scale-[0.98]",
    danger:
      "border border-danger/20 bg-danger text-white shadow-card hover:-translate-y-0.5 hover:shadow-lift hover:brightness-105 active:translate-y-0 active:scale-[0.98]",
    success:
      "border border-success/20 bg-success text-white shadow-card hover:-translate-y-0.5 hover:shadow-lift hover:brightness-105 active:translate-y-0 active:scale-[0.98]",
    outline:
      "border border-primary/40 bg-primary/5 text-primary shadow-xs hover:bg-primary/10 hover:border-primary active:translate-y-0 active:scale-[0.98]",
    dark:
      "border border-border bg-surface text-fg shadow-card hover:bg-surface2 active:scale-[0.98]",
  };

  return (
    <button
      className={cx(base, sizes[size], variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
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
