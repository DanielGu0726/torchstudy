/* ================================================
   theme.js – Dark/Light mode + Logo swap
   ================================================ */
const Theme = (() => {
  const THEME_KEY = 'ts_theme';

  function getRootPath() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const knownDirs = ['activity', 'registration', 'members', 'news'];
    return knownDirs.some(d => parts.includes(d)) ? '../' : '';
  }

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    // Update toggle button icon
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';

    // Swap logo images
    const root = getRootPath();
    const src  = root + (theme === 'dark' ? 'images/torch1.jpg' : 'images/torch2.jpg');
    document.querySelectorAll('.logo-img').forEach(img => { img.src = src; });
  }

  function toggleTheme() {
    applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
  }

  function injectControls() {
    if (document.getElementById('themeToggle')) return;
    const hamburger = document.querySelector('.hamburger');
    if (!hamburger) return;
    const controls = document.createElement('div');
    controls.className = 'nav-controls';
    controls.innerHTML =
      '<button class="btn-icon" id="themeToggle" title="테마 전환">🌙</button>';
    hamburger.parentNode.insertBefore(controls, hamburger);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  }

  function injectLogo() {
    const root  = getRootPath();
    const theme = getTheme();
    const src   = root + (theme === 'dark' ? 'images/torch1.jpg' : 'images/torch2.jpg');

    document.querySelectorAll('.nav-logo').forEach(link => {
      if (link.querySelector('.logo-img')) return;
      const old = link.querySelector('.logo-icon');
      if (!old) return;

      const img = document.createElement('img');
      img.className = 'logo-img';
      img.alt = 'TORCH';
      img.src = src;

      // Fallback: if image fails to load, keep the emoji icon
      img.onerror = function() {
        const fallback = document.createElement('div');
        fallback.className = 'logo-icon';
        fallback.textContent = '🔥';
        this.replaceWith(fallback);
      };

      old.replaceWith(img);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectControls();
    injectLogo();
    applyTheme(getTheme());
  });

  return { applyTheme, getTheme, toggleTheme };
})();
