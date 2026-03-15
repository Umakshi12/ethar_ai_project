/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"],
      },
      colors: {
        brand: {
          500: "#6366f1",
          600: "#4f46e5",
        },
      },
    },
  },
  plugins: [],
};

