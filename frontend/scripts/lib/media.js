// Picked files are kept locally (with a blob: URL for previews) until the form
// is submitted, then uploaded straight to Supabase Storage through a signed
// URL from the API. Nothing heavy travels through our own server.
//
//   const local = await prepareImage(file);   // { blob, url, kind }
//   const link = await uploadLocal(local);    // public Storage URL

import { api } from '../api.js';

export const MAX_BYTES = 10 * 1024 * 1024; // matches the Storage bucket limit
const IMAGE_MAX_DIMENSION = 1600;

const tooBig = () => new Error('That file is too large (max 10MB). Try a smaller one!');
const local = (blob, kind) => ({ blob, kind, url: URL.createObjectURL(blob) });

export function release(file) {
  if (file?.url) URL.revokeObjectURL(file.url);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read that image.'));
    img.src = src;
  });
}

// GIFs keep their animation; other images are downscaled and re-encoded as JPEG
export async function prepareImage(file) {
  if (!/^image\/(gif|jpeg|png|webp)$/i.test(file.type)) throw new Error('Pick a GIF, JPG, PNG or WebP image.');
  if (file.size > MAX_BYTES) throw tooBig();
  if (file.type === 'image/gif') return local(file, 'image');

  const source = URL.createObjectURL(file);
  try {
    const img = await loadImage(source);
    const scale = Math.min(1, IMAGE_MAX_DIMENSION / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    return local(blob, 'image');
  } finally {
    URL.revokeObjectURL(source);
  }
}

export function prepareAudio(fileOrBlob) {
  if (!/^audio\//i.test(fileOrBlob.type)) throw new Error('That is not an audio file.');
  if (fileOrBlob.size > MAX_BYTES) throw tooBig();
  return local(fileOrBlob, 'audio');
}

// Uploads a prepared file and returns its public link (null when there is no file)
export async function uploadLocal(file) {
  if (!file) return null;
  const slot = await api.requestUpload(file.kind, file.blob.type, file.blob.size);
  let response;
  try {
    response = await fetch(slot.upload_url, { method: 'PUT', headers: { 'Content-Type': file.blob.type }, body: file.blob });
  } catch {
    response = null;
  }
  if (!response?.ok) throw new Error('Upload failed. Check your connection and try again.');
  return slot.public_url;
}
