/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        accent:  "#eab308",
        surface: "#f8fafc",
      },
      fontFamily: {
        inter: ['"Inter"', 'sans-serif'],   // ← add this
      },
    },
  },
  plugins: [],
};
