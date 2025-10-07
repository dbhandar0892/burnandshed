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
        "shred-strip": {
          "0%": {
            transform: "translateY(0) translateX(0) rotate(0deg) scaleY(1)",
            opacity: "1",
            filter: "blur(0px)",
          },
          "10%": {
            transform: "translateY(-5px) translateX(0) rotate(0deg) scaleY(0.98)",
            opacity: "1",
            filter: "blur(0px)",
          },
          "30%": {
            transform: "translateY(20px) translateX(var(--shred-x)) rotate(var(--shred-rotate)) scaleY(0.95)",
            opacity: "0.9",
            filter: "blur(0.3px)",
          },
          "60%": {
            transform: "translateY(80px) translateX(calc(var(--shred-x) * 1.5)) rotate(calc(var(--shred-rotate) * 2)) scaleY(0.85)",
            opacity: "0.6",
            filter: "blur(0.8px)",
          },
          "100%": {
            transform: "translateY(150px) translateX(calc(var(--shred-x) * 2)) rotate(calc(var(--shred-rotate) * 3)) scaleY(0.7)",
            opacity: "0",
            filter: "blur(2px)",
          },
        },
        "shred-confetti": {
          "0%": {
            transform: "translateY(0) translateX(0) rotate(0deg) scale(1)",
            opacity: "1",
          },
          "20%": {
            transform: "translateY(30px) translateX(var(--confetti-x)) rotate(var(--confetti-rotate)) scale(0.95)",
            opacity: "1",
          },
          "50%": {
            transform: "translateY(100px) translateX(calc(var(--confetti-x) * 2)) rotate(calc(var(--confetti-rotate) * 3)) scale(0.7)",
            opacity: "0.7",
          },
          "100%": {
            transform: "translateY(200px) translateX(calc(var(--confetti-x) * 3)) rotate(calc(var(--confetti-rotate) * 6)) scale(0.3)",
            opacity: "0",
          },
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
        "burn-letter": {
          "0%": {
            opacity: "1",
            transform: "translateY(0) scale(1) rotate(0deg)",
            filter: "brightness(1) contrast(1) blur(0px)",
            textShadow: "0 0 0px transparent",
          },
          "15%": {
            opacity: "1",
            transform: "translateY(-2px) scale(1.05) rotate(-1deg)",
            filter: "brightness(1.3) contrast(1.2) blur(0px) sepia(0.2)",
            textShadow: "0 0 8px hsl(25 95% 60% / 0.6), 0 0 15px hsl(15 85% 50% / 0.4)",
          },
          "30%": {
            opacity: "0.95",
            transform: "translateY(-1px) scale(1.03) rotate(1deg)",
            filter: "brightness(1.1) contrast(1.3) blur(0.3px) sepia(0.5) hue-rotate(-10deg)",
            textShadow: "0 0 10px hsl(25 95% 60% / 0.8), 0 0 20px hsl(15 85% 50% / 0.5)",
          },
          "50%": {
            opacity: "0.8",
            transform: "translateY(2px) scale(0.95) rotate(-2deg)",
            filter: "brightness(0.7) contrast(1.5) blur(0.8px) sepia(0.8) hue-rotate(-25deg)",
            textShadow: "0 0 6px hsl(15 85% 50% / 0.6), 0 0 12px hsl(0 70% 40% / 0.4)",
          },
          "70%": {
            opacity: "0.5",
            transform: "translateY(5px) scale(0.85) rotate(2deg)",
            filter: "brightness(0.4) contrast(2) blur(1.5px) sepia(1) hue-rotate(-35deg) grayscale(0.3)",
            textShadow: "0 0 4px hsl(0 60% 30% / 0.4)",
          },
          "85%": {
            opacity: "0.2",
            transform: "translateY(10px) scale(0.7) rotate(-3deg)",
            filter: "brightness(0.2) contrast(2.5) blur(2px) grayscale(0.8)",
            textShadow: "0 0 2px hsl(0 0% 20% / 0.2)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(15px) scale(0.5) rotate(5deg)",
            filter: "brightness(0) contrast(3) blur(3px) grayscale(1)",
            textShadow: "0 0 0px transparent",
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
        "shred-strip": "shred-strip 1.5s cubic-bezier(0.4, 0, 0.6, 1) forwards",
        "shred-confetti": "shred-confetti 2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "burn": "burn 1s ease-out forwards",
        "burn-letter": "burn-letter 1s ease-out forwards",
        "breathe": "breathe 4s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
