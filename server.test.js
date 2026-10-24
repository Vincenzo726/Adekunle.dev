const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('./server');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('health endpoint reports the server is ready', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('portfolio pages are served with page-to-page navigation', async () => {
  for (const page of ['/', '/about.html', '/projects.html', '/more.html', '/contact.html']) {
    const response = await fetch(`${baseUrl}${page}`);
    assert.equal(response.status, 200, `${page} should be served`);
    const html = await response.text();
    assert.match(html, /href="\/about\.html"/, `${page} should link to About`);
    assert.match(html, /href="\/projects\.html"/, `${page} should link to Projects`);
    assert.match(html, /href="\/more\.html"/, `${page} should link to More`);
    assert.match(html, /href="\/contact\.html"/, `${page} should link to Contact`);
    assert.match(html, /property="og:title"/, `${page} should include a share title`);
    assert.match(html, /href="\/favicon\.svg"/, `${page} should include the site favicon`);
  }

  const favicon = await fetch(`${baseUrl}/favicon.svg`);
  assert.equal(favicon.status, 200);
  assert.match(favicon.headers.get('content-type'), /image\/svg\+xml/);
});

test('contact endpoint rejects invalid submissions', async () => {
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'not-an-email', message: 'short' }),
  });

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /check your name, email, and message/i);
});

test('contact endpoint does not claim delivery before SMTP is configured', async () => {
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Ada Lovelace', email: 'ada@example.com', message: 'I would like to discuss a project.' }),
  });

  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /not configured yet/i);
});