// Query-string router. The URL formats are part of the public contract
// (shared links live in group chats), so every legacy form keeps working:
//   ?board=<id>[&key=] creator share page (key = private creator key)
//   ?contribute=<id>   write a note
//   ?code=<CODE>       join with a code
//   ?view=<token>      the recipient's reveal
//   ?page=about|contact|privacy|create|join|demo

import { createScope } from './lib/dom.js';

const INFO_PAGES = ['about', 'contact', 'privacy'];

export function resolve(search) {
  const q = new URLSearchParams(search);
  if (q.get('view')) return { view: 'reveal', params: { token: q.get('view') } };
  if (q.get('board')) return { view: 'share', params: { boardId: q.get('board'), key: q.get('key') } };
  if (q.get('contribute')) return { view: 'contribute', params: { boardId: q.get('contribute') } };
  if (q.get('code')) return { view: 'join', params: { code: q.get('code') } };

  const page = q.get('page');
  if (INFO_PAGES.includes(page)) return { view: 'info', params: { tab: page } };
  if (page === 'create') return { view: 'create', params: { vibe: q.get('vibe') } };
  if (page === 'join') return { view: 'join', params: {} };
  if (page === 'demo') return { view: 'reveal', params: { demo: true } };
  return { view: 'landing', params: {} };
}

const loaders = {
  landing: () => import('./views/landing.js'),
  info: () => import('./views/info.js'),
  join: () => import('./views/join.js'),
  create: () => import('./views/create.js'),
  share: () => import('./views/share.js'),
  contribute: () => import('./views/contribute.js'),
  reveal: () => import('./views/reveal.js'),
};

let scope = null;
let renderId = 0;

async function render() {
  const id = ++renderId;
  const root = document.getElementById('app');
  const { view, params } = resolve(location.search);

  scope?.dispose();
  scope = createScope();
  const module = await loaders[view]();
  if (id !== renderId) return; // a newer navigation won the race

  root.innerHTML = '';
  root.dataset.view = view;
  if (!location.hash) window.scrollTo(0, 0);
  await module.render(root, params, scope);
}

export function navigate(url, { replace = false } = {}) {
  history[replace ? 'replaceState' : 'pushState']({}, '', url);
  return render();
}

export function start() {
  window.addEventListener('popstate', render);
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-link]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || link.target === '_blank') return;
    event.preventDefault();
    navigate(link.getAttribute('href'));
  });
  return render();
}
