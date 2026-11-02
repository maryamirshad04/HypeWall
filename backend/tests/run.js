// `npm test`: boots the API on the in-memory store and runs the end-to-end suite.

const { spawn } = require('child_process');
const path = require('path');

const PORT = String(5600 + Math.floor(Math.random() * 300));
const server = spawn(process.execPath, [path.join(__dirname, '../scripts/dev-memory.js')], {
  env: { ...process.env, PORT, HYPEWALL_TEST_HOOKS: '1' },
  stdio: ['ignore', 'pipe', 'inherit'],
});

server.stdout.on('data', (chunk) => {
  if (!String(chunk).includes('HypeWall (in-memory)')) return;
  const tests = spawn(process.execPath, [path.join(__dirname, 'api.test.js'), PORT], { stdio: 'inherit', env: { ...process.env, HYPEWALL_TEST_HOOKS: '1' } });
  tests.on('exit', (code) => { server.kill(); process.exit(code); });
});
server.on('exit', (code) => { if (code) process.exit(code); });
