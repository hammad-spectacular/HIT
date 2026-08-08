/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        status: {
          excellent: '#10b981',
          verygood: '#3b82f6',
          improving: '#f59e0b',
          attention: '#f97316',
          poor: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};
