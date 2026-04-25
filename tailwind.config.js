/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f1115",
        surface: "#171a21",
        card: "#202533",
        text: "#f3f5f7",
        muted: "#9ba3b4",
        primary: "#7c5cff",
        danger: "#ff5a7a",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "0 10px 30px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [],
};

