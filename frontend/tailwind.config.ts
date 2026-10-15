import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { bg: "#0d0e10", panel: "#141619", line: "#262a2f", ink: "#e9e7e2", mute: "#8d9298",
              real: "#86b594", fake: "#d07a65", warn: "#c9a85f" },
    fontFamily: { display: ["Newsreader", "Georgia", "serif"], sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
                  deva: ["'Noto Serif Devanagari'", "'Nirmala UI'", "Mangal", "serif"] },
  } },
  plugins: [],
} satisfies Config;
