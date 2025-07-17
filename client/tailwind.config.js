/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 🔁 Enable class-based dark mode
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      backgroundSize: {
        '200%': '200% 200%',
        '300%': '300% 300%',
      },
      animation: {
        gradient: "gradientShift 12s ease infinite",
        splashBounce: "splashBounce 1.8s ease-in-out infinite",
        fadeIn: "fadeIn 1.2s ease-out forwards",
        scaleIn: "scaleIn 0.8s ease-out forwards",
        pulseSlow: "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        splashBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12%)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },
      colors: {
        brand: {
          DEFAULT: '#6366f1',     // Indigo
          dark: '#4f46e5',        // Deeper Indigo
          pink: '#ec4899',
          purple: '#9333ea',
          blue: '#3b82f6',
          emerald: '#10b981',
          light: '#a5b4fc',
        },
      },
      boxShadow: {
        glass: "0 4px 30px rgba(0, 0, 0, 0.1)",
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
