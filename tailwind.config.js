/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F1F3F2',
        surface: '#FFFFFF',
        sunk: '#F6F7F6',
        ink: { DEFAULT: '#1D2B28', 2: '#4C5B56', 3: '#6B7873' },
        line: { DEFAULT: '#DFE4E1', strong: '#C3CBC7' },
        turmeric: { DEFAULT: '#F5C542', soft: '#FCF1CF' },
        ok: '#3B7A4B',
        low: '#A86A0C',
        high: '#BE3328',
        protein: '#1F78A8',
        carbs: '#D99A1E',
        fat: '#9A4F86',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
