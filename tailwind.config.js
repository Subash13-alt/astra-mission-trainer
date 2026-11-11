/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#060a1c',
          900: '#0a1030',
          800: '#101a46',
          700: '#182560',
          600: '#22338a',
        },
        glow: {
          cyan: '#22d3ee',
          violet: '#a78bfa',
          pink: '#f472b6',
          gold: '#facc15',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Poppins', 'system-ui', 'sans-serif'],
        body: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(34, 211, 238, 0.35)',
        'glow-violet': '0 0 24px rgba(167, 139, 250, 0.4)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        twinkle: {
          '0%,100%': { opacity: '0.25' },
          '50%': { opacity: '1' },
        },
        drift: {
          '0%': { transform: 'translateX(-10%)' },
          '100%': { transform: 'translateX(110vw)' },
        },
        pulseRed: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(248,113,113,0.5)' },
          '50%': { boxShadow: '0 0 0 8px rgba(248,113,113,0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
        drift: 'drift 30s linear infinite',
        pulseRed: 'pulseRed 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
};
