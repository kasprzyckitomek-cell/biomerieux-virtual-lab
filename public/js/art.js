/* =========================================================================
   GRAFIKA APARATÓW – ilustracje wektorowe (SVG) wzorowane na wyglądzie
   urządzeń. Rysunki własne, bez logotypów producenta.
   ========================================================================= */
window.ART = (function () {
  const defs = `
  <defs>
    <linearGradient id="gWhite" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#eef1f4"/><stop offset="1" stop-color="#d5dbe1"/></linearGradient>
    <linearGradient id="gWhiteSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e3e8ed"/><stop offset="1" stop-color="#c3ccd5"/></linearGradient>
    <linearGradient id="gGrey" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa6b2"/><stop offset="1" stop-color="#5f6b78"/></linearGradient>
    <linearGradient id="gDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5562"/><stop offset="1" stop-color="#262d35"/></linearGradient>
    <linearGradient id="gScreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d4f8a"/><stop offset="1" stop-color="#0b2240"/></linearGradient>
    <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f7fd1"/><stop offset="1" stop-color="#14508f"/></linearGradient>
    <linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfe7f7" stop-opacity=".9"/><stop offset="1" stop-color="#8fb9d6" stop-opacity=".6"/></linearGradient>
    <radialGradient id="gLed" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#b8ffb8"/><stop offset="1" stop-color="#1fae3a"/></radialGradient>
    <radialGradient id="gLedR" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffc2c2"/><stop offset="1" stop-color="#d11a1a"/></radialGradient>
    <radialGradient id="gLedY" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3b0"/><stop offset="1" stop-color="#e0a800"/></radialGradient>
    <filter id="fSh" x="-10%" y="-10%" width="130%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#000" flood-opacity=".28"/></filter>
  </defs>`;
  const led = (x, y, s) => `<circle cx="${x}" cy="${y}" r="4" fill="url(#${s === 'err' ? 'gLedR' : s === 'busy' ? 'gLedY' : 'gLed'})" stroke="#333" stroke-width=".6"/>`;
  const wrap = (vb, body, w) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" ${w ? `width="${w}"` : ''}>${defs}${body}</svg>`;
  const label = (x, y, t, s, c) => `<text x="${x}" y="${y}" font-family="Arial,Helvetica,sans-serif" font-size="${s || 9}" font-weight="700" fill="${c || '#5b6773'}" letter-spacing=".5">${t}</text>`;
  const scr = (x, y, w, h, txt) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="url(#gScreen)" stroke="#2b3137" stroke-width="2"/>
    <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="9" fill="#2e6fb8" opacity=".9"/>
    ${txt ? `<text x="${x + 7}" y="${y + 11}" font-family="Arial" font-size="6.5" fill="#fff">${txt}</text>` : ''}
    <rect x="${x + 6}" y="${y + 17}" width="${(w - 12) * .45}" height="${h * .22}" rx="2" fill="#4aa0e6" opacity=".55"/>
    <rect x="${x + 6 + (w - 12) * .5}" y="${y + 17}" width="${(w - 12) * .5}" height="${h * .22}" rx="2" fill="#7cc576" opacity=".55"/>
    <rect x="${x + 6}" y="${y + 20 + h * .22}" width="${w - 12}" height="${h * .18}" rx="2" fill="#ffffff" opacity=".15"/>
    <rect x="${x + 6}" y="${y + 24 + h * .4}" width="${w - 12}" height="${h * .18}" rx="2" fill="#ffffff" opacity=".1"/>`;

  /* VITEK 2 Compact – szeroki aparat stołowy, komora napełniania po lewej, ładowania po prawej */
  function vitek2(st = {}) {
    const fill = st.filling ? '#9fd0ff' : '#b8c2cc';
    return wrap('0 0 420 260', `
    <g filter="url(#fSh)">
      <rect x="20" y="40" width="380" height="190" rx="14" fill="url(#gWhite)" stroke="#aab4be" stroke-width="2"/>
      <path d="M20 70 Q20 40 50 40 L370 40 Q400 40 400 70 L400 80 L20 80 Z" fill="#f7f9fb" stroke="#aab4be" stroke-width="1"/>
      <rect x="20" y="206" width="380" height="24" rx="6" fill="url(#gGrey)"/>
      <!-- komora napełniania -->
      <rect x="40" y="95" width="120" height="98" rx="8" fill="#dfe5ea" stroke="#9aa6b2" stroke-width="2"/>
      <rect x="48" y="103" width="104" height="82" rx="5" fill="${st.fillOpen ? '#33404c' : fill}" stroke="#7f8b97"/>
      ${st.fillOpen ? `<rect x="56" y="150" width="88" height="22" rx="3" fill="#e9eef2"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => `<rect x="${59 + i * 8.5}" y="128" width="6" height="22" fill="${st.cards && st.cards[i] ? st.cards[i] : '#c8d0d7'}" stroke="#555" stroke-width=".4"/>`).join('')}` : '<rect x="95" y="112" width="10" height="4" rx="2" fill="#7f8b97"/>'}
      ${label(52, 92, 'NAPEŁNIANIE', 7.5)}
      <!-- komora ładowania -->
      <rect x="176" y="95" width="120" height="98" rx="8" fill="#dfe5ea" stroke="#9aa6b2" stroke-width="2"/>
      <rect x="184" y="103" width="104" height="82" rx="5" fill="${st.loadOpen ? '#33404c' : '#b8c2cc'}" stroke="#7f8b97"/>
      <rect x="231" y="112" width="10" height="4" rx="2" fill="#7f8b97"/>
      ${label(196, 92, 'ŁADOWANIE', 7.5)}
      <!-- panel sterowania -->
      <rect x="312" y="95" width="72" height="98" rx="6" fill="#e8edf1" stroke="#9aa6b2"/>
      <rect x="318" y="101" width="60" height="34" rx="3" fill="#1a2a1a" stroke="#333"/>
      <text x="322" y="114" font-family="monospace" font-size="7" fill="#8cff8c">${st.lcd1 || 'STATUS: OK'}</text>
      <text x="322" y="126" font-family="monospace" font-size="7" fill="#8cff8c">${st.lcd2 || 'KARTY: 0/30'}</text>
      ${[0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${322 + c * 18}" y="${142 + r * 15}" width="14" height="11" rx="2" fill="#c7cfd6" stroke="#8b96a1" stroke-width=".7"/>`).join('')).join('')}
      ${led(330, 202, st.status)} ${led(345, 202, 'ok')}
      ${label(36, 62, 'VITEK® 2 COMPACT', 13, '#3c4752')}
      <rect x="250" y="54" width="130" height="10" rx="5" fill="#d6dde3"/>
      <rect x="250" y="54" width="${130 * (st.progress || 0)}" height="10" rx="5" fill="#2f7fd1"/>
    </g>`);
  }

  /* VITEK MS PRIME – wysoki, zaokrąglony, ekran dotykowy z lewej, szuflada tarczek */
  function vitekms(st = {}) {
    return wrap('0 0 300 340', `
    <g filter="url(#fSh)">
      <path d="M40 300 L40 70 Q40 30 80 28 L230 28 Q262 30 262 70 L262 300 Z" fill="url(#gWhite)" stroke="#a8b2bc" stroke-width="2"/>
      <path d="M262 70 Q262 30 230 28 L250 28 Q282 34 282 74 L282 296 L262 300 Z" fill="url(#gWhiteSide)" stroke="#a8b2bc"/>
      <rect x="40" y="290" width="242" height="22" rx="6" fill="url(#gGrey)"/>
      <path d="M52 84 L250 84" stroke="#2f7fd1" stroke-width="5" stroke-linecap="round" opacity="${st.busy ? 1 : .55}"/>
      ${scr(56, 100, 96, 72, 'VITEK MS PRIME')}
      <!-- szuflada tarczek -->
      <rect x="166" y="104" width="84" height="64" rx="6" fill="#dbe2e8" stroke="#94a0ab" stroke-width="2"/>
      <rect x="172" y="${st.open ? 150 : 112}" width="72" height="${st.open ? 30 : 48}" rx="4" fill="${st.open ? '#f3f5f7' : '#c6cfd7'}" stroke="#7d8995"/>
      ${st.open ? `<rect x="182" y="155" width="52" height="20" rx="2" fill="#e8b23a" stroke="#8a6a1e"/>${Array.from({ length: 16 }, (_, i) => `<circle cx="${186 + (i % 8) * 6.3}" cy="${161 + Math.floor(i / 8) * 8}" r="2" fill="${st.spots && st.spots[i] ? '#a54a3a' : '#c98d1c'}"/>`).join('')}` : `${label(184, 140, 'TARCZKI', 7)}`}
      <rect x="56" y="188" width="194" height="88" rx="8" fill="#eef2f5" stroke="#b3bdc6"/>
      ${Array.from({ length: 16 }, (_, i) => `<rect x="${64 + (i % 8) * 23}" y="${196 + Math.floor(i / 8) * 36}" width="18" height="28" rx="2" fill="${st.slots && st.slots[i] ? '#e8b23a' : '#d4dbe1'}" stroke="#9aa6b2" stroke-width=".7"/>`).join('')}
      ${label(58, 54, 'VITEK® MS PRIME', 14, '#3c4752')}
      ${label(58, 68, 'MALDI-TOF', 8, '#2f7fd1')}
      ${led(238, 52, st.status || 'ok')}
    </g>`);
  }

  /* BacT/ALERT VIRTUO – duża szafa z portem ładowania i ekranem */
  function virtuo(st = {}) {
    return wrap('0 0 300 380', `
    <g filter="url(#fSh)">
      <rect x="40" y="20" width="220" height="340" rx="16" fill="url(#gWhite)" stroke="#a8b2bc" stroke-width="2"/>
      <rect x="250" y="28" width="22" height="326" rx="8" fill="url(#gWhiteSide)" stroke="#a8b2bc"/>
      <rect x="40" y="338" width="232" height="22" rx="6" fill="url(#gGrey)"/>
      ${scr(150, 46, 92, 68, 'VIRTUO')}
      ${label(56, 60, 'BacT/ALERT®', 11, '#3c4752')}
      ${label(56, 78, 'VIRTUO®', 17, '#14508f')}
      <!-- port ładowania -->
      <rect x="62" y="136" width="176" height="96" rx="14" fill="#dfe5ea" stroke="#97a3ae" stroke-width="2"/>
      <rect x="78" y="150" width="144" height="66" rx="10" fill="${st.open ? '#2a333c' : '#c6cfd7'}" stroke="#7d8995"/>
      ${st.open ? (st.bottles || []).slice(0, 6).map((b, i) => `<g transform="translate(${90 + i * 22},158)"><rect x="0" y="10" width="14" height="40" rx="5" fill="#f3f6f8" stroke="#888" stroke-width=".6"/><rect x="2" y="0" width="10" height="12" rx="2" fill="${b}"/></g>`).join('') : `<rect x="136" y="178" width="28" height="6" rx="3" fill="#8f9ba6"/>`}
      <ellipse cx="150" cy="232" rx="70" ry="4" fill="#2f7fd1" opacity="${st.alarm ? 1 : .6}"><animate attributeName="opacity" values="${st.alarm ? '1;.2;1' : '.6;.6'}" dur="1s" repeatCount="indefinite"/></ellipse>
      ${label(110, 250, 'PORT ŁADOWANIA', 8)}
      <!-- szuflada wyładunku / odpady -->
      <rect x="62" y="262" width="80" height="58" rx="8" fill="#e3e8ec" stroke="#a0abb5"/>
      ${label(74, 296, 'DODATNIE', 8, st.alarm ? '#d11a1a' : '#5b6773')}
      <rect x="158" y="262" width="80" height="58" rx="8" fill="#e3e8ec" stroke="#a0abb5"/>
      ${label(166, 296, 'UJEMNE/BŁĄD', 8)}
      ${led(130, 272, st.alarm ? 'err' : 'ok')} ${led(226, 272, 'ok')}
    </g>`);
  }

  /* BIOFIRE FILMARRAY TORCH – wieża modułów + monitor */
  function torch(st = {}) {
    const mods = st.modules || [0, 0, 0, 0];
    return wrap('0 0 340 360', `
    <g filter="url(#fSh)">
      <rect x="40" y="300" width="190" height="40" rx="8" fill="url(#gDark)"/>
      ${label(60, 325, 'BIOFIRE® FILMARRAY® TORCH', 9, '#e7edf2')}
      ${mods.map((m, i) => `
        <g transform="translate(46,${232 - i * 64})">
          <rect width="178" height="58" rx="8" fill="url(#gWhite)" stroke="#a5afb9" stroke-width="2"/>
          <rect x="12" y="16" width="120" height="10" rx="5" fill="#2b3640"/>
          <rect x="14" y="18" width="${m ? 116 * (m.progress || .02) : 0}" height="6" rx="3" fill="${m && m.done ? '#2ecc71' : '#e0442b'}"/>
          ${label(12, 44, 'MODUŁ ' + (i + 1), 8)}
          ${led(158, 21, m ? (m.done ? 'ok' : 'busy') : 'ok')}
        </g>`).join('')}
      <!-- monitor -->
      <rect x="252" y="160" width="8" height="160" fill="#7b8792"/>
      <rect x="236" y="312" width="40" height="10" rx="3" fill="#56616c"/>
      <rect x="226" y="80" width="98" height="80" rx="6" fill="#20262c"/>
      ${scr(230, 84, 90, 72, 'FilmArray')}
    </g>`);
  }

  /* BIOFIRE FILMARRAY 2.0 – mały aparat z pokrywą */
  function fa2(st = {}) {
    return wrap('0 0 260 200', `
    <g filter="url(#fSh)">
      <path d="M30 170 L30 70 Q30 50 50 50 L210 50 Q230 50 230 70 L230 170 Z" fill="url(#gWhite)" stroke="#a5afb9" stroke-width="2"/>
      <rect x="30" y="160" width="200" height="20" rx="5" fill="url(#gGrey)"/>
      <rect x="54" y="${st.open ? 30 : 60}" width="152" height="18" rx="5" fill="#d1d8de" stroke="#8f9ba6"/>
      <rect x="64" y="86" width="132" height="12" rx="6" fill="#2b3640"/>
      <rect x="66" y="88" width="${128 * (st.progress || 0)}" height="8" rx="4" fill="#e0442b"/>
      ${label(54, 128, 'BIOFIRE® FILMARRAY® 2.0', 10, '#3c4752')}
      ${led(206, 128, st.busy ? 'busy' : 'ok')}
    </g>`);
  }

  /* BIOFIRE SPOTFIRE – kompaktowy POC */
  function spotfire(st = {}) {
    return wrap('0 0 220 200', `
    <g filter="url(#fSh)">
      <rect x="40" y="40" width="140" height="130" rx="22" fill="url(#gWhite)" stroke="#a5afb9" stroke-width="2"/>
      <rect x="40" y="150" width="140" height="20" rx="8" fill="url(#gGrey)"/>
      <rect x="58" y="56" width="104" height="22" rx="8" fill="#2b3640"/>
      <rect x="62" y="64" width="${96 * (st.progress || 0)}" height="6" rx="3" fill="#e0442b"/>
      <rect x="70" y="92" width="80" height="36" rx="5" fill="url(#gScreen)"/>
      <text x="76" y="113" font-family="Arial" font-size="9" fill="#fff">${st.txt || 'GOTOWY'}</text>
      ${label(64, 144, 'SPOTFIRE®', 11, '#e0442b')}
    </g>`);
  }

  /* VIDAS 3 – analizator z dużym ekranem i 4 sekcjami */
  function vidas3(st = {}) {
    const sec = st.sections || [[], [], [], []];
    return wrap('0 0 420 260', `
    <g filter="url(#fSh)">
      <rect x="20" y="50" width="380" height="180" rx="12" fill="url(#gWhite)" stroke="#a5afb9" stroke-width="2"/>
      <rect x="20" y="210" width="380" height="20" rx="6" fill="url(#gGrey)"/>
      <rect x="290" y="20" width="98" height="78" rx="6" fill="#20262c" transform="rotate(-4 339 59)"/>
      <g transform="rotate(-4 339 59)">${scr(294, 24, 90, 70, 'VIDAS 3')}</g>
      ${label(36, 76, 'VIDAS® 3', 16, '#3c4752')}
      ${label(36, 90, 'ELFA IMMUNOASSAY', 7.5, '#2f7fd1')}
      ${sec.map((s, i) => `
        <g transform="translate(${36 + i * 62},110)">
          <rect width="56" height="90" rx="5" fill="#dfe5ea" stroke="#94a0ab" stroke-width="1.5"/>
          ${[0, 1, 2].map(j => `<rect x="${6 + j * 16}" y="8" width="12" height="70" rx="2" fill="${s[j] ? s[j] : '#c7d0d7'}" stroke="#8592a0" stroke-width=".6"/>${s[j] ? `<path d="M${8 + j * 16} 8 L${12 + j * 16} 0 L${16 + j * 16} 8 Z" fill="#f7f7f2" stroke="#999" stroke-width=".5"/>` : ''}`).join('')}
          ${label(10, 88, 'SEKCJA ' + 'ABCD'[i], 6.5)}
        </g>`).join('')}
      ${led(296, 190, st.busy ? 'busy' : 'ok')}
      <rect x="308" y="112" width="76" height="40" rx="4" fill="#e5e9ed" stroke="#a1acb6"/>
      ${label(316, 136, 'SKANER', 8)}
    </g>`);
  }

  /* mini VIDAS */
  function minividas(st = {}) {
    return wrap('0 0 320 220', `
    <g filter="url(#fSh)">
      <path d="M20 190 L20 80 Q20 60 40 60 L280 60 Q300 60 300 80 L300 190 Z" fill="#e7eaec" stroke="#9aa4ae" stroke-width="2"/>
      <rect x="20" y="180" width="280" height="18" rx="5" fill="url(#gGrey)"/>
      <rect x="40" y="78" width="110" height="34" rx="3" fill="#1a2a1a"/>
      <text x="46" y="98" font-family="monospace" font-size="9" fill="#8cff8c">${st.lcd || 'mini VIDAS  READY'}</text>
      ${[0, 1].map(s => `<g transform="translate(${40 + s * 128},124)"><rect width="114" height="46" rx="4" fill="#d2d8dd" stroke="#8f9ba6"/>${[0, 1, 2, 3, 4, 5].map(j => `<rect x="${6 + j * 18}" y="6" width="12" height="34" rx="2" fill="#bcc5cc" stroke="#7d8995" stroke-width=".5"/>`).join('')}</g>`).join('')}
      <rect x="170" y="76" width="110" height="38" rx="4" fill="#d9dee2" stroke="#9aa4ae"/>
      ${label(188, 98, 'DRUKARKA', 8)}
      ${label(40, 74, 'mini VIDAS®', 11, '#3c4752')}
    </g>`);
  }

  /* DENSICHEK Plus */
  function densichek(st = {}) {
    return wrap('0 0 160 240', `
    <g filter="url(#fSh)">
      <rect x="30" y="40" width="100" height="180" rx="22" fill="url(#gWhite)" stroke="#9aa6b2" stroke-width="2"/>
      <ellipse cx="80" cy="62" rx="20" ry="9" fill="#2b3640" stroke="#111"/>
      ${st.tube ? `<rect x="71" y="8" width="18" height="60" rx="8" fill="${st.turbid || 'rgba(230,230,210,.7)'}" stroke="#888"/>` : ''}
      <rect x="44" y="92" width="72" height="48" rx="6" fill="url(#gScreen)" stroke="#20262c" stroke-width="2"/>
      <text x="80" y="124" text-anchor="middle" font-family="Arial" font-weight="700" font-size="20" fill="#fff">${st.value != null ? st.value.toFixed(2) : '-.--'}</text>
      <text x="80" y="135" text-anchor="middle" font-family="Arial" font-size="7" fill="#9cc9ff">McFarland</text>
      <circle cx="80" cy="172" r="15" fill="#2f7fd1" stroke="#14508f" stroke-width="2"/>
      ${label(54, 205, 'DENSICHEK®', 9, '#3c4752')}
    </g>`);
  }

  /* PREVI Isola */
  function isola(st = {}) {
    return wrap('0 0 360 240', `
    <g filter="url(#fSh)">
      <rect x="20" y="40" width="320" height="170" rx="12" fill="url(#gWhite)" stroke="#a5afb9" stroke-width="2"/>
      <rect x="20" y="192" width="320" height="18" rx="5" fill="url(#gGrey)"/>
      <rect x="40" y="70" width="170" height="104" rx="8" fill="url(#gGlass)" stroke="#86a5bb" stroke-width="2"/>
      ${[0, 1, 2, 3].map(i => `<g transform="translate(${54 + i * 38},84)">${[0, 1, 2, 3, 4, 5].map(j => `<ellipse cx="14" cy="${70 - j * 11}" rx="15" ry="5" fill="${['#9e1b23', '#efe6c9', '#c2416b', '#5b3416'][i]}" stroke="#555" stroke-width=".5"/>`).join('')}</g>`).join('')}
      ${scr(226, 70, 96, 64, 'PREVI Isola')}
      ${label(226, 160, 'PREVI® Isola', 12, '#3c4752')}
      ${label(226, 174, 'posiewacz automatyczny', 7, '#2f7fd1')}
      ${led(318, 160, st.busy ? 'busy' : 'ok')}
    </g>`);
  }

  /* PREVI Color Gram */
  function colorgram(st = {}) {
    return wrap('0 0 300 230', `
    <g filter="url(#fSh)">
      <rect x="30" y="40" width="240" height="160" rx="14" fill="url(#gWhite)" stroke="#a5afb9" stroke-width="2"/>
      <rect x="30" y="182" width="240" height="18" rx="5" fill="url(#gGrey)"/>
      <circle cx="110" cy="120" r="56" fill="url(#gGlass)" stroke="#86a5bb" stroke-width="2"/>
      <g transform="rotate(${st.angle || 0} 110 120)">${Array.from({ length: 12 }, (_, i) => `<rect x="106" y="70" width="8" height="30" fill="#f6f8f9" stroke="#999" stroke-width=".5" transform="rotate(${i * 30} 110 120)"/>`).join('')}</g>
      ${[['#6a2c91', 186], ['#b7892a', 202], ['#e8e8e8', 218], ['#d63b56', 234]].map(([c, x]) => `<rect x="${x}" y="70" width="12" height="40" rx="3" fill="${c}" stroke="#555" stroke-width=".6"/>`).join('')}
      ${label(184, 130, 'PREVI®', 11, '#3c4752')}
      ${label(184, 145, 'Color Gram', 11, '#6a2c91')}
      ${led(250, 168, st.busy ? 'busy' : 'ok')}
    </g>`);
  }

  /* Cieplarka */
  function incubator(st = {}) {
    return wrap('0 0 220 300', `
    <g filter="url(#fSh)">
      <rect x="30" y="20" width="160" height="260" rx="10" fill="url(#gWhite)" stroke="#a5afb9" stroke-width="2"/>
      <rect x="44" y="50" width="132" height="200" rx="6" fill="url(#gGlass)" stroke="#86a5bb" stroke-width="2"/>
      ${[0, 1, 2, 3].map(i => `<rect x="50" y="${86 + i * 44}" width="120" height="4" fill="#9aa6b2"/>`).join('')}
      ${(st.plates || []).slice(0, 16).map((c, i) => `<ellipse cx="${66 + (i % 4) * 29}" cy="${82 + Math.floor(i / 4) * 44}" rx="12" ry="4" fill="${c}" stroke="#555" stroke-width=".5"/>`).join('')}
      <rect x="60" y="28" width="60" height="16" rx="3" fill="#1a2a1a"/>
      <text x="66" y="40" font-family="monospace" font-size="10" fill="#ff7b5c">${st.temp || '35.0'}°C</text>
      ${label(128, 40, st.co2 ? 'CO2 5%' : 'O2', 8)}
    </g>`);
  }

  /* Komora laminarna (BSC) */
  function bsc() {
    return wrap('0 0 360 260', `
    <g filter="url(#fSh)">
      <rect x="20" y="20" width="320" height="220" rx="8" fill="url(#gWhite)" stroke="#a5afb9" stroke-width="2"/>
      <rect x="40" y="50" width="280" height="140" rx="4" fill="url(#gGlass)" stroke="#86a5bb" stroke-width="2"/>
      <rect x="40" y="190" width="280" height="18" fill="#c6cfd7"/>
      <rect x="60" y="30" width="80" height="12" rx="3" fill="#1a2a1a"/><text x="64" y="39" font-family="monospace" font-size="8" fill="#8cff8c">FLOW 0.45 m/s</text>
      ${label(220, 40, 'KOMORA KLASY II', 8)}
      <circle cx="110" cy="170" r="14" fill="#a51e25" stroke="#600"/> <circle cx="150" cy="172" r="14" fill="#efe6c9" stroke="#776"/>
      <rect x="230" y="140" width="10" height="40" rx="3" fill="#f2d64b"/><rect x="250" y="146" width="10" height="34" rx="3" fill="#eee"/>
    </g>`);
  }

  function microscope() {
    return wrap('0 0 200 240', `
    <g filter="url(#fSh)">
      <ellipse cx="100" cy="215" rx="70" ry="14" fill="#2b3640"/>
      <path d="M120 210 Q150 150 125 80" stroke="#e9edf0" stroke-width="22" fill="none" stroke-linecap="round"/>
      <rect x="60" y="140" width="80" height="10" rx="3" fill="#3a4550"/>
      <rect x="80" y="60" width="22" height="70" rx="5" fill="#e9edf0" stroke="#888" transform="rotate(-18 91 95)"/>
      <rect x="62" y="40" width="16" height="34" rx="4" fill="#2b3640" transform="rotate(-25 70 57)"/>
      <circle cx="96" cy="132" r="8" fill="#888"/>
      ${label(50, 236, 'MIKROSKOP ×1000', 8, '#ddd')}
    </g>`);
  }

  function pc(st = {}) {
    return wrap('0 0 240 200', `
    <g filter="url(#fSh)">
      <rect x="30" y="20" width="180" height="120" rx="6" fill="#20262c"/>
      ${scr(36, 26, 168, 108, st.title || 'MYLA')}
      <rect x="108" y="140" width="24" height="26" fill="#7b8792"/><rect x="80" y="164" width="80" height="10" rx="3" fill="#56616c"/>
      <rect x="40" y="178" width="120" height="14" rx="3" fill="#d9dee2" stroke="#999"/>
    </g>`);
  }

  function fridge() {
    return wrap('0 0 160 300', `<g filter="url(#fSh)"><rect x="20" y="10" width="120" height="280" rx="8" fill="url(#gWhite)" stroke="#a5afb9" stroke-width="2"/>
      <rect x="30" y="24" width="100" height="190" rx="4" fill="url(#gGlass)" stroke="#86a5bb"/>${[0, 1, 2, 3].map(i => `<rect x="34" y="${60 + i * 40}" width="92" height="3" fill="#9aa6b2"/>${[0, 1, 2, 3, 4].map(j => `<rect x="${38 + j * 17}" y="${42 + i * 40}" width="13" height="17" fill="${['#2f7fd1', '#e0442b', '#2e8b3e', '#e5c21a', '#8e44ad'][(i + j) % 5]}" opacity=".85"/>`).join('')}`).join('')}
      <rect x="44" y="226" width="40" height="14" rx="2" fill="#1a2a1a"/><text x="48" y="237" font-family="monospace" font-size="9" fill="#7bd3ff">4.0°C</text>
      ${label(36, 270, 'ODCZYNNIKI 2–8°C', 8)}</g>`);
  }

  function tempo() {
    return wrap('0 0 300 220', `<g filter="url(#fSh)"><rect x="20" y="50" width="260" height="140" rx="12" fill="url(#gWhite)" stroke="#a5afb9" stroke-width="2"/>
      <rect x="20" y="172" width="260" height="18" rx="5" fill="url(#gGrey)"/>${scr(170, 66, 94, 60, 'TEMPO')}
      <rect x="40" y="70" width="110" height="80" rx="6" fill="#dfe5ea" stroke="#94a0ab"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${48 + i * 16}" y="80" width="10" height="60" rx="2" fill="#f2e7b0" stroke="#999" stroke-width=".5"/>`).join('')}
      ${label(170, 150, 'TEMPO® (przemysł)', 10, '#3c4752')}</g>`);
  }

  function geneup() {
    return wrap('0 0 300 220', `<g filter="url(#fSh)"><path d="M30 190 L30 80 Q30 60 50 60 L250 60 Q270 60 270 80 L270 190 Z" fill="url(#gWhite)" stroke="#a5afb9" stroke-width="2"/>
      <rect x="30" y="172" width="240" height="18" rx="5" fill="url(#gGrey)"/><rect x="50" y="76" width="200" height="30" rx="8" fill="#2b3640"/>
      ${Array.from({ length: 12 }, (_, i) => `<circle cx="${62 + i * 16}" cy="91" r="5" fill="#7cc576"/>`).join('')}
      ${label(50, 140, 'GENE-UP® real-time PCR', 12, '#3c4752')}</g>`);
  }

  /* Elementy otoczenia do mapy */
  function plant() { return wrap('0 0 60 80', `<rect x="18" y="52" width="24" height="24" rx="3" fill="#b5651d"/><circle cx="30" cy="40" r="16" fill="#2e8b3e"/><circle cx="20" cy="34" r="10" fill="#3aa64a"/><circle cx="40" cy="30" r="10" fill="#3aa64a"/>`); }
  function sink() { return wrap('0 0 120 70', `<rect x="4" y="10" width="112" height="56" rx="6" fill="#d9dee2" stroke="#999"/><rect x="16" y="20" width="88" height="38" rx="10" fill="#b8c2cc" stroke="#888"/><rect x="56" y="2" width="8" height="20" rx="3" fill="#888"/><circle cx="60" cy="40" r="3" fill="#555"/>`); }
  function eyewash() { return wrap('0 0 60 80', `<rect x="26" y="20" width="8" height="56" fill="#3aa64a"/><circle cx="30" cy="16" r="12" fill="#2e8b3e"/><text x="18" y="20" font-size="9" fill="#fff" font-family="Arial">+</text>`); }

  const ALL = { vitek2, vitekms, virtuo, torch, fa2, spotfire, vidas3, minividas, densichek, isola, colorgram, incubator, bsc, microscope, pc, fridge, tempo, geneup, plant, sink, eyewash };
  const cache = {};
  function img(name) {
    if (cache[name]) return cache[name];
    const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ALL[name]({}));
    cache[name] = im; return im;
  }

  /* Płytka Petriego z koloniami (SVG) */
  function plate(medium, colonies, opts = {}) {
    const m = DB.MEDIA[medium] || DB.MEDIA.COS;
    const R = 90, cx = 100, cy = 100;
    let body = `<circle cx="${cx}" cy="${cy}" r="${R + 6}" fill="#e8eef2" stroke="#9fb0bd" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="${m.bg}" stroke="${m.rim}" stroke-width="3"/>
      <circle cx="${cx - 30}" cy="${cy - 35}" r="${R * .45}" fill="#fff" opacity=".07"/>`;
    // efekt hemolizy
    (colonies || []).forEach(col => {
      col.pts.forEach(p => {
        if (col.h && col.h.startsWith('β')) body += `<circle cx="${p[0]}" cy="${p[1]}" r="${p[2] * 2.2}" fill="#f2c6a0" opacity=".45"/>`;
        if (col.h && col.h.startsWith('α')) body += `<circle cx="${p[0]}" cy="${p[1]}" r="${p[2] * 1.9}" fill="#6f8f3c" opacity=".35"/>`;
        if (col.halo) body += `<circle cx="${p[0]}" cy="${p[1]}" r="${p[2] * 2}" fill="${col.halo}" opacity=".35"/>`;
      });
    });
    (colonies || []).forEach((col, ci) => {
      col.pts.forEach((p, k) => {
        body += `<circle class="colony" data-c="${ci}" cx="${p[0]}" cy="${p[1]}" r="${p[2]}" fill="${col.c}" stroke="rgba(0,0,0,.25)" stroke-width=".4"/>`;
        if (p[2] > 1.6) body += `<circle cx="${p[0] - p[2] * .3}" cy="${p[1] - p[2] * .3}" r="${p[2] * .35}" fill="#fff" opacity=".35" pointer-events="none"/>`;
      });
    });
    if (opts.swarm) body += `<circle cx="${cx}" cy="${cy}" r="${R - 4}" fill="none" stroke="#c9c2b0" stroke-width="10" opacity=".35"/><circle cx="${cx}" cy="${cy}" r="${R - 24}" fill="none" stroke="#c9c2b0" stroke-width="8" opacity=".3"/>`;
    if (opts.strip) body += opts.strip;
    body += `<text x="${cx}" y="${cy + R + 22}" text-anchor="middle" font-family="Arial" font-size="10" fill="#444">${opts.label || ''}</text>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 230" class="plate-svg">${body}</svg>`;
  }

  return Object.assign({ img, plate, svg: (n, st) => ALL[n](st || {}) }, {});
})();
