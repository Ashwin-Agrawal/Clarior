function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Card({ className = "", hover = false, ...props }) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-border/70 bg-surface/85 dark:bg-surface/75 shadow-soft backdrop-blur-xl",
        hover && "transition-smooth hover:-translate-y-1 hover:shadow-lift hover:border-primary/25 cursor-pointer",
        className
      )}
      {...props}
    />
  );
}

export default Card;
