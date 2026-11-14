// Runs HypeWall with no database: data and uploads live in memory and vanish
// on restart. Handy for UI work and used by the API test suite.
//   npm run dev:memory            (port 5000)
//   PORT=5057 npm run dev:memory

const express = require('express');
const { createApp } = require('../app');
const { createMemoryStore } = require('../store/memory');
const { createMemoryMedia } = require('../media/memory');

const PORT = Number(process.env.PORT || 5000);
const store = createMemoryStore();
const app = createApp({ store, media: createMemoryMedia({ baseUrl: `http://localhost:${PORT}` }) });

// Test-only hooks, mounted only when HYPEWALL_TEST_HOOKS=1
const server = express();
if (process.env.HYPEWALL_TEST_HOOKS === '1') {
  server.use(express.json());
  // Move a wall's unlock date
  server.post('/__test/unlock/:id', (req, res) => {
    store.tables.boards.find((b) => b.id === req.params.id).unlock_at = req.body.unlock_at;
    res.json({ ok: true });
  });
  // A wall shaped like one made before creator keys existed
  server.post('/__test/legacy-board', (req, res) => {
    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4(), viewToken = uuidv4();
    store.tables.boards.push({
      id, aesthetic: 'professional', recipient_name: 'Old Board', bg_image: null, bg_audio: null,
      join_code: 'OLD' + String(Date.now()).slice(-3), view_token: viewToken, creator_key_hash: null,
      created_at: new Date().toISOString(), contributor_link: `/index.html?contribute=${id}`, view_link: `/index.html?view=${viewToken}`,
    });
    res.json({ id, view_token: viewToken });
  });
}
server.use(app);
server.listen(PORT, () => console.log(`✅ HypeWall (in-memory) on http://localhost:${PORT}`));
