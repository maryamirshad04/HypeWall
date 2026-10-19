// Uploads become data URLs that travel inside the JSON body.
// Vercel caps a request body at 4.5MB and base64 adds ~33%, so raw files stay
// well under that ceiling.

export const LIMITS = {
  audioBytes: 2 * 1024 * 1024,      // 2MB  -> ~2.7MB encoded
  gifBytes: 1.5 * 1024 * 1024,      // 1.5MB -> ~2MB encoded
  totalEncodedBytes: 4 * 1024 * 1024,
  imageMaxDimension: 1400,
};

export function encodedSize(dataUrl) {
  return dataUrl ? Math.ceil(dataUrl.length * 0.75) : 0;
}

export function totalTooLarge(...dataUrls) {
  return dataUrls.reduce((sum, url) => sum + encodedSize(url), 0) > LIMITS.totalEncodedBytes;
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read that image.'));
    img.src = src;
  });
}

// GIFs pass through untouched (to keep the animation); stills are downscaled to JPEG
export async function imageToDataUrl(file) {
  if (!file.type.startsWith('image/')) throw new Error('That is not an image.');
  if (file.type === 'image/gif') {
    if (file.size > LIMITS.gifBytes) throw new Error('That GIF is too large (max 1.5MB). Try a smaller one!');
    return fileToDataUrl(file);
  }

  const img = await loadImage(await fileToDataUrl(file));
  const scale = Math.min(1, LIMITS.imageMaxDimension / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

export async function audioToDataUrl(file) {
  if (!file.type.startsWith('audio/')) throw new Error('That is not an audio file.');
  if (file.size > LIMITS.audioBytes) throw new Error('That audio is too large (max 2MB). Try a shorter clip!');
  return fileToDataUrl(file);
}

export function blobToDataUrl(blob) {
  return fileToDataUrl(blob);
}
