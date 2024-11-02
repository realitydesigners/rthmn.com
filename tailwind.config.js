/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: 'var(--font-mono)',
        sans: 'var(--font-sans)',
        serif: 'var(--font-serif)',
        kodemono: 'var(--font-kodemono)',
        outfit: 'var(--font-outfit)'
      },
      colors: {
        black: '#000'
      }
    }
  },
  plugins: []
};
