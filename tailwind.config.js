// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-red': '#c41230',
        'secondary-red': '#ab102b',
        'neutral-offwhite': '#f9f9f9',
        'neutral-gray': '#f5f5f5',
        'text-gray': '#333333',
        'primary-blue': '#385076',
        'secondary-blue': '#70bee4',
        'accent-orange': '#a15b38',
        'earth-tone': '#9c8b67',
        'beige-tone': '#beb2a3',
        'light-beige': '#c7bfb0',
        'secondary-gold': '#f2b632',
        'dark-gray': '#333333',
        'light-gray': '#f5f5f5',
        'medium-gray': '#cccccc',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.aspect-none': {
          position: 'static',
          paddingBottom: '0',
        },
        '.aspect-w-1': {
          position: 'relative',
          paddingBottom: 'calc(1 / 1 * 100%)',
        },
        '.aspect-w-4': {
          position: 'relative',
          paddingBottom: 'calc(4 / 1 * 100%)',
        },
        '.aspect-h-3': {
          '--tw-aspect-h': '3',
        },
        '.aspect-w-4.aspect-h-3': {
          paddingBottom: 'calc(3 / 4 * 100%)',
        },
        '.aspect-w-1.aspect-h-1': {
          paddingBottom: 'calc(1 / 1 * 100%)',
        }
      }
      addUtilities(newUtilities)
    }
  ],
}
