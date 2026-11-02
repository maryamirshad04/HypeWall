// The HypeWall API. createApp({ store, media }) wires the routes to a data store
// (store/supabase.js or store/memory.js) and a media store (media/*.js).

const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { TEXT_LIMITS, MAX_NOTES_PER_BOARD, boardSettings, noteSettings, isLocked, cleanText, cleanColor } = require('./validation');
const { newCreatorKey, hashKey, creatorAccess, rateLimit, isBot } = require('./security');
const { ConflictError } = require('./store/supabase');
const { MAX_BYTES, isAllowed, parseDataUrl } = require('./media/files');

const FRONTEND = path.join(__dirname, '../frontend');
const JOIN_CODE_ATTEMPTS = 5;

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Never send the creator key hash to anyone
function withoutSecrets(board) {
  const { creator_key_hash, ...rest } = board;
  return rest;
}

class BadRequest extends Error {}

// Wraps a handler so a BadRequest becomes a 400 and anything else a logged 500
const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    if (err instanceof BadRequest) return res.status(400).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function createApp({ store, media }) {
  const app = express();
  app.use(cors());
  // Media now goes straight to Storage; the JSON limit stays for older clients
  // that still send base64 (Vercel caps request bodies at 4.5mb anyway).
  app.use(express.json({ limit: '4.5mb' }));
  if (media.router) app.use(media.router);
  // Serve frontend static files (used in local dev; Vercel handles this via routes in production)
  app.use(express.static(FRONTEND));

  // A media field may be empty, a link to our own bucket, or (from older
  // clients) a base64 data URL, which is moved into Storage here.
  async function resolveMedia(value, kind) {
    if (value === null || value === undefined || value === '') return null;
    if (media.isOurs(value)) return value;
    const file = typeof value === 'string' && value.startsWith('data:') ? parseDataUrl(value) : null;
    if (!file) throw new BadRequest(`Unsupported ${kind} link.`);
    if (!isAllowed(kind, file.contentType)) throw new BadRequest(`That file is not a supported ${kind}.`);
    if (file.buffer.length > MAX_BYTES) throw new BadRequest('That file is too large (max 10MB).');
    return media.uploadBuffer(file.buffer, file.contentType);
  }

  // Loads the board named in :board_id into req.board (plus req.access), or answers 404
  const loadBoard = handle(async (req, res, next) => {
    const board = await store.boards.findById(req.params.board_id);
    if (!board) return res.status(404).json({ error: 'Board not found' });
    req.board = board;
    req.access = creatorAccess(board, req);
    next();
  });

  function requireModerator(req, res, next) {
    if (req.access.canModerate) return next();
    const error = req.access.legacy
      ? 'This wall was made before creator keys, so it cannot be moderated.'
      : 'Only the person who made this wall can do that.';
    return res.status(403).json({ error });
  }

  // ─── Uploads ───────────────────────────────────────────────────────────────

  // POST /api/uploads  – a signed slot to upload one image or audio file directly
  app.post('/api/uploads', rateLimit(store, 'upload'), handle(async (req, res) => {
    const { kind, content_type: contentType, size } = req.body;
    if (!isAllowed(kind, contentType)) return res.status(400).json({ error: `That file is not a supported ${kind || 'media'} type.` });
    if (!Number.isFinite(size) || size <= 0 || size > MAX_BYTES) return res.status(400).json({ error: 'Files can be up to 10MB.' });
    res.status(201).json(await media.createUpload(contentType));
  }));

  // ─── Boards ────────────────────────────────────────────────────────────────

  // POST /api/boards  – create a board
  app.post('/api/boards', rateLimit(store, 'createBoard'), handle(async (req, res) => {
    if (isBot(req.body)) return res.status(400).json({ error: 'Something looked off. Please try again.' });
    const creatorKey = newCreatorKey();
    const board = {
      id: uuidv4(),
      aesthetic: typeof req.body.aesthetic === 'string' ? req.body.aesthetic : 'professional',
      recipient_name: cleanText(req.body.recipient_name, TEXT_LIMITS.recipient) || 'Someone Special',
      bg_image: await resolveMedia(req.body.bg_image, 'image'),
      bg_audio: await resolveMedia(req.body.bg_audio, 'audio'),
      ...boardSettings(req.body),
      view_token: uuidv4(),
      creator_key_hash: hashKey(creatorKey),
      created_at: new Date().toISOString(),
    };
    board.contributor_link = `/index.html?contribute=${board.id}`;
    board.view_link = `/index.html?view=${board.view_token}`;

    // Join codes are short, so retry the rare collision with a fresh one
    for (let attempt = 1; ; attempt++) {
      try {
        await store.boards.insert({ ...board, join_code: (board.join_code = generateCode()) });
        break;
      } catch (err) {
        if (!(err instanceof ConflictError) || attempt >= JOIN_CODE_ATTEMPTS) throw err;
      }
    }

    // The plain key is only ever returned here
    res.status(201).json({
      ...withoutSecrets(board),
      creator_key: creatorKey,
      creator_link: `/index.html?board=${board.id}&key=${creatorKey}`,
    });
  }));

  // GET /api/boards/code/:code  – look up board by join code
  app.get('/api/boards/code/:code', handle(async (req, res) => {
    const board = await store.boards.findByCode(req.params.code.toUpperCase());
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
    const board = await store.boards.findByViewToken(req.params.view_token);
    if (!board) return res.status(404).json({ error: 'Board not found' });

    // A board with a future unlock date keeps its notes secret until then
    if (isLocked(board)) {
      return res.json({ ...withoutSecrets(board), comments: [], comment_count: await store.notes.count(board.id), locked: true });
    }
    res.json({ ...withoutSecrets(board), comments: await store.notes.list(board.id) });
  }));

  // GET /api/boards/:board_id  – board details. The reveal link (view_token) is
  // only included for the creator, so contributors cannot peek at the notes.
  app.get('/api/boards/:board_id', loadBoard, (req, res) => {
    const board = withoutSecrets(req.board);
    if (!req.access.canRead) {
      delete board.view_token;
      delete board.view_link;
    }
    res.json({ ...board, is_creator: req.access.canRead, can_moderate: req.access.canModerate });
  });

  // ─── Notes ─────────────────────────────────────────────────────────────────

  // POST /api/boards/:board_id/comments  – add a note
  app.post('/api/boards/:board_id/comments', rateLimit(store, 'postNote'), loadBoard, handle(async (req, res) => {
    if (isBot(req.body)) return res.status(400).json({ error: 'Something looked off. Please try again.' });
    const { board } = req;

    const author = cleanText(req.body.author, TEXT_LIMITS.author);
    if (board.allow_anonymous === false && !author) {
      return res.status(400).json({ error: 'This board needs a name on every note' });
    }
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
    if (message.length > TEXT_LIMITS.message) {
      return res.status(400).json({ error: `Notes can be up to ${TEXT_LIMITS.message} characters.` });
    }
    if ((await store.notes.count(board.id, { includeHidden: true })) >= MAX_NOTES_PER_BOARD) {
      return res.status(409).json({ error: 'This wall is full. That is a lot of love.' });
    }

    const note = {
      id: uuidv4(),
      board_id: board.id,
      author: author || 'Anonymous',
      message,
      color: cleanColor(req.body.color),
      gif: await resolveMedia(req.body.gif, 'image'),
      audio: await resolveMedia(req.body.audio, 'audio'),
      ...noteSettings(req.body),
      hidden: false,
      created_at: new Date().toISOString(),
    };
    await store.notes.insert(note);
    res.status(201).json(note);
  }));

  // GET /api/boards/:board_id/comments  – every note, hidden ones included (creator only)
  app.get('/api/boards/:board_id/comments', loadBoard, handle(async (req, res) => {
    if (!req.access.canRead) return res.status(403).json({ error: 'Only the person who made this wall can see the notes before the reveal.' });
    res.json(await store.notes.list(req.board.id, { includeHidden: true }));
  }));

  // GET /api/boards/:board_id/stats  – note count without downloading any media
  app.get('/api/boards/:board_id/stats', loadBoard, handle(async (req, res) => {
    res.json({ comment_count: await store.notes.count(req.board.id) });
  }));

  // PATCH /api/boards/:board_id/comments/:comment_id  – hide or show a note (creator only)
  app.patch('/api/boards/:board_id/comments/:comment_id', rateLimit(store, 'moderate'), loadBoard, requireModerator, handle(async (req, res) => {
    if (typeof req.body.hidden !== 'boolean') return res.status(400).json({ error: '`hidden` must be true or false' });
    const found = await store.notes.setHidden(req.board.id, req.params.comment_id, req.body.hidden);
    if (!found) return res.status(404).json({ error: 'Comment not found' });
    res.json({ success: true, hidden: req.body.hidden });
  }));

  // DELETE /api/boards/:board_id/comments/:comment_id  – delete a note (creator only)
  app.delete('/api/boards/:board_id/comments/:comment_id', rateLimit(store, 'moderate'), loadBoard, requireModerator, handle(async (req, res) => {
    const found = await store.notes.remove(req.board.id, req.params.comment_id);
    if (!found) return res.status(404).json({ error: 'Comment not found' });
    res.json({ success: true });
  }));

  // POST /api/reports  – the recipient (anyone holding the reveal link) reports a
  // note. It is logged for us and hidden from that wall straight away.
  app.post('/api/reports', rateLimit(store, 'report'), handle(async (req, res) => {
    const { view_token: viewToken, comment_id: commentId } = req.body;
    if (typeof viewToken !== 'string' || typeof commentId !== 'string') {
      return res.status(400).json({ error: 'view_token and comment_id are required' });
    }
    const board = await store.boards.findByViewToken(viewToken);
    if (!board) return res.status(404).json({ error: 'Board not found' });
    if (!(await store.notes.setHidden(board.id, commentId, true))) return res.status(404).json({ error: 'Comment not found' });

    await store.reports.insert({
      id: uuidv4(),
      board_id: board.id,
      comment_id: commentId,
      reason: cleanText(req.body.reason, TEXT_LIMITS.reason),
      created_at: new Date().toISOString(),
    });
    res.status(201).json({ success: true });
  }));

  // Fallback: serve index.html for any non-API route (SPA support)
  app.get('*', (req, res) => res.sendFile(path.join(FRONTEND, 'index.html')));

  return app;
}

module.exports = { createApp };
