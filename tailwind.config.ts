import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          magenta: "#E040A0",
          pink: "#F472B6",
          purple: "#A855F7",
          cyan: "#06B6D4",
        },
        surface: {
          base: "#FFFFFF",
          card: "#FFFFFF",
          "card-hover": "#FAFAFA",
          elevated: "#F5F5F7",
          border: "#E5E7EB",
          "border-strong": "#D1D5DB",
        },
        text: {
          primary: "#1A1A2E",
          secondary: "#6B7280",
          muted: "#9CA3AF",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(0,0,0,0.06)",
        card: "0 4px 20px rgba(0,0,0,0.06)",
        "card-hover": "0 8px 30px rgba(0,0,0,0.10)",
        glow: "0 0 20px rgba(224,64,160,0.15)",
        "glow-lg": "0 0 40px rgba(224,64,160,0.20)",
        elevated: "0 12px 40px rgba(0,0,0,0.08)",
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
        "slide-up": "slideUp 0.35s cubic-bezier(0.16,1,0.3,1)",
        "fade-in": "fadeIn 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
