/**
 * PARAKH Admin Portal — Dashboard view
 */
import * as api from '../api.js';
import { navigate, escHtml, fmtDate, statusBadge, renderShell, loadingHtml, errorHtml, emptyHtml, bindShellEvents } from './shared.js';

export async function renderDashboard() {
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
      <td><button class="btn btn-ghost btn-sm view-inspection-btn" data-id="${escHtml(i.inspection_id)}">View</button></td>
    </tr>`).join('');

  document.getElementById('view-area').innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Admin Dashboard</div>
        <div class="page-subtitle">System-wide overview — real data</div>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card blue"><div class="stat-label">Total Inspectors</div><div class="stat-value">${stats.total_inspectors}</div><div class="stat-sub">${stats.active_inspectors} active, ${stats.inactive_inspectors} inactive</div></div>
      <div class="stat-card"><div class="stat-label">Total Inspections</div><div class="stat-value">${stats.total_inspections}</div><div class="stat-sub">${stats.pending_inspections} pending</div></div>
      <div class="stat-card green"><div class="stat-label">Compliant</div><div class="stat-value">${stats.compliant_inspections}</div><div class="stat-sub">Passed all checks</div></div>
      <div class="stat-card red"><div class="stat-label">Non-Compliant</div><div class="stat-value">${stats.non_compliant_inspections}</div><div class="stat-sub">Failed checks</div></div>
      <div class="stat-card amber"><div class="stat-label">Pending Review</div><div class="stat-value">${stats.pending_inspections}</div><div class="stat-sub">Awaiting ML / capture</div></div>
      <div class="stat-card"><div class="stat-label">Total Complaints</div><div class="stat-value">${stats.total_complaints}</div><div class="stat-sub">All complaints</div></div>
    </div>
    <div class="card" style="margin-top:4px;">
      <div class="card-header">
        <span class="card-title">Recent Inspections</span>
        <button class="btn btn-ghost btn-sm" data-nav="inspections">View All</button>
      </div>
      <div class="table-wrap" style="border:none;box-shadow:none;border-radius:0;">
        <table>
          <thead><tr><th>Inspection ID</th><th>Product</th><th>Inspector</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>${recentRows || `<tr><td colspan="6">${emptyHtml('No inspections yet')}</td></tr>`}</tbody>
        </table>
      </div>
    </div>`;

  bindShellEvents();
  document.querySelectorAll('.view-inspection-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate('inspection-detail', { id: btn.dataset.id }));
  });
}
