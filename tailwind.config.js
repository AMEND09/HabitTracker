/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        muted: 'hsl(var(--muted))',
        accent: 'hsl(var(--accent))',
        'accent-hover': 'hsl(var(--accent-hover))',
        destructive: 'hsl(var(--destructive))',
        success: 'hsl(var(--success))',
        tab: 'hsl(var(--tab))',
        'tab-active': 'hsl(var(--tab-active))',
        input: 'hsl(var(--input))',
        empty: 'hsl(var(--empty))',
        'success-hover': 'hsl(var(--success-hover))',
      }
    }
  }
}
