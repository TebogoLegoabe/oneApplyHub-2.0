/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4f4',
          100: '#d6e5e4',
          200: '#adcbc9',
          300: '#7fada9',
          400: '#568e89',
          500: '#3c716d',
          600: '#2f5c58',
          700: '#284c49',
          800: '#213e3c',
          900: '#1a3230',
          950: '#0e1c1b',
        },
        gold: {
          50: '#fbf6ea',
          100: '#f4e7c6',
          200: '#e9cd8d',
          300: '#dcb058',
          400: '#cf9a3a',
          500: '#b17f28',
          600: '#8f6620',
          700: '#6f4f1a',
        },
      },
    },
  },
  plugins: [],
};
