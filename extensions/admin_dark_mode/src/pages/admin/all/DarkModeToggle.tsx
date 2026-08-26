import { Moon, Sun } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasDarkClass = document.documentElement.classList.contains('dark');
    setIsDark(hasDarkClass);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('admin_theme', 'dark');
      } catch (e) {}
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('admin_theme', 'light');
      } catch (e) {}
    }
  };

  return (
    <div className="theme-toggle-container flex items-center ml-auto mr-3">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
        title={isDark ? 'Modo Claro' : 'Modo Escuro'}
        className="w-[2.188rem] h-[2.188rem] flex items-center justify-center rounded-md border border-border bg-card text-foreground hover:text-primary hover:border-primary hover:shadow-[0_0_10px_rgba(189,0,255,0.35)] transition-all cursor-pointer"
      >
        {mounted ? (
          isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-muted-foreground" />
          )
        ) : (
          <div className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

export const layout = {
  areaId: 'header',
  sortOrder: 45
};
