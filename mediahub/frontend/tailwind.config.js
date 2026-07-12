/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0F19',
          card: 'rgba(17, 24, 39, 0.7)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        accent: {
          cyan: '#00F0FF',
          purple: '#9D00FF',
          pink: '#FF007A',
        }
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%': { boxShadow: '0 0 15px rgba(0, 240, 255, 0.2), 0 0 30px rgba(157, 0, 255, 0.1)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 240, 255, 0.4), 0 0 50px rgba(157, 0, 255, 0.3)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
