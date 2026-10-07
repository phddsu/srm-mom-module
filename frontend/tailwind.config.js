/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        srm: {
          maroon: '#0B2E7A',
          maroonDark: '#082258',
          maroonLight: '#1E4BA8',
          blue: '#0B2E7A',
          blueLight: '#EFF5FF',
          gold: '#B8912F',
          bg: '#F7F9FC',
          border: '#E1E7F0',
        },
      },
      fontFamily: { serif: ['Georgia', 'Cambria', 'serif'] },
    },
  },
  plugins: [],
};