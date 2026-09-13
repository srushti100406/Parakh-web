/**
 * PARAKH Admin Portal — Shared UI utilities
 *
 * Re-exported by all view modules. Keeps formatting helpers, icons, toast,
 * and shell rendering in one place so individual view modules stay focused
 * on their own data and markup.
 */

import * as api from '../api.js';

// ── App state (shared across all views) ──────────────────────────────────────
export const state = {
  view: 'dashboard',   // dashboard | inspectors | inspector-detail | create-inspector | inspections | inspection-detail | complaints
  adminUser: null,
  params: {},
  topbarSearch: '',
};

export function navigate(view, params = {}) {
  state.view = view;
  state.params = params;
  // Dynamically import the render function to avoid circular dependencies.
  import('../main.js').then(m => m.render());
}

// ── Formatters ────────────────────────────────────────────────────────────────

export function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function fmtDate(val) {
  if (!val) return '—';
  try { return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return val; }
}

export function fmtDateTime(val) {
  if (!val) return '—';
  try { return new Date(val).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return val; }
}

export function statusBadge(status) {
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

export function activeBadge(active) {
  return active
    ? `<span class="badge badge-green">Active</span>`
    : `<span class="badge badge-grey">Inactive</span>`;
}

export function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Toast ─────────────────────────────────────────────────────────────────────

export function toast(msg, type = 'info') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// ── SVG icons ─────────────────────────────────────────────────────────────────

export const I = {
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

// ── Shell ─────────────────────────────────────────────────────────────────────

export function renderSidebar() {
  const nav = (view, icon, label) => {
    const active =
      state.view === view ||
      (view === 'inspectors' && (state.view === 'inspector-detail' || state.view === 'create-inspector')) ||
      (view === 'inspections' && state.view === 'inspection-detail');
    return `<div class="nav-item ${active ? 'active' : ''}" data-nav="${view}">
      ${icon}<span>${label}</span>
    </div>`;
  };
  const adm = state.adminUser;
  const name = adm?.name || adm?.email || 'Admin';
  return `
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="brand-row">
        <div class="brand-badge">P</div>
        <div><div class="brand-title">PARAKH</div><div class="brand-sub">ADMIN PORTAL</div></div>
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
      <div class="nav-item" id="sidebar-logout">${I.logout}<span>Logout</span></div>
      <div class="status-dot-row" style="margin-top:10px;">
        <div class="pulse-dot"></div><span>BACKEND CONNECTED</span>
      </div>
    </div>
  </aside>`;
}

export function renderShell(content, title = 'PARAKH Admin') {
  return `
  <div class="shell">
    ${renderSidebar()}
    <div class="main-content">
      <header class="top-bar">
        <span class="topbar-title">${escHtml(title)}</span>
        <div class="topbar-search">${I.search}<input id="topbar-search-input" placeholder="Search…" value="${escHtml(state.topbarSearch)}" /></div>
        <button class="topbar-btn" id="topbar-logout" title="Logout">${I.logout}</button>
      </header>
      <div class="view-area" id="view-area">${content}</div>
    </div>
  </div>
  <div id="modal-root"></div>`;
}

export function loadingHtml(msg = 'Loading…') {
  return `<div class="state-box"><div class="spinner spinner-dark" style="width:32px;height:32px;"></div><div class="state-title" style="margin-top:16px;">${msg}</div></div>`;
}
export function errorHtml(msg) {
  return `<div class="state-box"><div class="state-icon">⚠️</div><div class="state-title">Error</div><div class="state-msg">${escHtml(msg)}</div></div>`;
}
export function emptyHtml(msg) {
  return `<div class="state-box"><div class="state-icon">📭</div><div class="state-title">No records found</div><div class="state-msg">${escHtml(msg)}</div></div>`;
}

// ── Shell events ──────────────────────────────────────────────────────────────

export function bindShellEvents() {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.nav));
  });
  [document.getElementById('topbar-logout'), document.getElementById('sidebar-logout')]
    .forEach(btn => btn?.addEventListener('click', doLogout));
}

export function doLogout() {
  api.clearToken();
  state.adminUser = null;
  state.view = 'dashboard';
  import('../main.js').then(m => m.render());
}
