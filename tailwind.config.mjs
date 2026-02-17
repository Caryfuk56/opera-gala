/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.25rem",
        lg: "2rem",
        xl: "2.5rem",
      },
      screens: {
        xl: "1200px",
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // semantic tokens
        "bg-primary": "#2f2f2d",
        "bg-secondary": "#3a3a36",
        "text-primary": "#e6dfd6",
        "text-secondary": "#b7b1a8",
        "accent": "#d4a35f",
        "accent-deep": "#7a4a2a",
        "accent-wine": "#7b1e2b",
        "accent-wine-deep": "#4a0f1a",

        // optional convenience aliases
        surface: "#3a3a36",
      },
      fontFamily: {
        heading: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Spectral"', "ui-serif", "Georgia", "serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        // subtle, elegant
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        // soft, not “startup glossy”
        sm: "0 1px 2px rgba(0,0,0,0.25)",
        md: "0 6px 18px rgba(0,0,0,0.30)",
        lg: "0 12px 32px rgba(0,0,0,0.35)",
      },
      letterSpacing: {
        // for headings
        tight: "-0.02em",
      },
      lineHeight: {
        // nicer reading in dark mode
        relaxed: "1.75",
      },
    },
  },
  plugins: [],
};
