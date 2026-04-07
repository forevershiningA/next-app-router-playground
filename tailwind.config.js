module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './ui/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    'node_modules/flowbite/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#DEBD68',
          50: '#FBF6E8',
          100: '#F6EDD1',
          200: '#EEDCA3',
          300: '#E6CB76',
          400: '#DEBD68',
          500: '#C9A44B',
          600: '#A6863A',
          700: '#7D652C',
          800: '#54431D',
          900: '#2B220F',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      fontFamily: {
        'playfair-display': ['var(--font-playfair-display)', 'serif'],
      },
    },
    dropShadow: {
      none: '0 0 #0000',
      sm: '0 3px 8px rgba(0, 0, 0, 0.4)',
      DEFAULT: '0 8px 20px rgba(0, 0, 0, 0.48)',
      md: '0 12px 30px rgba(0, 0, 0, 0.55)',
      lg: '0 20px 40px rgba(0, 0, 0, 0.6)',
      xl: '0 28px 56px rgba(0, 0, 0, 0.65)',
      '2xl': '0 38px 76px rgba(0, 0, 0, 0.7)',
    },
  },
  plugins: [require('flowbite/plugin')],
};
