const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}", // <-- ADDED THIS LINE
  ],
  theme: {
    extend: {
      colors: { 'apple-blue': '#007AFF' },
      borderRadius: { 'xl': '0.75rem', '2xl': '1rem', '3xl': '1.5rem' },
      backdropBlur: { 'xs': '2px', 'sm': '4px', 'md': '8px', 'lg': '12px', 'xl': '16px' },

      // --- ADD THESE NEW SECTIONS ---
      animation: {
        'pulse-subtle': 'pulse-subtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 }, // Use a more subtle 70% fade
        },
      },
      // --- END OF NEW SECTIONS ---
    },
  },
  plugins: [],
};

export default config;