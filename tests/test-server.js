const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createServer } = require('../server');

test('GET /api/content returns the saved content', async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const response = await new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}/api/content`, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('error', reject);
  });

  assert.equal(response.statusCode, 200);
  const data = JSON.parse(response.body);
  assert.ok(data.siteName);

  await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
});

test('POST /api/content rejects the wrong password', async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const payload = JSON.stringify({ tagline: 'blocked update' });

  const response = await new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/content',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'x-edit-password': 'wrong-password',
        },
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });

  assert.equal(response.statusCode, 401);

  await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
});

test('POST /api/content saves updated content', async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const payload = JSON.stringify({ tagline: 'updated tagline' });

  const response = await new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/content',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'x-edit-password': 'Hh69696969!',
        },
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });

  assert.equal(response.statusCode, 200);
  const data = JSON.parse(response.body);
  assert.equal(data.tagline, 'updated tagline');

  await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
});
