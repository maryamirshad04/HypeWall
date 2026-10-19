const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const { boardSettings, noteSettings, isLocked } = require('./validation');
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
  }
  return db;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ─── API Routes ───────────────────────────────────────────────────────────────

// POST /api/boards  – create a board
app.post('/api/boards', async (req, res) => {
  try {
    const {
      aesthetic = 'professional',
      recipient_name = 'Someone Special',
      bg_image = null,   // optional custom background (data URL)
      bg_audio = null,   // optional board background music (data URL)
    } = req.body;
    const database = await getDb();

    const board = {
      id: uuidv4(),
      aesthetic,
      recipient_name,
      bg_image,
      bg_audio,
      ...boardSettings(req.body),
      join_code: generateCode(),
      view_token: uuidv4(),
      created_at: new Date().toISOString(),
    };
    board.contributor_link = `/index.html?contribute=${board.id}`;
    board.view_link = `/index.html?view=${board.view_token}`;

    await database.collection('boards').insertOne(board);
    res.status(201).json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/boards/code/:code  – look up board by join code
app.get('/api/boards/code/:code', async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/boards/view/:view_token  – get full board + comments by view token
// NOTE: This must come BEFORE /api/boards/:board_id to avoid "view" being treated as an id
app.get('/api/boards/view/:view_token', async (req, res) => {
  try {
    const database = await getDb();
    const board = await database.collection('boards').findOne({ view_token: req.params.view_token });
    if (!board) return res.status(404).json({ error: 'Board not found' });

    // A board with a future unlock date keeps its notes secret until then
    if (isLocked(board)) {
      const comment_count = await database.collection('comments').countDocuments({ board_id: board.id });
      return res.json({ ...board, comments: [], comment_count, locked: true });
    }

    const comments = await database
      .collection('comments')
      .find({ board_id: board.id })
      .sort({ created_at: 1 })
      .toArray();

    res.json({ ...board, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/boards/:board_id  – get board by ID
app.get('/api/boards/:board_id', async (req, res) => {
  try {
    const database = await getDb();
    const board = await database.collection('boards').findOne({ id: req.params.board_id });
    if (!board) return res.status(404).json({ error: 'Board not found' });
    res.json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/boards/:board_id/comments  – add a comment
app.post('/api/boards/:board_id/comments', async (req, res) => {
  try {
    const database = await getDb();
    const board = await database.collection('boards').findOne({ id: req.params.board_id });
    if (!board) return res.status(404).json({ error: 'Board not found' });

    const author = typeof req.body.author === 'string' ? req.body.author.trim() : '';
    if (board.allow_anonymous === false && !author) {
      return res.status(400).json({ error: 'This board needs a name on every note' });
    }

    const comment = {
      id: uuidv4(),
      board_id: req.params.board_id,
      author: author || 'Anonymous',
      message: req.body.message || '',
      color: req.body.color || '#FFD700',
      gif: req.body.gif || null,     // optional GIF/image attachment (data URL or GIF link)
      audio: req.body.audio || null, // optional audio attachment (data URL)
      ...noteSettings(req.body),
      created_at: new Date().toISOString(),
    };

    await database.collection('comments').insertOne(comment);
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/boards/:board_id/comments  – get all comments for a board
app.get('/api/boards/:board_id/comments', async (req, res) => {
  try {
    const database = await getDb();
    const board = await database.collection('boards').findOne({ id: req.params.board_id });
    if (!board) return res.status(404).json({ error: 'Board not found' });

    const comments = await database
      .collection('comments')
      .find({ board_id: req.params.board_id })
      .sort({ created_at: 1 })
      .toArray();

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/boards/:board_id/stats  – note count without downloading any media
app.get('/api/boards/:board_id/stats', async (req, res) => {
  try {
    const database = await getDb();
    const board = await database.collection('boards').findOne({ id: req.params.board_id });
    if (!board) return res.status(404).json({ error: 'Board not found' });

    const comment_count = await database.collection('comments').countDocuments({ board_id: board.id });
    res.json({ comment_count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/boards/:board_id/comments/:comment_id
app.delete('/api/boards/:board_id/comments/:comment_id', async (req, res) => {
  try {
    const database = await getDb();
    const result = await database
      .collection('comments')
      .deleteOne({ id: req.params.comment_id, board_id: req.params.board_id });

    if (result.deletedCount === 0) return res.status(404).json({ error: 'Comment not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
