import { mainNav } from '../components/nav.js';
import { VIBES, backgroundClass } from '../config/catalog.js';
import { revealDemo } from '../components/revealDemos.js';

const HEADLINE = ['hype', 'them'];
const ROLLING = ['birthday.', 'farewell.', 'big promo.', 'graduation.', 'wedding.', 'birthday.'];
const OCCASION_BAND = ['birthdays', 'farewells', 'promotions', 'thank you, teacher', 'new baby', 'get well soon', 'retirements', 'work anniversaries'];
const LOVE_BAND = ['you made my whole year', 'never change', 'proud of you', 'the office is not the same', 'happy 25th!!', 'you deserve it all'];
const MANIFESTO = 'appreciation should never have a checkout page. so we built a wall where everyone shows up for the people they love, all at once, out loud, and completely free.';
const MARKED = new Set(['checkout', 'page.', 'out', 'loud,', 'free.']);

const ARROW_RIGHT = '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Letters drop in one after another
function dropLetters(word, start, cls = '') {
  const letters = [...word].map((ch, i) => `<span class="ch ${cls}" style="animation-delay:${(start + i * 0.05).toFixed(2)}s">${ch}</span>`).join('');
  return `<span class="word">${letters}</span>`;
}

const band = (items) => {
  const run = items.map((t) => `<span>${t}</span><span class="star"></span>`).join('');
  return run + run; // doubled so the loop is seamless
};

const BAR_HEIGHTS = [20, 44, 30, 56, 24, 48, 34, 52];
const bars = (n, color = 'var(--ink)', scale = 1) =>
  Array.from({ length: n }, (_, i) => `<span class="bar" style="height:${Math.round(BAR_HEIGHTS[i % 8] * scale)}px;background:${color};animation-delay:${(i * 0.1).toFixed(1)}s"></span>`).join('');

function hero() {
  return `
  <section class="hero">
    <div class="fnote" style="left:2%;top:70px;animation-delay:1.5s">
      <div class="fnote-in paper-note" style="--r:-7deg;width:210px;background:#FFE066"><span class="tape"></span>happy birthday you absolute legend!!<small>— sana</small></div>
    </div>
    <div class="fnote" style="right:3%;top:40px;animation-delay:1.7s">
      <div class="fnote-in" style="--r:6deg;width:190px;padding:10px;background:#fff;border-radius:6px;text-align:left;animation-delay:-2s">
        <div class="gif-shimmer" style="height:120px;border-radius:4px"></div>
        <div class="hand" style="font-size:20px;margin-top:6px">me at your party</div>
      </div>
    </div>
    <div class="fnote" style="left:6%;top:360px;animation-delay:1.9s">
      <div class="fnote-in" style="--r:4deg;width:230px;padding:14px;background:var(--ink);color:var(--paper);border-radius:16px;text-align:left;animation-delay:-4s">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="width:34px;height:34px;border-radius:50%;background:var(--pop);display:grid;place-items:center"><svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true"><path d="M1 1l10 6-10 6z" fill="#1B1325"/></svg></span>
          <span style="display:flex;align-items:center;gap:3px;height:30px">${bars(9, 'var(--sun)', 0.5)}</span>
        </div>
        <div style="font-size:12px;margin-top:8px;opacity:.8">voice note from ali · 0:14</div>
      </div>
      <span class="annot" style="left:40px;top:118px;font-size:24px;transform:rotate(-4deg);animation-delay:2.6s">an actual voice note!</span>
      <svg class="arrow annot" width="60" height="56" viewBox="0 0 60 56" aria-hidden="true" style="left:6px;top:96px;animation-delay:2.6s"><path d="M40 50C20 46 8 34 14 8M14 8L6 18M14 8L22 16" stroke="#C2185B" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" style="animation-delay:2.7s"/></svg>
    </div>
    <div class="fnote" style="right:5%;top:330px;animation-delay:2.1s">
      <div class="fnote-in paper-note" style="--r:-5deg;width:200px;background:#B8E1FF;font-size:23px;animation-delay:-1s"><span class="tape"></span>best manager i have ever had. going to miss you so much<small>— the design team</small></div>
    </div>

    <div class="hero-inner">
      <p class="hero-badge"><span class="pulse"></span>free forever. no paywall. no checkout page.</p>
      <h1 class="hero-title" aria-label="Hype them up for their birthday">
        <span class="line" aria-hidden="true">${dropLetters(HEADLINE[0], 0.05)}&nbsp;${dropLetters(HEADLINE[1], 0.3)}&nbsp;${dropLetters('up', 0.55, 'pop')}</span>
        <span class="line line-2" aria-hidden="true">
          <span class="ch" style="animation-delay:.75s;font-weight:600">for their</span>
          <span class="roll ch" style="animation-delay:.85s"><span class="roll-in">${ROLLING.map((w) => `<span>${w}</span>`).join('')}</span></span>
        </span>
      </h1>
      <svg class="squig" width="360" height="28" viewBox="0 0 360 28" aria-hidden="true"><path d="M4 18C40 2 70 30 110 14S180 2 220 16S300 28 356 10" stroke="#FFC93C" stroke-width="7" fill="none" stroke-linecap="round"/></svg>
      <p class="hero-sub">One link. Everyone drops a note, a GIF, a voice memo. Then they open it and the whole wall comes flying in, set to a song.</p>
      <div class="hero-ctas">
        <span class="annot" style="right:calc(100% + 64px);top:-34px;font-size:26px;transform:rotate(-6deg);animation-delay:2.4s">takes like 60 seconds</span>
        <svg class="arrow annot" width="90" height="70" viewBox="0 0 90 70" aria-hidden="true" style="right:calc(100% + 4px);top:-6px;animation-delay:2.4s"><path d="M6 8C30 0 52 6 50 26C48 42 26 40 34 28C42 16 66 30 78 50M66 46L79 52L80 38" stroke="#C2185B" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="animation-delay:2.5s"/></svg>
        <a class="btn btn-ink btn-lg" href="?page=create" data-link>Start a wall, it's free ${ARROW_RIGHT}</a>
        <a class="btn btn-ghost btn-lg" href="?page=demo" data-link><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2l11 6-11 6z" fill="currentColor"/></svg>Watch a reveal</a>
        <span class="annot" style="left:calc(100% + 70px);top:40px;font-size:26px;transform:rotate(5deg);animation-delay:2.8s">and free. forever.</span>
        <svg class="arrow annot" width="80" height="60" viewBox="0 0 80 60" aria-hidden="true" style="left:calc(100% + 4px);top:10px;animation-delay:2.8s"><path d="M74 44C54 54 30 50 22 30C16 16 12 12 6 10M6 10L16 6M6 10L12 20" stroke="#C2185B" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="animation-delay:2.9s"/></svg>
      </div>
      <p class="hero-foot">no sign up to contribute · works on any phone</p>
    </div>
  </section>`;
}

