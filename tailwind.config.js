/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#fdfaf5",
        surface: "#ffffff",
        card: "#ffffff",
        ink: "#1c1917",
        text: "#292524",
        muted: "#78716c",
        subtle: "#a8a29e",
        border: "#f0eae0",
        cream: {
          50: "#fdfaf5",
          100: "#faf3e0",
          200: "#f5e6c0",
          300: "#edd999",
          400: "#e5c96f",
          500: "#ddb947",
        },
        rose: {
          50: "#fff1f4",
          100: "#ffe4ea",
          200: "#fecdd5",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
        },
        lavender: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
        },
        sage: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
        },
        peach: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
        },
        sky: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
        },
        primary: "#fb7185",
        accent: "#a78bfa",
        danger: "#f43f5e",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        cozy: "0 4px 24px -4px rgba(120, 70, 40, 0.06), 0 2px 8px -2px rgba(120, 70, 40, 0.04)",
        "cozy-lg": "0 12px 40px -12px rgba(120, 70, 40, 0.12), 0 4px 16px -4px rgba(120, 70, 40, 0.06)",
        pop: "0 8px 24px -8px rgba(244, 63, 94, 0.30)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
