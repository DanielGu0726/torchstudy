/* ================================================
   profile.js – Member profile page
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireLogin();
  const user = Auth.getUser();
  if (!user) return;

  /* ── Fill profile card ──────────────────────── */
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

  const initial = (user.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
  const avatarEl = document.getElementById('avatar-initial');
  if (avatarEl) avatarEl.textContent = initial;

  setEl('profile-name',   user.name);
  setEl('profile-role',   user.role === 'admin' ? '⭐ Admin' : 'Member');
  setEl('profile-email',  user.email);
  setEl('profile-dept',   user.department || '—');
  setEl('profile-joined', user.joined || '—');

  /* ── Edit form pre-fill ─────────────────────── */
  setVal('edit-name',  user.name);
  setVal('edit-email', user.email);
  setVal('edit-dept',  user.department || '');

  /* ── Save changes ───────────────────────────── */
  const editForm = document.getElementById('edit-form');
  if (editForm) {
    editForm.addEventListener('submit', e => {
      e.preventDefault();
      const updated = {
        ...user,
        name:       document.getElementById('edit-name').value.trim(),
        department: document.getElementById('edit-dept').value.trim(),
      };
      sessionStorage.setItem('ts_user', JSON.stringify(updated));
      setEl('profile-name', updated.name);
      setEl('profile-dept', updated.department);
      const initial2 = updated.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
      if (avatarEl) avatarEl.textContent = initial2;

      const alert = document.getElementById('profile-alert');
      if (alert) { alert.className = 'alert alert-success show'; setTimeout(() => alert.classList.remove('show'), 3000); }
    });
  }

  /* ── My registrations ───────────────────────── */
  const types = ['study', 'symposium', 'workshop'];
  let count = 0;
  types.forEach(t => {
    const list = JSON.parse(localStorage.getItem('ts_reg_' + (t === 'symposium' ? 'sym' : t)) || '[]');
    const mine = list.filter(r => r.email === user.email);
    count += mine.length;
  });
  setEl('reg-count', count);
});
