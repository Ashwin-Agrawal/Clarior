function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Input({ label, hint, error, className = "", iconLeft, iconRight, ...props }) {
  return (
    <label className="block">
      {label && (
        <div className="text-sm font-semibold text-fg mb-1.5">{label}</div>
      )}
      <div className="relative">
        {iconLeft && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center">
            {iconLeft}
          </span>
        )}
        <input
          className={cx(
            "w-full rounded-xl border bg-surface px-4 py-3 text-sm text-fg outline-none transition-all duration-200",
            "placeholder:text-muted/60",
            "border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
            "hover:border-primary/30",
            error && "border-danger/60 focus:ring-danger/15 focus:border-danger/50",
            iconLeft && "pl-10",
            iconRight && "pr-10",
            className
          )}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center">
            {iconRight}
          </span>
        )}
      </div>
      {error ? (
        <div className="mt-1.5 text-xs text-danger flex items-center gap-1">
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      ) : hint ? (
        <div className="mt-1.5 text-xs text-muted">{hint}</div>
      ) : null}
    </label>
  );
}

export default Input;
