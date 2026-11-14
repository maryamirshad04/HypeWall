// In-memory stand-in for Supabase Storage (tests and `npm run dev:memory`).
// Mount `router` on the app: it accepts the signed-URL PUTs and serves files back.

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { newPath, baseType, MAX_BYTES } = require('./files');

function createMemoryMedia({ baseUrl }) {
  const files = new Map();   // path -> { buffer, contentType }
  const tokens = new Map();  // upload token -> path
  const publicPrefix = `${baseUrl.replace(/\/$/, '')}/__media/`;

  const router = express.Router();
  router.put('/__media/upload/*', express.raw({ type: '*/*', limit: MAX_BYTES }), (req, res) => {
    const path = tokens.get(req.query.token);
    if (!path || path !== req.params[0]) return res.status(403).json({ error: 'bad upload token' });
    tokens.delete(req.query.token);
    files.set(path, { buffer: req.body, contentType: req.get('content-type') });
    res.json({ Key: path });
  });
  router.get('/__media/*', (req, res) => {
    const file = files.get(req.params[0]);
    if (!file) return res.status(404).end();
    res.type(file.contentType).send(file.buffer);
  });

  return {
    publicPrefix,
    router,
    files,
    isOurs: (value) => typeof value === 'string' && value.startsWith(publicPrefix) && !value.includes('..'),
    async createUpload(contentType) {
      const path = newPath(contentType);
      const token = uuidv4();
      tokens.set(token, path);
      return { upload_url: `${publicPrefix}upload/${path}?token=${token}`, public_url: publicPrefix + path, path };
    },
    async uploadBuffer(buffer, contentType, path = newPath(contentType)) {
      files.set(path, { buffer, contentType: baseType(contentType) });
      return publicPrefix + path;
    },
  };
}

module.exports = { createMemoryMedia };
