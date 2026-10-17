import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "10px", /* 10px for cards per DESIGN.md */
        md: "6px",  /* 6px for buttons and inputs per DESIGN.md */
        sm: "4px",
      },
      colors: {
        // VaniDarpan DESIGN.md tokens
        ink: "var(--ink)",
        text: "var(--text)",
        hairline: "var(--hairline)",
        surface: "var(--surface)",
        paper: "var(--paper)",
        "darpan-blue": {
          DEFAULT: "var(--darpan-blue)",
          hover: "var(--darpan-blue-hover)",
          tint: "var(--darpan-blue-tint)",
        },
        brass: "var(--brass)",
        success: {
          DEFAULT: "var(--success)",
          tint: "var(--success-tint)",
        },
        caution: {
          DEFAULT: "var(--caution)",
          tint: "var(--caution-tint)",
        },
        risk: {
          DEFAULT: "var(--risk)",
          tint: "var(--risk-tint)",
        },
        studio: "var(--studio)",
        heatmap: {
          1: "var(--heatmap-1)",
          2: "var(--heatmap-2)",
          3: "var(--heatmap-3)",
          4: "var(--heatmap-4)",
          5: "var(--heatmap-5)",
        },

        // shadcn ui mappings
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
          border: "hsl(var(--card-border) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
          border: "hsl(var(--popover-border) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          border: "var(--primary-border)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
          border: "var(--secondary-border)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted-hsl, var(--muted)) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
          border: "var(--muted-border)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          border: "var(--accent-border)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
          border: "var(--destructive-border)",
        },
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          "1": "hsl(var(--chart-1, 222 72% 44%) / <alpha-value>)",
          "2": "hsl(var(--chart-2, 152 61% 30%) / <alpha-value>)",
          "3": "hsl(var(--chart-3, 38 73% 38%) / <alpha-value>)",
          "4": "hsl(var(--chart-4, 4 76% 40%) / <alpha-value>)",
          "5": "hsl(var(--chart-5, 218 46% 10%) / <alpha-value>)",
        },
        sidebar: {
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },
        "sidebar-primary": {
          DEFAULT: "hsl(var(--sidebar-primary) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          border: "var(--sidebar-primary-border)",
        },
        "sidebar-accent": {
          DEFAULT: "hsl(var(--sidebar-accent) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "var(--sidebar-accent-border)"
        },
        status: {
          online: "var(--success)",
          away: "var(--caution)",
          busy: "var(--risk)",
          offline: "var(--muted)",
        },
      },
      boxShadow: {
        institutional: "0 8px 24px rgba(14, 23, 38, 0.12)",
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "'IBM Plex Sans Devanagari'", "system-ui", "-apple-system", "sans-serif"],
        devanagari: ["'IBM Plex Sans Devanagari'", "'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Sans'", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;