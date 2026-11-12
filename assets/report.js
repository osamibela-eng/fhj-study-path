/*
 * FH JOANNEUM Study Path - personal PDF report, generated on the visitor's phone.
 * Vector text and shapes (jsPDF) on a raster "deep space" background, Poppins embedded.
 * window.FHJReport.build(result) -> Promise<Blob>
 *   result = { level, interests:[{k,v,label,color}], match, p, runner, future, de, id, href }
 */
(function () {
  'use strict';
  const W = 210, H = 297, M = 14;                       // A4 portrait, mm
  const C = {
    bg: '#070C18', card: '#111B30', stroke: '#2A3A5C', text: '#F4F6FF', dim: '#9AA7C2',
    cyan: '#3FE0FF', purple: '#B36BFF', mint: '#4DF2B5', violet: '#E07BFF', orange: '#FFA24C', red: '#E5003D'
  };
  const FONTS = { Bold: 'PoppinsBold', SemiBold: 'PoppinsSemi', Medium: 'PoppinsMed', Light: 'PoppinsLight' };

  // ---------- assets ----------
  const b64 = buf => {
    let s = '', bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  };
  let assetPromise = null;
  function loadAssets(base) {
    if (assetPromise) return assetPromise;
    const font = n => fetch(`${base}fonts/Poppins-${n}.ttf`).then(r => { if (!r.ok) throw new Error('font ' + n); return r.arrayBuffer(); })
                                                         .then(buf => [n, b64(buf)]);
    const logo = new Promise((ok, fail) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas'); c.width = 1700; c.height = Math.round(1700 * 57 / 283.4);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        ok(c.toDataURL('image/png'));
      };
      img.onerror = () => fail(new Error('logo'));
      img.src = `${base}fh-joanneum-logo-white.svg`;
    });
    assetPromise = Promise.all([Promise.all(Object.keys(FONTS).map(font)), logo]).then(([fonts, logoPng]) => ({ fonts, logoPng }));
    assetPromise.catch(() => { assetPromise = null; });
    return assetPromise;
  }

  // Deterministic random so every page of one report gets its own, stable sky.
  function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

  function spaceBackground(seed, accent) {
    const w = 1240, h = 1754, c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'), r = rng(seed);
    g.fillStyle = C.bg; g.fillRect(0, 0, w, h);
    const glow = (x, y, rad, col, a) => {
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, hexA(col, a)); gr.addColorStop(1, hexA(col, 0));
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    };
    glow(w * 0.12, h * 0.05, w * 0.85, C.cyan, 0.20);
    glow(w * 1.02, h * 0.18, w * 0.75, C.purple, 0.20);
    glow(w * 0.75, h * 0.98, w * 0.9, accent, 0.13);
    glow(w * 0.05, h * 0.70, w * 0.6, '#3A4DFF', 0.10);
    // faint orbits
    g.lineWidth = 1.4;
    for (let k = 0; k < 3; k++) {
      g.strokeStyle = hexA(k === 1 ? accent : C.cyan, 0.07 + 0.03 * k);
      g.beginPath(); g.ellipse(w * 0.86, h * 0.12, 260 + k * 150, 110 + k * 70, -0.35, 0, Math.PI * 2); g.stroke();
    }
    // stars
    for (let i = 0; i < 900; i++) {
      const x = r() * w, y = r() * h, s = r(), a = 0.15 + 0.75 * r() * r();
      g.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      g.beginPath(); g.arc(x, y, s < 0.93 ? 0.6 + s * 0.9 : 1.6 + s, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 14; i++) {                    // a few bright stars with a soft halo + spikes
      const x = r() * w, y = r() * h, col = [C.cyan, '#FFFFFF', C.purple, accent][i % 4];
      glow(x, y, 22, col, 0.55);
      g.strokeStyle = hexA('#FFFFFF', 0.55); g.lineWidth = 1;
      g.beginPath(); g.moveTo(x - 9, y); g.lineTo(x + 9, y); g.moveTo(x, y - 9); g.lineTo(x, y + 9); g.stroke();
      g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x, y, 1.8, 0, Math.PI * 2); g.fill();
    }
    return c.toDataURL('image/jpeg', 0.88);
  }

  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
  }
  function mixHex(hex, a, base = C.bg) {             // opaque blend over the dark background
    const p = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
    const [x, y] = [p(hex), p(base)];
    return '#' + x.map((v, i) => Math.round(y[i] + (v - y[i]) * a).toString(16).padStart(2, '0')).join('');
  }

  // ---------- builder ----------
  async function build(R) {
    const base = (document.querySelector('script[src*="report.js"]').src || '').replace(/report\.js.*$/, '');
    const { fonts, logoPng } = await loadAssets(base);
    const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', compress: true });
    for (const [n, data] of fonts) { doc.addFileToVFS(`Poppins-${n}.ttf`, data); doc.addFont(`Poppins-${n}.ttf`, FONTS[n], 'normal'); }

    const T = (en, de) => R.de ? de : en;
    const p = R.p, levelCol = R.level === 'bachelor' ? C.mint : C.violet;
    const seed = parseInt((R.id || '').replace(/[^0-9a-f]/gi, '').slice(0, 8), 16) || 7;
    const today = new Date().toLocaleDateString(R.de ? 'de-AT' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    let page = 0, y = 0;

    // --- drawing helpers
    const font = (w, size, col) => { doc.setFont(FONTS[w]); doc.setFontSize(size); doc.setTextColor(col); };
    const alpha = a => doc.setGState(new doc.GState({ opacity: a }));
    const text = (s, x, yy, opt = {}) => doc.text(String(s), x, yy, Object.assign({ baseline: 'top' }, opt));
    const lh = size => size * 0.3528 * 1.32;         // line height in mm for a pt size
    const wrap = (s, w) => doc.splitTextToSize(String(s || ''), w);
    const card = (x, yy, w, h, accent) => {
      alpha(0.72); doc.setFillColor(C.card); doc.roundedRect(x, yy, w, h, 4, 4, 'F'); alpha(1);
      doc.setDrawColor(accent ? mixHex(accent, 0.45) : C.stroke); doc.setLineWidth(0.3); doc.roundedRect(x, yy, w, h, 4, 4, 'S');
    };
    const kicker = (s, x, yy, col = C.cyan) => { font('SemiBold', 7.5, col); doc.setCharSpace(0.35); text(s.toUpperCase(), x, yy); doc.setCharSpace(0); };
    const arc = (cx, cy, r, a0, a1, col, lw) => {            // degrees, 0 = 12 o'clock, clockwise
      const n = Math.max(8, Math.ceil(Math.abs(a1 - a0) / 4)), pts = [];
      for (let i = 0; i <= n; i++) {
        const a = (a0 + (a1 - a0) * i / n - 90) * Math.PI / 180;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      doc.setDrawColor(col); doc.setLineWidth(lw); doc.setLineCap('round');
      doc.lines(pts.slice(1).map((q, i) => [q[0] - pts[i][0], q[1] - pts[i][1]]), pts[0][0], pts[0][1]);
    };
    const glowRing = (cx, cy, r, col, lw) => {
      for (const [k, a] of [[3.4, 0.10], [2.2, 0.18]]) { alpha(a); doc.setDrawColor(col); doc.setLineWidth(lw * k); doc.circle(cx, cy, r, 'S'); }
      alpha(1); doc.setDrawColor(col); doc.setLineWidth(lw); doc.circle(cx, cy, r, 'S');
    };
    const capIcon = (x, cy, w, col) => {                      // mortarboard pictogram, centred on x
      const h = w * 0.36;
      doc.setFillColor(col);
      doc.lines([[w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], x - w / 2, cy, [1, 1], 'F', true);
      doc.lines([[0, h * 0.6], [w * 0.56, 0], [0, -h * 0.6], [-w * 0.28, h * 0.3]], x - w * 0.28, cy + h * 0.15, [1, 1], 'F', true);
      doc.setDrawColor(col); doc.setLineWidth(w * 0.035); doc.line(x + w * 0.42, cy - h * 0.05, x + w * 0.42, cy + h * 0.95);
      doc.circle(x + w * 0.42, cy + h * 1.0, w * 0.05, 'F');
    };

    function newPage() {
      if (page > 0) doc.addPage();
      page++;
      doc.addImage(spaceBackground(seed + page * 977, levelCol), 'JPEG', 0, 0, W, H, `bg${page}`, 'FAST');
      if (page === 1) {
        doc.addImage(logoPng, 'PNG', M, 13, 64, 64 * 57 / 283.4, 'logo', 'FAST');
        font('SemiBold', 7.5, C.dim); doc.setCharSpace(0.35);
        text(T('OPEN HOUSE · STUDY PATH', 'TAG DER OFFENEN TÜR · STUDIENWEG'), W - M, 14.5, { align: 'right' }); doc.setCharSpace(0);
        font('Light', 8, C.dim); text(today, W - M, 19.5, { align: 'right' });
        y = 36;
      } else {
        doc.addImage(logoPng, 'PNG', M, 11, 40, 40 * 57 / 283.4, 'logo', 'FAST');
        font('Medium', 8, C.dim); text(p.name, W - M, 13, { align: 'right', maxWidth: 110 });
        y = 28;
      }
      footer();
    }
    function footer() {
      alpha(0.5); doc.setDrawColor(C.stroke); doc.setLineWidth(0.25); doc.line(M, H - 13, W - M, H - 13); alpha(1);
      font('Light', 6.5, C.dim);
      text(T('Created at the FH JOANNEUM open house interactive table · Team 1 · no personal data stored',
             'Erstellt am interaktiven Tisch beim Tag der offenen Tür der FH JOANNEUM · Team 1 · keine persönlichen Daten gespeichert'),
           M, H - 10.5);
      text(`${page}`, W - M, H - 10.5, { align: 'right' });
    }
    const ensure = h => { if (y + h > H - 18) newPage(); };

    // ================= PAGE 1 =================
    newPage();
    kicker(T('Your personal result', 'Dein persönliches Ergebnis'), M, y);
    font('Bold', 23, C.text); text(T('Your study path at', 'Dein Studienweg an der'), M, y + 5);
    font('Bold', 23, C.cyan); text('FH JOANNEUM', M, y + 15);
    y += 28;

    // --- level + interests
    const rowH = 36, lvW = 50;
    card(M, y, lvW, rowH, levelCol);
    kicker(T('Your degree', 'Dein Abschluss'), M + 5, y + 5, levelCol);
    glowRing(M + lvW / 2, y + 20.5, 9.2, levelCol, 0.9);
    capIcon(M + lvW / 2, y + 19, 10.5, levelCol);
    font('Bold', 10, C.text);
    text(R.level === 'bachelor' ? T("Bachelor's", 'Bachelor') : T("Master's", 'Master'), M + lvW / 2, y + 31.2, { align: 'center' });

    const ix = M + lvW + 4, iw = W - M - ix;
    card(ix, y, iw, rowH);
    kicker(T('Your interests · how much they matter', 'Deine Interessen · wie wichtig sie dir sind'), ix + 5, y + 5);
    const n = Math.max(1, R.interests.length), slot = Math.min(26, (iw - 8) / n), rr = Math.min(8.2, slot / 2 - 2.2);
    R.interests.forEach((it, i) => {
      const cx = ix + 4 + slot * (i + 0.5) + (iw - 8 - slot * n) / 2, cy = y + 20;
      alpha(0.9); doc.setFillColor(mixHex(it.color, 0.10)); doc.circle(cx, cy, rr, 'F'); alpha(1);
      doc.setDrawColor(mixHex(it.color, 0.25)); doc.setLineWidth(1.3); doc.circle(cx, cy, rr, 'S');
      if (it.v > 0) arc(cx, cy, rr, 0, Math.max(4, 3.6 * it.v), it.color, 1.3);
      font('Bold', 8, C.text);
      const fs = Math.max(4.6, Math.min(8, 8 * (2 * rr - 2.4) / doc.getTextWidth(it.label)));
      font('Bold', fs, C.text); text(it.label, cx, cy, { align: 'center', baseline: 'middle' });
      font('SemiBold', 8.5, it.color); text(n > 1 ? `${it.v}%` : T('chosen', 'gewählt'), cx, cy + rr + 1.6, { align: 'center' });
    });
    y += rowH + 5;

    // --- recommendation
    const descLines = (font('Light', 9.2, C.text), wrap(p.description, W - 2 * M - 12));
    font('Bold', 16, C.text);
    const nameLines = wrap(p.name, W - 2 * M - 58);
    const recH = 14 + Math.max(36, nameLines.length * lh(16) + 18) + descLines.length * lh(9.2) + (R.runner ? 9 : 5);
    card(M, y, W - 2 * M, recH, C.cyan);
    kicker(T('Recommended study programme', 'Empfohlener Studiengang'), M + 6, y + 6);
    const mx = M + 24, my = y + 31;
    doc.setDrawColor(mixHex(C.cyan, 0.2)); doc.setLineWidth(2.6); doc.circle(mx, my, 15, 'S');
    alpha(0.25); doc.setLineWidth(6); arc(mx, my, 15, 0, 3.6 * R.match, C.cyan, 6); alpha(1);
    arc(mx, my, 15, 0, 3.6 * R.match, C.cyan, 2.6);
    font('Bold', 17, C.text); text(`${R.match}%`, mx, my - 1.2, { align: 'center', baseline: 'middle' });
    font('Medium', 6.5, C.dim); text(T('MATCH', 'PASSUNG'), mx, my + 5.2, { align: 'center', baseline: 'middle' });
    let ty = y + 15;
    font('Bold', 16, C.text); nameLines.forEach(l => { text(l, M + 46, ty); ty += lh(16); });
    font('SemiBold', 9.5, C.cyan);
    text([p.degree, R.level === 'bachelor' ? T("Bachelor's programme", 'Bachelorstudium') : T("Master's programme", 'Masterstudium'),
          p.parentProgramme ? T('track of ', 'Vertiefung von ') + p.parentProgramme : ''].filter(Boolean).join('  ·  '), M + 46, ty + 1, { maxWidth: W - 2 * M - 52 });
    font('Light', 8, C.dim); text(wrap(p.institute || '', W - 2 * M - 52)[0] || '', M + 46, ty + 7);
    ty = Math.max(ty + 15, y + 52);
    font('Light', 9.2, C.text); descLines.forEach(l => { text(l, M + 6, ty); ty += lh(9.2); });
    if (R.runner) {
      font('Medium', 8.5, C.dim); const lead = T('Also a good fit: ', 'Passt auch gut: ');
      text(lead, M + 6, ty + 2.5);
      font('SemiBold', 8.5, C.purple); doc.textWithLink(R.runner.name, M + 6 + doc.getTextWidth(lead), ty + 2.5, { url: R.runner.url, baseline: 'top' });
    }
    y += recH + 4;

    // --- key facts
    const facts = [
      [T('Degree', 'Abschluss'), p.degree],
      [T('ECTS · duration', 'ECTS · Dauer'), `${p.ects} ECTS · ${p.semesters} ${T('semesters', 'Semester')}`],
      [T('Language', 'Sprache'), p.language],
      [T('Study mode', 'Studienform'), (p.studyModes || []).join(', ')],
      [T('Campus', 'Standort'), p.campus],
      [T('Tuition', 'Studienbeitrag'), p.tuition],
      [T('Start', 'Studienbeginn'), p.startDate],
      [T('Apply', 'Bewerbung'), p.applicationDeadline]
    ];
    const fw = (W - 2 * M - 3 * 3) / 4, fh = 19.5;
    ensure(8 + 2 * fh + 3);
    kicker(T('Key facts', 'Das Wichtigste'), M, y); y += 5;
    facts.forEach(([k, v], i) => {
      const fx = M + (i % 4) * (fw + 3), fy = y + Math.floor(i / 4) * (fh + 3);
      card(fx, fy, fw, fh);
      font('Medium', 6.3, C.dim); doc.setCharSpace(0.25); text(k.toUpperCase(), fx + 3.5, fy + 3.2); doc.setCharSpace(0);
      font('SemiBold', 8, C.text);
      wrap(v || '–', fw - 7).slice(0, 3).forEach((l, j) => text(l, fx + 3.5, fy + 7.8 + j * lh(8)));
    });
    y += 2 * fh + 3 + 5;

    // --- pathway
    const steps = R.level === 'bachelor'
      ? [[C.dim, T('Now', 'Jetzt'), T('School leaving certificate (Matura or equivalent)', 'Matura oder gleichwertiger Abschluss')],
         [C.mint, `Bachelor · ${p.semesters} ${T('sem.', 'Sem.')}`, p.name]]
        .concat(R.future ? [[C.violet, `Master · ${R.future.semesters} ${T('sem.', 'Sem.')}`, R.future.name]] : [])
      : [[C.dim, T('Now', 'Jetzt'), T("Bachelor's degree", 'Bachelorabschluss')], [C.violet, `Master · ${p.semesters} ${T('sem.', 'Sem.')}`, p.name]];
    steps.push([C.orange, T('Career', 'Karriere'), (p.careers || []).slice(0, 3).join(', ')]);
    const ph = 34; ensure(ph + 5);
    kicker(T('Your pathway', 'Dein Weg'), M, y); y += 5;
    card(M, y, W - 2 * M, ph);
    const seg = (W - 2 * M) / steps.length, lineY = y + 9, nodeX = i => M + seg * (i + 0.5);
    for (let i = 0; i < steps.length - 1; i++) {
      doc.setDrawColor(mixHex(steps[i + 1][0], 0.55)); doc.setLineWidth(0.8); doc.setLineDashPattern([1.2, 1.2], 0);
      doc.line(nodeX(i) + 4, lineY, nodeX(i + 1) - 4, lineY); doc.setLineDashPattern([], 0);
    }
    steps.forEach(([col, head, body], i) => {
      const cx = nodeX(i);
      alpha(0.25); doc.setFillColor(col); doc.circle(cx, lineY, 3.4, 'F'); alpha(1);
      doc.setFillColor(col); doc.circle(cx, lineY, 1.9, 'F');
      font('SemiBold', 8.2, col); text(head, cx, lineY + 6, { align: 'center' });
      font('Light', 7.6, C.text); wrap(body, seg - 5).slice(0, 3).forEach((l, j) => text(l, cx, lineY + 11 + j * lh(7.6), { align: 'center' }));
    });
    y += ph + 6;

    // ================= PAGE 2: curriculum (continues page 2 if the pathway already moved there) =================
    if (page === 1) newPage(); else y += 2;
    kicker(T('Curriculum', 'Lehrplan'), M, y);
    font('Bold', 17, C.text); text(p.name, M, y + 5, { maxWidth: W - 2 * M }); y += 15;
    const sems = p.curriculum && p.curriculum.length ? p.curriculum : [{ semester: 1, courses: p.courseHighlights || [] }];
    const cw = (W - 2 * M - 4) / 2, size = 7.4, gap = 4;
    for (let i = 0; i < sems.length; i += 2) {
      const pair = sems.slice(i, i + 2);
      const lines = pair.map(s => { font('Light', size, C.text); return s.courses.map(c => wrap(c, cw - 12)); });
      const need = Math.max(...lines.map(ls => ls.reduce((a, l) => a + l.length, 0))) * lh(size) + 15;
      ensure(Math.min(need, 70));
      const h = Math.min(need, H - 18 - y);
      pair.forEach((s, j) => {
        const x = M + j * (cw + gap), col = [C.cyan, C.purple, '#7C8CFF', C.orange, '#39D0C8', '#FF6FB5'][(s.semester - 1) % 6];
        const hh = h;
        card(x, y, cw, hh, col);
        doc.setFillColor(col); doc.roundedRect(x + 4, y + 4.2, 1.4, 4.2, 0.7, 0.7, 'F');
        font('SemiBold', 9, C.text); text(T(`Semester ${s.semester}`, `${s.semester}. Semester`), x + 8, y + 4.2);
        font('Light', size, C.text);
        let yy = y + 11, shown = 0;
        for (const ls of lines[j]) {
          if (yy + ls.length * lh(size) > y + hh - 2.5) break;
          doc.setFillColor(col); doc.circle(x + 6.2, yy + 1.35, 0.55, 'F');
          ls.forEach(l => { text(l, x + 8, yy); yy += lh(size); }); shown++;
        }
        if (shown < s.courses.length) { font('Medium', size, C.dim); text(T(`+ ${s.courses.length - shown} more`, `+ ${s.courses.length - shown} weitere`), x + 8, yy); }
      });
      y += h + gap;
    }

    // ================= skills / careers / admission / next steps =================
    const lists = [
      [T('Skills you will build', 'Das lernst du'), p.skills, C.cyan],
      [T('Career paths', 'Karrierewege'), p.careers, C.orange],
      [T('Admission', 'Zugang'), p.admission, levelCol]
    ].filter(l => l[1] && l[1].length);
    for (const [title, items, col] of lists) {
      font('Light', 8, C.text);
      const ls = items.map(s => wrap(s, W - 2 * M - 14));
      const h = 11 + ls.reduce((a, l) => a + l.length, 0) * lh(8) + 3;
      ensure(h + 4);
      card(M, y, W - 2 * M, h, col);
      kicker(title, M + 5, y + 4.5, col);
      let yy = y + 10.5;
      font('Light', 8, C.text);
      ls.forEach(l => { doc.setFillColor(col); doc.circle(M + 6.5, yy + 1.45, 0.6, 'F'); l.forEach(t => { text(t, M + 9, yy); yy += lh(8); }); });
      y += h + 4;
    }

    // next steps with a QR to the official programme page
    const nh = 44; ensure(nh);
    card(M, y, W - 2 * M, nh, C.cyan);
    kicker(T('Next steps', 'Nächste Schritte'), M + 6, y + 5);
    const nx = M + 6, nw = W - 2 * M - 52;
    font('SemiBold', 8.6, C.text); text(T('Application', 'Bewerbung'), nx, y + 11);
    font('Light', 7.8, C.text);
    let ny = y + 15.5;
    wrap(p.applicationDeadlineFull || p.applicationDeadline || '', nw).slice(0, 4).forEach(l => { text(l, nx, ny); ny += lh(7.8); });
    font('SemiBold', 8.6, C.text); text(T('Programme page & contact', 'Studiengangsseite & Kontakt'), nx, ny + 2); ny += 6.5;
    font('Medium', 7.8, C.cyan); doc.textWithLink(p.url, nx, ny, { url: p.url, baseline: 'top' }); ny += lh(7.8);
    if (p.contact) { font('Light', 7.8, C.text); doc.textWithLink(p.contact, nx, ny, { url: 'mailto:' + p.contact, baseline: 'top' }); }
    if (window.qrcode) {
      const qr = window.qrcode(0, 'M'); qr.addData(p.url); qr.make();
      const cnt = qr.getModuleCount(), qs = 34, qx = W - M - 6 - qs, qy = y + 5, cell = (qs - 4) / cnt;
      doc.setFillColor('#FFFFFF'); doc.roundedRect(qx, qy, qs, qs, 2, 2, 'F');
      doc.setFillColor('#070C18');
      for (let r = 0; r < cnt; r++) for (let c = 0; c < cnt; c++) if (qr.isDark(r, c)) doc.rect(qx + 2 + c * cell, qy + 2 + r * cell, cell + 0.02, cell + 0.02, 'F');
      doc.link(qx, qy, qs, qs, { url: p.url });
    }
    y += nh + 4;
    ensure(12);
    font('Light', 6.6, C.dim);
    wrap(T(`Programme data collected from fh-joanneum.at (${R.collectedOn || ''}). Please check the official programme page for binding information.`,
           `Daten von fh-joanneum.at (Stand ${R.collectedOn || ''}). Verbindliche Angaben auf der offiziellen Studiengangsseite.`), W - 2 * M)
      .forEach((l, i) => text(l, M, y + i * lh(6.6)));
    const lead = T('Your result online: ', 'Dein Ergebnis online: ');
    text(lead, M, y + 2 * lh(6.6));
    doc.setTextColor(C.cyan); doc.textWithLink(T('open it again', 'erneut öffnen'), M + doc.getTextWidth(lead), y + 2 * lh(6.6), { url: R.href, baseline: 'top' });

    doc.setProperties({
      title: `${p.name} – ${T('My FH JOANNEUM study path', 'Mein Studienweg an der FH JOANNEUM')}`,
      subject: T('Personal result from the FH JOANNEUM open house table', 'Persönliches Ergebnis vom Tisch beim Tag der offenen Tür'),
      author: 'FH JOANNEUM Study Path · Team 1', creator: 'FHJ Study Path'
    });
    return doc.output('blob');
  }

  window.FHJReport = { build, preload: () => loadAssets((document.querySelector('script[src*="report.js"]').src || '').replace(/report\.js.*$/, '')) };
})();
