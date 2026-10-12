// Small helpers shared by every screen.

// localStorage can throw (private windows, blocked storage); never let it break the app.
export const store = {
  get(key, fallback) {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
  },
  getJSON(key, fallback) {
    try { return JSON.parse(this.get(key, null)) ?? fallback; } catch { return fallback; }
  },
  setJSON(key, value) { this.set(key, JSON.stringify(value)); },
};

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  node.append(...children.flat().filter(c => c != null));
  return node;
}

// A span of typeset math (KaTeX is loaded locally from vendor/katex/).
export function tex(source, attrs = {}) {
  const span = el('span', { ...attrs, class: `math ${attrs.class ?? ''}`.trim() });
  if (window.katex) window.katex.render(source, span, { throwOnError: false });
  else span.textContent = source;
  return span;
}

export const pick = list => list[Math.floor(Math.random() * list.length)];

export function formatTime(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// Rates read best as whole numbers when they are, otherwise to one decimal place.
export function formatRate(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function formatMinutes(minutes) {
  if (minutes < 1) return `${Math.round(minutes * 60)} seconds`;
  return minutes === 1 ? '1 minute' : `${minutes} minutes`;
}
