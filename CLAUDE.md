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
| Backend | Node **Express** (`backend/app.js`) on **Supabase**: Postgres for data, Storage for media |
| Hosting | Vercel (`vercel.json`) |
| Fonts | Bricolage Grotesque (display), DM Sans (body), Caveat (handwriting), Permanent Marker |

Run locally (`backend/`):
- `npm run dev:memory`: no database, in-memory store + media (resets on restart).
- `npm start`: real Supabase. Needs `backend/.env` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
  (see `.env.example`); `index.js` keeps only the URL's origin, so a pasted `…/rest/v1/` URL is fine.
- `npm test`: boots the in-memory server with test hooks and runs `tests/api.test.js` (80+ checks).
  The same file runs against a live server with `node tests/api.test.js <port>`; hook-only checks skip.

Database setup lives in `supabase/migrations/` (run in the Supabase SQL editor). Row level security
is on with **no policies**: only the service role (our API) can touch tables. Never ship the service
role key to the browser.

## Compatibility rules (do not break)

- Shared links live in group chats forever. These URL forms must keep working:
  `?board=<id>[&key=<creator key>]` (creator share page), `?contribute=<id>`, `?code=<CODE>`, `?view=<view_token>`,
  `?page=about|contact|privacy`. Newer: `?page=create[&vibe=<id>]`, `?page=join`, `?page=demo`.
- The backend keeps every original route and response field. New fields are **optional** and
  validated in `backend/validation.js`; unknown values fall back to defaults, and documents created
  before a field existed must behave as before (e.g. no `unlock_at` = never locked,
  missing `allow_anonymous` = anonymous allowed).
- Media no longer travels through the API. The browser asks `POST /api/uploads` for a signed slot,
  PUTs the file straight to the `media` bucket, then sends the public link. The API only accepts
  links into our own bucket; base64 data URLs from older clients are still accepted and moved into
  Storage server-side (JSON bodies stay capped at 4.5 MB by Vercel). Files: 10 MB, images/audio only.

## Data model (Supabase Postgres, `supabase/migrations/20261102000000_init.sql`)

**boards**: `id` (uuid), `aesthetic` (vibe id), `recipient_name` (max 60), `bg_image`, `bg_audio`
(Storage URLs), `join_code` (unique), `view_token` (uuid, unique), `creator_key_hash` (SHA-256; null
for walls made before keys), optional settings `occasion`, `wrapper`, `reveal_style`, `bg_choice`,
`music_track`, `unlock_at`, plus `allow_anonymous`, `contributor_link`, `view_link`, `created_at`.
Settings are null on migrated old walls; the frontend reads null as the default.

**comments**: `id`, `board_id` (cascade delete), `author` (max 60), `message` (max 1000), `color`
(hex), `gif`, `audio` (Storage URLs), `font`, `shape`, `stickers` (text[], max 3), `hidden`, `created_at`.

**reports**: `id`, `board_id`, `comment_id`, `reason`, `created_at`.
**rate_limits**: fixed-window counters, bumped atomically by the `hit_rate_limit(key, expires_at)`
SQL function, which also sweeps expired rows now and then.

## Backend layout (`backend/`)

```
index.js                 entry (Vercel + npm start): env checks, Supabase client, createApp
app.js                   createApp({ store, media }): every route
store/supabase.js        data access on Postgres; store/memory.js is the same interface in memory
media/supabase.js        Storage: signed upload slots, server-side uploads; media/memory.js mirrors it
media/files.js           allowed types, 10 MB cap, object paths, data URL parsing
security.js              creator keys, client IP, rate limits, honeypot
validation.js            option whitelists, text caps, defaults
scripts/dev-memory.js    database-free server (+ test hooks with HYPEWALL_TEST_HOOKS=1)
scripts/migrate-from-mongo.js   one-time copy of old MongoDB walls (dry run supported)
tests/                   run.js + api.test.js
```

Routes only talk to `store` and `media`, never to Supabase directly, so a new store must implement
the same interface (see `store/memory.js` for the smallest version).

## Creator keys and access (backend/security.js)

- `POST /boards` returns `creator_key` (plain, **only once**) and
  `creator_link` = `/index.html?board=<id>&key=<key>`. Only the hash is stored.
- Clients send the key as the `X-Creator-Key` header. The frontend keeps it in the creator link
  and in localStorage (`hypewall:creator:<boardId>`, see `lib/creatorKeys.js`).
- `creatorAccess(board, req)` → `canRead` (valid key, or a legacy board with no hash) and
  `canModerate` (valid key only). Legacy boards keep their old open reads but cannot be moderated.
- Contributors never get `view_token`/`view_link` from `GET /boards/:id` (that was the peeking hole).

## API (`/api`)

| Method | Route | Access / notes |
| --- | --- | --- |
| POST | `/uploads` | `{ kind: "image" or "audio", content_type, size }` → `{ upload_url, public_url }`; 40/10 min/IP |
| POST | `/boards` | rate limited (10/hour/IP), honeypot; returns `creator_key` once |
| GET | `/boards/code/:code` | public fields only (never `view_token`) |
| GET | `/boards/view/:view_token` | recipient wall; hidden notes left out; locked walls return `comments: []`, `comment_count`, `locked: true` |
| GET | `/boards/:board_id` | everyone; `view_token` only for creators; adds `is_creator`, `can_moderate` |
| GET | `/boards/:board_id/stats` | everyone; `{ comment_count }` of visible notes |
| POST | `/boards/:board_id/comments` | rate limited (20/10 min/IP), honeypot, 1000-char cap, 300 notes per wall (409) |
| GET | `/boards/:board_id/comments` | creator only (403 otherwise); includes hidden notes |
| PATCH | `/boards/:board_id/comments/:comment_id` | moderator only; body `{ hidden: boolean }` |
| DELETE | `/boards/:board_id/comments/:comment_id` | moderator only |
| POST | `/reports` | `{ view_token, comment_id, reason? }`; hides the note and logs a report; 10/hour/IP |

Route order matters: `/boards/view/:token` and `/boards/code/:code` must stay above `/boards/:id`.
Rate limits fail open (a counter error never blocks users). Client IP comes from
`x-vercel-forwarded-for` / `x-real-ip` / `x-forwarded-for`. Every form includes the hidden
`website` honeypot field (`components/honeypot.js`); a filled value gets a 400.

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
  lib/media.js             picked files -> local previews (blob:), uploaded to Storage on submit
  lib/music.js             createMusic({src|trackId}); library tracks are synthesised (Web Audio)
  lib/recorder.js          MediaRecorder voice notes (60 s max)
  lib/toast.js             non-blocking messages (no alert())
  lib/creatorKeys.js       remembers creator keys per board in localStorage
  components/              nav, note card + voice player, wrapper SVGs, reveal demo stages, honeypot
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
- Boards made before creator keys cannot be moderated, and their notes stay readable by anyone
  with the board id (as they always were).
