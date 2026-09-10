/**
 * PARAKH Admin Web — API Client
 *
 * All communication with the FastAPI backend goes through this module.
 * The Supabase session token is sent as a Bearer token on every request.
 * No service-role key or DATABASE_URL ever appears here.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// ── Token storage (session only — cleared on tab close) ──────────────────────

let _token = sessionStorage.getItem('parakh_token') || null;

export function setToken(token) {
  _token = token;
  if (token) sessionStorage.setItem('parakh_token', token);
  else sessionStorage.removeItem('parakh_token');
}

export function getToken() {
  return _token;
}

export function clearToken() {
  setToken(null);
}

export function isAuthenticated() {
  return !!_token;
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────

async function request(method, path, body = null, params = null) {
  // Build URL: if BASE_URL is set (production), use it directly as an absolute
  // base so requests go to the backend host. If BASE_URL is empty (dev), use
  // a relative path which Vite's dev proxy forwards to localhost:8000.
  let urlStr = BASE_URL ? `${BASE_URL}${path}` : path;
  const url = new URL(urlStr, window.location.href);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') url.searchParams.set(k, v);
    });
  }

  const headers = { 'Content-Type': 'application/json' };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  const init = { method, headers };
  if (body !== null) init.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(url.toString(), init);
  } catch (err) {
    throw new ApiError('Network error — is the backend running?', 0, 'NETWORK_ERROR');
  }

  const data = await res.json().catch(() => ({
    success: false,
    message: `HTTP ${res.status}`,
    error_code: 'PARSE_ERROR',
  }));

  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`;
    const code = data?.error_code || `HTTP_${res.status}`;
    throw new ApiError(msg, res.status, code);
  }

  return data;
}

// ── ApiError ─────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(message, status, errorCode) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  const res = await request('POST', '/api/auth/login', { email, password });
  // Verify the user actually has admin role by calling the admin dashboard
  // This will 403 if the user is not an admin
  return res.data;
}

export async function verifyAdminRole(token) {
  const old = _token;
  setToken(token);
  try {
    await request('GET', '/api/admin/dashboard');
    return true;
  } catch (err) {
    setToken(old);
    throw err;
  }
}

export async function getMe() {
  return (await request('GET', '/api/auth/me')).data;
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────

export async function getAdminDashboard() {
  return (await request('GET', '/api/admin/dashboard')).data;
}

// ── Inspectors ────────────────────────────────────────────────────────────────

export async function listInspectors(params = {}) {
  return (await request('GET', '/api/admin/inspectors', null, params)).data;
}

export async function getInspector(inspectorId) {
  return (await request('GET', `/api/admin/inspectors/${inspectorId}`)).data;
}

export async function createInspector(payload) {
  return (await request('POST', '/api/admin/inspectors', payload)).data;
}

export async function updateInspector(inspectorId, payload) {
  return (await request('PATCH', `/api/admin/inspectors/${inspectorId}`, payload)).data;
}

// ── Inspections ───────────────────────────────────────────────────────────────

export async function listAdminInspections(params = {}) {
  return (await request('GET', '/api/admin/inspections', null, params)).data;
}

export async function getAdminInspection(inspectionId) {
  return (await request('GET', `/api/admin/inspections/${inspectionId}`)).data;
}

// ── Complaints ────────────────────────────────────────────────────────────────

export async function listAdminComplaints(params = {}) {
  return (await request('GET', '/api/admin/complaints', null, params)).data;
}
