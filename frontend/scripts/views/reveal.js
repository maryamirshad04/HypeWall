// The recipient's experience: wrapper intro -> opening -> animated wall.

import { noteCard, bindAudioPlayers, stopAllAudio } from '../components/note.js';
import { wrapperArt } from '../components/wrappers.js';
import { api } from '../api.js';
import { $, $$, esc, on, prefersReducedMotion } from '../lib/dom.js';
import { createMusic } from '../lib/music.js';
import { REVEAL_STYLES, backgroundClass, findOccasion, findWrapper, findTrack } from '../config/catalog.js';
import { renderError } from './shared.js';
import { toast } from '../lib/toast.js';
import { DEMO_BOARD } from './reveal-demo.js';

const OPEN_MS = 2300;          // wrapper opening animation before the wall
const POLL_MS = 5000;          // live updates while the wall is open
const MAX_STAGGER_TOTAL = 9;   // seconds; long walls stagger faster
const STYLE = {
  solitaire: { stagger: 0.42, duration: 1.9 },
  deal: { stagger: 0.16, duration: 0.9 },
  flash: { stagger: 0.28, duration: 0.8 },
  rain: { stagger: 0.13, duration: 1.3 },
  letter: { stagger: 0.75, duration: 1.5 },
  polaroid: { stagger: 0.36, duration: 2.6 },
};
const ROTATIONS = [-5, 4, -2, 6, -4, 3, -6, 2, 5, -3, 4, -5];
const isPhone = () => window.matchMedia('(max-width: 700px)').matches;

const ICONS = {
  replay: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
  wrap: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 8l9 6 9-6M12 3v5"/></svg>',
  close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  sound: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>',
};

// Letters drop in one by one; each word stays unbroken so it never wraps mid-word
function dropLetters(text, start = 0.05) {
  let i = 0;
  return text.split(' ').map((word) => {
    const letters = [...word].map((ch) => `<span class="ch" style="animation-delay:${(start + i++ * 0.05).toFixed(2)}s">${esc(ch)}</span>`).join('');
    i++;
    return `<span class="word">${letters}</span>`;
  }).join(' ');
}

function sparkles() {
  const spots = [[22, 24, '#FFC93C'], [74, 30, '#FFC93C'], [30, 70, '#FFC93C'], [68, 72, '#FFC93C'], [50, 14, '#FF3D7F'], [84, 56, '#FF3D7F'], [14, 50, '#B8E1FF']];
  return spots.map(([l, t, c], i) => `<span class="spark" style="left:${l}%;top:${t}%;background:${c};animation-delay:${(i * 0.3).toFixed(1)}s"></span>`).join('');
}

function burstNotes() {
  const spots = [[-300, -150, -20, '#FFE066'], [260, -190, 15, '#B8E1FF'], [-220, 120, 25, '#C9F2C7'], [300, 90, -10, '#FFB3C7'], [-40, -260, 8, '#E3D1FF'], [80, 200, -30, '#FFD3A8']];
  return spots.map(([x, y, r, c]) => `<span class="burst-note" style="--x:${x}px;--y:${y}px;--r:${r}deg;background:${c}"></span>`).join('');
}

