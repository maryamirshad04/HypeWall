import { slimNav } from '../components/nav.js';
import { api } from '../api.js';
import { $, esc } from '../lib/dom.js';
import { backgroundClass, findOccasion } from '../config/catalog.js';

const LENGTH = 6;

export function render(root, { code = '' }, scope) {
  root.innerHTML = `
    <div class="page grain join-page">
      <div class="join-floaty" aria-hidden="true" style="--r:-8deg;left:8%;top:22%;width:150px;height:130px;background:#FFE066"></div>
      <div class="join-floaty" aria-hidden="true" style="--r:7deg;right:9%;top:18%;width:130px;height:150px;background:#FFB3C7;animation-delay:-2s"></div>
      <div class="join-floaty" aria-hidden="true" style="--r:5deg;left:14%;bottom:14%;width:120px;height:120px;background:#C9F2C7;animation-delay:-4s"></div>
      <div class="join-floaty" aria-hidden="true" style="--r:-6deg;right:13%;bottom:16%;width:150px;height:120px;background:#E3D1FF;animation-delay:-1s"></div>
      ${slimNav('<a class="text-link" href="./" data-link>Close</a>')}
      <main class="join">
        <p class="hand" style="margin:0;font-size:32px">someone sent you a code?</p>
        <h1 class="h-xl">pop it in.</h1>
        <div class="code-boxes">
          ${Array.from({ length: LENGTH }, () => '<span class="code-box"></span>').join('')}
          <label for="joinCode" class="sr-only">Six character join code</label>
          <input id="joinCode" class="code-input" maxlength="${LENGTH}" autocomplete="off" autocapitalize="characters" spellcheck="false" inputmode="text">
        </div>
        <p class="join-help">6 letters or numbers, it's on the invite.</p>
        <div id="joinResult" aria-live="polite"></div>
      </main>
    </div>`;

  const input = $('#joinCode', root);
  const boxes = [...root.querySelectorAll('.code-box')];
  const result = $('#joinResult', root);
  let lookup = 0;

  function paint(value, state = '') {
    boxes.forEach((box, i) => {
      box.textContent = value[i] || '';
      box.className = 'code-box' + (state === 'ok' ? ' ok' : value[i] ? ' full' : i === value.length ? ' current' : '');
      box.style.transitionDelay = state === 'ok' ? `${i * 0.06}s` : '0s';
    });
  }

  async function check(value) {
    const id = ++lookup;
    result.innerHTML = '<p class="join-help">checking...</p>';
    try {
      const board = await api.getBoardByCode(value);
      if (id !== lookup) return;
      paint(value, 'ok');
      result.innerHTML = `
        <div class="found">
          <span class="found-thumb wallpaper ${backgroundClass(board.aesthetic, 'paint')}"></span>
          <div style="flex:1 1 200px">
            <div class="found-label">found it!</div>
            <div class="disp found-name">${esc(board.recipient_name)}'s ${esc(findOccasion(board.occasion).label.toLowerCase())} wall</div>
          </div>
          <a class="btn btn-ink" href="?contribute=${encodeURIComponent(board.id)}" data-link>Add my note</a>
        </div>`;
    } catch (error) {
      if (id !== lookup) return;
      result.innerHTML = `<p class="join-error">${error.status === 404 ? 'hmm, no wall with that code. double check with whoever sent it?' : esc(error.message)}</p>`;
    }
  }

  function update() {
    const value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, LENGTH);
    input.value = value;
    paint(value);
    if (value.length === LENGTH) check(value);
    else { lookup++; result.innerHTML = ''; }
  }

  input.addEventListener('input', update);
  scope.add(() => input.removeEventListener('input', update));
  input.value = code;
  update();
  input.focus();
}
