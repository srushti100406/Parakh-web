/**
 * PARAKH Admin Portal — Complaints view
 */
import * as api from '../api.js';
import {
  navigate, escHtml, fmtDate, renderShell, loadingHtml,
  errorHtml, emptyHtml, bindShellEvents, I,
} from './shared.js';

const filters = { status: '', category: '', page: 1, page_size: 20 };

export async function renderComplaints() {
  document.getElementById('app').innerHTML = renderShell(loadingHtml('Loading complaints…'), 'Complaints');
  bindShellEvents();
  await _loadComplaints();
}

async function _loadComplaints() {
  const viewArea = document.getElementById('view-area');
  if (!viewArea) return;

  const params = {};
  if (filters.status) params.status = filters.status;
  if (filters.category) params.category = filters.category;
  params.page = filters.page;
  params.page_size = filters.page_size;

  let result;
  try { result = await api.listAdminComplaints(params); }
  catch (err) { viewArea.innerHTML = errorHtml(err.message); return; }

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
      <div><div class="page-title">All Complaints</div><div class="page-subtitle">${total} total</div></div>
    </div>
    <div class="filters-bar">
      <select class="filter-select" id="comp-status">
        <option value="">All Status</option>
        <option value="OPEN" ${filters.status === 'OPEN' ? 'selected' : ''}>Open</option>
        <option value="UNDER_REVIEW" ${filters.status === 'UNDER_REVIEW' ? 'selected' : ''}>Under Review</option>
        <option value="RESOLVED" ${filters.status === 'RESOLVED' ? 'selected' : ''}>Resolved</option>
        <option value="REJECTED" ${filters.status === 'REJECTED' ? 'selected' : ''}>Rejected</option>
      </select>
      <button class="btn btn-ghost btn-sm" id="comp-filter-btn">${I.search} Filter</button>
      <button class="btn btn-ghost btn-sm" id="comp-reset-btn">Reset</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Complaint ID</th><th>Inspection</th><th>Product</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Date</th></tr></thead>
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
    filters.status = document.getElementById('comp-status').value;
    filters.page = 1;
    _loadComplaints();
  });
  document.getElementById('comp-reset-btn').addEventListener('click', () => {
    filters.status = ''; filters.page = 1; _loadComplaints();
  });
  document.getElementById('comp-prev')?.addEventListener('click', () => { filters.page--; _loadComplaints(); });
  document.getElementById('comp-next')?.addEventListener('click', () => { filters.page++; _loadComplaints(); });
  bindShellEvents();
}
