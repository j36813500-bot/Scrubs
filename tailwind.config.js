/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blush: {
          50: '#fef5f7', 100: '#fde8ee', 200: '#fbd5e0', 300: '#f7b3c8',
          400: '#f083a8', 500: '#e85c8a', 600: '#d63d6e', 700: '#b32d58',
          800: '#902548', 900: '#73203e',
        },
        lavender: {
          50: '#f8f6fc', 100: '#efeaf8', 200: '#dfd4f0', 300: '#c9b4e3',
          400: '#ad8dcf', 500: '#916dba', 600: '#7a55a3', 700: '#654486',
          800: '#523a6e', 900: '#43325a',
        },
        beige: {
          50: '#fdfcf9', 100: '#faf6ef', 200: '#f4ebdc', 300: '#ebd9c0',
          400: '#dcc19a', 500: '#cba878', 600: '#b88e5e', 700: '#99734d',
          800: '#7c5e40', 900: '#654d35',
        },
        gold: {
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
          800: '#92400e', 900: '#78350f',
        },
      },
      fontFamily: {
        sans: ['Tajawal', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'float-medium': 'floatMedium 6s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float-words': 'floatWords 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        floatMedium: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(232,92,138,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(232,92,138,0.6)' },
        },
        floatWords: {
          '0%': { opacity: '0', transform: 'translateY(0) rotate(0deg)' },
          '20%': { opacity: '1' },
          '80%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(-30px) rotate(10deg)' },
        },
      },
    },
  },
  plugins: [],
}
