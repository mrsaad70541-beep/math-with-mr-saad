/* ===== مختبر الرياضيات التفاعلي =====
   Engine: كل تجربة = بيانات + دالة mount. تضاف تجارب جديدة بالبيانات فقط.
   تجارب HTML المستوردة مستقبلًا تُعرض داخل iframe معزول (sandbox بدون same-origin). */
window.LAB = (function () {
  const NS = 'http://www.w3.org/2000/svg';
  const toAr = (n, d = 2) => {
    let s = (+n).toFixed(d);
    if (s.endsWith('.' + '0'.repeat(d))) s = s.slice(0, -d - 1);
    return s.replace(/[0-9]/g, (c) => '٠١٢٣٤٥٦٧٨٩'[c]).replace('-', '−').replace('.', '٫');
  };
  function svgEl(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function makeDraggable(svg, handle, pos, onMove, bounds) {
    const pt = svg.createSVGPoint();
    let dragging = false;
    handle.style.cursor = 'grab';
    handle.style.touchAction = 'none';
    const toLocal = (ev) => {
      pt.x = ev.clientX; pt.y = ev.clientY;
      const m = svg.getScreenCTM();
      if (!m) return null;
      const p = pt.matrixTransform(m.inverse());
      if (bounds) { p.x = Math.min(bounds.maxX, Math.max(bounds.minX, p.x)); p.y = Math.min(bounds.maxY, Math.max(bounds.minY, p.y)); }
      return p;
    };
    handle.addEventListener('pointerdown', (ev) => { dragging = true; handle.setPointerCapture(ev.pointerId); handle.style.cursor = 'grabbing'; ev.preventDefault(); });
    handle.addEventListener('pointermove', (ev) => {
      if (!dragging) return;
      const p = toLocal(ev);
      if (!p) return;
      pos.x = p.x; pos.y = p.y;
      onMove();
    });
    const up = () => { dragging = false; handle.style.cursor = 'grab'; };
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  }
  function angleDeg(a, b, c) { // زاوية عند b
    const v1 = { x: a.x - b.x, y: a.y - b.y }, v2 = { x: c.x - b.x, y: c.y - b.y };
    let ang = Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);
    ang = ang * 180 / Math.PI;
    while (ang < 0) ang += 360;
    while (ang >= 360) ang -= 360;
    if (ang > 180) ang = 360 - ang;
    return ang;
  }
  function expShell(exp) {
    return `
      <a class="back" href="#/lab">‹ مختبر الرياضيات</a>
      <div class="section-title">${esc(exp.title)}</div>
      <div class="labcard problem"><span class="labtag">المشكلة</span><p>${esc(exp.problem)}</p></div>
      <div class="labcard stage" id="labStage">
        <div class="labtools">
          <button class="btn2 ghost sm" id="labReset">إعادة التجربة</button>
          <button class="btn2 ghost sm" id="labFull">ملء الشاشة</button>
        </div>
        <div class="labsvg" id="labSvgHost"></div>
        <div class="labctrl" id="labCtrl"></div>
      </div>
      <div class="labcard obs"><span class="labtag">الملاحظة</span><p id="labObs">${esc(exp.observation)}</p><div class="lablive" id="labLive"></div></div>
      <div class="labcard concl"><span class="labtag">الاستنتاج</span><p>${esc(exp.conclusion)}</p></div>
      <div class="labcard"><span class="labtag">شرح مختصر</span><p>${esc(exp.explain)}</p></div>
      ${exp.questions && exp.questions.length ? `<div class="labcard"><span class="labtag">أسئلة استكشافية</span><ul class="labq">${exp.questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ul></div>` : ''}
    `;
  }
  function wireShell(exp, mountFn) {
    const host = document.getElementById('labStage');
    const run = () => {
      document.getElementById('labSvgHost').innerHTML = '';
      document.getElementById('labCtrl').innerHTML = '';
      document.getElementById('labLive').innerHTML = '';
      mountFn();
    };
    document.getElementById('labReset').onclick = run;
    document.getElementById('labFull').onclick = () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (host.requestFullscreen) host.requestFullscreen();
    };
    run();
  }

  /* ١) مجموع زوايا المثلث */
  function mountTriAngles() {
    const W = 340, H = 240;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', class: 'labsvgel' });
    document.getElementById('labSvgHost').appendChild(svg);
    const A = { x: 80, y: 190 }, B = { x: 260, y: 190 }, C = { x: 170, y: 50 };
    const poly = svgEl('polygon', { fill: 'rgba(30,111,163,.12)', stroke: 'var(--navy)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, svg);
    const mkHandle = (p, color) => {
      const h = svgEl('circle', { r: 11, fill: color, stroke: '#fff', 'stroke-width': 2.5 }, svg);
      makeDraggable(svg, h, p, draw, { minX: 15, maxX: W - 15, minY: 15, maxY: H - 15 });
      return h;
    };
    const hA = mkHandle(A, '#1e6fa3'), hB = mkHandle(B, '#1e6fa3'), hC = mkHandle(C, '#b8860b');
    const tA = svgEl('text', { class: 'labtxt' }, svg), tB = svgEl('text', { class: 'labtxt' }, svg), tC = svgEl('text', { class: 'labtxt' }, svg);
    function draw() {
      poly.setAttribute('points', `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`);
      hA.setAttribute('cx', A.x); hA.setAttribute('cy', A.y);
      hB.setAttribute('cx', B.x); hB.setAttribute('cy', B.y);
      hC.setAttribute('cx', C.x); hC.setAttribute('cy', C.y);
      const a = angleDeg(B, A, C), b = angleDeg(A, B, C), c = angleDeg(A, C, B);
      const cross = (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
      const live = document.getElementById('labLive');
      if (Math.abs(cross) < 600) {
        tA.textContent = tB.textContent = tC.textContent = '';
        live.innerHTML = '<div class="live-row dim">المثلث منحل (الرءوس على استقامة واحدة تقريبًا) — حرّك أي رأس لتشكيل مثلث.</div>';
        return;
      }
      const put = (t, p, v) => { t.setAttribute('x', p.x); t.setAttribute('y', p.y - 16); t.textContent = '≈' + toAr(v, 1) + '°'; };
      put(tA, A, a); put(tB, B, b); put(tC, C, c);
      live.innerHTML =
        `<div class="live-row"><span>${toAr(a, 1)}°</span> + <span>${toAr(b, 1)}°</span> + <span>${toAr(c, 1)}°</span> ≈ <strong class="gold">١٨٠°</strong></div>
         <div class="live-row dim">القياسات مقرّبة لأقرب ٠٫١° فقد يظهر فرق جزء من العشرة في الجمع، لكن المجموع الحقيقي يساوي ١٨٠° تمامًا لأي مثلث.</div>`;
    }
    draw();
  }

  /* ٢) نظرية فيثاغورس */
  function mountPythagoras() {
    const W = 340, H = 330, SC = 26;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', class: 'labsvgel' });
    document.getElementById('labSvgHost').appendChild(svg);
    const st = { a: 3, b: 4 };
    const gTri = svgEl('g', {}, svg);
    function draw() {
      gTri.innerHTML = '';
      const ax = 165, ay = 175, a = st.a * SC, b = st.b * SC;
      const P = { x: ax, y: ay }, Q = { x: ax + b, y: ay }, R = { x: ax, y: ay - a };
      // مربعا الساقين والوتر (أرقام داخل مناطق مبسطة)
      svgEl('rect', { x: ax - a, y: ay - a, width: a, height: a, fill: 'rgba(184,134,11,.15)', stroke: '#b8860b', 'stroke-width': 1.5 }, gTri);
      svgEl('rect', { x: ax, y: ay, width: b, height: b, fill: 'rgba(30,111,163,.12)', stroke: '#1e6fa3', 'stroke-width': 1.5 }, gTri);
      const ta = svgEl('text', { x: ax - a / 2, y: ay - a / 2, class: 'labtxt ctr' }, gTri);
      ta.textContent = 'أ² = ' + toAr(st.a * st.a, 0);
      const tb = svgEl('text', { x: ax + b / 2, y: ay + b / 2, class: 'labtxt ctr' }, gTri);
      tb.textContent = 'ب² = ' + toAr(st.b * st.b, 0);
      svgEl('polygon', { points: `${P.x},${P.y} ${Q.x},${Q.y} ${R.x},${R.y}`, fill: 'rgba(16,43,73,.15)', stroke: 'var(--navy)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, gTri);
      svgEl('rect', { x: ax, y: ay - 12, width: 12, height: 12, fill: 'none', stroke: 'var(--navy)', 'stroke-width': 1.2 }, gTri);
      const c = Math.hypot(st.a, st.b);
      document.getElementById('labLive').innerHTML =
        `<div class="live-row">أ² + ب² = ${toAr(st.a * st.a, 0)} + ${toAr(st.b * st.b, 0)} = <strong>${toAr(st.a * st.a + st.b * st.b, 0)}</strong></div>
         <div class="live-row">ج² = <strong>${toAr(c * c, 0)}</strong> ← ج = <strong class="gold">${toAr(c, 2)}</strong></div>`;
    }
    const ctrl = document.getElementById('labCtrl');
    ctrl.innerHTML = `
      <label class="rng">أ = <span id="pvA"></span><input type="range" min="1" max="5" step="1" value="${st.a}" id="rgA"></label>
      <label class="rng">ب = <span id="pvB"></span><input type="range" min="1" max="5" step="1" value="${st.b}" id="rgB"></label>`;
    const upd = () => {
      st.a = +document.getElementById('rgA').value; st.b = +document.getElementById('rgB').value;
      document.getElementById('pvA').textContent = toAr(st.a, 0);
      document.getElementById('pvB').textContent = toAr(st.b, 0);
      draw();
    };
    document.getElementById('rgA').oninput = upd;
    document.getElementById('rgB').oninput = upd;
    upd();
  }

  /* ٣) مساحة الدائرة */
  function mountCircleArea() {
    const W = 340, H = 220, SC = 22;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', class: 'labsvgel' });
    document.getElementById('labSvgHost').appendChild(svg);
    const st = { r: 3 };
    function draw() {
      svg.innerHTML = '';
      const cx = 170, cy = 110, r = st.r * SC;
      svgEl('rect', { x: cx, y: cy - r, width: r, height: r, fill: 'rgba(184,134,11,.15)', stroke: '#b8860b', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, svg);
      svgEl('circle', { cx, cy, r, fill: 'rgba(30,111,163,.12)', stroke: 'var(--navy)', 'stroke-width': 2.5 }, svg);
      svgEl('line', { x1: cx, y1: cy, x2: cx + r, y2: cy, stroke: '#b8860b', 'stroke-width': 2 }, svg);
      const tr = svgEl('text', { x: cx + r / 2, y: cy - 6, class: 'labtxt ctr' }, svg);
      tr.textContent = 'نق';
      const ts = svgEl('text', { x: cx + r / 2, y: cy - r / 2, class: 'labtxt ctr', fill: '#b8860b' }, svg);
      ts.textContent = 'نق²';
      const area = Math.PI * st.r * st.r;
      document.getElementById('labLive').innerHTML =
        `<div class="live-row">المساحة = ط × نق² = ٣٫١٤ × ${toAr(st.r * st.r, 0)} ≈ <strong class="gold">${toAr(area, 2)}</strong> وحدة مربعة</div>
         <div class="live-row dim">لاحظ: الدائرة أكبر من ٣ مرات مربع نق² بقليل، والنسبة ثابتة مهما تغيّر نصف القطر.</div>`;
    }
    const ctrl = document.getElementById('labCtrl');
    ctrl.innerHTML = `<label class="rng">نصف القطر = <span id="pvR"></span><input type="range" min="1" max="4" step="1" value="${st.r}" id="rgR"></label>`;
    const upd = () => { st.r = +document.getElementById('rgR').value; document.getElementById('pvR').textContent = toAr(st.r, 0); draw(); };
    document.getElementById('rgR').oninput = upd;
    upd();
  }

  /* ٤) خط الأعداد */
  function mountNumberLine() {
    const W = 340, H = 120, X0 = 25, X1 = 315, MIN = -10, MAX = 10;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', class: 'labsvgel' });
    document.getElementById('labSvgHost').appendChild(svg);
    const xOf = (v) => X0 + (v - MIN) * (X1 - X0) / (MAX - MIN);
    const vOf = (x) => Math.round(MIN + (x - X0) * (MAX - MIN) / (X1 - X0));
    svgEl('line', { x1: X0 - 8, y1: 70, x2: X1 + 8, y2: 70, stroke: 'var(--navy)', 'stroke-width': 2 }, svg);
    for (let v = MIN; v <= MAX; v++) {
      svgEl('line', { x1: xOf(v), y1: 64, x2: xOf(v), y2: 76, stroke: 'var(--navy)', 'stroke-width': 1.2 }, svg);
      const t = svgEl('text', { x: xOf(v), y: 92, class: 'labtxt ctr sm2' }, svg);
      t.textContent = toAr(v, 0);
    }
    const dist = svgEl('line', { y1: 40, y2: 40, stroke: '#b8860b', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
    const pA = { x: xOf(-3), y: 55 }, pB = { x: xOf(4), y: 55 };
    const mkH = (p, color) => {
      const h = svgEl('circle', { r: 11, fill: color, stroke: '#fff', 'stroke-width': 2.5 }, svg);
      makeDraggable(svg, h, p, () => {
        p.x = xOf(vOf(p.x)); p.y = 55;
        draw();
      }, { minX: X0, maxX: X1, minY: 55, maxY: 55 });
      return h;
    };
    const hA = mkH(pA, '#1e6fa3'), hB = mkH(pB, '#b8860b');
    function draw() {
      hA.setAttribute('cx', pA.x); hA.setAttribute('cy', pA.y);
      hB.setAttribute('cx', pB.x); hB.setAttribute('cy', pB.y);
      const va = vOf(pA.x), vb = vOf(pB.x);
      dist.setAttribute('x1', Math.min(pA.x, pB.x));
      dist.setAttribute('x2', Math.max(pA.x, pB.x));
      document.getElementById('labLive').innerHTML =
        `<div class="live-row">النقطة الأولى: <strong>${toAr(va, 0)}</strong> · النقطة الثانية: <strong>${toAr(vb, 0)}</strong></div>
         <div class="live-row">المسافة بينهما = |${toAr(vb, 0)} − ${toAr(va, 0)}| = <strong class="gold">${toAr(Math.abs(vb - va), 0)}</strong> وحدات</div>`;
    }
    draw();
  }

  const EXPERIMENTS = [
    {
      id: 'tri-angles', title: 'مجموع زوايا المثلث',
      problem: 'هل يتغيّر مجموع زوايا المثلث لو غيّرنا شكله؟ اسحب رءوس المثلث ولاحظ قياس كل زاوية ومجموعها.',
      observation: 'مهما سحبت أي رأس، تتغيّر الزوايا الثلاث لكن مجموعها يظل ثابتًا.',
      conclusion: 'مجموع قياسات الزوايا الداخلية لأي مثلث يساوي ١٨٠° دائمًا.',
      explain: 'لو قصصت زوايا أي مثلث وركّبتها جنب بعض هتكوّن خطًا مستقيمًا (١٨٠°). عشان كده المجموع ثابت مهما كان شكل المثلث.',
      questions: ['ممكن مثلث يكون فيه زاويتان قائمتان؟ ليه؟', 'لو زاويتان ٦٠° و٨٠°، كام الزاوية التالتة؟'],
      mount: mountTriAngles
    },
    {
      id: 'pythagoras', title: 'نظرية فيثاغورس',
      problem: 'في مثلث قائم الزاوية، ما العلاقة بين مربعي الضعلين (أ، ب) ومربع الوتر (ج)؟ حرّك المؤشرين وقارن.',
      observation: 'مجموع مساحتي المربعين المبنيين على الضلعين القصيرين يساوي دائمًا مساحة المربع المبني على الوتر.',
      conclusion: 'في المثلث القائم: أ² + ب² = ج²، ومنها الوتر ج = √(أ² + ب²).',
      explain: 'المثلث ٣، ٤، ٥ أشهر مثال: ٩ + ١٦ = ٢٥. النظرية تُستخدم في حساب المسافات والأطوال غير المباشرة.',
      questions: ['مثلث قائم ضلعاه ٦ و٨، كام الوتر؟', 'هل الأطوال ٥، ٦، ٧ تصلح مثلثًا قائمًا؟ تحقق بالحساب.'],
      mount: mountPythagoras
    },
    {
      id: 'circle-area', title: 'مساحة الدائرة',
      problem: 'كيف تتغيّر مساحة الدائرة عندما يتغيّر نصف قطرها؟ وما علاقتها بالمربع المبني على نصف القطر؟',
      observation: 'عند مضاعفة نصف القطر تتضاعف المساحة أربع مرات، والمساحة تظل حوالي ٣٫١٤ ضعف مربع نق.',
      conclusion: 'مساحة الدائرة = ط × نق²، حيث ط ≈ ٣٫١٤ نسبة ثابتة لكل الدوائر.',
      explain: 'لو قسّمت الدائرة قطاعات صغيرة جدًا ورصصتها هتحصل على شكل قريب من متوازي أضلاع قاعدته نصف المحيط وارتفاعه نق، ومنها المساحة = ط × نق².',
      questions: ['دائرة نصف قطرها ٥ سم، احسب مساحتها.', 'لو تضاعف نصف القطر ٣ مرات، كم مرة تتضاعف المساحة؟'],
      mount: mountCircleArea
    },
    {
      id: 'number-line', title: 'خط الأعداد',
      problem: 'كيف نحسب المسافة بين عددين على خط الأعداد، حتى لو أحدهما سالب؟ اسحب النقطتين ولاحظ.',
      observation: 'المسافة دائمًا موجبة، وتساوي القيمة المطلقة للفرق بين العددين.',
      conclusion: 'المسافة بين أي عددين أ، ب على خط الأعداد = |أ − ب|.',
      explain: 'العدد السالب يقع يسار الصفر. المسافة لا تهتم بالاتجاه، لذلك نأخذ القيمة المطلقة للفرق.',
      questions: ['ما المسافة بين −٧ و٥؟', 'عددان المسافة بينهما ٩ وأحدهما −٢، ما العددان المحتملان للآخر؟'],
      mount: mountNumberLine
    }
  ];

  function labHome() {
    let h = '<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">مختبر الرياضيات</div>';
    h += '<p class="dim labintro">كل تجربة تسير بنفس الطريقة: مشكلة ← تجربة ← ملاحظة ← استنتاج. اسحب وحرّك واكتشف بنفسك.</p>';
    h += '<div class="labgrid">';
    EXPERIMENTS.forEach((e) => {
      h += `<a class="labitem" href="#/lab/${e.id}"><span class="ic">${IC.flask}</span><span class="lt">${esc(e.title)}</span><span class="go">ابدأ التجربة</span></a>`;
    });
    h += '</div>';
    h += '<p class="dim labmore">تجارب جديدة تُضاف تباعًا دون تحديث التطبيق.</p>';
    return h;
  }
  function labExp(id) {
    const e = EXPERIMENTS.find((x) => x.id === id);
    if (!e) return labHome();
    return expShell(e);
  }
  function afterRender(p) {
    if (p[0] !== 'lab' || !p[1]) return;
    const e = EXPERIMENTS.find((x) => x.id === p[1]);
    if (e) wireShell(e, e.mount);
  }
  return { EXPERIMENTS, labHome, labExp, afterRender };
})();
