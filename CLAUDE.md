# HypeWall — CLAUDE.md

Free, no-paywall **appreciation board** ("kudos wall"). Someone creates a wall for a recipient
(birthday, farewell, a great professor), shares a link or a 6-character join code, friends post
notes (text, GIF/photo, voice note, stickers), and the recipient opens a private reveal link: they
unwrap it (gift / envelope / mailbox / cake), music fades in and the notes animate onto the wall.

Branch history: `redesign-ui` (Aug 2026) was the previous UI. `party-paper-redesign` is the
"Party Paper" redesign built on top of it. Local `main` in the original checkout is a different,
diverged codebase (Firebase / roles) — do not merge blindly.

Tone of voice: playful, lowercase, quirky, Gen-Z. No em dashes in UI copy.

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | Vanilla HTML/CSS + native ES modules, no build step, no framework |
| Backend | Node **Express** + **MongoDB** (`backend/index.js`). The README still says Flask; that is outdated |
| Hosting | Vercel (`vercel.json`) |
| Fonts | Bricolage Grotesque (display), DM Sans (body), Caveat (handwriting), Permanent Marker |

Run locally: `cd backend && npm install && node index.js` with `backend/.env` containing
`MONGODB_URI=...` (the server exits without it). Serves the frontend and API on `http://localhost:5000`.

## Compatibility rules (do not break)

- Shared links live in group chats forever. These URL forms must keep working:
  `?board=<id>` (creator share page), `?contribute=<id>`, `?code=<CODE>`, `?view=<view_token>`,
  `?page=about|contact|privacy`. Newer: `?page=create[&vibe=<id>]`, `?page=join`, `?page=demo`.
- The backend keeps every original route and response field. New fields are **optional** and
  validated in `backend/validation.js`; unknown values fall back to defaults, and documents created
  before a field existed must behave as before (e.g. no `unlock_at` = never locked,
  missing `allow_anonymous` = anonymous allowed).
- Request bodies are capped at 4.5 MB by Vercel. Media is stored inline as base64, so the client caps
  GIFs at 1.5 MB, audio at 2 MB, combined payload at 4 MB (`frontend/scripts/lib/media.js`).

## Data model (MongoDB, db `genzkudo`)

**boards**: `id`, `aesthetic` (vibe id), `recipient_name`, `bg_image`, `bg_audio`, `join_code`,
`view_token`, `created_at`, `contributor_link`, `view_link`, plus optional settings
`occasion`, `wrapper`, `reveal_style`, `bg_choice`, `music_track`, `unlock_at`, `allow_anonymous`.

**comments**: `id`, `board_id`, `author`, `message`, `color`, `gif`, `audio`, `created_at`, plus
optional `font`, `shape`, `stickers` (max 3).

## API (`/api`)

| Method | Route | Notes |
| --- | --- | --- |
| POST | `/boards` | create; settings whitelisted by `boardSettings()` |
| GET | `/boards/code/:code` | public fields only (never `view_token`) |
| GET | `/boards/view/:view_token` | board + comments; if `unlock_at` is in the future returns `comments: []`, `comment_count`, `locked: true` |
| GET | `/boards/:board_id` | full board |
| GET | `/boards/:board_id/stats` | `{ comment_count }` without media |
| POST | `/boards/:board_id/comments` | 400 if the board disallows anonymous and no name |
| GET | `/boards/:board_id/comments` | oldest first |
| DELETE | `/boards/:board_id/comments/:comment_id` | unused by the UI, no auth |

Route order matters: `/boards/view/:token` and `/boards/code/:code` must stay above `/boards/:id`.

## Frontend layout (`frontend/`)

```
index.html                 shell: #app, #toasts, loads styles + scripts/main.js (module)
scripts/
  main.js                  boots the router
  router.js                query-string routes -> lazy-loaded views; links use data-link
  api.js                   fetch wrappers (errors carry .status)
  config/catalog.js        every pickable option: occasions, vibes + background library,
                           reveal styles, wrappers, music tracks, note colours/fonts/shapes, stickers
  lib/dom.js               esc(), $, $$, on() delegation, createScope() for view teardown
  lib/media.js             uploads -> data URLs with size caps
  lib/music.js             createMusic({src|trackId}); library tracks are synthesised (Web Audio)
  lib/recorder.js          MediaRecorder voice notes (60 s max)
  lib/toast.js             non-blocking messages (no alert())
  components/              nav, note card + voice player, wrapper SVGs, reveal demo stages
  views/                   landing, info, join, create, share, contribute, reveal (+ reveal-demo data), shared
styles/                    base (tokens, buttons, nav), backgrounds, notes, one file per view
images/                    original artwork: <vibe>.jpeg sketches, <vibe>bg.jpeg paintings
```

Conventions:
- Each view exports `render(root, params, scope)`; register timers/listeners on `scope` so they are
  cleaned up on navigation. Never leave intervals running between views.
- Build HTML with template strings and **always `esc()` user text**. Media sources go through
  `safeSrc()` in `components/note.js`.
- Ids in `config/catalog.js` must match `backend/validation.js`. Wallpaper classes are
  `.bg-<vibe>-<choice>` in `styles/backgrounds.css`; keep the three in sync.
- Respect `prefers-reduced-motion` (handled globally in `base.css`).
- Cache: JS/CSS are served `must-revalidate` (ES module imports are unversioned); images are
  immutable, so rename an image file when replacing it. Bump `?v=` in `index.html` on big changes.

## The reveal (views/reveal.js)

Phases: locked countdown (if `locked`) -> wrapper intro -> opening (`.op` class: wrapper-specific
SVG animation, soft light beams + bloom, circle wipe) -> wall. The wall lays notes out in a CSS
grid, measures each slot and sets `--dx/--dy` from a "deck" point, then staggers the chosen style
(`anim-solitaire|deal|flash|rain|letter|polaroid`). Solitaire adds ghost copies for trails. The
wall polls every 5 s and appends new notes without re-rendering (voice notes keep playing).
On phones (<=700px) it defaults to a one-note-at-a-time deck.

## Not built / known limits

- GIF search needs a provider key (Giphy/Tenor); for now people upload a GIF or photo.
- Library music is generated tunes, not recorded songs; uploads still work.
- The logo (`components/nav.js`, `images/favicon.svg`) is tentative.
- No auth on delete; contributors can technically fetch all notes via the API (as before).
