import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "flame": "flame 0.5s ease-in-out infinite alternate",
      },
      keyframes: {
        flame: {
          "0%": { transform: "scale(1) rotate(0deg)" },
          "100%": { transform: "scale(1.1) rotate(5deg)" },
        },
      },
    },
  },
};

export default config;
