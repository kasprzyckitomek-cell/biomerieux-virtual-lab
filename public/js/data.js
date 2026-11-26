/* =========================================================================
   BAZA DANYCH WIRTUALNEGO LABORATORIUM
   Wartości demonstracyjne, przygotowane na podstawie publicznie dostępnych
   materiałów (ulotki, broszury, EUCAST). NIE do użytku diagnostycznego.
   ========================================================================= */
window.DB = (function () {

  /* ---------- ANTYBIOTYKI ---------- */
  const ABX = {
    AMP: ['Ampicylina', 'penicyliny'], AMC: ['Amoksycylina/kw. klawulanowy', 'penicyliny+inhibitor'],
    TZP: ['Piperacylina/tazobaktam', 'penicyliny+inhibitor'], CXM: ['Cefuroksym', 'cefalosporyny II'],
    CTX: ['Cefotaksym', 'cefalosporyny III'], CAZ: ['Ceftazydym', 'cefalosporyny III'],
    CRO: ['Ceftriakson', 'cefalosporyny III'], FEP: ['Cefepim', 'cefalosporyny IV'],
    CZA: ['Ceftazydym/awibaktam', 'cefalosporyny+inhibitor'], C_T: ['Ceftolozan/tazobaktam', 'cefalosporyny+inhibitor'],
    ETP: ['Ertapenem', 'karbapenemy'], IPM: ['Imipenem', 'karbapenemy'], MEM: ['Meropenem', 'karbapenemy'],
    GEN: ['Gentamycyna', 'aminoglikozydy'], AMK: ['Amikacyna', 'aminoglikozydy'], TOB: ['Tobramycyna', 'aminoglikozydy'],
    CIP: ['Cyprofloksacyna', 'fluorochinolony'], LVX: ['Lewofloksacyna', 'fluorochinolony'], MXF: ['Moksyfloksacyna', 'fluorochinolony'],
    SXT: ['Trimetoprim/sulfametoksazol', 'sulfonamidy'], NIT: ['Nitrofurantoina', 'inne'], FOS: ['Fosfomycyna', 'inne'],
    COL: ['Kolistyna', 'polimyksyny'], TGC: ['Tygecyklina', 'glicylcykliny'],
    PEN: ['Benzylpenicylina', 'penicyliny'], OXA: ['Oksacylina', 'penicyliny'], FOX: ['Cefoksytyna (skrin)', 'cefamycyny'],
    VAN: ['Wankomycyna', 'glikopeptydy'], TEC: ['Teikoplanina', 'glikopeptydy'], DAP: ['Daptomycyna', 'lipopeptydy'],
    LZD: ['Linezolid', 'oksazolidynony'], ERY: ['Erytromycyna', 'makrolidy'], CLI: ['Klindamycyna', 'linkozamidy'],
    TET: ['Tetracyklina', 'tetracykliny'], RIF: ['Ryfampicyna', 'ryfamycyny'], FUS: ['Kwas fusydowy', 'inne'],
    HLG: ['Gentamycyna HL (synergizm)', 'aminoglikozydy'], MUP: ['Mupirocyna', 'inne'],
    FLU: ['Flukonazol', 'azole'], VOR: ['Worykonazol', 'azole'], AMB: ['Amfoterycyna B', 'polieny'],
    MCF: ['Mykafungina', 'echinokandyny'], CAS: ['Kaspofungina', 'echinokandyny'], FCT: ['Flucytozyna', 'inne']
  };

  /* ---------- PUNKTY ODCIĘCIA (demo, wzorowane na EUCAST) S<=x, R>y ---------- */
  const BP = {
    ENT: { AMP: [8, 8], AMC: [8, 8], TZP: [8, 8], CXM: [8, 8], CTX: [1, 2], CAZ: [1, 4], CRO: [1, 2], FEP: [1, 4], CZA: [8, 8], C_T: [2, 2], ETP: [0.5, 0.5], IPM: [2, 4], MEM: [2, 8], GEN: [2, 2], AMK: [8, 8], TOB: [2, 2], CIP: [0.25, 0.5], LVX: [0.5, 1], SXT: [2, 4], NIT: [64, 64], FOS: [8, 8], COL: [2, 2], TGC: [0.5, 0.5] },
    PSA: { TZP: [0.001, 16], CAZ: [0.001, 8], FEP: [0.001, 8], CZA: [8, 8], C_T: [4, 4], IPM: [0.001, 4], MEM: [2, 8], AMK: [16, 16], TOB: [2, 2], CIP: [0.001, 0.5], LVX: [0.001, 2], COL: [4, 4] },
    ACB: { IPM: [2, 4], MEM: [2, 8], GEN: [4, 4], AMK: [8, 8], TOB: [4, 4], CIP: [0.001, 1], LVX: [0.5, 1], SXT: [2, 4], COL: [2, 2] },
    STA: { PEN: [0.125, 0.125], OXA: [2, 2], FOX: [4, 4], VAN: [2, 2], TEC: [2, 2], DAP: [1, 1], LZD: [4, 4], ERY: [1, 2], CLI: [0.25, 0.5], GEN: [2, 2], CIP: [0.001, 2], LVX: [0.001, 1], MXF: [0.25, 0.25], SXT: [2, 4], TET: [1, 2], RIF: [0.06, 0.06], FUS: [1, 1], TGC: [0.5, 0.5], MUP: [1, 256] },
    ENC: { AMP: [4, 8], IPM: [0.001, 4], VAN: [4, 4], TEC: [2, 2], LZD: [4, 4], HLG: [128, 128], TGC: [0.25, 0.25], NIT: [64, 64], CIP: [4, 4], LVX: [4, 4] },
    SPN: { PEN: [0.06, 2], AMP: [0.5, 2], CTX: [0.5, 2], CRO: [0.5, 2], MEM: [0.25, 0.25], ERY: [0.25, 0.5], CLI: [0.5, 0.5], LVX: [0.001, 2], MXF: [0.5, 0.5], SXT: [1, 2], TET: [1, 2], VAN: [2, 2], LZD: [2, 2], RIF: [0.125, 0.125] },
    STR: { PEN: [0.25, 0.25], AMP: [0.5, 0.5], CTX: [0.5, 0.5], ERY: [0.25, 0.5], CLI: [0.5, 0.5], LVX: [0.001, 2], VAN: [2, 2], TEC: [2, 2], LZD: [2, 2], TET: [1, 2], SXT: [1, 2] },
    HIN: { AMP: [1, 1], AMC: [2, 2], CXM: [1, 2], CTX: [0.125, 0.125], CRO: [0.125, 0.125], MEM: [2, 2], CIP: [0.06, 0.06], SXT: [0.5, 1], TET: [2, 2] },
    CAN: { FLU: [2, 4], VOR: [0.06, 0.25], AMB: [1, 1], MCF: [0.016, 0.016], CAS: [0.25, 0.25], FCT: [4, 16] },
    CAU: { FLU: [32, 32], VOR: [1, 1], AMB: [1, 1], MCF: [2, 2], CAS: [1, 1], FCT: [4, 16] },
    CGL: { FLU: [0.001, 16], VOR: [1, 1], AMB: [1, 1], MCF: [0.03, 0.03], CAS: [0.25, 0.25], FCT: [4, 16] }
  };

  const DIL = [0.008, 0.016, 0.03, 0.06, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512];

  /* ---------- KARTY VITEK 2 ---------- */
  const ID_CARDS = {
    GN: { name: 'VITEK® 2 GN', desc: 'Pałeczki Gram-ujemne fermentujące i niefermentujące', tests: 47, mcf: [0.50, 0.63], saline: '3,0 mL 0,45–0,50% NaCl', hours: [5, 10], color: '#e8a1b8', age: '18–24 h' },
    GP: { name: 'VITEK® 2 GP', desc: 'Ziarniaki i niesporulujące pałeczki Gram-dodatnie', tests: 43, mcf: [0.50, 0.63], saline: '3,0 mL 0,45–0,50% NaCl', hours: [5, 8], color: '#8fb8e8', age: '12–48 h' },
    YST: { name: 'VITEK® 2 YST', desc: 'Drożdże i drożdżaki', tests: 46, mcf: [1.80, 2.20], saline: '3,0 mL 0,45–0,50% NaCl', hours: [15, 18], color: '#f0d27a', age: '18–72 h' },
    NH: { name: 'VITEK® 2 NH', desc: 'Neisseria, Haemophilus i inne wybredne', tests: 30, mcf: [2.70, 3.30], saline: '3,0 mL 0,45–0,50% NaCl', hours: [6, 6], color: '#b9e0a5', age: '18–24 h' },
    ANC: { name: 'VITEK® 2 ANC', desc: 'Beztlenowce i Corynebacterium', tests: 36, mcf: [2.70, 3.30], saline: '3,0 mL 0,45–0,50% NaCl', hours: [6, 6], color: '#c9b3e6', age: '18–72 h' },
    BCL: { name: 'VITEK® 2 BCL', desc: 'Laseczki Bacillus i pokrewne (przemysł)', tests: 46, mcf: [1.80, 2.20], saline: '3,0 mL 0,45–0,50% NaCl', hours: [14, 14], color: '#e6c3a3', age: '18–24 h' }
  };
  const AST_CARDS = {
    'AST-N397': { group: 'ENT', forGram: 'neg', desc: 'Enterobacterales – infekcje ogólnoustrojowe', abx: ['AMP', 'AMC', 'TZP', 'CXM', 'CTX', 'CAZ', 'FEP', 'CZA', 'ETP', 'IPM', 'MEM', 'GEN', 'AMK', 'CIP', 'SXT', 'TGC', 'COL'], transfer: 145, hours: [7, 11] },
    'AST-N352': { group: 'ENT', forGram: 'neg', desc: 'Enterobacterales – zakażenia układu moczowego', abx: ['AMP', 'AMC', 'CXM', 'CTX', 'CAZ', 'FEP', 'ETP', 'MEM', 'GEN', 'AMK', 'CIP', 'LVX', 'SXT', 'NIT', 'FOS'], transfer: 145, hours: [7, 11] },
    'AST-N222': { group: 'PSA', forGram: 'neg', desc: 'Pałeczki niefermentujące (P. aeruginosa, Acinetobacter)', abx: ['TZP', 'CAZ', 'FEP', 'CZA', 'C_T', 'IPM', 'MEM', 'AMK', 'TOB', 'GEN', 'CIP', 'LVX', 'SXT', 'COL'], transfer: 145, hours: [8, 12] },
    'AST-P592': { group: 'STA', forGram: 'pos', desc: 'Staphylococcus spp.', abx: ['FOX', 'PEN', 'OXA', 'GEN', 'CIP', 'LVX', 'MXF', 'ERY', 'CLI', 'LZD', 'DAP', 'TEC', 'VAN', 'TET', 'TGC', 'FUS', 'RIF', 'SXT', 'MUP'], transfer: 280, hours: [8, 12] },
    'AST-P586': { group: 'ENC', forGram: 'pos', desc: 'Enterococcus spp.', abx: ['AMP', 'IPM', 'HLG', 'CIP', 'LVX', 'NIT', 'LZD', 'TEC', 'VAN', 'TGC'], transfer: 280, hours: [8, 12] },
    'AST-ST03': { group: 'SPN', forGram: 'pos', desc: 'Streptococcus pneumoniae / paciorkowce β-hemolizujące', abx: ['PEN', 'AMP', 'CTX', 'CRO', 'MEM', 'ERY', 'CLI', 'LVX', 'MXF', 'TET', 'SXT', 'VAN', 'LZD', 'RIF'], transfer: 280, hours: [8, 12] },
    'AST-YS08': { group: 'CAN', forGram: 'yeast', desc: 'Drożdżaki Candida spp.', abx: ['FLU', 'VOR', 'AMB', 'MCF', 'CAS', 'FCT'], transfer: 280, hours: [12, 18] }
  };

  /* Nazwy studzienek kart ID (do wyświetlania profilu biochemicznego) */
  const WELLS = {
    GN: 'APPA ADO PyrA IARL dCEL BGAL H2S BNAG AGLTp dGLU GGT OFF BGLU dMAL dMAN dMNE BXYL BAlap ProA LIP PLE TyrA URE dSOR SAC dTAG dTRE CIT MNT 5KG lLATk AGLU SUCT NAGA AGAL PHOS GlyA ODC LDC lHISa CMT BGUR O129R GGAA lMLTa ELLM lLATa'.split(' '),
    GP: 'AMY PIPLC dXYL ADH1 BGAL AGLU APPA CDEX AspA BGAR AMAN PHOS LeuA ProA BGURr AGAL PyrA BGUR AlaA TyrA dSOR URE POLYB dGAL dRIB lLATk LAC NAG dMAL BACI NOVO NC6.5 dMAN dMNE MBdG PUL dRAF O129R SAL SAC dTRE ADH2s OPTO'.split(' '),
    YST: 'LysA IMLTa LeuA ARG ERYa GLYLa TyrA BNAG ARBa AMYa dGALa GENa dGLUa LACa MAdGa dCELa GGT dMALa dRAFa NAGA1 dMNEa dMELa dMLZa lSBEa lRHAa XLTa dSORa SACa URE AGLU dTURa dTREa NO3a lARAa dGATa ESC lGLTa dXYLa LATa ACEa CITa GRTas lPROa 2KGa NAGa dGNTa'.split(' '),
    NH: 'BGAL PyrA ProA GGT AGLU PHOS LeuA ArgA TyrA URE dGLU dMAL SAC dFRU ODC ORN AGAL BLAC LIP ALAa GlyA OBSa NAG BGUR AspA SER dMAN dSOR dRIB lLATa'.split(' ')
  };

  /* ---------- PODŁOŻA ---------- */
  const MEDIA = {
    COS: { name: 'Columbia + 5% krwi baraniej (COS)', bg: '#9e1b23', rim: '#7a1218', type: 'wybiórczo-nieselektywne', atm: 'O2 / CO2' },
    CHOC: { name: 'Agar czekoladowy PolyViteX (PVX)', bg: '#5b3416', rim: '#42250f', type: 'wzbogacone', atm: 'CO2 5%' },
    MAC: { name: 'MacConkey (MCK)', bg: '#c2416b', rim: '#9b2f52', type: 'selektywno-różnicujące G(-)', atm: 'O2' },
    CPS: { name: 'chromID® CPS® Elite', bg: '#efe6c9', rim: '#d8cba4', type: 'chromogenne – mocz', atm: 'O2' },
    ESBL: { name: 'chromID® ESBL', bg: '#e9dfc6', rim: '#cfc2a0', type: 'chromogenne – skrining ESBL', atm: 'O2' },
    CARBA: { name: 'chromID® CARBA SMART (CARB/OXA)', bg: '#e4dcc4', rim: '#c9be9c', type: 'chromogenne – skrining CPE', atm: 'O2' },
    MRSA: { name: 'chromID® MRSA SMART', bg: '#f1ece0', rim: '#d6cfbd', type: 'chromogenne – skrining MRSA', atm: 'O2' },
    VRE: { name: 'chromID® VRE', bg: '#ede4cf', rim: '#d1c6ac', type: 'chromogenne – skrining VRE', atm: 'O2' },
    CAN: { name: 'chromID® Candida', bg: '#e9e4d6', rim: '#cdc6b3', type: 'chromogenne – drożdżaki', atm: 'O2 30°C' },
    SGC: { name: 'Sabouraud z gentamycyną i chloramfenikolem', bg: '#e8d9a8', rim: '#cbbb87', type: 'grzyby', atm: 'O2 30°C' },
    MHE: { name: 'Mueller-Hinton E (MHE) – do ETEST®', bg: '#d9b874', rim: '#bb9a58', type: 'lekowrażliwość', atm: 'O2' },
    MHF: { name: 'Mueller-Hinton F (z krwią) – wybredne', bg: '#a3282c', rim: '#7d1c20', type: 'lekowrażliwość', atm: 'CO2' },
    SS: { name: 'Salmonella-Shigella (SS)', bg: '#e9a77a', rim: '#c98858', type: 'selektywne jelitowe', atm: 'O2' },
    SALM: { name: 'chromID® Salmonella Elite', bg: '#eadfd0', rim: '#d0c2ae', type: 'chromogenne – Salmonella', atm: 'O2' }
  };

  /* ---------- DROBNOUSTROJE ----------
     col: wygląd kolonii na podłożu {c: kolor, s: rozmiar mm, h: hemoliza, n: opis}; null = brak wzrostu */
  const ORG = {
    ECO: {
      name: 'Escherichia coli', gram: 'neg', morph: 'rods', idCard: 'GN', ast: ['AST-N397', 'AST-N352'], group: 'ENT', ox: false, cat: true, ttd: 11, ms: 99.9,
      api: '5144572', mcfIdeal: 0.55,
      col: { COS: { c: '#c9c3b5', s: 3, h: 'γ/β', n: 'szare, wilgotne, czasem β-hemoliza' }, CHOC: { c: '#bcb3a1', s: 3 }, MAC: { c: '#e2427a', s: 3, n: 'różowe (laktozo+), z precypitatem' }, CPS: { c: '#a8325a', s: 2.5, n: 'różowo-bordowe (β-glukuronidaza+)' }, ESBL: { c: '#b4345e', s: 2.5, n: 'różowo-bordowe = E. coli ESBL' }, CARBA: { c: '#b4345e', s: 2.5 }, SS: { c: '#ec8fa8', s: 2 }, SALM: { c: '#f1f0ea', s: 2, n: 'bezbarwne' }, MHE: { c: '#e7dcc0', s: 3 }, MHF: { c: '#c9c3b5', s: 3 } },
      key: { BGAL: 1, BGUR: 1, dGLU: 1, dMAN: 1, dSOR: 1, LDC: 1, ODC: 1, URE: 0, CIT: 0, H2S: 0 },
      phenos: {
        WT: { name: 'Fenotyp dziki', mic: { AMP: 4, AMC: 4, TZP: 2, CXM: 4, CTX: 0.125, CAZ: 0.25, CRO: 0.125, FEP: 0.125, CZA: 0.25, ETP: 0.016, IPM: 0.25, MEM: 0.03, GEN: 0.5, AMK: 2, TOB: 0.5, CIP: 0.016, LVX: 0.03, SXT: 0.5, NIT: 16, FOS: 1, COL: 0.5, TGC: 0.25 }, aes: ['β-laktamy: FENOTYP DZIKI', 'Aminoglikozydy: FENOTYP DZIKI', 'Chinolony: FENOTYP DZIKI'], genes: [] },
        ESBL: { name: 'ESBL (CTX-M)', mic: { AMP: 32, AMC: 16, TZP: 8, CXM: 64, CTX: 64, CAZ: 16, CRO: 64, FEP: 16, CZA: 0.5, ETP: 0.06, IPM: 0.25, MEM: 0.06, GEN: 16, AMK: 4, TOB: 16, CIP: 4, LVX: 8, SXT: 320, NIT: 32, FOS: 2, COL: 0.5, TGC: 0.5 }, aes: ['β-laktamy: ESBL (CTX-M)', 'Aminoglikozydy: AAC(3)-II', 'Chinolony: OPORNOŚĆ (mutacje gyrA/parC)'], genes: ['CTX-M'] },
        NDM: { name: 'Karbapenemaza NDM (MBL)', mic: { AMP: 32, AMC: 32, TZP: 128, CXM: 64, CTX: 64, CAZ: 64, CRO: 64, FEP: 32, CZA: 256, ETP: 8, IPM: 16, MEM: 16, GEN: 16, AMK: 64, TOB: 16, CIP: 4, LVX: 8, SXT: 320, NIT: 32, FOS: 4, COL: 0.5, TGC: 0.5 }, aes: ['β-laktamy: KARBAPENEMAZA (metalo-β-laktamaza)', 'Aminoglikozydy: metylaza 16S rRNA'], genes: ['NDM'] }
      }
    },
    KPN: {
      name: 'Klebsiella pneumoniae', gram: 'neg', morph: 'rods', idCard: 'GN', ast: ['AST-N397', 'AST-N352'], group: 'ENT', ox: false, cat: true, ttd: 12, ms: 99.9, api: '5215773', mcfIdeal: 0.56,
      col: { COS: { c: '#d8d3c6', s: 4, h: 'γ', n: 'duże, śluzowe, szare' }, CHOC: { c: '#cfc7b4', s: 4 }, MAC: { c: '#e67a9e', s: 4, n: 'różowe, śluzowe' }, CPS: { c: '#2f5d8c', s: 3.5, n: 'granatowo-niebieskie (KESC)' }, ESBL: { c: '#3e5f9c', s: 3.5, n: 'zielono-niebieskie = KESC ESBL' }, CARBA: { c: '#2e5a8a', s: 3.5, n: 'niebieskie na CARB' }, SS: { c: '#efb6c4', s: 3 }, SALM: { c: '#f2efe6', s: 2 }, MHE: { c: '#ece1c6', s: 4 }, MHF: { c: '#d8d3c6', s: 4 } },
      key: { URE: 1, CIT: 1, BGAL: 1, dGLU: 1, BGUR: 0, ODC: 0, LDC: 1 },
      phenos: {
        WT: { name: 'Fenotyp dziki (penicylinaza SHV-1)', mic: { AMP: 64, AMC: 4, TZP: 4, CXM: 4, CTX: 0.125, CAZ: 0.25, CRO: 0.125, FEP: 0.125, CZA: 0.25, ETP: 0.03, IPM: 0.25, MEM: 0.03, GEN: 0.5, AMK: 2, TOB: 0.5, CIP: 0.06, LVX: 0.12, SXT: 0.5, NIT: 32, FOS: 16, COL: 0.5, TGC: 0.5 }, aes: ['β-laktamy: PENICYLINAZA WYSOKIEGO POZIOMU (naturalna SHV-1)'], genes: [] },
        ESBL: { name: 'ESBL (CTX-M-15)', mic: { AMP: 64, AMC: 32, TZP: 32, CXM: 64, CTX: 64, CAZ: 32, CRO: 64, FEP: 16, CZA: 0.5, ETP: 0.25, IPM: 0.25, MEM: 0.06, GEN: 16, AMK: 8, TOB: 16, CIP: 4, LVX: 8, SXT: 320, NIT: 128, FOS: 32, COL: 0.5, TGC: 1 }, aes: ['β-laktamy: ESBL (CTX-M)', 'Aminoglikozydy: AAC(3)-II', 'Chinolony: OPORNOŚĆ'], genes: ['CTX-M'] },
        KPC: { name: 'Karbapenemaza KPC', mic: { AMP: 64, AMC: 32, TZP: 128, CXM: 64, CTX: 64, CAZ: 64, CRO: 64, FEP: 32, CZA: 1, ETP: 8, IPM: 8, MEM: 16, GEN: 1, AMK: 16, TOB: 16, CIP: 4, LVX: 8, SXT: 320, NIT: 128, FOS: 64, COL: 0.5, TGC: 1 }, aes: ['β-laktamy: KARBAPENEMAZA (KPC)', 'Chinolony: OPORNOŚĆ', 'Zgłoś do KORLD / kontrola zakażeń!'], genes: ['KPC', 'CTX-M'] },
        OXA48: { name: 'Karbapenemaza OXA-48', mic: { AMP: 64, AMC: 32, TZP: 128, CXM: 64, CTX: 64, CAZ: 16, CRO: 64, FEP: 16, CZA: 0.5, ETP: 4, IPM: 2, MEM: 2, GEN: 16, AMK: 8, TOB: 16, CIP: 4, LVX: 8, SXT: 320, NIT: 128, FOS: 64, COL: 0.5, TGC: 1 }, aes: ['β-laktamy: KARBAPENEMAZA (OXA-48)', 'β-laktamy: ESBL (CTX-M)'], genes: ['OXA-48-like', 'CTX-M'] }
      }
    },
    PMI: {
      name: 'Proteus mirabilis', gram: 'neg', morph: 'rods', idCard: 'GN', ast: ['AST-N397', 'AST-N352'], group: 'ENT', ox: false, cat: true, ttd: 13, ms: 99.9, api: '0736000', mcfIdeal: 0.55,
      col: { COS: { c: '#bdb7a7', s: 6, h: 'γ', n: 'rojenie (swarming), zapach' }, CHOC: { c: '#b5ad99', s: 6 }, MAC: { c: '#efe6d6', s: 3, n: 'bezbarwne (laktozo-)' }, CPS: { c: '#a8794a', s: 3, n: 'brązowe z brązowym halo (TDA+)' }, ESBL: { c: '#a67a50', s: 3 }, SS: { c: '#d9c9a9', s: 3, n: 'czarny środek (H2S+)' }, SALM: { c: '#efeae0', s: 2 }, MHE: { c: '#e4d7b8', s: 5 }, MHF: { c: '#bdb7a7', s: 5 } },
      key: { URE: 1, H2S: 1, ODC: 1, TDA: 1, BGAL: 0, dMAN: 0 },
      phenos: {
        WT: { name: 'Fenotyp dziki', mic: { AMP: 2, AMC: 2, TZP: 0.5, CXM: 2, CTX: 0.03, CAZ: 0.06, CRO: 0.03, FEP: 0.06, CZA: 0.06, ETP: 0.016, IPM: 2, MEM: 0.06, GEN: 0.5, AMK: 2, TOB: 0.5, CIP: 0.03, LVX: 0.06, SXT: 0.5, NIT: 256, FOS: 4, COL: 16, TGC: 4 }, aes: ['β-laktamy: FENOTYP DZIKI', 'Kolistyna/tygecyklina/nitrofurantoina: OPORNOŚĆ NATURALNA'], genes: [] }
      }
    },
    ECL: {
      name: 'Enterobacter cloacae complex', gram: 'neg', morph: 'rods', idCard: 'GN', ast: ['AST-N397'], group: 'ENT', ox: false, cat: true, ttd: 12, ms: 99.0, api: '3305573', mcfIdeal: 0.56,
      col: { COS: { c: '#cfc9bb', s: 3, h: 'γ' }, CHOC: { c: '#c4bba8', s: 3 }, MAC: { c: '#e5739a', s: 3 }, CPS: { c: '#34628a', s: 3, n: 'niebiesko-zielone (KESC)' }, ESBL: { c: '#3d6c95', s: 3 }, SS: { c: '#f0bdc9', s: 2 }, SALM: { c: '#f0ede4', s: 2 }, MHE: { c: '#e8dcc0', s: 3 }, MHF: { c: '#cfc9bb', s: 3 } },
      key: { ADH: 1, ODC: 1, CIT: 1, BGAL: 1, URE: 0, LDC: 0 },
      phenos: {
        WT: { name: 'AmpC indukowalna (naturalna)', mic: { AMP: 32, AMC: 32, TZP: 2, CXM: 16, CTX: 0.25, CAZ: 0.5, CRO: 0.25, FEP: 0.06, CZA: 0.25, ETP: 0.03, IPM: 0.5, MEM: 0.06, GEN: 0.5, AMK: 2, TOB: 0.5, CIP: 0.03, LVX: 0.06, SXT: 0.5, NIT: 32, FOS: 16, COL: 0.5, TGC: 0.5 }, aes: ['β-laktamy: CEFALOSPORYNAZA NISKIEGO POZIOMU (AmpC naturalna)', 'Uwaga: ryzyko derepresji AmpC przy leczeniu C3G'], genes: [] },
        AMPC: { name: 'AmpC zdereprymowana', mic: { AMP: 32, AMC: 32, TZP: 64, CXM: 64, CTX: 64, CAZ: 64, CRO: 64, FEP: 1, CZA: 0.5, ETP: 0.5, IPM: 0.5, MEM: 0.06, GEN: 0.5, AMK: 2, TOB: 0.5, CIP: 0.03, LVX: 0.06, SXT: 0.5, NIT: 64, FOS: 32, COL: 0.5, TGC: 0.5 }, aes: ['β-laktamy: CEFALOSPORYNAZA WYSOKIEGO POZIOMU (AmpC zdereprymowana)'], genes: [] }
      }
    },
    SEN: {
      name: 'Salmonella enterica (Enteritidis)', gram: 'neg', morph: 'rods', idCard: 'GN', ast: ['AST-N397'], group: 'ENT', ox: false, cat: true, ttd: 14, ms: 99.0, api: '6704752', mcfIdeal: 0.55,
      col: { COS: { c: '#c8c2b3', s: 2.5, h: 'γ' }, CHOC: { c: '#bdb3a0', s: 2.5 }, MAC: { c: '#f0e8d8', s: 2.5, n: 'bezbarwne' }, CPS: { c: '#f2efe4', s: 2, n: 'bezbarwne/kremowe' }, SS: { c: '#e6d8bd', s: 2.5, n: 'bezbarwne z czarnym środkiem (H2S+)' }, SALM: { c: '#c33a8c', s: 2.5, n: 'różowo-fioletowe = Salmonella' }, MHE: { c: '#e4d8bb', s: 2.5 }, MHF: { c: '#c8c2b3', s: 2.5 } },
      key: { H2S: 1, LDC: 1, ODC: 1, CIT: 1, BGAL: 0, URE: 0 },
      phenos: { WT: { name: 'Fenotyp dziki', mic: { AMP: 2, AMC: 2, TZP: 2, CXM: 2, CTX: 0.125, CAZ: 0.25, CRO: 0.125, FEP: 0.06, CZA: 0.25, ETP: 0.016, IPM: 0.25, MEM: 0.03, GEN: 0.5, AMK: 2, TOB: 0.5, CIP: 0.03, LVX: 0.06, SXT: 0.5, NIT: 32, FOS: 2, COL: 1, TGC: 0.5 }, aes: ['β-laktamy: FENOTYP DZIKI', 'Aminoglikozydy: nie raportować dla Salmonella (nieskuteczne klinicznie)'], genes: [] } }
    },
    PAE: {
      name: 'Pseudomonas aeruginosa', gram: 'neg', morph: 'rods', idCard: 'GN', ast: ['AST-N222'], group: 'PSA', ox: true, cat: true, ttd: 16, ms: 99.9, api: '2206004', mcfIdeal: 0.54,
      col: { COS: { c: '#8f9a7d', s: 4, h: 'β', n: 'płaskie, metaliczny połysk, zapach „jaśminu”' }, CHOC: { c: '#8b9478', s: 4 }, MAC: { c: '#e9e2cf', s: 3, n: 'bezbarwne' }, CPS: { c: '#c7c09a', s: 3, n: 'kremowe/naturalne, zielonkawy pigment' }, ESBL: { c: '#b7b489', s: 2 }, CARBA: { c: '#b9b38d', s: 2 }, SS: null, SALM: { c: '#e7e2c8', s: 2 }, MHE: { c: '#a9b08c', s: 4, n: 'zielony pigment (piocyjanina)' }, MHF: { c: '#8f9a7d', s: 4 } },
      key: { ADH: 1, CIT: 1, dGLU: 0, BGAL: 0, OX: 1 },
      phenos: {
        WT: { name: 'Fenotyp dziki', mic: { TZP: 4, CAZ: 2, FEP: 2, CZA: 2, C_T: 0.5, IPM: 2, MEM: 0.5, AMK: 4, TOB: 0.5, GEN: 2, CIP: 0.25, LVX: 1, SXT: 320, COL: 1 }, aes: ['β-laktamy: FENOTYP DZIKI', 'Ko-trimoksazol: OPORNOŚĆ NATURALNA'], genes: [] },
        MDR: { name: 'MDR – utrata OprD + pompy MexAB', mic: { TZP: 64, CAZ: 32, FEP: 16, CZA: 8, C_T: 2, IPM: 16, MEM: 16, AMK: 8, TOB: 1, GEN: 8, CIP: 4, LVX: 8, SXT: 320, COL: 1 }, aes: ['Karbapenemy: NIEPRZEPUSZCZALNOŚĆ (utrata OprD)', 'β-laktamy: CEFALOSPORYNAZA WYSOKIEGO POZIOMU + efflux', 'Chinolony: OPORNOŚĆ'], genes: [] },
        VIM: { name: 'Metalo-β-laktamaza VIM', mic: { TZP: 128, CAZ: 64, FEP: 32, CZA: 64, C_T: 32, IPM: 64, MEM: 32, AMK: 32, TOB: 16, GEN: 16, CIP: 4, LVX: 8, SXT: 320, COL: 1 }, aes: ['β-laktamy: KARBAPENEMAZA (MBL – VIM)', 'Zgłoś do KORLD / kontrola zakażeń!'], genes: ['VIM'] }
      }
    },
    ABA: {
      name: 'Acinetobacter baumannii complex', gram: 'neg', morph: 'coccobacilli', idCard: 'GN', ast: ['AST-N222'], group: 'ACB', ox: false, cat: true, ttd: 13, ms: 99.5, api: '0040001', mcfIdeal: 0.55,
      col: { COS: { c: '#e0dccd', s: 2.5, h: 'γ', n: 'gładkie, kremowe' }, CHOC: { c: '#d5ccb7', s: 2.5 }, MAC: { c: '#e7c9d1', s: 2, n: 'lekko różowe' }, CPS: { c: '#e9e3cf', s: 2, n: 'kremowe' }, ESBL: { c: '#e3dcc5', s: 2 }, CARBA: { c: '#e2dbc4', s: 2, n: 'kremowe na OXA' }, SS: null, SALM: null, MHE: { c: '#ece3c9', s: 2.5 }, MHF: { c: '#e0dccd', s: 2.5 } },
      key: { dGLU: 0, CIT: 1, BGAL: 0 },
      phenos: {
        CRAB: { name: 'CRAB – OXA-23', mic: { IPM: 32, MEM: 32, GEN: 16, AMK: 32, TOB: 16, CIP: 4, LVX: 8, SXT: 320, COL: 0.5 }, aes: ['Karbapenemy: KARBAPENEMAZA (OXA-23 – klasa D)', 'Zgłoś do KORLD / izolacja kontaktowa!'], genes: ['OXA-23'] },
        WT: { name: 'Fenotyp dziki', mic: { IPM: 0.25, MEM: 0.5, GEN: 1, AMK: 2, TOB: 1, CIP: 0.25, LVX: 0.12, SXT: 1, COL: 0.5 }, aes: ['FENOTYP DZIKI'], genes: [] }
      }
    },
    HIN: {
      name: 'Haemophilus influenzae', gram: 'neg', morph: 'coccobacilli', idCard: 'NH', ast: [], group: 'HIN', ox: true, cat: true, ttd: 18, ms: 99.9, mcfIdeal: 3.0,
      col: { COS: null, CHOC: { c: '#c7bfa9', s: 1.5, n: 'drobne, szare, wilgotne (czynnik X+V)' }, MAC: null, CPS: null, ESBL: null, SS: null, SALM: null, MHE: null, MHF: { c: '#c8c0ad', s: 1.2 } },
      key: { ODC: 1, URE: 1 }, phenos: { WT: { name: 'β-laktamazo-ujemny', mic: { AMP: 0.25, AMC: 0.5, CXM: 1, CTX: 0.016, CRO: 0.008, MEM: 0.06, CIP: 0.016, SXT: 0.125, TET: 0.5 }, aes: ['β-laktamy: FENOTYP DZIKI'], genes: [] } }
    },
    NME: {
      name: 'Neisseria meningitidis', gram: 'neg', morph: 'diplococci', idCard: 'NH', ast: [], group: 'HIN', ox: true, cat: true, ttd: 15, ms: 99.9, mcfIdeal: 3.0,
      col: { COS: { c: '#c2bdb1', s: 1.5, h: 'γ', n: 'szare, gładkie' }, CHOC: { c: '#bfb6a2', s: 1.5 }, MAC: null, CPS: null, SS: null, SALM: null, MHE: null, MHF: { c: '#c2bdb1', s: 1.5 } },
      key: { dGLU: 1, dMAL: 1, GGT: 1 }, phenos: { WT: { name: 'Fenotyp dziki', mic: { PEN: 0.06, CTX: 0.008, CRO: 0.008, MEM: 0.016, CIP: 0.008, RIF: 0.03 }, aes: ['Patogen alarmowy – powiadom lekarza i Sanepid!'], genes: [] } }
    },
    SAU: {
      name: 'Staphylococcus aureus', gram: 'pos', morph: 'cocci-clusters', idCard: 'GP', ast: ['AST-P592'], group: 'STA', ox: false, cat: true, ttd: 14, ms: 99.9, mcfIdeal: 0.56,
      col: { COS: { c: '#f1d58c', s: 2.5, h: 'β', n: 'złociste, β-hemoliza' }, CHOC: { c: '#e7cf96', s: 2.5 }, MAC: null, CPS: { c: '#f3efe2', s: 1.5, n: 'białe/kremowe, drobne' }, MRSA: null, SS: null, SALM: null, MHE: { c: '#efd9a2', s: 2.5 }, MHF: { c: '#f1d58c', s: 2.5 } },
      key: { BGAL: 0, dMAN: 1, URE: 1, PHOS: 1, NOVO: 0, POLYB: 1 },
      phenos: {
        MSSA: { name: 'MSSA – penicylinaza', mic: { FOX: 2, PEN: 0.5, OXA: 0.5, GEN: 0.5, CIP: 0.5, LVX: 0.25, MXF: 0.25, ERY: 0.25, CLI: 0.25, LZD: 2, DAP: 0.5, TEC: 0.5, VAN: 1, TET: 1, TGC: 0.12, FUS: 0.5, RIF: 0.03, SXT: 10, MUP: 1 }, aes: ['β-laktamy: PENICYLINAZA', 'Glikopeptydy: FENOTYP DZIKI'], genes: [] },
        MRSA: { name: 'MRSA (mecA) + MLSB indukcyjny', mic: { FOX: 8, PEN: 0.5, OXA: 4, GEN: 0.5, CIP: 8, LVX: 8, MXF: 4, ERY: 8, CLI: 0.25, LZD: 2, DAP: 0.5, TEC: 0.5, VAN: 1, TET: 1, TGC: 0.12, FUS: 0.5, RIF: 0.03, SXT: 10, MUP: 1 }, aes: ['β-laktamy: OPORNOŚĆ NA METYCYLINĘ (mecA/PBP2a)', 'MLSB: INDUKCYJNY (ICR+) – raportuj klindamycynę jako R', 'Chinolony: OPORNOŚĆ'], genes: ['mecA/C', 'MREJ'], icr: true }
      }
    },
    SEP: {
      name: 'Staphylococcus epidermidis', gram: 'pos', morph: 'cocci-clusters', idCard: 'GP', ast: ['AST-P592'], group: 'STA', ox: false, cat: true, ttd: 22, ms: 99.9, mcfIdeal: 0.55,
      col: { COS: { c: '#ece9e0', s: 1.5, h: 'γ', n: 'białe, drobne, niehemolizujące' }, CHOC: { c: '#e1dccf', s: 1.5 }, MAC: null, CPS: { c: '#f4f1e8', s: 1, n: 'białe' }, MRSA: null, SS: null, SALM: null, MHE: { c: '#efe8d5', s: 1.5 }, MHF: { c: '#ece9e0', s: 1.5 } },
      key: { NOVO: 0, dMAN: 0, URE: 1 },
      phenos: { MRSE: { name: 'MRCoNS (mecA)', mic: { FOX: 8, PEN: 4, OXA: 4, GEN: 8, CIP: 4, LVX: 8, MXF: 2, ERY: 8, CLI: 8, LZD: 1, DAP: 0.5, TEC: 4, VAN: 2, TET: 1, TGC: 0.12, FUS: 0.5, RIF: 0.03, SXT: 80, MUP: 1 }, aes: ['β-laktamy: OPORNOŚĆ NA METYCYLINĘ (mecA)', 'MLSB: KONSTYTUTYWNY', 'Uwaga: częsta kontaminacja posiewu krwi – oceń liczbę dodatnich butelek'], genes: ['mecA/C'] } }
    },
    EFA: {
      name: 'Enterococcus faecalis', gram: 'pos', morph: 'cocci-chains', idCard: 'GP', ast: ['AST-P586'], group: 'ENC', ox: false, cat: false, ttd: 13, ms: 99.9, mcfIdeal: 0.55,
      col: { COS: { c: '#d9d6cc', s: 1.5, h: 'γ/α', n: 'szare, drobne' }, CHOC: { c: '#cdc6b3', s: 1.5 }, MAC: { c: '#e7b1c0', s: 1, n: 'drobne' }, CPS: { c: '#3aa5b3', s: 1, n: 'turkusowo-niebieskie, drobne' }, VRE: null, SS: null, SALM: null, MHE: { c: '#e4dcc4', s: 1.5 }, MHF: { c: '#d9d6cc', s: 1.5 } },
      key: { PyrA: 1, BGUR: 0, dMAN: 1, NC6_5: 1 },
      phenos: { WT: { name: 'Fenotyp dziki', mic: { AMP: 1, IPM: 2, HLG: 128, CIP: 1, LVX: 1, NIT: 8, LZD: 2, TEC: 0.5, VAN: 1, TGC: 0.12 }, aes: ['Penicyliny: FENOTYP DZIKI', 'Aminoglikozydy: OPORNOŚĆ NISKIEGO POZIOMU (naturalna) – synergizm zachowany', 'Cefalosporyny: OPORNOŚĆ NATURALNA'], genes: [] } }
    },
    EFM: {
      name: 'Enterococcus faecium', gram: 'pos', morph: 'cocci-chains', idCard: 'GP', ast: ['AST-P586'], group: 'ENC', ox: false, cat: false, ttd: 14, ms: 99.9, mcfIdeal: 0.55,
      col: { COS: { c: '#dcd8cf', s: 1.5, h: 'γ' }, CHOC: { c: '#cec7b5', s: 1.5 }, MAC: { c: '#e8b8c4', s: 1 }, CPS: { c: '#41a3b0', s: 1, n: 'turkusowe' }, VRE: { c: '#7a3c8f', s: 1.5, n: 'fioletowe = E. faecium VRE' }, SS: null, SALM: null, MHE: { c: '#e5ddc6', s: 1.5 }, MHF: { c: '#dcd8cf', s: 1.5 } },
      key: { PyrA: 1, AMY: 1, dMAN: 1 },
      phenos: {
        VRE: { name: 'VRE – vanA', mic: { AMP: 32, IPM: 16, HLG: 1024, CIP: 32, LVX: 32, NIT: 128, LZD: 2, TEC: 32, VAN: 32, TGC: 0.06 }, aes: ['Glikopeptydy: OPORNOŚĆ NA WANKOMYCYNĘ I TEIKOPLANINĘ (VanA)', 'Aminoglikozydy: OPORNOŚĆ WYSOKIEGO POZIOMU – brak synergizmu', 'Zgłoś do zespołu kontroli zakażeń!'], genes: ['vanA/B'] },
        AMPR: { name: 'Oporny na ampicylinę, wrażliwy na VAN', mic: { AMP: 32, IPM: 16, HLG: 128, CIP: 32, LVX: 32, NIT: 128, LZD: 2, TEC: 0.5, VAN: 1, TGC: 0.06 }, aes: ['Penicyliny: OPORNOŚĆ (zmiana PBP5)'], genes: [] }
      }
    },
    SPN: {
      name: 'Streptococcus pneumoniae', gram: 'pos', morph: 'cocci-pairs', idCard: 'GP', ast: ['AST-ST03'], group: 'SPN', ox: false, cat: false, ttd: 12, ms: 99.0, mcfIdeal: 0.55,
      col: { COS: { c: '#9fae86', s: 1.2, h: 'α', n: 'α-hemoliza (zazielenienie), kolonie „monetowate”' }, CHOC: { c: '#bdb59e', s: 1.2 }, MAC: null, CPS: null, SS: null, SALM: null, MHE: null, MHF: { c: '#9fae86', s: 1.2 } },
      key: { OPTO: 1, BGAL: 1 },
      phenos: { WT: { name: 'Wrażliwy na penicylinę', mic: { PEN: 0.016, AMP: 0.03, CTX: 0.016, CRO: 0.016, MEM: 0.016, ERY: 0.06, CLI: 0.06, LVX: 1, MXF: 0.12, TET: 0.25, SXT: 0.25, VAN: 0.25, LZD: 1, RIF: 0.03 }, aes: ['β-laktamy: FENOTYP DZIKI'], genes: [] }, PNSP: { name: 'Zmniejszona wrażliwość na penicylinę + ermB', mic: { PEN: 1, AMP: 1, CTX: 0.5, CRO: 0.5, MEM: 0.25, ERY: 64, CLI: 64, LVX: 1, MXF: 0.12, TET: 16, SXT: 4, VAN: 0.25, LZD: 1, RIF: 0.03 }, aes: ['β-laktamy: ZMIENIONE PBP', 'MLSB: KONSTYTUTYWNY (ermB)'], genes: [] } }
    },
    SAG: {
      name: 'Streptococcus agalactiae (GBS)', gram: 'pos', morph: 'cocci-chains', idCard: 'GP', ast: ['AST-ST03'], group: 'STR', ox: false, cat: false, ttd: 11, ms: 99.9, mcfIdeal: 0.55,
      col: { COS: { c: '#dcd9cf', s: 1.5, h: 'β (wąska)', n: 'szaro-białe, wąska strefa β-hemolizy' }, CHOC: { c: '#cdc7b4', s: 1.5 }, MAC: null, CPS: { c: '#b9c6d8', s: 1, n: 'jasnoniebieskie/bezbarwne, drobne' }, SS: null, SALM: null, MHE: null, MHF: { c: '#dcd9cf', s: 1.5 } },
      key: { BGUR: 0, dRIB: 1, ADH1: 1 },
      phenos: { WT: { name: 'Fenotyp dziki', mic: { PEN: 0.06, AMP: 0.125, CTX: 0.06, ERY: 0.06, CLI: 0.06, LVX: 0.5, VAN: 0.5, TEC: 0.12, LZD: 1, TET: 16, SXT: 0.25 }, aes: ['β-laktamy: FENOTYP DZIKI'], genes: [] } }
    },
    SPY: {
      name: 'Streptococcus pyogenes (GAS)', gram: 'pos', morph: 'cocci-chains', idCard: 'GP', ast: ['AST-ST03'], group: 'STR', ox: false, cat: false, ttd: 10, ms: 99.9, mcfIdeal: 0.55,
      col: { COS: { c: '#e5e2d9', s: 1, h: 'β (szeroka)', n: 'drobne, szeroka strefa β-hemolizy' }, CHOC: { c: '#d3ccba', s: 1 }, MAC: null, CPS: null, SS: null, SALM: null, MHE: null, MHF: { c: '#e5e2d9', s: 1 } },
      key: { PyrA: 1, BACI: 1 },
      phenos: { WT: { name: 'Fenotyp dziki', mic: { PEN: 0.016, AMP: 0.03, CTX: 0.016, ERY: 0.06, CLI: 0.06, LVX: 0.5, VAN: 0.5, TEC: 0.12, LZD: 1, TET: 0.5, SXT: 0.25 }, aes: ['β-laktamy: FENOTYP DZIKI (100% wrażliwość na penicylinę)'], genes: [] } }
    },
    LMO: {
      name: 'Listeria monocytogenes', gram: 'pos', morph: 'rods', idCard: 'GP', ast: [], group: 'STR', ox: false, cat: true, ttd: 20, ms: 99.9, mcfIdeal: 0.55,
      col: { COS: { c: '#d7d5cd', s: 1, h: 'β (wąska)', n: 'drobne, wąska β-hemoliza' }, CHOC: { c: '#cac3b0', s: 1 }, MAC: null, CPS: null, SS: null, SALM: null, MHE: null, MHF: { c: '#d7d5cd', s: 1 } },
      key: { dXYL: 0, BGUR: 0, PIPLC: 1 },
      phenos: { WT: { name: 'Fenotyp dziki', mic: { PEN: 0.25, AMP: 0.5, MEM: 0.12, SXT: 0.06, ERY: 0.12 }, aes: ['Cefalosporyny: OPORNOŚĆ NATURALNA – leczyć ampicyliną'], genes: [] } }
    },
    CAL: {
      name: 'Candida albicans', gram: 'yeast', morph: 'yeast', idCard: 'YST', ast: ['AST-YS08'], group: 'CAN', ox: false, cat: true, ttd: 28, ms: 99.9, mcfIdeal: 2.0,
      col: { COS: { c: '#f0ede4', s: 1.5, h: '-', n: 'białe, kremowe, matowe' }, CHOC: { c: '#e7e1d1', s: 1.5 }, MAC: null, CPS: { c: '#f2efe8', s: 1, n: 'białe, drobne' }, CAN: { c: '#2b56a8', s: 2, n: 'niebieskie = C. albicans' }, SGC: { c: '#f3efe2', s: 2.5, n: 'kremowe, drożdżowy zapach' }, SS: null, SALM: null, MHE: null, MHF: null },
      key: {}, phenos: { WT: { name: 'Fenotyp dziki', mic: { FLU: 0.5, VOR: 0.016, AMB: 0.25, MCF: 0.016, CAS: 0.12, FCT: 1 }, aes: ['Azole: FENOTYP DZIKI', 'Echinokandyny: FENOTYP DZIKI'], genes: [] } }
    },
    CAU: {
      name: 'Candidozyma auris (Candida auris)', gram: 'yeast', morph: 'yeast', idCard: 'YST', ast: ['AST-YS08'], group: 'CAU', ox: false, cat: true, ttd: 34, ms: 99.0, mcfIdeal: 2.0,
      col: { COS: { c: '#f3f0e8', s: 1, h: '-', n: 'białe, drobne' }, CHOC: { c: '#ebe5d6', s: 1 }, MAC: null, CPS: { c: '#f2eee5', s: 0.8 }, CAN: { c: '#e9e3de', s: 1.2, n: 'białe/różowawe – NIE niebieskie!' }, SGC: { c: '#f1ede1', s: 1.5 }, SS: null, SALM: null, MHE: null, MHF: null },
      key: {}, phenos: { WT: { name: 'Oporna na flukonazol (typowo)', mic: { FLU: 128, VOR: 1, AMB: 1, MCF: 0.12, CAS: 0.25, FCT: 0.12 }, aes: ['Azole: OPORNOŚĆ (ERG11)', 'PATOGEN ALARMOWY – natychmiast powiadom zespół kontroli zakażeń!'], genes: [] } }
    },
    CGL: {
      name: 'Nakaseomyces glabratus (Candida glabrata)', gram: 'yeast', morph: 'yeast', idCard: 'YST', ast: ['AST-YS08'], group: 'CGL', ox: false, cat: true, ttd: 40, ms: 99.9, mcfIdeal: 2.0,
      col: { COS: { c: '#efece4', s: 0.8, h: '-', n: 'bardzo drobne, białe' }, CHOC: { c: '#e5dfcf', s: 0.8 }, MAC: null, CPS: { c: '#f0ece4', s: 0.6 }, CAN: { c: '#c4a7c2', s: 1.2, n: 'różowo-fioletowe' }, SGC: { c: '#f0ecdf', s: 1.2 }, SS: null, SALM: null, MHE: null, MHF: null },
      key: {}, phenos: { WT: { name: 'Fenotyp dziki (SDD dla flukonazolu)', mic: { FLU: 8, VOR: 0.25, AMB: 0.5, MCF: 0.016, CAS: 0.12, FCT: 0.06 }, aes: ['Flukonazol: wrażliwość zależna od dawki (naturalnie obniżona)'], genes: [] } }
    }
  };

  /* Mapowanie drobnoustrój → cele paneli BIOFIRE */
  const BF_MAP = {
    ECO: ['Enterobacterales', 'Escherichia coli'], KPN: ['Enterobacterales', 'Klebsiella pneumoniae group'], PMI: ['Enterobacterales', 'Proteus spp.'],
    ECL: ['Enterobacterales', 'Enterobacter cloacae complex'], SEN: ['Enterobacterales', 'Salmonella spp.'], PAE: ['Pseudomonas aeruginosa'],
    ABA: ['Acinetobacter calcoaceticus-baumannii complex'], HIN: ['Haemophilus influenzae'], NME: ['Neisseria meningitidis'],
    SAU: ['Staphylococcus spp.', 'Staphylococcus aureus'], SEP: ['Staphylococcus spp.', 'Staphylococcus epidermidis'],
    EFA: ['Enterococcus faecalis'], EFM: ['Enterococcus faecium'], SPN: ['Streptococcus spp.', 'Streptococcus pneumoniae'],
    SAG: ['Streptococcus spp.', 'Streptococcus agalactiae'], SPY: ['Streptococcus spp.', 'Streptococcus pyogenes'],
    LMO: ['Listeria monocytogenes'], CAL: ['Candida albicans'], CAU: ['Candida auris'], CGL: ['Candida glabrata']
  };
  const GENE_MAP = { 'CTX-M': 'CTX-M', KPC: 'KPC', NDM: 'NDM', 'OXA-48-like': 'OXA-48-like', VIM: 'VIM', 'mecA/C': 'mecA/C', MREJ: 'mecA/C and MREJ (MRSA)', 'vanA/B': 'vanA/B' };

  /* ---------- PANELE BIOFIRE ---------- */
  const PANELS = {
    BCID2: {
      name: 'BIOFIRE® Blood Culture Identification 2 (BCID2)', short: 'BCID2', sample: 'Dodatnia butelka posiewu krwi (0,2 mL)', time: 60, color: '#d6242f',
      groups: {
        'Bakterie Gram-dodatnie': ['Enterococcus faecalis', 'Enterococcus faecium', 'Listeria monocytogenes', 'Staphylococcus spp.', 'Staphylococcus aureus', 'Staphylococcus epidermidis', 'Staphylococcus lugdunensis', 'Streptococcus spp.', 'Streptococcus agalactiae', 'Streptococcus pneumoniae', 'Streptococcus pyogenes'],
        'Bakterie Gram-ujemne': ['Acinetobacter calcoaceticus-baumannii complex', 'Bacteroides fragilis', 'Enterobacterales', 'Enterobacter cloacae complex', 'Escherichia coli', 'Klebsiella aerogenes', 'Klebsiella oxytoca', 'Klebsiella pneumoniae group', 'Proteus spp.', 'Salmonella spp.', 'Serratia marcescens', 'Haemophilus influenzae', 'Neisseria meningitidis', 'Pseudomonas aeruginosa', 'Stenotrophomonas maltophilia'],
        'Drożdżaki': ['Candida albicans', 'Candida auris', 'Candida glabrata', 'Candida krusei', 'Candida parapsilosis', 'Candida tropicalis', 'Cryptococcus neoformans/gattii'],
        'Geny oporności': ['CTX-M', 'IMP', 'KPC', 'mcr-1', 'NDM', 'OXA-48-like', 'VIM', 'mecA/C', 'mecA/C and MREJ (MRSA)', 'vanA/B']
      }
    },
    RP21: {
      name: 'BIOFIRE® Respiratory 2.1 (RP2.1)', short: 'RP2.1', sample: 'Wymaz z nosogardła w VTM/UTM (0,3 mL)', time: 45, color: '#1e7fc2',
      groups: {
        'Wirusy': ['Adenovirus', 'Coronavirus 229E', 'Coronavirus HKU1', 'Coronavirus NL63', 'Coronavirus OC43', 'SARS-CoV-2', 'Human Metapneumovirus', 'Human Rhinovirus/Enterovirus', 'Influenza A', 'Influenza A/H1', 'Influenza A/H3', 'Influenza A/H1-2009', 'Influenza B', 'Parainfluenza Virus 1', 'Parainfluenza Virus 2', 'Parainfluenza Virus 3', 'Parainfluenza Virus 4', 'Respiratory Syncytial Virus'],
        'Bakterie': ['Bordetella parapertussis (IS1001)', 'Bordetella pertussis (ptxP)', 'Chlamydia pneumoniae', 'Mycoplasma pneumoniae']
      }
    },
    PN: {
      name: 'BIOFIRE® FILMARRAY® Pneumonia (PN)', short: 'PN', sample: 'BAL / plwocina / aspirat tchawiczy (0,2 mL)', time: 60, color: '#6b3fa0', semiQ: true,
      groups: {
        'Bakterie (półilościowo, kopie/mL)': ['Acinetobacter calcoaceticus-baumannii complex', 'Enterobacter cloacae complex', 'Escherichia coli', 'Haemophilus influenzae', 'Klebsiella aerogenes', 'Klebsiella oxytoca', 'Klebsiella pneumoniae group', 'Moraxella catarrhalis', 'Proteus spp.', 'Pseudomonas aeruginosa', 'Serratia marcescens', 'Staphylococcus aureus', 'Streptococcus agalactiae', 'Streptococcus pneumoniae', 'Streptococcus pyogenes'],
        'Bakterie atypowe': ['Chlamydia pneumoniae', 'Legionella pneumophila', 'Mycoplasma pneumoniae'],
        'Wirusy': ['Adenovirus', 'Coronavirus', 'Human Metapneumovirus', 'Human Rhinovirus/Enterovirus', 'Influenza A', 'Influenza B', 'Parainfluenza Virus', 'Respiratory Syncytial Virus'],
        'Geny oporności': ['CTX-M', 'IMP', 'KPC', 'NDM', 'OXA-48-like', 'VIM', 'mecA/C and MREJ (MRSA)']
      }
    },
    ME: {
      name: 'BIOFIRE® FILMARRAY® Meningitis/Encephalitis (ME)', short: 'ME', sample: 'Płyn mózgowo-rdzeniowy (0,2 mL)', time: 60, color: '#0f9d8a',
      groups: {
        'Bakterie': ['Escherichia coli K1', 'Haemophilus influenzae', 'Listeria monocytogenes', 'Neisseria meningitidis', 'Streptococcus agalactiae', 'Streptococcus pneumoniae'],
        'Wirusy': ['Cytomegalovirus (CMV)', 'Enterovirus', 'Herpes simplex virus 1', 'Herpes simplex virus 2', 'Human herpesvirus 6', 'Human parechovirus', 'Varicella zoster virus'],
        'Grzyby': ['Cryptococcus neoformans/gattii']
      }
    },
    GI: {
      name: 'BIOFIRE® FILMARRAY® Gastrointestinal (GI)', short: 'GI', sample: 'Kał w podłożu Cary-Blair (0,2 mL)', time: 60, color: '#b5651d',
      groups: {
        'Bakterie': ['Campylobacter (jejuni/coli/upsaliensis)', 'Clostridioides difficile toxin A/B', 'Plesiomonas shigelloides', 'Salmonella', 'Vibrio (parahaemolyticus/vulnificus/cholerae)', 'Vibrio cholerae', 'Yersinia enterocolitica', 'Enteroaggregative E. coli (EAEC)', 'Enteropathogenic E. coli (EPEC)', 'Enterotoxigenic E. coli (ETEC) lt/st', 'Shiga-like toxin-producing E. coli (STEC) stx1/stx2', 'E. coli O157', 'Shigella/Enteroinvasive E. coli (EIEC)'],
        'Pasożyty': ['Cryptosporidium', 'Cyclospora cayetanensis', 'Entamoeba histolytica', 'Giardia lamblia'],
        'Wirusy': ['Adenovirus F40/41', 'Astrovirus', 'Norovirus GI/GII', 'Rotavirus A', 'Sapovirus']
      }
    },
    JI: {
      name: 'BIOFIRE® Joint Infection (JI)', short: 'JI', sample: 'Płyn stawowy (0,2 mL)', time: 60, color: '#7a8a12',
      groups: {
        'Bakterie Gram-dodatnie': ['Anaerococcus prevotii/vaginalis', 'Clostridium perfringens', 'Cutibacterium avidum/granulosum', 'Enterococcus faecalis', 'Enterococcus faecium', 'Finegoldia magna', 'Parvimonas micra', 'Peptoniphilus', 'Peptostreptococcus anaerobius', 'Staphylococcus aureus', 'Staphylococcus lugdunensis', 'Streptococcus spp.', 'Streptococcus agalactiae', 'Streptococcus pneumoniae', 'Streptococcus pyogenes'],
        'Bakterie Gram-ujemne': ['Bacteroides fragilis', 'Citrobacter', 'Enterobacter cloacae complex', 'Escherichia coli', 'Haemophilus influenzae', 'Kingella kingae', 'Klebsiella aerogenes', 'Klebsiella pneumoniae group', 'Morganella morganii', 'Neisseria gonorrhoeae', 'Proteus spp.', 'Pseudomonas aeruginosa', 'Salmonella spp.', 'Serratia marcescens'],
        'Drożdżaki': ['Candida spp.', 'Candida albicans'],
        'Geny oporności': ['CTX-M', 'IMP', 'KPC', 'mecA/C and MREJ (MRSA)', 'NDM', 'OXA-48-like', 'vanA/B', 'VIM']
      }
    },
    RST: {
      name: 'BIOFIRE® SPOTFIRE® Respiratory/Sore Throat (R/ST)', short: 'SPOTFIRE R/ST', sample: 'Wymaz z nosogardła lub gardła', time: 15, color: '#e0442b', spotfire: true,
      groups: {
        'Wirusy': ['Adenovirus', 'Coronavirus (sezonowe)', 'SARS-CoV-2', 'Human Metapneumovirus', 'Human Rhinovirus/Enterovirus', 'Influenza A', 'Influenza B', 'Parainfluenza Virus', 'Respiratory Syncytial Virus'],
        'Bakterie': ['Bordetella parapertussis', 'Bordetella pertussis', 'Chlamydia pneumoniae', 'Mycoplasma pneumoniae', 'Streptococcus dysgalactiae', 'Streptococcus pyogenes (GAS)']
      }
    }
  };

  /* ---------- TESTY VIDAS ---------- */
  const VIDAS = {
    PCT: { name: 'VIDAS® B·R·A·H·M·S PCT™', unit: 'ng/mL', min: 0.05, max: 200, time: 20, sample: 'surowica / osocze (Li-heparyna)', vol: 200, color: '#c0392b',
      interp: v => v < 0.5 ? 'Niskie ryzyko ciężkiej infekcji bakteryjnej/sepsy' : v < 2 ? 'Możliwa infekcja ogólnoustrojowa – powtórzyć za 6–24 h' : v < 10 ? 'Wysokie ryzyko sepsy' : 'Bardzo wysokie ryzyko ciężkiej sepsy / wstrząsu septycznego', ref: '< 0,5 ng/mL' },
    DD2: { name: 'VIDAS® D-Dimer Exclusion™ II', unit: 'ng/mL FEU', min: 45, max: 10000, time: 20, sample: 'osocze cytrynianowe', vol: 200, color: '#8e44ad',
      interp: v => v < 500 ? 'Poniżej progu wykluczenia – ŻChZZ/ZTP mało prawdopodobna (przy niskim/umiarkowanym PTP)' : 'Powyżej progu – nie można wykluczyć ŻChZZ/ZTP; diagnostyka obrazowa', ref: '< 500 ng/mL FEU' },
    TNHS: { name: 'VIDAS® High sensitive Troponin I', unit: 'ng/L', min: 1.5, max: 40000, time: 20, sample: 'osocze Li-heparyna', vol: 200, color: '#d35400',
      interp: v => v <= 19 ? 'Poniżej 99. percentyla (demo: 19 ng/L)' : 'Powyżej 99. percentyla – ocenić dynamikę (0/1–3 h), możliwy zawał', ref: '≤ 19 ng/L (99. percentyl, demo)' },
    NTBNP: { name: 'VIDAS® NT-proBNP2', unit: 'pg/mL', min: 15, max: 25000, time: 20, sample: 'surowica / osocze', vol: 200, color: '#16a085',
      interp: v => v < 125 ? 'Niewydolność serca mało prawdopodobna' : 'Podwyższone – możliwa niewydolność serca', ref: '< 125 pg/mL' },
    HIV: { name: 'VIDAS® HIV DUO Ultra', unit: 'indeks', min: 0, max: 100, time: 120, sample: 'surowica / osocze', vol: 200, color: '#2c3e50', qual: true,
      interp: v => v < 0.25 ? 'UJEMNY (Ag p24 i przeciwciała anty-HIV-1/2 niewykryte)' : 'DODATNI/REAKTYWNY – wymagane badanie potwierdzenia', ref: 'indeks < 0,25' },
    TXG: { name: 'VIDAS® TOXO IgG II', unit: 'IU/mL', min: 0, max: 300, time: 40, sample: 'surowica', vol: 100, color: '#27ae60',
      interp: v => v < 4 ? 'UJEMNY – brak odporności' : v < 8 ? 'GRANICZNY – powtórzyć za 2–3 tyg.' : 'DODATNI – kontakt z T. gondii (oznacz IgM i awidność)', ref: '< 4 IU/mL ujemny; ≥ 8 dodatni' },
    TXM: { name: 'VIDAS® TOXO IgM', unit: 'indeks', min: 0, max: 20, time: 40, sample: 'surowica', vol: 100, color: '#229954', qual: true,
      interp: v => v < 0.55 ? 'UJEMNY' : v < 0.65 ? 'GRANICZNY' : 'DODATNI – możliwe świeże zakażenie; oznacz awidność IgG (VIDAS TOXO IgG AVIDITY)', ref: 'indeks < 0,55' },
    TXA: { name: 'VIDAS® TOXO IgG AVIDITY', unit: 'indeks awidności', min: 0, max: 1, time: 40, sample: 'surowica', vol: 100, color: '#1e8449', qual: true,
      interp: v => v >= 0.3 ? 'WYSOKA awidność – zakażenie > 4 mies. temu' : v >= 0.2 ? 'NIEJEDNOZNACZNA' : 'NISKA awidność – nie wyklucza świeżego zakażenia', ref: '≥ 0,300 wysoka' },
    CMVG: { name: 'VIDAS® CMV IgG', unit: 'AU/mL', min: 0, max: 200, time: 40, sample: 'surowica', vol: 100, color: '#5d6d7e',
      interp: v => v < 4 ? 'UJEMNY' : v < 6 ? 'GRANICZNY' : 'DODATNI', ref: '< 4 AU/mL' },
    FER: { name: 'VIDAS® Ferritin', unit: 'ng/mL', min: 1.5, max: 1200, time: 30, sample: 'surowica / osocze', vol: 100, color: '#a04000',
      interp: v => v < 15 ? 'Niskie – niedobór żelaza' : v > 400 ? 'Podwyższone (stan zapalny/przeładowanie Fe)' : 'W normie', ref: '15–400 ng/mL (demo)' },
    TSH: { name: 'VIDAS® TSH3', unit: 'µIU/mL', min: 0.005, max: 100, time: 40, sample: 'surowica / osocze', vol: 200, color: '#2471a3',
      interp: v => v < 0.25 ? 'Obniżone – możliwa nadczynność' : v > 5 ? 'Podwyższone – możliwa niedoczynność' : 'W normie', ref: '0,25–5,0 µIU/mL' },
    HBS: { name: 'VIDAS® HBs Ag Ultra', unit: 'indeks', min: 0, max: 100, time: 90, sample: 'surowica / osocze', vol: 150, color: '#7d3c98', qual: true,
      interp: v => v < 0.13 ? 'UJEMNY' : 'DODATNI – potwierdzić testem neutralizacji', ref: 'indeks < 0,13' },
    VITD: { name: 'VIDAS® 25 OH Vitamin D Total', unit: 'ng/mL', min: 8.1, max: 126, time: 40, sample: 'surowica / osocze', vol: 100, color: '#d4ac0d',
      interp: v => v < 20 ? 'Niedobór' : v < 30 ? 'Stężenie suboptymalne' : v <= 50 ? 'Optymalne' : 'Wysokie', ref: '30–50 ng/mL' }
  };

  /* ---------- BUTELKI BacT/ALERT ---------- */
  const BOTTLES = {
    FA: { name: 'BacT/ALERT® FA Plus', desc: 'tlenowa z żywicą adsorbującą antybiotyki', cap: '#2e8b3e', vol: [8, 10], aer: true },
    FN: { name: 'BacT/ALERT® FN Plus', desc: 'beztlenowa z żywicą', cap: '#e07b1a', vol: [8, 10], aer: false },
    PF: { name: 'BacT/ALERT® PF Plus', desc: 'pediatryczna, tlenowa z żywicą', cap: '#e5c21a', vol: [0.5, 4], aer: true },
    SA: { name: 'BacT/ALERT® SA', desc: 'standardowa tlenowa (bez żywicy)', cap: '#3a6fc4', vol: [5, 10], aer: true },
    MP: { name: 'BacT/ALERT® MP', desc: 'prątki (płyny, materiały po dekontaminacji)', cap: '#8a8a8a', vol: [0.5, 10], aer: true, myco: true }
  };

  /* ---------- KATALOG APARATÓW (encyklopedia) ---------- */
  const INSTR = {
    vitek2: { name: 'VITEK® 2 Compact', cat: 'Mikrobiologia – ID/AST', url: 'https://www.biomerieux.com/corp/en/our-offer/clinical-products/vitek-2-healthcare.html',
      what: 'Zautomatyzowany system identyfikacji (ID) i oznaczania lekowrażliwości (AST) bakterii i drożdżaków na podstawie kart z odczynnikami w mikrostudzienkach. Pomiar kolorymetryczny/fluorescencyjny co 15 min, interpretacja przez Advanced Expert System™ (AES).',
      how: ['Przygotuj zawiesinę z czystej hodowli 18–24 h w 3 mL 0,45% NaCl.', 'Zmierz gęstość densytometrem DensiCHEK™ (GN/GP: 0,50–0,63 McF; YST: 1,80–2,20).', 'Dla AST przenieś 145 µL (GN) lub 280 µL (GP/YST) do drugiej probówki z 3 mL soli.', 'Umieść probówki i karty w kasecie, zeskanuj kody kart.', 'Wsuń kasetę do komory napełniania (próżnia), potem do komory ładowania.', 'Odbierz wyniki: ID z prawdopodobieństwem %, MIC + kategoria S/I/R, fenotyp AES.'],
      specs: 'Pojemność: 15/30/60 kart (Compact) · czas ID: 5–10 h · AST: 6–12 h · zawiesina zużyta w ≤ 30 min' },
    vitekms: { name: 'VITEK® MS PRIME', cat: 'Mikrobiologia – identyfikacja MALDI-TOF', url: 'https://www.biomerieux.com/vitek-ms-prime',
      what: 'Spektrometr mas MALDI-TOF. Białka rybosomalne drobnoustroju są jonizowane laserem w matrycy CHCA, a czas przelotu jonów tworzy „odcisk palca” widma porównywany z bazą danych IVD.',
      how: ['Nanieś kolonię na pole tarczki VITEK® MS-DS (48 pól, 3 grupy po 16) pałeczką VITEK® PICKME™ lub ezą.', 'Dla drożdżaków dodaj 0,5 µL VITEK® MS-FA (kwas mrówkowy) i wysusz.', 'Nanieś 1 µL matrycy VITEK® MS-CHCA i wysusz.', 'Na pola kalibracyjne nanieś szczep E. coli ATCC® 8739 (kalibrant).', 'Załaduj tarczkę – system „load & go” przyjmuje do 16 tarczek, z priorytetem dla pilnych.', 'Odczytaj: pojedynczy wybór (%), niska dyskryminacja lub brak identyfikacji.'],
      specs: 'Do 16 tarczek w ciągłym ładowaniu · priorytet „pilne” · wynik w minutach od akwizycji' },
    virtuo: { name: 'BacT/ALERT® VIRTUO®', cat: 'Mikrobiologia – posiewy krwi', url: 'https://www.biomerieux.com/corp/en/our-offer/clinical-products/bact-alert-virtuo.html',
      what: 'Automatyczny system do inkubacji i monitorowania butelek posiewowych. Kolorymetryczny czujnik CO₂ w dnie butelki zmienia barwę wraz ze wzrostem drobnoustrojów; algorytm sygnalizuje butelkę dodatnią. VIRTUO automatycznie ładuje butelki i mierzy poziom napełnienia krwią.',
      how: ['Pobierz krew: dorosły 8–10 mL na butelkę (FA Plus + FN Plus = 1 zestaw).', 'Zeskanuj butelkę, włóż do portu ładowania – robot umieszcza ją w komórce.', 'System mierzy objętość krwi i ostrzega o niedopełnieniu.', 'Inkubacja 35–37 °C z mieszaniem, odczyt co 10 min, protokół standardowo 5 dni.', 'Butelka dodatnia → alarm, wyjęcie, preparat Grama, BIOFIRE BCID2, posiew.'],
      specs: 'Pojemność modułu: do 428 butelek · odczyt co 10 min · pomiar objętości krwi' },
    biofire: { name: 'BIOFIRE® FILMARRAY® TORCH / 2.0', cat: 'Diagnostyka molekularna – syndromiczny multipleks PCR', url: 'https://www.biomerieux.com/corp/en/our-offer/point-of-care/product-range/biofire-syndromic-approach-pcr-testing-and-diagnostics.html',
      what: 'Zamknięty system multipleks PCR: ekstrakcja kwasów nukleinowych, PCR I (multipleks), zagnieżdżony PCR II w matrycy studzienek i analiza krzywych topnienia (melt) – wszystko w jednej kasecie (pouch). Wynik ok. 45–60 min, ok. 2 min pracy ręcznej.',
      how: ['Umieść kasetę w stacji ładowania (Pouch Loading Station).', 'Nastrzyknij płyn hydratacyjny (niebieska fiolka) do portu hydratacji.', 'Dodaj próbkę do fiolki z buforem (Sample Buffer), wymieszaj, nastrzyknij do portu próbki (czerwona).', 'Zeskanuj kasetę i próbkę, włóż do modułu TORCH.', 'Odczytaj raport: wykryte/niewykryte, geny oporności, kontrola procesu.'],
      specs: 'TORCH: 2–12 modułów · ~45–60 min · panele: BCID2, RP2.1, PN, ME, GI, JI' },
    spotfire: { name: 'BIOFIRE® SPOTFIRE®', cat: 'POCT – multipleks PCR przy pacjencie', url: 'https://www.biomerieux.com/corp/en/our-offer/point-of-care.html',
      what: 'Kompaktowy system PCR do miejsca opieki nad pacjentem (POC). Panel Respiratory/Sore Throat z wynikiem w ok. 15 minut.',
      how: ['Wymaz → probówka z buforem.', 'Napełnij kasetę.', 'Włóż do aparatu i rozpocznij.', 'Wynik po ~15 min.'], specs: 'Wynik ~15 min · panele R i R/ST' },
    vidas: { name: 'VIDAS® 3 / mini VIDAS®', cat: 'Immunodiagnostyka – ELFA', url: 'https://www.biomerieux.com/corp/en/our-offer/clinical-products/vidas-3.html',
      what: 'Automatyczny analizator immunoenzymatyczny z detekcją fluorescencyjną (ELFA). Stożek SPR® (Solid Phase Receptacle) działa jak pipeta i faza stała, paski odczynnikowe zawierają gotowe odczynniki. Fluorescencja 4-MU mierzona przy 450 nm.',
      how: ['Wyjmij zestaw z lodówki (2–8 °C), doprowadź do temp. pokojowej.', 'Zeskanuj kod MLE karty kalibracyjnej przy nowej serii.', 'Włóż pasek i stożek SPR® do sekcji.', 'Odpipetuj próbkę (100–200 µL) do studzienki paska.', 'Rozpocznij – wynik zależny od testu (np. PCT/D-Dimer/TnI ok. 20 min).', 'Wynik: RFV → stężenie wg krzywej kalibracyjnej, interpretacja.'],
      specs: 'VIDAS 3: 4 sekcje × 3 pozycje · mini VIDAS: 2 × 6 · menu > 100 testów' },
    densichek: { name: 'VITEK® DENSICHEK® Plus', cat: 'Akcesorium – densytometr', url: 'https://www.biomerieux.com/corp/en/our-offer/clinical-products/vitek-2-healthcare.html',
      what: 'Densytometr mierzący zmętnienie zawiesiny w jednostkach McFarlanda (0,00–4,00). Weryfikowany wzorcami McFarlanda.', how: ['Wyzeruj na probówce z czystą solą.', 'Włóż probówkę z zawiesiną, obróć – odczytaj McF.', 'Dodaj soli (rozcieńcz) lub kolonii (zagęść) aż do zakresu.'], specs: 'Zakres 0,00–4,00 McF · wzorce 0,0 / 0,5 / 2,0 / 3,0 McF' },
    isola: { name: 'PREVI® Isola', cat: 'Automatyzacja preanalityki', url: 'https://www.biomerieux.com',
      what: 'Automatyczny posiewacz płytek: dozuje próbkę płynną i rozprowadza ją aplikatorem typu „grzebień” po spirali, co daje powtarzalne kolonie izolowane.', how: ['Załaduj płytki do magazynków.', 'Wstaw probówki z próbkami.', 'Wybierz protokół (objętość 1/10 µL) i podłoża.', 'Odbierz posiane, oznakowane płytki.'], specs: 'Do ~180 płytek/h · objętość 1–30 µL' },
    gram: { name: 'PREVI® Color Gram', cat: 'Automatyzacja – barwienie Grama', url: 'https://www.biomerieux.com',
      what: 'Automatyczny barwiarz preparatów metodą Grama – standaryzuje barwienie (fiolet krystaliczny, płyn Lugola, odbarwiacz, safranina).', how: ['Utrwal preparat.', 'Włóż szkiełko do karuzeli.', 'Wybierz program (np. hodowla / materiał / krew).', 'Odczytaj pod mikroskopem (imersja ×1000).'], specs: 'Do 30 szkiełek w cyklu' },
    etest: { name: 'ETEST®', cat: 'Lekowrażliwość – gradient MIC', url: 'https://www.biomerieux.com/corp/en/our-offer/clinical-products/etest.html',
      what: 'Pasek z predefiniowanym gradientem stężeń antybiotyku (15 rozcieńczeń). Po inkubacji MIC odczytuje się w miejscu przecięcia elipsy zahamowania wzrostu ze skalą paska.', how: ['Przygotuj zawiesinę 0,5 McF, posiej „murawką” na MHE.', 'Połóż pasek skalą do góry, nie przesuwaj.', 'Inkubuj 16–20 h w 35 °C.', 'Odczytaj MIC w punkcie przecięcia elipsy; wartości pośrednie zaokrąglij w górę.'], specs: 'Zakres 0,016–256 lub 0,002–32 µg/mL' },
    api: { name: 'API® 20 E', cat: 'Identyfikacja biochemiczna – manualna', url: 'https://www.biomerieux.com/corp/en/our-offer/clinical-products/api-id-strips.html',
      what: 'Pasek z 20 mikroprobówkami z odwodnionymi substratami do identyfikacji Enterobacterales i innych G(-). Wynik w postaci 7-cyfrowego profilu numerycznego porównywanego z bazą apiweb™.', how: ['Zawiesina 0,5 McF w 5 mL soli.', 'Napełnij probówki (CIT, VP, GEL – również kopułki; ADH, LDC, ODC, H2S, URE – przykryj olejem).', 'Inkubuj 18–24 h w 36 °C.', 'Dodaj odczynniki: TDA (FeCl₃), JAMES (IND), VP1+VP2 (VP).', 'Odczytaj +/−, zsumuj w triadach (1-2-4) → profil 7-cyfrowy.'], specs: '20 testów + oksydaza · 18–24 h' },
    myla: { name: 'MYLA® / VILINK', cat: 'Oprogramowanie – middleware i walidacja', url: 'https://www.biomerieux.com',
      what: 'Oprogramowanie pośredniczące łączące aparaty mikrobiologiczne z LIS: zbiera wyniki ID/AST/MS/posiewów krwi, umożliwia walidację biomedyczną i wysyłkę raportu.', how: ['Przejrzyj wyniki z aparatów dla próbki.', 'Sprawdź spójność (ID vs AST vs PCR).', 'Zatwierdź (walidacja techniczna i medyczna).', 'Wyślij raport do lekarza.'], specs: 'Integracja: VITEK 2, VITEK MS, BacT/ALERT, BIOFIRE' },
    tempo: { name: 'TEMPO®', cat: 'Przemysł – oznaczanie liczby drobnoustrojów', url: 'https://www.biomerieux.com/corp/en/our-offer/industry-products.html',
      what: 'Zautomatyzowane liczenie wskaźników jakości żywności (TVC, Enterobacteriaceae, E. coli, koliformy, S. aureus, drożdże/pleśnie) metodą NPL (MPN) w kartach z 48 studzienkami o 3 objętościach.', how: ['Homogenizuj próbkę 1:10.', 'Dodaj 1 mL do fiolki z podłożem TEMPO.', 'Stacja napełnia i zgrzewa kartę.', 'Inkubuj 22–48 h, czytnik liczy studzienki fluorescencyjne → jtk/g.'], specs: 'Zakres 1–4,9×10⁴ jtk/g (bez rozcieńczeń)' },
    geneup: { name: 'GENE-UP®', cat: 'Przemysł – PCR patogenów w żywności', url: 'https://www.biomerieux.com/corp/en/our-offer/industry-products.html',
      what: 'System real-time PCR do wykrywania Salmonella, Listeria, STEC, Campylobacter i in. w żywności i środowisku po namnożeniu.', how: ['Namnażanie w bulionie (np. 18–24 h).', 'Liza próbki.', 'PCR w aparacie ~1 h.', 'Wynik: wykryto/nie wykryto.'], specs: 'Do 96 próbek / cykl' }
  };

  /* ---------- SCENARIUSZE KLINICZNE ---------- */
  const CASES = [
    { id: 'C01', title: 'Niepowikłane ZUM', diff: 1, patient: 'Anna K., 34 l., K', ward: 'Poradnia POZ', clin: 'Dyzuria, częstomocz od 2 dni. Bez gorączki. Nie przyjmowała antybiotyków.',
      specimens: [{ type: 'URINE', label: 'Mocz – środkowy strumień', orgs: [['ECO', 'WT', 1e5]] }], goal: 'Posiej mocz na chromID CPS Elite, zidentyfikuj patogen (VITEK MS PRIME lub VITEK 2 GN) i wykonaj AST (AST-N352). Zwaliduj w MYLA.', tip: 'Liczba ≥10⁵ CFU/mL jednego gatunku = znamienna bakteriuria.' },
    { id: 'C02', title: 'Odmiedniczkowe zapalenie nerek – ESBL', diff: 2, patient: 'Jan W., 71 l., M', ward: 'Oddział Urologii', clin: 'Gorączka 39 °C, ból okolicy lędźwiowej. Cewnik moczowy. Hospitalizowany 2 mies. temu.',
      specimens: [{ type: 'URINE', label: 'Mocz z cewnika', orgs: [['KPN', 'ESBL', 1e5]] }, { type: 'SERUM', label: 'Surowica', vidas: { PCT: 3.8 } }], goal: 'Zidentyfikuj patogen, wykryj mechanizm oporności (AES), oznacz PCT na VIDAS.', tip: 'chromID ESBL pozwala na szybki skrining. Sprawdź fenotyp AES!' },
    { id: 'C03', title: 'Wstrząs septyczny na OIT – KPC', diff: 3, patient: 'Marek Z., 58 l., M', ward: 'OIT', clin: 'Wstrząs septyczny, MAP 55 mmHg na noradrenalinie. 3 tydz. hospitalizacji. Pacjent z Włoch.',
      specimens: [{ type: 'BLOOD', label: 'Krew – zestaw 1 (FA Plus + FN Plus)', orgs: [['KPN', 'KPC', 1]] }, { type: 'SERUM', label: 'Surowica', vidas: { PCT: 48.2 } }], goal: 'Załaduj butelki do BacT/ALERT VIRTUO, po alarmie wykonaj preparat Grama i BIOFIRE BCID2 bezpośrednio z butelki. Potwierdź AST na VITEK 2 i ETEST meropenem.', tip: 'Wykrycie KPC w BCID2 zmienia terapię w ciągu ok. 1 h – ceftazydym/awibaktam.' },
    { id: 'C04', title: 'Bakteriemia odcewnikowa – MRSA', diff: 2, patient: 'Ewa P., 45 l., K', ward: 'Hematologia', clin: 'Gorączka po podaniu leku przez cewnik centralny. Zaczerwienienie w miejscu wkłucia.',
      specimens: [{ type: 'BLOOD', label: 'Krew z cewnika (FA Plus)', orgs: [['SAU', 'MRSA', 1]] }], goal: 'Posiew krwi → BCID2 (S. aureus + mecA/C i MREJ) → VITEK 2 AST-P592 → ETEST wankomycyny.', tip: 'Przy MRSA określ MIC wankomycyny – ETEST to dobra metoda referencyjna.' },
    { id: 'C05', title: 'Zapalenie opon u noworodka', diff: 3, patient: 'Noworodek Nowak, 6 dni', ward: 'Neonatologia', clin: 'Drgawki, gorączka, napięte ciemiączko. Matka – brak skriningu GBS.',
      specimens: [{ type: 'CSF', label: 'Płyn mózgowo-rdzeniowy', orgs: [['SAG', 'WT', 1e4]] }, { type: 'BLOOD', label: 'Krew (PF Plus)', orgs: [['SAG', 'WT', 1]] }], goal: 'BIOFIRE ME z PMR, posiew na COS/CHOC, identyfikacja MALDI-TOF, AST-ST03.', tip: 'Panel ME daje wynik w ~1 h – kluczowe przy zapaleniu opon.' },
    { id: 'C06', title: 'Infekcja oddechowa na SOR', diff: 1, patient: 'Tomasz B., 29 l., M', ward: 'SOR', clin: 'Gorączka, kaszel, bóle mięśni od 24 h. Sezon grypowy.',
      specimens: [{ type: 'NPS', label: 'Wymaz z nosogardła (UTM)', bf: ['Influenza A', 'Influenza A/H1-2009'] }], goal: 'Wykonaj BIOFIRE RP2.1 (lub SPOTFIRE R/ST) i zinterpretuj wynik.', tip: 'Influenza A + podtyp H1-2009 = grypa A(H1N1)pdm09.' },
    { id: 'C07', title: 'Biegunka po podróży', diff: 2, patient: 'Karolina M., 26 l., K', ward: 'Oddział Zakaźny', clin: 'Biegunka z domieszką krwi, gorączka po powrocie z Tajlandii.',
      specimens: [{ type: 'STOOL', label: 'Kał (Cary-Blair)', orgs: [['SEN', 'WT', 1e6]], bf: ['Salmonella', 'Campylobacter (jejuni/coli/upsaliensis)'] }], goal: 'BIOFIRE GI, posiew na chromID Salmonella Elite i SS, identyfikacja API 20 E.', tip: 'Koinfekcje są częste – panel GI wykrywa je jednocześnie.' },
    { id: 'C08', title: 'Kandydemia – patogen alarmowy', diff: 3, patient: 'Stanisław R., 66 l., M', ward: 'Kardiochirurgia', clin: 'Gorączka nieustępująca mimo meropenemu. Długotrwała hospitalizacja, żywienie pozajelitowe.',
      specimens: [{ type: 'BLOOD', label: 'Krew (FA Plus)', orgs: [['CAU', 'WT', 1]] }], goal: 'BacT/ALERT → Gram (drożdżaki) → BCID2 → posiew na chromID Candida → VITEK MS (z kwasem mrówkowym) → AST-YS08.', tip: 'C. auris nie barwi się na niebiesko na chromID Candida i często jest oporna na flukonazol.' },
    { id: 'C09', title: 'Ból w klatce piersiowej i duszność', diff: 1, patient: 'Barbara L., 62 l., K', ward: 'SOR', clin: 'Nagła duszność po długim locie, tachykardia. Ból zamostkowy.',
      specimens: [{ type: 'PLASMA', label: 'Osocze cytrynianowe + Li-heparyna', vidas: { DD2: 2840, TNHS: 64, NTBNP: 890 } }], goal: 'Oznacz na VIDAS: D-Dimer Exclusion II, hs-Troponin I, NT-proBNP2. Zinterpretuj.', tip: 'D-dimer > 500 ng/mL FEU nie wyklucza ZTP – wskazana angio-TK.' },
    { id: 'C10', title: 'Toksoplazmoza w ciąży', diff: 2, patient: 'Magda S., 31 l., K (12 tydz. ciąży)', ward: 'Poradnia K', clin: 'Rutynowe badania prenatalne. Kontakt z kotem.',
      specimens: [{ type: 'SERUM', label: 'Surowica', vidas: { TXG: 46, TXM: 2.1, TXA: 0.12, CMVG: 18 } }], goal: 'Oznacz TOXO IgG II, TOXO IgM i awidność IgG. Oceń ryzyko świeżego zakażenia.', tip: 'IgM+ i niska awidność → nie można wykluczyć zakażenia w ciągu ostatnich 4 mies.' },
    { id: 'C11', title: 'Respiratorowe zapalenie płuc (VAP)', diff: 3, patient: 'Piotr G., 54 l., M', ward: 'OIT', clin: '7 doba wentylacji mechanicznej, nowy naciek w RTG, ropna wydzielina.',
      specimens: [{ type: 'BAL', label: 'BAL', orgs: [['PAE', 'MDR', 1e6]], bf: [], bfq: { 'Pseudomonas aeruginosa': '10^6' } }], goal: 'BIOFIRE Pneumonia (półilościowo), posiew ilościowy, ID MALDI-TOF, AST-N222.', tip: 'Brak genów karbapenemaz przy oporności na karbapenemy → mechanizm nieenzymatyczny (OprD).' },
    { id: 'C12', title: 'Zakażenie protezy stawu', diff: 2, patient: 'Helena T., 77 l., K', ward: 'Ortopedia', clin: 'Ból i obrzęk kolana 3 mies. po endoprotezoplastyce, przetoka.',
      specimens: [{ type: 'SYN', label: 'Płyn stawowy', orgs: [['EFA', 'WT', 1e4]] }], goal: 'BIOFIRE JI, posiew, identyfikacja i AST-P586.', tip: 'Enterococcus ma naturalną oporność na cefalosporyny.' },
    { id: 'C13', title: 'Skrining nosicielstwa VRE', diff: 1, patient: 'Zofia N., 80 l., K', ward: 'Oddział Wewnętrzny', clin: 'Przyjęcie z ZOL – skrining zgodnie z procedurą szpitalną.',
      specimens: [{ type: 'RECT', label: 'Wymaz z odbytu', orgs: [['EFM', 'VRE', 1e5], ['ECO', 'WT', 1e6]] }], goal: 'Posiej na chromID VRE, potwierdź ID (MALDI-TOF) i oporność (VITEK 2 AST-P586).', tip: 'Fioletowe kolonie na chromID VRE = E. faecium.' },
    { id: 'C14', title: 'Pozaszpitalne zapalenie płuc', diff: 2, patient: 'Leon D., 68 l., M', ward: 'Pulmonologia', clin: 'Gorączka, dreszcze, kaszel z rdzawą plwociną. Naciek w płacie dolnym prawym.',
      specimens: [{ type: 'BLOOD', label: 'Krew (FA Plus + FN Plus)', orgs: [['SPN', 'PNSP', 1]] }, { type: 'SERUM', label: 'Surowica', vidas: { PCT: 12.4 } }], goal: 'Posiew krwi, BCID2, posiew na COS (α-hemoliza), ID, AST-ST03; PCT.', tip: 'Sprawdź MIC penicyliny – interpretacja zależy od postaci klinicznej.' },
    { id: 'C15', title: 'Sepsa moczopochodna – CRAB/MBL', diff: 3, patient: 'Wiesław K., 73 l., M', ward: 'OIT', clin: 'Pacjent przeniesiony z Ukrainy, rany pooparzeniowe, gorączka.',
      specimens: [{ type: 'WOUND', label: 'Wymaz z rany', orgs: [['ABA', 'CRAB', 1e6], ['PAE', 'VIM', 1e5]] }], goal: 'Posiej na COS, MAC i chromID CARBA SMART. Rozdziel dwa gatunki, zidentyfikuj każdy i wykonaj AST.', tip: 'Hodowla mieszana: wybierz osobno każdy typ kolonii!' }
  ];

  const SPEC_TYPES = {
    URINE: { name: 'Mocz', icon: '🧪', tube: '#f2d64b', media: ['CPS', 'COS', 'MAC', 'ESBL'] },
    BLOOD: { name: 'Krew – butelki', icon: '🩸', tube: '#b3121f', media: [] },
    CSF: { name: 'Płyn mózgowo-rdzeniowy', icon: '💧', tube: '#e9f1f7', media: ['COS', 'CHOC'] },
    NPS: { name: 'Wymaz z nosogardła', icon: '🦠', tube: '#e67e22', media: [] },
    STOOL: { name: 'Kał', icon: '🟤', tube: '#7b5a3a', media: ['SALM', 'SS', 'MAC'] },
    SERUM: { name: 'Surowica', icon: '🟡', tube: '#e8c547', media: [] },
    PLASMA: { name: 'Osocze', icon: '🔵', tube: '#4aa3df', media: [] },
    BAL: { name: 'BAL', icon: '🫁', tube: '#d8d0b8', media: ['COS', 'CHOC', 'MAC'] },
    SYN: { name: 'Płyn stawowy', icon: '🦴', tube: '#f0e1a0', media: ['COS', 'CHOC'] },
    RECT: { name: 'Wymaz z odbytu', icon: '🧫', tube: '#3a7bd5', media: ['VRE', 'ESBL', 'CARBA'] },
    WOUND: { name: 'Wymaz z rany', icon: '🩹', tube: '#3a7bd5', media: ['COS', 'MAC', 'CARBA', 'CHOC'] },
    BROTH: { name: 'Dodatnia butelka', icon: '🍾', tube: '#2e8b3e', media: ['COS', 'CHOC', 'MAC', 'CAN', 'CPS'] }
  };

  /* ---------- QUIZ ---------- */
  const QUIZ = [
    ['Jaki zakres gęstości (McFarland) wymaga karta VITEK 2 GN?', ['0,50–0,63', '1,80–2,20', '2,70–3,30', '0,10–0,20'], 0],
    ['Jaką objętość zawiesiny przenosi się do karty AST dla bakterii Gram-ujemnych?', ['145 µL', '280 µL', '1 mL', '50 µL'], 0],
    ['Jaką matrycę stosuje się w VITEK MS?', ['CHCA (kwas α-cyjano-4-hydroksycynamonowy)', 'DHB', 'Sinapinowy', 'TMB'], 0],
    ['Po co przy drożdżakach w VITEK MS dodaje się VITEK MS-FA?', ['Kwas mrówkowy ułatwia ekstrakcję białek ze ściany komórkowej', 'Barwi komórki', 'Inaktywuje DNA', 'Jest kalibrantem'], 0],
    ['Jakim szczepem kalibruje się VITEK MS?', ['E. coli ATCC 8739', 'S. aureus ATCC 29213', 'P. aeruginosa ATCC 27853', 'C. albicans ATCC 90028'], 0],
    ['Na czym polega detekcja w BacT/ALERT?', ['Kolorymetryczny czujnik CO₂ w dnie butelki', 'Pomiar ciśnienia', 'Fluorescencja DNA', 'Mętność'], 0],
    ['Ile celów obejmuje panel BIOFIRE BCID2?', ['43', '22', '14', '33'], 0],
    ['Co oznacza wykrycie „mecA/C and MREJ” w BCID2?', ['MRSA', 'MSSA', 'VRE', 'ESBL'], 0],
    ['Jaka technologia detekcji jest stosowana w VIDAS?', ['ELFA – enzymatyczna immunofluorescencja', 'Chemiluminescencja', 'Turbidymetria', 'Nefelometria'], 0],
    ['Próg wykluczenia dla VIDAS D-Dimer Exclusion II wynosi:', ['500 ng/mL FEU', '50 ng/mL', '5000 ng/mL', '0,5 ng/mL'], 0],
    ['Jak odczytuje się MIC w ETEST?', ['W punkcie przecięcia elipsy z paskiem', 'Na środku elipsy', 'Na końcu paska', 'Mierząc średnicę strefy'], 0],
    ['Profil API 20 E powstaje przez:', ['Sumowanie wyników w triadach z wagami 1-2-4', 'Liczenie dodatnich testów', 'Pomiar absorbancji', 'Porównanie z kolorem wzorca'], 0],
    ['Na chromID CPS Elite E. coli tworzy kolonie:', ['Różowo-bordowe', 'Niebieskie', 'Brązowe z halo', 'Białe'], 0],
    ['Jaki gatunek daje fioletowe kolonie na chromID VRE?', ['E. faecium', 'E. faecalis', 'S. aureus', 'E. coli'], 0],
    ['Jak długo może stać zawiesina przed załadowaniem do VITEK 2?', ['≤ 30 min', '≤ 4 h', '≤ 24 h', 'Nie ma limitu'], 0],
    ['Jaka objętość krwi jest zalecana do butelki FA Plus u dorosłego?', ['8–10 mL', '1–2 mL', '20 mL', '0,5 mL'], 0],
    ['Co oznacza wynik VITEK MS „Low discrimination”?', ['Kilka taksonów o podobnym widmie – potrzebny test dodatkowy', 'Brak wzrostu', 'Błąd lasera', 'Pewna identyfikacja'], 0],
    ['Która karta VITEK 2 służy do identyfikacji drożdżaków?', ['YST', 'GN', 'NH', 'ANC'], 0],
    ['Dlaczego przy P. aeruginosa raportuje się wiele leków jako „I”?', ['EUCAST: „wrażliwy przy zwiększonej ekspozycji” – wymaga wysokiej dawki', 'Błąd aparatu', 'Brak punktów odcięcia', 'Oporność naturalna'], 0],
    ['Jaki czas daje BIOFIRE SPOTFIRE R/ST?', ['~15 min', '~2 h', '~24 h', '~5 min'], 0]
  ];

  return { ABX, BP, DIL, ID_CARDS, AST_CARDS, WELLS, MEDIA, ORG, BF_MAP, GENE_MAP, PANELS, VIDAS, BOTTLES, INSTR, CASES, SPEC_TYPES, QUIZ };
})();
