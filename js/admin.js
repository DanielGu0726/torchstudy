/* ================================================
   admin.js – Admin dashboard logic
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAdmin();

  /* ── Sidebar navigation ─────────────────────── */
  const sidebarLinks = document.querySelectorAll('.sidebar-link[data-panel]');
  const panels       = document.querySelectorAll('.admin-panel');

  function showPanel(id) {
    panels.forEach(p => p.style.display = p.id === id ? 'block' : 'none');
    sidebarLinks.forEach(l => l.classList.toggle('active', l.dataset.panel === id));
  }

  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => showPanel(link.dataset.panel));
  });
  showPanel('panel-overview');

  /* ── KPI counters ───────────────────────────── */
  const studyRegs  = Registration.getRegistrations('study');
  const symRegs    = Registration.getRegistrations('symposium');
  const wsRegs     = Registration.getRegistrations('workshop');
  const totalRegs  = studyRegs.length + symRegs.length + wsRegs.length;

  setKPI('kpi-total',    totalRegs || 142);
  setKPI('kpi-study',    studyRegs.length  || 87);
  setKPI('kpi-symposium',symRegs.length    || 34);
  setKPI('kpi-workshop', wsRegs.length     || 21);

  function setKPI(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ── Populate tables ────────────────────────── */
  populateTable('table-study',     studyRegs,     ['name','email','department','date','status']);
  populateTable('table-symposium', symRegs,        ['name','email','affiliation','date','status']);
  populateTable('table-workshop',  wsRegs,         ['name','email','topic','date','status']);

  function populateTable(tableId, data, cols) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="${cols.length + 1}" style="text-align:center;color:var(--text-muted);padding:32px">No records yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = data.map((row, i) => `
      <tr>
        <td>${i + 1}</td>
        ${cols.map(c => `<td>${c === 'status'
          ? `<span class="badge badge-${row[c]==='Approved'?'success':row[c]==='Rejected'?'danger':'warning'}">${row[c]||'Pending'}</span>`
          : (row[c] || '-')}</td>`).join('')}
        <td>
          <button class="btn btn-sm btn-primary" onclick="approveRow('${tableId}',${i})">Approve</button>
          <button class="btn btn-sm" style="background:#fdedec;color:var(--danger);border:none;margin-left:4px" onclick="deleteRow('${tableId}',${i})">Delete</button>
        </td>
      </tr>`).join('');
  }

  /* ── Search / filter ────────────────────────── */
  document.querySelectorAll('.table-search').forEach(input => {
    input.addEventListener('input', function() {
      const q   = this.value.toLowerCase();
      const tbl = document.querySelector('#' + this.dataset.table + ' tbody');
      if (!tbl) return;
      tbl.querySelectorAll('tr').forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  });
});

/* ── Row actions (global) ───────────────────────── */
function approveRow(tableId, idx) {
  const badge = document.querySelectorAll(`#${tableId} tbody tr`)[idx]?.querySelector('.badge');
  if (badge) { badge.textContent = 'Approved'; badge.className = 'badge badge-success'; }
}
function deleteRow(tableId, idx) {
  if (!confirm('Delete this record?')) return;
  document.querySelectorAll(`#${tableId} tbody tr`)[idx]?.remove();
}
