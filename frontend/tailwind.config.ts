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
        sidebar: {
          bg: "#0F172A",
          hover: "#1E293B",
          active: "#1E293B",
          text: "#94A3B8",
          textActive: "#FFFFFF",
          border: "#334155",
        },
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        risk: {
          high: {
            bg: "#FEE2E2",
            text: "#991B1B",
            border: "#FCA5A5",
          },
          medium: {
            bg: "#FEF3C7",
            text: "#92400E",
            border: "#FCD34D",
          },
          low: {
            bg: "#DCFCE7",
            text: "#166534",
            border: "#86EFAC",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
