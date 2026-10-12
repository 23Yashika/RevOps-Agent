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
        pageBg: "#F6F2EB",
        cardBg: "#FFFDFA",
        lightSurface: "#EEE5D8",
        sidebarBg: "#D5C5B5",
        sidebarDarkBg: "#33271F",
        primaryDarkBrown: "#4A3728",
        espressoBrown: "#30241D",
        primaryAction: "#6F5038",
        buttonHover: "#503925",
        champagneGold: "#B89562",
        activeNavBg: "#D8C5AB",
        textPrimary: "#302820",
        textSecondary: "#75695C",
        textMuted: "#9B9083",
        borderColor: "#DED3C4",
        hoverBg: "#F0E7DB",
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
