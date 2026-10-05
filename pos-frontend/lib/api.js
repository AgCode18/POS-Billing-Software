const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function api(path, { method = 'GET', body } = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined' && !path.startsWith('/auth/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export const money = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const invNo = (n) => 'INV-' + String(n).padStart(4, '0');

export const fmtDate = (d) =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function genPassword(len = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const r = crypto.getRandomValues(new Uint32Array(len));
  return Array.from(r, (n) => chars[n % chars.length]).join('');
}

// Resize logo in the browser -> small base64 string stored in DB
export function fileToLogo(file, max = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Invalid image'));
    img.src = url;
  });
}

const ACTIONS = {
  LOGIN: 'Logged in',
  INVOICE_CREATED: 'Created invoice',
  PRODUCT_CREATED: 'Added product',
  PRODUCT_UPDATED: 'Updated product',
  PRODUCT_DELETED: 'Removed product',
  SETTINGS_UPDATED: 'Updated shop settings',
};

export function actionLabel(l) {
  const base = ACTIONS[l.action] || l.action;
  if (l.action === 'INVOICE_CREATED' && l.meta?.total != null) return `${base} · ${money(l.meta.total)}`;
  if (l.meta?.name) return `${base} · ${l.meta.name}`;
  return base;
}
