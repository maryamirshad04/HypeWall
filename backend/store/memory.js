// In-memory store with the same interface as store/supabase.js.
// Used by the test suite and by `npm run dev:memory` (no database needed).

const { ConflictError } = require('./supabase');

const copy = (row) => (row ? structuredClone(row) : null);

function createMemoryStore() {
  const tables = { boards: [], comments: [], reports: [], rateLimits: new Map() };
  const byBoard = (boardId, includeHidden) =>
    tables.comments.filter((c) => c.board_id === boardId && (includeHidden || !c.hidden));

  return {
    tables, // exposed for test hooks only

    boards: {
      async insert(board) {
        if (tables.boards.some((b) => b.join_code === board.join_code || b.id === board.id)) throw new ConflictError('duplicate');
        tables.boards.push(copy(board));
        return board;
      },
      findById: async (id) => copy(tables.boards.find((b) => b.id === id)),
      findByCode: async (code) => copy(tables.boards.find((b) => b.join_code === code)),
      findByViewToken: async (token) => copy(tables.boards.find((b) => b.view_token === token)),
    },

    notes: {
      async insert(note) {
        tables.comments.push(copy({ hidden: false, ...note }));
        return note;
      },
      list: async (boardId, { includeHidden = false } = {}) =>
        byBoard(boardId, includeHidden).map(copy).sort((a, b) => (a.created_at < b.created_at ? -1 : 1)),
      count: async (boardId, { includeHidden = false } = {}) => byBoard(boardId, includeHidden).length,
      async setHidden(boardId, noteId, hidden) {
        const note = tables.comments.find((c) => c.id === noteId && c.board_id === boardId);
        if (note) note.hidden = hidden;
        return Boolean(note);
      },
      async remove(boardId, noteId) {
        const index = tables.comments.findIndex((c) => c.id === noteId && c.board_id === boardId);
        if (index >= 0) tables.comments.splice(index, 1);
        return index >= 0;
      },
    },

    reports: {
      async insert(report) { tables.reports.push(copy(report)); },
    },

    rateLimits: {
      async hit(key, expiresAt) {
        const now = Date.now();
        const entry = tables.rateLimits.get(key);
        const next = entry && entry.expiresAt > now ? entry.count + 1 : 1;
        tables.rateLimits.set(key, { count: next, expiresAt: expiresAt.getTime() });
        return next;
      },
    },
  };
}

module.exports = { createMemoryStore };
