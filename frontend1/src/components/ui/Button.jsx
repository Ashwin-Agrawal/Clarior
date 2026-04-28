function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition select-none disabled:opacity-60 disabled:pointer-events-none";

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base",
  };

  const variants = {
    primary:
      "bg-primary text-primaryFg shadow-soft hover:-translate-y-0.5 hover:opacity-95",
    secondary:
      "bg-surface border border-border text-fg hover:-translate-y-0.5 hover:bg-surface2",
    ghost:
      "text-fg hover:bg-surface2",
    danger:
      "bg-danger text-white hover:-translate-y-0.5 hover:opacity-95",
  };

  return (
    <button
      className={cx(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}

export default Button;
