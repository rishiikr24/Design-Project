/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nirnay: {
          navy: '#102B46',
          'navy-dark': '#0B1E32',
          teal: '#247C78',
          'teal-hover': '#1F6B67',
          bg: '#F4F7FA',
          white: '#FFFFFF',
          amber: '#E7B65C',
          border: '#DCE5EA',
          primary: '#263746',
          secondary: '#718096'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    }
  },
  plugins: []
};
