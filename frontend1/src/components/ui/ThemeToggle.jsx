import { useTheme } from "../../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-fg hover:bg-surface2 transition"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <span className="text-base leading-none">{isDark ? "🌙" : "☀️"}</span>
      <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}

export default ThemeToggle;

