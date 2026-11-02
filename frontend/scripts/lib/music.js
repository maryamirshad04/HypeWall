// Board music. Plays an uploaded track (data URL) or one of the library tunes,
// which are synthesised live with the Web Audio API (no files to host).
//
//   const music = createMusic({ src, trackId });   // null when there is no music
//   await music.play(); music.pause(); music.toggle(); music.destroy();

const midiToHz = (n) => 440 * 2 ** ((n - 69) / 12);

// chords: one per bar (MIDI notes). steps: notes per bar. arp: pattern of chord indexes.
const TUNES = {
  'confetti-cannon': { bpm: 118, steps: 8, lead: 'triangle', leadGain: 0.13, arp: [0, 1, 2, 1, 0, 2, 1, 2], octave: 12, drums: true,
    chords: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]] },
  'cake-at-2am': { bpm: 76, steps: 8, lead: 'sine', leadGain: 0.1, arp: [0, -1, 2, -1, 3, -1, 1, -1], octave: 12, pad: 0.05, cutoff: 1400,
    chords: [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]] },
  'soft-goodbye': { bpm: 66, steps: 8, lead: 'triangle', leadGain: 0.12, arp: [0, 2, 1, 2, 0, 2, 1, 2], octave: 0, pad: 0.035, decay: 1.4,
    chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]] },
  'level-up': { bpm: 150, steps: 16, lead: 'square', leadGain: 0.045, arp: [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 2, 1, 3], octave: 12, drums: true,
    chords: [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]] },
};

function createSynth(trackId) {
  const tune = TUNES[trackId];
  let ctx = null;
  let master = null;
  let timer = null;
  let step = 0;
  let nextTime = 0;
  let noise = null;

  function voice(freq, start, length, type, gain, dest = master) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(gain, start + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(env).connect(dest);
    osc.start(start);
    osc.stop(start + length + 0.05);
  }

  function kick(start) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.frequency.setValueAtTime(140, start);
    osc.frequency.exponentialRampToValueAtTime(45, start + 0.12);
    env.gain.setValueAtTime(0.35, start);
    env.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    osc.connect(env).connect(master);
    osc.start(start);
    osc.stop(start + 0.2);
  }

  function hat(start) {
    const src = ctx.createBufferSource();
    const env = ctx.createGain();
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    src.buffer = noise;
    env.gain.setValueAtTime(0.05, start);
    env.gain.exponentialRampToValueAtTime(0.0001, start + 0.05);
    src.connect(hp).connect(env).connect(master);
    src.start(start);
    src.stop(start + 0.06);
  }

  function schedule() {
    const stepLength = 60 / tune.bpm / (tune.steps / 4);
    while (nextTime < ctx.currentTime + 0.15) {
      const bar = Math.floor(step / tune.steps) % tune.chords.length;
      const beat = step % tune.steps;
      const chord = tune.chords[bar];
      const index = tune.arp[beat];

      if (index >= 0 && index < chord.length) {
        voice(midiToHz(chord[index] + tune.octave), nextTime, stepLength * (tune.decay || 1.6), tune.lead, tune.leadGain);
      }
      if (beat === 0 || beat === tune.steps / 2) voice(midiToHz(chord[0] - 12), nextTime, stepLength * 3, 'sine', 0.16);
      if (beat === 0 && tune.pad) chord.forEach((n) => voice(midiToHz(n), nextTime, stepLength * tune.steps, 'sine', tune.pad));
      if (tune.drums) {
        if (beat % (tune.steps / 2) === 0) kick(nextTime);
        if (beat % 2 === 1) hat(nextTime);
      }

      nextTime += stepLength;
      step += 1;
    }
  }

  function setup() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    let out = master;
    if (tune.cutoff) {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = tune.cutoff;
      master.connect(lp);
      out = lp;
    }
    out.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  return {
    async play() {
      if (!ctx) setup();
      await ctx.resume();
      nextTime = ctx.currentTime + 0.05;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.6);
      clearInterval(timer);
      timer = setInterval(schedule, 50);
      schedule();
    },
    pause() {
      if (!ctx) return;
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      clearInterval(timer);
      timer = null;
    },
    destroy() {
      clearInterval(timer);
      if (ctx) ctx.close();
      ctx = null;
    },
  };
}

function createFilePlayer(src) {
  const audio = new Audio(src);
  audio.loop = true;
  audio.volume = 0.8;
  return {
    play: () => audio.play(),
    pause: () => audio.pause(),
    destroy: () => { audio.pause(); audio.src = ''; },
  };
}

export function createMusic({ src = null, trackId = null } = {}) {
  const engine = src ? createFilePlayer(src) : TUNES[trackId] ? createSynth(trackId) : null;
  if (!engine) return null;

  let playing = false;
  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn(playing));

  return {
    get playing() { return playing; },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    async play() {
      try {
        await engine.play();
        playing = true;
      } catch {
        playing = false; // autoplay blocked; the toggle invites a tap
      }
      emit();
    },
    pause() { engine.pause(); playing = false; emit(); },
    toggle() { return playing ? this.pause() : this.play(); },
    destroy() { engine.destroy(); playing = false; listeners.clear(); },
  };
}
