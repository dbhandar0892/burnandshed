import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        fire: {
          DEFAULT: "hsl(var(--fire))",
          foreground: "hsl(var(--fire-foreground))",
        },
        zen: {
          DEFAULT: "hsl(var(--zen))",
          foreground: "hsl(var(--zen-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-calm": "var(--gradient-calm)",
        "gradient-fire": "var(--gradient-fire)",
        "gradient-zen": "var(--gradient-zen)",
        "gradient-success": "var(--gradient-success)",
      },
      boxShadow: {
        "soft": "var(--shadow-soft)",
        "medium": "var(--shadow-medium)",
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
        "shed": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "25%": { transform: "translateY(-10px) scale(1.02)", opacity: "0.8" },
          "50%": { transform: "translateY(20px) scale(0.98)", opacity: "0.6" },
          "75%": { transform: "translateY(-5px) scale(1.01)", opacity: "0.3" },
          "100%": { transform: "translateY(50px) scale(0.9)", opacity: "0" },
        },
        "burn": {
          "0%": { 
            transform: "scale(1) rotate(0deg)", 
            opacity: "1",
            filter: "brightness(1) contrast(1) blur(0px)",
          },
          "20%": { 
            transform: "scale(1.02) rotate(-1deg)", 
            opacity: "0.9",
            filter: "brightness(1.2) contrast(1.1) blur(0px) sepia(0.3)",
          },
          "40%": { 
            transform: "scale(0.98) rotate(1deg)", 
            opacity: "0.7",
            filter: "brightness(0.8) contrast(1.3) blur(0.5px) sepia(0.7) hue-rotate(-20deg)",
          },
          "60%": { 
            transform: "scale(0.95) rotate(-2deg)", 
            opacity: "0.5",
            filter: "brightness(0.4) contrast(1.5) blur(1px) sepia(1) hue-rotate(-30deg)",
          },
          "80%": { 
            transform: "scale(0.85) rotate(3deg)", 
            opacity: "0.2",
            filter: "brightness(0.2) contrast(2) blur(2px) grayscale(1)",
          },
          "100%": { 
            transform: "scale(0.7) rotate(-5deg) translateY(20px)", 
            opacity: "0",
            filter: "brightness(0) contrast(3) blur(4px) grayscale(1)",
          },
        },
        "breathe": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shed": "shed 1.2s ease-out forwards",
        "burn": "burn 1s ease-out forwards",
        "breathe": "breathe 4s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
