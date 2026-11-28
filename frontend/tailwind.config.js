/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
        display: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Azure from the oneApplyHub logo (#0068C8). 600+ carries white text at WCAG AA.
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdaff',
          300: '#8ec3ff',
          400: '#59a2ff',
          500: '#2f80fb',
          600: '#0b66d6',
          700: '#0a52b0',
          800: '#0e448c',
          900: '#113b73',
          950: '#0c2448',
        },
        // Deep navy from the logo wordmark — dark hero sections and the footer.
        ink: {
          50: '#eef0fb',
          100: '#dfe3f6',
          200: '#c3caee',
          300: '#9aa5df',
          400: '#6c78c9',
          500: '#4a55b0',
          600: '#363f93',
          700: '#2b3278',
          800: '#1d2259',
          900: '#111640',
          950: '#070a26',
        },
        // Attention accent for primary calls to action ("Apply", "Find my res").
        coral: {
          50: '#fff4f0',
          100: '#ffe5dc',
          200: '#ffc9b8',
          300: '#ffa489',
          400: '#ff7a57',
          500: '#fb5a33',
          600: '#d63a17',
          700: '#b32f13',
          800: '#922915',
          900: '#782616',
          950: '#421007',
        },
        // Warm sun yellow for ratings and highlights.
        gold: {
          50: '#fffaeb',
          100: '#fff0c6',
          200: '#ffe088',
          300: '#ffcb4a',
          400: '#ffb620',
          500: '#f99807',
          600: '#dd7102',
          700: '#b74e06',
          800: '#943c0c',
          900: '#7a320d',
          950: '#461802',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        'card-hover': '0 12px 32px -12px rgb(15 23 42 / 0.18), 0 4px 10px -4px rgb(15 23 42 / 0.08)',
        // Kept as neutral elevation tokens; coloured glows read as AI-generated design.
        glow: '0 1px 2px 0 rgb(15 23 42 / 0.08)',
        'glow-coral': '0 1px 2px 0 rgb(15 23 42 / 0.08)',
        'glow-violet': '0 1px 2px 0 rgb(15 23 42 / 0.08)',
        float: '0 16px 40px -16px rgb(15 23 42 / 0.28)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out both',
        'fade-up': 'fade-up 0.5s ease-out both',
        'fade-down': 'fade-down 0.5s ease-out both',
        'scale-in': 'scale-in 0.2s ease-out both',
        float: 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite',
        'gradient-x': 'gradient-x 8s ease infinite',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      },
    },
  },
  plugins: [],
};