function marquee() {
  return `
  <section class="marquee" aria-label="Occasions">
    <div class="band band-1"><div class="marq">${band(OCCASION_BAND)}</div></div>
    <div class="band band-2"><div class="marq">${band(LOVE_BAND)}</div></div>
  </section>`;
}

function manifesto() {
  const words = MANIFESTO.split(' ').map((w) => `<span class="w ${MARKED.has(w) ? 'mark-word' : ''}">${w}</span>`).join('');
  return `
  <section class="manifesto">
    <img class="sketch bob" src="images/retro-90s.jpeg" alt="" style="right:-40px;top:30px;width:170px;--r:8deg">
    <img class="sketch bob" src="images/dark-academia.jpeg" alt="" style="left:-60px;bottom:40px;width:180px;--r:-6deg;animation-delay:-2s">
    <p class="kicker" style="display:flex;align-items:center;gap:10px;margin-bottom:22px">
      <svg width="46" height="22" viewBox="0 0 46 22" aria-hidden="true"><path d="M2 12C10 2 16 22 24 11S36 4 44 11" stroke="#C2185B" stroke-width="3" fill="none" stroke-linecap="round"/></svg>
      why we exist
    </p>
    <p class="manifesto-text">${words}</p>
    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:18px;margin-top:48px">
      <svg class="scroll-draw" width="120" height="60" viewBox="0 0 120 60" aria-hidden="true"><path d="M4 30C30 4 50 56 76 28C90 14 100 20 112 30M100 20L113 31L98 38" stroke="#1B1325" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span class="hand" style="font-size:30px;font-weight:700">started because a kudos board wanted our card details. rude.</span>
    </div>
  </section>`;
}

