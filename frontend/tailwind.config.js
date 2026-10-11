/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#38a5f8',
          500: '#0e86d4',
          600: '#0267b5',
          700: '#035293',
          800: '#074679',
          900: '#0c3b65',
          950: '#082643',
        },
        navy: {
          800: '#111827',
          900: '#0f172a',
          950: '#020617',
        }
      }
    },
  },
  plugins: [],
}
