/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef6ff",
          100: "#d9ebff",
          200: "#b8d8ff",
          300: "#8fc0ff",
          400: "#5ea1ff",
          500: "#2f7dff",
          600: "#1f62d6",
          700: "#184cab",
          800: "#153f8b",
          900: "#14366f",
        },
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 8px 24px rgba(16,24,40,.06)",
        hover: "0 12px 28px rgba(16,24,40,.10)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
      maxWidth: { container: "1120px" },
    },
  },
  plugins: [],
};
