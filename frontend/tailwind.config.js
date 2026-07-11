/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#fdfbf7',
          dark: '#1a1a1a',
          accent: '#c5a880', // elegant gold/bronze
          muted: '#767676'
        }
      }
    },
  },
  plugins: [],
}
