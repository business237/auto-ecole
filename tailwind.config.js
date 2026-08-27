/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        pacifique: {
          // Deep navy — primary text & premium sections
          navy: {
            950: '#0a1628',
            900: '#0d1f38',
            800: '#122a4a',
            700: '#1b3a63',
            600: '#244a7a',
          },
          // Modern blue — secondary elements
          blue: {
            600: '#1d6fe0',
            500: '#2b80ed',
            400: '#4a9bf5',
            300: '#7cb8f7',
            200: '#b3d8fb',
            100: '#dceffb',
            50: '#eff7fe',
          },
          // Vivid elegant red — CTA & accents
          red: {
            600: '#d92020',
            500: '#e83333',
            400: '#ef5050',
            300: '#f57575',
            100: '#fde3e3',
          },
          offwhite: '#f7f8fa',
        },
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'road-dash': {
          '0%': { 'stroke-dashoffset': '48' },
          '100%': { 'stroke-dashoffset': '0' },
        },
        'drive-across': {
          '0%': { transform: 'translateX(-110%)' },
          '100%': { transform: 'translateX(110%)' },
        },
        'wheel-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'float-soft': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fade-in 0.8s ease forwards',
        'road-dash': 'road-dash 0.8s linear infinite',
        'drive-across': 'drive-across 8s linear infinite',
        'wheel-spin': 'wheel-spin 12s linear infinite',
        'float-soft': 'float-soft 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
