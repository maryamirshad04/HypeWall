// Tiny DOM helpers shared by every view.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

// Escape any user-provided text before it goes into an HTML string
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Delegated listener: on(root, 'click', '[data-pick]', (event, el) => ...)
export function on(root, type, selector, handler) {
  const listener = (event) => {
    const el = event.target.closest(selector);
    if (el && root.contains(el)) handler(event, el);
  };
  root.addEventListener(type, listener);
  return () => root.removeEventListener(type, listener);
}

// Collects teardown callbacks so a view can clean up timers and listeners
export function createScope() {
  const cleanups = [];
  return {
    add(fn) { cleanups.push(fn); return fn; },
    interval(fn, ms) { const id = setInterval(fn, ms); cleanups.push(() => clearInterval(id)); return id; },
    timeout(fn, ms) { const id = setTimeout(fn, ms); cleanups.push(() => clearTimeout(id)); return id; },
    dispose() { cleanups.splice(0).reverse().forEach((fn) => fn()); },
  };
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
