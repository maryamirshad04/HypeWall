// Thin wrappers around the backend routes. Every call throws an Error whose
// `status` is the HTTP status (0 for network failures).

const API_URL = '/api';

// `key` is the board's creator key; it unlocks creator-only reads and moderation
async function request(path, { key, ...options } = {}) {
  let response;
  try {
    response = await fetch(API_URL + path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Creator-Key': key } : {}) },
    });
  } catch {
    const error = new Error('Could not reach HypeWall. Check your connection and try again.');
    error.status = 0;
    throw error;
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error((body && body.error) || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return body;
}

const post = (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) });
const board = (boardId) => `/boards/${encodeURIComponent(boardId)}`;
const note = (boardId, noteId) => `${board(boardId)}/comments/${encodeURIComponent(noteId)}`;

export const api = {
  createBoard: (settings) => post('/boards', settings),
  getBoard: (boardId, key) => request(board(boardId), { key }),
  getBoardByCode: (code) => request(`/boards/code/${encodeURIComponent(code.toUpperCase())}`),
  getBoardByViewToken: (token) => request(`/boards/view/${encodeURIComponent(token)}`),
  getStats: (boardId) => request(`${board(boardId)}/stats`),
  addComment: (boardId, data) => post(`${board(boardId)}/comments`, data),
  // creator only
  listNotes: (boardId, key) => request(`${board(boardId)}/comments`, { key }),
  setNoteHidden: (boardId, noteId, hidden, key) => request(note(boardId, noteId), { key, method: 'PATCH', body: JSON.stringify({ hidden }) }),
  deleteNote: (boardId, noteId, key) => request(note(boardId, noteId), { key, method: 'DELETE' }),
  // recipient
  reportNote: (viewToken, noteId, reason = '') => post('/reports', { view_token: viewToken, comment_id: noteId, reason }),
};
