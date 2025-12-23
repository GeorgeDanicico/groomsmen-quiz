import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/app.vue',
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        'accent-secondary': 'var(--accent-secondary)',
        surface: 'var(--surface)',
        'surface-alt': 'var(--surface-alt)',
        glass: 'var(--glass)',
        outline: 'var(--outline)',
        'outline-strong': 'var(--outline-strong)',
        'text-strong': 'var(--text-strong)',
        'text-muted': 'var(--text-muted)',
        'card-start': 'rgba(5, 15, 31, 0.9)',
        'card-end': 'rgba(10, 31, 58, 0.75)',
        'image-glow': 'rgba(0, 220, 130, 0.18)',
        'image-surface': 'rgba(10, 31, 58, 0.9)',
        'experience-surface': 'rgba(255, 255, 255, 0.02)',
        'logo-glow': 'rgba(0, 220, 130, 0.25)',
        'logo-surface': 'rgba(5, 15, 31, 0.85)'
      },
      textColor: {
        DEFAULT: '#ffffff'
      },
      fontFamily: {
        sans: [
          '"Space Grotesk"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif'
        ]
      },
      boxShadow: {
        elevated: '0 25px 60px rgba(2, 6, 23, 0.65)',
        'elevated-strong': '0 22px 50px rgba(0, 0, 0, 0.45)',
        experience: '0 15px 40px rgba(0, 0, 0, 0.25)',
        logo: '0 10px 26px rgba(0, 0, 0, 0.35)'
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)'
      }
    }
  }
} satisfies Config
