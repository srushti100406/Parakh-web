// PARAKH - National Sovereign Registry Portal Engine & Web UI Application Logic

import {
  INITIAL_OFFICER_PROFILE,
  RECENT_INSPECTIONS,
  INITIAL_EXTRACTED_FIELDS,
  INITIAL_DOSSIERS,
  AUDIT_CHECKS
} from './data.js';

// Application State
const state = {
  isLoggedIn: true,
  currentView: 'dashboard', // auth, dashboard, dossier, queue, profile
  officer: { ...INITIAL_OFFICER_PROFILE },
  inspections: [...RECENT_INSPECTIONS],
  extractedFields: JSON.parse(JSON.stringify(INITIAL_EXTRACTED_FIELDS)),
  dossiers: [...INITIAL_DOSSIERS],
  auditChecks: [...AUDIT_CHECKS],
  activeDossierFilter: 'ALL', // ALL, OPEN, UNDER_REVIEW, RESOLVED
  selectedDossierId: 'PRAK-2026-002',
  searchQuery: '',
  telemetryProgress: 75,
  telemetryInterval: null,
  activeInspectionImage: '/assets/shakti_bhog_atta.jpg',
  activeInspectionName: 'Fortified Atta 5kg',
  assignModalDossier: null,
  notificationCount: 3,
  toastMessage: null
};

// Render Router
function render() {
  const app = document.getElementById('app');
  if (!app) return;

  if (!state.isLoggedIn) {
    app.innerHTML = renderAuthView();
    bindAuthEvents();
    return;
  }

  app.innerHTML = `
    <div class="app-container">
      ${renderSidebar()}
      <div class="main-wrapper">
        ${state.currentView === 'dashboard' ? '' : renderHeader()}
        <main class="view-content" id="view-container">
          ${renderCurrentView()}
        </main>
      </div>
    </div>
    ${state.toastMessage ? renderToast() : ''}
  `;

  bindGlobalEvents();
  bindCurrentViewEvents();
}

