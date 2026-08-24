/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        editorial: {
          bg: '#11110F',
          surface: '#161513',
          card: '#1B1A17',
          border: '#2A2824',
          borderHover: '#3D3A34',
          text: '#F5F1E8',
          muted: '#B8B2A7',
          subtle: '#7A756D',
          accent: '#E8DFCF',
          gold: '#B79B70',
          goldHover: '#C8AE85',
        },
        brand: {
          50: '#FAF8F5',
          100: '#F5F1E8',
          200: '#E8DFCF',
          300: '#D5C7B0',
          400: '#B79B70',
          500: '#A38456',
          600: '#8C6F43',
          700: '#6E5531',
          800: '#4F3B20',
          900: '#2A2824',
          950: '#11110F',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
