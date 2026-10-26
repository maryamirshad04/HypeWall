const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const { TEXT_LIMITS, MAX_NOTES_PER_BOARD, boardSettings, noteSettings, isLocked, cleanText, cleanColor } = require('./validation');
const { newCreatorKey, hashKey, creatorAccess, rateLimit, ensureIndexes, isBot } = require('./security');
// Always read backend/.env, whatever directory the server was started from
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.MONGODB_URI) {
  console.error('\n❌ MONGODB_URI is not set.');
  console.error('   Create a file at backend/.env containing:\n');
  console.error('   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/genzkudo\n');
  process.exit(1);
}

const app = express();
app.use(cors());
// Allows base64 media (custom backgrounds, GIFs, audio) in JSON payloads.
// Vercel rejects any request body over 4.5mb before it reaches this handler.
app.use(express.json({ limit: '4.5mb' }));

// Serve frontend static files (used in local dev; Vercel handles this via routes in production)
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── MongoDB connection ───────────────────────────────────────────────────────
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;
async function getDb() {
  if (!db) {
    await client.connect();
    db = client.db('genzkudo');
    ensureIndexes(db).catch((err) => console.error('index setup failed', err));
  }
  return db;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Never send the creator key hash to anyone
function withoutSecrets(board) {
  const { creator_key_hash, ...rest } = board;
  return rest;
}

const VISIBLE = { hidden: { $ne: true } };
const visibleNotes = (database, boardId) =>
  database.collection('comments').find({ board_id: boardId, ...VISIBLE }).sort({ created_at: 1 }).toArray();
const countVisible = (database, boardId) =>
  database.collection('comments').countDocuments({ board_id: boardId, ...VISIBLE });

// Wraps a handler so any thrown error becomes a 500 with a log line
const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Loads the board named in :board_id into req.board (plus req.access), or answers 404
async function boardLoader(req, res, next) {
  let board;
  try {
    const database = await getDb();
    board = await database.collection('boards').findOne({ id: req.params.board_id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
  if (!board) return res.status(404).json({ error: 'Board not found' });
  req.board = board;
  req.access = creatorAccess(board, req);
  next();
}

function requireModerator(req, res, next) {
  if (req.access.canModerate) return next();
  const error = req.access.legacy
    ? 'This wall was made before creator keys, so it cannot be moderated.'
    : 'Only the person who made this wall can do that.';
  return res.status(403).json({ error });
}

// ─── API Routes ───────────────────────────────────────────────────────────────

// POST /api/boards  – create a board
app.post('/api/boards', rateLimit(getDb, 'createBoard'), handle(async (req, res) => {
  if (isBot(req.body)) return res.status(400).json({ error: 'Something looked off. Please try again.' });
  const {
    aesthetic = 'professional',
    bg_image = null,   // optional custom background (data URL)
    bg_audio = null,   // optional board background music (data URL)
  } = req.body;
  const database = await getDb();
  const creatorKey = newCreatorKey();

  const board = {
    id: uuidv4(),
    aesthetic,
    recipient_name: cleanText(req.body.recipient_name, TEXT_LIMITS.recipient) || 'Someone Special',
    bg_image,
    bg_audio,
    ...boardSettings(req.body),
    join_code: generateCode(),
    view_token: uuidv4(),
    creator_key_hash: hashKey(creatorKey),
    created_at: new Date().toISOString(),
  };
  board.contributor_link = `/index.html?contribute=${board.id}`;
  board.view_link = `/index.html?view=${board.view_token}`;

  await database.collection('boards').insertOne(board);
  // The plain key is only ever returned here
  res.status(201).json({
    ...withoutSecrets(board),
    creator_key: creatorKey,
    creator_link: `/index.html?board=${board.id}&key=${creatorKey}`,
  });
}));

// GET /api/boards/code/:code  – look up board by join code
app.get('/api/boards/code/:code', handle(async (req, res) => {
  const database = await getDb();
  const board = await database.collection('boards').findOne({ join_code: req.params.code.toUpperCase() });
  if (!board) return res.status(404).json({ error: 'Board not found' });
  res.json({
    id: board.id,
    aesthetic: board.aesthetic,
    recipient_name: board.recipient_name,
    join_code: board.join_code,
    bg_image: board.bg_image || null,
    bg_audio: board.bg_audio || null,
    occasion: board.occasion,
    unlock_at: board.unlock_at || null,
    allow_anonymous: board.allow_anonymous !== false,
  });
}));

// GET /api/boards/view/:view_token  – the recipient's wall: board + visible notes
// NOTE: This must come BEFORE /api/boards/:board_id to avoid "view" being treated as an id
app.get('/api/boards/view/:view_token', handle(async (req, res) => {
  const database = await getDb();
  const board = await database.collection('boards').findOne({ view_token: req.params.view_token });
  if (!board) return res.status(404).json({ error: 'Board not found' });

  // A board with a future unlock date keeps its notes secret until then
  if (isLocked(board)) {
    const comment_count = await countVisible(database, board.id);
    return res.json({ ...withoutSecrets(board), comments: [], comment_count, locked: true });
  }

  res.json({ ...withoutSecrets(board), comments: await visibleNotes(database, board.id) });
}));

// GET /api/boards/:board_id  – board details. The reveal link (view_token) is
// only included for the creator, so contributors cannot peek at the notes.
app.get('/api/boards/:board_id', boardLoader, (req, res) => {
  const board = withoutSecrets(req.board);
  if (!req.access.canRead) {
    delete board.view_token;
    delete board.view_link;
  }
  res.json({ ...board, is_creator: req.access.canRead, can_moderate: req.access.canModerate });
});

// POST /api/boards/:board_id/comments  – add a note
app.post('/api/boards/:board_id/comments', rateLimit(getDb, 'postNote'), boardLoader, handle(async (req, res) => {
  if (isBot(req.body)) return res.status(400).json({ error: 'Something looked off. Please try again.' });
  const { board } = req;
  const database = await getDb();

  const author = cleanText(req.body.author, TEXT_LIMITS.author);
  if (board.allow_anonymous === false && !author) {
    return res.status(400).json({ error: 'This board needs a name on every note' });
  }
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  if (message.length > TEXT_LIMITS.message) {
    return res.status(400).json({ error: `Notes can be up to ${TEXT_LIMITS.message} characters.` });
  }
  if ((await database.collection('comments').countDocuments({ board_id: board.id })) >= MAX_NOTES_PER_BOARD) {
    return res.status(409).json({ error: 'This wall is full. That is a lot of love.' });
  }

  const comment = {
    id: uuidv4(),
    board_id: board.id,
    author: author || 'Anonymous',
    message,
    color: cleanColor(req.body.color),
    gif: req.body.gif || null,     // optional GIF/image attachment (data URL or GIF link)
    audio: req.body.audio || null, // optional audio attachment (data URL)
    ...noteSettings(req.body),
    created_at: new Date().toISOString(),
  };

  await database.collection('comments').insertOne(comment);
  res.status(201).json(comment);
}));

// GET /api/boards/:board_id/comments  – every note, hidden ones included (creator only)
app.get('/api/boards/:board_id/comments', boardLoader, handle(async (req, res) => {
  if (!req.access.canRead) return res.status(403).json({ error: 'Only the person who made this wall can see the notes before the reveal.' });
  const database = await getDb();
  const comments = await database.collection('comments').find({ board_id: req.board.id }).sort({ created_at: 1 }).toArray();
  res.json(comments);
}));

// GET /api/boards/:board_id/stats  – note count without downloading any media
app.get('/api/boards/:board_id/stats', boardLoader, handle(async (req, res) => {
  res.json({ comment_count: await countVisible(await getDb(), req.board.id) });
}));

// PATCH /api/boards/:board_id/comments/:comment_id  – hide or show a note (creator only)
app.patch('/api/boards/:board_id/comments/:comment_id', rateLimit(getDb, 'moderate'), boardLoader, requireModerator, handle(async (req, res) => {
  if (typeof req.body.hidden !== 'boolean') return res.status(400).json({ error: '`hidden` must be true or false' });
  const database = await getDb();
  const result = await database.collection('comments').updateOne(
    { id: req.params.comment_id, board_id: req.board.id },
    { $set: { hidden: req.body.hidden } },
  );
  if (result.matchedCount === 0) return res.status(404).json({ error: 'Comment not found' });
  res.json({ success: true, hidden: req.body.hidden });
}));

// DELETE /api/boards/:board_id/comments/:comment_id  – delete a note (creator only)
app.delete('/api/boards/:board_id/comments/:comment_id', rateLimit(getDb, 'moderate'), boardLoader, requireModerator, handle(async (req, res) => {
  const database = await getDb();
  const result = await database.collection('comments').deleteOne({ id: req.params.comment_id, board_id: req.board.id });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Comment not found' });
  res.json({ success: true });
}));

// POST /api/reports  – the recipient (anyone holding the reveal link) reports a
// note. It is logged for us and hidden from that wall straight away.
app.post('/api/reports', rateLimit(getDb, 'report'), handle(async (req, res) => {
  const { view_token, comment_id } = req.body;
  if (typeof view_token !== 'string' || typeof comment_id !== 'string') {
    return res.status(400).json({ error: 'view_token and comment_id are required' });
  }
  const database = await getDb();
  const board = await database.collection('boards').findOne({ view_token });
  if (!board) return res.status(404).json({ error: 'Board not found' });
  const hidden = await database.collection('comments').updateOne({ id: comment_id, board_id: board.id }, { $set: { hidden: true } });
  if (hidden.matchedCount === 0) return res.status(404).json({ error: 'Comment not found' });

  await database.collection('reports').insertOne({
    id: uuidv4(),
    board_id: board.id,
    comment_id,
    reason: cleanText(req.body.reason, TEXT_LIMITS.reason),
    created_at: new Date().toISOString(),
  });
  res.status(201).json({ success: true });
}));

// Fallback: serve index.html for any non-API route (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── Local dev server ─────────────────────────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
}

module.exports = app;
