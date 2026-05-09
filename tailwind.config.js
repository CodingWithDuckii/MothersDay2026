/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        romance: {
          pink: "#ff6fae",
          lavender: "#a78bfa",
          warm: "#fff5f8",
          gold: "#ffd6a5",
          ink: "#070611",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "ui-serif", "Georgia", "serif"],
        body: [
          '"Poppins"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          '"Noto Sans"',
          "Arial",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
        ],
      },
    },
  },
  plugins: [],
};
