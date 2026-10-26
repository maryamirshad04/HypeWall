// Creator keys live in the creator's private link and, as a convenience, in
// this browser's storage so the share page keeps working without the link.

const storageKey = (boardId) => `hypewall:creator:${boardId}`;

export function rememberKey(boardId, key) {
  try { localStorage.setItem(storageKey(boardId), key); } catch { /* private mode: the link still works */ }
}

export function recallKey(boardId) {
  try { return localStorage.getItem(storageKey(boardId)); } catch { return null; }
}
