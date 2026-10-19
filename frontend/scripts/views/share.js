import { slimNav } from '../components/nav.js';
import { api } from '../api.js';
import { $, esc, on } from '../lib/dom.js';
import { findOccasion } from '../config/catalog.js';
import { renderError } from './shared.js';

const CONFETTI = ['#FF3D7F', '#1B1325', '#5B8CFF', '#FFFFFF', '#3DDC97', '#8E5CFF'];

function burst() {
  return Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2;
    const dist = 260 + (i % 3) * 120;
    return `<span class="burst" style="--x:${Math.round(Math.cos(angle) * dist)}px;--y:${Math.round(Math.sin(angle) * dist * 0.6)}px;--rot:${(i % 2 ? -1 : 1) * (200 + i * 30)}deg;background:${CONFETTI[i % CONFETTI.length]}"></span>`;
  }).join('') + Array.from({ length: 8 }, (_, i) =>
    `<span class="fall" style="left:${6 + i * 12}%;background:${CONFETTI[i % CONFETTI.length]};animation-duration:${7 + (i % 4)}s;animation-delay:-${i}s"></span>`).join('');
}

const absolute = (path) => new URL(path, location.origin).href;

export async function render(root, { boardId }, scope) {
  root.innerHTML = '<div class="loading">getting your wall...</div>';
  let board;
  try {
    board = await api.getBoard(boardId);
  } catch (error) {
    return renderError(root, error);
  }

  const name = esc(board.recipient_name);
  const inviteLink = absolute(board.contributor_link);
  const revealLink = absolute(board.view_link);
  const occasion = findOccasion(board.occasion).label.toLowerCase();
  const inviteText = `Add a note to ${board.recipient_name}'s ${occasion} wall on HypeWall! ${inviteLink} (or use code ${board.join_code})`;
  const unlock = board.unlock_at ? new Date(board.unlock_at) : null;

  root.innerHTML = `
    <div class="page share-page">
      <div aria-hidden="true">${burst()}</div>
      ${slimNav(`<a class="text-link" href="?view=${encodeURIComponent(board.view_token)}" data-link>Preview the reveal</a>`)}
      <main class="share container">
        <p class="hand" style="margin:30px 0 0;font-size:34px">ta-da!</p>
        <h1 class="share-title">${name}'s wall<br>is live.</h1>
        <p class="share-sub">Now round up the crew. Anyone with the link or code can add a note, no sign up needed.</p>
        <div class="code-tiles" aria-label="Join code ${esc(board.join_code.split('').join(' '))}">
          ${[...board.join_code].map((ch, i) => `<span class="code-tile" aria-hidden="true" style="animation-delay:${0.6 + i * 0.1}s">${esc(ch)}</span>`).join('')}
        </div>
        <p style="margin:10px 0 48px;font-weight:600">join code</p>

        <div class="share-grid">
          <section class="card share-card" style="animation-delay:1s" aria-labelledby="inv">
            <span class="tag" style="background:#C9F2C7">share freely</span>
            <h2 id="inv" class="step-title">invite link</h2>
            <p class="step-hint">For friends, family, the whole office. They can write but not peek.</p>
            <div class="link-field">
              <label for="inviteLink" class="sr-only">Invite link</label>
              <input id="inviteLink" readonly value="${esc(inviteLink)}">
              <button type="button" class="btn btn-ink btn-sm" data-copy="inviteLink">Copy</button>
            </div>
            <div class="share-actions">
              <a class="btn btn-soft btn-sm" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(inviteText)}">WhatsApp</a>
              <a class="btn btn-soft btn-sm" href="mailto:?subject=${encodeURIComponent(`Help hype up ${board.recipient_name}!`)}&body=${encodeURIComponent(inviteText)}">Email</a>
              ${navigator.share ? '<button type="button" class="btn btn-soft btn-sm" data-native-share>More…</button>' : ''}
            </div>
          </section>

          <section class="card share-card share-card-dark" style="animation-delay:1.15s" aria-labelledby="rev">
            <span class="tag" style="background:var(--pop)">for ${name} only</span>
            <h2 id="rev" class="step-title">reveal link</h2>
            <p class="step-hint" style="color:var(--lilac-mute)">Send this when the moment comes. Opening it plays the full reveal.</p>
            <div class="link-field link-field-dark">
              <label for="revealLink" class="sr-only">Reveal link</label>
              <input id="revealLink" readonly value="${esc(revealLink)}">
              <button type="button" class="btn btn-soft btn-sm" data-copy="revealLink">Copy</button>
            </div>
            ${unlock ? `<p class="unlock-note">Notes stay hidden until <strong>${unlock.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</strong>.</p>` : ''}
          </section>
        </div>

        <div class="card share-count" style="animation-delay:1.3s">
          <div style="display:flex;align-items:center;gap:14px">
            <span class="pulse" style="width:14px;height:14px"></span>
            <div><div class="disp count-title" data-slot="count">counting notes...</div><div style="color:var(--ink-soft)">Be the one who starts it. Everyone else follows.</div></div>
          </div>
          <a class="btn btn-ink btn-lg" href="?contribute=${encodeURIComponent(board.id)}" data-link>Write a note</a>
        </div>
      </main>
    </div>`;

  scope.add(on(root, 'click', '[data-copy]', async (event, btn) => {
    const input = $(`#${btn.dataset.copy}`, root);
    try {
      await navigator.clipboard.writeText(input.value);
    } catch {
      input.select(); // clipboard blocked: leave it selected for a manual copy
      return;
    }
    const label = btn.textContent;
    btn.textContent = 'Copied!';
    btn.classList.add('btn-done');
    scope.timeout(() => { btn.textContent = label; btn.classList.remove('btn-done'); }, 1600);
  }));
  scope.add(on(root, 'click', '[data-native-share]', () => {
    navigator.share({ title: 'HypeWall', text: inviteText, url: inviteLink }).catch(() => {});
  }));

  const countEl = $('[data-slot="count"]', root);
  async function refreshCount() {
    try {
      const { comment_count: n } = await api.getStats(board.id);
      countEl.textContent = `${n} ${n === 1 ? 'note' : 'notes'} so far`;
    } catch { /* keep the last value */ }
  }
  refreshCount();
  scope.interval(refreshCount, 10000);
  document.title = `${board.recipient_name}'s wall · HypeWall`;
}
