const TOKEN_KEY = 'portfolio_xp_jwt';

export function getApiBase() {
  const b = import.meta.env.VITE_API_BASE_URL;
  if (b && String(b).trim()) {
    return String(b).replace(/\/$/, '');
  }
  return '';
}

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * @param {string} path - ej. /api/v1/public/ping
 * @param {RequestInit} [options]
 */
export async function apiFetch(path, options = {}) {
  const { omitAuth, ...fetchOpts } = options;
  const base = getApiBase();
  const url = base ? `${base}${path}` : path;
  const headers = new Headers(fetchOpts.headers || {});
  if (!headers.has('Content-Type') && fetchOpts.body && typeof fetchOpts.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  const token = omitAuth ? null : getStoredToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, { ...fetchOpts, headers });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }
  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || 'Error de API');
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}
