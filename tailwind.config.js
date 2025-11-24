module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      animation: {
        pop: 'pop 1.5s infinite ease-in-out',
        dot1: 'dots 1.2s infinite 0s',
        dot2: 'dots 1.2s infinite 0.2s',
        dot3: 'dots 1.2s infinite 0.4s',
        dot4: 'dots 1.2s infinite 0.6s',
        glow: "glow 3s ease-in-out infinite",
      },
      clipPath: {
        custom: 'polygon(0% 0%, 80% 0%, 60% 100%, 0% 100%)',
      },
      keyframes: {
        pop: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        dots: {
          '0%, 100%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(0.5)', opacity: 0.5 },
        },
        glow: {
      "0%, 100%": { filter: "drop-shadow(0 0 8px #4addbf)" },
      "50%": { filter: "drop-shadow(0 0 20px #00FFFF)" },
    },
      },
      colors: {
        scrollbar: '#4addbf',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Optional for better form styling
  ],
};