// 1. Auth View Component
function renderAuthView() {
  return `
    <div class="auth-page">
      <div class="auth-card-container">
        <div class="auth-card">
          <div class="portal-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            NATIONAL SOVEREIGN REGISTRY PORTAL
          </div>
          
          <div class="emblem-icon-lg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          
          <h1 class="auth-title">PARAKH</h1>
          <p class="auth-subtitle">Welcome to Parakh</p>
          <p class="auth-motto">INSPECT • VERIFY • COMPLY</p>
          
          <form id="auth-form" onsubmit="event.preventDefault();">
            <div class="form-group">
              <div class="form-label-row">
                <label class="form-label">OFFICIAL INSPECTOR ID</label>
                <span class="form-badge">GOV IDENTITY</span>
              </div>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><line x1="15" y1="8" x2="17" y2="8"/><line x1="15" y1="12" x2="17" y2="12"/></svg>
                </span>
                <input type="text" id="input-inspector-id" class="form-input" value="${state.officer.email}" required />
                <span class="input-suffix" style="color: var(--status-compliant);">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </span>
              </div>
            </div>

            <div class="form-group">
              <div class="form-label-row">
                <label class="form-label">PASSPHRASE</label>
                <span class="form-badge">PIN / CRYPTOGRAPHIC KEY</span>
              </div>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input type="password" id="input-password" class="form-input" value="••••••••••••" required />
                <span class="input-suffix" id="btn-toggle-password">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </span>
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" checked id="check-remember" style="accent-color: var(--primary-rust);" />
                <span>Remember session</span>
              </label>
              <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">12h Token</span>
            </div>

            <button type="submit" id="btn-submit-login" class="btn-primary">
              <span>LOGIN</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </form>

          <div class="auth-help-card">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary-rust); flex-shrink: 0;"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div>
              <strong>Need inspector account access?</strong><br/>
              <span style="font-size: 12px; color: var(--primary-rust);">Contact State Nodal Officer ↗</span>
            </div>
          </div>

          <div class="notice-card">
            <div class="notice-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              STATUTORY COMPLIANCE NOTICE
            </div>
            <p>Authorized verification access under Section 42(A) of the National Standards & Audit Act (NSA-2023). Unauthorized login attempts, session interception, or data manipulation are strictly prohibited and subject to legal prosecution.</p>
            <div style="margin-top: 8px; font-family: var(--font-mono); font-size: 11px; color: var(--primary-rust);">
              • Node: ${state.officer.security.nodeId} SSL 256-bit GovNet
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 2. Sidebar Component
function renderSidebar() {
  return `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand-row">
          <div class="brand-logo-badge">P</div>
          <div>
            <div class="brand-title">PARAKH</div>
            <div class="brand-sub">GOVT OF INDIA</div>
          </div>
        </div>
      </div>

      <div class="sidebar-officer-card">
        <div class="officer-avatar">RS</div>
        <div class="officer-info">
          <div class="officer-name">${state.officer.name}</div>
          <div class="officer-id">${state.officer.inspectorId}</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a class="nav-item ${state.currentView === 'dashboard' ? 'active' : ''}" data-view="dashboard">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Dashboard</span>
        </a>

        <a class="nav-item ${state.currentView === 'queue' ? 'active' : ''}" data-view="queue">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <span>Active Dossiers</span>
          <span class="badge-count">12</span>
        </a>

        <a class="nav-item ${state.currentView === 'dossier' ? 'active' : ''}" data-view="dossier">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <span>Audit Dossier</span>
        </a>

        <a class="nav-item ${state.currentView === 'profile' ? 'active' : ''}" data-view="profile">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Officer Settings</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="node-status-row">
          <div class="pulse-dot"></div>
          <span>SOVEREIGN NODE ONLINE</span>
        </div>
        <div style="font-family: var(--font-mono); font-size: 10px;">NODE: ${state.officer.security.nodeId}</div>
      </div>
    </aside>
  `;
}

// 3. Top Header Component
function renderHeader() {
  return `
    <header class="top-header">
      <div class="header-left">
        <h1 class="page-title">${getHeaderTitle()}</h1>
      </div>

      <div class="header-search">
        <input type="text" placeholder="Search products, SKU, complaints..." value="${state.searchQuery}" id="header-search-input" />
      </div>

      <div class="header-right">
        <button id="btn-logout" title="Logout Secure Session" style="color: var(--text-muted); cursor: pointer; padding: 6px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </header>
  `;
}

function getHeaderTitle() {
  switch (state.currentView) {
    case 'dashboard': return 'Inspector Command Center';
    case 'dossier': return 'Legal Metrology Inspection Dossier';
    case 'queue': return 'State Enforcement Feed & Complaints';
    case 'profile': return 'Officer Profile & System Controls';
    default: return 'PARAKH Portal';
  }
}

// Render Active View Content
function renderCurrentView() {
  switch (state.currentView) {
    case 'dashboard': return renderDashboardView();
    case 'dossier': return renderDossierView();
    case 'queue': return renderQueueView();
    case 'profile': return renderProfileView();
    default: return renderDashboardView();
  }
}

// VIEW 1: Dashboard View (Screenshots 2 & 3)
function renderDashboardView() {
  return `
    <div class="dashboard-grid">
      <!-- Officer Header Banner -->
      <div class="officer-banner">
        <div class="banner-left">
          <h2>Good Morning, Inspector</h2>
        </div>
      </div>

      <!-- Regulatory Inflow Triage Row -->
      <div>
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.5px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; display: flex; justify-content: space-between;">
          <span>REGULATORY INFLOW TRIAGE</span>
          <span style="color: var(--primary-rust);">Today's Docket</span>
        </div>
        
        <div class="stats-triage-row">
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-title">TOTAL FILED</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-muted);"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
            </div>
            <div class="stat-val">48</div>
            <div class="stat-sub">Total Filed Inspections</div>
          </div>

          <div class="stat-card reviewed">
            <div class="stat-header">
              <span class="stat-title">REVIEWED</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--status-compliant);"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="stat-val">36</div>
            <div class="stat-sub">Audit Approved</div>
          </div>

          <div class="stat-card urgent">
            <div class="stat-header">
              <span class="stat-title">URGENT</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--status-noncompliant);"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            </div>
            <div class="stat-val">12</div>
            <div class="stat-sub">Pending Field Action</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-title">COMPLIANCE RATE</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary-rust);"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/></svg>
            </div>
            <div class="stat-val">75%</div>
            <div class="stat-sub">Pass Threshold</div>
          </div>
        </div>
      </div>

      <!-- Citizen Escalation Banner -->
      <div class="escalation-banner" data-view="queue">
        <div class="escalation-left">
          <div class="icon-box-danger">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
          <div>
            <div style="font-size: 15px; font-weight: 800; color: var(--status-noncompliant);">
              12 Open Complaints • Citizen Escalation Queue
            </div>
            <div style="font-size: 12px; color: var(--text-body);">
              Tap to review consumer grievances, illegal price markup & field escalations →
            </div>
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--status-noncompliant);"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>

      <!-- Recent Inspections List -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-title">
            <span>RECENT INSPECTIONS</span>
            <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: var(--bg-cream-dark); color: var(--primary-rust); font-weight: 700;">3 NEW</span>
          </div>
          <a class="link-btn" data-view="queue">
            <span>VIEW LOGBOOK</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>

        <div class="inspection-list">
          ${state.inspections.map(item => `
            <div class="inspection-item-card">
              <img src="${item.image}" alt="${item.productName}" class="product-thumb" />
              <div class="inspection-info">
                <div class="inspection-title-row">
                  <span class="product-name">${item.productName}</span>
                  <span class="verdict-tag ${item.verdict.toLowerCase().replace(' ', '-')}">${item.verdict}</span>
                </div>
                <div class="inspection-meta">
                  <span>Batch: ${item.batch} // SKU #${item.sku}</span>
                  <span>•</span>
                  <span>${item.date}</span>
                </div>
                ${item.violationNotice ? `
                  <div class="inspection-sub-notice">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>${item.violationNotice}</span>
                  </div>
                ` : `
                  <div style="font-size: 11px; font-weight: 700; color: var(--status-compliant);">
                    ✓ ${item.rulesTag}
                  </div>
                `}
              </div>
              <button class="btn-primary btn-view-dossier" data-id="${item.id}" style="width: auto; padding: 8px 16px; font-size: 12px;">
                <span>View Dossier</span>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// VIEW 2: Inspection Studio (Screenshot 4)
function renderStudioView() {
  return `
    <div class="studio-grid">
      <!-- Camera Scanner Viewfinder -->
      <div class="viewfinder-card">
        <div class="viewfinder-header">
          <div class="ocr-active-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
            <span>OCR ACTIVE 99.4%</span>
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="control-btn" title="Grid Overlay">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
            </button>
            <button class="control-btn" title="Refresh">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </button>
          </div>
        </div>

        <div class="viewfinder-stage">
          <img src="${state.activeInspectionImage}" alt="Product Scan" class="viewfinder-img" id="scanner-viewfinder-img" />
          
          <!-- Bounding Boxes Overlays -->
          <div class="bounding-box" style="top: 140px; left: 40px; width: 180px; height: 35px;">
            <span class="bounding-tag">✓ FSSAI / RULE 9 RECOGNIZED</span>
          </div>
          
          <div class="bounding-box" style="top: 280px; left: 50px; width: 120px; height: 40px;">
            <span class="bounding-tag">✓ MRP ₹260.00 PARSED</span>
          </div>
        </div>

        <div style="margin-top: 16px; font-size: 13px; color: #FFCC80; font-weight: 600; display: flex; align-items: center; gap: 6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10M7 12h10M7 17h10"/></svg>
          Align package inside the frame to capture Legal Metrology declarations
        </div>

        <div class="camera-controls">
          <button class="control-btn" id="btn-upload-file" title="Upload Image File">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </button>

          <button class="control-btn main-scan" id="btn-trigger-scan" title="Start Telemetry Inspection">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
          </button>

          <button class="control-btn" id="btn-toggle-torch" title="Torch Light">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          </button>
        </div>

        <input type="file" id="file-input-hidden" accept="image/*" style="display: none;" />
      </div>

      <!-- Right Calibration Parameters Panel -->
      <div class="studio-panel">
        <div class="params-card">
          <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.5px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; display: flex; justify-content: space-between;">
            <span>CALIBRATION PARAMETERS</span>
            <span style="color: var(--primary-rust);">ISO 17020 ENGINE</span>
          </div>

          <div class="param-row">
            <span class="param-label">LINGUISTIC SYNC</span>
            <span class="param-value">EN / HI</span>
          </div>

          <div class="param-row">
            <span class="param-label">TARGET FOCUS</span>
            <span class="param-value">Rule 9 + FSSAI</span>
          </div>

          <div class="param-row">
            <span class="param-label">CONFIDENCE THRESHOLD</span>
            <span class="param-value" style="color: var(--status-compliant);">99.4%</span>
          </div>

          <div class="param-row">
            <span class="param-label">NEURAL MATRIX ENGINE</span>
            <span class="param-value">v4.2-RELEASE</span>
          </div>
        </div>

        <div class="params-card">
          <h4 style="font-size: 14px; font-weight: 800; color: var(--text-dark); margin-bottom: 8px;">Select Test Sample</h4>
          <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">Switch between pre-loaded package samples for verification test:</p>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="btn-primary btn-sample-select" data-img="/assets/shakti_bhog_atta.jpg" data-name="Fortified Atta 5kg" style="background: var(--bg-cream); color: var(--text-dark); border: 1px solid var(--card-border); justify-content: flex-start; padding: 10px 14px;">
              <img src="/assets/shakti_bhog_atta.jpg" style="width: 24px; height: 24px; border-radius: 4px; object-fit: cover;" />
              <span>Fortified Atta 5kg</span>
            </button>

            <button class="btn-primary btn-sample-select" data-img="/assets/sunrise_turmeric.jpg" data-name="Sunrise Turmeric Powder 500g" style="background: var(--bg-cream); color: var(--text-dark); border: 1px solid var(--card-border); justify-content: flex-start; padding: 10px 14px;">
              <img src="/assets/sunrise_turmeric.jpg" style="width: 24px; height: 24px; border-radius: 4px; object-fit: cover;" />
              <span>Sunrise Turmeric Powder 500g</span>
            </button>

            <button class="btn-primary btn-sample-select" data-img="/assets/aashirvaad_ghee.jpg" data-name="Aashirvaad Pure Ghee 1L" style="background: var(--bg-cream); color: var(--text-dark); border: 1px solid var(--card-border); justify-content: flex-start; padding: 10px 14px;">
              <img src="/assets/aashirvaad_ghee.jpg" style="width: 24px; height: 24px; border-radius: 4px; object-fit: cover;" />
              <span>Aashirvaad Pure Ghee 1L</span>
            </button>
          </div>
        </div>

        <button class="btn-primary" id="btn-run-analysis-now">
          <span>Run Analysis Pipeline →</span>
        </button>
      </div>
    </div>
  `;
}

// VIEW 3: Telemetry View (Screenshot 5)
function renderTelemetryView() {
  return `
    <div class="telemetry-card">
      <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: var(--radius-pill); background: var(--status-warning-bg); color: var(--status-warning); font-size: 11px; font-weight: 700; margin-bottom: 16px;">
        <span class="pulse-dot" style="background: var(--status-warning);"></span>
        <span>TELEMETRY STREAM ACTIVE</span>
      </div>

      <h2 style="font-size: 26px; font-weight: 800; color: var(--text-dark); margin-bottom: 4px;">Processing</h2>
      <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 24px;">Analyzing product package information & Legal Metrology declarations...</p>

      <!-- Radial Progress Circle -->
      <div class="gauge-circle" id="telemetry-gauge">
        <div class="gauge-inner">
          <div class="gauge-percent" id="telemetry-percent">${state.telemetryProgress}%</div>
          <div class="gauge-label">COMPLETED</div>
          <div style="font-family: var(--font-mono); font-size: 10px; color: var(--primary-rust); font-weight: 700;">CAL-99.82Hz</div>
        </div>
      </div>

      <div class="pipeline-stats">
        <div><span>QUANTUM SCAN INDEX:</span> <strong>2,960 / 4,000 pts</strong></div>
        <div><span>FPS:</span> <strong>58.4</strong></div>
        <div><span>OCR:</span> <strong>142 glyphs/sec</strong></div>
      </div>

      <!-- Audit Protocol Stages Timeline -->
      <div class="audit-stages-list">
        <div class="stage-item">
          <div class="stage-icon">✓</div>
          <div>
            <div class="stage-title">1. Image sent to Cloud <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin-left: 8px;">312ms</span></div>
            <div class="stage-sub">Sovereign cloud gateway node authenticated</div>
          </div>
        </div>

        <div class="stage-item">
          <div class="stage-icon">✓</div>
          <div>
            <div class="stage-title">2. Text extraction - OCR <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin-left: 8px;">480ms</span></div>
            <div class="stage-sub">Lexical parsing & spatial bounding matrices verified</div>
          </div>
        </div>

        <div class="stage-item evaluating">
          <div class="stage-icon">⚙</div>
          <div>
            <div class="stage-title">3. Compliance checks <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: var(--status-warning-bg); color: var(--status-warning); font-weight: 700; margin-left: 8px;">EVALUATING</span></div>
            <div class="stage-sub">Matching Legal Metrology & FSSAI 2026 rules matrix...</div>
          </div>
        </div>

        <div class="stage-item queued">
          <div class="stage-icon">4</div>
          <div>
            <div class="stage-title">4. Generating Result <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: var(--bg-cream-dark); color: var(--text-muted); font-weight: 700; margin-left: 8px;">QUEUED</span></div>
            <div class="stage-sub">Cryptographic seal signature generation</div>
          </div>
        </div>
      </div>

      <div style="background: var(--card-cream-bg); border-radius: var(--radius-md); padding: 14px; margin-bottom: 24px; font-size: 12px; color: var(--text-dark); text-align: left; border-left: 4px solid var(--primary-rust);">
        <strong>🔒 CRYPTOGRAPHIC AUDIT LOCK</strong><br/>
        <span style="color: var(--text-muted);">Active cryptographic audit lock: Do not switch background applications. Session payload is anchored with hardware-backed attestation.</span><br/>
        <span style="font-family: var(--font-mono); font-size: 11px; color: var(--primary-rust);">SESSION: #7FA0-90DC NONCE: 981103</span>
      </div>

      <button class="btn-primary" id="btn-cancel-telemetry" style="background: transparent; color: var(--status-noncompliant); border: 1px solid var(--status-noncompliant-border); box-shadow: none;">
        <span>✕ CANCEL FIELD VERIFICATION</span>
      </button>
    </div>
  `;
}

// VIEW 4: Extraction Review Form (Screenshot 6)
function renderExtractionView() {
  return `
    <div class="extraction-grid">
      <!-- Left Side: Product Image & OCR Preview -->
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="section-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--status-compliant);">
              ✓ OCR TELEMETRY STREAM • 20/20 CAPTURED
            </div>
          </div>

          <div style="position: relative; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--card-border);">
            <img src="${state.activeInspectionImage}" alt="Extracted Package" style="width: 100%; height: 360px; object-fit: cover;" />
            <div style="position: absolute; bottom: 12px; left: 12px; background: rgba(0,0,0,0.8); color: #FFFFFF; font-family: var(--font-mono); font-size: 11px; padding: 4px 10px; border-radius: 4px;">
              INTAKE HASH: SHA256/7b19e04cfa12
            </div>
          </div>
        </div>

        <div class="section-card">
          <h4 style="font-size: 15px; font-weight: 800; color: var(--text-dark); margin-bottom: 8px;">Compliance Actions</h4>
          <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">Review all 20 Legal Metrology extracted declarations before finalizing compliance audit verdict.</p>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button class="btn-primary" id="btn-execute-compliance-check">
              <span>CHECK COMPLIANCE & GENERATE DOSSIER →</span>
            </button>

            <button class="btn-primary" id="btn-direct-complaint" style="background: #FFFFFF; color: var(--status-noncompliant); border: 1.5px solid var(--status-noncompliant-border); box-shadow: none;">
              <span>⚠️ FILE COMPLAINT DIRECTLY</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right Side: 20 Legal Metrology Extracted Fields Form -->
      <div class="extracted-form-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h3 style="font-size: 18px; font-weight: 800; color: var(--text-dark);">Please Review the Extracted Information</h3>
            <p style="font-size: 12px; color: var(--text-muted);">Information detected from package OCR intake</p>
          </div>
        </div>

        <form id="extracted-data-form" onsubmit="event.preventDefault();">
          ${state.extractedFields.map(field => `
            ${field.section ? `
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.8px; color: var(--primary-rust); text-transform: uppercase; margin: 20px 0 10px; padding-top: 10px; border-top: 2px solid var(--card-cream-bg);">
                ${field.section}
              </div>
            ` : ''}
            
            <div class="field-group">
              <div class="field-label">
                <span>${field.label}</span>
                ${field.badge ? `<span style="color: var(--primary-rust); font-weight: 700;">${field.badge}</span>` : ''}
              </div>
              
              <input type="text" class="field-value-input" data-id="${field.id}" value="${field.value}" />
              
              ${field.standard ? `
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                  ${field.standard}
                </div>
              ` : ''}

              ${field.warningText ? `
                <div style="font-size: 11px; font-weight: 700; color: var(--status-warning); margin-top: 4px; display: flex; align-items: center; gap: 4px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                  ${field.warningText}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </form>
      </div>
    </div>
  `;
}

// VIEW 5: Dossier Report View (Screenshot 7)
function getSelectedDossier() {
  return state.dossiers.find(d => d.id === state.selectedDossierId) || state.dossiers[0];
}

function renderDossierView() {
  const dossier = getSelectedDossier();

  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <!-- Verdict Top Banner -->
      <div class="dossier-header-banner">
        <div class="verdict-large-badge">
          <div class="verdict-icon-lg">✕</div>
          <div>
            <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: var(--text-muted); text-transform: uppercase;">VERDICT STATUS</div>
            <div class="verdict-title">${dossier.status === 'RESOLVED' ? 'RESOLVED' : 'NON-COMPLIANT'}</div>
            <div class="verdict-subtitle">${dossier.assignedOfficer ? 'FIELD REVIEW ACTIVE' : 'PENALTY RISK: CLASS B'}</div>
          </div>
        </div>

        <div class="score-donut-box">
          <div>
            <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.5px; color: var(--text-muted);">OVERALL COMPLIANCE INDEX</div>
            <div style="font-size: 12px; color: var(--text-body);">${dossier.description}</div>
          </div>
          <div class="score-num">${dossier.status === 'RESOLVED' ? '94%' : '72%'}</div>
        </div>
      </div>

      <!-- Main Dossier Content Split -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        <!-- Left Column: Visual Heatmap & Details -->
        <div class="section-card">
          <div class="section-title" style="margin-bottom: 14px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary-rust);"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Highlighted Invalid Information</span>
            <span style="font-size: 10px; padding: 2px 8px; border-radius: var(--radius-pill); background: var(--status-noncompliant-bg); color: var(--status-noncompliant); font-weight: 800;">1 VIOLATION</span>
          </div>

          <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">Audit dossier for ${dossier.title}.</p>

          <!-- Heatmap Image Container -->
          <div class="heatmap-container">
            <img src="${dossier.image}" alt="Annotated Heatmap" class="heatmap-img" />
            
            <div class="heatmap-callout warning" style="bottom: 25%; right: 15%;">
              ⚠️ WARNING: Font Height 2.8mm<br/>
              <span style="font-size: 10px; font-weight: 500;">Required min: 4.0mm</span>
            </div>
          </div>

          <div style="margin-top: 20px; font-size: 13px; color: var(--text-body);">
            <strong>Food Product:</strong> Fortified Wheat Flour (Atta)<br/>
            <span style="font-size: 12px; color: var(--text-muted);">Statutory Framework: Legal Metrology (Packaged Commodities) Rules 2011 & FSSAI Standards 2026.</span>
          </div>
        </div>

        <!-- Right Column: Compliance Audit Checks Matrix -->
        <div class="section-card">
          <div class="section-title" style="margin-bottom: 14px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary-rust);"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <span>Compliance Audit Checks</span>
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">6 PARAMETERS</span>
          </div>

          <table class="checks-table">
            <thead>
              <tr>
                <th>Rule Metric</th>
                <th>Status</th>
                <th>Reason / Observation</th>
              </tr>
            </thead>
            <tbody>
              ${state.auditChecks.map(check => `
                <tr>
                  <td>
                    <strong style="color: var(--text-dark);">${check.title}</strong><br/>
                    <span style="font-size: 11px; color: var(--text-muted);">Det: ${check.detected}</span>
                  </td>
                  <td>
                    <span class="verdict-tag ${check.status.toLowerCase()}">${check.status}</span>
                  </td>
                  <td style="font-size: 12px; color: var(--text-body);">
                    ${check.reason}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- SHA256 Audit Registry Box -->
          <div style="margin-top: 20px; padding: 14px; background: var(--card-cream-bg); border-radius: var(--radius-md); border-left: 4px solid var(--primary-rust);">
            <div style="font-size: 11px; font-weight: 800; color: var(--primary-rust); letter-spacing: 0.5px;">CERTIFIED AUDIT REGISTRY</div>
            <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-dark); word-break: break-all; margin-top: 2px;">
              HASH: SHA256/7b19e04cfa12
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Authorized enforcement record under Central Enforcement Portal.</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons Row -->
      <div style="display: flex; gap: 16px; justify-content: flex-end;">
        <button class="btn-primary" id="btn-print-dossier" style="width: auto; background: var(--bg-cream-dark); color: var(--text-dark); border: 1px solid var(--card-border); box-shadow: none;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          <span>Export PDF / Print</span>
        </button>

        <button class="btn-primary" id="btn-dossier-file-complaint" style="width: auto; background: var(--status-noncompliant);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 1 1.71 3h16.94a2 2 0 0 1 1.71-3L13.71 3.86a2 2 0 0 1-3.42 0z"/></svg>
          <span>File Official Complaint</span>
        </button>

        <button class="btn-primary" data-view="dashboard" style="width: auto;">
          <span>← Back to Dashboard</span>
        </button>
      </div>
    </div>
  `;
}

// VIEW 6: Enforcement Queue / Active Dossiers (Screenshot 8)
function renderQueueView() {
  const totalDossiers = state.dossiers.length;
  const openCount = state.dossiers.filter(d => d.status === 'OPEN').length;
  const underReviewCount = state.dossiers.filter(d => d.status === 'UNDER REVIEW').length;
  const resolvedCount = state.dossiers.filter(d => d.status === 'RESOLVED').length;

  const filtered = state.dossiers.filter(d => {
    if (state.activeDossierFilter === 'OPEN') return d.status === 'OPEN';
    if (state.activeDossierFilter === 'UNDER_REVIEW') return d.status === 'UNDER REVIEW';
    if (state.activeDossierFilter === 'RESOLVED') return d.status === 'RESOLVED';
    return true;
  });

  return `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <!-- Queue Header Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <h2 style="font-size: 22px; font-weight: 800; color: var(--text-dark);">State Enforcement Feed</h2>
            <span style="font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: var(--radius-pill); background: var(--status-warning-bg); color: var(--status-warning);">${totalDossiers} ACTIVE DOSSIERS</span>
          </div>
          <p style="font-size: 12px; color: var(--text-muted);">CENTRAL INTAKE QUEUE • REAL-TIME SYNC (UTC+05:30)</p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div style="display: flex; gap: 10px; border-bottom: 2px solid var(--card-border); padding-bottom: 10px;">
        <button class="btn-primary filter-tab ${state.activeDossierFilter === 'ALL' ? 'active-tab' : ''}" data-filter="ALL" style="width: auto; padding: 8px 18px; font-size: 13px; background: ${state.activeDossierFilter === 'ALL' ? 'var(--primary-rust)' : 'var(--bg-cream)'}; color: ${state.activeDossierFilter === 'ALL' ? '#FFF' : 'var(--text-dark)'};">
          All (${totalDossiers})
        </button>

        <button class="btn-primary filter-tab ${state.activeDossierFilter === 'OPEN' ? 'active-tab' : ''}" data-filter="OPEN" style="width: auto; padding: 8px 18px; font-size: 13px; background: ${state.activeDossierFilter === 'OPEN' ? 'var(--primary-rust)' : 'var(--bg-cream)'}; color: ${state.activeDossierFilter === 'OPEN' ? '#FFF' : 'var(--text-dark)'};">
          Open (${openCount})
        </button>

        <button class="btn-primary filter-tab ${state.activeDossierFilter === 'UNDER_REVIEW' ? 'active-tab' : ''}" data-filter="UNDER_REVIEW" style="width: auto; padding: 8px 18px; font-size: 13px; background: ${state.activeDossierFilter === 'UNDER_REVIEW' ? 'var(--primary-rust)' : 'var(--bg-cream)'}; color: ${state.activeDossierFilter === 'UNDER_REVIEW' ? '#FFF' : 'var(--text-dark)'};">
          Under Review (${underReviewCount})
        </button>

        <button class="btn-primary filter-tab ${state.activeDossierFilter === 'RESOLVED' ? 'active-tab' : ''}" data-filter="RESOLVED" style="width: auto; padding: 8px 18px; font-size: 13px; background: ${state.activeDossierFilter === 'RESOLVED' ? 'var(--primary-rust)' : 'var(--bg-cream)'}; color: ${state.activeDossierFilter === 'RESOLVED' ? '#FFF' : 'var(--text-dark)'};">
          Resolved (${resolvedCount})
        </button>
      </div>

      <!-- Dossier List Cards -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${filtered.map(dossier => `
          <div class="section-card" style="border-left: 4px solid ${dossier.priority.includes('HIGH') ? 'var(--status-noncompliant)' : dossier.priority.includes('MEDIUM') ? 'var(--status-warning)' : 'var(--status-compliant)'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                  <span style="font-family: var(--font-mono); font-weight: 700; font-size: 13px; color: var(--primary-rust);">#${dossier.id}</span>
                  <span style="font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; background: var(--bg-cream-dark); color: var(--text-muted);">${dossier.subDiv}</span>
                  <span class="verdict-tag ${dossier.priority.includes('HIGH') ? 'non-compliant' : dossier.priority.includes('MEDIUM') ? 'warning' : 'compliant'}">${dossier.priority}</span>
                </div>
                <h3 style="font-size: 16px; font-weight: 800; color: var(--text-dark);">${dossier.title}</h3>
              </div>

              <span class="verdict-tag ${dossier.status === 'OPEN' ? 'non-compliant' : dossier.status === 'UNDER REVIEW' ? 'warning' : 'compliant'}">
                ${dossier.statusText}
              </span>
            </div>

            <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px;">
              <img src="${dossier.image}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 1px solid var(--card-border);" />
              <div style="flex: 1;">
                <p style="font-size: 13px; color: var(--text-body); margin-bottom: 4px;">⚠️ ${dossier.description}</p>
                <div style="font-size: 12px; color: var(--text-muted); display: flex; gap: 14px;">
                  <span>🕒 ${dossier.time}</span>
                  ${dossier.assignedOfficer ? `<span style="font-weight: 600; color: var(--primary-rust);">👤 ${dossier.assignedOfficer}</span>` : ''}
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px;">
              <button class="btn-primary btn-view-dossier" data-dossier-id="${dossier.id}" style="width: auto; padding: 8px 16px; background: var(--bg-cream-dark); color: var(--text-dark); border: 1px solid var(--card-border); box-shadow: none;">
                <span>View Details</span>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// VIEW 7: Officer Profile & Settings (Screenshot 9)
function renderProfileView() {
  return `
    <div style="max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
      <!-- Officer Profile Header Card -->
      <div class="section-card" style="text-align: center; padding: 32px;">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--primary-rust); color: #FFFFFF; font-size: 28px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; border: 3px solid #FFCC80; box-shadow: var(--shadow-md);">
          RS
        </div>

        <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: var(--radius-pill); background: var(--status-compliant-bg); color: var(--status-compliant); font-size: 11px; font-weight: 700; margin-bottom: 8px;">
          <span class="pulse-dot"></span>
          <span>ACTIVE INSPECTOR • Live Node</span>
        </div>

        <h2 style="font-size: 22px; font-weight: 800; color: var(--text-dark);">${state.officer.name}</h2>
        <div style="font-family: var(--font-mono); font-size: 13px; color: var(--primary-rust); font-weight: 700; margin-bottom: 4px;">${state.officer.email}</div>
        <div style="font-size: 12px; color: var(--text-muted);">${state.officer.inspectorId} • ${state.officer.role}</div>
        <div style="font-size: 12px; color: var(--text-muted);">${state.officer.ministry} • ${state.officer.zone}</div>

        <!-- 3-Column Stats Grid -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--card-border);">
          <div>
            <div style="font-size: 24px; font-weight: 800; color: var(--text-dark);">${state.officer.stats.inspections.toLocaleString()}</div>
            <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">INSPECTIONS</div>
          </div>

          <div>
            <div style="font-size: 24px; font-weight: 800; color: var(--status-compliant);">${state.officer.stats.sealIntegrity}%</div>
            <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">SEAL INTEGRITY</div>
          </div>

          <div>
            <div style="font-size: 24px; font-weight: 800; color: var(--primary-rust);">0${state.officer.stats.syncQueue}</div>
            <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">SYNC QUEUE</div>
          </div>
        </div>
      </div>

      <!-- Account Operations List -->
      <div class="section-card">
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.5px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; display: flex; justify-content: space-between;">
          <span>ACCOUNT OPERATIONS</span>
          <span style="color: var(--primary-rust);">TIER-1 ACCESS</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button class="btn-primary" id="btn-edit-profile" style="background: var(--bg-cream); color: var(--text-dark); border: 1px solid var(--card-border); justify-content: space-between; padding: 14px 18px; box-shadow: none;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary-rust);"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <div style="text-align: left;">
                <div style="font-weight: 700;">Edit Profile Details</div>
                <div style="font-size: 11px; color: var(--text-muted);">Official contact & desk coordinates</div>
              </div>
            </div>
            <span>›</span>
          </button>

          <button class="btn-primary" id="btn-change-pin" style="background: var(--bg-cream); color: var(--text-dark); border: 1px solid var(--card-border); justify-content: space-between; padding: 14px 18px; box-shadow: none;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary-rust);"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <div style="text-align: left;">
                <div style="font-weight: 700;">Change Security PIN</div>
                <div style="font-size: 11px; color: var(--text-muted);">6-digit cryptographic field token</div>
              </div>
            </div>
            <span>›</span>
          </button>

          <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; background: var(--bg-cream); border-radius: var(--radius-md); border: 1px solid var(--card-border);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary-rust);"><path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04c.054-.19.088-.387.088-.592 0-.206-.034-.404-.089-.594m2.096-7.85c-.322.254-.67.48-1.042.678m-.286-4.51c.712.197 1.378.498 1.978.895m-2.92-3.14c.797.106 1.558.33 2.261.663m-5.068 1.3c.725.26 1.408.618 2.03 1.06M3 7.5A10.5 10.5 0 0 1 13.5 18"/></svg>
              <div>
                <div style="font-weight: 700; font-size: 14px;">Biometric Authorization</div>
                <div style="font-size: 11px; color: var(--text-muted);">Fast audit seal confirmation</div>
              </div>
            </div>

            <input type="checkbox" id="toggle-biometric" ${state.officer.security.biometricEnabled ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--primary-rust);" />
          </div>
        </div>
      </div>

      <!-- Regulatory Node Info -->
      <div class="section-card">
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.5px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 14px; display: flex; justify-content: space-between;">
          <span>REGULATORY NODE INFO</span>
          <span style="color: var(--primary-rust);">CLUSTER #09</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--bg-cream); border-radius: 6px;">
            <div>
              <strong>Parakh Engine</strong><br/>
              <span style="font-size: 11px; color: var(--text-muted);">Rulebook Matrix: Legal Metrology 2026</span>
            </div>
            <span style="font-family: var(--font-mono); font-size: 11px; padding: 2px 8px; border-radius: 4px; background: var(--primary-rust-light); color: var(--primary-rust); font-weight: 700;">${state.officer.security.engineVersion}</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--bg-cream); border-radius: 6px;">
            <div>
              <strong>Sovereign Node Hash</strong><br/>
              <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-dark);">${state.officer.security.sovereignHash}</span>
            </div>
            <span style="font-family: var(--font-mono); font-size: 10px; padding: 2px 8px; border-radius: 4px; background: var(--status-compliant-bg); color: var(--status-compliant); font-weight: 700;">SHA-256 SYNCED</span>
          </div>
        </div>
      </div>

      <button class="btn-primary" id="btn-logout-full" style="background: var(--status-noncompliant-bg); color: var(--status-noncompliant); border: 1px solid var(--status-noncompliant-border); box-shadow: none;">
        <span>🚪 Logout Secure Session</span>
      </button>

      <div style="text-align: center; font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
        🔒 TLS 256-bit Encrypted Sovereign Metrology Network<br/>
        PARAKH VERIFIED FIELD TERMINAL • GOVT. OF INDIA
      </div>
    </div>
  `;
}

// Toast Notification
function renderToast() {
  return `
    <div style="position: fixed; bottom: 24px; right: 24px; background: var(--text-dark); color: #FFFFFF; padding: 14px 20px; border-radius: var(--radius-md); font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 10px; box-shadow: var(--shadow-lg); z-index: 1000;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #00E676;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <span>${state.toastMessage}</span>
    </div>
  `;
}

function showToast(msg) {
  state.toastMessage = msg;
  render();
  setTimeout(() => {
    state.toastMessage = null;
    render();
  }, 3500);
}

// Event Bindings
function bindGlobalEvents() {
  // Navigation view clicks
  document.querySelectorAll('[data-view]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = el.getAttribute('data-view');
      if (targetView) {
        state.currentView = targetView;
        render();
      }
    });
  });

  // Logout button
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      state.isLoggedIn = false;
      showToast('Logged out of PARAKH Sovereign Session.');
    });
  }

  // Header search input
  const searchInput = document.getElementById('header-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
    });
  }
}

function bindAuthEvents() {
  const form = document.getElementById('auth-form');
  if (form) {
    form.addEventListener('submit', () => {
      state.isLoggedIn = true;
      state.currentView = 'dashboard';
      showToast('Welcome back, Inspector R. Sharma!');
    });
  }

  const pwdToggle = document.getElementById('btn-toggle-password');
  if (pwdToggle) {
    pwdToggle.addEventListener('click', () => {
      const input = document.getElementById('input-password');
      if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
      }
    });
  }
}

function bindCurrentViewEvents() {
  // View Dossier buttons in Dashboard
  document.querySelectorAll('.btn-view-dossier').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dossierId = btn.getAttribute('data-dossier-id');
      if (dossierId) {
        state.selectedDossierId = dossierId;
        const selected = state.dossiers.find(d => d.id === dossierId);
        if (selected) {
          state.activeInspectionImage = selected.image;
        }
      }
      state.currentView = 'dossier';
      render();
    });
  });

  // Studio Scanner triggers
  const btnRunAnalysis = document.getElementById('btn-run-analysis-now');
  if (btnRunAnalysis) {
    btnRunAnalysis.addEventListener('click', () => {
      startTelemetryStream();
    });
  }

  const btnTriggerScan = document.getElementById('btn-trigger-scan');
  if (btnTriggerScan) {
    btnTriggerScan.addEventListener('click', () => {
      startTelemetryStream();
    });
  }

  // Sample package selection
  document.querySelectorAll('.btn-sample-select').forEach(btn => {
    btn.addEventListener('click', () => {
      const img = btn.getAttribute('data-img');
      const name = btn.getAttribute('data-name');
      if (img && name) {
        state.activeInspectionImage = img;
        state.activeInspectionName = name;
        showToast(`Loaded sample: ${name}`);
        render();
      }
    });
  });

  // File Upload trigger
  const btnUpload = document.getElementById('btn-upload-file');
  const hiddenInput = document.getElementById('file-input-hidden');
  if (btnUpload && hiddenInput) {
    btnUpload.addEventListener('click', () => hiddenInput.click());
    hiddenInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
          state.activeInspectionImage = evt.target.result;
          state.activeInspectionName = file.name;
          showToast(`Uploaded file: ${file.name}`);
          render();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Telemetry Cancel
  const btnCancelTel = document.getElementById('btn-cancel-telemetry');
  if (btnCancelTel) {
    btnCancelTel.addEventListener('click', () => {
      clearInterval(state.telemetryInterval);
      state.currentView = 'studio';
      showToast('Field verification aborted.');
    });
  }

  // Extraction Check Compliance Button
  const btnCheckComp = document.getElementById('btn-execute-compliance-check');
  if (btnCheckComp) {
    btnCheckComp.addEventListener('click', () => {
      state.currentView = 'dossier';
      showToast('Compliance audit calculated. Dossier generated!');
    });
  }

  const btnDirectComp = document.getElementById('btn-direct-complaint');
  if (btnDirectComp) {
    btnDirectComp.addEventListener('click', () => {
      state.currentView = 'queue';
      showToast('Formal complaint initialized in intake queue.');
    });
  }

  // Dossier Actions
  const btnPrint = document.getElementById('btn-print-dossier');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  const btnDossierComplaint = document.getElementById('btn-dossier-file-complaint');
  if (btnDossierComplaint) {
    btnDossierComplaint.addEventListener('click', () => {
      state.currentView = 'queue';
      showToast('Official complaint escalated to Central Enforcement Feed.');
    });
  }

  // Queue Filters
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.activeDossierFilter = tab.getAttribute('data-filter');
      render();
    });
  });

  // Profile actions
  const btnLogoutFull = document.getElementById('btn-logout-full');
  if (btnLogoutFull) {
    btnLogoutFull.addEventListener('click', () => {
      state.isLoggedIn = false;
      showToast('Secure Session Logged Out.');
    });
  }
}

function startTelemetryStream() {
  state.currentView = 'telemetry';
  state.telemetryProgress = 15;
  render();

  if (state.telemetryInterval) clearInterval(state.telemetryInterval);

  state.telemetryInterval = setInterval(() => {
    state.telemetryProgress += 20;
    if (state.telemetryProgress >= 100) {
      state.telemetryProgress = 100;
      clearInterval(state.telemetryInterval);
      setTimeout(() => {
        state.currentView = 'extraction';
        showToast('OCR extraction completed. Please review fields.');
      }, 500);
    } else {
      const gaugePercent = document.getElementById('telemetry-percent');
      const gaugeCircle = document.getElementById('telemetry-gauge');
      if (gaugePercent) gaugePercent.innerText = `${state.telemetryProgress}%`;
      if (gaugeCircle) gaugeCircle.style.background = `conic-gradient(var(--primary-rust) 0% ${state.telemetryProgress}%, var(--card-cream-bg) ${state.telemetryProgress}% 100%)`;
    }
  }, 400);
}

// Initial App Launch
document.addEventListener('DOMContentLoaded', () => {
  render();
});
