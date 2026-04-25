import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f4f9",
          100: "#d9e2ec",
          200: "#b7c5d4",
          300: "#8ea3ba",
          400: "#5c7896",
          500: "#3d5a80",
          600: "#2d4563",
          700: "#1e3150",
          800: "#11223d",
          900: "#0a1930",
          950: "#050d1c",
        },
        clinical: {
          50: "#eff6fc",
          100: "#d8e9f6",
          200: "#b3d1ec",
          300: "#84b3dd",
          400: "#528fc9",
          500: "#3272b2",
          600: "#255999",
          700: "#1f477a",
          800: "#1d3d66",
          900: "#1c3456",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-manrope)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      maxWidth: {
        prose: "65ch",
      },
      letterSpacing: {
        tightish: "-0.015em",
      },
    },
  },
  plugins: [],
};

export default config;
