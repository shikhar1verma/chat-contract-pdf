/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          light:   "#3b82f6"
        },
        accent:  "#eab308",
        surface: "#f8fafc",
      },
      fontFamily: {
        inter: ['"Inter"', 'sans-serif'],   // ← add this
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
