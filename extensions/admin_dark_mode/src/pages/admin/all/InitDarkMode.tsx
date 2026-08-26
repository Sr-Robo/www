import React from 'react';

export default function InitDarkMode() {
  const initScript = `
    (function() {
      try {
        var theme = localStorage.getItem('admin_theme');
        var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (theme === 'dark' || (!theme && prefersDark) || theme === null) {
          document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: initScript }} />;
}

export const layout = {
  areaId: 'head',
  sortOrder: 1
};
