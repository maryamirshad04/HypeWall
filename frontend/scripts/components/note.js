// One note card, shared by the contribute preview and the reveal wall.

import { esc } from '../lib/dom.js';
import { STICKERS } from '../config/catalog.js';

const PLAY_ICON = '<svg viewBox="0 0 12 14" aria-hidden="true"><path d="M1 1l10 6-10 6z" fill="currentColor"/></svg>';
const PAUSE_ICON = '<svg viewBox="0 0 12 14" aria-hidden="true"><path d="M1 1h3.5v12H1zM7.5 1H11v12H7.5z" fill="currentColor"/></svg>';

// Dark note colours need light text
function isDark(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}

const safeColor = (hex) => (/^#[0-9a-f]{3,8}$/i.test(hex || '') ? hex : '#FFE066');
// Only data URLs, http(s) links and our own images/ folder may be media sources
const safeSrc = (src) => (typeof src === 'string' && /^(data:(image|audio)\/|https?:\/\/|images\/)/i.test(src) ? src : null);

export function audioPlayer(src, label = 'voice note') {
  return `
    <span class="voice" data-audio="${esc(src)}">
      <button type="button" class="voice-btn" aria-label="Play ${esc(label)}">${PLAY_ICON}</button>
      <span class="voice-bars" aria-hidden="true">${'<i></i>'.repeat(10)}</span>
      <span class="voice-label">${esc(label)}</span>
    </span>`;
}

const EXPAND_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/**
 * @param {object} note  comment from the API (or a draft with the same shape)
 * @param {object} opts  { expandable: adds a "read it big" button, className, index }
 */
export function noteCard(note, { expandable = false, className = '', index = 0 } = {}) {
  const color = safeColor(note.color);
  const gif = safeSrc(note.gif);
  const audio = safeSrc(note.audio);
  const font = ['hand', 'marker', 'clean'].includes(note.font) ? note.font : 'hand';
  const shape = ['sticky', 'card', 'polaroid', 'bubble'].includes(note.shape) ? note.shape : 'sticky';
  const fix = index % 3 === 1 ? 'pin' : 'tape';
  const stickers = (note.stickers || []).filter((s) => STICKERS[s]);
  const author = esc(note.author || 'Anonymous');

  return `
    <div class="note note-${shape} font-${font} ${isDark(color) ? 'note-dark' : ''} ${className}" style="--note: ${color}" data-note-index="${index}">
      <span class="${fix}" aria-hidden="true"></span>
      ${expandable ? `<button type="button" class="note-expand" data-expand="${index}" aria-label="Read the note from ${author} big">${EXPAND_ICON}</button>` : ''}
      ${gif ? `<img class="note-media" src="${esc(gif)}" alt="" loading="lazy">` : ''}
      ${audio ? audioPlayer(audio) : ''}
      ${note.message ? `<span class="note-msg">${esc(note.message)}</span>` : ''}
      <span class="note-from">— ${author}</span>
      ${stickers.length ? `<span class="note-stickers" aria-hidden="true">${stickers.map((s) => `<span class="sticker">${STICKERS[s]}</span>`).join('')}</span>` : ''}
    </div>`;
}

// Wires every voice note inside root; only one plays at a time. Returns a remover.
let current = null;
export function bindAudioPlayers(root) {
  const listener = (event) => {
    const btn = event.target.closest('.voice-btn');
    if (!btn) return;
    event.stopPropagation();
    const wrap = btn.closest('.voice');
    if (!wrap.audioEl) {
      wrap.audioEl = new Audio(wrap.dataset.audio);
      wrap.audioEl.addEventListener('ended', () => setState(wrap, false));
    }
    if (current && current !== wrap) { current.audioEl.pause(); setState(current, false); }
    if (wrap.audioEl.paused) { wrap.audioEl.play(); setState(wrap, true); current = wrap; }
    else { wrap.audioEl.pause(); setState(wrap, false); }
  };
  root.addEventListener('click', listener);
  return () => { root.removeEventListener('click', listener); stopAllAudio(); };
}

function setState(wrap, playing) {
  wrap.classList.toggle('playing', playing);
  const btn = wrap.querySelector('.voice-btn');
  btn.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
  btn.setAttribute('aria-label', playing ? 'Pause voice note' : 'Play voice note');
}

export function stopAllAudio() {
  if (current?.audioEl) { current.audioEl.pause(); setState(current, false); }
  current = null;
}
