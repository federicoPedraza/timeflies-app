/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bland-dark': '#18181B',
        'calendar-border': '#E0E0E0',
        'calendar-today': '#EFF6FF',
        'calendar-weekend': '#FAFAFA',
        'calendar-divider': '#F7F7F7',
        'calendar-text': '#71717A',
      },
      spacing: {
        'header-height': '4rem',
        'cell-height': '4.5rem',
      },
      fontSize: {
        'day-label': '0.625rem',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
