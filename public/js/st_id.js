/* =========================================================================
   STANOWISKA ID/AST: DENSICHEK, VITEK MS PRIME, VITEK 2, ETEST, API 20 E
   ========================================================================= */
(function () {
  const C = CORE, $ = C.$, $$ = C.$$, h = C.h, S = () => C.S;
  const isoOpts = (filter) => S().isolates.filter(i => !i.archived && (!filter || filter(i))).map(i => `<option value="${i.id}">${i.id} – ${h(i.desc)} (${i.spec})</option>`).join('') || '<option value="">— brak izolatów: pobierz kolonię z płytki —</option>';
  const qcBlock = () => S().settings.realistic && !C.qcDone();
  const qcMsg = '<div class="warn">⛔ Tryb realistyczny: przed pracą wykonaj dzienną kontrolę jakości (stanowisko QC).</div>';

  /* ================= DENSICHEK ================= */
  STATIONS.densichek = {
    open() { this.t = this.t || null; this.render(); },
    render() {
      const t = this.t;
      const targets = { GN: [0.50, 0.63], GP: [0.50, 0.63], YST: [1.80, 2.20], NH: [2.70, 3.30], ANC: [2.70, 3.30], ETEST: [0.48, 0.62], API: [0.48, 0.62] };
      const cur = t ? targets[t.target] : null;
      const turb = t ? `rgba(225,222,200,${Math.min(.95, .15 + t.mcf * .22)})` : null;
      C.modal('📏 VITEK® DENSICHEK® Plus – przygotowanie zawiesiny', `<div class="two"><div class="instr-view">${ART.svg('densichek', { value: t && t.read != null ? t.read : null, tube: !!t, turbid: turb })}</div><div>
        ${!t ? `<div class="form"><label>Izolat (kolonie z płytki) <select id="d-iso">${isoOpts()}</select></label>
          <label>Cel zawiesiny <select id="d-tg"><option value="GN">VITEK 2 GN / AST G(−) (0,50–0,63)</option><option value="GP">VITEK 2 GP / AST G(+) (0,50–0,63)</option><option value="YST">VITEK 2 YST (1,80–2,20)</option><option value="NH">VITEK 2 NH (2,70–3,30)</option><option value="ETEST">ETEST® (0,5 McF)</option><option value="API">API® 20 E (0,5 McF)</option></select></label></div>
          <button class="btn" id="d-new">🧪 Nowa probówka: 3,0 mL 0,45% NaCl</button>` : `
          <p>Probówka z <b>${t.iso}</b> · cel <b>${t.target}</b> · zakres <b>${cur[0].toFixed(2)}–${cur[1].toFixed(2)} McF</b> · objętość ${t.vol.toFixed(1)} mL</p>
          <div class="steps"><span class="${t.zero ? 'ok' : ''}">1. Zerowanie</span><span class="${t.mcf > 0 ? 'ok' : ''}">2. Kolonie</span><span class="${t.mixed ? 'ok' : ''}">3. Vortex</span><span class="${t.read != null ? 'ok' : ''}">4. Odczyt</span></div>
          <div class="row wrap">
            <button class="btn sm" id="d-zero" ${t.zero ? 'disabled' : ''}>⓪ Wyzeruj (czysta sól)</button>
            <button class="btn sm" id="d-c1">+ mało kolonii</button><button class="btn sm" id="d-c2">+ dużo kolonii</button>
            <button class="btn sm" id="d-sal">+ 0,5 mL soli</button><button class="btn sm" id="d-mix">🌀 Vortex</button>
            <button class="btn sm" id="d-read">📟 Odczyt</button></div>
          ${t.read != null ? `<p class="${t.read >= cur[0] && t.read <= cur[1] ? 'ok' : 'warn'}">Odczyt: <b>${t.read.toFixed(2)} McF</b> ${t.read >= cur[0] && t.read <= cur[1] ? '✓ w zakresie' : t.read < cur[0] ? '↓ za mało – dodaj kolonii' : '↑ za gęsto – dodaj soli'}</p>` : ''}
          <div class="row"><button class="btn" id="d-save" ${t.read == null ? 'disabled' : ''}>💾 Zatwierdź zawiesinę</button><button class="btn ghost" id="d-cancel">Wylej</button></div>`}
        <div class="tip">Zawiesina musi być jednorodna (vortex) i użyta w ciągu 30 minut. Za gęsta zawiesina → fałszywie wyższe MIC; za rzadka → brak wzrostu w kontroli karty.</div>
        <h4>Zawiesiny</h4>${S().susp.filter(s => !s.archived).map(s => `<div class="ti ${S().t - s.t > 30 ? 'old' : ''}">🧪 <b>${s.id}</b> ${s.mcf.toFixed(2)} McF (${s.target}) z ${s.iso} · ${C.dur(S().t - s.t)} temu ${S().t - s.t > 30 ? '⚠ przeterminowana' : ''}</div>`).join('') || '<p class="muted">Brak</p>'}
      </div></div>`, { wide: true, sub: 'Densytometr 0,00–4,00 McFarland' });
      if (!t) { $('#d-new').onclick = () => { const iso = $('#d-iso').value; if (!iso) return C.toast('Brak izolatu', 'warn'); this.t = { iso, target: $('#d-tg').value, mcf: 0, vol: 3, zero: false, mixed: false, read: null, seed: Date.now() }; this.render(); }; return; }
      const r = Math.random;
      $('#d-zero').onclick = () => { t.zero = true; t.read = 0; this.render(); };
      $('#d-c1').onclick = () => { t.mcf += (0.12 + r() * 0.08) * 3 / t.vol; t.mixed = false; t.read = null; this.render(); };
      $('#d-c2').onclick = () => { t.mcf += (0.5 + r() * 0.3) * 3 / t.vol; t.mixed = false; t.read = null; this.render(); };
      $('#d-sal').onclick = () => { t.mcf = t.mcf * t.vol / (t.vol + 0.5); t.vol += 0.5; t.read = null; this.render(); };
      $('#d-mix').onclick = () => { t.mixed = true; C.beep(200, .2, 'sawtooth'); this.render(); };
      $('#d-read').onclick = () => { let v = t.mcf * (t.mixed ? 1 : 0.7 + r() * 0.2) + (t.zero ? 0 : 0.09) + (r() - .5) * 0.02; t.read = Math.max(0, Math.round(v * 100) / 100); this.render(); };
      $('#d-cancel').onclick = () => { this.t = null; this.render(); };
      $('#d-save').onclick = () => {
        const iso = C.get('isolates', t.iso);
        S().susp.push({ id: C.nid('Z'), iso: t.iso, mcf: t.read, trueMcf: t.mcf, target: t.target, t: S().t, org: iso.org, pheno: iso.pheno, mixed: iso.mixed, mixOrg: iso.mixOrg, spec: iso.spec, caseId: iso.caseId, zero: t.zero });
        const ok = t.read >= cur[0] && t.read <= cur[1];
        C.toast(`Zawiesina zapisana (${t.read.toFixed(2)} McF)`, ok ? 'ok' : 'warn'); if (ok) C.xp(8, 'zawiesina w zakresie');
        this.t = null; C.save(); C.updateTray(); this.render();
      };
    }
  };

  /* ================= VITEK MS PRIME ================= */
  function newSlide() { return { id: 'DS' + String(100000 + Math.floor(Math.random() * 899999)), spots: Array.from({ length: 48 }, () => ({})) }; }
  function spectrum(cv, oid, ok) {
    const c = cv.getContext('2d'), W = cv.width, H = cv.height, r = C.rng('spec' + oid);
    c.fillStyle = '#0b1726'; c.fillRect(0, 0, W, H); c.strokeStyle = '#1f3550';
    for (let i = 0; i <= 10; i++) { c.beginPath(); c.moveTo(40 + i * (W - 50) / 10, 10); c.lineTo(40 + i * (W - 50) / 10, H - 25); c.stroke(); }
    c.fillStyle = '#7fa6cf'; c.font = '10px Arial'; for (let i = 0; i <= 10; i += 2) c.fillText((2000 + i * 1800) + '', 30 + i * (W - 50) / 10, H - 10);
    c.fillText('m/z', W - 30, H - 10); c.save(); c.translate(12, H / 2); c.rotate(-Math.PI / 2); c.fillText('intensywność', -30, 0); c.restore();
    c.strokeStyle = ok ? '#4fd1ff' : '#f39c12'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(40, H - 26);
    const peaks = Array.from({ length: ok ? 26 : 4 }, () => [r(), r() ** 2]);
    for (let x = 0; x < W - 50; x++) {
      const fx = x / (W - 50); let y = 0.02 * Math.random() + 0.05 * Math.exp(-fx * 4);
      peaks.forEach(([p, a]) => { y += a * Math.exp(-((fx - p) ** 2) / 0.00002); });
      c.lineTo(40 + x, H - 26 - Math.min(1, y) * (H - 40));
    }
    c.stroke();
  }
  STATIONS.vitekms = {
    open() { S().msSlide = S().msSlide || newSlide(); this.sel = this.sel == null ? 1 : this.sel; this.render(); }, refresh() { this.render(); },
    render() {
      const sl = S().msSlide, sel = this.sel, sp = sl.spots[sel];
      const isCal = i => i % 16 === 0;
      const running = S().jobs.find(j => !j.done && j.kind === 'ms');
      const res = S().results.filter(r => r.kind === 'ms').slice(0, 12);
      const spotDiv = (s, i) => `<div class="spot ${i === sel ? 'sel' : ''} ${isCal(i) ? 'cal' : ''} ${s.iso || s.cal ? 'has' : ''} ${s.mat ? 'mat' : ''}" data-sp="${i}" title="${isCal(i) ? 'Pole kalibracyjne' : 'Pole ' + (i % 16)}">${isCal(i) ? 'C' : (i % 16)}${s.fa ? '<i class="fa"></i>' : ''}</div>`;
      const groupHtml = gi => sl.spots.slice(gi * 16, gi * 16 + 16).map((s, k) => spotDiv(s, gi * 16 + k)).join('');
      C.modal('⚡ VITEK® MS PRIME – identyfikacja MALDI-TOF', `<div class="two"><div class="instr-view">${ART.svg('vitekms', { open: !running, busy: !!running, spots: sl.spots.slice(0, 16).map(s => s.iso || s.cal), slots: running ? [1] : [] })}</div><div>
        ${qcBlock() ? qcMsg : ''}
        <p>Tarczka <b>VITEK® MS-DS ${sl.id}</b> – 48 pól, 3 grupy akwizycji (A, B, C). Pole <b>C</b> w każdej grupie = kalibrant <i>E. coli</i> ATCC 8739.</p>
        <div class="slide-grid">${['A', 'B', 'C'].map((g, gi) => `<div class="sg"><b>Grupa ${g}</b><div class="spots">${groupHtml(gi)}</div></div>`).join('')}</div>
        <div class="spot-act"><b>Pole ${isCal(sel) ? 'kalibracyjne ' + 'ABC'[Math.floor(sel / 16)] : (sel % 16) + ' (grupa ' + 'ABC'[Math.floor(sel / 16)] + ')'}:</b> ${sp.iso ? 'izolat ' + sp.iso : sp.cal ? 'kalibrant' : 'puste'} ${sp.fa ? '· FA' : ''} ${sp.mat ? '· CHCA' : ''}
          <div class="row wrap">${isCal(sel) ? `<button class="btn sm" id="ms-cal">Nanieś kalibrant E. coli ATCC 8739</button>` : `<select id="ms-iso">${isoOpts()}</select><button class="btn sm" id="ms-pick">🖊️ Nanieś (VITEK PICKME™)</button>`}
          <button class="btn sm" id="ms-fa">+ 0,5 µL VITEK MS-FA</button><button class="btn sm" id="ms-mat">+ 1 µL VITEK MS-CHCA</button><button class="btn sm ghost" id="ms-clr">Wyczyść</button></div></div>
        <div class="row"><label><input type="checkbox" id="ms-prio"> 🚨 Priorytet (pilne)</label><button class="btn" id="ms-run" ${running || qcBlock() ? 'disabled' : ''}>▶ Załaduj tarczkę i rozpocznij akwizycję</button><button class="btn ghost" id="ms-new">Nowa tarczka</button></div>
        ${running ? `<p class="info">Akwizycja widm w toku… ${C.dur(running.end - S().t)}</p>` : ''}
        <h4>Wyniki identyfikacji</h4>${res.map(r => `<div class="ti res ${r.data.ok ? '' : 'warnbg'}" data-r="${r.id}">⚡ <b>${r.data.spot}</b> ${r.data.iso || ''}: <b>${h(r.data.text)}</b> ${r.data.conf ? `<span class="conf">${r.data.conf}%</span>` : ''}<small>${C.clock(r.t)} · kliknij, aby zobaczyć widmo</small></div>`).join('') || '<p class="muted">Brak wyników</p>'}
      </div></div>`, { wide: true, sub: 'Spektrometria mas MALDI-TOF · baza IVD' });
      $$('[data-sp]').forEach(e => e.onclick = () => { this.sel = +e.dataset.sp; this.render(); });
      const spot = sl.spots[sel];
      if ($('#ms-cal')) $('#ms-cal').onclick = () => { spot.cal = true; this.render(); };
      if ($('#ms-pick')) $('#ms-pick').onclick = () => { const v = $('#ms-iso').value; if (!v) return; spot.iso = v; spot.mat = false; spot.fa = false; this.sel = Math.min(47, sel + 1 + (isCal(sel + 1) ? 1 : 0)); if (isCal(this.sel)) this.sel++; this.render(); };
      $('#ms-fa').onclick = () => { spot.fa = true; this.render(); };
      $('#ms-mat').onclick = () => { spot.mat = true; this.render(); };
      $('#ms-clr').onclick = () => { sl.spots[sel] = {}; this.render(); };
      $('#ms-new').onclick = () => { S().msSlide = newSlide(); this.sel = 1; this.render(); };
      $$('[data-r]').forEach(e => e.onclick = () => { const r = C.get('results', e.dataset.r); r.seen = true; C.sub('Widmo masowe ' + r.data.spot, `<canvas id="spc" width="640" height="260"></canvas><p><b>${h(r.data.text)}</b> ${r.data.conf ? '· pewność ' + r.data.conf + '%' : ''}</p><p class="muted">${h(r.data.note || '')}</p>`); spectrum($('#spc'), r.data.org || 'x', r.data.ok); });
      $('#ms-run').onclick = () => {
        const n = sl.spots.filter(s => s.iso).length; if (!n) return C.toast('Nanieś co najmniej jeden izolat', 'warn');
        const prio = $('#ms-prio').checked;
        const j = C.job('ms', (prio ? 3 : 8) + n * 0.6, { slide: JSON.parse(JSON.stringify(sl)) }, 'VITEK MS PRIME – akwizycja'); j.st = 'vitekms';
        S().msSlide = newSlide(); this.sel = 1; C.save(); this.render();
      };
    }
  };
  C.handlers.ms = (j) => {
    const sl = j.data.slide; let count = 0;
    [0, 1, 2].forEach(g => {
      const cal = sl.spots[g * 16]; const calOk = cal.cal && cal.mat;
      for (let i = g * 16 + 1; i < g * 16 + 16; i++) {
        const s = sl.spots[i]; if (!s.iso) continue; count++;
        const iso = C.get('isolates', s.iso); if (!iso) continue;
        const o = DB.ORG[iso.org]; const r = C.rng(sl.id + i);
        let text, conf = null, ok = false, note = '';
        if (!calOk) { text = 'Błąd kalibracji grupy ' + 'ABC'[g]; note = 'Brak kalibrantu lub matrycy na polu C – cała grupa akwizycji odrzucona. Powtórz z kalibrantem.'; }
        else if (!s.mat) { text = 'Brak widma (no peaks)'; note = 'Nie naniesiono matrycy CHCA – brak desorpcji/jonizacji.'; }
        else if (o.gram === 'yeast' && !s.fa && r() < .6) { text = 'Brak identyfikacji'; note = 'Drożdżaki wymagają ekstrakcji kwasem mrówkowym (VITEK MS-FA) przed nałożeniem matrycy.'; }
        else if (iso.mixed) { text = `Niska dyskryminacja: ${o.name} / ${DB.ORG[iso.mixOrg].name}`; note = 'Widmo mieszane – izolat prawdopodobnie niejednorodny. Wykonaj subkulturę i powtórz.'; }
        else { conf = Math.min(99.9, Math.round((o.ms - r() * 0.8) * 10) / 10); text = o.name; ok = true; note = conf >= 99 ? 'Pojedynczy wybór – identyfikacja doskonała' : 'Pojedynczy wybór – identyfikacja dobra'; if (iso.org === 'SPN') note += '. Uwaga: S. pneumoniae vs. grupa S. mitis – potwierdź testem optochiny/rozpuszczalności w żółci.'; }
        C.addResult({ kind: 'ms', icon: '⚡', title: `VITEK MS: ${text}`, spec: iso.spec, caseId: iso.caseId, iso: iso.id, data: { spot: 'ABC'[g] + (i % 16), iso: iso.id, org: ok ? iso.org : null, text, conf, ok, note } });
        if (ok) { C.xp(20, 'identyfikacja MALDI-TOF'); C.ach('first_ms'); if (iso.org === 'CAU') { C.ach('auris'); C.alarm(); C.toast('🚨 Candida auris – patogen alarmowy! Powiadom zespół kontroli zakażeń.', 'alarm'); } }
      }
    });
    C.toast(`⚡ VITEK MS PRIME: zakończono akwizycję (${count} pól)`, 'ok'); C.beep(880, .1);
  };

  /* ================= VITEK 2 COMPACT ================= */
  function wells(card, oid) {
    const names = DB.WELLS[card] || DB.WELLS.GN; const o = DB.ORG[oid]; const r = C.rng('w' + card + oid);
    return names.map(n => { const k = n.replace('.', '_'); return [n, o.key[k] != null ? o.key[k] : (r() < .38 ? 1 : 0)]; });
  }
  function bionumber(ws) { let s = ''; for (let i = 0; i < ws.length; i += 3) s += (ws[i] ? ws[i][1] : 0) * 1 + (ws[i + 1] ? ws[i + 1][1] : 0) * 2 + (ws[i + 2] ? ws[i + 2][1] : 0) * 4; return s; }
  function cardRange(group, abx) { const bp = DB.BP[group][abx]; const lo = C.snap(Math.max(0.016, (bp[0] === 0.001 ? bp[1] : bp[0]) / 8)), hi = C.snap(Math.min(512, bp[1] * 8)); return [lo, hi]; }
  function fmtRange(v, lo, hi) { return v <= lo ? '≤ ' + C.fmtMic(lo) : v >= hi ? '≥ ' + C.fmtMic(hi) : C.fmtMic(v); }
  C.astTable = function (group, mics, card, opts = {}) {
    return `<table class="tbl ast"><tr><th>Antybiotyk</th><th>MIC (µg/mL)</th><th>Kat.</th></tr>${Object.entries(mics).map(([a, v]) => {
      let cat = C.interp(group, a, v); if (opts.icr && a === 'CLI') cat = 'R*';
      const [lo, hi] = DB.BP[group][a] ? cardRange(group, a) : [0.016, 512];
      return `<tr><td>${DB.ABX[a] ? DB.ABX[a][0] : a}</td><td>${fmtRange(v, lo, hi)}</td><td class="cat-${cat[0]}">${cat}</td></tr>`;
    }).join('')}</table>${opts.icr ? '<p class="muted">* Klindamycyna: indukcyjna oporność MLSB – raportowana jako oporna (AES).</p>' : ''}`;
  };
  STATIONS.vitek2 = {
    open() { S().cassette = S().cassette || { slots: [], filled: false }; this.render(); }, refresh() { this.render(); },
    render() {
      const cas = S().cassette; const running = S().jobs.filter(j => !j.done && j.kind === 'v2');
      const suspOpts = S().susp.filter(s => !s.archived).map(s => `<option value="${s.id}">${s.id} – ${s.mcf.toFixed(2)} McF (${s.target}) · ${C.dur(S().t - s.t)}</option>`).join('') || '<option value="">— brak zawiesin: DENSICHEK —</option>';
      const cardOpts = Object.entries(DB.ID_CARDS).map(([k, c]) => `<option value="ID:${k}">ID · ${c.name} – ${c.desc}</option>`).join('') + Object.entries(DB.AST_CARDS).map(([k, c]) => `<option value="AST:${k}">AST · ${k} – ${c.desc}</option>`).join('');
      const res = S().results.filter(r => r.kind === 'v2').slice(0, 14);
      C.modal('🧬 VITEK® 2 Compact – identyfikacja i lekowrażliwość', `<div class="two"><div class="instr-view">${ART.svg('vitek2', { fillOpen: !cas.filled, cards: cas.slots.map(s => s.card.startsWith('ID') ? DB.ID_CARDS[s.card.slice(3)].color : '#f3f3f3'), progress: running.length ? Math.max(...running.map(C.progress)) : 0, lcd1: running.length ? 'W TOKU: ' + running.length : 'STATUS: GOTOWY', lcd2: 'KARTY: ' + running.length + '/30', status: running.length ? 'busy' : 'ok' })}</div><div>
        ${qcBlock() ? qcMsg : ''}
        <h4>Kaseta (${cas.slots.length}/10) ${cas.filled ? '<span class="ok">napełniona próżniowo ✓</span>' : ''}</h4>
        <table class="tbl"><tr><th>#</th><th>Zawiesina</th><th>Karta</th><th>Transfer</th><th></th></tr>${cas.slots.map((s, i) => `<tr><td>${i + 1}</td><td>${s.susp}</td><td>${s.card.slice(3)}</td><td>${s.card.startsWith('AST') ? s.transfer + ' µL' : '—'}</td><td>${cas.filled ? '' : `<button class="btn sm ghost" data-del="${i}">✕</button>`}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">Pusta kaseta</td></tr>'}</table>
        ${cas.filled ? '' : `<div class="form"><label>Zawiesina <select id="v-s">${suspOpts}</select></label><label>Karta <select id="v-c">${cardOpts}</select></label>
          <label>Transfer do probówki AST (µL) <select id="v-t"><option value="">— (tylko AST) —</option><option>145</option><option>280</option><option>500</option></select></label></div>
          <button class="btn sm" id="v-add" ${cas.slots.length >= 10 ? 'disabled' : ''}>➕ Dodaj kartę do kasety (skan kodu)</button>`}
        <div class="row"><button class="btn" id="v-fill" ${!cas.slots.length || cas.filled ? 'disabled' : ''}>💨 Napełnij (komora próżniowa)</button><button class="btn" id="v-load" ${!cas.filled || qcBlock() ? 'disabled' : ''}>📥 Załaduj do czytnika/inkubatora</button><button class="btn ghost" id="v-clear">Opróżnij kasetę</button></div>
        <h4>Karty w aparacie</h4>${running.map(j => `<div class="hjob"><span>${j.data.slot.card.slice(3)} · ${j.data.slot.susp}</span><i style="width:${C.progress(j) * 100}%"></i><em>${C.dur(j.end - S().t)}</em></div>`).join('') || '<p class="muted">Brak</p>'}
        <h4>Wyniki</h4>${res.map(r => `<div class="ti res ${r.data.err ? 'warnbg' : ''}" data-r="${r.id}">🧬 <b>${h(r.title)}</b><small>${C.clock(r.t)} · kliknij, aby otworzyć raport</small></div>`).join('') || '<p class="muted">Brak</p>'}
      </div></div>`, { wide: true, sub: 'Karty: ID (GN, GP, YST, NH, ANC, BCL) · AST · Advanced Expert System™' });
      $$('[data-del]').forEach(b => b.onclick = () => { cas.slots.splice(+b.dataset.del, 1); this.render(); });
      if ($('#v-add')) $('#v-add').onclick = () => {
        const susp = $('#v-s').value, card = $('#v-c').value, tr = $('#v-t').value;
        if (!susp) return C.toast('Brak zawiesiny', 'warn');
        if (card.startsWith('AST') && !tr) return C.toast('Wybierz objętość transferu do probówki AST', 'warn');
        cas.slots.push({ susp, card, transfer: card.startsWith('AST') ? +tr : null }); C.save(); this.render();
      };
      $('#v-fill').onclick = () => { cas.filled = true; cas.fillT = S().t; C.beep(150, .5, 'sawtooth'); C.toast('💨 Karty napełnione metodą próżniową – przenieś kasetę do komory ładowania', 'ok'); C.save(); this.render(); };
      $('#v-clear').onclick = () => { S().cassette = { slots: [], filled: false }; this.render(); };
      $('#v-load').onclick = () => {
        cas.slots.forEach(sl => { const su = C.get('susp', sl.susp); const card = sl.card.split(':'); const hrs = card[0] === 'ID' ? DB.ID_CARDS[card[1]].hours : DB.AST_CARDS[card[1]].hours; const r = C.rng(sl.susp + sl.card); const dur = (hrs[0] + r() * (hrs[1] - hrs[0])) * 60; const j = C.job('v2', dur, { slot: sl, age: S().t - su.t, susp: JSON.parse(JSON.stringify(su)) }, 'VITEK 2 – ' + card[1]); j.st = 'vitek2'; });
        C.toast(`📥 Załadowano ${cas.slots.length} kart(y). Odczyt co 15 min.`, 'ok'); S().cassette = { slots: [], filled: false }; C.save(); this.render();
      };
      $$('[data-r]').forEach(e => e.onclick = () => this.report(e.dataset.r));
    },
    report(id) {
      const r = C.get('results', id); r.seen = true; const d = r.data;
      let html = `<p><b>Zawiesina:</b> ${d.susp} (${d.mcf} McF) · <b>Karta:</b> ${d.card} · <b>Czas analizy:</b> ${C.dur(d.dur)}</p>`;
      if (d.err) html += `<div class="warn">⚠ ${h(d.err)}</div>`;
      if (d.type === 'ID') {
        html += d.org ? `<h3><i>${h(d.name)}</i> <span class="conf">${d.prob}%</span></h3><p>Poziom ufności: <b>${d.level}</b> · Bionumer: <code>${d.bion}</code></p>` : `<h3>${h(d.name)}</h3>`;
        if (d.wells) html += `<div class="wells">${d.wells.map(([n, v]) => `<span class="${v ? 'pos' : 'neg'}">${n} ${v ? '+' : '−'}</span>`).join('')}</div>`;
      } else if (d.mics) {
        html += `<h3>Lekowrażliwość – ${h(d.name)}</h3>` + C.astTable(d.group, d.mics, d.card, { icr: d.icr });
        html += `<h4>Advanced Expert System™ – fenotypy</h4><ul class="aes">${d.aes.map(a => `<li>${h(a)}</li>`).join('')}</ul><p class="muted">Spójność biologiczna: ${d.err ? '<b class="warnt">NIESPÓJNA</b>' : '<b class="okt">ZGODNA</b>'}</p>`;
      }
      C.sub('🧬 Raport VITEK 2 – ' + r.id, html + '<div class="row"><button class="btn sm ghost" onclick="window.print()">🖨️ Drukuj</button></div>');
    }
  };
  C.handlers.v2 = (j) => {
    const { slot, age, susp } = j.data; const [type, card] = slot.card.split(':');
    const o = DB.ORG[susp.org]; const ph = o.phenos[susp.pheno]; const r = C.rng(j.id);
    const range = type === 'ID' ? DB.ID_CARDS[card].mcf : (o.gram === 'yeast' ? [1.8, 2.2] : o.idCard === 'NH' ? [2.7, 3.3] : [0.5, 0.63]);
    const mcf = susp.mcf; let err = null;
    const base = { susp: susp.id, mcf: mcf.toFixed(2), card, dur: j.end - j.start, type };
    if (age > 30) err = `Zawiesina użyta po ${Math.round(age)} min (limit 30 min) – wynik może być niewiarygodny.`;
    if (mcf < range[0] - 0.05 || mcf > range[1] + 0.15) err = (err ? err + ' ' : '') + `Gęstość zawiesiny ${mcf.toFixed(2)} McF poza zakresem ${range[0]}–${range[1]} McF.`;
    if (type === 'ID') {
      const cc = DB.ID_CARDS[card]; const fit = o.idCard === card;
      let res;
      if (!fit) res = { name: 'Organizm nieidentyfikowany (Unidentified organism)', org: null, err: `Karta ${card} nie jest przeznaczona dla tego drobnoustroju (${({ neg: 'Gram-ujemny', pos: 'Gram-dodatni', yeast: 'drożdżak' })[o.gram]}). Sprawdź preparat Grama i wybierz właściwą kartę.` };
      else if (susp.mixed) res = { name: `Niska dyskryminacja: ${o.name} / ${DB.ORG[susp.mixOrg].name}`, org: null, err: 'Podejrzenie hodowli mieszanej – wykonaj subkulturę.' };
      else if (mcf < range[0] - 0.2) res = { name: 'Brak identyfikacji – niewystarczający wzrost', org: null, err: 'Zbyt rzadkie inokulum.' };
      else {
        const prob = err ? 85 + Math.round(r() * 8) : 95 + Math.round(r() * 4.9 * 10) / 10;
        const ws = wells(card, susp.org);
        res = { name: o.name, org: susp.org, prob: Math.min(99.9, prob), level: prob >= 96 ? 'Doskonała (Excellent)' : prob >= 93 ? 'Bardzo dobra (Very good)' : prob >= 89 ? 'Dobra (Good)' : 'Akceptowalna (Acceptable)', wells: ws, bion: bionumber(ws) };
      }
      const rr = C.addResult({ kind: 'v2', icon: '🧬', title: `VITEK 2 ${card}: ${res.name}${res.prob ? ' (' + res.prob + '%)' : ''}`, spec: susp.spec, caseId: susp.caseId, iso: susp.iso, data: Object.assign(base, res, { err: res.err || err }) });
      if (res.org) { C.xp(25, 'identyfikacja VITEK 2'); C.ach('first_v2'); if (res.org === 'CAU') C.ach('auris'); }
    } else {
      const ac = DB.AST_CARDS[card]; const tr = slot.transfer; const expectTr = o.gram === 'neg' ? 145 : 280;
      let mics = {}, aes = ph.aes.slice(), name = o.name;
      const okGroup = ac.group === o.group || (ac.group === 'PSA' && o.group === 'ACB') || (ac.group === 'SPN' && ['STR', 'SPN'].includes(o.group)) || (ac.group === 'CAN' && ['CAN', 'CAU', 'CGL'].includes(o.group));
      if (ac.forGram !== o.gram || !Object.keys(ph.mic).length) {
        err = 'Brak wzrostu w studzience kontrolnej / karta nieodpowiednia dla drobnoustroju – oznaczenie przerwane.'; aes = ['—'];
      } else {
        const shift = (tr !== expectTr ? (tr > expectTr ? 1 : -1) : 0) + (mcf > range[1] + 0.1 ? 1 : 0);
        if (tr !== expectTr) err = (err ? err + ' ' : '') + `Nieprawidłowy transfer ${tr} µL (dla ${({ neg: 'G(−)', pos: 'G(+)', yeast: 'drożdżaków' })[o.gram]}: ${expectTr} µL) – inokulum nieprawidłowe.`;
        if (!okGroup) err = (err ? err + ' ' : '') + 'Karta AST nie odpowiada grupie drobnoustrojów – interpretacja może być błędna.';
        ac.abx.forEach(a => {
          if (ph.mic[a] == null) return;
          let v = ph.mic[a]; const k = r(); const d = k < .15 ? -1 : k > .85 ? 1 : 0; v = C.snap(v * Math.pow(2, d + shift));
          mics[a] = v;
        });
        if (susp.mixed) { err = (err ? err + ' ' : '') + 'AES: profil niespójny – podejrzenie hodowli mieszanej.'; aes.push('NIESPÓJNOŚĆ FENOTYPOWA'); }
        // raport tylko leków z punktami odcięcia dla grupy
        mics = Object.fromEntries(Object.entries(mics).filter(([a]) => DB.BP[o.group][a]));
        if (ph.genes.some(g => ['KPC', 'NDM', 'OXA-48-like', 'VIM', 'OXA-23'].includes(g)) && !err) C.ach('cpe');
        if (susp.pheno === 'MRSA' && !err) C.ach('mrsa');
      }
      C.addResult({ kind: 'v2', icon: '💊', title: `VITEK 2 ${card}: AST ${name}${err ? ' ⚠' : ''}`, spec: susp.spec, caseId: susp.caseId, iso: susp.iso, data: Object.assign(base, { name, group: o.group, mics, aes, err, icr: ph.icr, org: susp.org, pheno: susp.pheno }) });
      if (!err) C.xp(30, 'lekowrażliwość VITEK 2');
    }
    C.toast('🧬 VITEK 2: karta zakończona – ' + card, 'ok'); C.beep(740, .1);
  };

  /* ================= ETEST ================= */
  const ESCALE = [0.016, 0.023, 0.032, 0.047, 0.064, 0.094, 0.125, 0.19, 0.25, 0.38, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256];
  STATIONS.etest = {
    open() { this.render(); }, refresh() { this.render(); },
    render() {
      const suspOpts = S().susp.filter(s => !s.archived).map(s => `<option value="${s.id}">${s.id} – ${s.mcf.toFixed(2)} McF (${s.target})</option>`).join('') || '<option value="">— brak – przygotuj 0,5 McF w DENSICHEK —</option>';
      const plates = S().etests || (S().etests = []);
      C.modal('📐 ETEST® – oznaczanie MIC metodą gradientu', `<div class="two"><div class="instr-view">${ART.plate('MHE', [], { label: 'Mueller-Hinton E', strip: '<rect x="94" y="20" width="12" height="160" fill="#f5f5f0" stroke="#999"/><text x="100" y="30" font-size="6" text-anchor="middle">VA</text>' })}</div><div>
        <div class="form"><label>Zawiesina 0,5 McF <select id="e-s">${suspOpts}</select></label>
        <label>Pasek 1 <select id="e-a1"></select></label><label>Pasek 2 (opcjonalnie) <select id="e-a2"></select></label></div>
        <button class="btn" id="e-go">🧫 Posiej „murawkę”, połóż paski i inkubuj 18 h</button>
        <h4>Płytki ETEST</h4>${plates.filter(p => !p.archived).map(p => `<div class="ti">📐 <b>${p.id}</b> ${p.abx.join(' + ')} · ${p.ready ? (p.read ? 'odczytano: ' + p.read.map(x => x.abx + ' ' + x.v).join(', ') : `<button class="btn sm" data-rd="${p.id}">Odczytaj MIC</button>`) : 'inkubacja…'}</div>`).join('') || '<p class="muted">Brak</p>'}
        <div class="tip">Odczytuj MIC w punkcie, w którym <b>krawędź elipsy zahamowania przecina pasek</b>. Wartości pośrednie (np. 0,75) zaokrąglaj w górę do pełnego rozcieńczenia przed interpretacją.</div>
      </div></div>`, { wide: true, sub: 'Gradient 15 rozcieńczeń · podłoże MHE / MHF' });
      const fill = () => { const su = C.get('susp', $('#e-s').value); const g = su ? DB.ORG[su.org].group : 'ENT'; const opts = Object.keys(DB.BP[g]).map(a => `<option value="${a}">${a} – ${DB.ABX[a][0]}</option>`).join(''); $('#e-a1').innerHTML = opts; $('#e-a2').innerHTML = '<option value="">—</option>' + opts; };
      $('#e-s').onchange = fill; fill();
      $('#e-go').onclick = () => {
        const su = C.get('susp', $('#e-s').value); if (!su) return C.toast('Brak zawiesiny', 'warn');
        const abx = [$('#e-a1').value, $('#e-a2').value].filter(Boolean);
        const o = DB.ORG[su.org]; const ph = o.phenos[su.pheno];
        const p = { id: C.nid('E'), susp: su.id, org: su.org, pheno: su.pheno, abx, mcf: su.mcf, spec: su.spec, caseId: su.caseId, iso: su.iso, ready: false, truth: abx.map(a => { let v = ph.mic[a] != null ? ph.mic[a] : 1; if (su.mcf > 0.7) v *= 2; const r = C.rng(su.id + a)(); const idx = ESCALE.reduce((bi, x, i) => Math.abs(Math.log2(x) - Math.log2(v * (0.8 + r * 0.5))) < Math.abs(Math.log2(ESCALE[bi]) - Math.log2(v * (0.8 + r * 0.5))) ? i : bi, 0); return ESCALE[idx]; }) };
        if (o.gram === 'yeast') C.toast('Dla drożdżaków użyj RPMI – tu uproszczenie: MHE', 'info');
        plates.push(p); const j = C.job('etest', 18 * 60, { p: p.id }, 'ETEST – inkubacja'); j.st = 'etest'; C.save(); this.render();
      };
      $$('[data-rd]').forEach(b => b.onclick = () => this.read(b.dataset.rd));
    },
    read(id) {
      const p = S().etests.find(x => x.id === id); const o = DB.ORG[p.org];
      const strips = p.abx.map((a, i) => {
        const x = p.abx.length === 1 ? 94 : (i === 0 ? 60 : 128); const tv = p.truth[i]; const ti = ESCALE.indexOf(tv);
        const y = (k) => 178 - (k / (ESCALE.length - 1)) * 156; const yi = y(ti);
        const ell = ti >= ESCALE.length - 1 ? '' : `<path d="M${x - 2} ${yi} C ${x - 40} ${yi - 20}, ${x - 34} 22, ${x + 6} 18 C ${x + 46} 22, ${x + 52} ${yi - 20}, ${x + 14} ${yi} Z" fill="#e8d6a5" opacity=".9"/>`;
        const labels = [0, 6, 12, 18, 24, 28].map(k => `<text x="${x + 15}" y="${y(k) + 2}" font-size="5" fill="#333">${ESCALE[k]}</text>`).join('');
        return ell + `<rect x="${x}" y="18" width="12" height="164" fill="#fafaf5" stroke="#888" stroke-width=".6"/>${ESCALE.map((v, k) => `<line x1="${x}" x2="${x + (k % 2 ? 4 : 7)}" y1="${y(k)}" y2="${y(k)}" stroke="#444" stroke-width=".4"/>`).join('')}${labels}<text x="${x + 6}" y="190" font-size="7" text-anchor="middle" font-weight="700">${a}</text>`;
      }).join('');
      const lawn = `<circle cx="100" cy="100" r="88" fill="#d8c79c" opacity=".7"/>`;
      C.sub('📐 Odczyt ETEST ' + p.id, `<div class="plate-big">${ART.plate('MHE', [], { strip: lawn + strips, label: o.name })}</div>
        ${p.abx.map((a, i) => `<label>${a} – MIC odczytane: <select id="er-${i}">${ESCALE.map(v => `<option>${v}</option>`).join('')}</select></label>`).join('')}
        <button class="btn" id="er-ok">Zapisz odczyt</button><div id="er-fb"></div>`);
      $('#er-ok').onclick = () => {
        const reads = p.abx.map((a, i) => ({ abx: a, v: +$('#er-' + i).value }));
        const fb = reads.map((rd, i) => { const ti = ESCALE.indexOf(p.truth[i]), ui = ESCALE.indexOf(rd.v); const ok = Math.abs(ti - ui) <= 1; const rounded = C.DIL_UP(rd.v); return { ...rd, ok, truth: p.truth[i], cat: C.interp(o.group, rd.abx, rounded), rounded }; });
        p.read = reads; C.addResult({ kind: 'etest', icon: '📐', title: `ETEST: ${fb.map(f => f.abx + ' MIC ' + f.v + ' (' + f.cat + ')').join(', ')}`, spec: p.spec, caseId: p.caseId, iso: p.iso, data: { reads: fb, org: p.org } }).seen = true;
        $('#er-fb').innerHTML = fb.map(f => `<p class="${f.ok ? 'ok' : 'warn'}">${f.abx}: odczyt ${f.v} → ${f.rounded} µg/mL = <b>${f.cat}</b> ${f.ok ? '✓ prawidłowo' : '✗ wartość rzeczywista ≈ ' + f.truth}</p>`).join('');
        if (fb.every(f => f.ok)) { C.xp(30, 'odczyt ETEST'); C.ach('first_etest'); }
        C.save(); this.render();
      };
    }
  };
  C.DIL_UP = v => DB.DIL.find(d => d >= v - 1e-9) || v;
  C.handlers.etest = (j) => { const p = S().etests.find(x => x.id === j.data.p); if (p) p.ready = true; C.toast('📐 ETEST gotowy do odczytu', 'ok'); };

  /* ================= API 20 E ================= */
  const APIT = ['ONPG', 'ADH', 'LDC', 'ODC', 'CIT', 'H2S', 'URE', 'TDA', 'IND', 'VP', 'GEL', 'GLU', 'MAN', 'INO', 'SOR', 'RHA', 'SAC', 'MEL', 'AMY', 'ARA', 'OX'];
  const APIC = { ONPG: ['#f4e04d', '#f5f5f0'], ADH: ['#e2513a', '#f1d34d'], LDC: ['#d9483d', '#f1d34d'], ODC: ['#d9483d', '#f1d34d'], CIT: ['#2f8f8a', '#c8dcb0'], H2S: ['#222', '#f2f0e6'], URE: ['#e05a5a', '#f1d34d'], TDA: ['#8a3b1f', '#f1d34d'], IND: ['#e05a8a', '#f1d34d'], VP: ['#e0607a', '#f5f5f0'], GEL: ['#2b2b2b', '#f2f0e6'] };
  const SUGAR = ['#f1d34d', '#2f5fae'];
  function profileBits(code) { const bits = []; code.split('').forEach(d => { const n = +d; bits.push(n & 1 ? 1 : 0, n & 2 ? 1 : 0, n & 4 ? 1 : 0); }); return bits.slice(0, 21); }
  function bitsToCode(b) { let s = ''; for (let i = 0; i < 21; i += 3) s += b[i] + b[i + 1] * 2 + b[i + 2] * 4; return s; }
  const APIDB = Object.entries(DB.ORG).filter(([k, o]) => o.api).map(([k, o]) => [o.api, o.name, k]).concat([['5144552', 'Escherichia coli', 'ECO'], ['5215573', 'Klebsiella pneumoniae', 'KPN'], ['1604552', 'Citrobacter freundii', null], ['5305773', 'Klebsiella oxytoca', null], ['5307773', 'Klebsiella oxytoca', null], ['0234000', 'Morganella morganii', null], ['5304163', 'Serratia marcescens', null]]);
  STATIONS.api = {
    open() { this.render(); }, refresh() { this.render(); },
    render() {
      const strips = S().apis || (S().apis = []);
      const suspOpts = S().susp.filter(s => !s.archived).map(s => `<option value="${s.id}">${s.id} – ${s.mcf.toFixed(2)} McF (${s.target})</option>`).join('') || '<option value="">— przygotuj zawiesinę 0,5 McF (DENSICHEK, cel API) —</option>';
      C.modal('🧪 API® 20 E – identyfikacja biochemiczna', `
        <div class="form"><label>Zawiesina 0,5 McF (5 mL NaCl) <select id="a-s">${suspOpts}</select></label></div>
        <div class="row wrap"><label><input type="checkbox" id="a-fill" checked> Napełnij mikroprobówki (CIT, VP, GEL – także kopułki)</label><label><input type="checkbox" id="a-oil"> Przykryj olejem parafinowym ADH, LDC, ODC, H₂S, URE</label><label><input type="checkbox" id="a-hum" checked> Woda do komory inkubacyjnej</label></div>
        <button class="btn" id="a-go">▶ Inokuluj i inkubuj 18–24 h w 36 °C</button>
        <h4>Paski</h4>${strips.filter(p => !p.archived).map(p => `<div class="ti">🧪 <b>${p.id}</b> z ${p.susp} · ${p.ready ? (p.code ? 'profil ' + p.code + ' → ' + h(p.idText) : `<button class="btn sm" data-rd="${p.id}">Dodaj odczynniki i odczytaj</button>`) : 'inkubacja…'}</div>`).join('') || '<p class="muted">Brak</p>'}
        <div class="tip">Po inkubacji dodaj: <b>TDA</b> (chlorek żelaza III) → brązowy = +; <b>JAMES</b> (IND) → różowy = +; <b>VP1 + VP2</b> → różowy po 10 min = +. Oksydazę wykonaj osobno z kolonii.</div>`, { wide: true, sub: '20 mikroprobówek · profil numeryczny 7-cyfrowy' });
      $('#a-go').onclick = () => {
        const su = C.get('susp', $('#a-s').value); if (!su) return C.toast('Brak zawiesiny', 'warn');
        const o = DB.ORG[su.org];
        if (o.gram !== 'neg') C.toast('⚠ API 20 E jest przeznaczony dla pałeczek Gram-ujemnych!', 'warn');
        const truth = o.api ? profileBits(o.api) : Array.from({ length: 21 }, (_, i) => C.rng(su.org + i)() < .3 ? 1 : 0);
        const p = { id: C.nid('A'), susp: su.id, org: su.org, oil: $('#a-oil').checked, truth, spec: su.spec, caseId: su.caseId, iso: su.iso, ready: false, mixed: su.mixed };
        strips.push(p); const j = C.job('api', 20 * 60, { p: p.id }, 'API 20 E – inkubacja'); j.st = 'api'; C.save(); this.render();
      };
      $$('[data-rd]').forEach(b => b.onclick = () => this.read(b.dataset.rd));
    },
    read(id) {
      const p = S().apis.find(x => x.id === id); p.reag = p.reag || {};
      const shown = p.truth.map((v, i) => {
        const t = APIT[i];
        if (!p.oil && ['ADH', 'LDC', 'ODC', 'URE'].includes(t)) return 1; // bez oleju – fałszywie dodatnie (alkalizacja)
        if (t === 'TDA' && !p.reag.TDA) return 0; if (t === 'IND' && !p.reag.IND) return 0; if (t === 'VP' && !p.reag.VP) return 0;
        return v;
      });
      p.user = p.user || shown.map(() => 0);
      const well = (t, i) => { const col = APIC[t] || SUGAR; if (t === 'OX') return `<div class="aw ox"><b>OX</b><small>osobno</small></div>`; const c = shown[i] ? col[0] : col[1]; return `<div class="aw"><div class="cup" style="background:${c}"></div><b>${t}</b></div>`; };
      C.sub('🧪 Odczyt API 20 E – ' + p.id, `<div class="apistrip">${APIT.map(well).join('')}</div>
        <div class="row wrap"><button class="btn sm" id="r-tda" ${p.reag.TDA ? 'disabled' : ''}>+ TDA</button><button class="btn sm" id="r-ind" ${p.reag.IND ? 'disabled' : ''}>+ JAMES</button><button class="btn sm" id="r-vp" ${p.reag.VP ? 'disabled' : ''}>+ VP1 + VP2</button><button class="btn sm" id="r-ox">Test oksydazy z kolonii</button></div>
        <p>Zaznacz wyniki dodatnie:</p><div class="apitoggle">${APIT.map((t, i) => `<label class="${p.user[i] ? 'on' : ''}"><input type="checkbox" data-i="${i}" ${p.user[i] ? 'checked' : ''}>${t}</label>`).join('')}</div>
        <p>Profil: <code id="a-code">${bitsToCode(p.user)}</code></p><button class="btn" id="a-id">🔎 Szukaj w bazie apiweb™</button><div id="a-res"></div>`);
      $('#r-tda').onclick = () => { p.reag.TDA = 1; this.read(id); }; $('#r-ind').onclick = () => { p.reag.IND = 1; this.read(id); }; $('#r-vp').onclick = () => { p.reag.VP = 1; this.read(id); };
      $('#r-ox').onclick = () => C.toast(`Oksydaza: ${DB.ORG[p.org].ox ? 'DODATNIA' : 'UJEMNA'}`, 'info');
      $$('.apitoggle input').forEach(ch => ch.onchange = () => { p.user[+ch.dataset.i] = ch.checked ? 1 : 0; ch.parentElement.classList.toggle('on', ch.checked); $('#a-code').textContent = bitsToCode(p.user); });
      $('#a-id').onclick = () => {
        const code = bitsToCode(p.user);
        const hd = (a, b) => a.split('').reduce((s, d, i) => { let x = (+d) ^ (+b[i]); return s + (x & 1) + ((x >> 1) & 1) + ((x >> 2) & 1); }, 0);
        const best = APIDB.map(([c, n, k]) => [c, n, k, hd(code, c)]).sort((a, b) => a[3] - b[3]);
        const b = best[0]; let txt, pct;
        if (b[3] === 0) { pct = 99.5; txt = `${b[1]} – Doskonała identyfikacja (%ID ${pct}, T 0,9)`; }
        else if (b[3] === 1) { pct = 95.1; txt = `${b[1]} – Dobra identyfikacja (%ID ${pct}); test niezgodny: 1`; }
        else if (b[3] === 2) { pct = 80.3; txt = `${b[1]} – Identyfikacja akceptowalna do rodzaju (%ID ${pct})`; }
        else { pct = 0; txt = 'Profil nieakceptowalny – sprawdź czystość hodowli i odczyt'; }
        const correct = b[2] === p.org && b[3] <= 1;
        p.code = code; p.idText = txt;
        C.addResult({ kind: 'api', icon: '🧪', title: `API 20 E: ${code} → ${txt}`, spec: p.spec, caseId: p.caseId, iso: p.iso, data: { code, txt, org: correct ? p.org : null } }).seen = true;
        const truthCode = bitsToCode(p.truth);
        $('#a-res').innerHTML = `<p class="${correct ? 'ok' : 'warn'}"><b>${h(txt)}</b><br>${correct ? '✓ Zgodnie z rzeczywistym szczepem' : 'Rzeczywisty profil szczepu: ' + truthCode + (p.oil ? '' : ' (uwaga: brak oleju zafałszował ADH/LDC/ODC/URE)')}</p>`;
        if (correct) { C.xp(35, 'identyfikacja API 20 E'); C.ach('first_api'); }
        C.save(); STATIONS.api.render();
      };
    }
  };
  C.handlers.api = (j) => { const p = S().apis.find(x => x.id === j.data.p); if (p) p.ready = true; C.toast('🧪 Pasek API 20 E gotowy do odczytu', 'ok'); };
})();
