const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        linear: {
          '50': '#1D1F2A',  // very light gray (almost black)
          '100': '#17181D', // light gray
          '200': '#141517', // normal gray
          '300': '#0F1112', // dark gray
          '400': '#0A0C0E', // very dark gray (almost black)
          '500': '#070809', // nearly black
          '600': '#040506', // black
          '700': '#030304', // very black
          '800': '#020203', // more than very black
          '900': '#010101', // pure black
        },
        green: {
          '50': '#edf5f1',
          '100': '#cef1e9',
          '200': '#93eaca',
          '300': '#55d299',
          '400': '#1bb666',
          '500': '#129e3d',
          '600': '#118a2c',
          '700': '#116b25',
          '800': '#0d491f',
          '900': '#0a2c19',
        },
        red: {
          '50': '#fdfcfb',
          '100': '#fcf0ee',
          '200': '#f9ccdd',
          '300': '#f19ebb',
          '400': '#f06c94',
          '500': '#e64874',
          '600': '#d22f53',
          '700': '#ac243c',
          '800': '#7f1927',
          '900': '#4e1014',
        },
        blue: {
          '50': '#f8fafa',
          '100': '#ebf2f9',
          '200': '#d2def3',
          '300': '#a9bbe1',
          '400': '#7c93c8',
          '500': '#606fb0',
          '600': '#4d5394',
          '700': '#3b3e71',
          '800': '#28294d',
          '900': '#17192f',
        },
        gray: {
          '50': '#f9faf9',
          '100': '#eff1f4',
          '200': '#dbdde7',
          '300': '#b5baca',
          '400': '#8a92a6',
          '500': '#6d6f84',
          '600': '#575466',
          '700': '#423f4d',
          '800': '#2d2b35',
          '900': '#1b1a21',
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      
    },
  },
  plugins: [require("tailwindcss-animate")],
}

