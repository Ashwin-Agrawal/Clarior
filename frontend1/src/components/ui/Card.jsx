function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Card({ className = "", ...props }) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-border bg-surface shadow-soft",
        className
      )}
      {...props}
    />
  );
}

export default Card;

