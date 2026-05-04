import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#059669",
          700: "#047857",
          900: "#064e3b",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
