function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Skeleton({ className = "" }) {
  return (
    <div
      className={cx(
        "animate-pulse rounded-xl bg-surface2 border border-border/50",
        className
      )}
    />
  );
}

export default Skeleton;

