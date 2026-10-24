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
    assert.match(html, new RegExp(`<link rel="canonical" href="https://adekunle-dev\\.onrender\\.com${page === '/' ? '/' : page}">`), `${page} should include its canonical URL`);
    assert.match(html, /property="og:image" content="https:\/\/adekunle-dev\.onrender\.com\/images\/profile\.jpg"/, `${page} should use the profile photo as its social image`);
    assert.match(html, /href="\/favicon\.svg"/, `${page} should include the site favicon`);
  }

  const favicon = await fetch(`${baseUrl}/favicon.svg`);
  assert.equal(favicon.status, 200);
  assert.match(favicon.headers.get('content-type'), /image\/svg\+xml/);

  const profilePhoto = await fetch(`${baseUrl}/images/profile.jpg`);
  assert.equal(profilePhoto.status, 200);
  assert.match(profilePhoto.headers.get('content-type'), /image\/jpeg/);
});

test('homepage person structured data includes the profile image and work specialties', async () => {
  const response = await fetch(`${baseUrl}/`);
  const html = await response.text();
  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(jsonLd, 'homepage should include JSON-LD');
  const data = JSON.parse(jsonLd[1]);
  const person = data['@graph'].find((item) => item['@type'] === 'Person');
  assert.equal(person.name, 'ADEKUNLE BOLUWATIFE JOHN');
  assert.equal(person.image, 'https://adekunle-dev.onrender.com/images/profile.jpg');
  assert.ok(person.sameAs.includes('https://linkedin.com/in/boluwatife-adekunle-897588318'));
  assert.ok(person.knowsAbout.includes('Backend development'));
});

test('About page displays the profile portrait with descriptive alt text', async () => {
  const response = await fetch(`${baseUrl}/about.html`);
  const html = await response.text();
  assert.match(html, /src="\/images\/profile\.jpg" alt="Portrait of ADEKUNLE BOLUWATIFE JOHN"/);
});

test('robots and sitemap are available and list only canonical portfolio pages', async () => {
  const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
  assert.equal(robotsResponse.status, 200);
  const robots = await robotsResponse.text();
  assert.match(robots, /Disallow: \/api\//);
  assert.match(robots, /Sitemap: https:\/\/adekunle-dev\.onrender\.com\/sitemap\.xml/);

  const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
  assert.equal(sitemapResponse.status, 200);
  assert.match(sitemapResponse.headers.get('content-type'), /application\/xml/);
  const sitemap = await sitemapResponse.text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(urls, [
    'https://adekunle-dev.onrender.com/',
    'https://adekunle-dev.onrender.com/about.html',
    'https://adekunle-dev.onrender.com/projects.html',
    'https://adekunle-dev.onrender.com/more.html',
    'https://adekunle-dev.onrender.com/contact.html',
  ]);
});

test('Google Search Console verification file is served from the site root', async () => {
  const response = await fetch(`${baseUrl}/google671b0285eb845f18.html`);
  assert.equal(response.status, 200);
  assert.equal((await response.text()).trim(), 'google-site-verification: google671b0285eb845f18.html');
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