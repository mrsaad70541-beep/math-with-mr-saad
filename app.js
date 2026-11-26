const app = document.getElementById('app');
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ===== theme (light/dark, local) ===== */
function applyTheme() {
  const t = localStorage.getItem('saad.theme.v1') || 'auto';
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
}
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
function setTheme(t) { localStorage.setItem('saad.theme.v1', t); applyTheme(); route(); }
window.setTheme = setTheme;

function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ===== storage: saved / last-watched / mistakes ===== */
function jget(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
const getSaved = () => jget('saad.saved.v1', []);
const isSaved = (u) => getSaved().some((x) => x.u === u);
function toggleSave(u, t) {
  let s = getSaved();
  if (s.some((x) => x.u === u)) { s = s.filter((x) => x.u !== u); toast('اتشالت من محفوظاتك'); }
  else { s.unshift({ u, t }); toast('اتحفظت في محفوظاتك'); }
  localStorage.setItem('saad.saved.v1', JSON.stringify(s));
  route();
}
window.toggleSave = toggleSave;
const getLast = () => jget('saad.last.v1', null);
const setLast = (u, t) => localStorage.setItem('saad.last.v1', JSON.stringify({ u, t }));
const getMistakes = () => jget('saad.mistakes.v1', []);
function addMistake(m) {
  const ms = getMistakes().filter((x) => x.q !== m.q);
  ms.unshift(m);
  localStorage.setItem('saad.mistakes.v1', JSON.stringify(ms.slice(0, 50)));
}

/* ===== share (real links) ===== */
function fullUrl(u) { return location.origin + location.pathname + u; }
function shareLink(title, u, text) {
  const url = fullUrl(u);
  const body = (text || title) + '\n' + url;
  if (navigator.share) { navigator.share({ title, text: text || title, url }).catch(() => {}); }
  else if (navigator.clipboard) { navigator.clipboard.writeText(body).then(() => toast('اتنسخ الرابط')); }
  else toast('انسخ الرابط من شريط العنوان');
}
window.shareLink = shareLink;

/* ===== Arabic-normalizing search ===== */
function norm(s) {
  return (s || '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/[ً-ْ]/g, '')
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).toLowerCase();
}
const SEARCH = [];
DATA.grades.forEach((g) => g.lessons.forEach((l, li) => {
  l.videos.forEach((v, vi) => { if (v.yt) SEARCH.push({ t: `${v.n} — ${l.title} · ${g.title}`, u: `#/g/${g.id}/l/${li}/v/${vi}` }); });
  SEARCH.push({ t: `درس ${l.title} — ${g.title}`, u: `#/g/${g.id}/l/${li}` });
  if (l.quiz) SEARCH.push({ t: `اختبار درس ${l.title}`, u: '#/test' });
}));
DATA.grades.forEach((g) => SEARCH.push({ t: g.title + ' — المنهج المصري', u: `#/g/${g.id}` }));
SEARCH.push({ t: 'المنهج المصري — الصفوف الإعدادية', u: '#/manhag' });
QUDURAT_CHAPTERS.forEach((c) => SEARCH.push({ t: c + ' — القدرات الكمي', u: '#/t/qudurat' }));
LEH_CATS.forEach((c) => SEARCH.push({ t: c + ' — ليه؟', u: '#/t/leh' }));
SEARCH.push({ t: 'القدرات الكمي — المنهج السعودي', u: '#/t/qudurat' });
SEARCH.push({ t: 'ليه؟ — رياضيات عامة', u: '#/t/leh' });
CHALLENGES.forEach((c) => SEARCH.push({ t: 'تحدي اليوم: ' + c.title, u: '#/challenge' }));
SEARCH.push({ t: 'الكتاب التفاعلي — نموذج قوى القوى', u: '#/book' });
SEARCH.push({ t: 'محفوظاتي', u: '#/saved' });
SEARCH.push({ t: 'أخطائي — بنك الأخطاء', u: '#/mistakes' });
function saSearch(q) {
  const box = document.getElementById('sres');
  const nq = norm(q).trim();
  if (!nq) { box.classList.remove('open'); box.innerHTML = ''; return; }
  const hits = SEARCH.filter((s) => norm(s.t).includes(nq)).slice(0, 8);
  box.innerHTML = hits.length
    ? hits.map((h) => `<a href="${h.u}">${esc(h.t)}</a>`).join('')
    : '<span class="none">لا توجد نتائج مطابقة</span>';
  box.classList.add('open');
}
window.saSearch = saSearch;

/* ===== icons (line SVG) ===== */
const IC = {
  cap: '<svg viewBox="0 0 24 24" fill="none" stroke="#2f6fce" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 2 9l10 5 10-5Z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/><path d="M22 9v5"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="#c98a06" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.5 1 2.5h6c0-1 .3-1.9 1-2.5A6 6 0 0 0 12 3Z"/></svg>',
  sigma: '<svg viewBox="0 0 24 24" fill="none" stroke="#7a5ce0" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M17 5H7l6 7-6 7h10"/></svg>',
  quiz: '<svg viewBox="0 0 24 24" fill="none" stroke="#1c9e8f" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8.5 12.5 2 2 4.5-4.5"/><path d="M8.5 7.5h7"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="#c98a06" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5.5C4 4 7 3.6 12 5.4c5-1.8 8-1.4 10 .1V19c-2-1.5-5-1.9-10-.1-5-1.8-8-1.4-10 .1Z"/><path d="M12 5.4V18.9"/></svg>',
  flask: '<svg viewBox="0 0 24 24" fill="none" stroke="#7a5ce0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v6L4.5 18a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 9V3"/><path d="M7.5 14h9"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="#2f6fce" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>',
  mark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4.5L6 21Z"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5Z"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
};

function saveBtn(u, t) {
  return `<button class="savebtn ${isSaved(u) ? 'on' : ''}" onclick="toggleSave('${u}', this.dataset.t)" data-t="${esc(t)}" aria-label="حفظ">${IC.mark}</button>`;
}
function shareBtn(title, u, text) {
  return `<button class="savebtn" onclick="shareLink(this.dataset.t, '${u}', this.dataset.x)" data-t="${esc(title)}" data-x="${esc(text || '')}" aria-label="مشاركة">${IC.share}</button>`;
}

/* ===== pages ===== */
function home() {
  const last = getLast();
  const ch = CHALLENGES[0];
  let h = `
  <div class="searchwrap">
    <div class="searchbar">
      <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input id="q" type="search" placeholder="ابحث عن درس أو مهارة" oninput="saSearch(this.value)" autocomplete="off">
    </div>
    <div id="sres" class="sres"></div>
  </div>`;
  if (last) h += `
  <a class="contcard" href="${last.u}">
    <span class="lbl">استكمل تعلمك</span>
    <span class="t">${esc(last.t)}</span>
    <span class="go">متابعة ‹</span>
  </a>`;
  h += `
  <div class="section-title">مسارات التعلم</div>
  <div class="trio">
    <a class="p1" href="#/manhag"><span class="ic">${IC.cap}</span><h3>المنهج المصري</h3><span class="st on">متاح الآن</span></a>
    <a class="p2" href="#/t/leh"><span class="ic">${IC.bulb}</span><h3>ليه؟</h3><span class="st">قريبًا</span></a>
    <a class="p3" href="#/t/qudurat"><span class="ic">${IC.sigma}</span><h3>القدرات الكمي</h3><span class="st">قريبًا</span></a>
  </div>
  <a class="chcard" href="#/challenge">
    <span class="ic">${IC.target}</span>
    <span class="txt"><span class="lbl">تحدي اليوم · ${esc(ch.date)}</span><span class="t">${esc(ch.title)}</span></span>
    <span class="go">ابدأ التحدي</span>
  </a>
  <div class="section-title">أدوات التعلم</div>
  <div class="tools"><div class="grid">
    <a class="tile" href="#/test"><span class="ic" style="background:#e0f5f1">${IC.quiz}</span><span class="name">الاختبارات والتدريبات</span><span class="st on">نموذج متاح</span></a>
    <a class="tile" href="#/book"><span class="ic" style="background:#fdf3d8">${IC.book}</span><span class="name">الكتاب التفاعلي</span><span class="st on">نموذج متاح</span></a>
    <a class="tile" href="#/soon"><span class="ic" style="background:#efeafc">${IC.flask}</span><span class="name">مختبر الرياضيات</span><span class="st">قريبًا</span></a>
    <a class="tile" href="#/soon"><span class="ic" style="background:#e7f0fd">${IC.folder}</span><span class="name">مكتبة الملفات</span><span class="st">قريبًا</span></a>
  </div></div>
  <div class="section-title">أحدث المحتويات</div>`;
  const latest = [];
  DATA.grades.forEach((g) => g.lessons.forEach((l, li) => l.videos.forEach((v, vi) => {
    if (v.yt) latest.push({ t: v.n, s: `${l.title} · ${g.title}`, u: `#/g/${g.id}/l/${li}/v/${vi}` });
  })));
  latest.slice(-3).reverse().forEach((x) => {
    h += `<div class="vrow">${saveBtn(x.u, x.t)}<span class="vn">${esc(x.t)}<span class="vsub">${esc(x.s)}</span></span><a class="play" href="${x.u}">${IC.play} تشغيل</a></div>`;
  });
  return h;
}
function manhag() {
  let h = '<a class="back" href="#/">‹ رجوع</a><div class="section-title">المنهج المصري — اختر صفّك</div>';
  const nums = { g1: '١', g2: '٢', g3: '٣' };
  for (const g of DATA.grades) h += `<a class="card" href="#/g/${g.id}"><span class="chip">${nums[g.id] || '•'}</span><span class="txt"><h2>${esc(g.title)}</h2><div class="sub">المرحلة الإعدادية</div></span><span class="arrow">‹</span></a>`;
  return h;
}
function grade(gid) {
  const g = DATA.grades.find((x) => x.id === gid);
  let h = `<a class="back" href="#/manhag">‹ المنهج المصري</a><div class="section-title">${esc(g.title)} — الدروس</div>`;
  g.lessons.forEach((l, i) => { h += `<a class="card" href="#/g/${g.id}/l/${i}"><span class="chip">${i + 1}</span><span class="txt"><h2>${esc(l.title)}</h2><div class="sub">${esc(l.label)}</div></span><span class="arrow">‹</span></a>`; });
  h += `<div class="note">باقي دروس الصف قريبًا</div>`;
  return h;
}
function lesson(gid, li) {
  const g = DATA.grades.find((x) => x.id === gid);
  const l = g.lessons[li];
  let h = `<a class="back" href="#/g/${g.id}">‹ ${esc(g.title)}</a><div class="section-title">${esc(l.title)} <span class="stag">${esc(l.label)}</span></div>`;
  l.videos.forEach((v, vi) => {
    const u = `#/g/${g.id}/l/${li}/v/${vi}`;
    h += v.yt
      ? `<div class="vrow">${saveBtn(u, v.n)}<span class="vn">${esc(v.n)}</span><a class="play" href="${u}">${IC.play} تشغيل</a></div>`
      : `<div class="vrow"><span class="vn">${esc(v.n)}</span><a class="play off" href="#/soon">قريبًا</a></div>`;
  });
  if (l.quiz) h += `<a class="card quizlink" href="#/test"><span class="chip" style="background:#e0f5f1">${IC.quiz}</span><span class="txt"><h2>اختبار الدرس</h2><div class="sub">${QUIZSETS[l.quiz].questions.length} أسئلة مع تصحيح فوري وتفسير</div></span><span class="arrow">‹</span></a>`;
  h += `<div class="note">باقي مهارات الدرس قريبًا</div>`;
  return h;
}
function track(tid) {
  const t = DATA[tid];
  let h = `<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">${esc(t.title)} — ${esc(t.subtitle)}</div>`;
  if (tid === 'qudurat') {
    QUDURAT_CHAPTERS.forEach((c, i) => {
      h += `<div class="vrow"><span class="vn">${esc(c)}</span><span class="badge soon">قريبًا</span></div>`;
    });
    h += `<div class="note">مكتبة القدرات جاهزة التنظيم حسب أبواب الكتاب المعتمد — الفيديوهات هتتضاف هنا أول ما تتنشر</div>`;
  } else if (tid === 'leh') {
    LEH_CATS.forEach((c) => {
      h += `<div class="vrow"><span class="vn">${esc(c)}</span><span class="badge soon">قريبًا</span></div>`;
    });
    h += `<div class="note">قسم «ليه؟» للرياضيات الممتعة — المحتوى قيد التجهيز</div>`;
  } else if (!t.groups.length) h += `<div class="note">قريبًا — شغالين على تجهيز المكتبة كاملة</div>`;
  t.groups.forEach((gr, i) => {
    h += `<a class="card" href="#/t/${tid}/c/${i}"><span class="chip">${i + 1}</span><span class="txt"><h2>${esc(gr.title)}</h2></span><span class="arrow">‹</span></a>`;
  });
  return h;
}
function trackGroup(tid, ci) {
  const t = DATA[tid];
  const gr = t.groups[ci];
  let h = `<a class="back" href="#/t/${tid}">‹ ${esc(t.title)}</a><div class="section-title">${esc(gr.title)}</div>`;
  gr.skills.forEach((s) => {
    h += `<div class="vrow"><span class="vn">${esc(s)}</span><a class="play off" href="#/soon">قريبًا</a></div>`;
  });
  return h;
}
function watch(gid, li, vi) {
  const g = DATA.grades.find((x) => x.id === gid);
  const l = g.lessons[li];
  const v = l.videos[vi];
  const u = `#/g/${g.id}/l/${li}/v/${vi}`;
  setLast(u, v.n);
  const next = l.videos[vi + 1];
  const nu = next && next.yt ? `#/g/${g.id}/l/${li}/v/${vi + 1}` : null;
  return `<a class="back" href="#/g/${g.id}/l/${li}">‹ ${esc(l.title)}</a>
  <div class="section-title">${esc(v.n)}</div>
  <div class="playerwrap"><iframe src="https://www.youtube-nocookie.com/embed/${v.yt}" title="${esc(v.n)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
  <div class="actionrow">
    ${saveBtn(u, v.n)}
    ${shareBtn(v.n, u)}
    ${nu ? `<a class="nextbtn" href="${nu}">المهارة التالية ‹</a>` : ''}
  </div>`;
}
function saved() {
  const s = getSaved();
  let h = `<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">محفوظاتي</div>`;
  if (!s.length) return h + `<div class="note">لسه ما حفظتش حاجة. افتح أي درس ودوس على علامة الحفظ.</div>`;
  s.forEach((x) => {
    h += `<div class="vrow">${saveBtn(x.u, x.t)}<span class="vn">${esc(x.t)}</span><a class="play" href="${x.u}">${IC.play} تشغيل</a></div>`;
  });
  return h;
}

/* ===== quiz engine (real, local, mistakes captured) ===== */
let qState = null;
function test() {
  qState = { set: QUIZSETS.g3l1, i: 0, score: 0 };
  return quizHtml();
}
function quizHtml() {
  const set = qState.set;
  if (qState.i >= set.questions.length) {
    return `<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">${esc(set.title)}</div>
    <div class="quiz"><div class="qcard result">
      <div class="qhead">نتيجتك</div>
      <div class="score">${qState.score} / ${set.questions.length}</div>
      <div class="cap">${qState.score === set.questions.length ? 'ممتاز! جاهز للدرس اللي بعده' : 'راجع الدرس وحاول تاني — الأسئلة اللي غلطت فيها اتحفظت في «أخطائي»'}</div>
      <button class="btn2" onclick="location.hash='#/test'">إعادة الاختبار</button>
      <a class="btn2 ghost" href="#/g/g3/l/0">مراجعة الدرس</a>
      ${getMistakes().length ? `<a class="btn2 ghost" href="#/mistakes">أخطائي (${getMistakes().length})</a>` : ''}
    </div></div>`;
  }
  const cur = set.questions[qState.i];
  return `<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">${esc(set.title)}</div>
  <div class="quiz"><div class="qcard">
    <div class="qhead">سؤال ${qState.i + 1} من ${set.questions.length}</div>
    <div class="qtext">${cur.q}</div>
    <div class="opts">${cur.o.map((o, oi) => `<button onclick="answer(${oi})">${o}</button>`).join('')}</div>
  </div></div>`;
}
function answer(oi) {
  const set = qState.set;
  const cur = set.questions[qState.i];
  const btns = document.querySelectorAll('.quiz .opts button');
  btns.forEach((b, bi) => {
    b.disabled = true;
    if (bi === cur.a) b.classList.add('ok');
    else if (bi === oi) b.classList.add('no');
  });
  if (oi === cur.a) qState.score++;
  else addMistake({ q: cur.q, your: cur.o[oi], right: cur.o[cur.a], ex: cur.ex, skill: set.skill, from: '#/test' });
  setTimeout(() => { qState.i++; app.innerHTML = quizHtml(); window.scrollTo(0, 0); }, 1100);
}
window.answer = answer;

/* ===== daily challenge ===== */
let chState = null;
function challenge() {
  chState = { done: false };
  return challengeHtml(CHALLENGES[0]);
}
function challengeHtml(c, done, picked) {
  let h = `<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">تحدي اليوم · ${esc(c.date)}</div>
  <div class="quiz"><div class="qcard">
    <div class="qhead">${esc(c.cat)} · مستوى: ${esc(c.level)}</div>
    <div class="qtext">${esc(c.q)}</div>
    <div class="opts">${c.o.map((o, oi) => {
      let cls = '';
      if (done) { if (oi === c.a) cls = ' class="ok"'; else if (oi === picked) cls = ' class="no"'; }
      return `<button${cls} onclick="chAnswer(${oi})" ${done ? 'disabled' : ''}>${o}</button>`;
    }).join('')}</div>`;
  if (done) {
    h += `<div class="explain ${picked === c.a ? 'good' : 'bad'}">
      <b>${picked === c.a ? 'إجابة صحيحة!' : 'الإجابة الصحيحة: ' + c.o[c.a]}</b>
      <div>${esc(c.ex)}</div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn2" onclick="location.hash='#/challenge'">محاولة تانية</button>
      <button class="btn2 ghost" onclick="shareLink('تحدي اليوم — رياضيات مع مستر سعد', '#/challenge', 'حل تحدي اليوم: ${esc(c.q)}')">شارك السؤال</button>
    </div>`;
  }
  h += `</div></div><div class="note">تحدي جديد كل يوم — أرشيف التحديات السابقة هيظهر هنا مع أول تحدي سابق</div>`;
  return h;
}
function chAnswer(oi) {
  const c = CHALLENGES[0];
  if (oi !== c.a) addMistake({ q: c.q, your: c.o[oi], right: c.o[c.a], ex: c.ex, skill: c.cat, from: '#/challenge' });
  app.innerHTML = challengeHtml(c, true, oi);
  window.scrollTo(0, 0);
}
window.chAnswer = chAnswer;

/* ===== mistakes bank ===== */
function mistakes() {
  const ms = getMistakes();
  let h = `<a class="back" href="#/account">‹ حسابي</a><div class="section-title">أخطائي</div>`;
  if (!ms.length) return h + `<div class="note">مفيش أخطاء محفوظة — أي إجابة غلط في اختبار أو تحدي هتتسجل هنا تلقائيًا للمراجعة.</div>`;
  ms.forEach((m, i) => {
    h += `<div class="qcard mcard">
      <div class="qhead">${esc(m.skill)}</div>
      <div class="qtext" style="font-size:15px">${esc(m.q)}</div>
      <div class="mline bad">إجابتك: ${esc(m.your)}</div>
      <div class="mline good">الصح: ${esc(m.right)}</div>
      <div class="mex">${esc(m.ex)}</div>
      <a class="btn2 ghost" href="${m.from}">إعادة المحاولة</a>
    </div>`;
  });
  return h;
}

/* ===== interactive book sample ===== */
let bp = 0;
function book() { bp = 0; return bookHtml(); }
function bookHtml() {
  const pg = BOOK[bp];
  return `<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">الكتاب التفاعلي — نموذج</div>
  <div class="bookpg">
    <div class="ptag">وحدة قوى القوى · الصف الثالث الإعدادي · صفحة ${bp + 1} من ${BOOK.length}</div>
    <h3>${pg.t}</h3>
    <p>${pg.p}</p>
    <div class="f">${pg.f}</div>
    <div class="ex">${pg.ex}</div>
  </div>
  <div class="booknav">
    <button onclick="bookGo(-1)" ${bp === 0 ? 'disabled' : ''}>‹ السابق</button>
    <button onclick="bookGo(1)" ${bp === BOOK.length - 1 ? 'disabled' : ''}>التالي ›</button>
  </div>
  <div class="dots">${BOOK.map((_, i) => `<i class="${i === bp ? 'on' : ''}"></i>`).join('')}</div>
  <div class="note">نموذج تجريبي من ٤ صفحات — الكتاب الكامل قريبًا</div>`;
}
function bookGo(d) {
  bp = Math.min(BOOK.length - 1, Math.max(0, bp + d));
  app.innerHTML = bookHtml();
  window.scrollTo(0, 0);
}
window.bookGo = bookGo;

/* ===== account (guest, local) ===== */
function account() {
  const t = localStorage.getItem('saad.theme.v1') || 'auto';
  const s = getSaved().length, m = getMistakes().length, last = getLast();
  return `<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">حسابي</div>
  <div class="qcard">
    <div class="qhead">وضع الزائر</div>
    <p style="font-size:13.5px;line-height:1.9;color:var(--mut);margin:6px 0 0">تقدّمك محفوظ على جهازك فقط — بدون تسجيل. إنشاء الحسابات والمزامنة بين الأجهزة قريبًا.</p>
  </div>
  <a class="card" href="#/saved"><span class="chip" style="background:#fdeaef"><span style="color:#d94f70">${IC.mark}</span></span><span class="txt"><h2>محفوظاتي</h2><div class="sub">${s} عنصر محفوظ</div></span><span class="arrow">‹</span></a>
  <a class="card" href="#/mistakes"><span class="chip">!</span><span class="txt"><h2>أخطائي</h2><div class="sub">${m} سؤال للمراجعة</div></span><span class="arrow">‹</span></a>
  ${last ? `<a class="card" href="${last.u}"><span class="chip">▶</span><span class="txt"><h2>آخر ما شاهدت</h2><div class="sub">${esc(last.t)}</div></span><span class="arrow">‹</span></a>` : ''}
  <div class="section-title">الإعدادات</div>
  <div class="qcard">
    <div class="qhead">المظهر</div>
    <div class="themerow">
      <button class="tbtn ${t === 'auto' ? 'on' : ''}" onclick="setTheme('auto')">تلقائي</button>
      <button class="tbtn ${t === 'light' ? 'on' : ''}" onclick="setTheme('light')">نهاري</button>
      <button class="tbtn ${t === 'dark' ? 'on' : ''}" onclick="setTheme('dark')">ليلي</button>
    </div>
  </div>`;
}

/* ===== router ===== */
function route() {
  const p = location.hash.replace(/^#\//, '').split('/').filter(Boolean);
  let html;
  if (p[0] === 'manhag') html = manhag();
  else if (p[0] === 'g' && p[2] === 'l' && p[4] === 'v') html = watch(p[1], +p[3], +p[5]);
  else if (p[0] === 'g' && p[2] === 'l') html = lesson(p[1], +p[3]);
  else if (p[0] === 'g') html = grade(p[1]);
  else if (p[0] === 't' && p[2] === 'c') html = trackGroup(p[1], +p[3]);
  else if (p[0] === 't') html = track(p[1]);
  else if (p[0] === 'test') html = test();
  else if (p[0] === 'book') html = book();
  else if (p[0] === 'saved') html = saved();
  else if (p[0] === 'challenge') html = challenge();
  else if (p[0] === 'mistakes') html = mistakes();
  else if (p[0] === 'account') html = account();
  else html = home();
  app.innerHTML = html;
  document.body.classList.toggle('sub', p.length > 0);
  const q = document.getElementById('q');
  const sr = document.getElementById('sres');
  if (sr) { sr.classList.remove('open'); sr.innerHTML = ''; }
  document.querySelectorAll('#tabbar a').forEach((a) => a.classList.toggle('active',
    (p[0] === 'manhag' || p[0] === 'g' || p[0] === 't') ? a.dataset.route === 'manhag'
    : (p[0] === 'saved') ? a.dataset.route === 'saved'
    : (p[0] === 'account' || p[0] === 'mistakes') ? a.dataset.route === 'account'
    : a.dataset.route === 'home' && p.length === 0));
  window.scrollTo(0, 0);
  if (p[0] === 'soon') toast('غير متاح حاليًا — شغالين عليها');
}
window.addEventListener('hashchange', route);
route();
if (location.search.indexOf('saq=') === 1) saSearch(decodeURIComponent(location.search.slice(5)));

/* QA hooks (only active with ?qa= in URL) */
(function(){
  const m = location.search.match(/[?&]qa=(\w+)/);
  if (!m) return;
  const mode = m[1];
  if (mode === 'book3') { book(); bp = 2; app.innerHTML = bookHtml(); }
  if (mode === 'quizpass' || mode === 'quizfail') {
    app.innerHTML = test();
    const set = qState.set;
    set.questions.forEach((cur, i) => {
      const pick = (mode === 'quizfail' && i === 0) ? (cur.a + 1) % cur.o.length : cur.a;
      if (pick === cur.a) qState.score++;
      else addMistake({ q: cur.q, your: cur.o[pick], right: cur.o[cur.a], ex: cur.ex, skill: set.skill, from: '#/test' });
      qState.i++;
    });
    app.innerHTML = quizHtml();
  }
  if (mode === 'chpass') { app.innerHTML = challengeHtml(CHALLENGES[0], true, CHALLENGES[0].a); }
  if (mode === 'chfail') {
    const c = CHALLENGES[0]; const wrong = (c.a + 1) % c.o.length;
    addMistake({ q: c.q, your: c.o[wrong], right: c.o[c.a], ex: c.ex, skill: c.cat, from: '#/challenge' });
    app.innerHTML = challengeHtml(c, true, wrong);
  }
  if (mode === 'mistakes') {
    addMistake({ q: '٢³ × ٢⁴ = ؟'.replace('٢\u0764','٢⁴'), your: '٢¹²', right: '٢⁷', ex: 'حاصل الضرب لنفس الأساس: نجمع الأسس', skill: 'قوى القوى', from: '#/test' });
    app.innerHTML = mistakes();
  }
  if (mode === 'saved2') {
    localStorage.setItem('saad.saved.v1', JSON.stringify([{u:'#/g/g3/l/0/v/0',t:'المهارة ١: قوة القوة'},{u:'#/g/g2/l/0/v/0',t:'المهارة ١: العدد غير النسبي'}]));
    app.innerHTML = saved();
  }
  if (mode === 'homefull') {
    localStorage.setItem('saad.last.v1', JSON.stringify({u:'#/g/g3/l/0/v/1',t:'المهارة ٢: الإشارة'}));
    route();
  }
})();
