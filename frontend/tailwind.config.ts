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
        "surface-dim": "#121414",
        "on-tertiary-container": "#795e0f",
        "on-tertiary": "#3e2e00",
        "on-secondary-fixed": "#1c1b1b",
        "surface-glass": "rgba(17, 17, 17, 0.7)",
        "on-error": "#690005",
        "primary-fixed": "#63ff94",
        "secondary-fixed": "#e5e2e1",
        "on-secondary-container": "#bab8b7",
        "on-primary": "#003917",
        "surface-container-high": "#282a2b",
        "on-tertiary-fixed-variant": "#594400",
        "tertiary-fixed": "#ffdf95",
        "inverse-on-surface": "#2f3131",
        "surface-container-low": "#1a1c1c",
        "on-secondary-fixed-variant": "#474646",
        "surface-container": "#1e2020",
        "on-surface-variant": "#b9cbb8",
        "tertiary": "#fffaf6",
        "background-pure": "#000000",
        "on-background": "#e2e2e2",
        "on-surface": "#e2e2e2",
        "tertiary-fixed-dim": "#e6c26c",
        "secondary-fixed-dim": "#c8c6c5",
        "tertiary-container": "#ffda81",
        "error-container": "#93000a",
        "outline-variant": "#3b4b3c",
        "error": "#ffb4ab",
        "terminal-gray": "#888888",
        "on-primary-container": "#007135",
        "outline": "#849584",
        "primary-fixed-dim": "#00e472",
        "inverse-primary": "#006d33",
        "inverse-surface": "#e2e2e2",
        "surface-container-lowest": "#0c0f0f",
        "on-primary-fixed-variant": "#005225",
        "system-red": "#FF0000",
        "primary-container": "#00ff80",
        "surface-tint": "#00e472",
        "surface-variant": "#333535",
        "on-tertiary-fixed": "#251a00",
        "surface": "#121414",
        "on-secondary": "#313030",
        "neon-glow": "rgba(0, 255, 128, 0.4)",
        "on-primary-fixed": "#00210b",
        "surface-bright": "#38393a",
        "surface-container-highest": "#333535",
        "secondary-container": "#4a4949",
        "on-error-container": "#ffdad6"
      },
      spacing: {
        "margin-desktop": "64px",
        "margin-mobile": "16px",
        "max-width": "1440px",
        "gutter": "24px",
        "base": "8px"
      },
      fontFamily: {
        "heading": ["Fira Code", "monospace"],
        "body": ["Fira Sans", "sans-serif"],
        "headline-lg-mobile": ["Inter", "sans-serif"],
        "headline-xl": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "button-text": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "terminal-label": ["JetBrains Mono", "monospace"],
        "data-mono": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        "headline-lg-mobile": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "headline-xl": ["64px", { "lineHeight": "72px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "button-text": ["14px", { "lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "600" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "terminal-label": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500" }],
        "data-mono": ["14px", { "lineHeight": "20px", "fontWeight": "400" }]
      }
    }
  }
};
export default config;