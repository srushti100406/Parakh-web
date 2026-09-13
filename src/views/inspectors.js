/**
 * PARAKH Admin Portal — Inspectors views (list, detail, create, edit)
 */
import * as api from '../api.js';
import {
  navigate, escHtml, fmtDate, fmtDateTime, initials,
  activeBadge, renderShell, loadingHtml, errorHtml, emptyHtml,
  bindShellEvents, toast, I,
} from './shared.js';

const filters = { search: '', department: '', active: '', page: 1, page_size: 20 };

// ── Inspectors list ───────────────────────────────────────────────────────────

export async function renderInspectors() {
  document.getElementById('app').innerHTML = renderShell(loadingHtml('Loading inspectors…'), 'Inspector Management');
  bindShellEvents();
  await _loadInspectors();
}

async function _loadInspectors() {
  const viewArea = document.getElementById('view-area');
  if (!viewArea) return;

  const params = {};
  if (filters.search) params.search = filters.search;
  if (filters.department) params.department = filters.department;
  if (filters.active !== '') params.active = filters.active;
  params.page = filters.page;
  params.page_size = filters.page_size;

  let result;
  try { result = await api.listInspectors(params); }
  catch (err) { viewArea.innerHTML = errorHtml(err.message); return; }

  const { items = [], total = 0, page = 1, page_size = 20 } = result;
  const totalPages = Math.max(1, Math.ceil(total / page_size));

  const rows = items.map(p => `
    <tr>
      <td>
        <div class="inspector-cell">
          <div class="avatar-sm">${initials(p.full_name)}</div>
          <div><div class="inspector-cell-name">${escHtml(p.full_name || '—')}</div><div class="inspector-cell-email">${escHtml(p.email || '—')}</div></div>
        </div>
      </td>
      <td><span style="font-family:var(--font-mono);font-size:12px;">${escHtml(p.employee_id || '—')}</span></td>
      <td>${escHtml(p.department || '—')}</td>
      <td>${escHtml(p.role || '—')}</td>
      <td>${activeBadge(p.active)}</td>
      <td>${fmtDate(p.created_at)}</td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-ghost btn-sm insp-view-btn" data-id="${escHtml(p.id)}">${I.eye} View</button>
          <button class="btn btn-ghost btn-sm insp-toggle-btn" data-id="${escHtml(p.id)}" data-active="${p.active}">${p.active ? 'Deactivate' : 'Activate'}</button>
        </div>
      </td>
    </tr>`).join('');

  viewArea.innerHTML = `
    <div class="page-header">
      <div><div class="page-title">Inspectors</div><div class="page-subtitle">${total} total</div></div>
      <button class="btn btn-primary" id="create-inspector-btn">${I.plus} Create Inspector</button>
    </div>
    <div class="filters-bar">
      <input class="filter-input" id="insp-search" placeholder="Search name, email, ID…" value="${escHtml(filters.search)}" />
      <select class="filter-select" id="insp-active">
        <option value="">All Status</option>
        <option value="true" ${filters.active === 'true' ? 'selected' : ''}>Active</option>
        <option value="false" ${filters.active === 'false' ? 'selected' : ''}>Inactive</option>
      </select>
      <button class="btn btn-ghost btn-sm" id="insp-filter-btn">${I.search} Search</button>
      <button class="btn btn-ghost btn-sm" id="insp-reset-btn">Reset</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Inspector</th><th>Employee ID</th><th>Department</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="7">${emptyHtml('No inspectors found')}</td></tr>`}</tbody>
      </table>
      <div class="pagination">
        <span class="page-info">Showing ${items.length} of ${total}</span>
        <div class="page-btns">
          <button class="page-btn" id="insp-prev" ${page <= 1 ? 'disabled' : ''}>‹</button>
          <button class="page-btn active">${page}</button>
          <button class="page-btn" id="insp-next" ${page >= totalPages ? 'disabled' : ''}>›</button>
        </div>
      </div>
    </div>`;

  document.getElementById('create-inspector-btn').addEventListener('click', () => navigate('create-inspector'));
  document.getElementById('insp-filter-btn').addEventListener('click', () => {
    filters.search = document.getElementById('insp-search').value.trim();
    filters.active = document.getElementById('insp-active').value;
    filters.page = 1; _loadInspectors();
  });
  document.getElementById('insp-reset-btn').addEventListener('click', () => {
    filters.search = ''; filters.active = ''; filters.page = 1; _loadInspectors();
  });
  document.getElementById('insp-search').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('insp-filter-btn').click();
  });
  document.getElementById('insp-prev')?.addEventListener('click', () => { filters.page--; _loadInspectors(); });
  document.getElementById('insp-next')?.addEventListener('click', () => { filters.page++; _loadInspectors(); });
  document.querySelectorAll('.insp-view-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate('inspector-detail', { id: btn.dataset.id }));
  });
  document.querySelectorAll('.insp-toggle-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const newActive = btn.dataset.active === 'true' ? false : true;
      try {
        await api.updateInspector(btn.dataset.id, { active: newActive });
        toast(newActive ? 'Inspector activated' : 'Inspector deactivated', 'success');
        _loadInspectors();
      } catch (err) { toast(err.message, 'error'); }
    });
  });
  bindShellEvents();
}

// ── Inspector detail ──────────────────────────────────────────────────────────

export async function renderInspectorDetail(id) {
  document.getElementById('app').innerHTML = renderShell(loadingHtml('Loading inspector…'), 'Inspector Detail');
  bindShellEvents();

  let profile;
  try { profile = await api.getInspector(id); }
  catch (err) { document.getElementById('view-area').innerHTML = errorHtml(err.message); return; }

  document.getElementById('view-area').innerHTML = `
    <div class="back-link" id="back-to-inspectors">${I.back} Back to Inspectors</div>
    <div class="page-header">
      <div style="display:flex;align-items:center;gap:14px;">
        <div style="width:52px;height:52px;border-radius:50%;background:var(--primary-light);color:var(--primary-dark);font-weight:800;font-size:18px;display:flex;align-items:center;justify-content:center;">${initials(profile.full_name)}</div>
        <div><div class="page-title">${escHtml(profile.full_name || '—')}</div><div class="page-subtitle">${escHtml(profile.email || '—')}</div></div>
      </div>
      <div style="display:flex;gap:10px;">
        ${activeBadge(profile.active)}
        <button class="btn btn-ghost btn-sm" id="edit-inspector-btn">${I.edit} Edit</button>
        <button class="btn btn-ghost btn-sm toggle-active-btn" data-active="${profile.active}">${profile.active ? 'Deactivate' : 'Activate'}</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
      <div class="card">
        <div class="card-header"><span class="card-title">Profile Details</span></div>
        <div class="card-body">
          <div class="detail-grid">
            <div class="detail-item"><div class="detail-key">Employee ID</div><div class="detail-val">${escHtml(profile.employee_id || '—')}</div></div>
            <div class="detail-item"><div class="detail-key">Department</div><div class="detail-val">${escHtml(profile.department || '—')}</div></div>
            <div class="detail-item"><div class="detail-key">Phone</div><div class="detail-val">${escHtml(profile.phone || '—')}</div></div>
            <div class="detail-item"><div class="detail-key">Role</div><div class="detail-val">${escHtml(profile.role || '—')}</div></div>
            <div class="detail-item"><div class="detail-key">Created</div><div class="detail-val">${fmtDateTime(profile.created_at)}</div></div>
            <div class="detail-item"><div class="detail-key">Updated</div><div class="detail-val">${fmtDateTime(profile.updated_at)}</div></div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Account Info</span></div>
        <div class="card-body">
          <div class="detail-grid">
            <div class="detail-item"><div class="detail-key">User ID</div><div class="detail-val" style="font-family:var(--font-mono);font-size:11px;">${escHtml(profile.user_id)}</div></div>
            <div class="detail-item"><div class="detail-key">Status</div><div class="detail-val">${activeBadge(profile.active)}</div></div>
          </div>
        </div>
      </div>
    </div>
    <div id="edit-form-area"></div>`;

  document.getElementById('back-to-inspectors').addEventListener('click', () => navigate('inspectors'));
  document.querySelector('.toggle-active-btn').addEventListener('click', async (e) => {
    const newActive = e.currentTarget.dataset.active === 'true' ? false : true;
    try {
      await api.updateInspector(profile.id, { active: newActive });
      toast(newActive ? 'Inspector activated' : 'Inspector deactivated', 'success');
      navigate('inspector-detail', { id: profile.id });
    } catch (err) { toast(err.message, 'error'); }
  });
  document.getElementById('edit-inspector-btn').addEventListener('click', () => _renderEditForm(profile));
  bindShellEvents();
}

function _renderEditForm(profile) {
  document.getElementById('edit-form-area').innerHTML = `
    <div class="card" style="margin-top:20px;">
      <div class="card-header"><span class="card-title">Edit Inspector</span></div>
      <div class="card-body">
        <div id="edit-form-error"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="ef-name" value="${escHtml(profile.full_name || '')}" /></div>
          <div class="form-group"><label class="form-label">Employee ID</label><input class="form-input" id="ef-empid" value="${escHtml(profile.employee_id || '')}" /></div>
          <div class="form-group"><label class="form-label">Department</label><input class="form-input" id="ef-dept" value="${escHtml(profile.department || '')}" /></div>
          <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="ef-phone" value="${escHtml(profile.phone || '')}" /></div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px;">
          <button class="btn btn-ghost" id="ef-cancel">Cancel</button>
          <button class="btn btn-primary" id="ef-save">Save Changes</button>
        </div>
      </div>
    </div>`;
  document.getElementById('ef-cancel').addEventListener('click', () => { document.getElementById('edit-form-area').innerHTML = ''; });
  document.getElementById('ef-save').addEventListener('click', async () => {
    const payload = {};
    const name = document.getElementById('ef-name').value.trim(); if (name) payload.full_name = name;
    const empid = document.getElementById('ef-empid').value.trim(); if (empid) payload.employee_id = empid;
    const dept = document.getElementById('ef-dept').value.trim(); if (dept) payload.department = dept;
    const phone = document.getElementById('ef-phone').value.trim(); if (phone) payload.phone = phone;
    try {
      await api.updateInspector(profile.id, payload);
      toast('Inspector updated', 'success');
      navigate('inspector-detail', { id: profile.id });
    } catch (err) {
      document.getElementById('edit-form-error').innerHTML = `<div class="alert alert-error">${escHtml(err.message)}</div>`;
    }
  });
}

// ── Create inspector ──────────────────────────────────────────────────────────

export function renderCreateInspector() {
  document.getElementById('app').innerHTML = renderShell(`
    <div class="back-link" id="back-to-inspectors">${I.back} Back to Inspectors</div>
    <div class="page-header"><div><div class="page-title">Create Inspector Account</div><div class="page-subtitle">Creates both Supabase Auth user and inspector profile</div></div></div>
    <div class="card" style="max-width:640px;">
      <div class="card-header"><span class="card-title">Inspector Details</span></div>
      <div class="card-body">
        <div id="create-form-alert"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Full Name *</label><input class="form-input" id="ci-name" placeholder="e.g. Rajesh Kumar" /></div>
          <div class="form-group"><label class="form-label">Email Address *</label><input class="form-input" type="email" id="ci-email" placeholder="inspector@department.gov.in" /></div>
          <div class="form-group"><label class="form-label">Initial Password *</label><input class="form-input" type="password" id="ci-password" placeholder="Min 8 characters" autocomplete="new-password" /><div class="form-hint">Inspector uses this to log in on Android.</div></div>
          <div class="form-group"><label class="form-label">Employee ID</label><input class="form-input" id="ci-empid" placeholder="e.g. EMP-2024-001" /></div>
          <div class="form-group"><label class="form-label">Department</label><input class="form-input" id="ci-dept" placeholder="e.g. Food Safety" /></div>
          <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="ci-phone" placeholder="e.g. +91 98765 43210" /></div>
          <div class="form-group"><label class="form-label">Role</label><select class="form-input" id="ci-role"><option value="inspector">Inspector</option><option value="senior_inspector">Senior Inspector</option><option value="admin">Admin</option></select></div>
          <div class="form-group"><label class="form-label">Status</label><select class="form-input" id="ci-active"><option value="true">Active</option><option value="false">Inactive</option></select></div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px;">
          <button class="btn btn-ghost" id="ci-cancel">Cancel</button>
          <button class="btn btn-primary" id="ci-submit">${I.plus} Create Inspector</button>
        </div>
      </div>
    </div>`, 'Create Inspector');
  bindShellEvents();
  document.getElementById('back-to-inspectors').addEventListener('click', () => navigate('inspectors'));
  document.getElementById('ci-cancel').addEventListener('click', () => navigate('inspectors'));
  document.getElementById('ci-submit').addEventListener('click', _doCreate);
}

async function _doCreate() {
  const alertEl = document.getElementById('create-form-alert');
  const btn = document.getElementById('ci-submit');
  const name = document.getElementById('ci-name').value.trim();
  const email = document.getElementById('ci-email').value.trim();
  const password = document.getElementById('ci-password').value;
  alertEl.innerHTML = '';
  if (!name) { alertEl.innerHTML = `<div class="alert alert-error">Full name is required.</div>`; return; }
  if (!email) { alertEl.innerHTML = `<div class="alert alert-error">Email is required.</div>`; return; }
  if (!password || password.length < 8) { alertEl.innerHTML = `<div class="alert alert-error">Password must be at least 8 characters.</div>`; return; }
  btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Creating…`;
  const payload = {
    full_name: name, email, password,
    role: document.getElementById('ci-role').value,
    active: document.getElementById('ci-active').value === 'true',
  };
  const empid = document.getElementById('ci-empid').value.trim(); if (empid) payload.employee_id = empid;
  const dept = document.getElementById('ci-dept').value.trim(); if (dept) payload.department = dept;
  const phone = document.getElementById('ci-phone').value.trim(); if (phone) payload.phone = phone;
  try {
    const created = await api.createInspector(payload);
    toast(`Inspector "${created.full_name}" created`, 'success');
    navigate('inspectors');
  } catch (err) {
    let msg = err.message;
    if (err.errorCode === 'DUPLICATE_EMAIL') msg = `An account with that email already exists.`;
    if (err.errorCode === 'DUPLICATE_EMPLOYEE_ID') msg = `An account with that employee ID already exists.`;
    alertEl.innerHTML = `<div class="alert alert-error">${escHtml(msg)}</div>`;
  } finally {
    btn.disabled = false; btn.innerHTML = `${I.plus} Create Inspector`;
  }
}
