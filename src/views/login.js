/**
 * PARAKH Admin Portal — Login view
 */
import * as api from '../api.js';
import { state, navigate, escHtml, toast } from './shared.js';

export function renderLogin() {
  document.getElementById('app').innerHTML = `
  <div class="auth-page">
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

  document.getElementById('login-btn').addEventListener('click', _doLogin);
  document.getElementById('login-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') _doLogin();
  });
}

async function _doLogin() {
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
    api.setToken(session.access_token);
    try {
      await api.verifyAdminRole(session.access_token);
    } catch {
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