function howItWorks() {
  const bubble = (text, style, extra = '') => `<div class="bubble" style="${style}${extra}">${text}</div>`;
  const fly = (l, t, fx, fy, r, bg, d) => `<div class="flyn" style="left:${l}px;top:${t}px;--fx:${fx}px;--fy:${fy}px;--r:${r}deg;background:${bg};animation-delay:${d}s"></div>`;
  return `
  <section id="how" class="how">
    <p class="kicker">how it works</p>
    <div class="how-head">
      <h2 class="h-lg">three steps.<br>zero awkward group chats.</h2>
      <span class="hand" style="display:flex;align-items:center;gap:6px;font-size:26px;font-weight:700;color:var(--pop-deep)">keep scrolling
        <svg width="40" height="54" viewBox="0 0 40 54" aria-hidden="true"><path d="M20 4C4 16 34 26 18 46M8 38L18 48L28 38" stroke="#C2185B" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </div>
    <div class="stacks">
      <article class="stack">
        <div class="stack-text">
          <span class="stack-num" style="color:#FFE066">1</span>
          <h3 class="stack-title">make the wall</h3>
          <p class="stack-copy">Who it's for, the occasion, a vibe (with real hand-painted art), a song, how they unwrap it and how the notes land.</p>
        </div>
        <div class="stack-vis">
          <div class="wallpaper bg-cottage-core-paint" style="position:absolute;left:24px;top:24px;width:46%;height:62%;border-radius:16px;border:2px solid var(--ink);transform:rotate(-4deg)"></div>
          <div style="position:absolute;right:22px;top:30px;width:42%;padding:8px;background:#fff;border-radius:4px;transform:rotate(6deg);box-shadow:0 12px 22px -10px rgba(0,0,0,.45)"><img src="images/cottage-core.jpeg" alt="" style="display:block;width:100%"></div>
          ${bubble('vibe: Cottage Core', 'left:24px;bottom:24px;background:var(--ink);color:var(--paper)')}
          ${bubble('song: Cake at 2am', 'left:190px;bottom:70px;', 'animation-delay:.15s')}
          ${bubble('unwrap: gift box', 'right:24px;bottom:24px;background:var(--pop);', 'animation-delay:.3s')}
        </div>
      </article>
      <article class="stack">
        <div class="stack-text">
          <span class="stack-num" style="color:#B8E1FF">2</span>
          <h3 class="stack-title">drop the link</h3>
          <p class="stack-copy">Paste one link in the group chat or share a 6 letter code. Friends add notes, GIFs and voice memos. Nobody makes an account.</p>
        </div>
        <div class="stack-vis" style="background:#EAF5FF">
          ${bubble("guys, amna's bday wall, add something!!", 'left:22px;top:22px;')}
          ${bubble('omg adding a voice note rn', 'right:22px;top:96px;background:#FFE066;', 'animation-delay:.15s')}
          ${bubble('wait it has GIFs??', 'left:22px;top:156px;', 'animation-delay:.3s')}
          ${bubble('done. i cried writing it', 'right:22px;top:214px;background:#FFB3C7;', 'animation-delay:.45s')}
          ${bubble('23 notes so far', 'left:22px;bottom:18px;background:var(--ink);color:var(--paper);', 'animation-delay:.6s')}
        </div>
      </article>
      <article class="stack">
        <div class="stack-text">
          <span class="stack-num" style="color:#FFB3C7">3</span>
          <h3 class="stack-title">the big reveal</h3>
          <p class="stack-copy">They unwrap it, the music kicks in and every note flies onto the wall. Tears are not our fault.</p>
        </div>
        <div class="stack-vis">
          <div class="wallpaper bg-retro-90s-paint" style="position:absolute;inset:0"></div>
          <div style="position:absolute;inset:0;background:rgba(15,10,20,.35)"></div>
          ${fly(40, 50, 200, 260, -6, '#FFE066', 0)}${fly(140, 120, 100, 200, 5, '#B8E1FF', 0.12)}${fly(250, 40, 0, 260, -3, '#C9F2C7', 0.24)}
          ${fly(320, 150, -80, 180, 7, '#fff', 0.36)}${fly(70, 200, 160, 120, 4, '#E3D1FF', 0.48)}${fly(200, 230, 40, 100, -5, '#FFD3A8', 0.6)}
        </div>
      </article>
    </div>
  </section>`;
}

function reveals() {
  const card = (id, title, copy) => `<div class="rcard">${revealDemo(id)}<h3>${title}</h3><p>${copy}</p></div>`;
  return `
  <section id="reveals" class="reveals">
    <div class="container" style="padding:0">
      <div class="reveals-head">
        <div>
          <p class="kicker" style="color:var(--sun)">the reveal</p>
          <h2 class="h-lg" style="margin-top:10px">pick how<br>the love <span style="color:var(--pop)">lands.</span></h2>
        </div>
        <p style="max-width:380px;margin:0;font-size:18px;line-height:1.55;color:var(--lilac-mute)">Remember the solitaire win screen? Yeah. Six ways for the notes to make an entrance. Choose one when you make the wall, and they can replay it any way they like.</p>
      </div>
      <div class="reveal-grid">
        ${card('solitaire', 'Solitaire Cascade', 'Notes bounce in leaving trails, just like the win screen.')}
        ${card('deal', "Deal 'Em Out", 'Shuffled and dealt one by one like a card dealer with flair.')}
        ${card('flash', 'Paparazzi Flash', 'Each note pops in with a camera flash. Red carpet energy.')}
        ${card('rain', 'Confetti Rain', 'Notes tumble from the sky and pile up with a little bounce.')}
        ${card('letter', 'Love Letter', 'One note at a time, written out slowly. Cinematic, a little dramatic.')}
        ${card('polaroid', 'Polaroid Develop', 'Notes land as instant photos that slowly develop into colour.')}
      </div>
    </div>
  </section>`;
}

