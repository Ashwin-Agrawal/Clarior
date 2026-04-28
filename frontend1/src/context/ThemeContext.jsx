import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

function applyTheme(nextTheme, { animate = true } = {}) {
  const root = document.documentElement;
  const isDark = nextTheme === "dark";

  if (animate) {
    root.classList.add("theme-animate");
    window.setTimeout(() => root.classList.remove("theme-animate"), 220);
  }

  root.classList.toggle("dark", isDark);
  try {
    localStorage.setItem("theme", nextTheme);
  } catch {
    // ignore
  }
}

function getInitialTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // ignore
  }
  // Default theme should be light (ignore OS preference unless user explicitly chose).
  return "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme, { animate: false });
  }, [theme]);

  const value = useMemo(() => {
    const toggle = () =>
      setTheme((t) => (t === "dark" ? "light" : "dark"));
    const setLight = () => setTheme("light");
    const setDark = () => setTheme("dark");

    return { theme, setTheme, toggle, setLight, setDark };
  }, [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

