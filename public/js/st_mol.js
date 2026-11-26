/* =========================================================================
   STANOWISKA: BacT/ALERT VIRTUO, BIOFIRE (TORCH/2.0/SPOTFIRE), VIDAS,
   MYLA (walidacja), QC, przemysł (TEMPO, GENE-UP)
   ========================================================================= */
(function () {
  const C = CORE, $ = C.$, $$ = C.$$, h = C.h, S = () => C.S;
  const qcBlock = () => S().settings.realistic && !C.qcDone();
  const qcMsg = '<div class="warn">⛔ Tryb realistyczny: wykonaj najpierw dzienną kontrolę jakości (stanowisko QC).</div>';

  /* ================= BacT/ALERT VIRTUO ================= */
  function curve(b, t) {
    const hrs = (t - b.t) / 60; const base = 1900 + (C.hash(b.id) % 200);
    if (!b.ttdH) return base + hrs * 2;
    const x = hrs - b.ttdH + 2;
    return base + hrs * 2 + 2600 / (1 + Math.exp(-x * 1.6));
  }
  STATIONS.virtuo = {
    open() { this.sel = this.sel || null; this.render(); }, refresh() { this.render(); },
    render() {
      const bs = S().bottles.filter(b => !b.archived);
      const loaded = bs.filter(b => b.status === 'loaded' || b.status === 'positive');
      const neu = bs.filter(b => b.status === 'new');
      const sel = this.sel && C.get('bottles', this.sel);
      C.modal('🍾 BacT/ALERT® VIRTUO® – posiewy krwi', `<div class="two"><div class="instr-view">${ART.svg('virtuo', { open: neu.length > 0, bottles: neu.map(b => DB.BOTTLES[b.type].cap), alarm: bs.some(b => b.status === 'positive') })}</div><div>
        ${qcBlock() ? qcMsg : ''}
        <h4>1. Butelki do załadowania</h4>
        ${neu.map(b => { const bt = DB.BOTTLES[b.type]; return `<div class="bottle-row"><span class="cap" style="background:${bt.cap}"></span><b>${b.id}</b> ${bt.name} <small>(${bt.desc})</small><br>
          Objętość krwi: <input type="range" min="0" max="${b.type === 'PF' ? 5 : 12}" step="0.5" value="${b.type === 'PF' ? 3 : 9}" data-vol="${b.id}"> <b id="vv-${b.id}">${b.type === 'PF' ? 3 : 9} mL</b> <span class="muted">zalecane ${bt.vol[0]}–${bt.vol[1]} mL</span>
          <button class="btn sm" data-load="${b.id}" ${qcBlock() ? 'disabled' : ''}>📷 Skanuj i załaduj</button></div>`; }).join('') || '<p class="muted">Brak – przyjmij posiew krwi w LIS.</p>'}
        <h4>2. W aparacie (${loaded.length}) · odczyt co 10 min · protokół 5 dni</h4>
        <div class="cells">${loaded.map(b => `<div class="cell ${b.status} ${this.sel === b.id ? 'sel' : ''}" data-b="${b.id}"><span class="cap" style="background:${DB.BOTTLES[b.type].cap}"></span>${b.id}<small>${b.status === 'positive' ? 'DODATNIA ' + b.ttdH.toFixed(1) + ' h' : C.dur(S().t - b.t)}</small></div>`).join('') || '<p class="muted">Pusto</p>'}</div>
        ${sel ? `<div class="bcurve"><b>${sel.id}</b> – ${DB.BOTTLES[sel.type].name} · krew ${sel.vol} mL ${sel.vol < DB.BOTTLES[sel.type].vol[0] ? '<span class="warnt">⚠ niedopełniona</span>' : ''}<canvas id="bc-cv" width="520" height="170"></canvas>
          ${sel.status === 'positive' ? `<button class="btn danger" id="bc-out">🚨 Wyjmij dodatnią butelkę (→ Gram, BCID2, posiew)</button>` : ''}</div>` : '<p class="muted">Kliknij butelkę, aby zobaczyć krzywą odczytu czujnika CO₂.</p>'}
        <h4>Archiwum</h4>${bs.filter(b => ['negative', 'removed'].includes(b.status)).map(b => `<div class="ti">${b.status === 'negative' ? '✅' : '🚨'} ${b.id} ${DB.BOTTLES[b.type].name} – ${b.status === 'negative' ? 'UJEMNA po 5 dniach' : 'dodatnia, TTD ' + b.ttdH.toFixed(1) + ' h'}</div>`).join('') || '<p class="muted">—</p>'}
        <div class="row"><button class="btn ghost" id="bc-next">⏩ Przewiń do następnego zdarzenia</button></div>
      </div></div>`, { wide: true, sub: 'Kolorymetryczny czujnik CO₂ · automatyczne ładowanie · pomiar objętości krwi' });
      $$('[data-vol]').forEach(r => r.oninput = () => { $('#vv-' + r.dataset.vol).textContent = r.value + ' mL'; });
      $$('[data-load]').forEach(b => b.onclick = () => this.load(b.dataset.load, +$(`[data-vol="${b.dataset.load}"]`).value));
      $$('[data-b]').forEach(e => e.onclick = () => { this.sel = e.dataset.b; const bb = C.get('bottles', this.sel); if (bb.status === 'positive') bb.ack = true; this.render(); });
      $('#bc-next').onclick = () => { C.skipToNext(); this.render(); };
      if (sel) this.drawCurve(sel);
      if ($('#bc-out')) $('#bc-out').onclick = () => this.remove(sel);
    },
    drawCurve(b) {
      const cv = $('#bc-cv'); const c = cv.getContext('2d'); const W = cv.width, H = cv.height;
      c.fillStyle = '#0f1c2b'; c.fillRect(0, 0, W, H);
      const tEnd = b.status === 'positive' ? b.t + b.ttdH * 60 + 60 : S().t; const span = Math.max(60, Math.max(tEnd, b.t + 24 * 60) - b.t);
      c.strokeStyle = '#223a55'; for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(30 + i * (W - 40) / 8, 8); c.lineTo(30 + i * (W - 40) / 8, H - 20); c.stroke(); }
      c.fillStyle = '#7fa6cf'; c.font = '10px Arial'; for (let i = 0; i <= 8; i += 2) c.fillText(Math.round(span / 60 * i / 8) + ' h', 24 + i * (W - 40) / 8, H - 6);
      c.strokeStyle = b.status === 'positive' ? '#ff5b5b' : '#5be37c'; c.lineWidth = 2; c.beginPath();
      for (let x = 0; x <= W - 40; x += 2) { const t = b.t + span * x / (W - 40); if (t > S().t) break; const v = curve(b, t); const y = H - 20 - (v - 1800) / 3000 * (H - 30); x ? c.lineTo(30 + x, y) : c.moveTo(30 + x, y); }
      c.stroke(); c.fillStyle = '#9fb8d6'; c.fillText('Odczyt czujnika (jedn. odbicia)', 34, 18);
    },
    load(id, vol) {
      const b = C.get('bottles', id); const sp = C.get('specimens', b.spec); const bt = DB.BOTTLES[b.type];
      b.vol = vol; b.t = S().t; b.status = 'loaded';
      let ttd = null;
      if (vol > 0 && sp.orgs.length) {
        const [oid] = sp.orgs[0]; const o = DB.ORG[oid]; const r = C.rng(b.id)();
        const strictAer = ['PAE', 'ABA'].includes(oid) || o.gram === 'yeast';
        if (b.type === 'MP') ttd = null;
        else if (!bt.aer && strictAer) ttd = o.gram === 'yeast' ? o.ttd * 2.2 : null;
        else ttd = o.ttd * (0.85 + r * 0.3) * (vol < bt.vol[0] ? 1 + (bt.vol[0] - vol) * 0.06 : 1);
      }
      if (vol < bt.vol[0]) C.toast(`⚠ VIRTUO: butelka ${id} niedopełniona (${vol} mL) – obniżona czułość posiewu`, 'warn');
      if (vol > bt.vol[1]) C.toast(`⚠ VIRTUO: butelka ${id} przepełniona (${vol} mL) – ryzyko fałszywie dodatniego wyniku`, 'warn');
      if (ttd && vol > bt.vol[1] + 1) ttd *= 0.9;
      b.ttdH = ttd;
      const j = C.job('bc', ttd ? ttd * 60 : 5 * 1440, { b: id }, 'VIRTUO – ' + id); j.st = 'virtuo';
      C.toast(`🍾 Załadowano ${id} – robot umieścił butelkę w komórce. Zmierzona objętość: ${vol} mL`, 'ok'); C.save(); this.render();
    },
    remove(b) {
      const sp = C.get('specimens', b.spec);
      const br = C.makeSpecimen(sp.caseId, { type: 'BROTH', label: `Dodatnia butelka ${b.id} (${DB.BOTTLES[b.type].name.replace('BacT/ALERT® ', '')})`, orgs: sp.orgs.map(([o, p]) => [o, p, 1e8]) });
      br.parent = b.id; b.status = 'removed'; b.ack = true;
      C.toast(`Utworzono próbkę ${br.id} z dodatniej butelki – wykonaj preparat Grama, BIOFIRE BCID2 i posiew na podłoża`, 'ok');
      C.save(); C.updateTray(); this.render();
    }
  };
  C.handlers.bc = (j) => {
    const b = C.get('bottles', j.data.b); if (!b || b.status !== 'loaded') return;
    const sp = C.get('specimens', b.spec);
    if (b.ttdH) {
      b.status = 'positive'; C.alarm(); C.toast(`🚨 VIRTUO: butelka ${b.id} DODATNIA po ${b.ttdH.toFixed(1)} h!`, 'alarm'); C.ach('first_bc'); C.xp(15, 'wykrycie dodatniej butelki');
      C.addResult({ kind: 'bc', icon: '🍾', title: `Posiew krwi ${b.id}: DODATNI (TTD ${b.ttdH.toFixed(1)} h)`, spec: b.spec, caseId: sp.caseId, data: { ttd: b.ttdH, bottle: b.type } });
    } else {
      b.status = 'negative'; C.toast(`✅ VIRTUO: butelka ${b.id} ujemna po 5 dniach`, 'info');
      C.addResult({ kind: 'bc', icon: '🍾', title: `Posiew krwi ${b.id}: UJEMNY po 5 dniach`, spec: b.spec, caseId: sp.caseId, data: { neg: true, bottle: b.type } });
    }
  };

  /* ================= BIOFIRE ================= */
  const PANEL_SPEC = { BCID2: ['BROTH'], RP21: ['NPS'], PN: ['BAL'], ME: ['CSF'], GI: ['STOOL'], JI: ['SYN'], RST: ['NPS'] };
  function detect(panelId, sp) {
    const P = DB.PANELS[panelId]; const all = Object.values(P.groups).flat(); const det = {};
    (sp.bf || []).forEach(t => { if (all.includes(t)) det[t] = true; });
    sp.orgs.forEach(([oid, ph, load]) => {
      let tg = (DB.BF_MAP[oid] || []).slice();
      if (panelId === 'ME' && oid === 'ECO') tg = ['Escherichia coli K1'];
      if (panelId === 'GI' && oid === 'SEN') tg = ['Salmonella'];
      if (panelId === 'JI' && oid === 'SEN') tg = ['Salmonella spp.'];
      if (panelId === 'JI' && /Candida/.test(DB.ORG[oid].name)) tg.push('Candida spp.');
      tg.forEach(t => { if (all.includes(t)) det[t] = P.semiQ ? (sp.bfq && sp.bfq[t]) || ('10^' + Math.max(4, Math.min(7, Math.round(Math.log10(load || 1e5))))) : true; });
      const genes = DB.ORG[oid].phenos[ph].genes;
      genes.forEach(g => { const tgt = DB.GENE_MAP[g]; if (tgt && all.includes(tgt)) det[tgt] = true; if (g === 'mecA/C' && all.includes('mecA/C')) det['mecA/C'] = true; });
      if (genes.includes('MREJ') && all.includes('mecA/C and MREJ (MRSA)')) det['mecA/C and MREJ (MRSA)'] = true;
    });
    if (sp.bfq) Object.entries(sp.bfq).forEach(([t, q]) => { if (all.includes(t)) det[t] = q; });
    return det;
  }
  function melt(cv, targets) {
    const c = cv.getContext('2d'), W = cv.width, H = cv.height;
    c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.strokeStyle = '#ddd';
    for (let i = 0; i <= 10; i++) { c.beginPath(); c.moveTo(30 + i * (W - 40) / 10, 5); c.lineTo(30 + i * (W - 40) / 10, H - 20); c.stroke(); }
    c.fillStyle = '#555'; c.font = '10px Arial'; for (let i = 0; i <= 10; i += 2) c.fillText((65 + i * 3) + '°C', 22 + i * (W - 40) / 10, H - 6);
    const cols = ['#e0442b', '#1e7fc2', '#2ecc71', '#8e44ad', '#f39c12', '#16a085'];
    targets.forEach((t, k) => {
      const tm = 76 + (C.hash(t) % 120) / 10; c.strokeStyle = cols[k % cols.length]; c.lineWidth = 2; c.beginPath();
      for (let x = 0; x <= W - 40; x++) { const T = 65 + x / (W - 40) * 30; const y = Math.exp(-((T - tm) ** 2) / 1.2); const py = H - 22 - y * (H - 40); x ? c.lineTo(30 + x, py) : c.moveTo(30 + x, py); }
      c.stroke(); c.fillStyle = cols[k % cols.length]; c.fillText(t.slice(0, 26) + ' Tm ' + tm.toFixed(1), 34, 16 + k * 12);
    });
    if (!targets.length) { c.fillStyle = '#888'; c.fillText('Brak produktów amplifikacji – tylko kontrole', W / 2 - 80, H / 2); }
  }
  function bfStation(kind) {
    return {
      open() { this.prep = this.prep || null; this.render(); }, refresh() { this.render(); },
      render() {
        const isSpot = kind === 'spot'; const panels = isSpot ? ['RST'] : ['BCID2', 'RP21', 'PN', 'ME', 'GI', 'JI'];
        const running = S().jobs.filter(j => !j.done && j.kind === (isSpot ? 'spot' : 'bf'));
        const specs = S().specimens.filter(s => !s.archived);
        const pr = this.prep;
        const res = S().results.filter(r => r.kind === (isSpot ? 'spot' : 'bf')).slice(0, 10);
        const art = isSpot ? ART.svg('spotfire', { progress: running[0] ? C.progress(running[0]) : 0, txt: running[0] ? 'ANALIZA…' : 'GOTOWY' }) : ART.svg('torch', { modules: [0, 1, 2, 3].map(i => running[i] ? { progress: C.progress(running[i]) } : 0) });
        C.modal(isSpot ? '⚡ BIOFIRE® SPOTFIRE® – PCR przy pacjencie' : '🧬 BIOFIRE® FILMARRAY® TORCH – syndromiczny multipleks PCR', `<div class="two"><div class="instr-view">${art}</div><div>
          ${qcBlock() ? qcMsg : ''}
          ${!pr ? `<div class="form"><label>Panel (kaseta) <select id="bf-p">${panels.map(p => `<option value="${p}">${DB.PANELS[p].name} · ~${DB.PANELS[p].time} min</option>`).join('')}</select></label>
            <label>Próbka <select id="bf-s">${specs.map(s => `<option value="${s.id}">${DB.SPEC_TYPES[s.type].icon} ${s.id} – ${h(s.label)}</option>`).join('') || '<option value="">— brak —</option>'}</select></label></div>
            <p class="muted" id="bf-info"></p><button class="btn" id="bf-start" ${qcBlock() ? 'disabled' : ''}>📦 Wyjmij kasetę i rozpocznij przygotowanie</button>` : `
            <p><b>${DB.PANELS[pr.panel].name}</b> · próbka ${pr.spec}</p>
            <div class="pouch">${this.pouchSvg(pr)}</div>
            <ol class="bfsteps">
              <li class="${pr.st.station ? 'ok' : ''}"><button class="btn sm" data-step="station">Umieść kasetę w stacji ładowania</button></li>
              <li class="${pr.st.hydr ? 'ok' : ''}"><button class="btn sm" data-step="hydr">💧 Nastrzyknij płyn hydratacyjny (niebieska fiolka)</button></li>
              <li class="${pr.st.buffer ? 'ok' : ''}"><button class="btn sm" data-step="buffer">🧪 Dodaj ${isSpot ? 'wymaz' : '0,2 mL próbki'} do buforu (Sample Buffer) i wymieszaj</button></li>
              <li class="${pr.st.sample ? 'ok' : ''}"><button class="btn sm" data-step="sample">💉 Nastrzyknij próbkę do portu próbki (czerwona)</button></li>
              <li class="${pr.st.scan ? 'ok' : ''}"><button class="btn sm" data-step="scan">📷 Zeskanuj kasetę i ID próbki</button></li>
            </ol>
            ${pr.errors.length ? `<div class="warn">${pr.errors.map(h).join('<br>')}</div>` : ''}
            <div class="row"><button class="btn" id="bf-run" ${running.length >= (isSpot ? 1 : 4) ? 'disabled' : ''}>▶ Włóż do ${isSpot ? 'aparatu' : 'wolnego modułu'} i uruchom</button><button class="btn ghost" id="bf-cancel">Odrzuć kasetę</button></div>`}
          <h4>Moduły</h4>${running.map((j, i) => `<div class="hjob"><span>Moduł ${i + 1}: ${DB.PANELS[j.data.panel].short} · ${j.data.spec}</span><i style="width:${C.progress(j) * 100}%"></i><em>${C.dur(j.end - S().t)}</em></div>`).join('') || '<p class="muted">Wszystkie wolne</p>'}
          <h4>Raporty</h4>${res.map(r => `<div class="ti res ${r.data.invalid ? 'warnbg' : ''}" data-r="${r.id}">🧬 <b>${h(r.title)}</b><small>${C.clock(r.t)}</small></div>`).join('') || '<p class="muted">Brak</p>'}
        </div></div>`, { wide: true, sub: isSpot ? 'Panel Respiratory/Sore Throat · wynik ~15 min' : 'Ekstrakcja → PCR1 multipleks → zagnieżdżony PCR2 → analiza krzywych topnienia' });
        if (!pr) {
          const info = () => { const p = $('#bf-p').value; $('#bf-info').innerHTML = `Materiał: ${DB.PANELS[p].sample}. Liczba celów: ${Object.values(DB.PANELS[p].groups).flat().length}.`; };
          $('#bf-p').onchange = info; info();
          $('#bf-start').onclick = () => { const s = $('#bf-s').value; if (!s) return C.toast('Brak próbki', 'warn'); this.prep = { panel: $('#bf-p').value, spec: s, st: {}, order: [], errors: [] }; this.render(); };
        } else {
          $$('[data-step]').forEach(b => b.onclick = () => {
            const st = b.dataset.step; pr.st[st] = true; pr.order.push(st);
            if (st === 'sample' && !pr.st.hydr) pr.errors.push('Próbka nastrzyknięta przed hydratacją – kaseta nie zassie próbki prawidłowo!');
            if (st === 'sample' && !pr.st.buffer) pr.errors.push('Nastrzyknięto bez wymieszania z buforem – brak kontroli procesu.');
            if (st === 'hydr' && !pr.st.station) pr.errors.push('Hydratacja poza stacją ładowania – ryzyko wycieku i kontaminacji.');
            C.beep(500, .04); this.render();
          });
          $('#bf-cancel').onclick = () => { this.prep = null; this.render(); };
          $('#bf-run').onclick = () => {
            const miss = ['hydr', 'buffer', 'sample'].filter(k => !pr.st[k]);
            if (miss.length) pr.errors.push('Kaseta nieprzygotowana – brakujące kroki: ' + miss.join(', '));
            if (!pr.st.scan) C.toast('Kaseta niezeskanowana – wpisano dane ręcznie', 'warn');
            const P = DB.PANELS[pr.panel]; const j = C.job(isSpot ? 'spot' : 'bf', P.time, { panel: pr.panel, spec: pr.spec, errors: pr.errors.slice() }, (isSpot ? 'SPOTFIRE – ' : 'BIOFIRE – ') + P.short); j.st = isSpot ? 'spotfire' : 'biofire';
            this.prep = null; C.save(); this.render();
          };
        }
        $$('[data-r]').forEach(e => e.onclick = () => this.report(e.dataset.r));
      },
      pouchSvg(pr) {
        return `<svg viewBox="0 0 360 90"><rect x="5" y="10" width="350" height="70" rx="6" fill="#f4f6f8" stroke="#99a"/>
          <rect x="15" y="20" width="70" height="50" rx="4" fill="${pr.st.hydr ? '#cfe8ff' : '#fff'}" stroke="#889"/>${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${28 + (i % 3) * 22}" cy="${34 + Math.floor(i / 3) * 22}" r="7" fill="${pr.st.sample ? '#f6c6c6' : '#eee'}" stroke="#999"/>`).join('')}
          <rect x="95" y="24" width="90" height="42" rx="4" fill="${pr.st.sample ? '#ffe6c4' : '#fff'}" stroke="#889"/><text x="140" y="48" font-size="9" text-anchor="middle">PCR1</text>
          <rect x="195" y="18" width="150" height="54" rx="4" fill="#fff" stroke="#889"/>${Array.from({ length: 30 }, (_, i) => `<rect x="${200 + (i % 10) * 14.5}" y="${22 + Math.floor(i / 10) * 16}" width="11" height="12" fill="${pr.st.sample ? '#fbe2e2' : '#f2f2f2'}" stroke="#bbb" stroke-width=".5"/>`).join('')}
          <circle cx="20" cy="85" r="4" fill="#2f7fd1"/><text x="28" y="88" font-size="7">hydratacja</text><circle cx="90" cy="85" r="4" fill="#d6242f"/><text x="98" y="88" font-size="7">próbka</text></svg>`;
      },
      report(id) {
        const r = C.get('results', id); r.seen = true; const d = r.data; const P = DB.PANELS[d.panel];
        C.sub('🧬 Raport ' + P.short + ' – ' + d.spec, `<p><b>${P.name}</b> · próbka ${d.spec} · czas ${P.time} min</p>
          ${d.invalid ? `<div class="warn"><b>WYNIK NIEWAŻNY (Invalid)</b><br>${d.errors.map(h).join('<br>')}</div>` : `
          <p>Kontrole wewnętrzne (RNA process control, PCR2 control): <b class="okt">ZALICZONE</b></p>
          ${Object.entries(P.groups).map(([g, ts]) => `<h4>${g}</h4><div class="bftargets">${ts.map(t => `<span class="${d.det[t] ? 'det' : ''}">${d.det[t] ? '● Wykryto' : '○ Nie wykryto'} – ${t}${typeof d.det[t] === 'string' ? ' <b>(' + d.det[t].replace('^', '<sup>') + '</sup> kopii/mL)</b>' : ''}</span>`).join('')}</div>`).join('')}
          <h4>Krzywe topnienia (wykryte cele)</h4><canvas id="melt" width="600" height="200"></canvas>`}`);
        if (!d.invalid) melt($('#melt'), Object.keys(d.det));
      }
    };
  }
  STATIONS.biofire = bfStation('bf'); STATIONS.spotfire = bfStation('spot');
  function bfDone(j, isSpot) {
    const d = j.data; const sp = C.get('specimens', d.spec); const P = DB.PANELS[d.panel];
    const okType = PANEL_SPEC[d.panel].includes(sp.type);
    const errs = d.errors.slice(); if (!okType) errs.push(`Materiał „${DB.SPEC_TYPES[sp.type].name}” nie jest walidowany dla panelu ${P.short} (wymagany: ${P.sample}).`);
    const invalid = errs.some(e => /przed hydratacją|nieprzygotowana|bez wymieszania/.test(e)) || !okType;
    const det = invalid ? {} : detect(d.panel, sp);
    const names = Object.keys(det);
    C.addResult({ kind: isSpot ? 'spot' : 'bf', icon: '🧬', title: `${P.short}: ${invalid ? 'NIEWAŻNY' : names.length ? 'Wykryto: ' + names.join(', ') : 'Nie wykryto żadnego celu'}`, spec: d.spec, caseId: sp.caseId, data: { panel: d.panel, spec: d.spec, det, invalid, errors: errs } });
    if (!invalid) { C.xp(30, 'panel ' + P.short); C.ach('first_bf'); if (names.some(n => ['KPC', 'NDM', 'OXA-48-like', 'VIM', 'IMP'].includes(n))) { C.ach('cpe'); C.toast('🚨 Wykryto gen karbapenemazy – powiadom lekarza i zespół kontroli zakażeń', 'alarm'); } if (names.includes('mecA/C and MREJ (MRSA)')) C.ach('mrsa'); if (names.includes('Candida auris')) C.ach('auris'); }
    C.toast(`🧬 ${isSpot ? 'SPOTFIRE' : 'BIOFIRE'}: raport ${P.short} gotowy`, invalid ? 'warn' : 'ok'); C.beep(800, .1);
  }
  C.handlers.bf = j => bfDone(j, false); C.handlers.spot = j => bfDone(j, true);

  /* ================= VIDAS ================= */
  const NORMAL = { PCT: 0.03, DD2: 260, TNHS: 3.2, NTBNP: 54, HIV: 0.06, TXG: 0.8, TXM: 0.08, TXA: 0, CMVG: 0.9, FER: 85, TSH: 1.7, HBS: 0.04, VITD: 27 };
  function rfv(a, v) { const A = DB.VIDAS[a]; return Math.round(60 + 9000 * (Math.log10(Math.max(A.min, v) + 1) / Math.log10(A.max + 1))); }
  STATIONS.vidas = {
    open() { this.render(); }, refresh() { this.render(); },
    render() {
      const running = S().jobs.filter(j => !j.done && j.kind === 'vidas');
      const specs = S().specimens.filter(s => !s.archived && ['SERUM', 'PLASMA', 'CSF'].includes(s.type));
      const sections = [0, 1, 2, 3].map(si => [0, 1, 2].map(pi => { const j = running.find(x => x.data.pos === si * 3 + pi); return j ? DB.VIDAS[j.data.assay].color : null; }));
      const free = [...Array(12).keys()].filter(i => !running.some(j => j.data.pos === i));
      const res = S().results.filter(r => r.kind === 'vidas' || r.kind === 'vcal').slice(0, 14);
      const calRow = Object.entries(DB.VIDAS).map(([k, a]) => { const age = C.day() - S().calib[k]; const ok = age <= 14; return `<tr><td>${a.name}</td><td>${a.time} min</td><td>${a.vol} µL</td><td class="${ok ? 'okt' : 'warnt'}">${ok ? 'ważna (' + (14 - age) + ' dni)' : 'PRZETERMINOWANA'}</td><td>${ok ? '' : `<button class="btn sm" data-cal="${k}">Kalibruj S1</button>`}</td></tr>`; }).join('');
      C.modal('🔬 VIDAS® 3 / mini VIDAS® – immunodiagnostyka ELFA', `<div class="two"><div class="instr-view">${ART.svg('vidas3', { sections, busy: running.length > 0 })}</div><div>
        ${qcBlock() ? qcMsg : ''}
        <div class="form"><label>Test <select id="vi-a">${Object.entries(DB.VIDAS).map(([k, a]) => `<option value="${k}">${a.name}</option>`).join('')}</select></label>
        <label>Próbka <select id="vi-s">${specs.map(s => `<option value="${s.id}">${DB.SPEC_TYPES[s.type].icon} ${s.id} – ${h(s.label)}</option>`).join('') || '<option value="">— brak surowicy/osocza —</option>'}</select></label>
        <label>Pozycja <select id="vi-p">${free.map(i => `<option value="${i}">Sekcja ${'ABCD'[Math.floor(i / 3)]} / poz. ${i % 3 + 1}</option>`).join('')}</select></label>
        <label>Objętość pipetowana (µL) <input id="vi-v" type="number" value="" placeholder="np. 200"></label></div>
        <p class="muted" id="vi-info"></p>
        <div class="row wrap"><label><input type="checkbox" id="vi-rt"> Zestaw w temp. pokojowej (30 min)</label><label><input type="checkbox" id="vi-spr" checked> Włożono pasek + stożek SPR®</label></div>
        <button class="btn" id="vi-go" ${!free.length || qcBlock() ? 'disabled' : ''}>▶ Uruchom oznaczenie</button>
        <h4>W toku</h4>${running.map(j => `<div class="hjob"><span>${'ABCD'[Math.floor(j.data.pos / 3)]}${j.data.pos % 3 + 1}: ${DB.VIDAS[j.data.assay].name.replace('VIDAS® ', '')}</span><i style="width:${C.progress(j) * 100}%"></i><em>${C.dur(j.end - S().t)}</em></div>`).join('') || '<p class="muted">—</p>'}
        <h4>Wyniki</h4>${res.map(r => `<div class="ti res ${r.data.err ? 'warnbg' : ''}" data-r="${r.id}">🔬 <b>${h(r.title)}</b><small>${C.clock(r.t)}</small></div>`).join('') || '<p class="muted">Brak</p>'}
        <details><summary>Kalibracje (MLE) – ważność 14 dni</summary><table class="tbl"><tr><th>Test</th><th>Czas</th><th>Obj.</th><th>Kalibracja</th><th></th></tr>${calRow}</table></details>
      </div></div>`, { wide: true, sub: 'Enzyme Linked Fluorescent Assay · SPR® · odczyt 450 nm' });
      const info = () => { const a = DB.VIDAS[$('#vi-a').value]; $('#vi-info').innerHTML = `${a.sample} · wymagane <b>${a.vol} µL</b> · czas ${a.time} min · zakres ${a.min}–${a.max} ${a.unit} · wartość odcięcia: ${a.ref}`; };
      $('#vi-a').onchange = info; info();
      $$('[data-cal]').forEach(b => b.onclick = () => { const j = C.job('vcal', DB.VIDAS[b.dataset.cal].time + 5, { assay: b.dataset.cal }, 'VIDAS – kalibracja'); j.st = 'vidas'; C.toast('Kalibracja S1 w duplikacie rozpoczęta', 'info'); this.render(); });
      $('#vi-go').onclick = () => {
        const s = $('#vi-s').value; if (!s) return C.toast('Brak próbki', 'warn');
        const vol = +$('#vi-v').value; if (!vol) return C.toast('Wpisz objętość pipetowanej próbki', 'warn');
        const a = $('#vi-a').value; const j = C.job('vidas', DB.VIDAS[a].time, { assay: a, spec: s, pos: +$('#vi-p').value, vol, rt: $('#vi-rt').checked, spr: $('#vi-spr').checked }, 'VIDAS – ' + a); j.st = 'vidas'; C.save(); this.render();
      };
      $$('[data-r]').forEach(e => e.onclick = () => this.report(e.dataset.r));
    },
    report(id) {
      const r = C.get('results', id); r.seen = true; const d = r.data; const A = DB.VIDAS[d.assay];
      C.sub('🔬 Raport VIDAS – ' + A.name, `${d.err ? `<div class="warn">${h(d.err)}</div>` : `<h3>${d.disp} ${A.unit}</h3><p><b>Interpretacja:</b> ${h(A.interp(d.value))}</p><p>RFV: ${d.rfv} · Zakres referencyjny/odcięcie: ${A.ref}</p>`}
        <canvas id="vk" width="560" height="180"></canvas><p class="muted">Kinetyka fluorescencji (4-MU, 450 nm) w stożku SPR® podczas odczytu substratu.</p>`);
      const c = $('#vk').getContext('2d'); c.fillStyle = '#101820'; c.fillRect(0, 0, 560, 180); c.strokeStyle = '#ffb347'; c.lineWidth = 2; c.beginPath();
      for (let x = 0; x < 520; x++) { const y = 160 - (d.rfv || 50) / 9500 * 140 * (1 - Math.exp(-x / 120)); x ? c.lineTo(20 + x, y) : c.moveTo(20, y); } c.stroke();
    }
  };
  C.handlers.vcal = j => { S().calib[j.data.assay] = C.day(); C.toast('✓ Kalibracja VIDAS zatwierdzona: ' + j.data.assay, 'ok'); C.addResult({ kind: 'vcal', icon: '📈', title: 'Kalibracja ' + DB.VIDAS[j.data.assay].name + ': ZATWIERDZONA', data: { assay: j.data.assay } }).seen = true; C.xp(10, 'kalibracja'); };
  C.handlers.vidas = j => {
    const d = j.data, A = DB.VIDAS[d.assay], sp = C.get('specimens', d.spec);
    let err = null;
    if (C.day() - S().calib[d.assay] > 14) err = 'Kalibracja przeterminowana – wynik NIEWAŻNY. Wykonaj kalibrację S1.';
    else if (!d.spr) err = 'Brak stożka SPR® w pozycji – test przerwany.';
    else if (d.vol < A.vol * 0.9) err = `Niewystarczająca objętość próbki (${d.vol} µL, wymagane ${A.vol} µL) – błąd aspiracji.`;
    let v = sp.vidas[d.assay] != null ? sp.vidas[d.assay] : NORMAL[d.assay] * (0.8 + C.rng(sp.id + d.assay)() * 0.4);
    if (!d.rt) v *= 0.93;
    const disp = v < A.min ? '< ' + A.min : v > A.max ? '> ' + A.max : (v < 1 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.round(v));
    C.addResult({ kind: 'vidas', icon: '🔬', title: `${A.name.replace('VIDAS® ', '')}: ${err ? 'BŁĄD' : disp + ' ' + A.unit}`, spec: d.spec, caseId: sp.caseId, data: { assay: d.assay, value: v, disp, rfv: rfv(d.assay, v), err } });
    if (!err) { C.xp(15, 'oznaczenie VIDAS'); C.ach('first_vidas'); if (!d.rt) C.toast('Uwaga: zestaw nie był ogrzany do temperatury pokojowej – wynik może być zaniżony', 'warn'); }
    C.toast('🔬 VIDAS: wynik ' + d.assay, err ? 'warn' : 'ok');
  };

  /* ================= MYLA – walidacja ================= */
  const MECH = ['Fenotyp dziki / brak mechanizmu', 'ESBL', 'AmpC (zdereprymowana)', 'Karbapenemaza KPC', 'Karbapenemaza OXA-48', 'Karbapenemaza MBL (NDM/VIM)', 'Karbapenemaza OXA-23 (CRAB)', 'Metycylinooporność (mecA)', 'VRE (vanA)', 'Nieenzymatyczna (OprD/efflux)', 'Zmienione PBP (PNSP)', 'Oporność na azole'];
  const PH2MECH = { ESBL: 'ESBL', NDM: 'Karbapenemaza MBL (NDM/VIM)', VIM: 'Karbapenemaza MBL (NDM/VIM)', KPC: 'Karbapenemaza KPC', OXA48: 'Karbapenemaza OXA-48', AMPC: 'AmpC (zdereprymowana)', MDR: 'Nieenzymatyczna (OprD/efflux)', CRAB: 'Karbapenemaza OXA-23 (CRAB)', MRSA: 'Metycylinooporność (mecA)', MRSE: 'Metycylinooporność (mecA)', VRE: 'VRE (vanA)', PNSP: 'Zmienione PBP (PNSP)' };
  const CASEQ = {
    C06: ['Rozpoznanie na podstawie RP2.1:', ['Grypa A(H1N1)pdm09', 'COVID-19', 'Zakażenie RSV', 'Krztusiec'], 0],
    C07: ['Wykryte patogeny jelitowe:', ['Salmonella + Campylobacter (koinfekcja)', 'Tylko norowirus', 'C. difficile', 'Brak patogenów'], 0],
    C09: ['Interpretacja wyników VIDAS:', ['D-dimer > 500 – ZTP nie można wykluczyć; TnI i NT-proBNP podwyższone (obciążenie prawej komory)', 'Wszystkie wyniki w normie', 'D-dimer wyklucza ZTP', 'Wynik HIV dodatni'], 0],
    C10: ['Interpretacja serologii toksoplazmozy:', ['IgG+ IgM+ niska awidność – nie można wykluczyć świeżego zakażenia (ryzyko dla płodu)', 'Brak odporności – seronegatywna', 'Zakażenie przebyte dawno temu', 'Wynik fałszywie dodatni – nie wymaga działań'], 0]
  };
  STATIONS.myla = {
    open() { this.render(); }, refresh() { this.render(); },
    render() {
      const act = Object.entries(S().cases).filter(([k, v]) => !v.done);
      const unassigned = S().results.filter(r => !r.caseId).length;
      C.modal('💻 MYLA® – walidacja i raportowanie wyników', `
        <p class="muted">Wyniki ze wszystkich aparatów trafiają do MYLA. Sprawdź spójność (identyfikacja vs. lekowrażliwość vs. PCR), uzupełnij interpretację i zatwierdź raport dla lekarza.</p>
        ${act.map(([id, st]) => { const cs = DB.CASES.find(c => c.id === id); const rs = S().results.filter(r => r.caseId === id); return `<div class="case active"><div class="case-h"><b>${id} · ${h(cs.title)}</b><button class="btn sm" data-val="${id}">✍️ Waliduj i wyślij raport</button></div>
          <div class="case-p">👤 ${h(cs.patient)} · ${h(cs.ward)} · próbki ${st.specs.join(', ')}</div>
          ${rs.map(r => `<div class="ti">${r.icon} ${h(r.title)} <small>${C.clock(r.t)}</small></div>`).join('') || '<p class="muted">Brak wyników</p>'}</div>`; }).join('') || '<p>Brak aktywnych przypadków. Przyjmij zlecenie w Rejestracji (LIS).</p>'}
        ${unassigned ? `<details><summary>Wyniki z trybu swobodnego (${unassigned})</summary>${S().results.filter(r => !r.caseId).slice(0, 40).map(r => `<div class="ti">${r.icon} ${h(r.title)} <small>${C.clock(r.t)}</small></div>`).join('')}</details>` : ''}
        <h4>Zakończone przypadki</h4>${S().reports.map(rp => `<div class="ti">📄 <b>${rp.case}</b> ${h(rp.title)} – <b>${rp.score}%</b> <button class="btn sm ghost" data-rep="${rp.case}">Raport</button></div>`).join('') || '<p class="muted">—</p>'}`, { wide: true, sub: 'Middleware mikrobiologiczne · walidacja techniczna i medyczna' });
      $$('[data-val]').forEach(b => b.onclick = () => this.validate(b.dataset.val));
      $$('[data-rep]').forEach(b => b.onclick = () => { const rp = S().reports.find(x => x.case === b.dataset.rep); C.sub('📄 Raport ' + rp.case, rp.html + '<button class="btn sm ghost" onclick="window.print()">🖨️ Drukuj</button>'); });
    },
    validate(id) {
      const cs = DB.CASES.find(c => c.id === id);
      const orgs = [...new Set(cs.specimens.flatMap(s => (s.orgs || []).map(o => o[0])))];
      const q = CASEQ[id];
      C.sub('✍️ Walidacja ' + id + ' – ' + h(cs.title), `
        ${orgs.length ? `<p><b>Zidentyfikowane drobnoustroje</b> (zaznacz wszystkie istotne):</p><div class="checks">${Object.entries(DB.ORG).map(([k, o]) => `<label><input type="checkbox" name="org" value="${k}"> <i>${o.name}</i></label>`).join('')}</div>
        <p><b>Mechanizmy oporności:</b></p><div class="checks">${MECH.map(m => `<label><input type="checkbox" name="mech" value="${m}"> ${m}</label>`).join('')}</div>` : ''}
        ${q ? `<p><b>${q[0]}</b></p>${q[1].map((o, i) => `<label class="radio"><input type="radio" name="cq" value="${i}"> ${o}</label>`).join('')}` : ''}
        <label><input type="checkbox" id="mv-call"> 📞 Wynik krytyczny przekazany telefonicznie lekarzowi (data, godzina, osoba)</label>
        <label>Komentarz do raportu <textarea id="mv-com" rows="2" placeholder="np. Szczep ESBL – zalecana izolacja kontaktowa"></textarea></label>
        <button class="btn" id="mv-ok">✅ Zatwierdź i wyślij</button>`);
      $('#mv-ok').onclick = () => this.score(id, orgs, q);
    },
    score(id, orgs, q) {
      const cs = DB.CASES.find(c => c.id === id); const rs = S().results.filter(r => r.caseId === id);
      const selOrg = $$('input[name=org]:checked').map(i => i.value), selMech = $$('input[name=mech]:checked').map(i => i.value);
      let pts = 0, max = 0; const notes = [];
      if (orgs.length) {
        max += 40; const truthMech = [...new Set(cs.specimens.flatMap(s => (s.orgs || []).map(o => PH2MECH[o[1]] || MECH[0])))];
        const hit = orgs.filter(o => selOrg.includes(o)).length, extra = selOrg.filter(o => !orgs.includes(o)).length;
        const evid = orgs.filter(o => rs.some(r => (r.data && r.data.org === o) || (r.kind === 'bf' && Object.keys(r.data.det || {}).some(t => (DB.BF_MAP[o] || []).slice(-1).includes(t)))));
        const orgPts = Math.max(0, (hit - extra) / orgs.length) * 40 * (evid.length >= hit ? 1 : 0.5);
        pts += orgPts; notes.push(`Identyfikacja: ${hit}/${orgs.length} poprawnie${extra ? ', ' + extra + ' błędnie zaznaczonych' : ''}${evid.length < hit ? ' (część bez potwierdzenia aparatowego – ½ pkt)' : ''}. Prawidłowo: ${orgs.map(o => DB.ORG[o].name).join(', ')}.`);
        max += 25; const mh = truthMech.filter(m => selMech.includes(m)).length, mx = selMech.filter(m => !truthMech.includes(m)).length;
        pts += Math.max(0, (mh - mx) / truthMech.length) * 25; notes.push(`Mechanizmy: prawidłowo ${truthMech.join(', ')}.`);
        max += 20; const ast = rs.some(r => r.kind === 'v2' && r.data.mics && !r.data.err && orgs.includes(r.data.org)) || rs.some(r => r.kind === 'etest');
        if (ast) pts += 20; notes.push(ast ? 'Lekowrażliwość wykonana ✓' : 'Brak prawidłowego oznaczenia lekowrażliwości (VITEK 2 / ETEST).');
      }
      const vidasNeed = cs.specimens.flatMap(s => Object.keys(s.vidas || {}));
      if (vidasNeed.length) { max += 20; const got = vidasNeed.filter(a => rs.some(r => r.kind === 'vidas' && r.data.assay === a && !r.data.err)); pts += got.length / vidasNeed.length * 20; notes.push(`Oznaczenia VIDAS: ${got.length}/${vidasNeed.length} (${vidasNeed.join(', ')}).`); }
      const bfNeed = cs.specimens.some(s => s.bf && s.bf.length);
      if (bfNeed) { max += 25; const ok = rs.some(r => (r.kind === 'bf' || r.kind === 'spot') && !r.data.invalid && Object.keys(r.data.det).length); if (ok) pts += 25; notes.push(ok ? 'Panel BIOFIRE wykonany ✓' : 'Brak ważnego wyniku panelu BIOFIRE.'); }
      if (q) { max += 25; const a = ($$('input[name=cq]:checked')[0] || {}).value; if (+a === q[2]) pts += 25; notes.push(+a === q[2] ? 'Interpretacja kliniczna prawidłowa ✓' : 'Interpretacja: prawidłowo – ' + q[1][q[2]]); }
      const critical = cs.specimens.some(s => ['BLOOD', 'CSF'].includes(s.type)) || orgs.some(o => ['CAU', 'NME'].includes(o));
      if (critical) { max += 10; if ($('#mv-call').checked) pts += 10; notes.push($('#mv-call').checked ? 'Wynik krytyczny zgłoszony ✓' : 'Nie zgłoszono wyniku krytycznego (krew/PMR/patogen alarmowy)!'); }
      const tat = (S().t - S().cases[id].t) / 60;
      const score = Math.round(pts / Math.max(1, max) * 100);
      S().cases[id].done = true; S().cases[id].score = score; S().player.cases++;
      rs.forEach(r => r.validated = true);
      const html = `<div class="report"><h3>Laboratorium Mikrobiologii – Wirtualne Laboratorium</h3><p><b>Pacjent:</b> ${h(cs.patient)} · <b>Oddział:</b> ${h(cs.ward)}</p><p><b>Rozpoznanie kliniczne:</b> ${h(cs.clin)}</p>
        <h4>Wyniki</h4>${rs.map(r => `<div>${r.icon} ${h(r.title)}</div>`).join('')}
        <h4>Komentarz</h4><p>${h($('#mv-com').value || '—')}</p><p>Walidował: ${h(S().player.name)} · ${C.clock()} · TAT ${tat.toFixed(1)} h</p>
        <h4>Ocena</h4><ul>${notes.map(n => `<li>${h(n)}</li>`).join('')}</ul><h2>${score}%</h2></div>`;
      S().reports.unshift({ case: id, title: cs.title, score, html });
      C.xp(Math.round(score * 2 + (tat < 24 ? 30 : 0)), 'zakończenie przypadku ' + id);
      C.ach('first_case'); if (score === 100) C.ach('perfect'); if (S().player.cases >= 5) C.ach('five'); if (Object.values(S().cases).filter(c => c.done).length >= DB.CASES.length) C.ach('all');
      C.save(); C.sub('📄 Raport wysłany – ' + id, html); this.render();
    }
  };

  /* ================= QC ================= */
  STATIONS.qc = {
    open() { if (S().qc.day !== C.day()) S().qc = { day: C.day(), done: {} }; this.render(); }, refresh() { this.render(); },
    render() {
      const q = S().qc, r = C.rng('qc' + C.day());
      const dens = [[0, -0.05, 0.05], [0.5, 0.44, 0.56], [2.0, 1.85, 2.15], [3.0, 2.8, 3.2]].map(([n, lo, hi], i) => { const bad = i === 3 && r() < .25; const v = Math.round((n + (r() - .5) * (bad ? 0.6 : 0.08)) * 100) / 100; return { n, lo, hi, v, ok: v >= lo && v <= hi }; });
      this.dens = dens;
      const lj = Array.from({ length: 20 }, () => 0.52 + (r() + r() + r() - 1.5) * 0.04); const today = r() < .3 ? 0.52 + 0.04 * (3.2 + r()) : 0.52 + (r() - .5) * 0.05; this.lj = { lj, today, ok: Math.abs(today - 0.52) <= 0.08 };
      const task = (k, title, body) => `<div class="qcbox ${q.done[k] ? 'done' : ''}"><h4>${q.done[k] ? '✅' : '⬜'} ${title}</h4>${body}</div>`;
      C.modal('✅ Kontrola jakości – dzień ' + C.day(), `<p class="muted">Codzienna kontrola jakości przed rozpoczęciem pracy. Oceń wyniki i zdecyduj: akceptacja lub odrzucenie (działanie korygujące).</p>
        ${task('densi', 'DENSICHEK® – weryfikacja wzorcami McFarland', `<table class="tbl"><tr><th>Wzorzec</th><th>Odczyt</th><th>Zakres</th></tr>${dens.map(d => `<tr><td>${d.n.toFixed(1)} McF</td><td>${d.v.toFixed(2)}</td><td>${d.lo.toFixed(2)}–${d.hi.toFixed(2)}</td></tr>`).join('')}</table><div class="row"><button class="btn sm" data-qc="densi:1">Akceptuj</button><button class="btn sm ghost" data-qc="densi:0">Odrzuć – rekalibracja</button></div>`)}
        ${task('ms', 'VITEK® MS PRIME – kalibracja E. coli ATCC 8739', `<p>Akwizycja kalibrantu na polach C tarczki QC. Błąd masy: ${(r() * 120 + 80).toFixed(0)} ppm (limit 500 ppm).</p><button class="btn sm" data-qc="ms:1">Akceptuj kalibrację</button>`)}
        ${task('vidas', 'VIDAS® – kontrola C1 (B·R·A·H·M·S PCT), karta Levey-Jenningsa', `<canvas id="lj" width="560" height="160"></canvas><p class="muted">Średnia 0,52 ng/mL, SD 0,04. Reguły Westgarda: 1₂s – ostrzeżenie, 1₃s – odrzucenie.</p><div class="row"><button class="btn sm" data-qc="vidas:1">Akceptuj serię</button><button class="btn sm ghost" data-qc="vidas:0">Odrzuć – powtórz kontrolę</button></div>`)}
        ${task('bf', 'BIOFIRE® – kontrole zewnętrzne (dodatnia/ujemna)', `<p>Kontrola dodatnia: wszystkie cele wykryte · Kontrola ujemna: brak wykrytych celów.</p><button class="btn sm" data-qc="bf:1">Akceptuj</button>`)}
        ${task('virtuo', 'BacT/ALERT® VIRTUO® – kontrola systemu', `<p>Temperatura komór: ${(35.5 + r() * 0.6).toFixed(1)} °C (35–37 °C) · test kalibracji czujników: OK · Wolne komórki: ${200 + Math.floor(r() * 150)}</p><button class="btn sm" data-qc="virtuo:1">Potwierdź</button>`)}
        <div class="tip">VITEK 2: szczepy wzorcowe QC (np. E. coli ATCC 25922, S. aureus ATCC 29213, P. aeruginosa ATCC 27853) wg harmonogramu serii kart.</div>`, { wide: true, sub: C.qcDone() ? 'Wszystkie kontrole zaliczone ✓' : 'Wymagane działania' });
      const c = $('#lj').getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, 560, 160);
      const y = v => 80 - (v - 0.52) / 0.04 * 20;
      [[-3, '#e53935'], [-2, '#f39c12'], [0, '#2e7d32'], [2, '#f39c12'], [3, '#e53935']].forEach(([s, col]) => { c.strokeStyle = col; c.setLineDash(s ? [4, 3] : []); c.beginPath(); c.moveTo(30, 80 - s * 20); c.lineTo(550, 80 - s * 20); c.stroke(); c.fillStyle = col; c.fillText((s > 0 ? '+' : '') + s + 'SD', 2, 83 - s * 20); });
      c.setLineDash([]); c.strokeStyle = '#1e7fc2'; c.beginPath(); lj.concat([today]).forEach((v, i) => { const X = 40 + i * 24; i ? c.lineTo(X, y(v)) : c.moveTo(X, y(v)); }); c.stroke();
      lj.concat([today]).forEach((v, i) => { c.fillStyle = i === 20 ? '#e53935' : '#1e7fc2'; c.beginPath(); c.arc(40 + i * 24, y(v), i === 20 ? 5 : 3, 0, 7); c.fill(); });
      $$('[data-qc]').forEach(b => b.onclick = () => {
        const [k, acc] = b.dataset.qc.split(':'); const correct = k === 'densi' ? (+acc === (this.dens.every(d => d.ok) ? 1 : 0)) : k === 'vidas' ? (+acc === (this.lj.ok ? 1 : 0)) : true;
        if (correct) { q.done[k] = true; C.xp(10, 'QC ' + k); } else { C.toast(+acc ? '✗ Wynik poza zakresem – nie wolno akceptować! Wykonaj działanie korygujące.' : '✗ Wyniki były w zakresie – niepotrzebne odrzucenie.', 'warn'); if (!+acc) { q.done[k] = true; } }
        if (!+acc && correct) C.toast('✓ Prawidłowo odrzucono. Działanie korygujące wykonane, powtórzona kontrola w zakresie.', 'ok');
        if (C.qcDone()) C.ach('qc'); C.save(); C.updateHud(); this.render();
      });
    }
  };

  /* ================= PRZEMYSŁ: TEMPO + GENE-UP ================= */
  const FOODS = { MIESO: ['Mięso mielone wieprzowe', { TVC: 5.2e5, EB: 3.1e3, EC: 120, STA: 40, YM: 800 }, { SAL: true, LIS: false, STEC: false }], MLEKO: ['Mleko pasteryzowane', { TVC: 2.4e3, EB: 0, EC: 0, STA: 0, YM: 10 }, { SAL: false, LIS: false, STEC: false }], SALATKA: ['Sałatka gotowa do spożycia', { TVC: 8.6e4, EB: 940, EC: 8, STA: 0, YM: 2.2e3 }, { SAL: false, LIS: true, STEC: false }], SER: ['Ser z mleka niepasteryzowanego', { TVC: 2.0e6, EB: 1.4e4, EC: 600, STA: 1500, YM: 3.0e3 }, { SAL: false, LIS: true, STEC: true }], SWAB: ['Wymaz środowiskowy (linia produkcyjna)', { TVC: 300, EB: 10, EC: 0, STA: 0, YM: 50 }, { SAL: false, LIS: true, STEC: false }] };
  const TPAR = { TVC: ['TEMPO® AC – ogólna liczba drobnoustrojów', 1e5, 40], EB: ['TEMPO® EB – Enterobacteriaceae', 1e3, 24], EC: ['TEMPO® EC – E. coli', 100, 24], STA: ['TEMPO® STA – S. aureus koagulazo+', 100, 24], YM: ['TEMPO® YM – drożdże i pleśnie', 1e3, 72] };
  const GTG = { SAL: ['GENE-UP® Salmonella', 'w 25 g nieobecna'], LIS: ['GENE-UP® Listeria monocytogenes', 'w 25 g nieobecna (RTE)'], STEC: ['GENE-UP® STEC (stx/eae)', 'nieobecne'] };
  STATIONS.industry = {
    open() { this.render(); }, refresh() { this.render(); },
    render() {
      const res = S().results.filter(r => r.kind === 'tempo' || r.kind === 'geneup').slice(0, 14);
      C.modal('🏭 Laboratorium przemysłowe – TEMPO® i GENE-UP®', `<div class="two"><div class="instr-view">${ART.svg('tempo')}${ART.svg('geneup')}</div><div>
        <h4>TEMPO® – oznaczanie liczby drobnoustrojów (NPL/MPN)</h4>
        <div class="form"><label>Próbka <select id="t-f">${Object.entries(FOODS).map(([k, f]) => `<option value="${k}">${f[0]}</option>`).join('')}</select></label><label>Parametr <select id="t-p">${Object.entries(TPAR).map(([k, p]) => `<option value="${k}">${p[0]} (${p[2]} h)</option>`).join('')}</select></label></div>
        <button class="btn" id="t-go">▶ Homogenizuj 1:10, napełnij kartę i inkubuj</button>
        <h4>GENE-UP® – PCR patogenów</h4>
        <div class="form"><label>Próbka <select id="g-f">${Object.entries(FOODS).map(([k, f]) => `<option value="${k}">${f[0]}</option>`).join('')}</select></label><label>Cel <select id="g-t">${Object.entries(GTG).map(([k, g]) => `<option value="${k}">${g[0]}</option>`).join('')}</select></label></div>
        <button class="btn" id="g-go">▶ Namnażanie 20 h + PCR</button>
        <h4>Wyniki</h4>${res.map(r => `<div class="ti">${r.icon} ${h(r.title)} <small>${C.clock(r.t)}</small></div>`).join('') || '<p class="muted">Brak</p>'}
      </div></div>`, { wide: true, sub: 'Mikrobiologia żywności i kontrola środowiska produkcji' });
      $('#t-go').onclick = () => { const f = $('#t-f').value, p = $('#t-p').value; const j = C.job('tempo', TPAR[p][2] * 60, { f, p }, 'TEMPO – ' + p); j.st = 'industry'; this.render(); };
      $('#g-go').onclick = () => { const f = $('#g-f').value, t = $('#g-t').value; const j = C.job('geneup', 21 * 60, { f, t }, 'GENE-UP – ' + t); j.st = 'industry'; this.render(); };
    }
  };
  C.handlers.tempo = j => {
    const f = FOODS[j.data.f], p = TPAR[j.data.p]; const v = f[1][j.data.p] * (0.8 + C.rng(j.id)() * 0.4);
    const wells = Math.min(48, Math.round(Math.log10(v + 1) * 9)); const ok = v <= p[1];
    C.addResult({ kind: 'tempo', icon: '🏭', title: `${p[0].split(' – ')[0]} ${f[0]}: ${v < 1 ? '< 1' : v.toExponential(1)} jtk/g (${wells}/48 studz. +) – ${ok ? 'ZGODNE' : 'NIEZGODNE'} z limitem ${p[1].toExponential(0)}`, data: {} }).seen = false;
    C.xp(10, 'TEMPO'); C.toast('🏭 TEMPO: wynik gotowy', 'ok');
  };
  C.handlers.geneup = j => {
    const f = FOODS[j.data.f], g = GTG[j.data.t]; const det = f[2][j.data.t];
    C.addResult({ kind: 'geneup', icon: '🧬', title: `${g[0]} – ${f[0]}: ${det ? 'WYKRYTO (Ct ' + (24 + C.rng(j.id)() * 8).toFixed(1) + ') → potwierdź hodowlą/VITEK MS' : 'NIE WYKRYTO'} · kryterium: ${g[1]}`, data: {} });
    C.xp(10, 'GENE-UP'); C.toast('🧬 GENE-UP: wynik gotowy', det ? 'warn' : 'ok');
  };
})();
