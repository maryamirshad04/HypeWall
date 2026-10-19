// Whitelists and sanitizers for the optional board / note settings.
// Every field here is optional: anything missing or unknown falls back to a
// safe default, so older clients and older documents keep working unchanged.

const OPTIONS = {
  occasion: ['birthday', 'farewell', 'promotion', 'graduation', 'thanks', 'just-because'],
  wrapper: ['gift', 'envelope', 'mailbox', 'cake'],
  reveal_style: ['solitaire', 'deal', 'flash', 'rain', 'letter', 'polaroid'],
  bg_choice: ['paint', 'sketch', 'pattern', 'solid'],
  music_track: ['confetti-cannon', 'cake-at-2am', 'soft-goodbye', 'level-up'],
  font: ['hand', 'marker', 'clean'],
  shape: ['sticky', 'card', 'polaroid', 'bubble'],
  sticker: ['heart', 'star', 'sparkle', 'smile', 'crown', 'balloon'],
};

const MAX_STICKERS = 3;

function pick(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function toIsoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

// Settings chosen when a board is created
function boardSettings(body = {}) {
  return {
    occasion: pick(body.occasion, OPTIONS.occasion, 'birthday'),
    wrapper: pick(body.wrapper, OPTIONS.wrapper, 'gift'),
    reveal_style: pick(body.reveal_style, OPTIONS.reveal_style, 'solitaire'),
    bg_choice: pick(body.bg_choice, OPTIONS.bg_choice, 'paint'),
    music_track: pick(body.music_track, OPTIONS.music_track, null),
    unlock_at: toIsoDate(body.unlock_at),
    allow_anonymous: body.allow_anonymous !== false,
  };
}

// Styling chosen when a note is posted
function noteSettings(body = {}) {
  const stickers = Array.isArray(body.stickers) ? body.stickers : [];
  return {
    font: pick(body.font, OPTIONS.font, 'hand'),
    shape: pick(body.shape, OPTIONS.shape, 'sticky'),
    stickers: [...new Set(stickers.filter((s) => OPTIONS.sticker.includes(s)))].slice(0, MAX_STICKERS),
  };
}

// Boards created before unlock dates existed have no unlock_at, so never lock
function isLocked(board, now = new Date()) {
  return Boolean(board.unlock_at) && new Date(board.unlock_at) > now;
}

module.exports = { OPTIONS, boardSettings, noteSettings, isLocked };
