// Creator keys, request limits and spam guards.

const crypto = require('crypto');

// ─── Creator keys ─────────────────────────────────────────────────────────────
// The plain key is returned once at creation and lives only in the creator's
// link and browser; the database keeps a SHA-256 hash.

const CREATOR_KEY_HEADER = 'x-creator-key';

const newCreatorKey = () => crypto.randomBytes(24).toString('base64url');
const hashKey = (key) => crypto.createHash('sha256').update(String(key)).digest('hex');

function keyMatches(board, key) {
  if (!board.creator_key_hash || typeof key !== 'string' || !key) return false;
  const given = Buffer.from(hashKey(key), 'hex');
  const stored = Buffer.from(board.creator_key_hash, 'hex');
  return given.length === stored.length && crypto.timingSafeEqual(given, stored);
}

// Boards made before creator keys existed have no hash. Their links were never
// secret, so reads stay open for them (as before), but changes need a real key.
function creatorAccess(board, req) {
  const legacy = !board.creator_key_hash;
  const verified = keyMatches(board, req.get(CREATOR_KEY_HEADER));
  return { canRead: legacy || verified, canModerate: verified, legacy };
}

// ─── Client identity ──────────────────────────────────────────────────────────

function clientIp(req) {
  const header = req.get('x-vercel-forwarded-for') || req.get('x-real-ip') || req.get('x-forwarded-for') || '';
  return header.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
}

// ─── Rate limits ──────────────────────────────────────────────────────────────
// Fixed-window counters kept in the database so they hold across serverless
// instances (store.rateLimits.hit -> the hit_rate_limit SQL function).

const LIMITS = {
  createBoard: { limit: 10, windowSec: 60 * 60, message: 'You have made a lot of walls this hour. Take a breather and try again soon.' },
  postNote: { limit: 20, windowSec: 10 * 60, message: 'Whoa, that is a lot of notes. Give it a few minutes and try again.' },
  upload: { limit: 40, windowSec: 10 * 60, message: 'That is a lot of uploads. Give it a few minutes and try again.' },
  report: { limit: 10, windowSec: 60 * 60, message: 'Too many reports from you right now. Try again later.' },
  moderate: { limit: 120, windowSec: 60, message: 'Slow down a little and try again.' },
};

// Fails open: a counter outage never blocks real users.
function rateLimit(store, name) {
  const { limit, windowSec, message } = LIMITS[name];
  return async (req, res, next) => {
    try {
      const windowMs = windowSec * 1000;
      const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
      const key = `${name}:${hashKey(clientIp(req))}:${windowStart}`;
      const count = await store.rateLimits.hit(key, new Date(windowStart + windowMs));
      if (count > limit) {
        res.set('Retry-After', String(Math.ceil((windowStart + windowMs - Date.now()) / 1000)));
        return res.status(429).json({ error: message });
      }
    } catch (err) {
      console.error('rate limit check failed', err);
    }
    next();
  };
}

// ─── Spam guards ──────────────────────────────────────────────────────────────

// Forms carry a hidden "website" field that people never fill in, but bots do
function isBot(body = {}) {
  return typeof body.website === 'string' && body.website.trim() !== '';
}

module.exports = { CREATOR_KEY_HEADER, newCreatorKey, hashKey, creatorAccess, clientIp, rateLimit, isBot, LIMITS };
