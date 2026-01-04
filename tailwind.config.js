/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        clinic: {
          primary: "#2563EB",   // blue 600
          secondary: "#06B6D4", // cyan 500
          accent: "#22C55E",    // green 500
          bgDark: "#0e1b4d",     // FROM
          bgMid: "#1b3a8f",      // VIA
          bgLight: "#274690",
          surfaceDark: "#0F1A33",
          bgLight: "#F8FAFC",
          surfaceLight: "#FFFFFF",
          textDark: "#E2E8F0",
          textLight: "#0F172A"
        }
      },
      keyframes: {
        adhdFloat: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
          "100%": { transform: "translateY(0px)" }
        },
        adhdSnap: {
          "0%": { transform: "translate(0,0) scale(0.8)", opacity: 0 },
          "70%": { opacity: 1 },
          "100%": { transform: "translate(0,0) scale(1)", opacity: 1 }
        }
      },
      animation: {
        adhdFloat: "adhdFloat 1.6s ease-in-out infinite",
        adhdSnap: "adhdSnap 0.6s ease-out forwards"
      }
    }
  },
  plugins: []
};
