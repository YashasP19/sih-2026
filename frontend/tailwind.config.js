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
        civic: {
          mist: '#EAF1F4',
          paper: '#F7FBFC',
          line: '#C9D8E0',
          ink: '#0B2434',
          mute: '#5A7383',
          teal: '#0D7377',
          'teal-dark': '#095456',
          'teal-soft': '#D7EEF0',
          sand: '#F0F5F7',
          night: '#0B1620',
          'night-paper': '#111F2E',
          'night-line': '#1E3344',
          'night-mute': '#8BA3B3',
        },
        gov: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0c84eb',
          600: '#0267c8',
          700: '#0252a2',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -18px rgba(11, 36, 52, 0.18)',
        lift: '0 18px 50px -24px rgba(13, 115, 119, 0.35)',
        'soft-dark': '0 10px 40px -18px rgba(0, 0, 0, 0.45)',
        'lift-dark': '0 18px 50px -24px rgba(13, 115, 119, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'fade-up': 'fadeUp 0.7s ease-out both',
        'fade-in': 'fadeIn 0.5s ease-out both',
        'scale-up': 'scaleUp 0.25s ease-out both',
        'slide-up': 'slideUp 0.35s ease-out both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
