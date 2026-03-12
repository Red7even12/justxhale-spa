// frontend-spa/tailwind.config.js

import formsPlugin from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", 
  ],
 
  theme: {
    extend: {
      colors: {
        // PILLAR 5 & 6: Dynamic Branding Hooks
        // These map to the CSS variables injected by ProductLayout.vue
        'brand-primary': 'var(--brand-primary)',
        'brand-secondary': 'var(--brand-secondary)',

        'brand-blue': {
          50: '#f0f5f4',
          100: '#e0ebe9',
          200: '#c2d7d3',
          300: '#a3c3bd',
          400: '#85afa7',
          500: '#74958D',
          600: '#58726A',
          700: '#4a5f59',
          800: '#3c4c47',
          900: '#2e3935',
          950: '#1f2623',
        },
      },
    },
  },
  plugins: [
    formsPlugin,
  ],
}