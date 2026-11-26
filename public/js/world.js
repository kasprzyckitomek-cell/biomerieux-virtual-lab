/* =========================================================================
   ŚWIAT GRY – mapa laboratorium, postać diagnosty, sterowanie
   ========================================================================= */
window.WORLD = (function () {
  const T = 32, W = 50, H = 32;
  let Z = 1.4, cv, ctx, cam = { x: 0, y: 0 }, keys = {}, target = null, near = null, last = 0, mini;
  const P = { x: 25 * T, y: 15.5 * T, dir: 'down', walk: 0, moving: false };

  /* pomieszczenia: [x,y,w,h,nazwa,kolor podłogi] w kafelkach */
  const ROOMS = [
    [1, 1, 15, 13, 'REJESTRACJA · LIS · BIBLIOTEKA', '#e9eef3'],
    [17, 1, 16, 13, 'PREANALITYKA · BAKTERIOLOGIA', '#eaf2ee'],
    [34, 1, 15, 13, 'IDENTYFIKACJA I LEKOWRAŻLIWOŚĆ', '#eef0f7'],
    [1, 18, 12, 13, 'POSIEWY KRWI', '#f5ecec'],
    [14, 18, 13, 13, 'BIOLOGIA MOLEKULARNA', '#fbf1e9'],
    [28, 18, 11, 13, 'IMMUNODIAGNOSTYKA', '#f1ecf6'],
    [40, 18, 9, 13, 'QC · MYLA · PRZEMYSŁ', '#ecf4f5']
  ];
  /* drzwi (otwory w ścianach): [x,y] kafelki korytarza przy których ściana jest przerwana */
  const DOORS = [[8, 14], [24, 14], [41, 14], [6, 17], [20, 17], [33, 17], [44, 17], [16, 6], [33, 6], [13, 24], [27, 24], [39, 24]];

  /* stacje / obiekty: id, x, y, w, h (kafelki), art, etykieta, stacja */
  const OBJ = [
    { id: 'lis', x: 3, y: 3, w: 4, h: 2, art: 'pc', label: 'Rejestracja (LIS)', st: 'lis', ah: 3.2 },
    { id: 'lib', x: 9, y: 3, w: 4, h: 2, art: 'pc', label: 'Biblioteka i quiz', st: 'library', ah: 3.2 },
    { id: 'rank', x: 3, y: 9, w: 3, h: 2, art: 'pc', label: 'Ranking i ustawienia', st: 'settings', ah: 2.6 },
    { id: 'plant1', x: 13, y: 10, w: 1, h: 1, art: 'plant', ah: 1.6, deco: true },
    { id: 'bsc', x: 18, y: 2, w: 5, h: 2, art: 'bsc', label: 'Komora laminarna – posiew ręczny', st: 'bench', ah: 3.6 },
    { id: 'isola', x: 24, y: 2, w: 4, h: 2, art: 'isola', label: 'PREVI® Isola', st: 'isola', ah: 2.8 },
    { id: 'inc', x: 29, y: 2, w: 3, h: 2, art: 'incubator', label: 'Cieplarki 35°C (O₂/CO₂)', st: 'incubator', ah: 4.2 },
    { id: 'gram', x: 18, y: 9, w: 4, h: 2, art: 'colorgram', label: 'PREVI® Color Gram', st: 'gram', ah: 3 },
    { id: 'micro', x: 23, y: 9, w: 2, h: 2, art: 'microscope', label: 'Mikroskop', st: 'gram', ah: 3 },
    { id: 'fridge', x: 29, y: 9, w: 2, h: 2, art: 'fridge', label: 'Lodówka odczynników', st: 'inventory', ah: 4.2 },
    { id: 'ms', x: 35, y: 2, w: 4, h: 2, art: 'vitekms', label: 'VITEK® MS PRIME', st: 'vitekms', ah: 4.4 },
    { id: 'densi', x: 40, y: 2, w: 2, h: 2, art: 'densichek', label: 'DENSICHEK® Plus', st: 'densichek', ah: 2.6 },
    { id: 'v2', x: 43, y: 2, w: 5, h: 2, art: 'vitek2', label: 'VITEK® 2 Compact', st: 'vitek2', ah: 3.4 },
    { id: 'etest', x: 35, y: 9, w: 4, h: 2, art: 'incubator', label: 'Stanowisko ETEST®', st: 'etest', ah: 3.4 },
    { id: 'api', x: 41, y: 9, w: 4, h: 2, art: 'bsc', label: 'Stanowisko API® 20 E', st: 'api', ah: 3 },
    { id: 'virtuo', x: 3, y: 20, w: 4, h: 3, art: 'virtuo', label: 'BacT/ALERT® VIRTUO®', st: 'virtuo', ah: 5.4 },
    { id: 'bcfridge', x: 9, y: 20, w: 2, h: 2, art: 'fridge', label: 'Butelki posiewowe', st: 'virtuo', ah: 4 },
    { id: 'sink1', x: 3, y: 28, w: 3, h: 1, art: 'sink', ah: 1.6, deco: true },
    { id: 'torch', x: 15, y: 20, w: 5, h: 3, art: 'torch', label: 'BIOFIRE® FILMARRAY® TORCH', st: 'biofire', ah: 5 },
    { id: 'spot', x: 22, y: 20, w: 3, h: 2, art: 'spotfire', label: 'BIOFIRE® SPOTFIRE®', st: 'spotfire', ah: 2.8 },
    { id: 'fa2', x: 22, y: 26, w: 3, h: 2, art: 'fa2', label: 'BIOFIRE® FILMARRAY® 2.0', st: 'biofire', ah: 2.6 },
    { id: 'vidas', x: 29, y: 20, w: 5, h: 2, art: 'vidas3', label: 'VIDAS® 3', st: 'vidas', ah: 3.6 },
    { id: 'mvidas', x: 35, y: 20, w: 3, h: 2, art: 'minividas', label: 'mini VIDAS®', st: 'vidas', ah: 2.6 },
    { id: 'myla', x: 41, y: 20, w: 3, h: 2, art: 'pc', label: 'MYLA® – walidacja wyników', st: 'myla', ah: 3 },
    { id: 'qc', x: 45, y: 20, w: 3, h: 2, art: 'pc', label: 'Kontrola jakości (QC)', st: 'qc', ah: 3 },
    { id: 'tempo', x: 41, y: 26, w: 3, h: 2, art: 'tempo', label: 'TEMPO® / GENE-UP®', st: 'industry', ah: 2.8 },
    { id: 'geneup', x: 45, y: 26, w: 3, h: 2, art: 'geneup', label: 'GENE-UP®', st: 'industry', ah: 2.8 },
    { id: 'eye', x: 12, y: 29, w: 1, h: 1, art: 'eyewash', ah: 1.8, deco: true },
    { id: 'plant2', x: 26, y: 29, w: 1, h: 1, art: 'plant', ah: 1.6, deco: true },
    { id: 'plant3', x: 1, y: 15, w: 1, h: 1, art: 'plant', ah: 1.6, deco: true },
    { id: 'plant4', x: 48, y: 15, w: 1, h: 1, art: 'plant', ah: 1.6, deco: true }
  ];

  /* NPC – współpracownicy z poradami */
  const NPC = [
    { name: 'Dr Kowalska (kierownik)', x: 12 * T, y: 15.5 * T, path: [[12, 15.5], [30, 15.5]], i: 0, coat: '#fff', hair: '#7a4b2a', tips: ['Zacznij od Rejestracji (LIS) – tam przyjmiesz próbki z oddziałów.', 'Pamiętaj o kontroli jakości na początku dnia – stanowisko QC.', 'Zawiesina do VITEK 2 musi być użyta w ciągu 30 minut!', 'Dodatnią butelkę z VIRTUO od razu barwimy metodą Grama i puszczamy BCID2.', 'Wyniki zatwierdzasz w MYLA – dopiero wtedy lekarz je zobaczy.'] },
    { name: 'Marek (technik)', x: 38 * T, y: 16 * T, path: [[38, 16], [46, 16], [46, 15], [38, 15]], i: 0, coat: '#dfefff', hair: '#222', tips: ['Na chromID CPS Elite E. coli jest różowo-bordowa, a KESC granatowe.', 'Drożdżaki w VITEK MS? Najpierw kwas mrówkowy (VITEK MS-FA), potem matryca.', 'Na ETEST odczytuj MIC tam, gdzie elipsa przecina pasek.', 'Haemophilus nie rośnie na krwawym – posiej na czekoladowy w CO₂.'] }
  ];

  let GRID = null;
  function buildGrid() {
    GRID = [];
    for (let x = 0; x < W; x++) { GRID[x] = []; for (let y = 0; y < H; y++) GRID[x][y] = (x === 0 || y === 0 || x === W - 1 || y === H - 1); }
    ROOMS.forEach(([x, y, w, h]) => {
      for (let i = x - 1; i <= x + w; i++) { GRID[i][y - 1] = true; GRID[i][y + h] = true; }
      for (let j = y - 1; j <= y + h; j++) { GRID[x - 1][j] = true; GRID[x + w][j] = true; }
    });
    DOORS.forEach(([x, y]) => {
      if (y === 14 || y === 17) { GRID[x][y] = false; GRID[x + 1][y] = false; }
      else { GRID[x][y] = false; GRID[x][y + 1] = false; }
    });
  }
  function solid(tx, ty) { if (!GRID) buildGrid(); if (tx < 0 || ty < 0 || tx >= W || ty >= H) return true; return GRID[tx][ty]; }
  function isDoor(tx, ty) { return DOORS.some(([x, y]) => (y === 14 || y === 17) ? (ty === y && (tx === x || tx === x + 1)) : (tx === x && (ty === y || ty === y + 1))); }
  function objHit(px, py) {
    for (const o of OBJ) { if (px > o.x * T + 2 && px < (o.x + o.w) * T - 2 && py > o.y * T + 4 && py < (o.y + o.h) * T - 2) return true; }
    return false;
  }
  function blocked(px, py) {
    const pts = [[px - 9, py - 4], [px + 9, py - 4], [px - 9, py + 4], [px + 9, py + 4]];
    return pts.some(([x, y]) => solid(Math.floor(x / T), Math.floor(y / T)) || objHit(x, y));
  }

  /* ---------- rysowanie postaci diagnosty (oryginalny projekt) ---------- */
  function drawPerson(c, x, y, dir, walk, o = {}) {
    const leg = Math.sin(walk) * 4, bob = Math.abs(Math.sin(walk)) * 1.5;
    c.save(); c.translate(Math.round(x), Math.round(y - bob));
    c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(0, 22 + bob, 13, 4.5, 0, 0, 7); c.fill();
    // nogi – spodnie medyczne
    c.fillStyle = o.pants || '#0d4c8f';
    c.fillRect(-7, 8, 6, 12 + (dir === 'left' || dir === 'right' ? leg : leg * .6)); c.fillRect(1, 8, 6, 12 - (dir === 'left' || dir === 'right' ? leg : leg * .6));
    c.fillStyle = '#f4f4f4'; c.fillRect(-8, 19 + leg * .6, 7, 4); c.fillRect(1, 19 - leg * .6, 7, 4); // obuwie
    // fartuch
    c.fillStyle = o.coat || '#ffffff'; c.strokeStyle = '#b8c3cc'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(-11, -6); c.lineTo(11, -6); c.lineTo(13, 13); c.lineTo(-13, 13); c.closePath(); c.fill(); c.stroke();
    if (dir !== 'up') {
      c.fillStyle = o.pants || '#0d4c8f'; c.beginPath(); c.moveTo(-4, -6); c.lineTo(4, -6); c.lineTo(0, 3); c.closePath(); c.fill(); // dekolt bluzy
      c.strokeStyle = '#c7d0d8'; c.beginPath(); c.moveTo(0, 3); c.lineTo(0, 13); c.stroke();
      c.fillStyle = '#0a66c2'; c.fillRect(4, 1, 6, 8); c.fillStyle = '#fff'; c.fillRect(5, 2, 4, 2.5); // identyfikator
      c.fillStyle = '#2b7de9'; c.fillRect(-9, 3, 2, 5); // długopis w kieszeni
    }
    // ręce w rękawiczkach nitrylowych
    const arm = Math.sin(walk) * 3;
    c.fillStyle = o.coat || '#fff'; c.fillRect(-15, -4 - arm * .3, 5, 13); c.fillRect(10, -4 + arm * .3, 5, 13);
    c.fillStyle = '#6c8cff'; c.beginPath(); c.arc(-12.5, 10 - arm * .3, 3.2, 0, 7); c.arc(12.5, 10 + arm * .3, 3.2, 0, 7); c.fill();
    // głowa
    c.fillStyle = '#f1c9a5'; c.beginPath(); c.arc(0, -14, 9, 0, 7); c.fill();
    c.fillStyle = o.hair || '#5a3a22';
    if (dir === 'up') { c.beginPath(); c.arc(0, -15, 9.5, 0, 7); c.fill(); }
    else { c.beginPath(); c.arc(0, -17, 9.4, Math.PI, 0); c.fill(); c.fillRect(-9.4, -18, 3, 7); c.fillRect(6.4, -18, 3, 7); }
    if (dir === 'down') {
      // okulary ochronne
      c.fillStyle = 'rgba(160,215,255,.75)'; c.strokeStyle = '#1b5fae'; c.lineWidth = 1.3;
      c.beginPath(); c.roundRect ? c.roundRect(-8, -16, 16, 6, 3) : c.rect(-8, -16, 16, 6); c.fill(); c.stroke();
      c.fillStyle = '#333'; c.fillRect(-4.5, -14, 2, 2); c.fillRect(2.5, -14, 2, 2);
      c.strokeStyle = '#a0675a'; c.beginPath(); c.arc(0, -9, 2.5, 0.2, Math.PI - 0.2); c.stroke();
    } else if (dir === 'left' || dir === 'right') {
      const s = dir === 'left' ? -1 : 1;
      c.fillStyle = 'rgba(160,215,255,.75)'; c.strokeStyle = '#1b5fae'; c.lineWidth = 1.3;
      c.fillRect(s * 1, -16, s * 8, 6); c.strokeRect(s * 1, -16, s * 8, 6);
      c.fillStyle = '#333'; c.fillRect(s * 5 - 1, -14, 2, 2);
    }
    c.restore();
  }

  function init(canvas) {
    cv = canvas; ctx = cv.getContext('2d'); mini = document.getElementById('minimap');
    if (CORE.S.pos) { P.x = CORE.S.pos[0]; P.y = CORE.S.pos[1]; }
    resize(); window.addEventListener('resize', resize);
    window.addEventListener('keydown', e => {
      if (document.body.classList.contains('modal-open') || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') { if (e.key === 'Escape') CORE.closeModal(); return; }
      keys[e.key.toLowerCase()] = true; target = null;
      if (['e', ' ', 'enter'].includes(e.key.toLowerCase())) { interact(); e.preventDefault(); }
      if (e.key.startsWith('Arrow')) e.preventDefault();
    });
    window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
    cv.addEventListener('pointerdown', e => {
      const r = cv.getBoundingClientRect(); const wx = (e.clientX - r.left) / Z + cam.x, wy = (e.clientY - r.top) / Z + cam.y;
      const o = OBJ.find(o => !o.deco && wx > o.x * T && wx < (o.x + o.w) * T && wy > (o.y + o.h - o.ah) * T && wy < (o.y + o.h) * T + 10);
      if (o) { target = { x: (o.x + o.w / 2) * T, y: (o.y + o.h) * T + 20, obj: o }; }
      else target = { x: wx, y: wy };
    });
    document.getElementById('btn-act').onclick = interact;
    requestAnimationFrame(loop);
  }
  function resize() { Z = cv.clientWidth < 700 ? 0.9 : cv.clientWidth < 1100 ? 1.15 : 1.4; cv.width = cv.clientWidth * devicePixelRatio; cv.height = cv.clientHeight * devicePixelRatio; ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); }

  function interact() {
    if (near && near.st) { CORE.station(near.st); CORE.beep(520, .05); return; }
    const n = NPC.find(n => Math.hypot(n.x - P.x, n.y - P.y) < 50);
    if (n) { n.say = n.tips[Math.floor(Math.random() * n.tips.length)]; n.sayT = performance.now(); }
  }

  let accum = 0;
  function loop(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
    const S = CORE.S;
    // zegar symulacji
    if (!S.paused && !document.hidden) { const sp = document.body.classList.contains('modal-open') ? Math.min(S.speed, 5) : S.speed; accum += dt * sp; if (accum >= 1) { const m = Math.floor(accum); accum -= m; CORE.advance(m); } }
    if (!document.body.classList.contains('modal-open')) move(dt);
    draw(ts);
    requestAnimationFrame(loop);
  }

  function move(dt) {
    let dx = 0, dy = 0;
    if (keys['arrowleft'] || keys['a']) dx -= 1; if (keys['arrowright'] || keys['d']) dx += 1;
    if (keys['arrowup'] || keys['w']) dy -= 1; if (keys['arrowdown'] || keys['s']) dy += 1;
    if (!dx && !dy && target) {
      const tx = target.x - P.x, ty = target.y - P.y, d = Math.hypot(tx, ty);
      if (d < 6) { if (target.obj) { const o = target.obj; target = null; near = o; interact(); } else target = null; }
      else { dx = tx / d; dy = ty / d; }
    }
    const sp = (keys['shift'] ? 250 : 165) * dt;
    if (dx || dy) {
      const l = Math.hypot(dx, dy); dx /= l; dy /= l;
      const nx = P.x + dx * sp, ny = P.y + dy * sp;
      let mv = false;
      if (!blocked(nx, P.y)) { P.x = nx; mv = true; } if (!blocked(P.x, ny)) { P.y = ny; mv = true; }
      if (!mv && target) target = null;
      P.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
      P.walk += dt * 12; P.moving = true;
    } else { P.moving = false; P.walk = 0; }
    // najbliższa stacja
    near = null; let best = 60;
    OBJ.forEach(o => { if (o.deco) return; const cx = Math.max(o.x * T, Math.min(P.x, (o.x + o.w) * T)), cy = Math.max(o.y * T, Math.min(P.y, (o.y + o.h) * T)); const d = Math.hypot(cx - P.x, cy - P.y); if (d < best) { best = d; near = o; } });
    const hint = document.getElementById('hint');
    hint.innerHTML = near ? `<b>${near.label}</b> — naciśnij <kbd>E</kbd> lub kliknij` : 'Sterowanie: <kbd>WASD</kbd>/strzałki · <kbd>Shift</kbd> bieg · <kbd>E</kbd> interakcja · kliknij, aby iść';
    document.getElementById('btn-act').classList.toggle('on', !!near);
    // NPC
    NPC.forEach(n => {
      const [tx, ty] = n.path[n.i]; const gx = tx * T, gy = ty * T; const d = Math.hypot(gx - n.x, gy - n.y);
      if (Math.hypot(P.x - n.x, P.y - n.y) < 46) { n.moving = false; return; }
      if (d < 3) { n.i = (n.i + 1) % n.path.length; n.wait = 1.5; }
      if (n.wait > 0) { n.wait -= dt; n.moving = false; return; }
      const vx = (gx - n.x) / d, vy = (gy - n.y) / d; n.x += vx * 60 * dt; n.y += vy * 60 * dt; n.moving = true;
      n.dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 'left' : 'right') : (vy < 0 ? 'up' : 'down'); n.walk = (n.walk || 0) + dt * 9;
    });
    if (Math.random() < 0.02) CORE.S.pos = [P.x, P.y];
  }

  function draw(ts) {
    const vw = cv.clientWidth / Z, vh = cv.clientHeight / Z;
    cam.x = Math.max(0, Math.min(W * T - vw, P.x - vw / 2)); cam.y = Math.max(0, Math.min(H * T - vh, P.y - vh / 2));
    if (W * T < vw) cam.x = (W * T - vw) / 2; if (H * T < vh) cam.y = (H * T - vh) / 2;
    ctx.fillStyle = '#28323c'; ctx.fillRect(0, 0, vw * Z, vh * Z);
    ctx.save(); ctx.scale(Z, Z); ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
    // korytarz
    ctx.fillStyle = '#d7dde3'; ctx.fillRect(T, T, (W - 2) * T, (H - 2) * T);
    for (let x = 1; x < W - 1; x++) for (let y = 1; y < H - 1; y++) { if ((x + y) % 2) { ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x * T, y * T, T, T); } }
    ctx.fillStyle = '#c3ccd5'; ctx.fillRect(T, 15 * T, (W - 2) * T, 2 * T);
    ctx.fillStyle = '#e7a500'; for (let x = 2; x < W - 2; x += 2) ctx.fillRect(x * T, 16 * T - 1, T, 2);
    // pokoje
    ROOMS.forEach(([x, y, w, h, n, c]) => {
      ctx.fillStyle = c; ctx.fillRect(x * T, y * T, w * T, h * T);
      ctx.strokeStyle = 'rgba(0,0,0,.05)';
      for (let i = 0; i <= w; i++) { ctx.beginPath(); ctx.moveTo((x + i) * T, y * T); ctx.lineTo((x + i) * T, (y + h) * T); ctx.stroke(); }
      for (let j = 0; j <= h; j++) { ctx.beginPath(); ctx.moveTo(x * T, (y + j) * T); ctx.lineTo((x + w) * T, (y + j) * T); ctx.stroke(); }
      ctx.fillStyle = 'rgba(20,80,143,.18)'; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'center'; ctx.fillText(n, (x + w / 2) * T, (y + h) * T - 10);
    });
    // ściany
    for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
      if (solid(x, y) && !isDoor(x, y)) {
        ctx.fillStyle = '#5d6975'; ctx.fillRect(x * T, y * T, T, T);
        ctx.fillStyle = '#7d8995'; ctx.fillRect(x * T, y * T, T, 8);
      }
    }
    DOORS.forEach(d => { ctx.fillStyle = 'rgba(47,127,209,.25)'; if (d[1] === 14 || d[1] === 17) ctx.fillRect(d[0] * T, d[1] * T, 2 * T, T); else ctx.fillRect(d[0] * T, d[1] * T, T, 2 * T); });
    // obiekty + postacie posortowane po y
    const drawables = OBJ.map(o => ({ y: (o.y + o.h) * T, f: () => drawObj(o, ts) }));
    drawables.push({ y: P.y + 20, f: () => drawPerson(ctx, P.x, P.y, P.dir, P.walk) });
    NPC.forEach(n => drawables.push({ y: n.y + 20, f: () => { drawPerson(ctx, n.x, n.y, n.dir || 'down', n.moving ? n.walk : 0, { coat: n.coat, hair: n.hair, pants: '#2c6e49' }); drawName(n.name, n.x, n.y - 30); if (n.say && performance.now() - n.sayT < 6000) bubble(n.say, n.x, n.y - 44); } }));
    drawables.sort((a, b) => a.y - b.y).forEach(d => d.f());
    drawName(CORE.S.player.name, P.x, P.y - 30, true);
    ctx.restore();
    drawMini();
  }
  function drawObj(o, ts) {
    const im = ART.img(o.art);
    const x = o.x * T, yb = (o.y + o.h) * T, wpx = o.w * T, hpx = o.ah * T;
    if (!o.deco) { ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(x - 4, yb - o.h * T + 6, wpx + 8, o.h * T); ctx.fillStyle = '#b9c3cc'; ctx.fillRect(x - 4, yb - 10, wpx + 8, 10); ctx.fillStyle = '#9aa6b2'; ctx.fillRect(x - 4, yb, wpx + 8, 4); }
    if (im.complete && im.naturalWidth) {
      const ar = im.naturalWidth / im.naturalHeight; let dw = wpx + 8, dh = dw / ar; if (dh > hpx) { dh = hpx; dw = dh * ar; }
      ctx.drawImage(im, x + (wpx - dw) / 2, yb - dh - 4, dw, dh);
    }
    if (o.st && near === o) {
      ctx.strokeStyle = '#2f7fd1'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]); ctx.lineDashOffset = -ts / 40;
      ctx.strokeRect(x - 6, yb - hpx - 6, wpx + 12, hpx + 12); ctx.setLineDash([]);
    }
    if (o.label) {
      const busy = CORE.S.jobs.some(j => !j.done && j.label && j.label.startsWith(o.label.split(' ')[0]) && o.st && j.st === o.st);
      ctx.font = 'bold 11px Arial'; const tw = ctx.measureText(o.label).width + 12;
      ctx.fillStyle = near === o ? '#14508f' : 'rgba(30,40,50,.78)'; ctx.beginPath(); (ctx.roundRect ? ctx.roundRect(x + wpx / 2 - tw / 2, yb + 6, tw, 17, 8) : ctx.rect(x + wpx / 2 - tw / 2, yb + 6, tw, 17)); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(o.label, x + wpx / 2, yb + 18);
      const alerts = stationAlert(o.st);
      if (alerts) { ctx.fillStyle = alerts === 'alarm' ? '#e53935' : '#2ecc71'; ctx.beginPath(); ctx.arc(x + wpx, yb - hpx, 8 + Math.sin(ts / 200) * 1.5, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Arial'; ctx.fillText(alerts === 'alarm' ? '!' : '✓', x + wpx, yb - hpx + 4); }
    }
  }
  function stationAlert(st) {
    const S = CORE.S;
    if (st === 'virtuo' && S.bottles.some(b => b.status === 'positive' && !b.archived && !b.ack)) return 'alarm';
    const kinds = { vitek2: ['v2'], vitekms: ['ms'], biofire: ['bf'], spotfire: ['spot'], vidas: ['vidas'], etest: ['etest'], api: ['api'], gram: ['gram'], industry: ['tempo', 'geneup'] }[st];
    if (kinds && S.results.some(r => kinds.includes(r.kind) && !r.seen)) return 'done';
    if (st === 'incubator' && S.plates.some(p => p.incubating && CORE.incHours(p) >= 18 && !p.read)) return 'done';
    return null;
  }
  function drawName(n, x, y, me) { ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center'; const w = ctx.measureText(n).width + 10; ctx.fillStyle = me ? 'rgba(10,102,194,.9)' : 'rgba(44,110,73,.9)'; ctx.fillRect(x - w / 2, y - 12, w, 15); ctx.fillStyle = '#fff'; ctx.fillText(n, x, y); }
  function bubble(t, x, y) {
    ctx.font = '12px Arial'; const words = t.split(' '); const lines = []; let cur = '';
    words.forEach(w => { if (ctx.measureText(cur + ' ' + w).width > 220) { lines.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; }); lines.push(cur);
    const bw = 236, bh = lines.length * 15 + 12;
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#2c6e49'; ctx.lineWidth = 2; ctx.beginPath(); (ctx.roundRect ? ctx.roundRect(x - bw / 2, y - bh, bw, bh, 8) : ctx.rect(x - bw / 2, y - bh, bw, bh)); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#222'; ctx.textAlign = 'left'; lines.forEach((l, i) => ctx.fillText(l, x - bw / 2 + 8, y - bh + 18 + i * 15));
  }
  function drawMini() {
    if (!mini) return; const m = mini.getContext('2d'), s = 3;
    m.clearRect(0, 0, mini.width, mini.height); m.fillStyle = 'rgba(20,30,40,.75)'; m.fillRect(0, 0, mini.width, mini.height);
    ROOMS.forEach(([x, y, w, h, n, c]) => { m.fillStyle = c; m.fillRect(x * s, y * s, w * s, h * s); });
    m.fillStyle = '#c3ccd5'; m.fillRect(s, 15 * s, (W - 2) * s, 2 * s);
    OBJ.forEach(o => { if (o.deco) return; const a = stationAlert(o.st); m.fillStyle = a === 'alarm' ? '#e53935' : a ? '#2ecc71' : '#5d6975'; m.fillRect(o.x * s, o.y * s, o.w * s, o.h * s); });
    m.fillStyle = '#0a66c2'; m.beginPath(); m.arc(P.x / T * s, P.y / T * s, 3.5, 0, 7); m.fill();
    m.strokeStyle = '#fff'; m.strokeRect(cam.x / T * s, cam.y / T * s, cv.clientWidth / Z / T * s, cv.clientHeight / Z / T * s);
  }
  function goTo(st) { const o = OBJ.find(o => o.st === st); if (o) target = { x: (o.x + o.w / 2) * T, y: (o.y + o.h) * T + 20, obj: o }; }

  return { init, drawPerson, goTo, OBJ };
})();
