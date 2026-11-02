// One-time copy of every wall, note and report from MongoDB into Supabase.
// Base64 media inside the documents is moved into the Storage bucket.
//
//   npm run migrate:mongo -- --dry-run   # read + validate only, writes nothing
//   npm run migrate:mongo                # do it
//
// Needs MONGODB_URI, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env
// and the SQL in supabase/migrations applied first.
// Safe to run again: rows are upserted by id and media goes to fixed paths.

const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { MongoClient } = require('mongodb');
const { createClient } = require('@supabase/supabase-js');
const { createSupabaseMedia } = require('../media/supabase');
const { parseDataUrl, isAllowed, MAX_BYTES } = require('../media/files');
const { isUuid } = require('../store/supabase');
const { boardSettings, noteSettings, cleanText, cleanColor, TEXT_LIMITS } = require('../validation');

const DRY_RUN = process.argv.includes('--dry-run');
const BATCH = 100;
const { MONGODB_URI, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

const EXT = { 'image/gif': 'gif', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/ogg': 'ogg', 'audio/wav': 'wav', 'audio/webm': 'webm' };
const stats = { boards: 0, comments: 0, reports: 0, media: 0, skipped: [] };

function skip(what, id, why) {
  stats.skipped.push(`${what} ${id}: ${why}`);
}

// Join codes must be unique in Postgres. The oldest wall keeps a shared code;
// any later duplicate gets a fresh one (and is listed in the output).
// The replacement is derived from the wall id, so re-running gives the same code.
function uniqueCode(code, used, boardId) {
  let next = code;
  for (let salt = 0; used.has(next); salt++) {
    const digest = crypto.createHash('sha256').update(`${boardId}:${salt}`).digest();
    next = Array.from(digest.subarray(0, 6), (byte) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[byte % 36]).join('');
  }
  if (next !== code) skip('join code', boardId, `${code} was already taken, now ${next}`);
  used.add(next);
  return next;
}

async function main() {
  const missing = ['MONGODB_URI', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'].filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing in backend/.env: ${missing.join(', ')}`);

  const mongo = new MongoClient(MONGODB_URI);
  await mongo.connect();
  const source = mongo.db('genzkudo');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const media = createSupabaseMedia(supabase, { url: SUPABASE_URL });

  // Moves one media field into Storage at a fixed path (so re-runs overwrite, not duplicate)
  async function moveMedia(value, kind, objectPath, label) {
    if (!value) return null;
    if (media.isOurs(value)) return value;
    const file = parseDataUrl(value);
    if (!file || !isAllowed(kind, file.contentType) || file.buffer.length > MAX_BYTES) {
      skip('media', label, 'unreadable or unsupported, dropped');
      return null;
    }
    stats.media++;
    if (DRY_RUN) return `${media.publicPrefix}${objectPath}`;
    const ext = EXT[file.contentType.split(';')[0].toLowerCase()] || 'bin';
    return media.uploadBuffer(file.buffer, file.contentType, `${objectPath}.${ext}`);
  }

  async function upsert(table, rows) {
    for (let i = 0; i < rows.length; i += BATCH) {
      const { error } = DRY_RUN ? {} : await supabase.from(table).upsert(rows.slice(i, i + BATCH), { onConflict: 'id' });
      if (error) throw new Error(`${table}: ${error.message}`);
    }
  }

  // ─── Boards ──────────────────────────────────────────────────────────────
  const boardIds = new Set();
  const usedCodes = new Set();
  const boards = [];
  const boardDocs = (await source.collection('boards').find().toArray())
    .sort((a, b) => String(a.created_at || '').localeCompare(String(b.created_at || '')));
  for (const doc of boardDocs) {
    if (!isUuid(doc.id) || !isUuid(doc.view_token) || !doc.join_code) { skip('board', doc.id, 'missing id, view token or join code'); continue; }
    const folder = `migrated/${doc.id}`;
    boards.push({
      id: doc.id,
      aesthetic: typeof doc.aesthetic === 'string' ? doc.aesthetic : 'professional',
      recipient_name: cleanText(doc.recipient_name, TEXT_LIMITS.recipient) || 'Someone Special',
      bg_image: await moveMedia(doc.bg_image, 'image', `${folder}/background`, `board ${doc.id} background`),
      bg_audio: await moveMedia(doc.bg_audio, 'audio', `${folder}/music`, `board ${doc.id} music`),
      join_code: uniqueCode(String(doc.join_code).toUpperCase(), usedCodes, doc.id),
      view_token: doc.view_token,
      creator_key_hash: doc.creator_key_hash || null,
      // Walls from before these settings existed keep null, which the app reads as the default
      ...(doc.wrapper ? boardSettings(doc) : { occasion: null, wrapper: null, reveal_style: null, bg_choice: null, music_track: null, unlock_at: null }),
      allow_anonymous: doc.allow_anonymous !== false,
      contributor_link: doc.contributor_link || `/index.html?contribute=${doc.id}`,
      view_link: doc.view_link || `/index.html?view=${doc.view_token}`,
      created_at: doc.created_at || new Date().toISOString(),
    });
    boardIds.add(doc.id);
  }
  await upsert('boards', boards);
  stats.boards = boards.length;

  // ─── Notes ───────────────────────────────────────────────────────────────
  const comments = [];
  for (const doc of await source.collection('comments').find().toArray()) {
    if (!isUuid(doc.id) || !boardIds.has(doc.board_id)) { skip('note', doc.id, 'bad id or its wall was skipped'); continue; }
    const folder = `migrated/${doc.board_id}/${doc.id}`;
    comments.push({
      id: doc.id,
      board_id: doc.board_id,
      author: cleanText(doc.author, TEXT_LIMITS.author) || 'Anonymous',
      message: typeof doc.message === 'string' ? doc.message : '',
      color: cleanColor(doc.color),
      gif: await moveMedia(doc.gif, 'image', `${folder}-image`, `note ${doc.id} image`),
      audio: await moveMedia(doc.audio, 'audio', `${folder}-voice`, `note ${doc.id} voice note`),
      ...noteSettings(doc),
      hidden: doc.hidden === true,
      created_at: doc.created_at || new Date().toISOString(),
    });
  }
  await upsert('comments', comments);
  stats.comments = comments.length;

  // ─── Reports ─────────────────────────────────────────────────────────────
  const reports = (await source.collection('reports').find().toArray())
    .filter((doc) => isUuid(doc.id) && boardIds.has(doc.board_id) && isUuid(doc.comment_id))
    .map((doc) => ({ id: doc.id, board_id: doc.board_id, comment_id: doc.comment_id, reason: cleanText(doc.reason, TEXT_LIMITS.reason), created_at: doc.created_at || new Date().toISOString() }));
  await upsert('reports', reports);
  stats.reports = reports.length;

  await mongo.close();
}

main()
  .then(() => {
    console.log(`${DRY_RUN ? '[dry run] would migrate' : 'Migrated'}: ${stats.boards} walls, ${stats.comments} notes, ${stats.reports} reports, ${stats.media} media files.`);
    if (stats.skipped.length) console.log(`Skipped ${stats.skipped.length}:\n  ${stats.skipped.join('\n  ')}`);
  })
  .catch((err) => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  });
