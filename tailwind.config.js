/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          950: '#080613',
          900: '#0D0A1A',
          800: '#14102A',
          700: '#1C1740',
          600: '#251E56',
        },
        gold: {
          300: '#F0DFB5',
          400: '#E8D5A3',
          500: '#C9A96E',
          600: '#B8934A',
          700: '#9A7A35',
        },
        indigo: {
          300: '#B8B0E8',
          400: '#9B90D8',
          500: '#7B6EC8',
          600: '#5E52A8',
        },
        saffron: {
          400: '#F5A623',
          500: '#E8941A',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'cosmic-gradient': 'radial-gradient(ellipse at top, #1C1740 0%, #0D0A1A 60%, #080613 100%)',
        'gold-gradient': 'linear-gradient(135deg, #C9A96E 0%, #E8D5A3 50%, #C9A96E 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      },
      boxShadow: {
        'gold': '0 0 30px rgba(201, 169, 110, 0.15)',
        'gold-lg': '0 0 60px rgba(201, 169, 110, 0.2)',
        'indigo': '0 0 30px rgba(123, 110, 200, 0.2)',
        'card': '0 8px 32px rgba(0,0,0,0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-gold': 'pulseGold 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
