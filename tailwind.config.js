/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14171F',
        paper: '#FBFAF8',
        line: '#E7E3DC',
        moss: {
          50: '#F2F6F1',
          100: '#DFEBDC',
          400: '#5C8C5A',
          500: '#3F6B3D',
          600: '#2E5230',
          700: '#213C24',
        },
        clay: '#C1602E',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 8px 30px -12px rgba(20, 23, 31, 0.15)',
      },
    },
  },
  plugins: [],
}
