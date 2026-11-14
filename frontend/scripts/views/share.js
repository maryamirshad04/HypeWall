import { slimNav } from '../components/nav.js';
import { api } from '../api.js';
import { $, esc, on } from '../lib/dom.js';
import { rememberKey, recallKey } from '../lib/creatorKeys.js';
import { toast } from '../lib/toast.js';
import { findOccasion } from '../config/catalog.js';
import { renderError } from './shared.js';

const CONFETTI = ['#FF3D7F', '#1B1325', '#5B8CFF', '#FFFFFF', '#3DDC97', '#8E5CFF'];
const REFRESH_MS = 10000;

function burst() {
  return Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2;
    const dist = 260 + (i % 3) * 120;
    return `<span class="burst" style="--x:${Math.round(Math.cos(angle) * dist)}px;--y:${Math.round(Math.sin(angle) * dist * 0.6)}px;--rot:${(i % 2 ? -1 : 1) * (200 + i * 30)}deg;background:${CONFETTI[i % CONFETTI.length]}"></span>`;
  }).join('') + Array.from({ length: 8 }, (_, i) =>
    `<span class="fall" style="left:${6 + i * 12}%;background:${CONFETTI[i % CONFETTI.length]};animation-duration:${7 + (i % 4)}s;animation-delay:-${i}s"></span>`).join('');
}

const absolute = (path) => new URL(path, location.origin).href;

const linkField = (id, label, value, dark = false) => `
  <div class="link-field ${dark ? 'link-field-dark' : ''}">
    <label for="${id}" class="sr-only">${label}</label>
    <input id="${id}" readonly value="${esc(value)}">
    <button type="button" class="btn ${dark ? 'btn-soft' : 'btn-ink'} btn-sm" data-copy="${id}">Copy</button>
  </div>`;

// Someone opened ?board=<id> without the creator key
function renderNotCreator(root, board) {
  root.innerHTML = `
    <div class="page grain">
      ${slimNav()}
      <main class="error-state">
        <div>
          <p class="hand" style="font-size:32px;margin:0">psst</p>
          <h1 class="h-lg">this is the organiser's page.</h1>
          <p class="lead">Open it from the private creator link you got when the wall was made. Want to add a note instead?</p>
          <a class="btn btn-ink" href="?contribute=${encodeURIComponent(board.id)}" data-link style="margin-top:16px">Write a note for ${esc(board.recipient_name)}</a>
        </div>
      </main>
    </div>`;
}

function noteRow(note) {
  const media = [note.gif && 'image', note.audio && 'voice note'].filter(Boolean).join(' + ');
  return `
    <li class="mod-row ${note.hidden ? 'is-hidden' : ''}" data-note="${esc(note.id)}">
      <span class="mod-swatch" style="background:${esc(note.color || '#FFE066')}"></span>
      <div class="mod-text">
        <strong>${esc(note.author || 'Anonymous')}</strong>${note.hidden ? '<span class="mod-badge">hidden</span>' : ''}
        <p>${note.message ? esc(note.message) : '<em>no text</em>'}${media ? ` <span class="mod-media">· ${media}</span>` : ''}</p>
      </div>
      <div class="mod-actions">
        <button type="button" class="btn btn-soft btn-sm" data-hide="${note.hidden ? 'false' : 'true'}">${note.hidden ? 'Show' : 'Hide'}</button>
        <button type="button" class="btn btn-soft btn-sm mod-delete" data-delete>Delete</button>
      </div>
    </li>`;
}

