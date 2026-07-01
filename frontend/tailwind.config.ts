import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#45f798",
        secondary: "#1F1F1F",
        cta: "#45f798",
        background: "#050606",
        text: "#F8FAFC",
        border: "#1F1F1F",
      },
      fontFamily: {
        heading: ["Fira Code", "monospace"],
        body: ["Fira Sans", "sans-serif"],
      },
    },
  },
};
export default config;