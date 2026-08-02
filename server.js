const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const EDIT_PASSWORD = process.env.EDIT_PASSWORD || 'Hh69696969!';

function defaultContent() {
  return {
    siteName: 'Nova Lane',
    eyebrow: 'a small corner of the internet',
    tagline: '18 • she/her • cyber stuff and tech stuff • learning as i go and trying to make sense of the internet.',
    about: "im kinda into cybersecurity and tech stuff, and i like learning about networking and how systems work behind the scenes. i learn best by just messing around and being curious about how things work.",
    subtext: 'cisco and security stuff and all the little details that make tech feel smarter and safer are what i like most.',
    projects: 'right now im mostly just learning and growing in cyber stuff, networking, and tech in general. im taking it slow but i still wanna keep exploring new things.',
    contact: {
      discord: '3sweetpea3',
      github: 'dwuggy0',
      email: 'dwuggy9@gmail.com'
    }
  };
}

function readContent() {
  if (!fs.existsSync(DATA_FILE)) {
    writeContent(defaultContent());
    return defaultContent();
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    writeContent(defaultContent());
    return defaultContent();
  }
}

function writeContent(content) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(content, null, 2));
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function createServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'GET' && url.pathname === '/api/content') {
      return sendJson(res, 200, readContent());
    }

    if (req.method === 'POST' && url.pathname === '/api/content') {
      const suppliedPassword = req.headers['x-edit-password'];
      if (suppliedPassword !== EDIT_PASSWORD) {
        return sendJson(res, 401, { error: 'unauthorized' });
      }

      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const incoming = JSON.parse(body || '{}');
          const current = readContent();
          const updated = { ...current, ...incoming };
          writeContent(updated);
          return sendJson(res, 200, updated);
        } catch {
          return sendJson(res, 400, { error: 'invalid json' });
        }
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'GET') {
      const filePath = path.join(__dirname, 'public', url.pathname === '/' ? 'index.html' : url.pathname);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const contentType = {
          '.html': 'text/html; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.json': 'application/json; charset=utf-8'
        }[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(fs.readFileSync(filePath));
        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('not found');
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

module.exports = { createServer, defaultContent, readContent, writeContent };
