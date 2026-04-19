import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "#0b0f0d",
          panel: "#111814",
          neon: "#7dff9d",
          neonSoft: "#43c464",
          muted: "#1b2a22"
        }
      },
      boxShadow: {
        glow: "0 0 24px rgba(125, 255, 157, 0.18)",
        insetGlass: "inset 0 0 0 1px rgba(125,255,157,0.22)"
      },
      backgroundImage: {
        scanlines:
          "repeating-linear-gradient(to bottom, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)"
      }
    }
  },
  plugins: []
};

export default config;
