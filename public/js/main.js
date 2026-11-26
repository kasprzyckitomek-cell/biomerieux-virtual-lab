/* Start aplikacji, HUD, samouczek */
(function () {
  const C = CORE, $ = C.$, $$ = C.$$;
  function boot() {
    WORLD.init($('#game'));
    $$('.spd').forEach(b => b.onclick = () => { C.S.speed = +b.dataset.s; C.S.paused = false; C.save(); C.updateHud(); });
    $('#btn-pause').onclick = () => { C.S.paused = !C.S.paused; C.updateHud(); };
    $('#btn-1h').onclick = () => C.advance(60); $('#btn-8h').onclick = () => C.advance(480); $('#btn-next').onclick = () => C.skipToNext();
    $('#btn-tray').onclick = () => { $('#tray').classList.toggle('collapsed'); C.updateTray(); };
    $('#tray-close').onclick = () => $('#tray').classList.add('collapsed');
    $('#btn-jobs').onclick = () => $('#jobsbox').classList.toggle('hidden');
    $('#modal-close').onclick = C.closeModal; $('#sub-close').onclick = C.closeSub;
    $('#modal').addEventListener('pointerdown', e => { if (e.target.id === 'modal') C.closeModal(); });
    $('#submodal').addEventListener('pointerdown', e => { if (e.target.id === 'submodal') C.closeSub(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!$('#submodal').classList.contains('hidden')) C.closeSub(); else C.closeModal(); } });
    $('#btn-help').onclick = intro;
    $$('#quick [data-go]').forEach(b => b.onclick = () => WORLD.goTo(b.dataset.go));
    setInterval(() => { C.updateHud(); if (!$('#tray').classList.contains('collapsed')) C.updateTray(); }, 1000);
    setInterval(C.save, 5000);
    C.updateHud();
    if (!C.S.tutorial) intro();
  }
  function intro() {
    $('#intro').classList.remove('hidden'); $('#intro-name').value = C.S.player.name;
    const cv = $('#intro-avatar'), c = cv.getContext('2d'); let w = 0;
    (function anim() { if ($('#intro').classList.contains('hidden')) return; c.clearRect(0, 0, 120, 120); c.save(); c.scale(2, 2); WORLD.drawPerson(c, 30, 30, 'down', w += .12); c.restore(); requestAnimationFrame(anim); })();
    $('#intro-go').onclick = () => {
      C.S.player.name = $('#intro-name').value.trim() || 'Diagnosta'; const first = !C.S.tutorial; C.S.tutorial = true; C.save(); $('#intro').classList.add('hidden');
      if (first) setTimeout(() => C.toast('👋 Zacznij od <b>Rejestracji (LIS)</b> w lewym górnym pokoju – przyjmij pierwsze zlecenie. Kontrola jakości czeka w prawym dolnym pokoju.', 'info'), 600);
    };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
