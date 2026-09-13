/**
 * PARAKH Admin Portal — Entry point & router
 *
 * Architecture: vanilla JS SPA, no framework, Vite bundler.
 * All views live in src/views/. This file is the entry point and router only.
 *
 * Split history:
 *   Before Q4: single 57 KB file.
 *   After  Q4: ~1 KB router + 5 view modules in src/views/.
 */

import './style.css';
import * as api from './api.js';

// ── View modules ──────────────────────────────────────────────────────────────
import { renderLogin } from './views/login.js';
import { renderDashboard } from './views/dashboard.js';
import {
  renderInspectors,
  renderInspectorDetail,
  renderCreateInspector,
} from './views/inspectors.js';
import { renderInspections, renderInspectionDetail } from './views/inspections.js';
import { renderComplaints } from './views/complaints.js';
import { state } from './views/shared.js';

// ── Router ────────────────────────────────────────────────────────────────────

/**
 * Render the current view based on state.view.
 * Called by navigate() in shared.js and on bootstrap.
 */
export function render() {
  if (!api.isAuthenticated()) {
    renderLogin();
    return;
  }

  switch (state.view) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'inspectors':
      renderInspectors();
      break;
    case 'inspector-detail':
      renderInspectorDetail(state.params.id);
      break;
    case 'create-inspector':
      renderCreateInspector();
      break;
    case 'inspections':
      renderInspections();
      break;
    case 'inspection-detail':
      renderInspectionDetail(state.params.id);
      break;
    case 'complaints':
      renderComplaints();
      break;
    default:
      renderDashboard();
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  state.view = 'dashboard';
  render();
});

// ── Frontend error tracking (D3) ──────────────────────────────────────────────
// Catches unhandled promise rejections (e.g. failed API calls that were not
// caught in a view). Logs structured context to the console so Render's log
// drain or the browser DevTools can be used for diagnosis without a full
// Sentry integration.
//
// Replace the console.error below with a Sentry.captureException() call if
// Sentry is added in the future.
window.addEventListener('unhandledrejection', (event) => {
  const err = event.reason;
  const context = {
    type: 'unhandledrejection',
    message: err?.message ?? String(err),
    errorCode: err?.errorCode ?? null,
    status: err?.status ?? null,
    view: state.view,
    params: state.params,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  };
  // eslint-disable-next-line no-console
  console.error('[Parakh unhandled]', context);
  // Prevent the default browser "Uncaught (in promise)" noise in the console
  // only when we have already logged the structured version.
  event.preventDefault();
});
