import type { Config } from 'tailwindcss';
import lineClamp from "@tailwindcss/line-clamp";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    screens: {
      xs: "480px",
      sm: "768px",
      md: "1060px",
    },
  },
  plugins: [lineClamp],
};

export default config;
