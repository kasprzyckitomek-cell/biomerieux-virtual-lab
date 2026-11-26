/* =========================================================================
   RDZEŃ: stan, zegar symulacji, zadania aparatów, UI (modale, toasty)
   ========================================================================= */
window.CORE = (function () {
  const SAVE_KEY = 'bmx-virtual-lab-v1';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const h = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- deterministyczny RNG ---------- */
  function hash(str) { let x = 2166136261; for (let i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function rng(seed) { let a = typeof seed === 'string' ? hash(seed) : seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- stan ---------- */
  function fresh() {
    return {
      v: 1, player: { name: 'Diagnosta', xp: 0, score: 0, cases: 0 }, t: 7 * 60, speed: 60, paused: false,
      seq: 1, specimens: [], plates: [], isolates: [], susp: [], bottles: [], jobs: [], results: [], reports: [], slides: [],
      cases: {}, qc: { day: -1, done: {} }, log: [], ach: {}, settings: { realistic: false, sound: true },
      calib: { PCT: 0, DD2: 0, TNHS: 0, NTBNP: 0, HIV: 0, TXG: 0, TXM: -20, TXA: 0, CMVG: 0, FER: 0, TSH: 0, HBS: 0, VITD: 0 },
      tutorial: false, pos: null, stats: { runs: {} }
    };
  }
  let S = load() || fresh();
  function load() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && s.v === 1) return Object.assign(fresh(), s); } catch (e) { } return null; }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } }
  function reset() { S = fresh(); CORE.S = S; save(); location.reload(); }
  function nid(prefix) { return prefix + '-' + String(S.seq++).padStart(4, '0'); }

  /* ---------- czas ---------- */
  function day() { return Math.floor(S.t / 1440) + 1; }
  function clock(t) { t = t == null ? S.t : t; const d = Math.floor(t / 1440) + 1, m = Math.floor(t % 1440); return `Dzień ${d}, ${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; }
  function dur(min) { min = Math.max(0, Math.round(min)); if (min < 60) return min + ' min'; const hh = Math.floor(min / 60), mm = min % 60; return hh + ' h' + (mm ? ' ' + mm + ' min' : ''); }
  function advance(min) {
    const target = S.t + min;
    // przetwarzaj zadania w kolejności zakończenia
    while (true) {
      const next = S.jobs.filter(j => !j.done && j.end <= target).sort((a, b) => a.end - b.end)[0];
      if (!next) break;
      S.t = Math.max(S.t, next.end); finishJob(next);
    }
    S.t = target; updateHud();
  }
  function skipToNext() {
    const next = S.jobs.filter(j => !j.done).sort((a, b) => a.end - b.end)[0];
    if (!next) { toast('Brak trwających procesów.', 'info'); return; }
    advance(Math.max(0, next.end - S.t) + 0.01);
  }

  /* ---------- zadania aparatów ---------- */
  const handlers = {};
  function job(kind, minutes, data, label) {
    const j = { id: nid('J'), kind, start: S.t, end: S.t + minutes, done: false, data, label: label || kind };
    S.jobs.push(j); S.stats.runs[kind] = (S.stats.runs[kind] || 0) + 1; save(); updateHud(); return j;
  }
  function finishJob(j) {
    j.done = true;
    try { handlers[j.kind] && handlers[j.kind](j); } catch (e) { console.error(e); }
    save(); refreshOpenStation();
  }
  function progress(j) { return Math.min(1, Math.max(0, (S.t - j.start) / Math.max(0.01, j.end - j.start))); }

  /* ---------- wyniki ---------- */
  function addResult(r) { r.id = nid('R'); r.t = S.t; r.validated = false; S.results.unshift(r); save(); return r; }
  function logEv(txt, type) { S.log.unshift({ t: S.t, txt, type: type || 'info' }); if (S.log.length > 300) S.log.length = 300; }

  /* ---------- punkty ---------- */
  const LEVELS = [0, 150, 400, 800, 1400, 2200, 3300, 4700, 6500, 9000, 12500];
  const TITLES = ['Stażysta', 'Technik laboratoryjny', 'Młodszy diagnosta', 'Diagnosta laboratoryjny', 'Starszy diagnosta', 'Specjalista mikrobiologii', 'Kierownik pracowni', 'Ekspert ID/AST', 'Konsultant', 'Mistrz laboratorium', 'Legenda diagnostyki'];
  function level() { let l = 0; LEVELS.forEach((x, i) => { if (S.player.xp >= x) l = i; }); return l; }
  function xp(n, why) {
    const before = level(); S.player.xp += n; S.player.score += n;
    if (why) toast(`+${n} XP · ${why}`, 'xp');
    if (level() > before) { toast(`🎓 Awans! Nowy poziom: ${TITLES[level()]}`, 'level'); beep(880, 0.15); }
    updateHud(); save();
  }
  const ACH = {
    first_plate: ['Pierwszy posiew', 'Posiej pierwszą płytkę'], first_ms: ['Laser w dłoń', 'Wykonaj identyfikację MALDI-TOF'], first_v2: ['Karta w kasecie', 'Wykonaj oznaczenie na VITEK 2'],
    first_bc: ['Alarm!', 'Wykryj dodatnią butelkę posiewu krwi'], first_bf: ['Godzina do diagnozy', 'Wykonaj panel BIOFIRE'], first_vidas: ['Fluorescencja', 'Wykonaj oznaczenie VIDAS'],
    first_etest: ['Elipsa', 'Odczytaj ETEST'], first_api: ['Profil 7-cyfrowy', 'Zidentyfikuj szczep na API 20 E'], first_case: ['Raport wysłany', 'Zakończ pierwszy przypadek'],
    cpe: ['Łowca karbapenemaz', 'Wykryj karbapenemazę'], mrsa: ['MRSA zdemaskowany', 'Wykryj MRSA'], auris: ['Alarm epidemiologiczny', 'Zidentyfikuj Candida auris'],
    qc: ['Kontrola jakości', 'Wykonaj pełną dzienną kontrolę jakości'], perfect: ['Perfekcjonista', 'Zakończ przypadek z wynikiem 100%'], five: ['Rutyna', 'Zakończ 5 przypadków'], all: ['Ordynator', 'Zakończ wszystkie przypadki'],
    gram: ['Oko mikroskopisty', 'Poprawnie oceń preparat Grama'], quiz: ['Teoretyk', 'Uzyskaj ≥ 80% w quizie']
  };
  function ach(id) { if (S.ach[id]) return; S.ach[id] = S.t; toast(`🏆 Osiągnięcie: ${ACH[id][0]}`, 'level'); xp(40); }

  /* ---------- dźwięk ---------- */
  let actx;
  function beep(f, d, type) { if (!S.settings.sound) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.value = f || 660; g.gain.value = .06; o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + (d || .1)); } catch (e) { } }
  function alarm() { beep(988, .12, 'square'); setTimeout(() => beep(784, .12, 'square'), 160); setTimeout(() => beep(988, .12, 'square'), 320); }

  /* ---------- UI: toasty ---------- */
  function toast(msg, type) {
    const c = $('#toasts'); if (!c) return;
    const d = document.createElement('div'); d.className = 'toast ' + (type || 'info'); d.innerHTML = msg; c.appendChild(d); while (c.children.length > 5) c.firstChild.remove();
    setTimeout(() => d.classList.add('out'), 3800); setTimeout(() => d.remove(), 4400);
  }

  /* ---------- UI: modal stacji ---------- */
  let openStation = null;
  function modal(title, html, opts = {}) {
    const m = $('#modal'); m.classList.remove('hidden'); m.classList.toggle('wide', !!opts.wide);
    $('#modal-title').innerHTML = title; $('#modal-body').innerHTML = html;
    $('#modal-sub').innerHTML = opts.sub || '';
    document.body.classList.add('modal-open');
    m.scrollTop = 0; $('#modal-body').scrollTop = 0;
  }
  function closeModal() { $('#modal').classList.add('hidden'); document.body.classList.remove('modal-open'); openStation = null; closeSub(); }
  function sub(title, html) { const s = $('#submodal'); s.classList.remove('hidden'); $('#sub-title').innerHTML = title; $('#sub-body').innerHTML = html; }
  function closeSub() { $('#submodal').classList.add('hidden'); }
  function station(id) { openStation = id; STATIONS[id].open(); }
  function refreshOpenStation() {
    if (openStation && STATIONS[openStation] && STATIONS[openStation].refresh) {
      const keep = {}; $$('#modal-body [id]').forEach(el => { if (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) keep[el.id] = el.type === 'checkbox' ? el.checked : el.value; });
      const sc = $('#modal').scrollTop;
      STATIONS[openStation].refresh();
      Object.entries(keep).forEach(([id, v]) => { const el = document.getElementById(id); if (!el) return; if (el.type === 'checkbox') el.checked = v; else if (el.tagName !== 'SELECT' || [...el.options].some(o => o.value === v)) { el.value = v; if (el.tagName === 'SELECT' && el.onchange) { try { el.onchange(); } catch (e) { } el.value = v; } } });
      $('#modal').scrollTop = sc;
    }
    updateTray();
  }

  /* ---------- HUD ---------- */
  function updateHud() {
    const hc = $('#hud-clock'); if (!hc) return;
    hc.textContent = clock();
    $('#hud-level').textContent = TITLES[level()];
    const l = level(), a = LEVELS[l], b = LEVELS[l + 1] || a + 1;
    $('#hud-xpbar').style.width = Math.min(100, (S.player.xp - a) / (b - a) * 100) + '%';
    $('#hud-xp').textContent = S.player.xp + ' XP';
    const running = S.jobs.filter(j => !j.done);
    $('#hud-jobs').innerHTML = running.length ? running.sort((x, y) => x.end - y.end).slice(0, 6).map(j => `<div class="hjob"><span>${h(j.label)}</span><i style="width:${progress(j) * 100}%"></i><em>${dur(j.end - S.t)}</em></div>`).join('') : '<div class="hjob idle">Brak trwających procesów</div>';
    $$('.spd').forEach(b => b.classList.toggle('on', +b.dataset.s === S.speed && !S.paused));
    $('#btn-pause').classList.toggle('on', S.paused);
    const pending = S.results.filter(r => !r.validated && !r.seen).length;
    $('#tray-badge').textContent = pending || ''; $('#tray-badge').style.display = pending ? '' : 'none';
    const qcok = qcDone(); $('#hud-qc').className = 'qc ' + (qcok ? 'ok' : 'warn'); $('#hud-qc').textContent = qcok ? 'QC ✓' : 'QC !';
  }

  /* ---------- TACA – zasoby ---------- */
  function updateTray() {
    const t = $('#tray-body'); if (!t || $('#tray').classList.contains('collapsed')) return;
    const sec = (title, items) => items.length ? `<h4>${title} <small>${items.length}</small></h4>` + items.join('') : '';
    const sp = S.specimens.filter(s => !s.archived).map(s => `<div class="ti" data-open="spec:${s.id}"><b>${DB.SPEC_TYPES[s.type].icon} ${s.id}</b> ${h(s.label)}<small>${s.caseId ? 'Przypadek ' + s.caseId : 'Sandbox'}</small></div>`);
    const bo = S.bottles.filter(b => !b.archived).map(b => `<div class="ti ${b.status === 'positive' ? 'alert' : ''}"><b>🍾 ${b.id}</b> ${DB.BOTTLES[b.type].name.replace('BacT/ALERT® ', '')} <small>${({ new: 'do załadowania', loaded: 'inkubacja', positive: 'DODATNIA!', negative: 'ujemna', removed: 'wyjęta' })[b.status]}</small></div>`);
    const pl = S.plates.filter(p => !p.archived).map(p => `<div class="ti" data-open="plate:${p.id}"><span class="dot" style="background:${DB.MEDIA[p.medium].bg}"></span><b>${p.id}</b> ${p.medium} · ${p.src}<small>${p.incubating ? 'cieplarka ' + Math.floor(incHours(p)) + ' h' : p.read ? 'oceniona' : 'poza cieplarką ' + Math.floor(incHours(p)) + ' h'}</small></div>`);
    const is = S.isolates.filter(i => !i.archived).map(i => `<div class="ti"><b>🧫 ${i.id}</b> kolonia z ${i.plate}<small>${h(i.desc)}${i.mixed ? ' ⚠' : ''}</small></div>`);
    const su = S.susp.filter(s => !s.archived).map(s => `<div class="ti ${S.t - s.t > 30 ? 'old' : ''}"><b>🧪 ${s.id}</b> ${s.mcf.toFixed(2)} McF<small>z ${s.iso} · ${dur(S.t - s.t)} temu</small></div>`);
    t.innerHTML = (sec('Próbki', sp) + sec('Butelki', bo) + sec('Płytki', pl) + sec('Izolaty', is) + sec('Zawiesiny', su)) || '<p class="muted">Pusto. Przyjmij próbki w Rejestracji (LIS).</p>';
    $$('[data-open]', t).forEach(el => el.onclick = () => { const [k, id] = el.dataset.open.split(':'); if (k === 'plate') CORE.viewPlate(id); if (k === 'spec') CORE.viewSpec(id); });
  }

  /* ---------- pomocnicze obiekty ---------- */
  const get = (arr, id) => S[arr].find(x => x.id === id);
  function incHours(p) { return (p.incMin + (p.incubating ? S.t - p.incFrom : 0)) / 60; }
  function qcDone() { return S.qc.day === day() && ['densi', 'ms', 'vidas', 'bf', 'virtuo'].every(k => S.qc.done[k]); }
  function options(arr, sel, fmt) { return arr.map(x => `<option value="${x.id}" ${x.id === sel ? 'selected' : ''}>${fmt(x)}</option>`).join(''); }

  /* interpretacja MIC */
  function interp(group, abx, mic) {
    const bp = (DB.BP[group] || {})[abx]; if (!bp) return '–';
    if (mic <= bp[0]) return 'S'; if (mic > bp[1]) return 'R'; return 'I';
  }
  function snap(v) { let best = DB.DIL[0]; DB.DIL.forEach(d => { if (Math.abs(Math.log2(d) - Math.log2(v)) < Math.abs(Math.log2(best) - Math.log2(v))) best = d; }); return best; }
  function fmtMic(v) { return v < 0.1 ? String(v) : v < 1 ? String(v) : String(Math.round(v * 100) / 100); }

  /* ---------- widok próbki ---------- */
  function viewSpec(id) {
    const s = get('specimens', id); if (!s) return;
    const res = S.results.filter(r => r.spec === id || (r.chain || []).includes(id));
    sub(`${DB.SPEC_TYPES[s.type].icon} Próbka ${s.id}`, `
      <p><b>${h(s.label)}</b> · ${DB.SPEC_TYPES[s.type].name}</p>
      <p>Przyjęto: ${clock(s.t)} ${s.caseId ? '· Przypadek <b>' + s.caseId + '</b>' : '· tryb swobodny'}</p>
      ${s.parent ? `<p>Pochodzi z: ${s.parent}</p>` : ''}
      <h4>Wyniki powiązane (${res.length})</h4>
      ${res.map(r => `<div class="ti">${r.icon || '📄'} <b>${h(r.title)}</b> <small>${clock(r.t)}</small></div>`).join('') || '<p class="muted">Brak</p>'}
    `);
  }

  return {
    get S() { return S; }, set S(v) { S = v; }, $, $$, h, rng, hash, save, reset, nid, day, clock, dur, advance, skipToNext, handlers, job, progress,
    addResult, logEv, xp, level, TITLES, ACH, ach, beep, alarm, toast, modal, closeModal, sub, closeSub, station, refreshOpenStation,
    updateHud, updateTray, get, incHours, qcDone, options, interp, snap, fmtMic, viewSpec, get openStation() { return openStation; }
  };
})();
window.STATIONS = {};