function features() {
  return `
  <section class="bento-wrap" aria-label="Features">
    <div class="bento-grid">
      <div class="bento" style="background:var(--sun)">
        <div style="display:flex;align-items:center;gap:16px"><span class="vinyl" style="width:92px;height:92px"></span><div><div style="font-size:13px;font-weight:700">now playing</div><div class="disp" style="font-size:20px;font-weight:800">their song</div></div></div>
        <div><h3>Background music</h3><p>Pick a tune from our little library or upload your own track. It fades in the second they open the wall.</p></div>
      </div>
      <div class="bento" style="background:var(--paper)">
        <div style="display:flex;align-items:center;gap:4px;height:60px">${bars(12)}</div>
        <div><h3>Voice notes</h3><p>Hit record right in the browser. Sing badly. It's encouraged.</p></div>
      </div>
      <div class="bento" style="background:var(--pop)">
        <div style="display:flex;gap:10px"><div class="gif-shimmer" style="width:80px;height:80px;border-radius:14px;border:2px solid var(--ink)"></div><div class="gif-shimmer" style="width:80px;height:80px;border-radius:14px;border:2px solid var(--ink);animation-delay:-1s"></div><div class="gif-shimmer" style="width:80px;height:80px;border-radius:14px;border:2px solid var(--ink);animation-delay:-2s"></div></div>
        <div><h3>GIFs and photos</h3><p>Drop in a GIF or that one photo from the trip, right inside the note.</p></div>
      </div>
      <div class="bento" style="background:var(--night-2);color:var(--paper)">
        <div style="display:flex;align-items:center;gap:10px;font-weight:700"><span class="pulse" style="width:12px;height:12px"></span><span>new notes appear live</span></div>
        <div><h3>Live wall</h3><p style="color:var(--lilac-mute)">New notes slide in on their own while the wall is open. No refresh button.</p></div>
      </div>
    </div>
  </section>`;
}

function vibes() {
  const art = VIBES.filter((v) => v.sketch).map((v) => `
    <a class="vcard" href="?page=create&vibe=${v.id}" data-link>
      <div class="wallpaper ${backgroundClass(v.id, 'paint')}"></div>
      <div class="vcard-shade"></div>
      <div class="vcard-sketch"><img src="${v.sketch}" alt=""></div>
      <span class="vcard-name">${v.label.replace(' ', '<br>')}</span>
    </a>`).join('');
  const swatches = [['sunset-party', 'solid', 'Sunset Party'], ['y2k-bubble', 'solid', 'Y2K Bubble'], ['retro-90s', 'pattern', 'Checkerboard'], ['tech-neon', 'pattern', 'Neon Grid'], ['cottage-core', 'pattern', 'Garden Dots'], ['sunset-party', 'pattern', 'Confetti']]
    .map(([vibe, choice, label]) => `<a class="vswatch wallpaper ${backgroundClass(vibe, choice)}" href="?page=create&vibe=${vibe}" data-link><span>${label}</span></a>`).join('');
  return `
  <section id="vibes" class="vibes">
    <div style="text-align:center;margin-bottom:56px">
      <p class="kicker">vibes</p>
      <h2 class="h-lg" style="margin-top:10px">every wall gets a mood.</h2>
      <p class="lead" style="max-width:560px;margin:18px auto 0">Each vibe comes with original hand-painted art and sketches made for HypeWall, plus colour and pattern versions if you want it simpler.</p>
    </div>
    <div class="vibe-art-grid">${art}</div>
    <p class="kicker" style="color:var(--ink);font-size:13px;margin-bottom:14px">or just colours and patterns</p>
    <div class="vibe-swatch-grid">${swatches}</div>
  </section>`;
}

function finale() {
  return `
  <section class="final">
    <div class="final-card">
      <h2 class="disp" style="margin:0;font-weight:800;font-size:clamp(44px,8vw,120px);letter-spacing:-0.055em;line-height:.9">go make someone's<br>whole week.</h2>
      <div style="margin-top:40px"><a class="btn btn-ink btn-lg" href="?page=create" data-link>Start a wall</a></div>
    </div>
  </section>
  <footer class="site-foot">
    <span class="logo-word" style="color:var(--ink)">hypewall</span>
    <span>made over one very chaotic winter break by Vaniya and Maryam</span>
    <nav aria-label="Footer"><a href="?page=about" data-link>About</a><a href="?page=contact" data-link>Contact</a><a href="?page=privacy" data-link>Privacy</a></nav>
  </footer>`;
}

export function render(root) {
  root.innerHTML = `<div class="page grain">${mainNav()}<main>${hero()}${marquee()}${manifesto()}${howItWorks()}${reveals()}${features()}${vibes()}</main>${finale()}</div>`;
}
