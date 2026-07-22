function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Card({ className = "", hover = false, ...props }) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-border/80 bg-surface shadow-card",
        hover && "transition-smooth hover:-translate-y-1 hover:shadow-lift hover:border-primary/25 cursor-pointer",
        className
      )}
      {...props}
    />
  );
}

export default Card;
