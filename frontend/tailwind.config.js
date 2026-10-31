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

