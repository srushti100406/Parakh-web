/**
 * PARAKH Admin Portal — Inspections views (list, detail)
 */
import * as api from '../api.js';
import {
  navigate, escHtml, fmtDate, fmtDateTime, statusBadge,
  renderShell, loadingHtml, errorHtml, emptyHtml,
  bindShellEvents, I,
} from './shared.js';

const filters = { search: '', status: '', product_type: '', date_from: '', date_to: '', page: 1, page_size: 20 };

// ── Inspections list ──────────────────────────────────────────────────────────

export async function renderInspections() {
  document.getElementById('app').innerHTML = renderShell(loadingHtml('Loading inspections…'), 'Inspections');
  bindShellEvents();
  await _loadInspections();
}

async function _loadInspections() {
  const viewArea = document.getElementById('view-area');
  if (!viewArea) return;

  const params = {};
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.product_type) params.product_type = filters.product_type;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  params.page = filters.page;
  params.page_size = filters.page_size;

  let result;
  try { result = await api.listAdminInspections(params); }
  catch (err) { viewArea.innerHTML = errorHtml(err.message); return; }

  const { items = [], total = 0, page = 1, page_size = 20 } = result;
  const totalPages = Math.max(1, Math.ceil(total / page_size));

  const rows = items.map(i => `
    <tr>
      <td><span style="font-family:var(--font-mono);font-size:12px;color:var(--primary);">${escHtml(i.inspection_id)}</span></td>
      <td><div style="font-weight:600;font-size:13px;">${escHtml(i.inspector_name || '—')}</div><div style="font-size:11px;color:var(--text-muted);">${escHtml(i.inspector_email || '')}</div></td>
      <td>${escHtml(i.product_name || '—')}</td>
      <td>${escHtml(i.product_type || '—')}</td>
      <td>${i.side_count ? `${i.side_count}-side` : '—'}</td>
      <td>${statusBadge(i.compliance_status)}</td>
      <td>${fmtDate(i.inspection_date || i.created_at)}</td>
      <td><button class="btn btn-ghost btn-sm view-insp-btn" data-id="${escHtml(i.inspection_id)}">${I.eye} View</button></td>
    </tr>`).join('');

  viewArea.innerHTML = `
    <div class="page-header">
      <div><div class="page-title">All Inspections</div><div class="page-subtitle">${total} total</div></div>
    </div>
    <div class="filters-bar">
      <input class="filter-input" id="insp2-search" placeholder="Search product, ID…" value="${escHtml(filters.search)}" />
      <select class="filter-select" id="insp2-status">
        <option value="">All Status</option>
        <option value="COMPLIANT" ${filters.status === 'COMPLIANT' ? 'selected' : ''}>Compliant</option>
        <option value="NON_COMPLIANT" ${filters.status === 'NON_COMPLIANT' ? 'selected' : ''}>Non-Compliant</option>
        <option value="PENDING_ML" ${filters.status === 'PENDING_ML' ? 'selected' : ''}>Pending ML</option>
        <option value="PROCESSING" ${filters.status === 'PROCESSING' ? 'selected' : ''}>Processing</option>
        <option value="CREATED" ${filters.status === 'CREATED' ? 'selected' : ''}>Created</option>
        <option value="FAILED" ${filters.status === 'FAILED' ? 'selected' : ''}>Failed</option>
      </select>
      <input class="filter-input" type="date" id="insp2-from" value="${filters.date_from}" style="max-width:150px;" />
      <input class="filter-input" type="date" id="insp2-to" value="${filters.date_to}" style="max-width:150px;" />
      <button class="btn btn-ghost btn-sm" id="insp2-filter-btn">${I.search} Filter</button>
      <button class="btn btn-ghost btn-sm" id="insp2-reset-btn">Reset</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Inspection ID</th><th>Inspector</th><th>Product</th><th>Type</th><th>Sides</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
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
    filters.search = document.getElementById('insp2-search').value.trim();
    filters.status = document.getElementById('insp2-status').value;
    filters.date_from = document.getElementById('insp2-from').value;
    filters.date_to = document.getElementById('insp2-to').value;
    filters.page = 1; _loadInspections();
  });
  document.getElementById('insp2-reset-btn').addEventListener('click', () => {
    Object.assign(filters, { search: '', status: '', product_type: '', date_from: '', date_to: '', page: 1 }); _loadInspections();
  });
  document.getElementById('insp2-search').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('insp2-filter-btn').click(); });
  document.getElementById('insp2-prev')?.addEventListener('click', () => { filters.page--; _loadInspections(); });
  document.getElementById('insp2-next')?.addEventListener('click', () => { filters.page++; _loadInspections(); });
  document.querySelectorAll('.view-insp-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate('inspection-detail', { id: btn.dataset.id }));
  });
  bindShellEvents();
}

// ── Inspection detail ─────────────────────────────────────────────────────────

export async function renderInspectionDetail(id) {
  document.getElementById('app').innerHTML = renderShell(loadingHtml('Loading inspection…'), 'Inspection Detail');
  bindShellEvents();

  let data;
  try { data = await api.getAdminInspection(id); }
  catch (err) { document.getElementById('view-area').innerHTML = errorHtml(err.message); return; }

  const { inspection, inspector, images = [], extracted_info, compliance } = data;

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

  const extFields = extracted_info ? [
    ['Product Name', extracted_info.common_product_name],
    ['Manufacturer', extracted_info.manufacturer_name],
    ['Manufacturer Address', extracted_info.manufacturer_address],
    ['Packer', extracted_info.packer_name],
    ['MRP', extracted_info.mrp ? `₹${extracted_info.mrp}` : null],
    ['Net Quantity', extracted_info.net_quantity_value ? `${extracted_info.net_quantity_value} ${extracted_info.net_quantity_unit || ''}`.trim() : null],
    ['Manufacture Date', extracted_info.manufacture_or_import_date],
    ['Consumer Care Phone', extracted_info.consumer_care_phone],
    ['Consumer Care Email', extracted_info.consumer_care_email],
  ].filter(([, v]) => v != null) : [];

  const extHtml = extFields.length
    ? `<table style="width:100%;border-collapse:collapse;">${extFields.map(([k, v]) => `<tr><td style="padding:8px 12px;border-bottom:1px solid var(--border);">${escHtml(k)}</td><td style="padding:8px 12px;border-bottom:1px solid var(--border);">${escHtml(String(v))}</td></tr>`).join('')}</table>`
    : `<div class="state-msg" style="padding:20px;text-align:center;">No extracted information available yet.</div>`;

  const rules = compliance?.rules || [];
  const rulesHtml = rules.length
    ? rules.map(r => {
        const cls = r.status === 'PASS' ? 'badge-green' : r.status === 'FAIL' ? 'badge-red' : 'badge-amber';
        return `<div class="compliance-rule">
          <div class="rule-name">${escHtml(r.rule_name)}</div>
          <span class="badge ${cls}">${escHtml(r.status)}</span>
          ${r.reason ? `<div class="rule-reason">${escHtml(r.reason)}</div>` : ''}
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
            <div class="detail-item"><div class="detail-key">Status</div><div class="detail-val">${statusBadge(inspection.compliance_status)}</div></div>
            <div class="detail-item"><div class="detail-key">Score</div><div class="detail-val">${inspection.compliance_score != null ? `${Math.round(inspection.compliance_score * 100)}%` : '—'}</div></div>
            <div class="detail-item"><div class="detail-key">Date</div><div class="detail-val">${fmtDate(inspection.inspection_date)}</div></div>
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
      <div class="card-body"><div class="images-grid">${imageCards}</div></div>
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
