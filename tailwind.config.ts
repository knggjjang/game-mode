import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        foreground: '#f8fafc',
        card: '#1e293b',
        primary: '#22c55e',
        'primary-foreground': '#000000',
        secondary: '#64748b',
        'secondary-foreground': '#ffffff',
        accent: '#22c55e',
        muted: '#64748b',
        'muted-foreground': '#94a3b8',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
        border: '#334155',
      },
      borderColor: {
        DEFAULT: '#334155',
      },
      backgroundColor: {
        DEFAULT: '#0f172a',
      },
      textColor: {
        DEFAULT: '#f8fafc',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        'spin-slow': {
          'to': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'pulse': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
      },
    },
  },
  plugins: [],
}
export default config
