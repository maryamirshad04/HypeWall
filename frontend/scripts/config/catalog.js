// Everything a creator or contributor can pick. Ids match backend/validation.js.

export const OCCASIONS = [
  { id: 'birthday', label: 'Birthday', title: 'happy birthday' },
  { id: 'farewell', label: 'Farewell', title: 'we will miss you' },
  { id: 'promotion', label: 'Promotion', title: 'congrats on the promo' },
  { id: 'graduation', label: 'Graduation', title: 'happy graduation' },
  { id: 'thanks', label: 'Thank you', title: 'thank you' },
  { id: 'just-because', label: 'Just because', title: 'this is for you' },
];

// `bg` lists the background library for each vibe, first entry is the default.
// Artwork (paint/sketch) is the original HypeWall art in frontend/images.
export const VIBES = [
  { id: 'cottage-core', label: 'Cottage Core', sketch: 'images/cottage-core.jpeg', bg: [['paint', 'Original painting'], ['sketch', 'Mushroom sketch'], ['pattern', 'Garden dots'], ['solid', 'Sage']] },
  { id: 'dark-academia', label: 'Dark Academia', sketch: 'images/dark-academia.jpeg', bg: [['paint', 'Original painting'], ['sketch', 'Books sketch'], ['pattern', 'Candlelight'], ['solid', 'Espresso']] },
  { id: 'retro-90s', label: '90s Retro', sketch: 'images/retro-90s.jpeg', bg: [['paint', 'Original painting'], ['sketch', 'Vinyl sketch'], ['pattern', 'Checkerboard'], ['solid', 'Sunset']] },
  { id: 'tech-neon', label: 'Tech Neon', sketch: 'images/tech-neon.jpeg', bg: [['paint', 'Original painting'], ['sketch', 'City sketch'], ['pattern', 'Neon grid'], ['solid', 'Midnight']] },
  { id: 'professional', label: 'Clean Minimal', sketch: 'images/professional.jpeg', bg: [['paint', 'Original grid art'], ['sketch', 'Suitcase sketch'], ['pattern', 'Paper white'], ['solid', 'Soft grey']] },
  { id: 'sunset-party', label: 'Sunset Party', bg: [['solid', 'Sunset'], ['pattern', 'Confetti']] },
  { id: 'y2k-bubble', label: 'Y2K Bubble', bg: [['solid', 'Bubble'], ['pattern', 'Bubble dots']] },
];

export const REVEAL_STYLES = [
  { id: 'solitaire', label: 'Solitaire Cascade', short: 'Solitaire', hint: 'bouncy trails' },
  { id: 'deal', label: "Deal 'Em Out", short: 'Deal', hint: 'card dealer flair' },
  { id: 'flash', label: 'Paparazzi Flash', short: 'Flash', hint: 'pop + camera flash' },
  { id: 'rain', label: 'Confetti Rain', short: 'Rain', hint: 'tumble from the sky' },
  { id: 'letter', label: 'Love Letter', short: 'Love Letter', hint: 'one by one, slowly' },
  { id: 'polaroid', label: 'Polaroid Develop', short: 'Polaroid', hint: 'fade into colour' },
];

export const WRAPPERS = [
  { id: 'gift', label: 'Gift box', headline: 'we got you something.', action: 'Unwrap it' },
  { id: 'envelope', label: 'Envelope', headline: 'you have mail. lots of it.', action: 'Open the envelope' },
  { id: 'mailbox', label: 'Mailbox', headline: 'your mailbox is full.', action: 'Check the mailbox' },
  { id: 'cake', label: 'Cake', headline: 'make a wish first.', action: 'Blow out the candles' },
];

// Generated in the browser by lib/music.js, so there are no audio files to host
export const TRACKS = [
  { id: 'confetti-cannon', label: 'Confetti Cannon', mood: 'upbeat party pop', color: '#FF3D7F' },
  { id: 'cake-at-2am', label: 'Cake at 2am', mood: 'lofi, cosy, chill', color: '#B8E1FF' },
  { id: 'soft-goodbye', label: 'Soft Goodbye', mood: 'gentle piano, for farewells', color: '#E3D1FF' },
  { id: 'level-up', label: 'Level Up', mood: '8-bit arcade win', color: '#C9F2C7' },
];

export const NOTE_COLORS = [
  { name: 'lemon', hex: '#FFE066' }, { name: 'bubblegum', hex: '#FFB3C7' }, { name: 'sky', hex: '#B8E1FF' },
  { name: 'mint', hex: '#C9F2C7' }, { name: 'lilac', hex: '#E3D1FF' }, { name: 'peach', hex: '#FFD3A8' },
  { name: 'white', hex: '#FFFFFF' }, { name: 'pop pink', hex: '#FF3D7F' },
];

export const NOTE_FONTS = [
  { id: 'hand', label: 'Scribble' },
  { id: 'marker', label: 'Marker' },
  { id: 'clean', label: 'Clean' },
];

export const NOTE_SHAPES = [
  { id: 'sticky', label: 'Sticky note' },
  { id: 'card', label: 'Rounded card' },
  { id: 'polaroid', label: 'Polaroid' },
  { id: 'bubble', label: 'Speech bubble' },
];

export const STICKERS = {
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" fill="#FF3D7F"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 7 7 .6-5.3 4.7L18.3 22 12 18l-6.3 4 1.6-7.7L2 9.6 9 9z" fill="#FFC93C" stroke="#1B1325" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1l2.2 8.8L23 12l-8.8 2.2L12 23l-2.2-8.8L1 12l8.8-2.2z" fill="#8E5CFF"/></svg>',
  smile: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#3DDC97"/><path d="M7.5 14c2.5 3 6.5 3 9 0" stroke="#1B1325" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="9" cy="9.5" r="1.3" fill="#1B1325"/><circle cx="15" cy="9.5" r="1.3" fill="#1B1325"/></svg>',
  crown: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18l1.5-11 5 5L12 4l2.5 8 5-5L21 18z" fill="#FFC93C" stroke="#1B1325" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  balloon: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="9" rx="6" ry="7.5" fill="#5B8CFF"/><path d="M12 16.5c-1 2 1 3 0 6" stroke="#1B1325" stroke-width="1.5" fill="none"/></svg>',
};
export const MAX_STICKERS = 3;

const byId = (list, id) => list.find((item) => item.id === id);

export const findVibe = (id) => byId(VIBES, id) || byId(VIBES, 'professional');
export const findOccasion = (id) => byId(OCCASIONS, id) || OCCASIONS[0];
export const findWrapper = (id) => byId(WRAPPERS, id) || WRAPPERS[0];
export const findReveal = (id) => byId(REVEAL_STYLES, id) || REVEAL_STYLES[0];
export const findTrack = (id) => byId(TRACKS, id) || null;

// Background class for a vibe + library choice; unknown choices use the vibe's default
export function backgroundClass(vibeId, choice) {
  const vibe = findVibe(vibeId);
  const valid = vibe.bg.some(([id]) => id === choice);
  return `bg-${vibe.id}-${valid ? choice : vibe.bg[0][0]}`;
}
