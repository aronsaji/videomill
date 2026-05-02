/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#05050A',
        surface: '#0B0D19',
        border: 'rgba(255, 255, 255, 0.1)',
        neon: {
          cyan: '#00F5FF',
          amber: '#FFB800',
          red: '#FF2A2A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
