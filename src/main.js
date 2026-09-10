/**
 * PARAKH Admin Portal — Single-Page Application
 *
 * Architecture: vanilla JS SPA, no framework, Vite bundler.
 * All data comes from the FastAPI backend — no fake/demo data.
 * Authentication: Supabase session token (obtained via /api/auth/login).
 * Role enforcement: server-side via get_current_admin() dependency.
 */

import './style.css';
import * as api from './api.js';

// ── Router / App state ───────────────────────────────────────────────────────

const state = {
  view: 'login',          // login | dashboard | inspectors | inspector-detail | create-inspector | inspections | inspection-detail | complaints
  adminUser: null,        // { user_id, email }
  params: {},             // view-specific params (e.g. inspector id, inspection id)
  topbarSearch: '',
};

function navigate(view, params = {}) {
  state.view = view;
  state.params = params;
  render();
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function fmtDate(val) {
  if (!val) return '—';
  try { return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return val; }
}

function fmtDateTime(val) {
  if (!val) return '—';
  try { return new Date(val).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return val; }
}

function statusBadge(status) {
  if (!status) return `<span class="badge badge-grey">—</span>`;
  const s = status.toUpperCase();
  if (s === 'COMPLIANT') return `<span class="badge badge-green">✓ Compliant</span>`;
  if (s === 'NON_COMPLIANT') return `<span class="badge badge-red">✗ Non-Compliant</span>`;
  if (s === 'PENDING_ML' || s === 'PROCESSING') return `<span class="badge badge-amber">⏳ Processing</span>`;
  if (s === 'CREATED' || s === 'CAPTURING') return `<span class="badge badge-blue">📷 Capturing</span>`;
  if (s === 'COMPLIANCE_READY' || s === 'EXTRACTED') return `<span class="badge badge-blue">🔍 Review</span>`;
  if (s === 'FAILED') return `<span class="badge badge-red">✗ Failed</span>`;
  return `<span class="badge badge-grey">${status}</span>`;
}

function activeBadge(active) {
  return active
    ? `<span class="badge badge-green">Active</span>`
    : `<span class="badge badge-grey">Inactive</span>`;
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function toast(msg, type = 'info') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// ── SVG icons ─────────────────────────────────────────────────────────────────

const I = {
  home:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  users:     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  inspect:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  complaint: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  logout:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  plus:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  eye:       `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  edit:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  back:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`,
  search:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  refresh:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
};

// ── Sidebar ───────────────────────────────────────────────────────────────────

function renderSidebar() {
  const nav = (view, icon, label, badge = '') => {
    const active = state.view === view || (view === 'inspectors' && state.view === 'inspector-detail') || (view === 'inspectors' && state.view === 'create-inspector') || (view === 'inspections' && state.view === 'inspection-detail');
    return `<div class="nav-item ${active ? 'active' : ''}" data-nav="${view}">
      ${icon}<span>${label}</span>${badge ? `<span class="nav-badge">${badge}</span>` : ''}
    </div>`;
  };

  const adm = state.adminUser;
  const name = adm?.name || adm?.email || 'Admin';

  return `
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="brand-row">
        <div class="brand-badge">P</div>
        <div>
          <div class="brand-title">PARAKH</div>
          <div class="brand-sub">ADMIN PORTAL</div>
        </div>
      </div>
    </div>

    <div class="sidebar-admin-card">
      <div class="admin-avatar">${initials(name)}</div>
      <div class="admin-name">${escHtml(name)}</div>
      <span class="admin-role-badge">ADMIN</span>
    </div>

    <nav class="sidebar-nav">
      ${nav('dashboard', I.home, 'Dashboard')}
      ${nav('inspectors', I.users, 'Inspectors')}
      ${nav('inspections', I.inspect, 'Inspections')}
      ${nav('complaints', I.complaint, 'Complaints')}
    </nav>

    <div class="sidebar-footer">
      <div class="nav-item" id="sidebar-logout">
        ${I.logout}<span>Logout</span>
      </div>
      <div class="status-dot-row" style="margin-top:10px;">
        <div class="pulse-dot"></div>
        <span>BACKEND CONNECTED</span>
      </div>
    </div>
  </aside>`;
}

// ── Shell (sidebar + topbar + content) ───────────────────────────────────────

function renderShell(content, title = 'PARAKH Admin') {
  return `
  <div class="shell">
    ${renderSidebar()}
    <div class="main-content">
      <header class="top-bar">
        <span class="topbar-title">${escHtml(title)}</span>
        <div class="topbar-search">
          ${I.search}
          <input id="topbar-search-input" placeholder="Search…" value="${escHtml(state.topbarSearch)}" />
        </div>
        <button class="topbar-btn" id="topbar-logout" title="Logout">${I.logout}</button>
      </header>
      <div class="view-area" id="view-area">
        ${content}
      </div>
    </div>
  </div>
  <div id="toast-container" class="toast-container"></div>
  <div id="modal-root"></div>`;
}

// ── Loading / Error states ────────────────────────────────────────────────────

function loadingHtml(msg = 'Loading…') {
  return `<div class="state-box"><div class="spinner spinner-dark" style="width:32px;height:32px;"></div><div class="state-title" style="margin-top:16px;">${msg}</div></div>`;
}

function errorHtml(msg) {
  return `<div class="state-box"><div class="state-icon">⚠️</div><div class="state-title">Error</div><div class="state-msg">${escHtml(msg)}</div></div>`;
}

function emptyHtml(msg) {
  return `<div class="state-box"><div class="state-icon">📭</div><div class="state-title">No records found</div><div class="state-msg">${escHtml(msg)}</div></div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW: Login
// ═══════════════════════════════════════════════════════════════════════════

function renderLogin() {
  document.getElementById('app').innerHTML = `
  <div class="auth-page">
    <div id="toast-container" class="toast-container"></div>
    <div class="auth-card">
      <div class="auth-logo">
        <div class="auth-logo-badge">P</div>
        <div class="auth-title">PARAKH</div>
        <div class="auth-subtitle">Admin Portal</div>
        <div class="auth-gov-badge">🇮🇳 GOVT. OF INDIA</div>
      </div>

      <div class="auth-form-wrap">
        <div id="auth-error"></div>
        <div class="form-group">
          <label class="form-label">Admin Email</label>
          <input class="form-input" type="email" id="login-email" placeholder="admin@example.gov.in" autocomplete="email" />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="form-input" type="password" id="login-password" placeholder="••••••••" autocomplete="current-password" />
        </div>
        <button class="auth-submit-btn" id="login-btn">
          <span id="login-btn-label">Sign In to Admin Portal</span>
        </button>
      </div>

      <div class="auth-notice">
        Authorized admin access only.<br/>
        Inspector accounts are created through this portal.<br/>
        If you need access, contact your system administrator.
      </div>
    </div>
  </div>`;

  document.getElementById('login-btn').addEventListener('click', doLogin);
  document.getElementById('login-password').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
}

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('auth-error');
  const btn = document.getElementById('login-btn');
  const lbl = document.getElementById('login-btn-label');

  errEl.innerHTML = '';
  if (!email || !password) {
    errEl.innerHTML = `<div class="auth-error">Please enter your email and password.</div>`;
    return;
  }

  btn.disabled = true;
  lbl.innerHTML = `<span class="spinner"></span> Signing in…`;

  try {
    const session = await api.login(email, password);
    // login() fetches session; now verify admin role by calling admin endpoint
    api.setToken(session.access_token);
    try {
      await api.verifyAdminRole(session.access_token);
    } catch (roleErr) {
      api.clearToken();
      errEl.innerHTML = `<div class="auth-error">Access denied. This portal is for admins only.</div>`;
      return;
    }
    state.adminUser = { user_id: session.user_id, email: session.email };
    navigate('dashboard');
  } catch (err) {
    api.clearToken();
    errEl.innerHTML = `<div class="auth-error">${escHtml(err.message || 'Login failed')}</div>`;
  } finally {
    btn.disabled = false;
    lbl.textContent = 'Sign In to Admin Portal';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW: Dashboard
// ═══════════════════════════════════════════════════════════════════════════

async function renderDashboard() {
  document.getElementById('app').innerHTML = renderShell(loadingHtml('Loading dashboard…'), 'Dashboard');
  bindShellEvents();

  let stats;
  try {
    stats = await api.getAdminDashboard();
  } catch (err) {
    document.getElementById('view-area').innerHTML = errorHtml(err.message);
    return;
  }

  const recentRows = (stats.recent_inspections || []).map(i => `
    <tr>
      <td><span class="font-mono" style="font-family:var(--font-mono);font-size:12px;color:var(--primary);">${escHtml(i.inspection_id)}</span></td>
      <td>${escHtml(i.product_name || '—')}</td>
      <td>${escHtml(i.inspector_name || '—')}</td>
      <td>${statusBadge(i.compliance_status)}</td>
      <td>${fmtDate(i.inspection_date)}</td>
      <td>
        <button class="btn btn-ghost btn-sm view-inspection-btn" data-id="${escHtml(i.inspection_id)}">${I.eye} View</button>
      </td>
    </tr>`).join('');

  document.getElementById('view-area').innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Admin Dashboard</div>
        <div class="page-subtitle">System-wide overview — real data</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-label">Total Inspectors</div>
        <div class="stat-value">${stats.total_inspectors}</div>
        <div class="stat-sub">${stats.active_inspectors} active, ${stats.inactive_inspectors} inactive</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Inspections</div>
        <div class="stat-value">${stats.total_inspections}</div>
        <div class="stat-sub">${stats.pending_inspections} pending</div>
      </div>
      <div class="stat-card green">
        <div class="stat-label">Compliant</div>
        <div class="stat-value">${stats.compliant_inspections}</div>
        <div class="stat-sub">Passed all checks</div>
      </div>
      <div class="stat-card red">
        <div class="stat-label">Non-Compliant</div>
        <div class="stat-value">${stats.non_compliant_inspections}</div>
        <div class="stat-sub">Failed checks</div>
      </div>
      <div class="stat-card amber">
        <div class="stat-label">Pending Review</div>
        <div class="stat-value">${stats.pending_inspections}</div>
        <div class="stat-sub">Awaiting ML / capture</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Complaints</div>
        <div class="stat-value">${stats.total_complaints}</div>
        <div class="stat-sub">All complaints</div>
      </div>
    </div>

    <div class="card" style="margin-top:4px;">
      <div class="card-header">
        <span class="card-title">Recent Inspections</span>
        <button class="btn btn-ghost btn-sm" data-nav="inspections">View All</button>
      </div>
      <div class="table-wrap" style="border:none;box-shadow:none;border-radius:0;">
        <table>
          <thead><tr>
            <th>Inspection ID</th><th>Product</th><th>Inspector</th>
            <th>Status</th><th>Date</th><th>Action</th>
          </tr></thead>
          <tbody>${recentRows || `<tr><td colspan="6">${emptyHtml('No inspections yet')}</td></tr>`}</tbody>
        </table>
      </div>
    </div>`;

  bindShellEvents();
  document.querySelectorAll('.view-inspection-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate('inspection-detail', { id: btn.dataset.id }));
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW: Inspectors list
// ═══════════════════════════════════════════════════════════════════════════

const inspectorFilters = { search: '', department: '', active: '', page: 1, page_size: 20 };

async function renderInspectors() {
  document.getElementById('app').innerHTML = renderShell(loadingHtml('Loading inspectors…'), 'Inspector Management');
  bindShellEvents();
  await loadInspectors();
}

async function loadInspectors() {
  const viewArea = document.getElementById('view-area');
  if (!viewArea) return;

  const params = {};
  if (inspectorFilters.search) params.search = inspectorFilters.search;
  if (inspectorFilters.department) params.department = inspectorFilters.department;
  if (inspectorFilters.active !== '') params.active = inspectorFilters.active;
  params.page = inspectorFilters.page;
  params.page_size = inspectorFilters.page_size;

  let result;
  try {
    result = await api.listInspectors(params);
  } catch (err) {
    viewArea.innerHTML = errorHtml(err.message);
    return;
  }

  const { items = [], total = 0, page = 1, page_size = 20 } = result;
  const totalPages = Math.max(1, Math.ceil(total / page_size));

  const rows = items.map(p => `
    <tr>
      <td>
        <div class="inspector-cell">
          <div class="avatar-sm">${initials(p.full_name)}</div>
          <div>
            <div class="inspector-cell-name">${escHtml(p.full_name || '—')}</div>
            <div class="inspector-cell-email">${escHtml(p.email || '—')}</div>
          </div>
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
      <div>
        <div class="page-title">Inspectors</div>
        <div class="page-subtitle">${total} inspector${total !== 1 ? 's' : ''} total</div>
      </div>
      <button class="btn btn-primary" id="create-inspector-btn">${I.plus} Create Inspector</button>
    </div>

    <div class="filters-bar">
      <input class="filter-input" id="insp-search" placeholder="Search name, email, ID…" value="${escHtml(inspectorFilters.search)}" />
      <select class="filter-select" id="insp-active">
        <option value="">All Status</option>
        <option value="true" ${inspectorFilters.active === 'true' ? 'selected' : ''}>Active</option>
        <option value="false" ${inspectorFilters.active === 'false' ? 'selected' : ''}>Inactive</option>
      </select>
      <button class="btn btn-ghost btn-sm" id="insp-filter-btn">${I.search} Search</button>
      <button class="btn btn-ghost btn-sm" id="insp-reset-btn">Reset</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Inspector</th><th>Employee ID</th><th>Department</th>
          <th>Role</th><th>Status</th><th>Created</th><th>Actions</th>
        </tr></thead>
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

  // Events
  document.getElementById('create-inspector-btn').addEventListener('click', () => navigate('create-inspector'));
  document.getElementById('insp-filter-btn').addEventListener('click', () => {
    inspectorFilters.search = document.getElementById('insp-search').value.trim();
    inspectorFilters.active = document.getElementById('insp-active').value;
    inspectorFilters.page = 1;
    loadInspectors();
  });
  document.getElementById('insp-reset-btn').addEventListener('click', () => {
    inspectorFilters.search = ''; inspectorFilters.active = ''; inspectorFilters.page = 1;
    loadInspectors();
  });
  document.getElementById('insp-search').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('insp-filter-btn').click();
  });
  const prevBtn = document.getElementById('insp-prev');
  const nextBtn = document.getElementById('insp-next');
  if (prevBtn) prevBtn.addEventListener('click', () => { inspectorFilters.page--; loadInspectors(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { inspectorFilters.page++; loadInspectors(); });

  document.querySelectorAll('.insp-view-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate('inspector-detail', { id: btn.dataset.id }));
  });
  document.querySelectorAll('.insp-toggle-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const newActive = btn.dataset.active === 'true' ? false : true;
      try {
        await api.updateInspector(btn.dataset.id, { active: newActive });
        toast(newActive ? 'Inspector activated' : 'Inspector deactivated', 'success');
        loadInspectors();
      } catch (err) { toast(err.message, 'error'); }
    });
  });
  bindShellEvents();
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW: Inspector detail
// ═══════════════════════════════════════════════════════════════════════════

async function renderInspectorDetail() {
  document.getElementById('app').innerHTML = renderShell(loadingHtml('Loading inspector…'), 'Inspector Detail');
  bindShellEvents();

  let profile;
  try {
    profile = await api.getInspector(state.params.id);
  } catch (err) {
    document.getElementById('view-area').innerHTML = errorHtml(err.message);
    return;
  }

  document.getElementById('view-area').innerHTML = `
    <div class="back-link" id="back-to-inspectors">${I.back} Back to Inspectors</div>

    <div class="page-header">
      <div style="display:flex;align-items:center;gap:14px;">
        <div style="width:52px;height:52px;border-radius:50%;background:var(--primary-light);color:var(--primary-dark);font-weight:800;font-size:18px;display:flex;align-items:center;justify-content:center;">
          ${initials(profile.full_name)}
        </div>
        <div>
          <div class="page-title">${escHtml(profile.full_name || '—')}</div>
          <div class="page-subtitle">${escHtml(profile.email || '—')}</div>
        </div>
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
    const btn = e.currentTarget;
    const newActive = btn.dataset.active === 'true' ? false : true;
    try {
      await api.updateInspector(profile.id, { active: newActive });
      toast(newActive ? 'Inspector activated' : 'Inspector deactivated', 'success');
      navigate('inspector-detail', { id: profile.id });
    } catch (err) { toast(err.message, 'error'); }
  });
  document.getElementById('edit-inspector-btn').addEventListener('click', () => {
    renderEditInspectorForm(profile);
  });
  bindShellEvents();
}

function renderEditInspectorForm(profile) {
  document.getElementById('edit-form-area').innerHTML = `
    <div class="card" style="margin-top:20px;">
      <div class="card-header"><span class="card-title">Edit Inspector</span></div>
      <div class="card-body">
        <div id="edit-form-error"></div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input class="form-input" id="ef-name" value="${escHtml(profile.full_name || '')}" />
          </div>
          <div class="form-group">
            <label class="form-label">Employee ID</label>
            <input class="form-input" id="ef-empid" value="${escHtml(profile.employee_id || '')}" />
          </div>
          <div class="form-group">
            <label class="form-label">Department</label>
            <input class="form-input" id="ef-dept" value="${escHtml(profile.department || '')}" />
          </div>
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input class="form-input" id="ef-phone" value="${escHtml(profile.phone || '')}" />
          </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px;">
          <button class="btn btn-ghost" id="ef-cancel">Cancel</button>
          <button class="btn btn-primary" id="ef-save">Save Changes</button>
        </div>
      </div>
    </div>`;

  document.getElementById('ef-cancel').addEventListener('click', () => {
    document.getElementById('edit-form-area').innerHTML = '';
  });
  document.getElementById('ef-save').addEventListener('click', async () => {
    const payload = {};
    const name = document.getElementById('ef-name').value.trim();
    if (name) payload.full_name = name;
    const empid = document.getElementById('ef-empid').value.trim();
    if (empid) payload.employee_id = empid;
    const dept = document.getElementById('ef-dept').value.trim();
    if (dept) payload.department = dept;
    const phone = document.getElementById('ef-phone').value.trim();
    if (phone) payload.phone = phone;

    try {
      await api.updateInspector(profile.id, payload);
      toast('Inspector updated', 'success');
      navigate('inspector-detail', { id: profile.id });
    } catch (err) {
      document.getElementById('edit-form-error').innerHTML = `<div class="alert alert-error">${escHtml(err.message)}</div>`;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW: Create Inspector
// ═══════════════════════════════════════════════════════════════════════════

function renderCreateInspector() {
  document.getElementById('app').innerHTML = renderShell(`
    <div class="back-link" id="back-to-inspectors">${I.back} Back to Inspectors</div>

    <div class="page-header">
      <div>
        <div class="page-title">Create Inspector Account</div>
        <div class="page-subtitle">Creates both Supabase Auth user and inspector profile</div>
      </div>
    </div>

    <div class="card" style="max-width:640px;">
      <div class="card-header"><span class="card-title">Inspector Details</span></div>
      <div class="card-body">
        <div id="create-form-alert"></div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input class="form-input" id="ci-name" placeholder="e.g. Rajesh Kumar" />
          </div>
          <div class="form-group">
            <label class="form-label">Email Address *</label>
            <input class="form-input" type="email" id="ci-email" placeholder="inspector@department.gov.in" />
          </div>
          <div class="form-group">
            <label class="form-label">Initial Password *</label>
            <input class="form-input" type="password" id="ci-password" placeholder="Min 8 characters" autocomplete="new-password" />
            <div class="form-hint">Inspector uses this to log in on Android. Supabase Auth manages it — not stored here.</div>
          </div>
          <div class="form-group">
            <label class="form-label">Employee ID</label>
            <input class="form-input" id="ci-empid" placeholder="e.g. EMP-2024-001" />
          </div>
          <div class="form-group">
            <label class="form-label">Department</label>
            <input class="form-input" id="ci-dept" placeholder="e.g. Food Safety" />
          </div>
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input class="form-input" id="ci-phone" placeholder="e.g. +91 98765 43210" />
          </div>
          <div class="form-group">
            <label class="form-label">Role</label>
            <select class="form-input" id="ci-role">
              <option value="inspector">Inspector</option>
              <option value="senior_inspector">Senior Inspector</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="form-input" id="ci-active">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
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
  document.getElementById('ci-submit').addEventListener('click', doCreateInspector);
}

async function doCreateInspector() {
  const alertEl = document.getElementById('create-form-alert');
  const btn = document.getElementById('ci-submit');

  const name = document.getElementById('ci-name').value.trim();
  const email = document.getElementById('ci-email').value.trim();
  const password = document.getElementById('ci-password').value;
  const empid = document.getElementById('ci-empid').value.trim();
  const dept = document.getElementById('ci-dept').value.trim();
  const phone = document.getElementById('ci-phone').value.trim();
  const role = document.getElementById('ci-role').value;
  const active = document.getElementById('ci-active').value === 'true';

  alertEl.innerHTML = '';

  if (!name) { alertEl.innerHTML = `<div class="alert alert-error">Full name is required.</div>`; return; }
  if (!email) { alertEl.innerHTML = `<div class="alert alert-error">Email is required.</div>`; return; }
  if (!password || password.length < 8) { alertEl.innerHTML = `<div class="alert alert-error">Password must be at least 8 characters.</div>`; return; }

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Creating…`;

  const payload = { full_name: name, email, password, role, active };
  if (empid) payload.employee_id = empid;
  if (dept) payload.department = dept;
  if (phone) payload.phone = phone;

  try {
    const created = await api.createInspector(payload);
    toast(`Inspector "${created.full_name}" created successfully`, 'success');
    navigate('inspectors');
  } catch (err) {
    let msg = err.message;
    if (err.errorCode === 'DUPLICATE_EMAIL') msg = `An account with that email already exists.`;
    if (err.errorCode === 'DUPLICATE_EMPLOYEE_ID') msg = `An account with that employee ID already exists.`;
    alertEl.innerHTML = `<div class="alert alert-error">${escHtml(msg)}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = `${I.plus} Create Inspector`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW: Inspections list
// ═══════════════════════════════════════════════════════════════════════════

const inspectionFilters = { search: '', status: '', product_type: '', date_from: '', date_to: '', page: 1, page_size: 20 };

async function renderInspections() {
  document.getElementById('app').innerHTML = renderShell(loadingHtml('Loading inspections…'), 'Inspections');
  bindShellEvents();
  await loadInspections();
}

async function loadInspections() {
  const viewArea = document.getElementById('view-area');
  if (!viewArea) return;

  const params = {};
  if (inspectionFilters.search) params.search = inspectionFilters.search;
  if (inspectionFilters.status) params.status = inspectionFilters.status;
  if (inspectionFilters.product_type) params.product_type = inspectionFilters.product_type;
  if (inspectionFilters.date_from) params.date_from = inspectionFilters.date_from;
  if (inspectionFilters.date_to) params.date_to = inspectionFilters.date_to;
  params.page = inspectionFilters.page;
  params.page_size = inspectionFilters.page_size;

  let result;
  try {
    result = await api.listAdminInspections(params);
  } catch (err) {
    viewArea.innerHTML = errorHtml(err.message);
    return;
  }

  const { items = [], total = 0, page = 1, page_size = 20 } = result;
  const totalPages = Math.max(1, Math.ceil(total / page_size));

  const rows = items.map(i => `
    <tr>
      <td><span style="font-family:var(--font-mono);font-size:12px;color:var(--primary);">${escHtml(i.inspection_id)}</span></td>
      <td>
        <div style="font-weight:600;font-size:13px;">${escHtml(i.inspector_name || '—')}</div>
        <div style="font-size:11px;color:var(--text-muted);">${escHtml(i.inspector_email || '')}</div>
      </td>
      <td>${escHtml(i.product_name || '—')}</td>
      <td>${escHtml(i.product_type || '—')}</td>
      <td>${i.side_count ? `${i.side_count}-side` : '—'}</td>
      <td>${statusBadge(i.compliance_status)}</td>
      <td>${fmtDate(i.inspection_date || i.created_at)}</td>
      <td>
        <button class="btn btn-ghost btn-sm view-insp-btn" data-id="${escHtml(i.inspection_id)}">${I.eye} View</button>
      </td>
    </tr>`).join('');

  viewArea.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">All Inspections</div>
        <div class="page-subtitle">${total} inspection${total !== 1 ? 's' : ''} total</div>
      </div>
    </div>

    <div class="filters-bar">
      <input class="filter-input" id="insp2-search" placeholder="Search product, ID…" value="${escHtml(inspectionFilters.search)}" />
      <select class="filter-select" id="insp2-status">
        <option value="">All Status</option>
        <option value="COMPLIANT" ${inspectionFilters.status === 'COMPLIANT' ? 'selected' : ''}>Compliant</option>
        <option value="NON_COMPLIANT" ${inspectionFilters.status === 'NON_COMPLIANT' ? 'selected' : ''}>Non-Compliant</option>
        <option value="PENDING_ML" ${inspectionFilters.status === 'PENDING_ML' ? 'selected' : ''}>Pending ML</option>
        <option value="PROCESSING" ${inspectionFilters.status === 'PROCESSING' ? 'selected' : ''}>Processing</option>
        <option value="CREATED" ${inspectionFilters.status === 'CREATED' ? 'selected' : ''}>Created</option>
        <option value="FAILED" ${inspectionFilters.status === 'FAILED' ? 'selected' : ''}>Failed</option>
      </select>
      <input class="filter-input" type="date" id="insp2-from" value="${inspectionFilters.date_from}" style="max-width:150px;" />
      <input class="filter-input" type="date" id="insp2-to" value="${inspectionFilters.date_to}" style="max-width:150px;" />
      <button class="btn btn-ghost btn-sm" id="insp2-filter-btn">${I.search} Filter</button>
      <button class="btn btn-ghost btn-sm" id="insp2-reset-btn">Reset</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Inspection ID</th><th>Inspector</th><th>Product</th>
          <th>Type</th><th>Sides</th><th>Status</th><th>Date</th><th>Action</th>
        </tr></thead>
        <tbody>${rows || `<tr><td colspan="8">${emptyHtml('No inspections found')}</td></tr>`}</tbody>
      </table>
      <div class="pagination">
        <span class="page-info">Showing ${items.length} of ${total}</span>
        <div class="page-btns">
          <button class="page-btn" id="insp2-prev" ${page <= 1 ? 'disabled' : ''}>‹</button>
          <button class="page-btn active">${page}</button>
          <button class="page-btn" id="insp2-next" ${page >= totalPages ? 'disabled' : ''}>›</button>
        </div>
      </div>
    </div>`;

  document.getElementById('insp2-filter-btn').addEventListener('click', () => {
    inspectionFilters.search = document.getElementById('insp2-search').value.trim();
    inspectionFilters.status = document.getElementById('insp2-status').value;
    inspectionFilters.date_from = document.getElementById('insp2-from').value;
    inspectionFilters.date_to = document.getElementById('insp2-to').value;
    inspectionFilters.page = 1;
    loadInspections();
  });
  document.getElementById('insp2-reset-btn').addEventListener('click', () => {
    Object.assign(inspectionFilters, { search: '', status: '', product_type: '', date_from: '', date_to: '', page: 1 });
    loadInspections();
  });
  document.getElementById('insp2-search').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('insp2-filter-btn').click(); });
  const prevBtn = document.getElementById('insp2-prev');
  const nextBtn = document.getElementById('insp2-next');
  if (prevBtn) prevBtn.addEventListener('click', () => { inspectionFilters.page--; loadInspections(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { inspectionFilters.page++; loadInspections(); });

  document.querySelectorAll('.view-insp-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate('inspection-detail', { id: btn.dataset.id }));
  });
  bindShellEvents();
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW: Inspection detail
// ═══════════════════════════════════════════════════════════════════════════

async function renderInspectionDetail() {
  document.getElementById('app').innerHTML = renderShell(loadingHtml('Loading inspection…'), 'Inspection Detail');
  bindShellEvents();

  let data;
  try {
    data = await api.getAdminInspection(state.params.id);
  } catch (err) {
    document.getElementById('view-area').innerHTML = errorHtml(err.message);
    return;
  }

  const { inspection, inspector, images = [], extracted_info, compliance } = data;

  // Images section
  const sideOrder = ['front', 'back', 'left', 'right'];
  const imageCards = images.length
    ? images.sort((a, b) => sideOrder.indexOf(a.side) - sideOrder.indexOf(b.side)).map(img => `
        <div class="image-card">
          <img src="${escHtml(img.public_url)}" alt="${escHtml(img.side)}" loading="lazy"
               onerror="this.style.display='none';this.parentElement.querySelector('.img-err').style.display='block'" />
          <div class="img-err" style="display:none;padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">Image unavailable</div>
          <div class="image-label">${escHtml(img.side.toUpperCase())}</div>
        </div>`).join('')
    : `<div class="state-box" style="padding:24px;"><div class="state-msg">No images uploaded yet</div></div>`;

  // Extracted info
  const extFields = extracted_info ? [
    ['Product Name', extracted_info.common_product_name],
    ['Manufacturer', extracted_info.manufacturer_name],
    ['Manufacturer Address', extracted_info.manufacturer_address],
    ['Packer', extracted_info.packer_name],
    ['Packer Address', extracted_info.packer_address],
    ['Importer', extracted_info.importer_name],
    ['MRP', extracted_info.mrp ? `₹${extracted_info.mrp}` : null],
    ['Net Quantity', extracted_info.net_quantity_value ? `${extracted_info.net_quantity_value} ${extracted_info.net_quantity_unit || ''}`.trim() : null],
    ['Manufacture Date', extracted_info.manufacture_or_import_date],
    ['Consumer Care', extracted_info.consumer_care_name],
    ['Consumer Care Phone', extracted_info.consumer_care_phone],
    ['Consumer Care Email', extracted_info.consumer_care_email],
    ['Commodity Dimensions', extracted_info.commodity_dimensions],
  ].filter(([, v]) => v != null) : [];

  const extHtml = extFields.length
    ? `<table class="extracted-table" style="width:100%;border-collapse:collapse;">
        ${extFields.map(([k, v]) => `<tr><td style="padding:8px 12px;border-bottom:1px solid var(--border);">${escHtml(k)}</td><td style="padding:8px 12px;border-bottom:1px solid var(--border);">${escHtml(String(v))}</td></tr>`).join('')}
       </table>`
    : `<div class="state-msg" style="padding:20px;text-align:center;">${compliance?.status === 'PENDING_ML' || compliance?.status === 'PROCESSING' ? 'ML processing pending — extracted information not yet available.' : 'No extracted information available.'}</div>`;

  // Compliance rules
  const rules = compliance?.rules || [];
  const rulesHtml = rules.length
    ? rules.map(r => {
        const cls = r.status === 'PASS' ? 'badge-green' : r.status === 'FAIL' ? 'badge-red' : 'badge-amber';
        return `<div class="compliance-rule">
          <div class="rule-name">${escHtml(r.rule_name)}</div>
          <span class="badge ${cls}">${escHtml(r.status)}</span>
          ${r.reason ? `<div class="rule-reason">${escHtml(r.reason)}</div>` : ''}
          ${r.detected_value ? `<div class="rule-reason" style="grid-column:1;">Detected: ${escHtml(r.detected_value)}</div>` : ''}
        </div>`;
      }).join('')
    : `<div class="state-msg" style="padding:16px;text-align:center;">No compliance rules available yet.</div>`;

  document.getElementById('view-area').innerHTML = `
    <div class="back-link" id="back-to-inspections">${I.back} Back to Inspections</div>

    <div class="page-header">
      <div>
        <div class="page-title" style="font-family:var(--font-mono);">${escHtml(inspection.inspection_id)}</div>
        <div class="page-subtitle">${escHtml(inspection.product_name || 'Unnamed product')} — ${statusBadge(inspection.compliance_status)}</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
      <div class="card">
        <div class="card-header"><span class="card-title">Inspection Info</span></div>
        <div class="card-body">
          <div class="detail-grid">
            <div class="detail-item"><div class="detail-key">Product</div><div class="detail-val">${escHtml(inspection.product_name || '—')}</div></div>
            <div class="detail-item"><div class="detail-key">Category</div><div class="detail-val">${escHtml(inspection.product_category || '—')}</div></div>
            <div class="detail-item"><div class="detail-key">Type</div><div class="detail-val">${escHtml(inspection.product_type || '—')}</div></div>
            <div class="detail-item"><div class="detail-key">Sides</div><div class="detail-val">${inspection.side_count ? `${inspection.side_count}-side` : '—'}</div></div>
            <div class="detail-item"><div class="detail-key">Status</div><div class="detail-val">${statusBadge(inspection.compliance_status)}</div></div>
            <div class="detail-item"><div class="detail-key">Score</div><div class="detail-val">${inspection.compliance_score != null ? `${Math.round(inspection.compliance_score * 100)}%` : '—'}</div></div>
            <div class="detail-item"><div class="detail-key">Date</div><div class="detail-val">${fmtDate(inspection.inspection_date)}</div></div>
            <div class="detail-item"><div class="detail-key">Created</div><div class="detail-val">${fmtDateTime(inspection.created_at)}</div></div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><span class="card-title">Inspector</span></div>
        <div class="card-body">
          <div class="detail-grid">
            <div class="detail-item"><div class="detail-key">Name</div><div class="detail-val">${escHtml(inspector?.full_name || '—')}</div></div>
            <div class="detail-item"><div class="detail-key">Email</div><div class="detail-val">${escHtml(inspector?.email || '—')}</div></div>
            <div class="detail-item"><div class="detail-key">Employee ID</div><div class="detail-val">${escHtml(inspector?.employee_id || '—')}</div></div>
            <div class="detail-item"><div class="detail-key">Department</div><div class="detail-val">${escHtml(inspector?.department || '—')}</div></div>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:20px;">
      <div class="card-header"><span class="card-title">Package Images (${images.length} captured)</span></div>
      <div class="card-body">
        <div class="images-grid">${imageCards}</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
      <div class="card">
        <div class="card-header"><span class="card-title">Extracted Information</span></div>
        <div class="card-body" style="padding:0;">${extHtml}</div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Compliance</span>
          ${compliance ? `<div style="display:flex;align-items:center;gap:8px;">${statusBadge(compliance.status)}${compliance.score != null ? `<span style="font-size:12px;color:var(--text-muted);">${Math.round(compliance.score * 100)}%</span>` : ''}</div>` : ''}
        </div>
        <div class="card-body">${rulesHtml}</div>
      </div>
    </div>`;

  document.getElementById('back-to-inspections').addEventListener('click', () => navigate('inspections'));
  bindShellEvents();
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW: Complaints
// ═══════════════════════════════════════════════════════════════════════════

const complaintFilters = { status: '', category: '', page: 1, page_size: 20 };

async function renderComplaints() {
  document.getElementById('app').innerHTML = renderShell(loadingHtml('Loading complaints…'), 'Complaints');
  bindShellEvents();
  await loadComplaints();
}

async function loadComplaints() {
  const viewArea = document.getElementById('view-area');
  if (!viewArea) return;

  const params = {};
  if (complaintFilters.status) params.status = complaintFilters.status;
  if (complaintFilters.category) params.category = complaintFilters.category;
  params.page = complaintFilters.page;
  params.page_size = complaintFilters.page_size;

  let result;
  try {
    result = await api.listAdminComplaints(params);
  } catch (err) {
    viewArea.innerHTML = errorHtml(err.message);
    return;
  }

  const { items = [], total = 0, page = 1, page_size = 20 } = result;
  const totalPages = Math.max(1, Math.ceil(total / page_size));

  const priorityBadge = p => {
    if (!p) return `<span class="badge badge-grey">—</span>`;
    if (p === 'HIGH') return `<span class="badge badge-red">High</span>`;
    if (p === 'MEDIUM') return `<span class="badge badge-amber">Medium</span>`;
    return `<span class="badge badge-grey">Low</span>`;
  };
  const cStatusBadge = s => {
    if (!s) return `<span class="badge badge-grey">—</span>`;
    if (s === 'OPEN') return `<span class="badge badge-red">Open</span>`;
    if (s === 'UNDER_REVIEW') return `<span class="badge badge-amber">Under Review</span>`;
    if (s === 'RESOLVED') return `<span class="badge badge-green">Resolved</span>`;
    if (s === 'REJECTED') return `<span class="badge badge-grey">Rejected</span>`;
    return `<span class="badge badge-grey">${escHtml(s)}</span>`;
  };

  const rows = items.map(c => `
    <tr>
      <td><span style="font-family:var(--font-mono);font-size:12px;color:var(--primary);">${escHtml(c.complaint_id)}</span></td>
      <td>${escHtml(c.inspection_id || '—')}</td>
      <td>${escHtml(c.product_name || '—')}</td>
      <td>${escHtml(c.complaint_title || '—')}</td>
      <td>${escHtml(c.category || '—')}</td>
      <td>${priorityBadge(c.priority)}</td>
      <td>${cStatusBadge(c.status)}</td>
      <td>${fmtDate(c.created_at)}</td>
    </tr>`).join('');

  viewArea.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">All Complaints</div>
        <div class="page-subtitle">${total} complaint${total !== 1 ? 's' : ''} total</div>
      </div>
    </div>

    <div class="filters-bar">
      <select class="filter-select" id="comp-status">
        <option value="">All Status</option>
        <option value="OPEN" ${complaintFilters.status === 'OPEN' ? 'selected' : ''}>Open</option>
        <option value="UNDER_REVIEW" ${complaintFilters.status === 'UNDER_REVIEW' ? 'selected' : ''}>Under Review</option>
        <option value="RESOLVED" ${complaintFilters.status === 'RESOLVED' ? 'selected' : ''}>Resolved</option>
        <option value="REJECTED" ${complaintFilters.status === 'REJECTED' ? 'selected' : ''}>Rejected</option>
      </select>
      <button class="btn btn-ghost btn-sm" id="comp-filter-btn">${I.search} Filter</button>
      <button class="btn btn-ghost btn-sm" id="comp-reset-btn">Reset</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Complaint ID</th><th>Inspection</th><th>Product</th>
          <th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Date</th>
        </tr></thead>
        <tbody>${rows || `<tr><td colspan="8">${emptyHtml('No complaints found')}</td></tr>`}</tbody>
      </table>
      <div class="pagination">
        <span class="page-info">Showing ${items.length} of ${total}</span>
        <div class="page-btns">
          <button class="page-btn" id="comp-prev" ${page <= 1 ? 'disabled' : ''}>‹</button>
          <button class="page-btn active">${page}</button>
          <button class="page-btn" id="comp-next" ${page >= totalPages ? 'disabled' : ''}>›</button>
        </div>
      </div>
    </div>`;

  document.getElementById('comp-filter-btn').addEventListener('click', () => {
    complaintFilters.status = document.getElementById('comp-status').value;
    complaintFilters.page = 1;
    loadComplaints();
  });
  document.getElementById('comp-reset-btn').addEventListener('click', () => {
    complaintFilters.status = ''; complaintFilters.page = 1;
    loadComplaints();
  });
  const prevBtn = document.getElementById('comp-prev');
  const nextBtn = document.getElementById('comp-next');
  if (prevBtn) prevBtn.addEventListener('click', () => { complaintFilters.page--; loadComplaints(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { complaintFilters.page++; loadComplaints(); });
  bindShellEvents();
}

// ── Shell event bindings ──────────────────────────────────────────────────────

function bindShellEvents() {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.nav));
  });
  const logoutBtns = [document.getElementById('topbar-logout'), document.getElementById('sidebar-logout')];
  logoutBtns.forEach(btn => btn?.addEventListener('click', doLogout));
}

function doLogout() {
  api.clearToken();
  state.adminUser = null;
  state.view = 'login';
  render();
}

// ── Main render ───────────────────────────────────────────────────────────────

function render() {
  if (!api.isAuthenticated() || state.view === 'login') {
    renderLogin();
    return;
  }
  switch (state.view) {
    case 'dashboard':         renderDashboard(); break;
    case 'inspectors':        renderInspectors(); break;
    case 'inspector-detail':  renderInspectorDetail(); break;
    case 'create-inspector':  renderCreateInspector(); break;
    case 'inspections':       renderInspections(); break;
    case 'inspection-detail': renderInspectionDetail(); break;
    case 'complaints':        renderComplaints(); break;
    default:                  renderDashboard();
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  if (api.isAuthenticated()) {
    state.view = 'dashboard';
  }
  render();
});
