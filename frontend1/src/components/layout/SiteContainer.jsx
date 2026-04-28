function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function SiteContainer({ className = "", children }) {
  return (
    <div
      className={cx(
        "mx-auto w-full max-w-screen-xl px-8 lg:px-16",
        className
      )}
    >
      {children}
    </div>
  );
}

export default SiteContainer;
