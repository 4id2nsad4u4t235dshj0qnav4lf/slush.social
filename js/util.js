// util.js (ES module)
// Common utilities used by index/profile pages.

export function timeAgo(timestamp) {
  const now = Date.now();
  // Accept either a Date, milliseconds number, or Firestore-like object
  let t = timestamp;
  if (timestamp && timestamp.seconds) t = timestamp.seconds * 1000;
  if (timestamp instanceof Date) t = timestamp.getTime();
  const diff = Math.floor((now - t) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function sanitizeInput(str) {
  const div = document.createElement('div');
  div.textContent = String(str ?? '');
  return div.innerHTML;
}

export function showToast(message, type = 'info') {
  // Simple toast UI — ensures only one toast container is used
  let container = document.getElementById('gauch-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'gauch-toast-container';
    Object.assign(container.style, {
      position: 'fixed',
      left: '50%',
      transform: 'translateX(-50%)',
      bottom: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'center',
      pointerEvents: 'none'
    });
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `gauch-toast gauch-toast-${type}`;
  toast.textContent = message;
  Object.assign(toast.style, {
    minWidth: '140px',
    maxWidth: '90vw',
    padding: '10px 14px',
    borderRadius: '12px',
    background: type === 'error' ? '#ffefef' : '#111827',
    color: type === 'error' ? '#7f1d1d' : '#fff',
    fontSize: '14px',
    boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
    opacity: '0',
    transform: 'translateY(6px)',
    transition: 'opacity .18s ease, transform .18s ease',
    pointerEvents: 'auto',
  });

  container.appendChild(toast);
  // show
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    setTimeout(() => toast.remove(), 220);
  }, 3000);
}

// make fetch wrapper that attaches Authorization header (if present)
export async function safeFetch(url, options = {}) {
  const token = window.gauchai?.idToken || null;
  const headers = Object.assign({}, options.headers || {});
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const opts = Object.assign({}, options, { headers, credentials: options.credentials ?? 'same-origin' });

  try {
    const res = await fetch(url, opts);
    if (!res.ok) {
      // try to parse JSON error payload
      let txt;
      try { txt = await res.text(); } catch(e){ txt = res.statusText || 'error'; }
      const err = new Error(`HTTP ${res.status}: ${txt}`);
      err.status = res.status;
      throw err;
    }
    // try parse JSON, otherwise return text
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return res.json();
    return res.text();
  } catch (err) {
    console.error('Fetch failed:', err);
    showToast('Network or server error', 'error');
    throw err;
  }
}

// simple api wrapper that prefixes API_BASE if provided
export async function api(path, opts = {}) {
  const base = window.API_BASE ?? '';
  // if path looks like full URL, use it
  const url = path.match(/^https?:\/\//) ? path : (base.replace(/\/$/, '') + path);
  return safeFetch(url, opts);
}

/* -------------------------
   Phone input helpers
   ------------------------- */
/* -------------------------
   Phone input helpers
   ------------------------- */

// Attach a formatter to an input element to create "(000) 000-0000" live formatting
export function formatPhoneInput(el) {
  if (!el) return;

  const digits = s => String(s || '').replace(/\D/g, '');

  function build(d) {
    const dd = d.slice(0, 10);
    if (dd.length <= 3) return dd;
    if (dd.length <= 6) return `(${dd.slice(0, 3)}) ${dd.slice(3)}`;
    return `(${dd.slice(0, 3)}) ${dd.slice(3, 6)}-${dd.slice(6, 10)}`;
  }

  function handleInput() {
    const d = digits(el.value);
    el.value = build(d);
  }

  el.addEventListener('input', handleInput);
  el.addEventListener('blur', handleInput);

  // Paste handling
  el.addEventListener('paste', (ev) => {
    ev.preventDefault();
    const text = (ev.clipboardData || window.clipboardData).getData('text') || '';
    el.value = build(digits(text));
  });

  // Restrict allowed keys to numbers/navigation/backspace
  el.addEventListener('keydown', (ev) => {
    const allowed = ['Backspace','ArrowLeft','ArrowRight','Delete','Tab','Home','End'];
    if (allowed.includes(ev.key)) return;
    if (ev.ctrlKey || ev.metaKey) return; // shortcuts
    if (!/^[0-9]$/.test(ev.key)) ev.preventDefault();
  });

  // Initialize with existing value
  el.value = build(digits(el.value));
}

// Convert masked "(000) 000-0000" (or any input) to E.164 (US default)
export function toE164FromMasked(masked) {
  const d = String(masked || '').replace(/\D/g, '');
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith('1')) return `+${d}`;
  if (d.length > 10) return `+${d}`; // best-effort
  return null;
}

