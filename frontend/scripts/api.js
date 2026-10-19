// Thin wrappers around the backend routes. Every call throws an Error whose
// `status` is the HTTP status (0 for network failures).

const API_URL = '/api';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(API_URL + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
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

export const api = {
  createBoard: (settings) => post('/boards', settings),
  getBoard: (boardId) => request(`/boards/${encodeURIComponent(boardId)}`),
  getBoardByCode: (code) => request(`/boards/code/${encodeURIComponent(code.toUpperCase())}`),
  getBoardByViewToken: (token) => request(`/boards/view/${encodeURIComponent(token)}`),
  getStats: (boardId) => request(`/boards/${encodeURIComponent(boardId)}/stats`),
  getComments: (boardId) => request(`/boards/${encodeURIComponent(boardId)}/comments`),
  addComment: (boardId, note) => post(`/boards/${encodeURIComponent(boardId)}/comments`, note),
};
