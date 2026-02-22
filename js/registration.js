/* ================================================
   registration.js – Form validation & API submission
   ================================================ */

const Registration = (() => {

  /* ── Field validator ──────────────────────── */
  function validateField(input) {
    const val  = input.value.trim();
    const type = input.dataset.validate;
    let msg = '';

    if (input.required && !val) {
      msg = '필수 항목입니다.';
    } else if (type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      msg = '올바른 이메일 주소를 입력하세요.';
    } else if (type === 'phone' && val && !/^[\d\s\-\+\(\)]{7,20}$/.test(val)) {
      msg = '올바른 연락처를 입력하세요.';
    }

    const errEl = input.parentElement.querySelector('.error-msg');
    if (msg) {
      input.classList.add('error');
      if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
      return false;
    } else {
      input.classList.remove('error');
      if (errEl) errEl.style.display = 'none';
      return true;
    }
  }

  function validateForm(form) {
    const inputs = form.querySelectorAll('[required], [data-validate]');
    let ok = true;
    inputs.forEach(input => { if (!validateField(input)) ok = false; });
    return ok;
  }

  /* ── Alert ───────────────────────────────── */
  function showAlert(type, message) {
    const el = document.getElementById('form-alert');
    if (!el) return;
    el.className = `alert alert-${type} show`;
    el.querySelector('.alert-msg').textContent = message;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ── Check registration open (API + localStorage fallback) ── */
  async function isOpen() {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        return data.reg_open === true;
      }
    } catch {}
    // Fallback: admin toggled via old localStorage UI
    return localStorage.getItem('ts_reg_open') === 'true';
  }

  /* ── Show closed page ────────────────────── */
  function showClosed() {
    const section = document.getElementById('reg-section');
    const closed  = document.getElementById('reg-closed-msg');
    if (section) section.style.display = 'none';
    if (closed)  closed.style.display  = '';
  }

  /* ── Attach form ─────────────────────────── */
  function attachForm(formId, regType) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Check open status first
    isOpen().then(open => {
      if (!open) { showClosed(); return; }

      // Show form section (hidden by default until reg_open confirmed)
      const section = document.getElementById('reg-section');
      const closed  = document.getElementById('reg-closed-msg');
      if (section) section.style.display = '';
      if (closed)  closed.style.display  = 'none';

      // Live validation
      form.querySelectorAll('[required], [data-validate]').forEach(input => {
        input.addEventListener('blur', () => validateField(input));
      });

      // Submit → POST to API
      form.addEventListener('submit', async e => {
        e.preventDefault();
        if (!validateForm(form)) {
          showAlert('danger', '오류를 수정한 후 다시 제출해 주세요.');
          return;
        }

        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '제출 중…'; }

        const data = Object.fromEntries(new FormData(form).entries());

        try {
          const res = await fetch('/api/registrations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: regType, ...data })
          });
          const json = await res.json();

          if (res.ok) {
            form.reset();
            showAlert('success', '✅ 신청이 완료되었습니다! 검토 후 연락드리겠습니다.');
          } else {
            showAlert('danger', json.error || '서버 오류가 발생했습니다.');
          }
        } catch {
          showAlert('danger', '❌ 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        } finally {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '신청서 제출'; }
        }
      });
    });
  }

  return { attachForm, validateForm, showAlert };
})();
