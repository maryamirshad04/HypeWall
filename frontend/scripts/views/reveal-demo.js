// Sample wall for ?page=demo ("Watch a reveal" on the landing page). Never saved.

const note = (id, author, message, color, extra = {}) => ({ id: `demo-${id}`, author, message, color, font: 'hand', shape: 'sticky', stickers: [], gif: null, audio: null, ...extra });

export const DEMO_BOARD = {
  id: 'demo',
  recipient_name: 'Amna',
  aesthetic: 'cottage-core',
  bg_choice: 'paint',
  occasion: 'birthday',
  wrapper: 'gift',
  reveal_style: 'solitaire',
  music_track: 'confetti-cannon',
  bg_image: null,
  bg_audio: null,
  comments: [
    note(1, 'sana', 'happy birthday you absolute legend!! 25 looks illegal on you', '#FFE066', { stickers: ['crown'] }),
    note(2, 'bilal', 'the office is literally not the same without your playlist', '#B8E1FF', { font: 'marker' }),
    note(3, 'the trip squad', 'hunza 2025. never forget.', '#FFB3C7', { shape: 'polaroid', gif: 'images/cottage-core.jpeg' }),
    note(4, 'zara', 'funniest person in every room. this year is yours!!', '#FFB3C7', { stickers: ['heart', 'sparkle'] }),
    note(5, 'mama', 'my baby is 25. i am not okay. love you jaan', '#E3D1FF', { shape: 'card' }),
    note(6, 'omar', 'still owe you biryani. consider this the IOU', '#C9F2C7', { font: 'marker' }),
    note(7, 'noor', 'you made uni bearable. that is a huge deal', '#FFD3A8', { shape: 'bubble' }),
    note(8, 'hamza', 'me at your party', '#FFFFFF', { shape: 'polaroid', gif: 'images/retro-90s.jpeg' }),
    note(9, 'fatima', 'you are the reason group projects were fun. happy birthday!', '#1B1325', { font: 'clean', shape: 'card' }),
    note(10, 'danish', 'cake cake cake', '#FFE066', { stickers: ['balloon', 'star'] }),
    note(11, 'ayesha', 'never change. okay maybe change your alarm tone', '#B8E1FF', { shape: 'bubble' }),
    note(12, 'Anonymous', 'secret admirer? maybe. happy birthday', '#FFF6EC', { font: 'marker' }),
  ],
};
