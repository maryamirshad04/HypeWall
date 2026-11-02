// Shared rules for media files: what types are allowed, how big, and where they go.

const { v4: uuidv4 } = require('uuid');

const MAX_BYTES = 10 * 1024 * 1024; // matches the bucket's file_size_limit

const KINDS = {
  image: /^image\/(gif|jpeg|png|webp)$/i,
  audio: /^audio\/(mpeg|mp4|x-m4a|aac|ogg|wav|x-wav|webm)(;.*)?$/i,
};

const EXTENSIONS = {
  'image/gif': 'gif', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/aac': 'aac',
  'audio/ogg': 'ogg', 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/webm': 'webm',
};

const baseType = (contentType) => String(contentType || '').split(';')[0].trim().toLowerCase();

function isAllowed(kind, contentType) {
  return Boolean(KINDS[kind]) && KINDS[kind].test(String(contentType || '').trim());
}

// A fresh, unguessable object path, e.g. uploads/2026-11/3f2c....webm
function newPath(contentType, folder = `uploads/${new Date().toISOString().slice(0, 7)}`) {
  return `${folder}/${uuidv4()}.${EXTENSIONS[baseType(contentType)] || 'bin'}`;
}

// "data:audio/webm;codecs=opus;base64,AAAA" -> { contentType, buffer }
function parseDataUrl(value) {
  const match = /^data:([^,]+?)(;base64)?,(.*)$/s.exec(value || '');
  if (!match || !match[2]) return null;
  return { contentType: match[1].replace(/;base64$/, ''), buffer: Buffer.from(match[3], 'base64') };
}

module.exports = { MAX_BYTES, isAllowed, baseType, newPath, parseDataUrl };
