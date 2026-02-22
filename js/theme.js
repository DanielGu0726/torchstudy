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

  /* ── 테마 적용 ─────────────────────────────────── */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    // 토글 버튼 aria-label 갱신
    const btn = document.getElementById('themeToggle');
    if (btn) btn.setAttribute('aria-label', theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환');

    // 로고 이미지 전환
    swapLogo(theme);
  }

  function toggleTheme() {
    applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
  }

  /* ── 로고 교체 ─────────────────────────────────── */
  // 이모지 아이콘은 DOM에 유지, img를 형제로 삽입해 성공 시에만 표시
  function swapLogo(theme) {
    const root = getRootPath();
    const src  = root + (theme === 'dark' ? 'images/torch1.jpg' : 'images/torch2.jpg');

    document.querySelectorAll('.nav-logo').forEach(link => {
      const icon = link.querySelector('.logo-icon');
      let   img  = link.querySelector('.logo-img');

      if (!img) {
        // 최초 1회: img 요소 생성 (이모지 div는 유지)
        img = document.createElement('img');
        img.className = 'logo-img';
        img.alt = 'TORCH';
        img.style.display = 'none';

        img.addEventListener('load',  function() {
          if (icon) icon.style.display = 'none';
          this.style.display = 'block';
        });
        img.addEventListener('error', function() {
          // 이미지 파일 없으면 이모지 아이콘 유지
          if (icon) icon.style.display = '';
          this.style.display = 'none';
        });

        if (icon) icon.insertAdjacentElement('afterend', img);
        else link.prepend(img);
      }

      // src 교체 → load / error 자동 발동
      img.src = src;
    });
  }

  /* ── 토글 버튼 삽입 ───────────────────────────── */
  function injectControls() {
    if (document.getElementById('themeToggle')) return;
    const hamburger = document.querySelector('.hamburger');
    if (!hamburger) return;

    const controls = document.createElement('div');
    controls.className = 'nav-controls';
    controls.innerHTML =
      '<button class="theme-toggle" id="themeToggle" title="테마 전환" aria-label="다크 모드로 전환">' +
        '<span class="toggle-knob"></span>' +
      '</button>';
    hamburger.parentNode.insertBefore(controls, hamburger);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  }

  /* ── 초기화 ───────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    injectControls();
    applyTheme(getTheme());   // swapLogo 포함
  });

  return { applyTheme, getTheme, toggleTheme };
})();
