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
    const root = getRootPath();
    // torch1 = dark-mode logo, torch2 = light-mode logo
    const src = root + (theme === 'dark' ? 'images/torch1.jpg' : 'images/torch2.jpg');
    document.querySelectorAll('.logo-img').forEach(img => { img.src = src; });
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem(THEME_KEY, theme);
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
      '<button class="btn-icon" id="themeToggle" aria-label="Toggle theme">🌙</button>' +
      '<button class="btn-icon" id="langToggle" aria-label="Toggle language">EN</button>';
    hamburger.parentNode.insertBefore(controls, hamburger);

    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('langToggle').addEventListener('click', () => {
      const cur = localStorage.getItem('ts_lang') || 'ko';
      const next = cur === 'ko' ? 'en' : 'ko';
      if (window.I18n) window.I18n.apply(next);
    });
  }

  function injectLogo() {
    const root = getRootPath();
    const theme = getTheme();
    document.querySelectorAll('.nav-logo').forEach(link => {
      if (link.querySelector('.logo-img')) return;
      const old = link.querySelector('.logo-icon');
      const img = document.createElement('img');
      img.className = 'logo-img';
      img.alt = 'TORCH';
      img.src = root + (theme === 'dark' ? 'images/torch1.jpg' : 'images/torch2.jpg');
      if (old) old.replaceWith(img); else link.prepend(img);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectControls();
    injectLogo();
    applyTheme(getTheme());
    // Sync lang button label
    const lang = localStorage.getItem('ts_lang') || 'ko';
    const btn = document.getElementById('langToggle');
    if (btn) btn.textContent = lang === 'ko' ? 'EN' : '한';
  });

  return { applyTheme, getTheme };
})();