/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        soil: {
          900: '#121110', // Deep compost black
          800: '#1C1A18', // Loam charcoal
          700: '#2A2724', // Bark brown
          100: '#F5F4F0', // Raw unbleached paper
        },
        terminal: {
          green: '#39FF14',
          amber: '#FFB300',
          white: '#FFFFFF'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        serif: ['Merriweather', 'Playfair Display', 'serif'],
      },
    },
  },
  plugins: [typography],
};
