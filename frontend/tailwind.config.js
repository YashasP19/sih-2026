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
          mist: '#F8F5EE',
          paper: '#FFFCF6',
          line: '#E3DCC9',
          ink: '#1C1C1C',
          mute: '#6B6459',
          teal: '#C1694F',
          'teal-dark': '#A6543D',
          'teal-soft': '#F0DED4',
          sand: '#EFEBE1',
          night: '#17140F',
          'night-paper': '#201C17',
          'night-line': '#3A322A',
          'night-mute': '#B8AC98',
        },
        gov: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0c84eb',
          600: '#0267c8',
          700: '#0252a2',
        },
        // Overrides Tailwind's default teal scale so every hardcoded
        // dark:*-teal-XXX utility across the app follows the terracotta accent.
        teal: {
          50: '#FBF1EC',
          100: '#F3DED4',
          200: '#E9C3B2',
          300: '#DDA48D',
          400: '#D0876C',
          500: '#C1694F',
          600: '#A6543D',
          700: '#8A4231',
          800: '#6E3427',
          900: '#52271D',
          950: '#2E140F',
        },
        // Overrides Tailwind's default emerald/green scales with a premium
        // brown so every "success" badge, icon, and button stops reading as green.
        emerald: {
          50: '#F5EDE6',
          100: '#E9D9C9',
          200: '#D3B394',
          300: '#BB8F68',
          400: '#A17148',
          500: '#8B5A34',
          600: '#6F4527',
          700: '#59371F',
          800: '#452B18',
          900: '#332012',
          950: '#1F1309',
        },
        green: {
          50: '#F5EDE6',
          100: '#E9D9C9',
          200: '#D3B394',
          300: '#BB8F68',
          400: '#A17148',
          500: '#8B5A34',
          600: '#6F4527',
          700: '#59371F',
          800: '#452B18',
          900: '#332012',
          950: '#1F1309',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -18px rgba(28, 28, 28, 0.18)',
        lift: '0 18px 50px -24px rgba(193, 105, 79, 0.35)',
        'soft-dark': '0 10px 40px -18px rgba(0, 0, 0, 0.45)',
        'lift-dark': '0 18px 50px -24px rgba(193, 105, 79, 0.25)',
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