export async function render(root, { boardId, key: keyFromLink }, scope) {
  root.innerHTML = '<div class="loading">getting your wall...</div>';
  const key = keyFromLink || recallKey(boardId);
  let board;
  try {
    board = await api.getBoard(boardId, key);
  } catch (error) {
    return renderError(root, error);
  }
  if (!board.is_creator) return renderNotCreator(root, board);
  if (keyFromLink && board.can_moderate) rememberKey(boardId, keyFromLink);

  const name = esc(board.recipient_name);
  const inviteLink = absolute(board.contributor_link);
  const revealLink = absolute(board.view_link);
  const creatorLink = board.can_moderate ? absolute(`/index.html?board=${encodeURIComponent(board.id)}&key=${encodeURIComponent(key)}`) : null;
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
            ${linkField('inviteLink', 'Invite link', inviteLink)}
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
            ${linkField('revealLink', 'Reveal link', revealLink, true)}
            ${unlock ? `<p class="unlock-note">Notes stay hidden until <strong>${unlock.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</strong>.</p>` : ''}
          </section>
        </div>

        ${creatorLink ? `
        <section class="card share-card creator-card" style="animation-delay:1.25s" aria-labelledby="own">
          <span class="tag" style="background:var(--sun)">keep this private</span>
          <h2 id="own" class="step-title">your creator link</h2>
          <p class="step-hint">This is how you get back to this page and manage notes. Anyone with it can hide or delete notes, so don't share it.</p>
          ${linkField('creatorLink', 'Creator link', creatorLink)}
        </section>` : ''}

        <section class="card share-count" style="animation-delay:1.3s" aria-labelledby="notes-title">
          <div class="share-count-head">
            <div style="display:flex;align-items:center;gap:14px">
              <span class="pulse" style="width:14px;height:14px"></span>
              <div><h2 id="notes-title" class="disp count-title" data-slot="count">counting notes...</h2><div style="color:var(--ink-soft)">${board.can_moderate ? 'Hide or delete anything before the reveal.' : 'Be the one who starts it. Everyone else follows.'}</div></div>
            </div>
            <a class="btn btn-ink btn-lg" href="?contribute=${encodeURIComponent(board.id)}" data-link>Write a note</a>
          </div>
          ${board.can_moderate
            ? '<ul class="mod-list" data-slot="notes" aria-live="polite"></ul>'
            : '<p class="mod-legacy">This wall was made before note moderation existed, so notes can not be hidden or deleted here.</p>'}
        </section>
      </main>
    </div>`;

  // ── copy / share ─────────────────────────────────────────
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

  // ── notes: count for everyone, moderation for the key holder ──
  const countEl = $('[data-slot="count"]', root);
  const listEl = $('[data-slot="notes"]', root);
  let notes = [];
  const setCount = (n) => { countEl.textContent = `${n} ${n === 1 ? 'note' : 'notes'} so far`; };

  function renderNotes() {
    const visible = notes.filter((n) => !n.hidden).length;
    setCount(visible);
    listEl.innerHTML = notes.length ? notes.map(noteRow).join('') : '<li class="mod-empty">No notes yet. They will show up here as people post.</li>';
  }

  async function refresh() {
    try {
      if (!board.can_moderate) return setCount((await api.getStats(board.id)).comment_count);
      if (listEl.querySelector('[data-confirming]')) return; // don't yank a row mid-confirmation
      notes = await api.listNotes(board.id, key);
      renderNotes();
    } catch { /* keep the last state */ }
  }

  if (board.can_moderate) {
    scope.add(on(root, 'click', '[data-hide]', async (event, btn) => {
      const id = btn.closest('[data-note]').dataset.note;
      const hidden = btn.dataset.hide === 'true';
      btn.disabled = true;
      try {
        await api.setNoteHidden(board.id, id, hidden, key);
        notes = notes.map((n) => (n.id === id ? { ...n, hidden } : n));
        renderNotes();
        toast(hidden ? 'Hidden from the reveal.' : 'Back on the wall.', 'success');
      } catch (error) {
        toast(error.message, 'error');
        btn.disabled = false;
      }
    }));

    // Delete asks twice: the first tap arms the button for a few seconds
    scope.add(on(root, 'click', '[data-delete]', async (event, btn) => {
      if (!btn.dataset.confirming) {
        btn.dataset.confirming = 'true';
        btn.textContent = 'Tap again to delete';
        btn.classList.add('btn-danger');
        scope.timeout(() => {
          if (!btn.isConnected) return;
          delete btn.dataset.confirming;
          btn.textContent = 'Delete';
          btn.classList.remove('btn-danger');
        }, 3000);
        return;
      }
      const id = btn.closest('[data-note]').dataset.note;
      btn.disabled = true;
      try {
        await api.deleteNote(board.id, id, key);
        notes = notes.filter((n) => n.id !== id);
        renderNotes();
        toast('Note deleted.', 'success');
      } catch (error) {
        toast(error.message, 'error');
        btn.disabled = false;
      }
    }));
  }

  refresh();
  scope.interval(refresh, REFRESH_MS);
  document.title = `${board.recipient_name}'s wall · HypeWall`;
}
