/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'Nirmala UI', 'system-ui', 'sans-serif']
      },
      colors: {
        tm: {
          primary: '#0369a1',
          'primary-hover': '#0284c7',
          'primary-dark': '#075985',
          'primary-soft': '#e0f2fe',
          accent: '#0d9488',
          'accent-dark': '#115e59',
          surface: '#ffffff',
          bg: '#f8fafc',
          border: '#e2e8f0',
          'border-strong': '#cbd5e1',
          text: '#1e293b',
          'text-secondary': '#334155',
          muted: '#64748b',
          success: '#059669',
          'success-soft': '#ecfdf5',
          warning: '#d97706',
          'warning-soft': '#fffbeb',
          danger: '#dc2626',
          'danger-hover': '#b91c1c',
          'danger-soft': '#fef2f2',
          train: '#0369a1',
          bus: '#7c3aed',
          flight: '#0891b2',
          combo: '#0d9488',
          nav: '#0f172a'
        }
      },
      boxShadow: {
        glow: '0 0 35px rgba(34, 211, 238, 0.18)',
        danger: '0 0 35px rgba(239, 68, 68, 0.22)',
        'tm-sm': '0 1px 3px rgba(15, 23, 42, 0.05)',
        tm: '0 4px 16px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'tm-lg': '0 12px 32px -4px rgba(15, 23, 42, 0.1), 0 4px 12px -2px rgba(15, 23, 42, 0.05)',
        'tm-modal': '0 20px 60px -8px rgba(15, 23, 42, 0.18), 0 8px 24px -4px rgba(15, 23, 42, 0.08)'
      },
      borderRadius: {
        'tm': '8px',
        'tm-lg': '12px',
        'tm-xl': '16px',
        'tm-2xl': '20px'
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      }
    }
  },
  plugins: []
}
