function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Card({ className = "", hover = false, ...props }) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-border bg-surface shadow-[0_2px_12px_rgba(37,99,235,0.06),0_0_0_1px_rgba(37,99,235,0.04)]",
        hover && "transition-smooth hover:-translate-y-1 hover:shadow-lift hover:border-primary/25 cursor-pointer",
        className
      )}
      {...props}
    />
  );
}

export default Card;
