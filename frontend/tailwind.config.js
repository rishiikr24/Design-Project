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
          'teal-hover': '#1D6864',
          bg: '#F4F7FA',
          white: '#FFFFFF',
          amber: '#E7B65C',
          border: '#DCE5EA'
        },
        sap: {
          blue: '#0070F2',
          'blue-hover': '#0056B3',
          'blue-dark': '#002A86',
          cyan: '#0092FF',
          teal: '#0F828F',
          green: '#107E3E',
          amber: '#E9730C',
          red: '#BB0000',
          purple: '#7828C8'
        }
      }
    }
  },
  plugins: []
};

