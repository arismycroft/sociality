import type { Config } from "tailwindcss";

// Token diambil dari Figma Foundations (Colors, Radius, Typography).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Alias semantik (tema gelap) yang dipakai komponen.
        background: "#000000",
        surface: "#0A0D12", // neutral-950
        border: "#181D27", // neutral-900
        muted: "#A4A7AE", // neutral-400
        primary: {
          DEFAULT: "#6936F2", // primary-300 (Figma)
          100: "#F6F9FE",
          200: "#7F51F9",
          300: "#7F51F9", // varian lebih terang untuk link/fokus pada latar gelap
          600: "#6936F2",
          700: "#5B2BD6", // hover
        },
        danger: "#D9206E", // Accent / Red
        success: "#079455", // Accent / Green
        warning: "#FDB022", // Accent / Yellow
        // Skala Neutral Figma
        neutral: {
          25: "#FDFDFD",
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E9EAEB",
          300: "#D5D7DA",
          400: "#A4A7AE",
          500: "#717680",
          600: "#535862",
          700: "#414651",
          800: "#252B37",
          900: "#181D27",
          950: "#0A0D12",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      // Skala radius Figma (px): none 0, xxs 2, xs 4, sm 6, md 8, lg 10, xl 12, 2xl 16, 3xl 20, 4xl 24, full
      borderRadius: {
        none: "0px",
        xxs: "2px",
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
        full: "9999px",
        pill: "9999px",
      },
      // Skala Display Figma: ukuran / line-height
      fontSize: {
        "display-xs": ["24px", { lineHeight: "36px" }],
        "display-sm": ["28px", { lineHeight: "38px" }],
        "display-md": ["32px", { lineHeight: "40px" }],
        "display-lg": ["36px", { lineHeight: "44px" }],
        "display-xl": ["40px", { lineHeight: "48px" }],
      },
    },
  },
  plugins: [],
};

export default config;
