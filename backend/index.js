// Entry point for Vercel and `node index.js`: connects the API to Supabase.
// For a database-free local run use `npm run dev:memory` (scripts/dev-memory.js).

const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { createApp } = require('./app');
const { createSupabaseStore } = require('./store/supabase');
const { createSupabaseMedia } = require('./media/supabase');
// Always read backend/.env, whatever directory the server was started from
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  console.error('   Create backend/.env with (Supabase dashboard > Project Settings > API):\n');
  console.error('   SUPABASE_URL=https://<project-ref>.supabase.co');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=<service_role secret>\n');
  process.exit(1);
}

// Server-side only: the service role key bypasses row level security, so it
// must never reach the browser.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const app = createApp({
  store: createSupabaseStore(supabase),
  media: createSupabaseMedia(supabase, { url: SUPABASE_URL }),
});

// ─── Local dev server ─────────────────────────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
}

module.exports = app;
