/* =========================================================================
   STANOWISKA: LIS, biblioteka, ustawienia, lodówka, posiew, Isola,
   cieplarka, podgląd płytek, PREVI Color Gram + mikroskop
   ========================================================================= */
(function () {
  const C = CORE, $ = C.$, $$ = C.$$, h = C.h;
  const S = () => C.S;

  /* ---------- tworzenie próbek ---------- */
  C.makeSpecimen = function (caseId, def) {
    const s = { id: C.nid('S'), caseId, type: def.type, label: def.label, orgs: def.orgs || [], vidas: def.vidas || {}, bf: def.bf || null, bfq: def.bfq || null, t: S().t };
    S().specimens.push(s);
    if (def.type === 'BLOOD') {
      const types = /PF/.test(def.label) ? ['PF'] : /FN/.test(def.label) ? ['FA', 'FN'] : ['FA'];
      types.forEach(bt => S().bottles.push({ id: C.nid('B'), spec: s.id, type: bt, status: 'new', vol: null, t: null }));
    }
    return s;
  };
  C.orgsOf = function (srcId) {
    const sp = C.get('specimens', srcId); if (sp) return sp.orgs;
    const iso = C.get('isolates', srcId); if (iso) return iso.mixed ? [[iso.org, iso.pheno, 1e8], [iso.mixOrg, iso.mixPheno, 1e8]] : [[iso.org, iso.pheno, 1e8]];
    return [];
  };

  /* ---------- kolonie ---------- */
  C.colonies = function (p) {
    const hrs = C.incHours(p), out = [];
    if (hrs < 8) return out;
    p.orgs.forEach(([oid, ph, load], oi) => {
      const o = DB.ORG[oid]; const col = o.col[p.medium];
      if (!col) return;
      let fac = 1;
      if (['HIN', 'NME', 'SPN'].includes(oid) && p.atm !== 'CO2') fac = oid === 'HIN' ? 0 : 0.5;
      if (o.gram === 'yeast' && p.medium !== 'CAN' && p.medium !== 'SGC') fac *= 0.7;
      if (!fac) return;
      const lag = o.gram === 'yeast' ? 14 : 7; const size = Math.max(0.25, Math.min(1, (hrs - lag) / (o.gram === 'yeast' ? 30 : 14)));
      const r = C.rng(p.id + oid);
      let n = p.vol === 1 ? Math.min(140, Math.round(load / 1000)) : Math.min(120, Math.round(Math.log10(Math.max(10, load)) * 13));
      if (p.src.startsWith('S') && (C.get('specimens', p.src) || {}).type === 'BROTH') n = 110;
      n = Math.max(3, Math.round(n * fac * (p.quality || 1)));
      const pts = [];
      for (let k = 0; k < n; k++) {
        const qr = r(); const q = qr < .45 ? 0 : qr < .75 ? 1 : qr < .92 ? 2 : 3;
        const a0 = [-2.6, -1.0, 0.55, 2.1][q]; const ang = a0 + (r() - .5) * 1.25; const rad = 22 + r() * 58;
        const x = 100 + Math.cos(ang) * rad, y = 100 + Math.sin(ang) * rad;
        const base = col.s * 1.55 * size * (0.7 + r() * 0.5) * (q === 0 ? 0.75 : 1);
        pts.push([x, y, Math.max(0.7, base), q]);
      }
      let c = col.c;
      if (p.medium === 'CAN' && hrs < 30 && o.gram === 'yeast') c = '#e9e6dc'; // kolor wybarwia się później
      if (p.medium === 'VRE' && oid === 'EFM' && hrs < 24) c = '#b48fc0';
      out.push({ oid, ph, c, h: col.h, n: col.n || '', pts, halo: oid === 'PMI' && p.medium === 'CPS' ? '#a8794a' : null });
    });
    return out;
  };

  /* ---------- podgląd płytki ---------- */
  C.viewPlate = function (pid) {
    const p = C.get('plates', pid); if (!p) return;
    const cols = C.colonies(p), hrs = C.incHours(p);
    const m = DB.MEDIA[p.medium];
    const swarm = cols.some(c => c.oid === 'PMI') && ['COS', 'CHOC', 'MHE'].includes(p.medium);
    const svg = ART.plate(p.medium, cols, { swarm, label: `${p.id} · ${m.name}` });
    const cfu = p.vol === 1 ? cols.reduce((a, c) => a + c.pts.length, 0) * 1000 : null;
    C.sub(`🧫 Płytka ${p.id} – ${m.name}`, `
      <div class="plate-wrap"><div class="plate-big" id="plate-big">${svg}</div>
      <div class="plate-info">
        <p><b>Materiał:</b> ${p.src} · <b>Objętość:</b> ${p.vol} µL · <b>Atmosfera:</b> ${p.atm}</p>
        <p><b>Inkubacja:</b> ${hrs.toFixed(1)} h ${p.incubating ? '(w cieplarce)' : ''}</p>
        ${hrs < 8 ? '<p class="warn">Brak widocznego wzrostu – za krótka inkubacja (min. 16–18 h).</p>' : cols.length === 0 ? '<p><b>Brak wzrostu.</b></p>' : `
        <h4>Typy kolonii</h4>${cols.map((c, i) => `<div class="coltype"><span class="dot" style="background:${c.c}"></span> Typ ${i + 1}: ${c.pts.length} kolonii${c.h ? ', hemoliza ' + c.h : ''}<br><small>${h(c.n)}</small></div>`).join('')}
        ${cfu != null ? `<p class="ok"><b>Liczba:</b> ≈ ${cfu >= 1e5 ? '≥ 10⁵' : cfu.toLocaleString('pl')} CFU/mL (ezą 1 µL: kolonie × 1000)</p>` : ''}
        <p class="tip">👆 Kliknij <b>pojedynczą, izolowaną kolonię</b> (z dalszej części posiewu), aby pobrać ją do dalszych badań.</p>
        <div id="pick-info"></div>`}
        <div class="row">${p.incubating ? `<button class="btn" id="pl-out">Wyjmij z cieplarki</button>` : `<button class="btn" id="pl-in">Wstaw do cieplarki</button>`}
        <button class="btn ghost" id="pl-arch">Archiwizuj płytkę</button></div>
      </div></div>`);
    if (!p.read && hrs >= 16) { p.read = true; C.xp(10, 'ocena płytki'); }
    $$('#plate-big .colony').forEach(el => el.onclick = () => {
      const ci = +el.dataset.c; const col = cols[ci];
      const cx = +el.getAttribute('cx'), cy = +el.getAttribute('cy'), r = +el.getAttribute('r');
      const neighbors = cols.some((o, oi) => oi !== ci && o.pts.some(q => Math.hypot(q[0] - cx, q[1] - cy) < (q[2] + r) * 1.6));
      const sameClose = col.pts.filter(q => Math.hypot(q[0] - cx, q[1] - cy) < (q[2] + r) * 1.2).length > 1;
      const mixed = neighbors;
      const other = mixed ? cols.find((o, oi) => oi !== ci) : null;
      const iso = { id: C.nid('I'), plate: p.id, org: col.oid, pheno: col.ph, mixed: !!mixed, mixOrg: other && other.oid, mixPheno: other && other.ph, medium: p.medium, desc: `Typ ${ci + 1} z ${p.medium}`, t: S().t, spec: p.src, caseId: p.caseId };
      S().isolates.push(iso); C.save(); C.updateTray();
      $('#pick-info').innerHTML = `<div class="${mixed ? 'warn' : 'ok'}">Pobrano kolonię → <b>${iso.id}</b>. ${mixed ? '⚠ Kolonia stykała się z innym typem – izolat może być <b>mieszany</b>! Lepiej wybierz kolonię odosobnioną.' : sameClose ? 'Kolonia blisko innych tego samego typu – OK.' : 'Kolonia izolowana – czysta hodowla ✓'}</div>
        <div class="row"><button class="btn sm" id="t-cat">Test katalazy</button><button class="btn sm" id="t-ox">Test oksydazy</button></div><div id="t-res"></div>`;
      $('#t-cat').onclick = () => { const o = DB.ORG[iso.org]; $('#t-res').innerHTML = `Katalaza (H₂O₂): <b>${o.cat ? 'DODATNIA – pęcherzyki gazu' : 'UJEMNA'}</b>`; };
      $('#t-ox').onclick = () => { const o = DB.ORG[iso.org]; $('#t-res').innerHTML = `Oksydaza: <b>${o.ox ? 'DODATNIA – fioletowe zabarwienie w 10 s' : 'UJEMNA'}</b>`; };
      C.beep(700, .05);
    });
    const pi = $('#pl-in'), po = $('#pl-out');
    if (pi) pi.onclick = () => { p.incubating = true; p.incFrom = S().t; C.save(); C.viewPlate(pid); C.updateTray(); };
    if (po) po.onclick = () => { p.incMin += S().t - p.incFrom; p.incubating = false; C.save(); C.viewPlate(pid); C.updateTray(); };
    $('#pl-arch').onclick = () => { p.archived = true; C.closeSub(); C.save(); C.updateTray(); C.refreshOpenStation(); };
  };

  function newPlate(src, medium, vol, quality, manual) {
    const sp = C.get('specimens', src);
    const p = { id: C.nid('P'), src, caseId: sp ? sp.caseId : (C.get('isolates', src) || {}).caseId, medium, vol, quality, orgs: JSON.parse(JSON.stringify(C.orgsOf(src))), t: S().t, incubating: false, incFrom: 0, incMin: 0, atm: ['CHOC', 'MHF'].includes(medium) ? 'CO2' : 'O2', manual };
    S().plates.push(p); C.ach('first_plate'); return p;
  }
  C.newPlate = newPlate;
  const platable = () => S().specimens.filter(s => !s.archived && DB.SPEC_TYPES[s.type].media.length);

  /* ================= LIS / REJESTRACJA ================= */
  STATIONS.lis = {
    open() { this.tab = this.tab || 'cases'; this.render(); },
    refresh() { this.render(); },
    render() {
      const tab = this.tab;
      const caseRows = DB.CASES.map(cs => {
        const st = S().cases[cs.id];
        return `<div class="case ${st ? (st.done ? 'done' : 'active') : ''}">
          <div class="case-h"><b>${cs.id} · ${h(cs.title)}</b><span class="stars">${'★'.repeat(cs.diff)}${'☆'.repeat(3 - cs.diff)}</span></div>
          <div class="case-p">👤 ${h(cs.patient)} · 🏥 ${h(cs.ward)}</div>
          <div class="case-c">${h(cs.clin)}</div>
          <div class="case-g">🎯 ${h(cs.goal)}</div>
          ${st ? (st.done ? `<div class="ok">✓ Zakończony · wynik ${st.score}%</div>` : `<div class="info">W toku od ${C.clock(st.t)} · próbki: ${st.specs.join(', ')}</div><button class="btn sm" data-plan="${cs.id}">📋 Pokaż plan pracy</button><details><summary>Podpowiedź</summary>${h(cs.tip)}</details>`) : `<button class="btn" data-accept="${cs.id}">📥 Przyjmij zlecenie</button>`}
        </div>`;
      }).join('');
      const orgOpts = Object.entries(DB.ORG).map(([k, o]) => `<option value="${k}">${o.name}</option>`).join('');
      C.modal('🖥️ Rejestracja próbek – LIS', `
        <div class="tabs"><button data-tab="cases" class="${tab === 'cases' ? 'on' : ''}">Zlecenia z oddziałów</button><button data-tab="sandbox" class="${tab === 'sandbox' ? 'on' : ''}">Tryb swobodny (sandbox)</button><button data-tab="list" class="${tab === 'list' ? 'on' : ''}">Przyjęte próbki</button></div>
        ${tab === 'cases' ? `<p class="muted">Przyjmij zlecenie – próbki zostaną zarejestrowane, oznakowane kodem kreskowym i trafią na Twoją tacę. Następnie przejdź do odpowiednich stanowisk.</p><div class="cases">${caseRows}</div>` : ''}
        ${tab === 'sandbox' ? `<p class="muted">Stwórz dowolną próbkę z wybranym drobnoustrojem i fenotypem oporności, aby swobodnie testować wszystkie aparaty.</p>
          <div class="form">
            <label>Rodzaj materiału <select id="sb-type">${Object.entries(DB.SPEC_TYPES).filter(([k]) => k !== 'BROTH').map(([k, v]) => `<option value="${k}">${v.icon} ${v.name}</option>`).join('')}</select></label>
            <label>Drobnoustrój 1 <select id="sb-org">${orgOpts}</select></label>
            <label>Fenotyp <select id="sb-ph"></select></label>
            <label>Liczba (CFU/mL) <select id="sb-load"><option value="1000">10³</option><option value="10000">10⁴</option><option value="100000" selected>10⁵</option><option value="1000000">10⁶</option></select></label>
            <label>Drobnoustrój 2 (opcjonalnie) <select id="sb-org2"><option value="">— brak (czysta hodowla) —</option>${orgOpts}</select></label>
            <label>Cele BIOFIRE (wirusy/pasożyty, po przecinku) <input id="sb-bf" placeholder="np. Influenza A, Norovirus GI/GII"></label>
            <label>Wartości VIDAS (np. PCT=2.5, DD2=800) <input id="sb-vidas" placeholder="PCT=0.3"></label>
            <label>Etykieta <input id="sb-label" value="Próbka testowa"></label>
            <label>Butelki krwi <select id="sb-bt"><option value="FA">FA Plus</option><option value="FA+FN">FA Plus + FN Plus</option><option value="PF">PF Plus (pediatria)</option></select></label>
          </div><button class="btn" id="sb-make">➕ Zarejestruj próbkę</button>` : ''}
        ${tab === 'list' ? `<table class="tbl"><tr><th>ID</th><th>Materiał</th><th>Etykieta</th><th>Przypadek</th><th>Przyjęto</th><th></th></tr>
          ${S().specimens.map(s => `<tr class="${s.archived ? 'arch' : ''}"><td><span class="barcode">${s.id}</span></td><td>${DB.SPEC_TYPES[s.type].icon} ${DB.SPEC_TYPES[s.type].name}</td><td>${h(s.label)}</td><td>${s.caseId || 'sandbox'}</td><td>${C.clock(s.t)}</td><td>${s.archived ? '' : `<button class="btn sm ghost" data-arch="${s.id}">Archiwizuj</button>`}</td></tr>`).join('')}</table>` : ''}
      `, { wide: true, sub: 'Laboratoryjny System Informatyczny · przyjmowanie zleceń' });
      $$('[data-tab]').forEach(b => b.onclick = () => { this.tab = b.dataset.tab; this.render(); });
      $$('[data-accept]').forEach(b => b.onclick = () => this.accept(b.dataset.accept));
      $$('[data-plan]').forEach(b => b.onclick = () => { $('#missions').dataset.sel = b.dataset.plan; C.closeModal(); MISSIONS.show(); });
      $$('[data-arch]').forEach(b => b.onclick = () => { C.get('specimens', b.dataset.arch).archived = true; C.save(); this.render(); C.updateTray(); });
      if (tab === 'sandbox') {
        const fillPh = () => { const o = DB.ORG[$('#sb-org').value]; $('#sb-ph').innerHTML = Object.entries(o.phenos).map(([k, p]) => `<option value="${k}">${p.name}</option>`).join(''); };
        $('#sb-org').onchange = fillPh; fillPh();
        $('#sb-make').onclick = () => {
          const type = $('#sb-type').value, org = $('#sb-org').value, ph = $('#sb-ph').value, load = +$('#sb-load').value, org2 = $('#sb-org2').value;
          const orgs = [[org, ph, type === 'BLOOD' ? 1 : load]]; if (org2) orgs.push([org2, Object.keys(DB.ORG[org2].phenos)[0], load]);
          const vidas = {}; $('#sb-vidas').value.split(',').forEach(kv => { const [k, v] = kv.split('='); if (k && v && DB.VIDAS[k.trim().toUpperCase()]) vidas[k.trim().toUpperCase()] = parseFloat(v); });
          const bf = $('#sb-bf').value.split(',').map(x => x.trim()).filter(Boolean);
          const bt = $('#sb-bt').value;
          const s = C.makeSpecimen(null, { type, label: $('#sb-label').value + (type === 'BLOOD' ? (bt === 'FA+FN' ? ' (FA+FN)' : bt === 'PF' ? ' (PF)' : '') : ''), orgs, vidas, bf });
          C.toast(`Zarejestrowano próbkę <b>${s.id}</b>`, 'ok'); C.save(); C.updateTray(); this.tab = 'list'; this.render();
        };
      }
    },
    accept(id) {
      const cs = DB.CASES.find(c => c.id === id); const ids = [];
      cs.specimens.forEach(d => { const s = C.makeSpecimen(id, d); ids.push(s.id); });
      S().cases[id] = { t: S().t, specs: ids, done: false };
      C.logEv(`Przyjęto zlecenie ${id}: ${cs.title}`); C.toast(`📥 Przyjęto ${id} – próbki ${ids.join(', ')} na tacy. Kroki znajdziesz w panelu 📋 Plan pracy.`, 'ok'); $('#missions').dataset.sel = id; MISSIONS.show(); C.beep(600, .08);
      C.save(); C.updateTray(); this.render();
    }
  };

  /* ================= BIBLIOTEKA ================= */
  STATIONS.library = {
    open() { this.tab = this.tab || 'instr'; this.render(); },
    render() {
      const t = this.tab;
      let body = '';
      if (t === 'instr') body = Object.entries(DB.INSTR).map(([k, i]) => `<div class="enc">
        <div class="enc-art">${ART.svg({ vitek2: 'vitek2', vitekms: 'vitekms', virtuo: 'virtuo', biofire: 'torch', spotfire: 'spotfire', vidas: 'vidas3', densichek: 'densichek', isola: 'isola', gram: 'colorgram', etest: 'incubator', api: 'bsc', myla: 'pc', tempo: 'tempo', geneup: 'geneup' }[k] || 'pc')}</div>
        <div><h3>${i.name}</h3><div class="cat">${i.cat}</div><p>${i.what}</p><ol>${i.how.map(x => `<li>${x}</li>`).join('')}</ol><p class="muted">⚙️ ${i.specs}</p><a href="${i.url}" target="_blank" rel="noopener">Strona producenta ↗</a></div></div>`).join('');
      if (t === 'org') body = `<div class="orggrid">${Object.entries(DB.ORG).map(([k, o]) => `<div class="orgc"><h4><i>${o.name}</i></h4><div class="muted">${{ neg: 'Gram(−)', pos: 'Gram(+)', yeast: 'Drożdżak' }[o.gram]} · ${{ rods: 'pałeczki', 'cocci-clusters': 'ziarniaki w gronach', 'cocci-chains': 'ziarniaki w łańcuszkach', 'cocci-pairs': 'dwoinki lancetowate', diplococci: 'dwoinki', coccobacilli: 'pałeczki kokoidalne', yeast: 'komórki drożdżaka' }[o.morph]} · karta ${o.idCard} · oksydaza ${o.ox ? '+' : '−'} · katalaza ${o.cat ? '+' : '−'}</div>
        <div class="minis">${Object.entries(o.col).filter(([m, c]) => c).slice(0, 6).map(([m, c]) => `<div class="mini"><div class="mp" style="background:${DB.MEDIA[m].bg}"><span style="background:${c.c}"></span><span style="background:${c.c}"></span><span style="background:${c.c}"></span></div><small>${m}</small></div>`).join('')}</div>
        <div class="muted">Fenotypy: ${Object.values(o.phenos).map(p => p.name).join(' · ')}</div></div>`).join('')}</div>`;
      if (t === 'media') body = `<table class="tbl"><tr><th>Kod</th><th>Podłoże</th><th>Typ</th><th>Atmosfera</th></tr>${Object.entries(DB.MEDIA).map(([k, m]) => `<tr><td><span class="dot" style="background:${m.bg}"></span> ${k}</td><td>${m.name}</td><td>${m.type}</td><td>${m.atm}</td></tr>`).join('')}</table>`;
      if (t === 'bp') body = Object.entries(DB.BP).map(([g, abx]) => `<h4>${({ ENT: 'Enterobacterales', PSA: 'Pseudomonas spp.', ACB: 'Acinetobacter spp.', STA: 'Staphylococcus spp.', ENC: 'Enterococcus spp.', SPN: 'S. pneumoniae', STR: 'Paciorkowce β-hemolizujące / inne', HIN: 'H. influenzae / Neisseria', CAN: 'Candida albicans', CAU: 'Candida auris (wartości orientacyjne)', CGL: 'N. glabratus' })[g]}</h4><div class="bpgrid">${Object.entries(abx).map(([a, [s, r]]) => `<span><b>${a}</b> ${DB.ABX[a][0]}: S≤${s === 0.001 ? '(I)' : s} R>${r}</span>`).join('')}</div>`).join('') + '<p class="muted">Wartości demonstracyjne wzorowane na tabelach EUCAST – w praktyce zawsze korzystaj z aktualnej wersji tabel.</p>';
      if (t === 'quiz') body = this.quizHtml();
      if (t === 'log') body = `<table class="tbl">${S().log.map(l => `<tr><td>${C.clock(l.t)}</td><td>${h(l.txt)}</td></tr>`).join('')}</table>`;
      if (t === 'ach') body = `<div class="achs">${Object.entries(C.ACH).map(([k, [n, d]]) => `<div class="ach ${S().ach[k] != null ? 'on' : ''}">🏆 <b>${n}</b><br><small>${d}</small></div>`).join('')}</div>`;
      C.modal('📚 Biblioteka wiedzy', `<div class="tabs">${[['instr', 'Aparaty'], ['org', 'Atlas drobnoustrojów'], ['media', 'Podłoża'], ['bp', 'Punkty odcięcia'], ['quiz', 'Quiz'], ['ach', 'Osiągnięcia'], ['log', 'Dziennik']].map(([k, n]) => `<button data-tab="${k}" class="${t === k ? 'on' : ''}">${n}</button>`).join('')}</div>${body}`, { wide: true, sub: 'Encyklopedia aparatów, drobnoustrojów i metod' });
      $$('[data-tab]').forEach(b => b.onclick = () => { this.tab = b.dataset.tab; this.render(); });
      if (t === 'quiz') this.bindQuiz();
    },
    quizHtml() {
      if (!this.q || this.q.done) { const r = C.rng('q' + Date.now()); const qs = DB.QUIZ.map(q => q).sort(() => r() - .5).slice(0, 10); this.q = { qs, i: 0, ok: 0, done: false }; }
      const q = this.q.qs[this.q.i]; const order = [0, 1, 2, 3].sort(() => Math.random() - .5);
      return `<div class="quiz"><div class="muted">Pytanie ${this.q.i + 1}/10 · poprawne: ${this.q.ok}</div><h3>${q[0]}</h3>${order.map(i => `<button class="btn qa" data-a="${i}">${q[1][i]}</button>`).join('')}<div id="qfb"></div></div>`;
    },
    bindQuiz() {
      $$('.qa').forEach(b => b.onclick = () => {
        const q = this.q.qs[this.q.i], ok = +b.dataset.a === q[2];
        $$('.qa').forEach(x => { x.disabled = true; if (+x.dataset.a === q[2]) x.classList.add('good'); });
        if (!ok) b.classList.add('bad'); else this.q.ok++;
        $('#qfb').innerHTML = `<p class="${ok ? 'ok' : 'warn'}">${ok ? 'Dobrze!' : 'Niestety – poprawna odpowiedź: ' + q[1][q[2]]}</p><button class="btn" id="qnext">${this.q.i < 9 ? 'Dalej →' : 'Zakończ'}</button>`;
        $('#qnext').onclick = () => {
          if (this.q.i < 9) { this.q.i++; this.render(); }
          else { const pct = this.q.ok * 10; this.q.done = true; C.xp(this.q.ok * 5, `quiz ${pct}%`); if (pct >= 80) C.ach('quiz'); C.sub('Wynik quizu', `<h2>${pct}%</h2><p>${this.q.ok}/10 poprawnych odpowiedzi.</p>`); this.render(); }
        };
      });
    }
  };

  /* ================= USTAWIENIA / RANKING ================= */
  STATIONS.settings = {
    open() { this.render(); fetch('/api/leaderboard').then(r => r.json()).then(b => { const el = $('#lb'); if (el) el.innerHTML = b.length ? `<table class="tbl"><tr><th>#</th><th>Diagnosta</th><th>Punkty</th><th>Przypadki</th></tr>${b.map((x, i) => `<tr><td>${i + 1}</td><td>${h(x.name)}</td><td>${x.score}</td><td>${x.cases}</td></tr>`).join('')}</table>` : '<p class="muted">Ranking jest pusty – bądź pierwszy!</p>'; }).catch(() => { const el = $('#lb'); if (el) el.innerHTML = '<p class="muted">Ranking online działa w wersji serwerowej (Railway).</p>'; }); },
    render() {
      const st = S();
      C.modal('⚙️ Ustawienia i ranking', `
        <div class="form">
          <label>Twoje imię (diagnosta) <input id="set-name" value="${h(st.player.name)}" maxlength="24"></label>
          <label><input type="checkbox" id="set-real" ${st.settings.realistic ? 'checked' : ''}> Tryb realistyczny (wymagaj QC przed pracą aparatów)</label>
          <label><input type="checkbox" id="set-sound" ${st.settings.sound ? 'checked' : ''}> Dźwięki</label>
        </div>
        <div class="row"><button class="btn" id="set-save">Zapisz</button><button class="btn" id="set-sub">🏅 Wyślij wynik do rankingu</button><button class="btn danger" id="set-reset">Zacznij od nowa</button></div>
        <p>Punkty: <b>${st.player.score}</b> · Poziom: <b>${C.TITLES[C.level()]}</b> · Zakończone przypadki: <b>${st.player.cases}</b></p>
        <h3>Ranking diagnostów</h3><div id="lb">Ładowanie…</div>
        <h3>Statystyki aparatów</h3><div class="bpgrid">${Object.entries(st.stats.runs).map(([k, v]) => `<span><b>${k}</b>: ${v} uruchomień</span>`).join('') || '<span class="muted">Brak</span>'}</div>`, { sub: 'Profil i zapis postępu (zapis lokalny w przeglądarce)' });
      $('#set-save').onclick = () => { st.player.name = $('#set-name').value.trim() || 'Diagnosta'; st.settings.realistic = $('#set-real').checked; st.settings.sound = $('#set-sound').checked; C.save(); C.toast('Zapisano', 'ok'); };
      $('#set-sub').onclick = () => { st.player.name = $('#set-name').value.trim() || 'Diagnosta'; fetch('/api/leaderboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: st.player.name, score: st.player.score, cases: st.player.cases, level: C.level() + 1 }) }).then(r => { if (!r.ok) throw 0; C.toast('Wysłano do rankingu', 'ok'); this.open(); }).catch(() => C.toast('Ranking online jest dostępny w wersji na serwerze (Railway)', 'warn')); };
      $('#set-reset').onclick = (e) => { if (e.target.dataset.sure) C.reset(); else { e.target.dataset.sure = 1; e.target.textContent = 'Kliknij ponownie, aby potwierdzić'; } };
    }
  };

  /* ================= LODÓWKA / MAGAZYN ================= */
  STATIONS.inventory = {
    open() {
      const r = C.rng('lots' + C.day());
      const lot = () => String(Math.floor(1000000 + r() * 8999999));
      const items = [['Karty VITEK® 2 GN', 'ID', '2–8 °C'], ['Karty VITEK® 2 GP', 'ID', '2–8 °C'], ['Karty VITEK® 2 YST', 'ID', '2–8 °C'], ['Karty AST-N397 / N352 / N222', 'AST', '2–8 °C'], ['Karty AST-P592 / P586 / ST03 / YS08', 'AST', '2–8 °C'], ['VITEK® MS-CHCA matryca', 'MS', '2–8 °C'], ['VITEK® MS-FA kwas mrówkowy', 'MS', '15–25 °C'], ['Tarczki VITEK® MS-DS', 'MS', '15–25 °C'], ['Kasety BIOFIRE® (BCID2, RP2.1, PN, ME, GI, JI)', 'PCR', '15–25 °C'], ['Zestawy VIDAS® (paski + SPR®)', 'ELFA', '2–8 °C'], ['Paski ETEST®', 'MIC', '−20 – 8 °C'], ['API® 20 E + odczynniki (TDA, JAMES, VP1/VP2)', 'ID', '2–8 °C'], ['Podłoża chromID® i klasyczne', 'Hodowla', '2–8 °C'], ['Butelki BacT/ALERT® FA/FN/PF Plus', 'Krew', '15–30 °C']];
      C.modal('🧊 Lodówka odczynników i magazyn', `<p class="muted">Wszystkie odczynniki są dostępne w wirtualnym laboratorium. Zwróć uwagę na warunki przechowywania i numery serii (LOT) – są zapisywane przy wynikach.</p>
        <table class="tbl"><tr><th>Odczynnik</th><th>Typ</th><th>Przechowywanie</th><th>LOT</th><th>Ważność</th></tr>${items.map(i => `<tr><td>${i[0]}</td><td>${i[1]}</td><td>${i[2]}</td><td>${lot()}</td><td>2027-0${1 + Math.floor(r() * 8)}</td></tr>`).join('')}</table>
        <div class="tip">💡 Odczynniki z lodówki (np. zestawy VIDAS) należy przed użyciem doprowadzić do temperatury pokojowej (ok. 30 min).</div>`, { sub: 'Temperatura: 4,0 °C · Alarm: OK' });
    }
  };

  /* ================= POSIEW RĘCZNY (komora laminarna) ================= */
  function streakUI(kind) {
    const specs = platable().concat(S().specimens.filter(s => s.type === 'BROTH' && !s.archived)).filter((v, i, a) => a.indexOf(v) === i);
    const isos = S().isolates.filter(i => !i.archived);
    const sources = specs.map(s => ({ id: s.id, t: `${DB.SPEC_TYPES[s.type].icon} ${s.id} – ${s.label}` })).concat(isos.map(i => ({ id: i.id, t: `🧫 ${i.id} – izolat (subkultura)` })));
    const media = Object.entries(DB.MEDIA).filter(([k]) => !['MHE', 'MHF'].includes(k));
    return `<div class="form">
      <label>Materiał / izolat <select id="pz-src">${sources.map(s => `<option value="${s.id}">${h(s.t)}</option>`).join('') || '<option value="">— brak próbek, przyjmij w LIS —</option>'}</select></label>
      <label>Objętość <select id="pz-vol"><option value="1">1 µL (ilościowo – mocz)</option><option value="10" selected>10 µL</option></select></label>
    </div>
    <p><b>Wybierz podłoża:</b> <span class="muted" id="pz-sug"></span></p>
    <div class="media-pick">${media.map(([k, m]) => `<label class="mp-item"><input type="checkbox" value="${k}"><span class="mp" style="background:${m.bg}"></span><b>${k}</b><small>${m.name}</small></label>`).join('')}</div>
    ${kind === 'manual' ? `<p class="muted">Posiew ręczny metodą redukcyjną (4 kwadranty). Jakość posiewu zależy od wykonania – kliknij każdy kwadrant po kolei, opalając ezę.</p><div class="quads" id="quads">${[1, 2, 3, 4].map(i => `<button class="btn sm" data-q="${i}">Kwadrant ${i}</button>`).join('')}<button class="btn sm ghost" id="flame">🔥 Opal ezę</button></div>` : ''}
    <button class="btn" id="pz-go">${kind === 'manual' ? '✋ Posiej ręcznie' : '▶ Uruchom PREVI Isola'}</button>`;
  }
  function bindStreak(kind) {
    const upd = () => { const s = C.get('specimens', $('#pz-src').value); $('#pz-sug').textContent = s ? 'Sugerowane: ' + DB.SPEC_TYPES[s.type].media.join(', ') : 'Subkultura: dowolne podłoże'; };
    if ($('#pz-src')) { $('#pz-src').onchange = upd; upd(); }
    let seq = [], flamed = 0;
    $$('#quads [data-q]').forEach(b => b.onclick = () => { seq.push(+b.dataset.q); b.classList.add('on'); });
    if ($('#flame')) $('#flame').onclick = () => { flamed++; C.beep(300, .04); };
    $('#pz-go').onclick = () => {
      const src = $('#pz-src').value; if (!src) return C.toast('Brak materiału', 'warn');
      const media = $$('.media-pick input:checked').map(i => i.value); if (!media.length) return C.toast('Wybierz co najmniej jedno podłoże', 'warn');
      const vol = +$('#pz-vol').value;
      let q = 1;
      if (kind === 'manual') { const ok = seq.join('') === '1234'; q = ok ? (flamed >= 3 ? 1 : 0.85) : 0.6; if (!ok) C.toast('Kolejność kwadrantów nieprawidłowa – kolonie mogą nie być izolowane', 'warn'); }
      const doIt = () => {
        const made = media.map(m => newPlate(src, m, vol, q, kind === 'manual'));
        made.forEach(p => { p.incubating = true; p.incFrom = S().t; });
        C.toast(`Posiano ${made.length} płytk${made.length === 1 ? 'ę' : 'i'} → wstawiono do cieplarki`, 'ok'); C.xp(5 * made.length, 'posiew');
        C.save(); C.updateTray(); C.refreshOpenStation();
      };
      if (kind === 'isola') { C.job('isola', 3 * media.length, { src, media }, 'PREVI Isola – posiew').st = 'isola'; C.handlers.isola = () => { }; doIt(); }
      else doIt();
    };
  }
  STATIONS.bench = { open() { C.modal('🧤 Komora laminarna – posiew ręczny', ART.svg('bsc') + streakUI('manual'), { sub: 'Praca w klasie bezpieczeństwa II · eza 1 µL / 10 µL' }); bindStreak('manual'); }, refresh() { } };
  STATIONS.isola = { open() { C.modal('🤖 PREVI® Isola – automatyczny posiew', `<div class="instr-view">${ART.svg('isola', { busy: S().jobs.some(j => !j.done && j.kind === 'isola') })}</div>` + streakUI('isola') + '<div class="tip">PREVI Isola rozprowadza próbkę aplikatorem po spirali – kolonie izolowane są powtarzalne (jakość posiewu 100%).</div>', { sub: 'Automatyczny posiewacz płytek' }); bindStreak('isola'); }, refresh() { } };

  /* ================= CIEPLARKA ================= */
  STATIONS.incubator = {
    open() { this.render(); }, refresh() { this.render(); },
    render() {
      const pl = S().plates.filter(p => !p.archived);
      const inc = pl.filter(p => p.incubating);
      C.modal('🌡️ Cieplarki 35 °C', `<div class="two"><div class="instr-view">${ART.svg('incubator', { plates: inc.map(p => DB.MEDIA[p.medium].bg), temp: '35.0', co2: inc.some(p => p.atm === 'CO2') })}</div>
        <div><div class="tip">Typowy czas inkubacji: 18–24 h (bakterie), 24–48 h (drożdżaki). Płytki czekoladowe i MHF – atmosfera 5% CO₂. Użyj przycisków czasu na górze, aby przyspieszyć.</div>
        <table class="tbl"><tr><th>Płytka</th><th>Podłoże</th><th>Źródło</th><th>Atm.</th><th>Czas</th><th></th></tr>
        ${pl.map(p => `<tr><td><span class="dot" style="background:${DB.MEDIA[p.medium].bg}"></span>${p.id}</td><td>${p.medium}</td><td>${p.src}</td><td><select data-atm="${p.id}"><option ${p.atm === 'O2' ? 'selected' : ''}>O2</option><option ${p.atm === 'CO2' ? 'selected' : ''}>CO2</option></select></td><td>${C.incHours(p).toFixed(1)} h ${p.incubating ? '🔥' : ''}</td><td><button class="btn sm" data-view="${p.id}">Oceń</button></td></tr>`).join('') || '<tr><td colspan="6" class="muted">Brak płytek – posiej materiał w komorze laminarnej lub PREVI Isola.</td></tr>'}
        </table><div class="row"><button class="btn" id="inc-18">⏩ Inkubuj +18 h</button><button class="btn ghost" id="inc-6">+6 h</button></div></div></div>`, { wide: true, sub: 'Cieplarka tlenowa i CO₂' });
      $$('[data-view]').forEach(b => b.onclick = () => C.viewPlate(b.dataset.view));
      $$('[data-atm]').forEach(s => s.onchange = () => { C.get('plates', s.dataset.atm).atm = s.value; C.save(); });
      $('#inc-18').onclick = () => { C.advance(18 * 60); this.render(); };
      $('#inc-6').onclick = () => { C.advance(6 * 60); this.render(); };
    }
  };

  /* ================= PREVI COLOR GRAM + MIKROSKOP ================= */
  const MORPH_PL = { rods: 'pałeczki', 'cocci-clusters': 'ziarniaki w skupiskach (gronach)', 'cocci-chains': 'ziarniaki w łańcuszkach', 'cocci-pairs': 'dwoinki lancetowate', diplococci: 'dwoinki (nerkowate)', coccobacilli: 'pałeczki kokoidalne', yeast: 'komórki drożdżaka (pączkujące)' };
  STATIONS.gram = {
    open() { this.render(); }, refresh() { this.render(); },
    render() {
      const srcs = S().specimens.filter(s => !s.archived && ['BROTH', 'CSF', 'SYN', 'BAL', 'URINE', 'WOUND'].includes(s.type)).map(s => ({ id: s.id, t: `${DB.SPEC_TYPES[s.type].icon} ${s.id} – ${s.label}` }))
        .concat(S().isolates.filter(i => !i.archived).map(i => ({ id: i.id, t: `🧫 ${i.id} – izolat` })));
      const running = S().jobs.find(j => !j.done && j.kind === 'gram');
      const slides = S().slides.filter(s => !s.archived);
      C.modal('🔬 PREVI® Color Gram + mikroskop', `<div class="two"><div class="instr-view">${ART.svg('colorgram', { busy: !!running, angle: running ? (S().t * 30) % 360 : 0 })}</div><div>
        <div class="form"><label>Materiał do preparatu <select id="g-src">${srcs.map(s => `<option value="${s.id}">${h(s.t)}</option>`).join('') || '<option value="">— brak —</option>'}</select></label>
        <label>Program barwienia <select id="g-prog"><option>Hodowla / kolonia</option><option>Dodatnia butelka krwi</option><option>Materiał kliniczny (PMR, BAL)</option></select></label></div>
        <button class="btn" id="g-run" ${running ? 'disabled' : ''}>▶ Utrwal i barw (≈ 12 min)</button>
        ${running ? `<p class="info">Barwienie w toku… ${C.dur(running.end - S().t)}</p>` : ''}
        <h4>Preparaty</h4>${slides.map(s => `<div class="ti">🔬 <b>${s.id}</b> z ${s.src} · ${s.stained ? (s.read ? 'oceniony: ' + h(s.read) : '<button class="btn sm" data-look="' + s.id + '">Oglądaj pod mikroskopem</button>') : 'barwienie…'}</div>`).join('') || '<p class="muted">Brak preparatów</p>'}
      </div></div>`, { wide: true, sub: 'Automatyczne barwienie: fiolet krystaliczny → Lugol → odbarwiacz → safranina' });
      $('#g-run').onclick = () => {
        const src = $('#g-src').value; if (!src) return C.toast('Brak materiału', 'warn');
        const sl = { id: C.nid('G'), src, stained: false, t: S().t }; S().slides.push(sl);
        const j = C.job('gram', 12, { slide: sl.id }, 'PREVI Color Gram'); j.st = 'gram'; this.render();
      };
      $$('[data-look]').forEach(b => b.onclick = () => this.micro(b.dataset.look));
    },
    micro(id) {
      const sl = C.get('slides', id); const orgs = C.orgsOf(sl.src);
      const sp = C.get('specimens', sl.src);
      C.sub('🔬 Mikroskop – imersja ×1000', `<canvas id="mic" width="460" height="460" class="mic"></canvas>
        <div class="form"><label>Barwienie <select id="m-g"><option value="">—</option><option value="pos">Gram-dodatnie (fioletowe)</option><option value="neg">Gram-ujemne (różowe)</option><option value="yeast">Drożdżaki</option><option value="none">Nie stwierdzono drobnoustrojów</option></select></label>
        <label>Morfologia <select id="m-m"><option value="">—</option>${Object.entries(MORPH_PL).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label></div>
        <button class="btn" id="m-ok">Zapisz ocenę preparatu</button><div id="m-fb"></div>`);
      drawMicro($('#mic'), orgs, sl.id, sp && ['BROTH'].includes(sp.type));
      $('#m-ok').onclick = () => {
        const g = $('#m-g').value, m = $('#m-m').value; if (!g) return;
        const main = orgs[0] ? DB.ORG[orgs[0][0]] : null;
        const okG = main ? g === main.gram : g === 'none', okM = main ? m === main.morph : true;
        sl.read = (g === 'none' ? 'brak drobnoustrojów' : ({ pos: 'G(+)', neg: 'G(−)', yeast: 'drożdżaki' })[g] + ' ' + (MORPH_PL[m] || ''));
        const r = C.addResult({ kind: 'gram', icon: '🔬', title: `Preparat Grama ${sl.id}: ${sl.read}`, spec: sl.src, caseId: (sp || C.get('isolates', sl.src) || {}).caseId, data: { read: sl.read, correct: okG && okM, truth: main ? `${({ pos: 'G(+)', neg: 'G(−)', yeast: 'drożdżaki' })[main.gram]} ${MORPH_PL[main.morph]}` : 'brak' } });
        r.seen = true;
        $('#m-fb').innerHTML = `<p class="${okG && okM ? 'ok' : 'warn'}">${okG && okM ? '✓ Prawidłowa ocena!' : '✗ Prawidłowo: ' + r.data.truth}</p>`;
        if (okG && okM) { C.xp(25, 'preparat Grama'); C.ach('gram'); }
        if (sp && sp.type === 'BROTH' && okG) C.toast('📞 Wynik krytyczny przekazany lekarzowi oddziału (preparat z dodatniej butelki)', 'ok');
        C.save(); this.render();
      };
    }
  };
  C.handlers.gram = (j) => { const sl = C.get('slides', j.data.slide); if (sl) sl.stained = true; C.toast('🔬 Preparat wybarwiony – obejrzyj pod mikroskopem', 'ok'); C.beep(660, .1); };

  function drawMicro(cv, orgs, seed, blood) {
    const c = cv.getContext('2d'), r = C.rng(seed);
    const g = c.createRadialGradient(230, 230, 40, 230, 230, 240); g.addColorStop(0, '#fbeff2'); g.addColorStop(.85, '#f0d8e0'); g.addColorStop(1, '#222');
    c.fillStyle = g; c.fillRect(0, 0, 460, 460);
    if (blood) for (let i = 0; i < 60; i++) { c.fillStyle = 'rgba(230,150,170,.35)'; c.beginPath(); c.arc(r() * 460, r() * 460, 9 + r() * 3, 0, 7); c.fill(); }
    for (let i = 0; i < 25; i++) { c.fillStyle = 'rgba(200,120,150,.25)'; c.beginPath(); c.ellipse(r() * 460, r() * 460, 20 * r() + 5, 8 * r() + 3, r() * 3, 0, 7); c.fill(); }
    orgs.forEach(([oid], oi) => {
      const o = DB.ORG[oid]; const col = o.gram === 'neg' ? '#d4457c' : '#4a1f7d';
      const n = oi === 0 ? 70 : 30;
      for (let i = 0; i < n; i++) {
        const x = 40 + r() * 380, y = 40 + r() * 380; c.fillStyle = col; c.strokeStyle = col;
        if (Math.hypot(x - 230, y - 230) > 215) continue;
        const a = r() * Math.PI;
        if (o.morph === 'rods') { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); (c.roundRect ? c.roundRect(-7, -2.2, 14, 4.4, 2.2) : c.rect(-7, -2.2, 14, 4.4)); c.fill(); c.restore(); }
        else if (o.morph === 'coccobacilli') { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.ellipse(0, 0, 3.6, 2.4, 0, 0, 7); c.fill(); c.restore(); }
        else if (o.morph === 'cocci-clusters') { for (let k = 0; k < 7; k++) { c.beginPath(); c.arc(x + (r() - .5) * 12, y + (r() - .5) * 12, 2.6, 0, 7); c.fill(); } }
        else if (o.morph === 'cocci-chains') { for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(x + Math.cos(a) * k * 5.6 + Math.sin(k) * 1.5, y + Math.sin(a) * k * 5.6, 2.5, 0, 7); c.fill(); } }
        else if (o.morph === 'cocci-pairs') { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.ellipse(-3, 0, 3.2, 2.2, 0, 0, 7); c.ellipse(3.4, 0, 3.2, 2.2, 0, 0, 7); c.fill(); c.restore(); }
        else if (o.morph === 'diplococci') { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.arc(-2.8, 0, 2.8, Math.PI / 2, -Math.PI / 2); c.arc(2.8, 0, 2.8, -Math.PI / 2, Math.PI / 2); c.fill(); c.restore(); }
        else if (o.morph === 'yeast') { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.ellipse(0, 0, 6, 4.5, 0, 0, 7); c.fill(); if (r() > .5) { c.beginPath(); c.ellipse(7, 0, 3, 2.4, 0, 0, 7); c.fill(); } c.restore(); }
      }
    });
    c.strokeStyle = '#111'; c.lineWidth = 30; c.beginPath(); c.arc(230, 230, 244, 0, 7); c.stroke();
  }
})();
