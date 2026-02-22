/* ================================================
   auth.js – Authentication helpers (localStorage)
   ================================================ */

const Auth = (() => {
  const KEY = 'ts_user';

  const DEMO_USERS = [
    { id: 1, email: 'admin@torchstudy.kr', password: 'admin1234', name: '관리자',       role: 'admin',  department: '운영진',           joined: '2023-01-01' },
    { id: 2, email: 'user@torchstudy.kr',  password: 'user1234',  name: '김치기',       role: 'member', department: '서울치과기공소',    joined: '2024-03-15' },
    { id: 3, email: 'test@example.com',    password: 'test1234',  name: '이기공',       role: 'member', department: '한국치기공대학교',  joined: '2024-06-01' },
  ];

  function login(email, password) {
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, message: 'Invalid email or password.' };
    const { password: _, ...safe } = user;
    sessionStorage.setItem(KEY, JSON.stringify(safe));
    return { ok: true, user: safe };
  }

  function logout() {
    sessionStorage.removeItem(KEY);
    window.location.href = getRoot() + 'members/login.html';
  }

  function getUser() {
    try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; }
  }

  function isLoggedIn()  { return getUser() !== null; }
  function isAdmin()     { const u = getUser(); return u && u.role === 'admin'; }

  function requireLogin(redirectBack) {
    if (!isLoggedIn()) {
      window.location.href = getRoot() + 'members/login.html';
    }
  }

  function requireAdmin() {
    requireLogin();
    if (!isAdmin()) {
      alert('Admin access only.');
      window.location.href = getRoot() + 'index.html';
    }
  }

  function getRoot() {
    const depth = (window.location.pathname.match(/\//g) || []).length;
    const parts  = window.location.pathname.split('/').filter(Boolean);
    const knownDirs = ['activity','registration','members','news'];
    const inSub = knownDirs.some(d => parts.includes(d));
    return inSub ? '../' : '';
  }

  function updateNavUser() {
    const user = getUser();
    const loginLinks  = document.querySelectorAll('[data-auth="login"]');
    const logoutLinks = document.querySelectorAll('[data-auth="logout"]');
    const userNames   = document.querySelectorAll('[data-auth="name"]');
    const adminLinks  = document.querySelectorAll('[data-auth="admin"]');

    loginLinks.forEach(el  => el.style.display = isLoggedIn() ? 'none' : '');
    logoutLinks.forEach(el => {
      el.style.display = isLoggedIn() ? '' : 'none';
      el.addEventListener('click', e => { e.preventDefault(); logout(); });
    });
    userNames.forEach(el  => { if (user) el.textContent = user.name; });
    adminLinks.forEach(el => el.style.display = isAdmin() ? '' : 'none');
  }

  return { login, logout, getUser, isLoggedIn, isAdmin, requireLogin, requireAdmin, updateNavUser, getRoot };
})();

/* ── Nav scroll effect ────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  Auth.updateNavUser();

  // Scroll effect
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // Hamburger
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }
});
