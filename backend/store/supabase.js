// Data access on Supabase Postgres. Every route goes through this interface;
// store/memory.js implements the same one for tests and offline development.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (value) => typeof value === 'string' && UUID.test(value);

class ConflictError extends Error {}

// Postgres "unique_violation"
const UNIQUE_VIOLATION = '23505';

function unwrap({ data, error }) {
  if (error) {
    if (error.code === UNIQUE_VIOLATION) throw new ConflictError(error.message);
    throw new Error(`Supabase: ${error.message}`);
  }
  return data;
}

function createSupabaseStore(supabase) {
  const boards = () => supabase.from('boards');
  const comments = () => supabase.from('comments');

  return {
    boards: {
      async insert(board) {
        unwrap(await boards().insert(board));
        return board;
      },
      async findById(id) {
        if (!isUuid(id)) return null;
        return unwrap(await boards().select('*').eq('id', id).maybeSingle());
      },
      async findByCode(code) {
        return unwrap(await boards().select('*').eq('join_code', code).maybeSingle());
      },
      async findByViewToken(token) {
        if (!isUuid(token)) return null;
        return unwrap(await boards().select('*').eq('view_token', token).maybeSingle());
      },
    },

    notes: {
      async insert(note) {
        unwrap(await comments().insert(note));
        return note;
      },
      // Oldest first. Hidden (moderated) notes only when asked for.
      async list(boardId, { includeHidden = false } = {}) {
        let query = comments().select('*').eq('board_id', boardId);
        if (!includeHidden) query = query.eq('hidden', false);
        return unwrap(await query.order('created_at', { ascending: true }));
      },
      async count(boardId, { includeHidden = false } = {}) {
        let query = comments().select('id', { count: 'exact', head: true }).eq('board_id', boardId);
        if (!includeHidden) query = query.eq('hidden', false);
        const { count, error } = await query;
        unwrap({ error });
        return count || 0;
      },
      // Both return false when no note matched
      async setHidden(boardId, noteId, hidden) {
        if (!isUuid(noteId)) return false;
        return unwrap(await comments().update({ hidden }).eq('id', noteId).eq('board_id', boardId).select('id')).length > 0;
      },
      async remove(boardId, noteId) {
        if (!isUuid(noteId)) return false;
        return unwrap(await comments().delete().eq('id', noteId).eq('board_id', boardId).select('id')).length > 0;
      },
    },

    reports: {
      async insert(report) {
        unwrap(await supabase.from('reports').insert(report));
      },
    },

    rateLimits: {
      // Increments the counter for `key` and returns the new count
      async hit(key, expiresAt) {
        return unwrap(await supabase.rpc('hit_rate_limit', { p_key: key, p_expires_at: expiresAt.toISOString() }));
      },
    },
  };
}

module.exports = { createSupabaseStore, ConflictError, isUuid };
