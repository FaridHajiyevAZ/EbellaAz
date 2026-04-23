/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        // Design-token driven. All values map to CSS vars in globals.css
        // so we can theme once and propagate everywhere.
        bg:        'rgb(var(--color-bg) / <alpha-value>)',
        'bg-alt':  'rgb(var(--color-bg-alt) / <alpha-value>)',
        surface:   'rgb(var(--color-surface) / <alpha-value>)',
        fg:        'rgb(var(--color-fg) / <alpha-value>)',
        muted:     'rgb(var(--color-muted) / <alpha-value>)',
        subtle:    'rgb(var(--color-subtle) / <alpha-value>)',
        border:    'rgb(var(--color-border) / <alpha-value>)',
        accent:    'rgb(var(--color-accent) / <alpha-value>)',
        'accent-fg': 'rgb(var(--color-accent-fg) / <alpha-value>)',
        success:   'rgb(var(--color-success) / <alpha-value>)',
        warning:   'rgb(var(--color-warning) / <alpha-value>)',
        danger:    'rgb(var(--color-danger) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['clamp(2.75rem, 6vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display':    ['clamp(2rem, 4.2vw, 3.25rem)',  { lineHeight: '1.1',  letterSpacing: '-0.015em' }],
        'heading':    ['1.625rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'eyebrow':    ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.18em' }],
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '6px',
        md: '10px',
        lg: '14px',
      },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.04), 0 6px 20px -8px rgb(0 0 0 / 0.08)',
        pop:  '0 12px 40px -12px rgb(0 0 0 / 0.18)',
        focus:'0 0 0 3px rgb(var(--color-accent) / 0.22)',
      },
      transitionTimingFunction: {
        'out-smooth': 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      animation: {
        'fade-in':  'fadeIn 180ms ease-out',
        'scale-in': 'scaleIn 180ms cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
