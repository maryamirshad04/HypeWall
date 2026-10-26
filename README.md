# HypeWall 🎉

**HypeWall** is a free appreciation wall. Make one for someone's birthday, farewell, promotion or
graduation, send the link to their people, and let everyone drop a note, a GIF, a photo or a voice
memo. When the day comes, they unwrap it and every note comes flying onto the wall, set to a song.

No accounts. No paywall. No checkout page. Appreciation should not cost anything.

---

## ✨ What it does

### Make a wall
- Pick who it's for and the occasion
- Pick a **vibe**: Cottage Core, Dark Academia, 90s Retro, Tech Neon, Clean Minimal (each with
  original hand-painted art and sketches), or Sunset Party and Y2K Bubble, plus your own photo
- Pick a **soundtrack** from the built-in tunes, or upload your own
- Pick how the notes land: **Solitaire Cascade, Deal 'Em Out, Paparazzi Flash, Confetti Rain,
  Love Letter or Polaroid Develop**
- Pick how they unwrap it: **gift box, envelope, mailbox or birthday cake**
- Optional: keep it secret until a date (with a countdown), and require names on notes

### Share it
- **Invite link + 6-character join code** for contributors (they can write, but not peek)
- **Reveal link** for the recipient
- **Private creator link** for you, to come back, see notes and hide or delete anything before the reveal

### Write a note
Handwriting style, note colour, note shape, stickers, a GIF or photo, and voice notes recorded
right in the browser.

### The reveal
The recipient unwraps the wall, the music fades in and the notes animate in. They can replay it in
any style, read any note up close, report a note (which hides it right away), and new notes appear
live. On phones it becomes a one-note-at-a-time deck.

---

## 💻 Tech stack

- **Frontend:** vanilla HTML, CSS and JavaScript (native ES modules, no build step)
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Hosting:** Vercel

## 🛠 Running locally

```bash
cd backend
npm install
node index.js
```

Create `backend/.env` first:

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/genzkudo
```

Then open http://localhost:5000. The same server serves the site and the API.

## 🔐 Safety and privacy

- Only the creator's private link can see notes before the reveal, or hide and delete them.
  The key in that link is stored hashed.
- Contributors only ever see the note count.
- Rate limits on making walls, posting notes and reporting, a 1000-character limit on notes,
  a 300-note cap per wall, and a hidden spam trap on every form.
- No accounts, no tracking, no ads. See the Privacy page in the app.

---

✨ Made over one very chaotic winter break by Vaniya and Maryam.
