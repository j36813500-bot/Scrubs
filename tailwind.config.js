/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['"Tajawal"', '"Cairo"', 'sans-serif'],
        display: ['"Cairo"', '"Tajawal"', 'serif'],
      },
      colors: {
        // Feminine premium palette
        blush: {
          50: '#FFF5F8',
          100: '#FFE4EC',
          200: '#FBC9DC',
          300: '#F7A8C6',
          400: '#F083AE',
          500: '#E85F93',
          600: '#D4457B',
          700: '#B33364',
          800: '#8F2850',
          900: '#6B1D3C',
        },
        lavender: {
          50: '#F7F4FC',
          100: '#EDE5F7',
          200: '#D9C9EF',
          300: '#C0A6E2',
          400: '#A884D6',
          500: '#9065C9',
          600: '#7A4FB5',
          700: '#623D93',
          800: '#4B2E70',
          900: '#351F4E',
        },
        beige: {
          50: '#FBF8F3',
          100: '#F5EFE4',
          200: '#EBE0CC',
          300: '#DFD0B3',
          400: '#CDBA93',
          500: '#B89F73',
          600: '#9C8359',
          700: '#7C6745',
          800: '#5C4D34',
          900: '#3D3322',
        },
        gold: {
          50: '#FBF7EE',
          100: '#F5ECD0',
          200: '#EAD79E',
          300: '#DCC06C',
          400: '#CFA944',
          500: '#B8912E',
          600: '#9A7724',
          700: '#7A5C1E',
          800: '#5B4417',
          900: '#3D2D10',
        },
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(247, 168, 198, 0.25)',
        'glass-lg': '0 20px 60px 0 rgba(192, 166, 226, 0.35)',
        glow: '0 0 40px rgba(240, 131, 174, 0.45)',
        'glow-gold': '0 0 30px rgba(207, 169, 68, 0.5)',
        premium: '0 25px 50px -12px rgba(192, 166, 226, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-medium': 'float 6s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'spin-slower': 'spin 40s linear infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
        'gradient-x': 'gradientX 8s ease infinite',
        'orbit': 'orbit 20s linear infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-20px) translateX(10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      backgroundSize: {
        '200': '200% 200%',
      },
    },
  },
  plugins: [],
};
