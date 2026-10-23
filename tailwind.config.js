/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D9488',
          dark: '#0F766E',
          light: '#CCFBF1',
        },
        secondary: '#0284C7',
        health: {
          teal: '#0D9488',
          blue: '#0284C7',
          mint: '#10B981',
          slate: '#0F172A',
          subtle: '#F1F5F9',
        },
      },
    },
  },
  plugins: [],
};
