// In-browser voice note recording with MediaRecorder.

import { blobToDataUrl, LIMITS } from './media.js';

export const MAX_SECONDS = 60;

export const canRecord = () => Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);

function pickMimeType() {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || '';
}

// onTick(seconds) fires every second while recording
export async function startRecording({ onTick } = {}) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType = pickMimeType();
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType, audioBitsPerSecond: 48000 } : undefined);
  const chunks = [];
  let seconds = 0;

  recorder.addEventListener('dataavailable', (e) => e.data.size && chunks.push(e.data));
  const ticker = setInterval(() => {
    seconds += 1;
    onTick?.(seconds);
    if (seconds >= MAX_SECONDS) stop();
  }, 1000);

  const finished = new Promise((resolve, reject) => {
    recorder.addEventListener('stop', async () => {
      clearInterval(ticker);
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
      if (blob.size > LIMITS.audioBytes) return reject(new Error('That recording is too long. Keep it under a minute.'));
      resolve({ dataUrl: await blobToDataUrl(blob), seconds });
    });
  });

  function stop() {
    if (recorder.state !== 'inactive') recorder.stop();
    return finished;
  }

  recorder.start();
  return { stop };
}
