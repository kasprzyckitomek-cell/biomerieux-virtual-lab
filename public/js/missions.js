/* =========================================================================
   PLAN PRACY – lista kroków dla każdego przyjętego zlecenia (auto-odhaczanie)
   ========================================================================= */
(function () {
  const C = CORE, $ = C.$, $$ = C.$$, h = C.h, S = () => C.S;
  const PANEL_FOR = { CSF: 'ME', STOOL: 'GI', BAL: 'PN', SYN: 'JI', NPS: 'RP21' };

  function steps(caseId) {
    const st = S().cases[caseId]; const out = [];
    const R = S().results.filter(r => r.caseId === caseId);
    const has = f => R.some(f);
    const cultureSteps = (srcIds, label) => {
      const plates = S().plates.filter(p => srcIds.includes(p.src));
      const isos = S().isolates.filter(i => srcIds.includes(i.spec));
      const isoIds = isos.map(i => i.id);
      out.push({ t: `Posiej ${label} na podłoża (PREVI Isola lub komora laminarna)`, st: 'isola', done: plates.length > 0 });
      out.push({ t: 'Inkubuj min. 18 h (przyspiesz czas) i oceń płytkę w cieplarce', st: 'incubator', done: plates.some(p => p.read) });
      out.push({ t: 'Kliknij izolowaną kolonię na płytce, aby pobrać izolat', st: 'incubator', done: isos.length > 0 });
      out.push({ t: 'Przygotuj zawiesinę w DENSICHEK (właściwy zakres McFarland)', st: 'densichek', done: S().susp.some(s => isoIds.includes(s.iso)) });
      out.push({ t: 'Identyfikacja: VITEK MS PRIME (lub VITEK 2 ID / API 20 E)', st: 'vitekms', done: has(r => (r.kind === 'ms' && r.data.ok) || (r.kind === 'v2' && r.data.type === 'ID' && r.data.org) || (r.kind === 'api' && r.data.org)) });
      out.push({ t: 'Lekowrażliwość: karta AST w VITEK 2 (lub ETEST)', st: 'vitek2', done: has(r => (r.kind === 'v2' && r.data.mics && !r.data.err) || r.kind === 'etest') });
    };
    st.specs.forEach(sid => {
      const sp = C.get('specimens', sid); if (!sp) return;
      if (sp.type === 'BLOOD') {
        const bots = S().bottles.filter(b => b.spec === sid);
        const broths = S().specimens.filter(s => s.type === 'BROTH' && bots.some(b => b.id === s.parent)).map(s => s.id);
        out.push({ h: `🩸 ${sid} – posiew krwi` });
        out.push({ t: 'Ustaw objętość krwi i załaduj butelki do BacT/ALERT VIRTUO', st: 'virtuo', done: bots.length > 0 && bots.every(b => b.status !== 'new') });
        out.push({ t: 'Poczekaj na alarm (⏭) i wyjmij dodatnią butelkę', st: 'virtuo', done: broths.length > 0 || bots.some(b => b.status === 'negative') });
        if (sp.orgs.length) {
          out.push({ t: 'Preparat Grama z dodatniej butelki (PREVI Color Gram + mikroskop)', st: 'gram', done: has(r => r.kind === 'gram') });
          out.push({ t: 'BIOFIRE BCID2 z dodatniej butelki', st: 'biofire', done: has(r => r.kind === 'bf' && r.data.panel === 'BCID2' && !r.data.invalid) });
          cultureSteps(broths, 'dodatnią butelkę');
        }
      } else if (['SERUM', 'PLASMA'].includes(sp.type)) {
        out.push({ h: `${DB.SPEC_TYPES[sp.type].icon} ${sid} – ${DB.SPEC_TYPES[sp.type].name.toLowerCase()}` });
        Object.keys(sp.vidas || {}).forEach(a => out.push({ t: `VIDAS: ${DB.VIDAS[a].name.replace('VIDAS® ', '')} (${DB.VIDAS[a].vol} µL)`, st: 'vidas', done: has(r => r.kind === 'vidas' && r.data.assay === a && !r.data.err) }));
      } else {
        out.push({ h: `${DB.SPEC_TYPES[sp.type].icon} ${sid} – ${h(sp.label)}` });
        const pn = PANEL_FOR[sp.type];
        if (pn && (sp.type !== 'NPS' || true)) out.push({ t: `BIOFIRE: panel ${DB.PANELS[pn].short}${sp.type === 'NPS' ? ' (lub SPOTFIRE R/ST)' : ''}`, st: 'biofire', done: has(r => (r.kind === 'bf' || r.kind === 'spot') && !r.data.invalid && r.data.spec === sid) });
        if (sp.orgs.length) cultureSteps([sid], 'materiał');
      }
    });
    out.push({ h: '✅ Zakończenie' });
    out.push({ t: 'Zwaliduj wyniki i wyślij raport w MYLA', st: 'myla', done: !!st.done });
    return out;
  }

  function render() {
    const box = $('#missions'); if (!box) return;
    const act = Object.entries(S().cases).filter(([k, v]) => !v.done);
    $('#btn-plan').classList.toggle('has', act.length > 0);
    if (box.classList.contains('hidden')) return;
    if (!act.length) { box.innerHTML = '<div class="mh"><b>📋 Plan pracy</b><button id="mis-x">✕</button></div><p class="muted">Brak aktywnych zleceń. Przyjmij zlecenie w <a href="#" data-go="lis">Rejestracji (LIS)</a>.</p>'; bind(); return; }
    const sel = box.dataset.sel && S().cases[box.dataset.sel] && !S().cases[box.dataset.sel].done ? box.dataset.sel : act[0][0];
    const cs = DB.CASES.find(c => c.id === sel); const list = steps(sel);
    const next = list.find(s => s.t && !s.done);
    const doneN = list.filter(s => s.t && s.done).length, all = list.filter(s => s.t).length;
    box.innerHTML = `<div class="mh"><b>📋 Plan pracy</b><button id="mis-x">✕</button></div>
      ${act.length > 1 ? `<div class="mtabs">${act.map(([k]) => `<button data-sel="${k}" class="${k === sel ? 'on' : ''}">${k}</button>`).join('')}</div>` : ''}
      <div class="mcase"><b>${cs.id} · ${h(cs.title)}</b><small>${h(cs.patient)} · ${h(cs.ward)}</small></div>
      <div class="mgoal">🎯 ${h(cs.goal)}</div>
      <div class="mprog"><i style="width:${doneN / all * 100}%"></i><span>${doneN}/${all}</span></div>
      <ol class="msteps">${list.map(s => s.h ? `<li class="mhd">${s.h}</li>` : `<li class="${s.done ? 'ok' : s === next ? 'next' : ''}"><span>${s.done ? '✔' : s === next ? '➤' : '○'}</span><em>${s.t}</em>${s.done ? '' : `<button data-go="${s.st}" title="Idź do stanowiska">➜</button>`}</li>`).join('')}</ol>
      <details><summary>💡 Podpowiedź</summary><p>${h(cs.tip)}</p></details>`;
    bind();
  }
  function bind() {
    const box = $('#missions');
    const x = $('#mis-x'); if (x) x.onclick = () => box.classList.add('hidden');
    $$('[data-sel]', box).forEach(b => b.onclick = () => { box.dataset.sel = b.dataset.sel; render(); });
    $$('[data-go]', box).forEach(b => b.onclick = (e) => { e.preventDefault(); C.closeModal(); WORLD.goTo(b.dataset.go); });
  }
  window.MISSIONS = { render, show() { $('#missions').classList.remove('hidden'); render(); } };
  document.addEventListener('DOMContentLoaded', () => {
    $('#btn-plan').onclick = () => { $('#missions').classList.toggle('hidden'); render(); };
    setInterval(render, 1000);
  });
})();
