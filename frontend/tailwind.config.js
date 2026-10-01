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
          navy: '#0a192f',
          violet: '#6366f1',
          teal: '#14b8a6',
          offwhite: '#f8fafc'
        }
      }
    },
  },
  plugins: [],
}
