/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FDF7ED',
          100: '#FAECC0',
          500: '#C6A15B', // 赭金
          600: '#B8935A',
          700: '#A6834F',
        },
        dark: {
          900: '#1B1B1D', // 石墨黑
          800: '#2A2A2D',
          700: '#4A4A4F', // 秦磚灰
        },
        accent: {
          500: '#C75C44', // 琥珀紅
          600: '#B8523C',
        },
        education: {
          teal: '#2E8C8C',
          blue: '#1E3A8A',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif TC"', 'serif'],
      },
      animation: {
        type: 'typing 2s steps(40, end), blink-caret 0.5s step-end infinite alternate',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
      },
      keyframes: {
        typing: {
          from: { width: '0' },
          to: { width: '100%' },
        },
        'blink-caret': {
          'from, to': { 'border-color': 'transparent' },
          '50%': { 'border-color': '#C6A15B' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(30px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
