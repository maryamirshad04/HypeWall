// End-to-end API checks. Run through `npm test` (tests/run.js starts the server).
const base = 'http://localhost:' + (process.argv[2] || 5000);
let failed = 0;
let ipCounter = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) failed++; };
// Each call gets a fresh client IP unless one is given, so rate limits only bite where tested
const call = async (method, url, body, { key, ip } = {}) => {
  const headers = { 'Content-Type': 'application/json', 'X-Forwarded-For': ip || `10.0.${Math.floor(++ipCounter / 250)}.${ipCounter % 250}` };
  if (key) headers['X-Creator-Key'] = key;
  const r = await fetch(base + url, { method, headers, body: body && JSON.stringify(body) });
  let json = null; try { json = await r.json(); } catch {}
  return { status: r.status, json };
};
const hasSecret = (obj) => JSON.stringify(obj).includes('creator_key_hash');
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';

(async () => {
  // 1. Create, as the old frontend sent it
  const legacy = await call('POST', '/api/boards', { aesthetic: 'dark-academia', recipient_name: 'Prof', bg_image: null, bg_audio: null });
  const b = legacy.json;
  const key = b.creator_key;
  ok(legacy.status === 201, 'create returns 201');
  for (const k of ['id', 'aesthetic', 'recipient_name', 'bg_image', 'bg_audio', 'join_code', 'view_token', 'created_at', 'contributor_link', 'view_link']) ok(k in b, 'create keeps field ' + k);
  ok(b.contributor_link === '/index.html?contribute=' + b.id && b.view_link === '/index.html?view=' + b.view_token, 'link formats unchanged');
  ok(/^[A-Z0-9]{6}$/.test(b.join_code), 'join code is 6 characters');
  ok(typeof key === 'string' && key.length >= 30 && b.creator_link === `/index.html?board=${b.id}&key=${key}`, 'creator key + creator link returned once');
  ok(!hasSecret(b), 'create never leaks the key hash');
  ok(b.wrapper === 'gift' && b.reveal_style === 'solitaire' && b.allow_anonymous === true && b.unlock_at === null, 'safe defaults');
  const empty = await call('POST', '/api/boards', {});
  ok(empty.status === 201 && empty.json.aesthetic === 'professional' && empty.json.recipient_name === 'Someone Special', 'empty body uses old defaults');

  // 2. Notes
  const c1 = await call('POST', `/api/boards/${b.id}/comments`, { author: 'Ali', message: 'hi', color: '#FFE066' });
  ok(c1.status === 201 && c1.json.author === 'Ali' && c1.json.color === '#FFE066' && c1.json.gif === null && c1.json.audio === null, 'note fields intact');
  ok(c1.json.font === 'hand' && c1.json.shape === 'sticky' && Array.isArray(c1.json.stickers), 'note style defaults');
  const anon = await call('POST', `/api/boards/${b.id}/comments`, { message: 'x' });
  ok(anon.status === 201 && anon.json.author === 'Anonymous' && anon.json.color === '#FFD700', 'anonymous note allowed by default');

  // 3. Media: direct uploads and older base64 clients
  ok((await call('POST', '/api/uploads', { kind: 'image', content_type: 'application/pdf', size: 10 })).status === 400, 'upload rejects wrong type');
  ok((await call('POST', '/api/uploads', { kind: 'audio', content_type: 'image/png', size: 10 })).status === 400, 'upload rejects type/kind mismatch');
  ok((await call('POST', '/api/uploads', { kind: 'image', content_type: 'image/png', size: 11 * 1024 * 1024 })).status === 400, 'upload rejects files over 10MB');
  const slot = await call('POST', '/api/uploads', { kind: 'audio', content_type: 'audio/webm;codecs=opus', size: 4 });
  ok(slot.status === 201 && slot.json.upload_url && slot.json.public_url, 'upload slot issued');
  const put = await fetch(slot.json.upload_url, { method: 'PUT', headers: { 'Content-Type': 'audio/webm' }, body: Buffer.from('abcd') });
  ok(put.ok, 'file uploads to the signed URL');
  ok((await fetch(slot.json.upload_url, { method: 'PUT', body: Buffer.from('x') })).status === 403, 'signed URL works only once');
  ok((await (await fetch(slot.json.public_url)).text()) === 'abcd', 'uploaded file is served back');
  const withLink = await call('POST', `/api/boards/${b.id}/comments`, { message: 'voice', audio: slot.json.public_url });
  ok(withLink.status === 201 && withLink.json.audio === slot.json.public_url, 'note keeps an uploaded file link');
  const withData = await call('POST', `/api/boards/${b.id}/comments`, { message: 'old client', gif: PNG, audio: WAV });
  const prefix = slot.json.public_url.slice(0, slot.json.public_url.indexOf('/__media/') + 9);
  ok(withData.status === 201 && withData.json.gif.startsWith(prefix) && withData.json.audio.startsWith(prefix), 'base64 media from older clients moves into storage');
  ok((await call('POST', `/api/boards/${b.id}/comments`, { message: 'x', gif: 'https://evil.example/pixel.gif' })).status === 400, 'outside media links rejected');
  ok((await call('POST', `/api/boards/${b.id}/comments`, { message: 'x', audio: PNG })).status === 400, 'image sent as audio rejected');
  const bgBoard = await call('POST', '/api/boards', { recipient_name: 'Pic', bg_image: PNG });
  ok(bgBoard.status === 201 && bgBoard.json.bg_image.startsWith(prefix), 'board background moves into storage');

  // 4. Creator key protects the reveal link and the notes
  const asGuest = await call('GET', `/api/boards/${b.id}`);
  ok(asGuest.status === 200 && !('view_token' in asGuest.json) && !('view_link' in asGuest.json) && asGuest.json.is_creator === false, 'guests never get the reveal link');
  ok(!hasSecret(asGuest.json), 'board read never leaks the key hash');
  const asCreator = await call('GET', `/api/boards/${b.id}`, null, { key });
  ok(asCreator.json.view_token === b.view_token && asCreator.json.is_creator === true && asCreator.json.can_moderate === true, 'creator key unlocks the reveal link');
  ok(!('view_token' in (await call('GET', `/api/boards/${b.id}`, null, { key: 'nope' + key.slice(4) })).json), 'a wrong key gets guest access');
  ok((await call('GET', `/api/boards/${b.id}/comments`)).status === 403, 'guests cannot list notes');
  const list = await call('GET', `/api/boards/${b.id}/comments`, null, { key });
  ok(list.status === 200 && list.json.length === 4 && list.json[0].message === 'hi', 'creator lists notes, oldest first');
  const byCode = await call('GET', `/api/boards/code/${b.join_code.toLowerCase()}`);
  ok(byCode.status === 200 && byCode.json.id === b.id && !('view_token' in byCode.json), 'code lookup works and hides view_token');
  const view = await call('GET', `/api/boards/view/${b.view_token}`);
  ok(view.status === 200 && view.json.comments.length === 4 && !hasSecret(view.json), 'reveal returns notes without secrets');
  ok((await call('GET', `/api/boards/${b.id}/stats`)).json.comment_count === 4, 'stats counts notes');

  // 5. Moderation
  ok((await call('PATCH', `/api/boards/${b.id}/comments/${c1.json.id}`, { hidden: true })).status === 403, 'guests cannot hide');
  ok((await call('PATCH', `/api/boards/${b.id}/comments/${c1.json.id}`, { hidden: 'yes' }, { key })).status === 400, 'hidden must be boolean');
  const hide = await call('PATCH', `/api/boards/${b.id}/comments/${c1.json.id}`, { hidden: true }, { key });
  ok(hide.status === 200 && hide.json.hidden === true, 'creator hides a note');
  ok((await call('GET', `/api/boards/view/${b.view_token}`)).json.comments.length === 3, 'hidden note left out of the reveal');
  ok((await call('GET', `/api/boards/${b.id}/stats`)).json.comment_count === 3, 'stats skip hidden notes');
  ok((await call('GET', `/api/boards/${b.id}/comments`, null, { key })).json.find((c) => c.id === c1.json.id).hidden === true, 'creator still sees hidden note, flagged');
  await call('PATCH', `/api/boards/${b.id}/comments/${c1.json.id}`, { hidden: false }, { key });
  ok((await call('GET', `/api/boards/view/${b.view_token}`)).json.comments.length === 4, 'unhide brings it back');
  ok((await call('DELETE', `/api/boards/${b.id}/comments/${c1.json.id}`)).status === 403, 'guests cannot delete');
  const del = await call('DELETE', `/api/boards/${b.id}/comments/${c1.json.id}`, null, { key });
  ok(del.status === 200 && del.json.success === true, 'creator deletes a note');
  ok((await call('DELETE', `/api/boards/${b.id}/comments/${c1.json.id}`, null, { key })).status === 404, 'delete twice is 404');
  ok((await call('PATCH', `/api/boards/${b.id}/comments/nope`, { hidden: true }, { key })).status === 404, 'hide unknown note is 404');

  // 6. Walls made before creator keys
  const old = (await call('POST', '/__test/legacy-board', {})).json;
  const oldRead = await call('GET', `/api/boards/${old.id}`);
  ok(oldRead.json.view_token === old.view_token && oldRead.json.can_moderate === false, 'legacy board reads unchanged');
  ok((await call('GET', `/api/boards/${old.id}/comments`)).status === 200, 'legacy board notes still listable');
  const oldNote = await call('POST', `/api/boards/${old.id}/comments`, { message: 'still works' });
  ok(oldNote.status === 201, 'legacy board accepts notes');
  ok((await call('DELETE', `/api/boards/${old.id}/comments/${oldNote.json.id}`)).status === 403, 'legacy board notes cannot be deleted anonymously');

  // 7. Reports (from the reveal)
  const target = (await call('POST', `/api/boards/${b.id}/comments`, { author: 'Troll', message: 'mean' })).json;
  ok((await call('POST', '/api/reports', { view_token: 'nope', comment_id: target.id })).status === 404, 'report with bad token is 404');
  ok((await call('POST', '/api/reports', { view_token: b.view_token })).status === 400, 'report needs a note id');
  ok((await call('POST', '/api/reports', { view_token: b.view_token, comment_id: target.id, reason: 'not nice' })).status === 201, 'report accepted');
  ok(!(await call('GET', `/api/boards/view/${b.view_token}`)).json.comments.some((c) => c.id === target.id), 'reported note hidden from the reveal');

  // 8. Size caps and spam guards
  ok((await call('POST', `/api/boards/${b.id}/comments`, { message: 'x'.repeat(1001) })).status === 400, 'message over 1000 chars rejected');
  const capped = await call('POST', `/api/boards/${b.id}/comments`, { author: 'A'.repeat(200), message: 'ok', color: 'red; background:url(x)' });
  ok(capped.status === 201 && capped.json.author.length === 60 && capped.json.color === '#FFD700', 'author capped, bad colour replaced');
  ok((await call('POST', '/api/boards', { recipient_name: 'N'.repeat(300) })).json.recipient_name.length === 60, 'recipient name capped at 60');
  ok((await call('POST', '/api/boards', { recipient_name: 'Bot', website: 'http://spam' })).status === 400, 'honeypot stops bot boards');
  ok((await call('POST', `/api/boards/${b.id}/comments`, { message: 'hi', website: 'spam' })).status === 400, 'honeypot stops bot notes');

  // 9. Rate limits (same client IP)
  const createStatuses = [];
  for (let i = 0; i < 11; i++) createStatuses.push((await call('POST', '/api/boards', { recipient_name: 'R' + i }, { ip: '203.0.113.7' })).status);
  ok(createStatuses.slice(0, 10).every((s) => s === 201) && createStatuses[10] === 429, '11th wall in an hour is rate limited');
  const noteStatuses = [];
  for (let i = 0; i < 21; i++) noteStatuses.push((await call('POST', `/api/boards/${b.id}/comments`, { message: 'n' + i }, { ip: '203.0.113.8' })).status);
  ok(noteStatuses.slice(0, 20).every((s) => s === 201) && noteStatuses[20] === 429, '21st note in 10 minutes is rate limited');
  ok((await call('POST', `/api/boards/${b.id}/comments`, { message: 'other person' }, { ip: '203.0.113.9' })).status === 201, 'other people are unaffected');

  // 10. Wall capacity
  const full = (await call('POST', '/api/boards', { recipient_name: 'Popular' })).json;
  for (let i = 0; i < 300; i++) await call('POST', `/api/boards/${full.id}/comments`, { message: 'm' + i });
  ok((await call('POST', `/api/boards/${full.id}/comments`, { message: 'one more' })).status === 409, 'a wall caps at 300 notes');

  // 11. Locks, 404s, static
  const nb = (await call('POST', '/api/boards', { recipient_name: 'Amna', occasion: 'farewell', wrapper: 'mailbox', reveal_style: 'rain', bg_choice: 'sketch', music_track: 'level-up', allow_anonymous: false, unlock_at: '2099-01-01T00:00:00Z' })).json;
  ok(nb.occasion === 'farewell' && nb.wrapper === 'mailbox' && nb.allow_anonymous === false, 'board settings stored');
  ok((await call('POST', `/api/boards/${nb.id}/comments`, { author: '  ', message: 'x' })).status === 400, 'name required when anonymous is off');
  const styled = await call('POST', `/api/boards/${nb.id}/comments`, { author: 'Zara', message: 'yo', stickers: ['heart', 'heart', 'bomb', 'star', 'crown', 'smile'] });
  ok(JSON.stringify(styled.json.stickers) === '["heart","star","crown"]', 'stickers deduped, filtered, capped at 3');
  const locked = await call('GET', `/api/boards/view/${nb.view_token}`);
  ok(locked.json.locked === true && locked.json.comments.length === 0 && locked.json.comment_count === 1, 'future unlock hides notes');
  await call('POST', `/__test/unlock/${nb.id}`, { unlock_at: '2000-01-01T00:00:00.000Z' });
  ok((await call('GET', `/api/boards/view/${nb.view_token}`)).json.comments.length === 1, 'past unlock shows notes');
  for (const url of ['/api/boards/nope', '/api/boards/code/ZZZZZZ', '/api/boards/view/nope', '/api/boards/nope/stats', '/api/boards/nope/comments']) ok((await call('GET', url)).status === 404, '404 ' + url);
  ok((await call('POST', '/api/boards/nope/comments', { message: 'x' })).status === 404, '404 note on unknown board');
  const page = await fetch(base + '/index.html?view=abc');
  ok(page.status === 200 && (await page.text()).includes('<html'), 'index.html served');
  ok((await fetch(base + '/some/deep/link')).status === 200, 'SPA fallback');

  console.log(failed ? `\n${failed} FAILED` : '\nALL PASSED');
  process.exit(failed ? 1 : 0);
})();
