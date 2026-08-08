/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    fontSize: {
      xs: ['0.59rem', { lineHeight: '0.88rem' }],
      sm: ['0.71rem', { lineHeight: '1.06rem' }],
      base: ['0.88rem', { lineHeight: '1.3rem' }],
      lg: ['1.06rem', { lineHeight: '1.59rem' }],
      xl: ['1.24rem', { lineHeight: '1.88rem' }],
      '2xl': ['1.42rem', { lineHeight: '2.24rem' }],
      '3xl': ['1.71rem', { lineHeight: '2.59rem' }],
      '4xl': ['2.24rem', { lineHeight: '2.88rem' }],
      '5xl': ['2.82rem', { lineHeight: '3.35rem' }],
      '6xl': ['3.35rem', { lineHeight: '4.12rem' }],
      '7xl': ['4.12rem', { lineHeight: '4.94rem' }],
      '8xl': ['5.18rem', { lineHeight: '6.18rem' }],
      '9xl': ['6.18rem', { lineHeight: '7.41rem' }],
    },
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        '2xl': 'calc(var(--radius) + 8px)',
        xl: 'calc(var(--radius) + 4px)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px hsl(var(--primary) / 0.15)',
        'glow-md': '0 0 30px -5px hsl(var(--primary) / 0.2)',
        'glow-lg': '0 0 45px -8px hsl(var(--primary) / 0.25)',
        'premium': '0 8px 32px -8px rgba(0, 0, 0, 0.3), 0 4px 8px -4px rgba(0, 0, 0, 0.1)',
        'premium-hover': '0 20px 60px -12px rgba(0, 0, 0, 0.4), 0 8px 16px -8px rgba(0, 0, 0, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px -5px hsl(var(--primary) / 0.2)' },
          '50%': { boxShadow: '0 0 35px -5px hsl(var(--primary) / 0.35)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
