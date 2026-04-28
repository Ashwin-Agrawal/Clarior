function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Input({ label, hint, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && (
        <div className="text-sm font-medium text-fg">{label}</div>
      )}
      <input
        className={cx(
          "mt-2 w-full rounded-xl border bg-surface px-4 py-3 text-sm text-fg outline-none",
          "border-border focus:ring-2 focus:ring-primary/15 focus:border-primary/40",
          error && "border-danger/60 focus:ring-danger/15 focus:border-danger/50",
          className
        )}
        {...props}
      />
      {error ? (
        <div className="mt-2 text-xs text-danger">{error}</div>
      ) : hint ? (
        <div className="mt-2 text-xs text-muted">{hint}</div>
      ) : null}
    </label>
  );
}

export default Input;

