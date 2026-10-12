import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg-page)",
        surface: "var(--color-bg-surface)",
        foreground: "var(--color-text-primary)",
        primary: "var(--color-accent)",
        muted: { DEFAULT: "var(--color-text-muted)", foreground: "var(--color-text-muted)" },
        border: "var(--color-border-hairline)",
        ring: "var(--color-border-accent)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        lg: "var(--radius-card)",
        md: "var(--radius-control)",
        pill: "var(--radius-pill)",
      },
    },
  },
  plugins: [],
};

export default config;
