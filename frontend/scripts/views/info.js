import { slimNav } from '../components/nav.js';

// Original HypeWall copy, unchanged
const PAGES = {
  about: {
    label: 'About',
    kicker: 'how this whole thing started',
    title: 'about us.',
    body: `
      <p class="para"><span class="drop-cap">S</span>o there was this class. And there was this professor who was, genuinely, <strong>that</strong> good. The kind who makes an 8am lecture feel like a plot twist.</p>
      <p class="para">The semester was wrapping up and we wanted to do something nice. Obviously: a kudos board. Everyone signs it, everyone says something lovely, she cries a little, we cry a little, beautiful.</p>
      <p class="para para-big">Then we saw the price tag.</p>
      <p class="para">Look, we still made her one. She deserved it. But paying actual money just to let people type &ldquo;you changed my life&rdquo; into a box? That felt <em>icky</em>. <span class="mark">Appreciation should not have a checkout page.</span></p>
      <p class="para">Cut to winter break. Vaniya, doing absolutely nothing productive, went &ldquo;wait&hellip; we could just build this ourselves.&rdquo; She pitched it to her friend Maryam. They laughed. It was a joke. It was <em>such</em> a joke.</p>
      <p class="para">And then, somehow, they were building it. Over the entire winter vacation. Hunched over laptops, cracking up at 2am, breaking things, fixing things, breaking them again, arguing about the exact shade of yellow. It was hectic. It was chaos. It was, honestly, the most fun either of them had all break.</p>
      <p class="para para-end">So that is HypeWall. Free, forever, because hyping up the people you love should never have cost anything in the first place.</p>`,
  },
  contact: {
    label: 'Contact',
    kicker: 'talk to us, we are right here',
    title: 'contact us.',
    body: `
      <p class="para">Oh, you have <em>ideas</em>? You looked at this and thought &ldquo;cute, but what if it did this other thing too&rdquo;? Tell us.</p>
      <p class="para">Oh, you think a certain page is ugly? Bold. Correct, possibly. Tell us.</p>
      <p class="para">Oh, you found a bug? Something clicked and then simply&hellip; did not click back? Please tell us, we will go fix it immediately and pretend it never happened.</p>
      <p class="para">Oh, you just want to say hi and show us a board you made? That is our favourite email to get, actually.</p>
      <p class="para">Whatever it is, it lands in the same inbox:</p>
      <p class="para"><a class="mail" href="mailto:vaniyaejaz@gmail.com">vaniyaejaz@gmail.com</a></p>
      <p class="para footnote">No fancy domain yet. We are working on it. Baby steps.</p>`,
  },
  privacy: {
    label: 'Privacy',
    kicker: 'the serious page, kept short',
    title: 'privacy.',
    body: `
      <p class="para">Short version: your board is yours. We are not doing anything weird with it.</p>
      <p class="para"><strong>No accounts.</strong> We never asked for your name, your email, or your birthday. We do not have them. We cannot lose them.</p>
      <p class="para"><strong>No tracking, no ads, no data selling.</strong> There is no analytics pixel watching you pick a colour. Nobody is buying your feelings.</p>
      <p class="para"><strong>Your links are unlisted.</strong> Boards are reached through long, random, basically unguessable links. Nobody stumbles onto yours by accident, and nothing is listed in a public directory.</p>
      <p class="para"><strong>Everything travels encrypted.</strong> The connection is HTTPS, and your board data sits in an encrypted database.</p>
      <p class="para"><strong>We are not reading your boards.</strong> Your messages, GIFs and voice notes are stored for exactly one reason: to show them on the board they were posted to. That is the whole job.</p>
      <p class="para footnote">Being straight with you: we run the servers, so in a strictly technical sense the data is not sealed off from us the way end-to-end encryption would seal it. We just have zero interest in your messages. Please do not use HypeWall to store passwords or anything genuinely sensitive.</p>`,
  },
};

export function render(root, { tab }) {
  const page = PAGES[tab] || PAGES.about;
  const tabs = Object.entries(PAGES)
    .map(([key, p]) => `<a class="info-tab" href="?page=${key}" data-link ${key === tab ? 'aria-current="page"' : ''}>${p.label}</a>`)
    .join('');

  root.innerHTML = `
    <div class="page grain">
      ${slimNav(`<nav class="info-tabs" aria-label="Info pages">${tabs}</nav><a class="text-link" href="./" data-link>Back home</a>`)}
      <main class="info">
        <p class="hand info-kicker">${page.kicker}</p>
        <h1 class="info-title">${page.title}</h1>
        <article class="info-body">${page.body}</article>
      </main>
    </div>`;
  document.title = `${page.label} · HypeWall`;
}
