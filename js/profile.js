/* ================================================
   profile.js – Member profile page
   ================================================ */

const PROFILES_KEY = 'ts_member_profiles';

function getProfiles() {
  try { return JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}'); } catch { return {}; }
}

function saveProfile(email, data) {
  const profiles = getProfiles();
  profiles[email] = { ...profiles[email], ...data };
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function getMyProfile(email) {
  return getProfiles()[email] || {};
}

/* ── FileReader helper ───────────────────────────── */
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireLogin();
  const user = Auth.getUser();
  if (!user) return;

  const myProfile = getMyProfile(user.email);

  /* ── Fill profile card ──────────────────────────── */
  const setEl  = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

  const initial = (user.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  // Avatar: show profile photo if available
  const avatarEl = document.getElementById('avatar-initial');
  if (avatarEl) {
    if (myProfile.photo) {
      avatarEl.innerHTML = `<img src="${myProfile.photo}" alt="프로필" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
    } else {
      avatarEl.textContent = initial;
    }
  }

  setEl('profile-name',   user.name);
  setEl('profile-role',   user.role === 'admin' ? '⭐ 관리자' : '회원');
  setEl('profile-email',  user.email);
  setEl('profile-dept',   user.department || '—');
  setEl('profile-joined', user.joined || '—');

  /* ── Edit form pre-fill ─────────────────────────── */
  setVal('edit-name',      user.name);
  setVal('edit-email',     user.email);
  setVal('edit-dept',      user.department || '');
  setVal('edit-workplace', myProfile.workplace || user.department || '');
  setVal('edit-bio',       myProfile.bio       || '');
  setVal('edit-website',   myProfile.website   || '');

  /* ── Profile photo preview ──────────────────────── */
  const photoInput   = document.getElementById('photo-input');
  const photoPreview = document.getElementById('photo-preview');

  if (myProfile.photo && photoPreview) {
    photoPreview.innerHTML =
      `<img src="${myProfile.photo}" alt="프로필 사진" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--border)">`;
  }

  if (photoInput) {
    photoInput.addEventListener('change', async function() {
      const file = this.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        alert('이미지 크기는 2MB 이하여야 합니다.');
        return;
      }
      const b64 = await readFileAsBase64(file);
      if (photoPreview) {
        photoPreview.innerHTML =
          `<img src="${b64}" alt="프로필 사진" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--border)">`;
      }
      photoInput.dataset.pending = b64;
    });
  }

  /* ── Artwork management ─────────────────────────── */
  let artworks = [...(myProfile.artworks || [])];

  function renderArtworks() {
    const grid = document.getElementById('artwork-grid');
    if (!grid) return;
    grid.innerHTML = artworks.map((src, i) => `
      <div class="artwork-thumb">
        <img src="${src}" alt="artwork ${i+1}">
        <button class="remove-btn" data-index="${i}" title="삭제">✕</button>
      </div>`).join('');
    grid.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        artworks.splice(parseInt(this.dataset.index), 1);
        renderArtworks();
      });
    });
  }

  renderArtworks();

  const artworkInput = document.getElementById('artwork-input');
  if (artworkInput) {
    artworkInput.addEventListener('change', async function() {
      const files = Array.from(this.files);
      for (const file of files) {
        if (file.size > 4 * 1024 * 1024) { alert(`${file.name}: 파일 크기는 4MB 이하여야 합니다.`); continue; }
        const b64 = await readFileAsBase64(file);
        artworks.push(b64);
      }
      renderArtworks();
      this.value = '';
    });
  }

  /* ── Save profile ───────────────────────────────── */
  const editForm = document.getElementById('edit-form');
  if (editForm) {
    editForm.addEventListener('submit', e => {
      e.preventDefault();

      const updatedUser = {
        ...user,
        name:       (document.getElementById('edit-name')?.value  || '').trim(),
        department: (document.getElementById('edit-dept')?.value  || '').trim(),
      };

      const profileData = {
        name:      updatedUser.name,
        workplace: (document.getElementById('edit-workplace')?.value || '').trim(),
        bio:       (document.getElementById('edit-bio')?.value       || '').trim(),
        website:   (document.getElementById('edit-website')?.value   || '').trim(),
        artworks,
        year:      '2026',
      };

      // Save photo if changed
      const pendingPhoto = document.getElementById('photo-input')?.dataset.pending;
      if (pendingPhoto) profileData.photo = pendingPhoto;
      else if (myProfile.photo) profileData.photo = myProfile.photo;

      sessionStorage.setItem('ts_user', JSON.stringify(updatedUser));
      saveProfile(user.email, profileData);

      // Update display
      setEl('profile-name', updatedUser.name);
      setEl('profile-dept', updatedUser.department);
      const newInitial = updatedUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      if (avatarEl) {
        if (profileData.photo) {
          avatarEl.innerHTML = `<img src="${profileData.photo}" alt="프로필" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
        } else {
          avatarEl.textContent = newInitial;
        }
      }

      const alertEl = document.getElementById('profile-alert');
      if (alertEl) {
        alertEl.className = 'alert alert-success show';
        setTimeout(() => alertEl.classList.remove('show'), 3000);
      }
    });
  }

  /* ── My registrations ───────────────────────────── */
  const types = ['study', 'symposium', 'workshop'];
  let count = 0;
  const regItems = [];
  types.forEach(t => {
    const list = JSON.parse(localStorage.getItem('ts_reg_' + (t === 'symposium' ? 'sym' : t)) || '[]');
    const mine = list.filter(r => r.email === user.email);
    count += mine.length;
    mine.forEach(r => regItems.push({ type: t, ...r }));
  });
  setEl('reg-count', count);

  const regList = document.getElementById('reg-list');
  if (regList && regItems.length) {
    const typeLabel = { study: '스터디', symposium: '심포지엄', workshop: '워크샵' };
    regList.innerHTML = `<div style="display:flex;flex-direction:column;gap:10px">` +
      regItems.map(r => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--light);border-radius:var(--radius);font-size:.88rem">
          <span><strong>${typeLabel[r.type] || r.type}</strong> · ${r.date || ''}</span>
          <span class="badge badge-${r.status==='Approved'?'success':r.status==='Rejected'?'danger':'warning'}">${r.status||'검토 중'}</span>
        </div>`).join('') +
      `</div>`;
  }
});
