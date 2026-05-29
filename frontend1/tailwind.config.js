/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        brand:   ['Playfair Display', 'serif'],
      },
      colors: {
        bg:        "rgb(var(--bg) / <alpha-value>)",
        surface:   "rgb(var(--surface) / <alpha-value>)",
        surface2:  "rgb(var(--surface-2) / <alpha-value>)",
        border:    "rgb(var(--border) / <alpha-value>)",
        fg:        "rgb(var(--fg) / <alpha-value>)",
        muted:     "rgb(var(--muted) / <alpha-value>)",
        primary:   "rgb(var(--primary) / <alpha-value>)",
        primaryFg: "rgb(var(--primary-fg) / <alpha-value>)",
        accent:    "rgb(var(--accent) / <alpha-value>)",
        accentFg:  "rgb(var(--accent-fg) / <alpha-value>)",
        success:   "rgb(var(--success) / <alpha-value>)",
        warning:   "rgb(var(--warning) / <alpha-value>)",
        danger:    "rgb(var(--danger) / <alpha-value>)",
      },
      borderRadius: {
        xl:   "0.9rem",
        "2xl":"1.25rem",
        "3xl":"1.75rem",
        "4xl":"2rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)",
        lift: "0 2px 8px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.08)",
        glow: "0 0 0 3px rgba(37,99,235,0.25)",
        hero: "0 20px 70px rgba(59,91,219,0.12)",
        card: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)",
      },
      keyframes: {
        "fade-up":    { "0%": { opacity: "0", transform: "translateY(24px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "fade-in":    { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "scale-in":   { "0%": { opacity: "0", transform: "scale(0.94)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        "slide-down": { "0%": { opacity: "0", transform: "translateY(-12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up":    "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in":    "fade-in 0.5s ease both",
        "scale-in":   "scale-in 0.4s cubic-bezier(0.22,1,0.36,1) both",
        "slide-down": "slide-down 0.35s cubic-bezier(0.22,1,0.36,1) both",
        shimmer:      "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
