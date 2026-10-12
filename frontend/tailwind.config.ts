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
        // Premium UI palette
        
// White + Purple Theme
pageBg: "#FFFFFF",
cardBg: "#FFFFFF",
lightSurface: "#F5F0FF",
sidebarBg: "#FFFFFF",
sidebarDarkBg: "#FFFFFF",


espressoBrown: "#171525",

primaryDarkBrown: "#6C3BDB",
primaryAction: "#6C3BDB",
buttonHover: "#5425B5",

champagneGold: "#B89562",
activeNavBg: "#F0E9FF",

textPrimary: "#241B35",
textSecondary: "#6B6478",
textMuted: "#9991A5",

borderColor: "#E8E2F0",
hoverBg: "#F5F0FF",

success: "#477653",
warning: "#B77C28",
danger: "#A64E45",

        // Preserve existing brand and risk definitions
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
