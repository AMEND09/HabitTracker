import { Palette } from 'lucide-react';

const themes = [
  { id: 'dark', label: 'Dark' },
  { id: 'dark-mono', label: 'Dark Mono' }
] as const;

type Theme = typeof themes[number]['id'];

export function ThemeToggle() {
  const setTheme = (theme: Theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  return (
    <div className="relative">
      <button 
        className="btn-secondary flex items-center gap-2"
        onClick={() => {
          const currentTheme = document.documentElement.getAttribute('data-theme') as Theme || 'dark';
          const nextTheme = currentTheme === 'dark' ? 'dark-mono' : 'dark';
          setTheme(nextTheme);
        }}
      >
        <Palette size={20} />
        <span className="hidden sm:inline">Theme</span>
      </button>
    </div>
  );
}