export async function render(root, { token, demo }, scope) {
  root.innerHTML = '<div class="reveal-loading">getting it ready...</div>';
  let board;
  try {
    board = demo ? structuredClone(DEMO_BOARD) : await api.getBoardByViewToken(token);
  } catch (error) {
    return renderError(root, error);
  }

  const wrapper = findWrapper(board.wrapper);
  const name = board.recipient_name;
  const state = {
    style: REVEAL_STYLES.some((s) => s.id === board.reveal_style) ? board.reveal_style : 'solitaire',
    notes: board.comments || [],
    focus: -1,
    deckIndex: 0,
    layout: isPhone() ? 'deck' : 'wall',
  };

  const music = createMusic({ src: board.bg_audio, trackId: board.music_track });
  scope.add(() => music?.destroy());
  scope.add(stopAllAudio);

  const wallpaper = board.bg_image
    ? { cls: 'wallpaper', style: `background-image:url("${board.bg_image.replace(/"/g, '%22')}")` }
    : { cls: `wallpaper ${backgroundClass(board.aesthetic, board.bg_choice)}`, style: '' };

  root.innerHTML = `
    <div class="reveal-root">
      <section class="intro" data-slot="intro">
        ${demo ? '<p class="demo-flag">demo wall · <a href="?page=create" data-link>make your own</a></p>' : ''}
        ${sparkles()}
        <div class="intro-text">
          <p class="hand intro-kicker">psst, ${esc(name)}</p>
          <h1 class="intro-title" data-slot="intro-title"></h1>
          <p class="intro-count" data-slot="intro-count"></p>
        </div>
        <div class="wrap-stage">
          <div class="glow" aria-hidden="true"></div>
          <div class="beams" aria-hidden="true"></div>
          <div class="bloom" aria-hidden="true"></div>
          <div class="wrap-holder">${wrapperArt(wrapper.id)}</div>
          ${burstNotes()}
        </div>
        <div class="intro-text" data-slot="intro-actions"></div>
      </section>

      <section class="wall hidden" data-slot="wall" aria-label="${esc(name)}'s wall">
        <div class="wall-bg ${wallpaper.cls}" style="${wallpaper.style}"></div>
        <div class="wall-shade"></div>
        <div class="wall-confetti" aria-hidden="true">${Array.from({ length: 7 }, (_, i) => `<span style="left:${6 + i * 14}%;background:${['#FFE066', '#FF3D7F', '#B8E1FF', '#fff', '#3DDC97', '#FF3D7F', '#FFE066'][i]};animation-duration:${6 + (i % 4)}s;animation-delay:-${i}s"></span>`).join('')}</div>
        <header class="wall-head">
          <div>
            <p class="hand wall-from" data-slot="from"></p>
            <h1 class="wall-title" data-slot="title" aria-label="${esc(findOccasion(board.occasion).title)}, ${esc(name)}"></h1>
          </div>
          <div class="wall-head-actions">
            <button type="button" class="pill pill-light" data-layout>${state.layout === 'deck' ? 'See the whole wall' : 'One at a time'}</button>
          </div>
        </header>
        <div class="wall-grid" data-slot="grid"></div>
        <div class="deck hidden" data-slot="deck"></div>
        <div class="stamp hidden" data-slot="stamp"></div>
        <nav class="toolbar" aria-label="Wall controls">
          ${music ? `<button type="button" class="tool-music" data-music aria-label="Play music"><span class="vinyl paused" style="width:36px;height:36px"></span><span data-slot="music-label">${esc(board.bg_audio ? 'Their song' : findTrack(board.music_track)?.label || 'Music')}</span></button><span class="tool-sep"></span>` : ''}
          <span class="tool-label">reveal</span>
          <div class="tool-styles">${REVEAL_STYLES.map((s) => `<button type="button" class="pill" data-style="${s.id}" aria-pressed="${s.id === state.style}">${s.short}</button>`).join('')}</div>
          <span class="tool-sep"></span>
          <button type="button" class="tool-icon" data-replay aria-label="Replay the reveal">${ICONS.replay}</button>
          <button type="button" class="tool-icon" data-rewrap aria-label="Wrap it back up">${ICONS.wrap}</button>
        </nav>
        <div class="focus hidden" data-slot="focus" role="dialog" aria-modal="true" aria-label="Note"></div>
      </section>
    </div>`;

  const slot = (n) => $(`[data-slot="${n}"]`, root);
  const intro = slot('intro');
  const wall = slot('wall');
  const grid = slot('grid');
  scope.add(bindAudioPlayers(wall));

  // ── intro / locked countdown ─────────────────────────────
  function showIntro() {
    stopAllAudio();
    music?.pause();
    wall.classList.add('hidden');
    intro.classList.remove('hidden', 'op');
    if (board.locked) return showCountdown();
    const n = state.notes.length;
    slot('intro-title').textContent = wrapper.headline;
    slot('intro-count').textContent = n ? `${n} ${n === 1 ? 'note' : 'notes'} from people who love you` : '';
    slot('intro-actions').innerHTML = `
      <button type="button" class="open-btn" data-open>${wrapper.action}</button>
      ${music ? `<p class="intro-sound">${ICONS.sound} sound on. there's a song.</p>` : ''}`;
  }

  function showCountdown() {
    const unlock = new Date(board.unlock_at);
    slot('intro-title').textContent = 'not yet!';
    slot('intro-actions').innerHTML = '<p class="countdown" data-slot="countdown"></p><p class="intro-sound">your wall unlocks soon. no peeking.</p>';
    const tick = () => {
      const left = unlock - Date.now();
      if (left <= 0) {
        clearInterval(timer);
        return reload();
      }
      const d = Math.floor(left / 864e5), h = Math.floor(left / 36e5) % 24, m = Math.floor(left / 6e4) % 60, s = Math.floor(left / 1e3) % 60;
      slot('countdown').textContent = `${d ? `${d}d ` : ''}${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
      const waiting = board.comment_count || 0;
      slot('intro-count').textContent = `${waiting} ${waiting === 1 ? 'note is' : 'notes are'} waiting for you`;
    };
    const timer = scope.interval(tick, 1000);
    tick();
  }

  async function reload() {
    try {
      board = await api.getBoardByViewToken(token);
      state.notes = board.comments || [];
      showIntro();
    } catch { /* try again on the next tick */ }
  }

  function open() {
    music?.play();
    intro.classList.add('op');
    scope.timeout(showWall, prefersReducedMotion() ? 0 : OPEN_MS);
  }

  // ── wall ─────────────────────────────────────────────────
  function showWall() {
    intro.classList.add('hidden');
    wall.classList.remove('hidden');
    const n = state.notes.length;
    slot('from').textContent = n ? `from ${n} ${n === 1 ? 'person' : 'people'} who love you` : 'your wall is ready';
    const title = `${findOccasion(board.occasion).title},`;
    slot('title').innerHTML = `<span aria-hidden="true">${dropLetters(title)} <span class="title-name">${dropLetters(name, 0.15 + title.length * 0.05)}</span></span>`;
    applyLayout();
  }

  function applyLayout() {
    const deck = state.layout === 'deck';
    grid.classList.toggle('hidden', deck);
    slot('deck').classList.toggle('hidden', !deck);
    $('[data-layout]', root).textContent = deck ? 'See the whole wall' : 'One at a time';
    if (deck) renderDeck('deal-in');
    else renderGrid();
  }

  function slotHTML(note, i) {
    return `<div class="slot" style="--r:${ROTATIONS[i % ROTATIONS.length]}deg">
      <div class="mover"><div class="mover-y"><div class="sway" style="animation-delay:-${(i * 0.7).toFixed(1)}s">${noteCard(note, { expandable: true, index: i })}</div></div></div>
    </div>`;
  }

  function renderGrid({ animate = true } = {}) {
    if (!state.notes.length) {
      grid.innerHTML = '<div class="wall-empty"><p class="hand">no notes yet</p><p>Check back soon. Your people are still writing.</p></div>';
      slot('stamp').classList.add('hidden');
      return;
    }
    grid.innerHTML = state.notes.map(slotHTML).join('');
    if (animate) animateSlots($$('.slot', grid));
  }

  // Positions each note's starting point (the "deck") and staggers the entrances
  function animateSlots(slots, { base = 0.4 } = {}) {
    const style = STYLE[state.style];
    const stagger = Math.min(style.stagger, MAX_STAGGER_TOTAL / Math.max(slots.length, 1));
    const vw = window.innerWidth, vh = window.innerHeight;
    const deck = state.style === 'deal' ? [vw / 2, vh + 140] : [vw - 120, -120];
    const ordered = [...slots].sort((a, b) => a.offsetTop - b.offsetTop || a.offsetLeft - b.offsetLeft);

    ordered.forEach((el, i) => {
      el.querySelector('.ghosts')?.remove();
      const rect = el.getBoundingClientRect();
      const delay = (base + i * stagger).toFixed(2);
      el.style.setProperty('--dx', `${Math.round(deck[0] - rect.left - rect.width / 2)}px`);
      el.style.setProperty('--dy', `${Math.round(deck[1] - rect.top - rect.height / 2)}px`);
      el.style.setProperty('--rr', `${(i % 2 ? 1 : -1) * (40 + (i % 5) * 18)}deg`);
      el.style.setProperty('--delay', `${delay}s`);
      el.className = `slot anim-${state.style}`;
      if (state.style === 'solitaire' && !prefersReducedMotion()) addGhosts(el, rect.height);
    });

    const lastLanding = base + (ordered.length - 1) * stagger + style.duration;
    showStamp(lastLanding);
  }

  // Solitaire trails: faded copies following the same bounce a beat behind
  function addGhosts(el, height) {
    const color = getComputedStyle(el.querySelector('.note')).backgroundColor;
    const ghosts = document.createElement('div');
    ghosts.className = 'ghosts';
    ghosts.setAttribute('aria-hidden', 'true');
    ghosts.innerHTML = [1, 2, 3].map((k) => `<div class="mover" style="--lag:${k * 0.07}s"><div class="mover-y"><div class="ghost" style="height:${height}px;background:${color}"></div></div></div>`).join('');
    el.prepend(ghosts);
  }

  function showStamp(afterSeconds) {
    const stamp = slot('stamp');
    const n = state.notes.length;
    stamp.innerHTML = `<span><strong>${n} ${n === 1 ? 'note' : 'notes'}</strong><span class="hand">all for you</span></span>`;
    stamp.classList.remove('hidden');
    stamp.style.animation = 'none';
    void stamp.offsetWidth; // restart the animation
    stamp.style.animation = '';
    stamp.style.animationDelay = `${prefersReducedMotion() ? 0 : afterSeconds.toFixed(2)}s`;
  }

  function replay() {
    if (state.layout === 'deck') return renderDeck('deal-in');
    stopAllAudio();
    $$('.slot', grid).forEach((el) => { el.className = 'slot'; });
    void grid.offsetWidth;
    animateSlots($$('.slot', grid), { base: 0.15 });
  }

  // ── phone deck: one note at a time ───────────────────────
  function renderDeck(enter) {
    const deck = slot('deck');
    const n = state.notes.length;
    if (!n) { deck.innerHTML = '<div class="wall-empty"><p class="hand">no notes yet</p><p>Check back soon.</p></div>'; return; }
    state.deckIndex = Math.min(state.deckIndex, n - 1);
    const i = state.deckIndex;
    const next = state.notes[(i + 1) % n];
    deck.innerHTML = `
      <div class="deck-stack">
        ${n > 1 ? `<div class="deck-under" style="--note:${esc(next.color || '#FFE066')}"></div>` : ''}
        <div class="deck-card ${enter}" style="--r:${ROTATIONS[i % ROTATIONS.length] / 2}deg">${noteCard(state.notes[i], { expandable: true, index: i })}</div>
      </div>
      <div class="deck-dots" aria-hidden="true">${state.notes.slice(0, 12).map((_, k) => `<span class="${k === i % 12 ? 'on' : ''}"></span>`).join('')}</div>
      <div class="deck-nav">
        <button type="button" class="btn btn-soft" data-deck="-1">Back</button>
        <button type="button" class="btn btn-ink" data-deck="1">${i === n - 1 ? 'Start again' : 'Next note'}</button>
      </div>
      <p class="deck-count">${i + 1} of ${n}</p>`;
  }

  function moveDeck(delta) {
    const card = $('.deck-card', slot('deck'));
    stopAllAudio();
    card?.classList.add(delta > 0 ? 'fling-left' : 'fling-right');
    scope.timeout(() => {
      state.deckIndex = (state.deckIndex + delta + state.notes.length) % state.notes.length;
      renderDeck('deal-in');
    }, prefersReducedMotion() ? 0 : 450);
  }

  // ── focus overlay ────────────────────────────────────────
  function openFocus(index) {
    const note = state.notes[index];
    if (!note) return;
    const focus = slot('focus');
    focus.innerHTML = `
      <div class="focus-card">
        ${noteCard(note, { className: 'note-big', index })}
        <button type="button" class="focus-close" data-close aria-label="Close note">${ICONS.close}</button>
      </div>
      <button type="button" class="report-btn" data-report="${index}">Report this note</button>`;
    focus.classList.remove('hidden');
    $('[data-close]', focus).focus();
  }
  const closeFocus = () => { stopAllAudio(); slot('focus').classList.add('hidden'); slot('focus').innerHTML = ''; };

  // Reporting hides the note from this wall right away and flags it for us.
  // The first tap arms the button so a stray tap never removes a note.
  async function reportNote(btn) {
    if (!btn.dataset.confirming) {
      btn.dataset.confirming = 'true';
      btn.textContent = 'Tap again to report and hide it';
      return;
    }
    const index = Number(btn.dataset.report);
    const note = state.notes[index];
    btn.disabled = true;
    try {
      if (!demo) await api.reportNote(token, note.id);
      state.notes.splice(index, 1);
      closeFocus();
      if (state.layout === 'deck') renderDeck('');
      else renderGrid({ animate: false });
      toast(demo ? 'This is a demo, but that is exactly how reporting works.' : 'Thanks for telling us. That note is gone from your wall.', 'success');
    } catch (error) {
      toast(error.message, 'error');
      btn.disabled = false;
    }
  }

  // ── live updates ─────────────────────────────────────────
  async function poll() {
    if (demo || board.locked || wall.classList.contains('hidden')) return;
    try {
      const fresh = await api.getBoardByViewToken(token);
      const known = new Set(state.notes.map((n) => n.id));
      const added = (fresh.comments || []).filter((n) => !known.has(n.id));
      if (!added.length) return;
      const startIndex = state.notes.length;
      state.notes.push(...added);
      slot('from').textContent = `from ${state.notes.length} people who love you`;
      const stampCount = $('strong', slot('stamp'));
      if (stampCount) stampCount.textContent = `${state.notes.length} notes`; // only ever grows past 1 here
      if (state.layout === 'deck') return renderDeck('');
      if (startIndex === 0) return renderGrid();
      grid.insertAdjacentHTML('beforeend', added.map((note, k) => slotHTML(note, startIndex + k)).join(''));
      $$('.slot', grid).slice(startIndex).forEach((el) => el.classList.add('arrive'));
    } catch { /* offline for a moment; try again next time */ }
  }
  scope.interval(poll, POLL_MS);

  // ── events ───────────────────────────────────────────────
  scope.add(on(root, 'click', '[data-open]', open));
  scope.add(on(root, 'click', '[data-rewrap]', showIntro));
  scope.add(on(root, 'click', '[data-replay]', replay));
  scope.add(on(root, 'click', '[data-music]', () => music.toggle()));
  scope.add(on(root, 'click', '[data-style]', (event, btn) => {
    state.style = btn.dataset.style;
    $$('[data-style]', root).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    replay();
  }));
  scope.add(on(root, 'click', '[data-layout]', () => {
    state.layout = state.layout === 'deck' ? 'wall' : 'deck';
    applyLayout();
  }));
  scope.add(on(root, 'click', '[data-deck]', (event, btn) => moveDeck(Number(btn.dataset.deck))));
  scope.add(on(root, 'click', '[data-expand]', (event, btn) => openFocus(Number(btn.dataset.expand))));
  scope.add(on(root, 'click', '.wall-grid .note, .deck-card .note', (event, note) => {
    if (event.target.closest('button, a')) return; // voice + expand buttons handle themselves
    openFocus(Number(note.dataset.noteIndex));
  }));
  scope.add(on(root, 'click', '[data-report]', (event, btn) => reportNote(btn)));
  scope.add(on(root, 'click', '[data-slot="focus"]', (event) => {
    if (event.target.closest('[data-close]') || event.target === slot('focus')) closeFocus();
  }));
  const onKey = (event) => { if (event.key === 'Escape' && !slot('focus').classList.contains('hidden')) closeFocus(); };
  document.addEventListener('keydown', onKey);
  scope.add(() => document.removeEventListener('keydown', onKey));

  if (music) {
    const label = slot('music-label');
    const btn = $('[data-music]', root);
    const fixedLabel = label.textContent;
    scope.add(music.onChange((playing) => {
      btn.querySelector('.vinyl').classList.toggle('paused', !playing);
      btn.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
      label.textContent = playing ? fixedLabel : 'Music paused';
    }));
  }

  showIntro();
  document.title = `For ${name} · HypeWall`;
}
