/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        ubuntu: ['UbuntuMedium', 'Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.tap-highlight-transparent': {
          '-webkit-tap-highlight-color': 'transparent',
        },
      })
    },
    function({ addUtilities }) {
      addUtilities({
        '.text-shadow': {
          'text-shadow': '1px 1px 0 #000',
        },
      })
    }
  ],
} 