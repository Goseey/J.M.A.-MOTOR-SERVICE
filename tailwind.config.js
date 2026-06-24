/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#050505',
          900: '#0a0a0b',
          800: '#121214',
          700: '#18181b',
          600: '#1f1f23',
          500: '#2a2a2f',
        },
        gold: {
          50: '#FFF8E1',
          100: '#FCE6A1',
          200: '#F2D27C',
          300: '#E6BE53',
          400: '#D4AF37',
          500: '#C49A2B',
          600: '#A37E1F',
        },
      },
      fontFamily: {
        display: ['var(--font-sora)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-manrope)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.25em',
      },
      boxShadow: {
        gold: '0 10px 30px -10px rgba(212, 175, 55, 0.45)',
        ring: '0 0 0 1px rgba(255,255,255,0.06)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-150%)' },
          '100%': { transform: 'translateX(150%)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-30%)' },
          '100%': { transform: 'translateX(130%)' },
        },
        headlight: {
          '0%, 100%': { opacity: '0.9', filter: 'blur(20px)' },
          '50%': { opacity: '1', filter: 'blur(28px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s ease-out both',
        shimmer: 'shimmer 2.8s ease-in-out infinite',
        sweep: 'sweep 8s linear infinite',
        headlight: 'headlight 4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
