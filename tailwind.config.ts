import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // The Digital Sanctuary Color Palette
        'midnight': {
          DEFAULT: '#10141a',
          dark: '#0a0e14',
        },
        'electric-sky': '#b4c5ff',
        'vibrant-mint': '#36ffc4',
        'surface': {
          DEFAULT: '#1a1f28',
          container: {
            lowest: '#0a0e14',
            low: '#151921',
            DEFAULT: '#1f242d',
            high: '#252a35',
            highest: '#2a303a',
          },
          variant: '#2d3340',
          bright: '#353940',
        },
        'on-surface': {
          DEFAULT: '#e8eaf0',
          variant: '#c2c6d9',
        },
        'primary': {
          DEFAULT: '#b4c5ff',
          container: '#8fa3e8',
          fixed: '#7a91d4',
        },
        'secondary': {
          DEFAULT: '#36ffc4',
          fixed: '#36ffc4',
          'fixed-dim': '#2ee0ad',
        },
        'outline': {
          DEFAULT: '#3d4454',
          variant: '#4a5163',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'body-lg': ['1rem', { lineHeight: '1.6' }],
        'body-md': ['0.875rem', { lineHeight: '1.5' }],
        'body-sm': ['0.75rem', { lineHeight: '1.5' }],
        'label-lg': ['1rem', { lineHeight: '1.4', fontWeight: '500' }],
        'label-md': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],
        'label-sm': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      borderRadius: {
        'sm': '0.5rem',
        'md': '1.5rem',
        'lg': '2rem',
        'xl': '3rem',
      },
      backdropBlur: {
        'glass': '20px',
      },
      boxShadow: {
        'ambient': '0 0 40px 0 rgba(10, 14, 20, 0.06)',
        'glow': '0 0 20px 0 rgba(54, 255, 196, 0.15)',
        'glow-primary': '0 0 20px 0 rgba(180, 197, 255, 0.15)',
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
};
export default config;
