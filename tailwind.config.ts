import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#504CFF',
          hover: '#403BEE',
          active: '#322DC8',
          light: 'rgba(80, 76, 255, 0.08)',
          glow: 'rgba(133, 76, 255, 0.28)',
          border: 'rgba(80, 76, 255, 0.22)',
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#504CFF',
          600: '#403BEE',
          700: '#322DC8',
        },
        secondary: {
          DEFAULT: '#0F0F0F',
          hover: '#262626',
          surface: '#1E1E1E',
          muted: '#575757',
          faint: 'rgba(15, 15, 15, 0.04)',
        },
        foreground: {
          DEFAULT: '#0F0F0F',
          light: '#262626',
          muted: '#575757',
          faint: 'rgba(15, 15, 15, 0.04)',
          border: '#EBEBEB',
        },
        background: {
          DEFAULT: '#F4F4F4',
          soft: '#EDEDED',
          card: '#FFFFFF',
          pure: '#FFFFFF',
          muted: '#EBEBEB',
        },
        border: {
          DEFAULT: '#EBEBEB',
          dark: '#DCDCDC',
          light: '#F0F0F0',
        },
        brand: {
          purple: '#854CFF',
          gold: '#F59E0B',
          emerald: '#10B981',
          charcoal: '#0F0F0F',
          surface: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Poppins', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['var(--font-sans)', 'Poppins', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        xs: '0 1px 3px rgba(0, 0, 0, 0.04)',
        sm: '0 2px 8px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        md: '0 8px 24px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.04)',
        lg: '0 16px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
        xl: '0 24px 60px rgba(0, 0, 0, 0.10), 0 6px 18px rgba(0, 0, 0, 0.05)',
        primary: '0 8px 24px rgba(80, 76, 255, 0.25)',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '18px',
        xl: '24px',
        '2xl': '30px',
      },
      maxWidth: {
        container: '1440px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

