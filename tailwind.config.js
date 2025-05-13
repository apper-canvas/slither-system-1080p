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
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5'
        },
        secondary: {
          DEFAULT: '#14b8a6',
          light: '#2dd4bf',
          dark: '#0d9488'
        },
        accent: '#f59e0b',
        surface: {
          50: '#f8fafc',   // Lightest
          100: '#f1f5f9', 
          150: '#e8f4fc',  // Added for board light squares
          160: '#d9eaf5',  // Added for board light squares hover
          170: '#cadfef',  // Added for board dark squares
          180: '#b8cfe0',  // Added for board dark squares hover
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',  // Added
          500: '#64748b',  // Added
          600: '#475569',  // Added
          700: '#334155',  // Added
          800: '#1e293b',  // Added
          900: '#0f172a'   // Darkest
        },
        woodgrain: {
          light: '#d9a066',
          medium: '#c68642',
          dark: '#9e6b33'
        },
        snakeskin: '#4ade80',
        ladder: '#eab308'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'neu-light': '5px 5px 15px #d1d9e6, -5px -5px 15px #ffffff',
        'neu-dark': '5px 5px 15px rgba(0, 0, 0, 0.3), -5px -5px 15px rgba(255, 255, 255, 0.05)',
        'board': '0 8px 20px -2px rgba(0, 0, 0, 0.3), inset 0 -3px 0 rgba(0, 0, 0, 0.2)',
        'board-inner': 'inset 0 2px 5px rgba(0, 0, 0, 0.2)',
        'dice': '0 4px 10px rgba(0, 0, 0, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.1)'
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        'board': '1.25rem'
      },
      backgroundImage: {
        'wood-pattern': 'repeating-linear-gradient(45deg, #c68642, #d9a066 10px, #cb8c4b 10px, #b37a3b 20px)',
        'wood-grain': 'linear-gradient(90deg, #d9a066 0%, #c68642 25%, #9e6b33 50%, #c68642 75%, #d9a066 100%)',
        'wood-dark': 'linear-gradient(90deg, #9e6b33 0%, #8d5f2c 50%, #9e6b33 100%)'
      }
    }  
  },
  plugins: [],
  darkMode: 'class',
}