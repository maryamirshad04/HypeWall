import { slimNav } from '../components/nav.js';
import { noteCard, bindAudioPlayers } from '../components/note.js';
import { api } from '../api.js';
import { $, $$, esc, on } from '../lib/dom.js';
import { imageToDataUrl, audioToDataUrl, totalTooLarge } from '../lib/media.js';
import { canRecord, startRecording, MAX_SECONDS } from '../lib/recorder.js';
import { toast } from '../lib/toast.js';
import { NOTE_COLORS, NOTE_FONTS, NOTE_SHAPES, STICKERS, MAX_STICKERS, backgroundClass, findOccasion } from '../config/catalog.js';
import { renderError } from './shared.js';

const SEND = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>';
const MIC = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
const IMAGE = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>';

const freshDraft = (author = '') => ({ message: '', author, color: NOTE_COLORS[0].hex, font: 'hand', shape: 'sticky', stickers: [], gif: null, audio: null });

export async function render(root, { boardId }, scope) {
  root.innerHTML = '<div class="loading">finding the wall...</div>';
  let board;
  try {
    board = await api.getBoard(boardId);
  } catch (error) {
    return renderError(root, error);
  }

  const needsName = board.allow_anonymous === false;
  const name = esc(board.recipient_name);
  let draft = freshDraft();
  let recording = null;
  scope.add(() => recording?.stop().catch(() => {}));

  const pressed = (group, value, current, inner, cls = 'chip', extra = '') =>
    `<button type="button" class="${cls}" data-group="${group}" data-value="${esc(value)}" aria-pressed="${value === current}" ${extra}>${inner}</button>`;

  root.innerHTML = `
    <div class="page grain">
      ${slimNav(`<span class="wall-chip"><span class="wall-chip-thumb wallpaper ${backgroundClass(board.aesthetic, board.bg_choice)}"></span>${name}'s ${esc(findOccasion(board.occasion).label.toLowerCase())} wall · <span data-slot="count">...</span></span>`)}
      <main class="container contribute">
        <h1 class="h-xl">say something nice<br>to <span style="color:var(--pop)">${name}.</span></h1>
        <p class="lead" style="margin:6px 0 36px">Or something funny. Or both.${board.unlock_at ? ` It opens on ${new Date(board.unlock_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}.` : ''}</p>

        <div class="contribute-layout">
          <form class="contribute-form" novalidate>
            <section class="card">
              <label class="field-label" for="noteMessage">Your message</label>
              <textarea id="noteMessage" class="input note-input" rows="4" maxlength="1000" placeholder="happy birthday to the funniest person in every room..."></textarea>
              <div class="form-pair">
                <div>
                  <label class="field-label" for="noteAuthor">From${needsName ? '' : ' <span class="optional">optional</span>'}</label>
                  <input id="noteAuthor" class="input" maxlength="60" placeholder="${needsName ? 'Your name' : 'Anonymous'}" autocomplete="name">
                </div>
                <div>
                  <p class="field-label">Handwriting</p>
                  <div class="option-row">${NOTE_FONTS.map((f) => pressed('font', f.id, draft.font, f.label, `chip font-chip-${f.id}`)).join('')}</div>
                </div>
              </div>
            </section>

            <section class="card">
              <p class="field-label">Note colour</p>
              <div class="option-row" style="align-items:center">
                ${NOTE_COLORS.map((c) => pressed('color', c.hex, draft.color, '', 'color-dot', `aria-label="${c.name}" style="background:${c.hex}"`)).join('')}
                <label class="chip custom-color">Any colour <input type="color" data-custom-color value="#FFE066"></label>
              </div>
              <p class="field-label" style="margin-top:22px">Note style</p>
              <div class="option-row">${NOTE_SHAPES.map((s) => pressed('shape', s.id, draft.shape, s.label)).join('')}</div>
            </section>

            <section class="card">
              <div class="tabs" role="tablist" aria-label="Add media">
                <button type="button" role="tab" class="tab" aria-selected="true" aria-controls="panel-media" data-tab="media">GIF or photo</button>
                <button type="button" role="tab" class="tab" aria-selected="false" aria-controls="panel-voice" data-tab="voice">Voice note</button>
                <button type="button" role="tab" class="tab" aria-selected="false" aria-controls="panel-stickers" data-tab="stickers">Stickers</button>
              </div>
              <div id="panel-media" role="tabpanel" class="tab-panel">
                <label class="drop-zone">
                  ${IMAGE}
                  <strong data-slot="media-label">Add a GIF or a photo</strong>
                  <span class="chip" aria-hidden="true">Choose from device</span>
                  <input type="file" accept="image/*" data-upload="gif" class="sr-only">
                </label>
                <button type="button" class="text-link remove-link hidden" data-remove="gif">Remove image</button>
              </div>
              <div id="panel-voice" role="tabpanel" class="tab-panel hidden">
                <div class="voice-recorder">
                  ${canRecord() ? `<button type="button" class="rec-btn" data-record aria-label="Start recording">${MIC}</button>` : ''}
                  <div>
                    <div class="disp rec-title" data-slot="rec-title">${canRecord() ? 'tap to record' : 'upload a voice note'}</div>
                    <div class="rec-hint">up to ${MAX_SECONDS} seconds. singing is encouraged.</div>
                    <div class="rec-actions">
                      <label class="btn btn-soft btn-sm">Upload audio<input type="file" accept="audio/*" data-upload="audio" class="sr-only"></label>
                      <button type="button" class="btn btn-soft btn-sm hidden" data-remove="audio">Remove</button>
                    </div>
                  </div>
                </div>
              </div>
              <div id="panel-stickers" role="tabpanel" class="tab-panel hidden">
                <p class="step-hint">Pick up to ${MAX_STICKERS}.</p>
                <div class="option-row">${Object.entries(STICKERS).map(([id, svg]) => `<button type="button" class="sticker-btn" data-sticker="${id}" aria-pressed="false" aria-label="${id} sticker">${svg}</button>`).join('')}</div>
              </div>
            </section>

            <div class="post-row">
              <button type="submit" class="btn btn-ink btn-lg" data-slot="post">Stick it on the wall ${SEND}</button>
            </div>
          </form>

          <aside class="contribute-preview" aria-label="Your note preview">
            <p class="kicker" style="color:var(--ink);font-size:13px;margin-bottom:10px">how it'll look</p>
            <div class="preview-wall wallpaper ${backgroundClass(board.aesthetic, board.bg_choice)}">
              <div class="peek" aria-hidden="true" style="left:-30px;top:30px;background:#B8E1FF;transform:rotate(-12deg)"></div>
              <div class="peek" aria-hidden="true" style="right:-20px;top:60px;background:#C9F2C7;transform:rotate(10deg)"></div>
              <div class="peek" aria-hidden="true" style="right:30px;bottom:-30px;background:#E3D1FF;transform:rotate(-6deg)"></div>
              <div class="preview-note" data-slot="preview"></div>
              <p class="peek-caption">other notes stay blurred. no peeking.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>`;

  const slot = (n) => $(`[data-slot="${n}"]`, root);
  const message = $('#noteMessage', root);
  const author = $('#noteAuthor', root);

  function refreshPreview() {
    const shown = { ...draft, message: draft.message || 'your message shows up here', author: draft.author || (needsName ? 'you' : 'Anonymous') };
    slot('preview').innerHTML = noteCard(shown, { className: 'preview-tilt' });
    slot('media-label').textContent = draft.gif ? 'Image added. Pick another?' : 'Add a GIF or a photo';
    $('[data-remove="gif"]', root).classList.toggle('hidden', !draft.gif);
    $('[data-remove="audio"]', root).classList.toggle('hidden', !draft.audio);
    if (!recording) slot('rec-title').textContent = draft.audio ? 'voice note added' : canRecord() ? 'tap to record' : 'upload a voice note';
  }

  const markGroup = (group) => $$(`[data-group="${group}"]`, root).forEach((el) => el.setAttribute('aria-pressed', String(el.dataset.value === draft[group])));

  message.addEventListener('input', () => { draft.message = message.value; refreshPreview(); });
  author.addEventListener('input', () => { draft.author = author.value; refreshPreview(); });
  scope.add(bindAudioPlayers(slot('preview')));

  scope.add(on(root, 'click', '[data-group]', (event, el) => {
    draft[el.dataset.group] = el.dataset.value;
    markGroup(el.dataset.group);
    refreshPreview();
  }));
  scope.add(on(root, 'input', '[data-custom-color]', (event, input) => {
    draft.color = input.value;
    markGroup('color');
    refreshPreview();
  }));

  scope.add(on(root, 'click', '[data-tab]', (event, tab) => {
    $$('[data-tab]', root).forEach((t) => {
      const active = t === tab;
      t.setAttribute('aria-selected', String(active));
      $(`#${t.getAttribute('aria-controls')}`, root).classList.toggle('hidden', !active);
    });
  }));

  scope.add(on(root, 'click', '[data-sticker]', (event, btn) => {
    const id = btn.dataset.sticker;
    if (draft.stickers.includes(id)) draft.stickers = draft.stickers.filter((s) => s !== id);
    else if (draft.stickers.length < MAX_STICKERS) draft.stickers = [...draft.stickers, id];
    else return toast(`Max ${MAX_STICKERS} stickers per note.`, 'error');
    $$('[data-sticker]', root).forEach((b) => b.setAttribute('aria-pressed', String(draft.stickers.includes(b.dataset.sticker))));
    refreshPreview();
  }));

  scope.add(on(root, 'change', '[data-upload]', async (event, input) => {
    const file = input.files[0];
    if (!file) return;
    try {
      if (input.dataset.upload === 'gif') draft.gif = await imageToDataUrl(file);
      else draft.audio = await audioToDataUrl(file);
      refreshPreview();
    } catch (error) {
      toast(error.message, 'error');
    }
    input.value = '';
  }));
  scope.add(on(root, 'click', '[data-remove]', (event, btn) => {
    draft[btn.dataset.remove] = null;
    refreshPreview();
  }));

  scope.add(on(root, 'click', '[data-record]', async (event, btn) => {
    if (recording) {
      btn.disabled = true;
      try {
        const { dataUrl } = await recording.stop();
        draft.audio = dataUrl;
      } catch (error) {
        toast(error.message, 'error');
      }
      recording = null;
      btn.disabled = false;
      btn.classList.remove('recording');
      btn.setAttribute('aria-label', 'Start recording');
      refreshPreview();
      return;
    }
    try {
      recording = await startRecording({ onTick: (s) => { slot('rec-title').textContent = `recording... 0:${String(s).padStart(2, '0')}`; } });
      btn.classList.add('recording');
      btn.setAttribute('aria-label', 'Stop recording');
      slot('rec-title').textContent = 'recording... 0:00';
      // the recorder stops itself at the limit; finish this recording in the UI too
      const current = recording;
      scope.timeout(() => recording === current && btn.click(), MAX_SECONDS * 1000 + 200);
    } catch {
      toast('We could not reach your microphone. Check the browser permission, or upload a clip instead.', 'error');
    }
  }));

  $('.contribute-form', root).addEventListener('submit', async (event) => {
    event.preventDefault();
    if (recording) return toast('Stop the recording first.', 'error');
    const note = { ...draft, message: draft.message.trim(), author: draft.author.trim() };
    if (!note.message && !note.gif && !note.audio) {
      toast('Write something, or add a GIF or voice note.', 'error');
      return message.focus();
    }
    if (needsName && !note.author) {
      toast('This wall needs a name on every note.', 'error');
      return author.focus();
    }
    if (totalTooLarge(note.gif, note.audio)) return toast('Your image and voice note are too large together. Try smaller files.', 'error');

    const post = slot('post');
    post.disabled = true;
    try {
      await api.addComment(board.id, { ...note, author: note.author || 'Anonymous' });
      $('.preview-tilt', root)?.classList.add('fly-away');
      scope.timeout(showSent, 900);
    } catch (error) {
      toast(error.message, 'error');
      post.disabled = false;
    }
  });

  function showSent() {
    slot('preview').innerHTML = `
      <div class="sent-card">
        <div class="disp sent-title">sent!</div>
        <p>Your note is on the wall. ${name} is going to love it.</p>
        <button type="button" class="chip" data-another>Write another</button>
      </div>`;
    refreshCount();
  }

  scope.add(on(root, 'click', '[data-another]', () => {
    draft = freshDraft(draft.author);
    message.value = '';
    slot('post').disabled = false;
    $$('[data-sticker]', root).forEach((b) => b.setAttribute('aria-pressed', 'false'));
    ['color', 'font', 'shape'].forEach(markGroup);
    refreshPreview();
    message.focus();
  }));

  async function refreshCount() {
    try {
      const { comment_count: n } = await api.getStats(board.id);
      slot('count').textContent = `${n} ${n === 1 ? 'note' : 'notes'}`;
    } catch { /* not critical */ }
  }

  refreshPreview();
  refreshCount();
  document.title = `A note for ${board.recipient_name} · HypeWall`;
}
