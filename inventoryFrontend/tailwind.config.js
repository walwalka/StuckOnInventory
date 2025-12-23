/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        usd: {
          green: '#146A39',
          green2: '#1F8A52',
          silver: '#C0C0C0',
          silverDark: '#9EA3A8',
          copper: '#B87333',
          copperDark: '#8B5A2B',
        },
      },
    },
  },
  plugins: [],
}

