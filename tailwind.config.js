/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 35px rgba(34, 211, 238, 0.18)',
        danger: '0 0 35px rgba(239, 68, 68, 0.22)'
      }
    }
  },
  plugins: []
}
