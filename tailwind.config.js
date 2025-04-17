/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'text-green-500',
    'text-red-500',
    'text-purple-500',
    'text-pink-500',
    'text-blue-500',
    'bg-green-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-blue-500',
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