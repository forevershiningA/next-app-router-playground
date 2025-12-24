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
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      fontFamily: {
        'playfair-display': ['var(--font-playfair-display)', 'serif'],
      },
    } 
  },
  plugins: [require('flowbite/plugin')],
};
