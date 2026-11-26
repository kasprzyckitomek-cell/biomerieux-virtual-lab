// Wirtualne Laboratorium bioMérieux – serwer (Node.js, bez zależności)
// Projekt edukacyjny, nieoficjalny. Nie jest powiązany z bioMérieux SA.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUB = path.join(__dirname, 'public');
const DATA_FILE = path.join(__dirname, 'leaderboard.json');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json'
};

let board = [];
try { board = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch (e) { board = []; }
function saveBoard() { try { fs.writeFileSync(DATA_FILE, JSON.stringify(board.slice(0, 200))); } catch (e) {} }

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let d = ''; req.on('data', c => { d += c; if (d.length > 1e5) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(d || '{}')); } catch (e) { resolve({}); } });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;

  if (p === '/health' || p === '/api/health') return send(res, 200, { ok: true, time: new Date().toISOString() });

  if (p === '/api/leaderboard' && req.method === 'GET') {
    return send(res, 200, board.sort((a, b) => b.score - a.score).slice(0, 50));
  }
  if (p === '/api/leaderboard' && req.method === 'POST') {
    const b = await readBody(req);
    const name = String(b.name || 'Anonim').replace(/[<>&"]/g, '').slice(0, 24);
    const score = Math.max(0, Math.min(1e7, parseInt(b.score, 10) || 0));
    const cases = Math.max(0, Math.min(1000, parseInt(b.cases, 10) || 0));
    const level = Math.max(1, Math.min(100, parseInt(b.level, 10) || 1));
    const ex = board.find(x => x.name === name);
    if (ex) { if (score > ex.score) Object.assign(ex, { score, cases, level, date: new Date().toISOString() }); }
    else board.push({ name, score, cases, level, date: new Date().toISOString() });
    board.sort((a, b) => b.score - a.score); saveBoard();
    return send(res, 200, { ok: true });
  }

  // pliki statyczne
  let fp = path.normalize(path.join(PUB, decodeURIComponent(p === '/' ? '/index.html' : p)));
  if (!fp.startsWith(PUB)) return send(res, 403, { error: 'forbidden' });
  fs.stat(fp, (err, st) => {
    if (err || !st.isFile()) fp = path.join(PUB, 'index.html');
    fs.readFile(fp, (e2, buf) => {
      if (e2) return send(res, 404, { error: 'not found' });
      res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream', 'Cache-Control': 'public, max-age=300' });
      res.end(buf);
    });
  });
});

server.listen(PORT, () => console.log('Wirtualne Laboratorium działa na porcie ' + PORT));
