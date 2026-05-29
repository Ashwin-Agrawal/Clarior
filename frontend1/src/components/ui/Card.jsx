function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Card({ className = "", hover = false, ...props }) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-border bg-surface shadow-card",
        hover && "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift hover:border-primary/20 cursor-pointer",
        className
      )}
      {...props}
    />
  );
}

export default Card;
