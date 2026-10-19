import { slimNav } from '../components/nav.js';
import { revealDemo } from '../components/revealDemos.js';
import { wrapperIcon } from '../components/wrappers.js';
import { api } from '../api.js';
import { navigate } from '../router.js';
import { $, $$, esc, on } from '../lib/dom.js';
import { imageToDataUrl, audioToDataUrl, totalTooLarge } from '../lib/media.js';
import { createMusic } from '../lib/music.js';
import { toast } from '../lib/toast.js';
import { OCCASIONS, VIBES, TRACKS, REVEAL_STYLES, WRAPPERS, findVibe, findOccasion, findReveal, findWrapper, findTrack, backgroundClass } from '../config/catalog.js';

const PLAY = '<svg width="14" height="16" viewBox="0 0 12 14" aria-hidden="true"><path d="M1 1l10 6-10 6z" fill="currentColor"/></svg>';
const ARROW = '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// One pressable option inside a single-choice group
const option = (group, value, selected, inner, cls = 'chip') =>
  `<button type="button" class="${cls}" data-group="${group}" data-value="${esc(value)}" aria-pressed="${value === selected}">${inner}</button>`;

const step = (n, id, title, hint, body) => `
  <section class="card create-step" aria-labelledby="${id}" style="animation-delay:${n * 0.06}s">
    ${n ? `<p class="kicker" style="font-size:13px">step ${n}</p>` : ''}
    <h2 id="${id}" class="step-title">${title}</h2>
    ${hint ? `<p class="step-hint">${hint}</p>` : ''}
    ${body}
  </section>`;

