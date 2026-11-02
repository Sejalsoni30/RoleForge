/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        surface: {
          canvas: '#f8fafc',
          subtle: '#f1f5f9',
          card: '#ffffff',
          border: '#e2e8f0',
        },
        accent: {
          lavender: '#ede9fe',
          lavenderLight: '#f5f3ff',
          sky: '#0284c7',
          emerald: '#059669',
          amber: '#d97706',
          rose: '#e11d48',
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(15, 23, 42, 0.04), 0 10px 25px -4px rgba(15, 23, 42, 0.06)',
        'card': '0 4px 20px -2px rgba(99, 102, 241, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'elevated': '0 12px 36px -4px rgba(15, 23, 42, 0.1), 0 4px 12px -2px rgba(15, 23, 42, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

