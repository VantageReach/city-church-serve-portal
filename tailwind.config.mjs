/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green:        '#8CC640',
          'green-dark': '#6FA32E',
          'green-mid':  '#C8E49A',
          'green-light':'#F0F9E0',
        },
        navy: {
          50:  '#F0F2F7',
          100: '#D8DEEE',
          200: '#B0BCDD',
          300: '#7A8FBE',
          500: '#3A5490',
          700: '#1A2E5C',
          800: '#101B2E',
          900: '#0A1220',
        },
        stone: {
          50:  '#FAFAFA',
          100: '#F4F4F4',
          200: '#E8E8E8',
          300: '#D0D0D0',
          500: '#8A8A8A',
          700: '#484848',
          800: '#242424',
          900: '#141414',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'Arial Narrow', 'sans-serif'],
        sans:    ['"Open Sans"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'display':       '0.01em',
        'tight-display': '0.02em',
      },
      boxShadow: {
        'card':      '0 2px 8px -1px rgba(16,27,46,0.08), 0 1px 2px -1px rgba(16,27,46,0.04)',
        'card-hover':'0 8px 24px -4px rgba(16,27,46,0.14), 0 2px 6px -2px rgba(16,27,46,0.06)',
        'green':     '0 4px 14px -2px rgba(140,198,64,0.40)',
      },
    },
  },
  plugins: [],
};
