/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0B0F1A',
        sidebarBg: '#0d111c',
        cardBg: '#161b29',
      }
    },
  },
  plugins: [],
}
