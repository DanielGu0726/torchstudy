/* ================================================
   registration.js – Form validation & submission
   ================================================ */

const Registration = (() => {

  /* ── Validator ──────────────────────────────── */
  function validateField(input) {
    const val = input.value.trim();
    const type = input.dataset.validate;
    let msg = '';

    if (input.required && !val) {
      msg = 'This field is required.';
    } else if (type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      msg = 'Enter a valid email address.';
    } else if (type === 'phone' && val && !/^[\d\s\-\+\(\)]{7,20}$/.test(val)) {
      msg = 'Enter a valid phone number.';
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

  /* ── Storage helpers ────────────────────────── */
  const KEYS = { study: 'ts_reg_study', symposium: 'ts_reg_sym', workshop: 'ts_reg_ws' };

  function saveRegistration(type, data) {
    const list = JSON.parse(localStorage.getItem(KEYS[type]) || '[]');
    data.id   = Date.now();
    data.date = new Date().toISOString().slice(0, 10);
    data.status = 'Pending';
    list.push(data);
    localStorage.setItem(KEYS[type], JSON.stringify(list));
  }

  function getRegistrations(type) {
    return JSON.parse(localStorage.getItem(KEYS[type]) || '[]');
  }

  /* ── Show result ────────────────────────────── */
  function showAlert(type, message) {
    const alert = document.getElementById('form-alert');
    if (!alert) return;
    alert.className = `alert alert-${type} show`;
    alert.querySelector('.alert-msg').textContent = message;
    alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ── Attach form handler ────────────────────── */
  function attachForm(formId, regType) {
    const form = document.getElementById(formId);
    if (!form) return;

    // live validation
    form.querySelectorAll('[required], [data-validate]').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateForm(form)) {
        showAlert('danger', 'Please fix the errors above before submitting.');
        return;
      }
      const data = Object.fromEntries(new FormData(form).entries());
      saveRegistration(regType, data);
      form.reset();
      showAlert('success', '✅ Registration submitted successfully! We will contact you soon.');
    });
  }

  return { attachForm, getRegistrations, validateForm, showAlert };
})();
