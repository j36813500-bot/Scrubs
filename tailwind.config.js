/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blush: { 50: '#fff5f7', 100: '#ffe4ec', 200: '#ffc9d9', 300: '#ffa3bf', 400: '#ff7da0', 500: '#f85f88', 600: '#e04a72', 700: '#bd385c', 800: '#9c2e4c', 900: '#7a243d' },
        lavender: { 50: '#f8f5ff', 100: '#ede8ff', 200: '#ddd1ff', 300: '#c7b2ff', 400: '#a98aff', 500: '#8b5fff', 600: '#7340f5', 700: '#6030d4', 800: '#4d25ab', 900: '#3a1a82' },
        beige: { 50: '#fdfbf9', 100: '#f8f3ee', 200: '#f0e8de', 300: '#e4d7c8', 400: '#d0bda6', 500: '#b8a085', 600: '#9c826a', 700: '#7a6553', 800: '#5e4f42', 900: '#3e342b' },
        gold: { 50: '#fffdf0', 100: '#fff8d6', 200: '#ffefaa', 300: '#ffe072', 400: '#ffcc3a', 500: '#f5b400', 600: '#d49500', 700: '#a87300', 800: '#7c5500', 900: '#523800' },
      },
      fontFamily: {
        display: ['"Tajawal"', 'system-ui', 'sans-serif'],
        sans: ['"Tajawal"', 'system-ui', 'sans-serif'],
        arabic: ['"Tajawal"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'float-medium': 'floatMedium 4s ease-in-out infinite',
        'breathe': 'breathe 5s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeInUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        floatMedium: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        breathe: { '0%,100%': { transform: 'scale(1)', opacity: '0.6' }, '50%': { transform: 'scale(1.1)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
