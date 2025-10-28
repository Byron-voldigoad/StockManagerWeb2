/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      // On garde juste les extensions essentielles
      colors: {
        'vintage': {
          50: '#fdf8f3',
          100: '#f7ede2',
          500: '#c17d4a',
          600: '#a86638',
          900: '#3c2a1a',
        }
      }
    },
  },
  plugins: [],
}