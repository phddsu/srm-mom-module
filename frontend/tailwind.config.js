/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        srm: {
          // Primary navy
          maroon: '#153E8F',
          maroonDark: '#0A2A6F',
          maroonLight: '#2456B5',
          blue: '#153E8F',
          blueDark: '#0A2A6F',
          blueMid: '#1A47A0',
          blueLight: '#EEF4FF',
          blueSoft: '#F7FAFF',

          // Gold accent
          gold: '#C9A227',
          goldDark: '#A8871F',
          goldLight: '#FBF7E8',

          // Neutrals with a warm-blue tint
          bg: '#F6F8FC',
          border: '#E6EBF5',
          borderSoft: '#EFF2F8',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 2px 6px rgba(16,24,40,0.03)',
        cardHover: '0 4px 10px rgba(21,62,143,0.06), 0 12px 28px rgba(21,62,143,0.08)',
        header: '0 1px 2px rgba(16,24,40,0.04)',
        button: '0 1px 2px rgba(10,42,111,0.24), 0 2px 6px rgba(21,62,143,0.18)',
        buttonHover: '0 4px 12px rgba(21,62,143,0.32), 0 8px 20px rgba(21,62,143,0.18)',
      },
      borderRadius: {
        srm: '14px',
      },
      transitionTimingFunction: {
        srm: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};