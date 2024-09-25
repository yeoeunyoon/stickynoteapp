/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        'patrick-hand': ['"Patrick Hand"', 'cursive']
      }
    }
  },
  plugins: [],
}