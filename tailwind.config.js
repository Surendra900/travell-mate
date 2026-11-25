/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'system-ui', 'sans-serif']
      },
      colors: {
        tm: {
          primary: '#15803D',
          'primary-hover': '#12733B',
          'primary-dark': '#0e5c2f',
          'primary-soft': '#EDF7F0',
          accent: '#15803D',
          surface: '#FFFFFF',
          bg: '#F4F5F7',
          border: '#E5E7EB',
          'border-strong': '#D1D5DB',
          text: '#1F2937',
          'text-secondary': '#4B5563',
          muted: '#6B7280',
          'status-green-bg': '#EDF7F0',
          'status-green-border': '#C6E8D1',
          'status-green-text': '#137333',
          'status-amber-bg': '#FEF7E6',
          'status-amber-border': '#F6DFB1',
          'status-amber-text': '#A15C07'
        }
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '10px'
      }
    }
  },
  plugins: []
}