export function render(root, params, scope) {
  const startVibe = VIBES.some((v) => v.id === params.vibe) ? params.vibe : 'cottage-core';
  const state = {
    name: '',
    occasion: 'birthday',
    vibe: startVibe,
    bg: findVibe(startVibe).bg[0][0], // library choice, or 'custom' for an uploaded photo
    bgImage: null,
    track: TRACKS[0].id,              // a library id, 'upload' or 'none'
    bgAudio: null,
    bgAudioName: '',
    reveal: 'solitaire',
    wrapper: 'gift',
    lock: false,
    unlockAt: '',
    anonymous: true,
  };
  let preview = null; // music preview player
  scope.add(() => preview?.destroy());

  const vibeTiles = () => VIBES.map((v) =>
    option('vibe', v.id, state.vibe, `<span>${v.label}</span>`, `vibe-tile wallpaper ${backgroundClass(v.id, v.bg[0][0])}`)).join('');

  const library = () => {
    const vibe = findVibe(state.vibe);
    const items = vibe.bg.map(([id, label]) => option('bg', id, state.bg, `<span>${label}</span>`, `lib-item wallpaper ${backgroundClass(vibe.id, id)}`)).join('');
    const custom = state.bgImage
      ? `<button type="button" class="lib-item wallpaper" data-group="bg" data-value="custom" aria-pressed="${state.bg === 'custom'}" style="background-image:url('${state.bgImage}')"><span>Your photo</span></button>`
      : '';
    return `${items}${custom}
      <label class="lib-item lib-upload">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        <span>${state.bgImage ? 'Change photo' : 'Your own photo'}</span>
        <input type="file" accept="image/*" data-upload="bg" class="sr-only">
      </label>`;
  };

  const trackRow = (t) => option('track', t.id, state.track, `
    <span class="track-play" style="background:${t.color}">${PLAY}</span>
    <span class="track-text"><strong>${t.label}</strong><small>${t.mood}</small></span>
    <span class="track-eq" aria-hidden="true"><i class="bar"></i><i class="bar"></i><i class="bar"></i><i class="bar"></i></span>`, 'track');

  root.innerHTML = `
    <div class="page grain">
      ${slimNav('<a class="text-link" href="./" data-link>Cancel</a>')}
      <main class="container create">
        <h1 class="h-xl">let's build the wall.</h1>
        <p class="lead" style="margin:8px 0 40px">Takes about a minute.</p>
        <div class="create-layout">
          <form class="create-form" novalidate>
            ${step(1, 's-who', "who's the star?", '', `
              <label class="field-label" for="recipient">Their name</label>
              <input id="recipient" class="input input-lg" maxlength="60" placeholder="e.g. Amna" autocomplete="off" required>
              <p class="field-label" style="margin-top:22px">What are we celebrating?</p>
              <div class="option-row">${OCCASIONS.map((o) => option('occasion', o.id, state.occasion, o.label)).join('')}</div>`)}

            ${step(2, 's-vibe', 'pick a vibe', 'The art is hand-painted and hand-sketched, made just for HypeWall.', `
              <div class="vibe-grid" data-slot="vibes">${vibeTiles()}</div>
              <div class="library">
                <p class="field-label" data-slot="library-title">${findVibe(state.vibe).label} background library</p>
                <div class="library-grid" data-slot="library">${library()}</div>
              </div>`)}

            ${step(3, 's-music', 'set the soundtrack', 'Fades in when they open the wall. They can mute it anytime. Tap a track to hear it.', `
              <div class="track-list">
                ${TRACKS.map(trackRow).join('')}
                ${option('track', 'none', state.track, '<span class="track-play" style="background:var(--paper)">&times;</span><span class="track-text"><strong>No music</strong><small>silence is golden too</small></span>', 'track')}
                <div data-slot="upload-track"></div>
              </div>
              <label class="btn btn-soft btn-sm" style="margin-top:14px">
                Upload your own track
                <input type="file" accept="audio/*" data-upload="audio" class="sr-only">
              </label>`)}

            ${step(4, 's-reveal', 'how should the notes land?', 'Watch the preview change.', `
              <div class="reveal-options">${REVEAL_STYLES.map((r) => option('reveal', r.id, state.reveal, `<strong>${r.label}</strong><small>${r.hint}</small>`, 'chip chip-tall')).join('')}</div>`)}

            ${step(5, 's-wrap', 'how do they unwrap it?', 'The first thing they see. They tap it open to start the reveal.', `
              <div class="wrap-options">${WRAPPERS.map((w) => option('wrapper', w.id, state.wrapper, `${wrapperIcon(w.id)}${w.label}`, 'wrap-option')).join('')}</div>`)}

            ${step(0, 's-extras', 'extras', '', `
              <div class="extra-row">
                <button type="button" class="toggle" role="switch" aria-checked="false" data-toggle="lock" aria-labelledby="lock-label"></button>
                <div><div id="lock-label" class="extra-title">Keep it a secret until the day</div><div class="extra-sub">Notes stay hidden until a date you pick, with a countdown.</div></div>
              </div>
              <div class="extra-date hidden" data-slot="date">
                <label class="field-label" for="unlockAt">Unlocks on</label>
                <input id="unlockAt" class="input" type="datetime-local">
              </div>
              <div class="extra-row">
                <button type="button" class="toggle" role="switch" aria-checked="true" data-toggle="anonymous" aria-labelledby="anon-label"></button>
                <div><div id="anon-label" class="extra-title">Allow anonymous notes</div><div class="extra-sub">For the shy ones.</div></div>
              </div>`)}

            <button type="submit" class="btn btn-ink btn-lg create-submit">Create the wall ${ARROW}</button>
          </form>

          <aside class="create-preview" aria-label="Live preview">
            <p class="kicker" style="color:var(--ink);font-size:13px;margin-bottom:10px">live preview</p>
            <div class="preview-card wallpaper" data-slot="preview-bg">
              <div class="preview-top">
                <span class="preview-pill" data-slot="occasion-label"></span>
                <span class="preview-pill preview-pill-dark"><span class="vinyl" style="width:22px;height:22px"></span><span data-slot="track-label"></span></span>
              </div>
              <div class="paper-panel">
                <p class="hand" style="margin:0;font-size:26px">a wall for</p>
                <p class="preview-name" data-slot="name">their name</p>
              </div>
              <div data-slot="stage"></div>
              <div class="preview-tags">
                <span class="paper-panel preview-tag" data-slot="reveal-label"></span>
                <span class="paper-panel preview-tag" data-slot="wrap-label"></span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>`;

  const form = $('.create-form', root);
  const slot = (name) => $(`[data-slot="${name}"]`, root);

  function trackLabel() {
    if (state.track === 'upload') return state.bgAudioName || 'Your track';
    if (state.track === 'none') return 'No music';
    return findTrack(state.track).label;
  }

  function refreshPreview({ stage = false } = {}) {
    const bg = slot('preview-bg');
    bg.className = `preview-card wallpaper ${state.bg === 'custom' ? '' : backgroundClass(state.vibe, state.bg)}`;
    bg.style.backgroundImage = state.bg === 'custom' && state.bgImage ? `url("${state.bgImage}")` : '';
    slot('name').textContent = state.name.trim() || 'their name';
    slot('occasion-label').textContent = findOccasion(state.occasion).label;
    slot('track-label').textContent = trackLabel();
    slot('reveal-label').textContent = `Reveal: ${findReveal(state.reveal).label}`;
    slot('wrap-label').textContent = `Unwraps from: ${findWrapper(state.wrapper).label.toLowerCase()}`;
    if (stage) slot('stage').innerHTML = revealDemo(state.reveal);
  }

  function refreshLibrary() {
    slot('library-title').textContent = `${findVibe(state.vibe).label} background library`;
    slot('library').innerHTML = library();
  }

  function refreshUploadTrack() {
    slot('upload-track').innerHTML = state.bgAudio
      ? option('track', 'upload', state.track, `<span class="track-play" style="background:var(--sun)">${PLAY}</span><span class="track-text"><strong>${esc(state.bgAudioName)}</strong><small>your upload</small></span>`, 'track')
      : '';
  }

  function markGroup(group) {
    $$(`[data-group="${group}"]`, root).forEach((el) => el.setAttribute('aria-pressed', String(el.dataset.value === state[group])));
  }

  async function previewTrack(id) {
    const replay = preview && preview.id === id && preview.playing;
    preview?.destroy();
    preview = null;
    if (replay || id === 'none') return refreshEq();
    const player = createMusic(id === 'upload' ? { src: state.bgAudio } : { trackId: id });
    if (!player) return refreshEq();
    player.id = id;
    preview = player;
    player.onChange(refreshEq);
    await player.play();
  }

  function refreshEq() {
    $$('.track', root).forEach((el) => el.classList.toggle('previewing', Boolean(preview?.playing) && preview.id === el.dataset.value));
  }

  // single-choice groups
  scope.add(on(root, 'click', '[data-group]', (event, el) => {
    const { group, value } = el.dataset;
    state[group] = value;
    if (group === 'vibe') {
      state.bg = findVibe(value).bg[0][0];
      refreshLibrary();
    }
    markGroup(group);
    if (group === 'track') previewTrack(value);
    refreshPreview({ stage: group === 'reveal' });
  }));

  // toggles
  scope.add(on(root, 'click', '[data-toggle]', (event, el) => {
    const key = el.dataset.toggle;
    state[key] = !state[key];
    el.setAttribute('aria-checked', String(state[key]));
    if (key === 'lock') {
      slot('date').classList.toggle('hidden', !state.lock);
      if (state.lock) $('#unlockAt', root).focus();
    }
  }));

  // uploads
  scope.add(on(root, 'change', '[data-upload]', async (event, input) => {
    const file = input.files[0];
    if (!file) return;
    try {
      if (input.dataset.upload === 'bg') {
        state.bgImage = await imageToDataUrl(file);
        state.bg = 'custom';
        refreshLibrary();
      } else {
        state.bgAudio = await audioToDataUrl(file);
        state.bgAudioName = file.name;
        state.track = 'upload';
        refreshUploadTrack();
        markGroup('track');
      }
      refreshPreview();
    } catch (error) {
      toast(error.message, 'error');
    }
    input.value = '';
  }));

  const recipient = $('#recipient', root);
  recipient.addEventListener('input', () => { state.name = recipient.value; refreshPreview(); });
  const unlockInput = $('#unlockAt', root);
  unlockInput.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  unlockInput.addEventListener('input', () => { state.unlockAt = unlockInput.value; });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = state.name.trim();
    if (!name) {
      toast('Who is the wall for? Add their name first.', 'error');
      return recipient.focus();
    }
    if (state.lock && (!state.unlockAt || new Date(state.unlockAt) <= new Date())) {
      toast('Pick an unlock date in the future, or turn the secret off.', 'error');
      return unlockInput.focus();
    }
    const bgImage = state.bg === 'custom' ? state.bgImage : null;
    const bgAudio = state.track === 'upload' ? state.bgAudio : null;
    if (totalTooLarge(bgImage, bgAudio)) {
      toast('Your photo and music are too large together. Try a smaller image or a shorter track.', 'error');
      return;
    }

    const submit = $('.create-submit', root);
    submit.disabled = true;
    submit.textContent = 'Creating...';
    try {
      const board = await api.createBoard({
        aesthetic: state.vibe,
        recipient_name: name,
        bg_image: bgImage,
        bg_audio: bgAudio,
        occasion: state.occasion,
        wrapper: state.wrapper,
        reveal_style: state.reveal,
        bg_choice: state.bg === 'custom' ? findVibe(state.vibe).bg[0][0] : state.bg,
        music_track: TRACKS.some((t) => t.id === state.track) ? state.track : null,
        unlock_at: state.lock ? new Date(state.unlockAt).toISOString() : null,
        allow_anonymous: state.anonymous,
      });
      toast('Wall created!', 'success');
      navigate(`?board=${encodeURIComponent(board.id)}`);
    } catch (error) {
      toast(error.message, 'error');
      submit.disabled = false;
      submit.innerHTML = `Create the wall ${ARROW}`;
    }
  });

  refreshPreview({ stage: true });
  document.title = 'Create a wall · HypeWall';
}
