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
          glow: "hsl(var(--primary-glow))",
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
          glow: "hsl(var(--fire-glow))",
        },
        zen: {
          DEFAULT: "hsl(var(--zen))",
          foreground: "hsl(var(--zen-foreground))",
          glow: "hsl(var(--zen-glow))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          glow: "hsl(var(--success-glow))",
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
        "large": "var(--shadow-large)",
        "primary": "var(--shadow-primary)",
        "fire": "var(--shadow-fire)",
        "zen": "var(--shadow-zen)",
        "success": "var(--shadow-success)",
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
            filter: "brightness(1) contrast(1) blur(0px) saturate(1)",
            textShadow: "0 0 0px transparent",
          },
          "10%": {
            opacity: "1",
            transform: "translateY(-1px) scale(1.02) rotate(0deg)",
            filter: "brightness(1.2) contrast(1.1) blur(0px) saturate(1.2) sepia(0.1)",
            textShadow: "0 0 4px hsl(45 100% 60% / 0.4)",
          },
          "20%": {
            opacity: "1",
            transform: "translateY(-2px) scale(1.04) rotate(-0.5deg)",
            filter: "brightness(1.3) contrast(1.2) blur(0px) saturate(1.3) sepia(0.3) hue-rotate(-5deg)",
            textShadow: "0 0 8px hsl(35 100% 55% / 0.6), 0 0 12px hsl(25 95% 50% / 0.4)",
          },
          "35%": {
            opacity: "0.95",
            transform: "translateY(0px) scale(1.03) rotate(1deg)",
            filter: "brightness(1.1) contrast(1.4) blur(0.2px) saturate(1.1) sepia(0.6) hue-rotate(-15deg)",
            textShadow: "0 0 10px hsl(25 95% 50% / 0.7), 0 0 18px hsl(15 85% 45% / 0.5), 0 0 2px hsl(0 0% 10% / 0.8)",
          },
          "50%": {
            opacity: "0.85",
            transform: "translateY(2px) scale(0.98) rotate(-1.5deg)",
            filter: "brightness(0.7) contrast(1.7) blur(0.5px) saturate(0.9) sepia(0.85) hue-rotate(-30deg)",
            textShadow: "0 0 8px hsl(15 85% 45% / 0.6), 0 0 14px hsl(5 75% 40% / 0.4), 0 0 3px hsl(0 0% 5% / 1)",
          },
          "65%": {
            opacity: "0.65",
            transform: "translateY(4px) scale(0.92) rotate(2deg)",
            filter: "brightness(0.45) contrast(2) blur(1px) saturate(0.7) sepia(1) hue-rotate(-40deg) grayscale(0.2)",
            textShadow: "0 0 6px hsl(5 70% 35% / 0.5), 0 0 10px hsl(0 60% 30% / 0.3), 0 0 4px hsl(0 0% 0% / 1)",
          },
          "78%": {
            opacity: "0.4",
            transform: "translateY(7px) scale(0.85) rotate(-2.5deg)",
            filter: "brightness(0.25) contrast(2.3) blur(1.5px) saturate(0.5) grayscale(0.5)",
            textShadow: "0 0 4px hsl(0 50% 25% / 0.4), 0 0 2px hsl(0 0% 0% / 1)",
          },
          "88%": {
            opacity: "0.2",
            transform: "translateY(10px) scale(0.75) rotate(3deg)",
            filter: "brightness(0.15) contrast(2.5) blur(2px) saturate(0.3) grayscale(0.8)",
            textShadow: "0 0 2px hsl(0 20% 15% / 0.3)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(14px) scale(0.6) rotate(-4deg)",
            filter: "brightness(0) contrast(3) blur(3px) saturate(0) grayscale(1)",
            textShadow: "0 0 0px transparent",
          },
        },
        "matchstick-light": {
          "0%": {
            transform: "translateX(-100px) translateY(100px) rotate(-45deg)",
            opacity: "0",
          },
          "15%": {
            transform: "translateX(0) translateY(0) rotate(-45deg)",
            opacity: "1",
          },
          "30%": {
            transform: "translateX(0) translateY(0) rotate(-45deg)",
            opacity: "1",
          },
          "70%": {
            transform: "translateX(-100%) translateY(-20px) rotate(-20deg)",
            opacity: "1",
          },
          "85%": {
            transform: "translateX(-100%) translateY(-20px) rotate(-20deg)",
            opacity: "1",
          },
          "100%": {
            transform: "translateX(-100%) translateY(-20px) rotate(-20deg)",
            opacity: "0",
          },
        },
        "flame-flicker": {
          "0%, 100%": {
            transform: "scaleY(1) scaleX(1)",
            opacity: "0.9",
          },
          "25%": {
            transform: "scaleY(1.1) scaleX(0.95)",
            opacity: "1",
          },
          "50%": {
            transform: "scaleY(0.95) scaleX(1.05)",
            opacity: "0.85",
          },
          "75%": {
            transform: "scaleY(1.05) scaleX(0.9)",
            opacity: "0.95",
          },
        },
        "burn-word": {
          "0%": {
            opacity: "1",
            transform: "scale(1)",
            filter: "brightness(1) contrast(1) blur(0px)",
            color: "inherit",
          },
          "10%": {
            opacity: "1",
            transform: "scale(1.08)",
            filter: "brightness(1.5) contrast(1.2) blur(0px) sepia(0.3)",
            color: "hsl(45 100% 60%)",
          },
          "25%": {
            opacity: "1",
            transform: "scale(1.05)",
            filter: "brightness(1.4) contrast(1.4) blur(0.5px) sepia(0.6) hue-rotate(-15deg)",
            color: "hsl(30 100% 55%)",
          },
          "40%": {
            opacity: "0.95",
            transform: "scale(1) rotate(-1deg)",
            filter: "brightness(1.1) contrast(1.6) blur(1px) sepia(0.8) hue-rotate(-25deg)",
            color: "hsl(15 100% 50%)",
          },
          "60%": {
            opacity: "0.7",
            transform: "scale(0.92) rotate(1deg)",
            filter: "brightness(0.6) contrast(2) blur(1.5px) sepia(1) hue-rotate(-35deg)",
            color: "hsl(0 80% 35%)",
          },
          "80%": {
            opacity: "0.3",
            transform: "scale(0.8) translateY(5px)",
            filter: "brightness(0.3) contrast(2.5) blur(2px) grayscale(0.6)",
            color: "hsl(0 20% 20%)",
          },
          "100%": {
            opacity: "0",
            transform: "scale(0.6) translateY(15px)",
            filter: "brightness(0) contrast(3) blur(3px) grayscale(1)",
            color: "hsl(0 0% 10%)",
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
        "ember-rise": {
          "0%": {
            opacity: "0",
            transform: "translateY(0) translateX(0) scale(1)",
          },
          "10%": {
            opacity: "0.8",
            transform: "translateY(-5px) translateX(0) scale(1.2)",
          },
          "50%": {
            opacity: "0.6",
            transform: "translateY(-20px) translateX(3px) scale(0.8)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(-40px) translateX(5px) scale(0.3)",
          },
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
        "burn-word": "burn-word 1.2s ease-out forwards",
        "matchstick-light": "matchstick-light 2s ease-in-out forwards",
        "flame-flicker": "flame-flicker 0.3s ease-in-out infinite",
        "breathe": "breathe 4s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "ember-rise": "ember-rise 0.8s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
