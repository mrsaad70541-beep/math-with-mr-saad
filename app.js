const app = document.getElementById('app');
const toArNum = (n) => String(n).replace(/[0-9]/g, (c) => '٠١٢٣٤٥٦٧٨٩'[c]);
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ===== theme (light/dark, local) ===== */
function applyTheme() {
  const t = localStorage.getItem('saad.theme.v1') || 'auto';
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
}
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

/* ===== scroll memory + connection feedback (brief §4) ===== */
const scrollMem = {};
const navStack = [location.hash];
let navIdx = 0;
window.addEventListener('scroll', () => { scrollMem[location.hash] = window.scrollY; }, { passive: true });
function trackNav() {
  const h = location.hash;
  if (navStack[navIdx] === h) return scrollMem[h] || 0;
  if (navStack[navIdx - 1] === h) navIdx--;
  else if (navStack[navIdx + 1] === h) navIdx++;
  else { navStack.length = navIdx + 1; navStack.push(h); navIdx++; }
  return scrollMem[h] || 0;
}
window.addEventListener('offline', () => toast('انقطع الاتصال بالإنترنت — المحتوى المحفوظ على جهازك يفضل شغال'));
window.addEventListener('online', () => toast('رجع الاتصال بالإنترنت'));
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
function fullUrl(u) { return /^https?:\/\//.test(u) ? u : location.origin + location.pathname + u; }
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
  if (l._gone) return;
  l.videos.forEach((v, vi) => { if (v.yt && !v._gone) SEARCH.push({ t: `${v.n} — ${l.title} · ${g.title}`, u: `#/g/${g.id}/l/${li}/v/${vi}` }); });
  SEARCH.push({ t: `درس ${l.title} — ${g.title}`, u: `#/g/${g.id}/l/${li}` });
  if (l.quiz) SEARCH.push({ t: `اختبار درس ${l.title}`, u: '#/test' });
}));
DATA.grades.forEach((g) => SEARCH.push({ t: g.title + ' — المنهج المصري', u: `#/g/${g.id}` }));
SEARCH.push({ t: 'المنهج المصري — الصفوف الإعدادية', u: '#/manhag' });
QUDURAT_CHAPTERS.forEach((c) => SEARCH.push({ t: c + ' — القدرات الكمي', u: '#/t/qudurat' }));
LEH_CATS.forEach((c) => SEARCH.push({ t: c + ' — ليه؟', u: '#/t/leh' }));
SEARCH.push({ t: 'القدرات الكمي — المنهج السعودي', u: '#/t/qudurat' });
SEARCH.push({ t: 'ليه؟ — رياضيات عامة', u: '#/t/leh' });
SEARCH.push({ t: LEH_SAMPLE.n + ' — ليه؟ (نموذج)', u: '#/v/' + LEH_SAMPLE.yt });
CHALLENGES.forEach((c) => SEARCH.push({ t: 'تحدي اليوم: ' + c.title, u: '#/challenge' }));
SEARCH.push({ t: 'اكتشف مستواك — اختبار تشخيصي', u: '#/diagnostic' });
SEARCH.push({ t: 'إنجازاتي', u: '#/account' });
SEARCH.push({ t: 'مكتبة الملفات', u: '#/files' });
LIB_CATS.forEach((c) => SEARCH.push({ t: c.n + ' — مكتبة الملفات', u: '#/files/' + c.id }));
SEARCH.push({ t: 'مختبر الرياضيات — تجارب تفاعلية', u: '#/lab' });
LAB.EXPERIMENTS.forEach((e) => SEARCH.push({ t: 'تجربة: ' + e.title + ' — مختبر الرياضيات', u: '#/lab/' + e.id }));
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
  cap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 2 9l10 5 10-5Z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/><path d="M22 9v5"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.5 1 2.5h6c0-1 .3-1.9 1-2.5A6 6 0 0 0 12 3Z"/></svg>',
  sigma: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M17 5H7l6 7-6 7h10"/></svg>',
  quiz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8.5 12.5 2 2 4.5-4.5"/><path d="M8.5 7.5h7"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5.5C4 4 7 3.6 12 5.4c5-1.8 8-1.4 10 .1V19c-2-1.5-5-1.9-10-.1-5-1.8-8-1.4-10 .1Z"/><path d="M12 5.4V18.9"/></svg>',
  flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v6L4.5 18a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 9V3"/><path d="M7.5 14h9"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>',
  mark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4.5L6 21Z"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5Z"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/></svg>',
  award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5.5"/><path d="m8.6 13.5-1.8 7 5.2-3 5.2 3-1.8-7"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
};

function saveBtn(u, t) {
  return `<button class="savebtn ${isSaved(u) ? 'on' : ''}" onclick="toggleSave('${u}', this.dataset.t)" data-t="${esc(t)}" aria-label="حفظ">${IC.mark}</button>`;
}
function shareBtn(title, u, text) {
  return `<button class="savebtn" onclick="shareLink(this.dataset.t, '${u}', this.dataset.x)" data-t="${esc(title)}" data-x="${esc(text || '')}" aria-label="مشاركة">${IC.share}</button>`;
}

/* ===== pages ===== */
function soon() {
  return `<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">قريبًا</div>
  <div class="qcard"><div class="qhead">هذه الميزة قيد التجهيز</div>
  <p style="font-size:13.5px;line-height:1.9;color:var(--mut);margin:6px 0 0">شغالين على تجهيزها وهتتاح هنا أول ما تخلص. المتاح حاليًا: دروس المنهج المصري والاختبارات والمختبر والكتاب التجريبي وتحدي اليوم — كلها من الصفحة الرئيسية.</p></div>`;
}
function home() {
  const last = getLast();
  const ch = CHALLENGES[0];
  let h = `
  <div class="searchwrap">
    <div class="searchbar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
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
    <a class="p2" href="#/t/leh"><span class="ic">${IC.bulb}</span><h3>ليه؟</h3><span class="st on2">نموذج متاح</span></a>
    <a class="p3" href="#/t/qudurat"><span class="ic">${IC.sigma}</span><h3>القدرات الكمي</h3><span class="st">قريبًا</span></a>
  </div>
  <a class="chcard" href="#/challenge">
    <span class="ic">${IC.target}</span>
    <span class="txt"><span class="lbl">${chLabel(ch)} · ${esc(ch.date)}</span><span class="t">${esc(ch.title)}</span></span>
    <span class="go">ابدأ التحدي</span>
  </a>
  <div class="section-title">أدوات التعلم</div>
  <div class="tools"><div class="grid">
    <a class="tile" href="#/test"><span class="ic">${IC.quiz}</span><span class="name">الاختبارات والتدريبات</span><span class="st on">نموذج متاح</span></a>
    <a class="tile" href="#/book"><span class="ic">${IC.book}</span><span class="name">الكتاب التفاعلي</span><span class="st on">نموذج متاح</span></a>
    <a class="tile" href="#/lab"><span class="ic">${IC.flask}</span><span class="name">مختبر الرياضيات</span><span class="st on2">متاح الآن</span></a>
    <a class="tile" href="#/diagnostic"><span class="ic">${IC.target || IC.quiz}</span><span class="name">اكتشف مستواك</span><span class="st on2">متاح الآن</span></a>
    <a class="tile" href="#/files"><span class="ic">${IC.folder}</span><span class="name">مكتبة الملفات</span><span class="st">بانتظار المحتوى</span></a>
  </div></div>
  <div class="section-title">أحدث المحتويات</div>`;
  const latest = [];
  DATA.grades.forEach((g) => g.lessons.forEach((l, li) => l.videos.forEach((v, vi) => {
    if (v._gone) return;
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
  g.lessons.forEach((l, i) => {
    if (l._gone) { h += `<div class="card"><span class="chip">${i + 1}</span><span class="txt"><h2>درس غير متاح حاليًا</h2></span></div>`; return; }
    h += `<a class="card" href="#/g/${g.id}/l/${i}"><span class="chip">${i + 1}</span><span class="txt"><h2>${esc(l.title)}</h2><div class="sub">${esc(l.label)}</div></span><span class="arrow">‹</span></a>`;
  });
  h += `<div class="note">باقي دروس الصف قريبًا</div>`;
  return h;
}
function lesson(gid, li) {
  const g = DATA.grades.find((x) => x.id === gid);
  const l = g.lessons[li];
  if (!l || l._gone) return `<a class="back" href="#/g/${g.id}">‹ ${esc(g.title)}</a><div class="note">هذا الدرس غير متاح حاليًا</div>`;
  const meta = (typeof LESSON_META !== 'undefined') ? LESSON_META[gid + '/' + li] : null;
  let h = `<a class="back" href="#/g/${g.id}">‹ ${esc(g.title)}</a><div class="section-title">${esc(l.title)} <span class="stag">${esc(l.label)}</span></div>`;
  h += `<div class="lactions">${saveBtn('#/g/' + gid + '/l/' + li, l.title + ' — ' + g.title)}<button class="btn2 sm ghost" onclick="shareLink('${esc(l.title)} — رياضيات مع مستر سعد', '#/g/${gid}/l/${li}', 'درس ${esc(l.title)} (${esc(g.title)})')">مشاركة الدرس</button></div>`;
  if (meta && meta.objectives) h += `<div class="lmeta"><h3>أهداف التعلم</h3><ul class="objlist">${meta.objectives.map((o) => `<li><span class="ot">${esc(o.t)}</span>${o.e ? `<span class="eqline">${o.e}</span>` : ''}${o.c ? `<span class="econd">${o.c}</span>` : ''}</li>`).join('')}</ul></div>`;
  h += `<h3 class="subhead">شرح الدرس بالفيديو</h3>`;
  l.videos.forEach((v, vi) => {
    if (v._gone) return;
    const u = `#/g/${g.id}/l/${li}/v/${vi}`;
    h += v.yt
      ? `<div class="vrow">${saveBtn(u, v.n)}<span class="vn">${esc(v.n)}</span><a class="play" href="${u}">${IC.play} تشغيل</a></div>`
      : `<div class="vrow"><span class="vn">${esc(v.n)}</span><a class="play off" href="#/soon">قريبًا</a></div>`;
  });
  if (meta && meta.summary) h += `<div class="lmeta"><h3>ملخص الدرس</h3><p>${meta.summary}</p></div>`;
  if (meta && meta.skills) h += `<div class="lmeta"><h3>المهارات المرتبطة</h3><div class="skillchips">${meta.skills.map((s) => `<span class="skillchip">${esc(s)}</span>`).join('')}</div></div>`;
  if (meta && meta.examples) h += `<div class="lmeta"><h3>أمثلة محلولة</h3>${meta.examples.map((e, i) => `<div class="excard"><div class="exq"><span class="exlabel">مثال ${'٠١٢٣٤٥٦٧٨٩'[i + 1]}</span><span class="eqline">${e.q} = ؟</span></div><button class="btn2 sm ghost" onclick="this.nextElementSibling.classList.toggle('open');this.textContent=this.nextElementSibling.classList.contains('open')?'إخفاء الحل':'عرض الحل'">عرض الحل</button><div class="exsol"><span class="ot">${esc(e.solT)}</span><span class="eqline">${e.solE}</span></div></div>`).join('')}</div>`;
  if (l.quiz) h += `<a class="card quizlink" href="#/test"><span class="chip">${IC.quiz}</span><span class="txt"><h2>اختبار الدرس</h2><div class="sub">${QUIZSETS[l.quiz].questions.length} أسئلة مع تصحيح فوري وتفسير</div></span><span class="arrow">‹</span></a>`;
  const prev = li > 0 ? g.lessons[li - 1] : null;
  const next = li < g.lessons.length - 1 ? g.lessons[li + 1] : null;
  if (prev || next) {
    h += '<div class="lessonnav">';
    h += prev ? `<a class="btn2 sm ghost" href="#/g/${gid}/l/${li - 1}">‹ السابق: ${esc(prev.title)}</a>` : '<span></span>';
    h += next ? `<a class="btn2 sm ghost" href="#/g/${gid}/l/${li + 1}">التالي: ${esc(next.title)} ›</a>` : '<span></span>';
    h += '</div>';
  }
  if (!meta) h += `<div class="note">باقي تفاصيل الدرس قريبًا</div>`;
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
    h += `<div class="vrow">${saveBtn('#/v/' + LEH_SAMPLE.yt, LEH_SAMPLE.n)}<span class="vn">${esc(LEH_SAMPLE.n)}<span class="vsub">${esc(LEH_SAMPLE.t)}</span></span><a class="play" href="#/v/${LEH_SAMPLE.yt}">${IC.play} تشغيل</a></div>`;
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
  if (!v || v._gone || !v.yt) return `<a class="back" href="#/g/${g.id}/l/${li}">‹ ${esc(l.title)}</a><div class="note">هذا المحتوى غير متاح حاليًا</div>`;
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
  qState = { set: QUIZSETS.g3l1, i: 0, score: 0, locked: false };
  return quizHtml();
}
function quizHtml() {
  const set = qState.set;
  if (qState.i >= set.questions.length) {
    if (!qState.done) { qState.done = true; onQuizDone(); }
    return `<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">${esc(set.title)}</div>
    <div class="quiz"><div class="qcard result">
      <div class="qhead">نتيجتك</div>
      <div class="score">${qState.score} <span class="of">من</span> ${set.questions.length}</div>
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
    <div class="qtext eqwrap">${cur.q}</div>
    <div class="opts">${cur.o.map((o, oi) => `<button onclick="answer(${oi})">${o}</button>`).join('')}</div>
  </div></div>`;
}
function answer(oi) {
  if (qState.locked) return;
  qState.locked = true;
  const set = qState.set;
  const cur = set.questions[qState.i];
  const btns = document.querySelectorAll('.quiz .opts button');
  btns.forEach((b, bi) => {
    b.disabled = true;
    if (bi === cur.a) b.classList.add('ok');
    else if (bi === oi) b.classList.add('no');
  });
  if (oi === cur.a) qState.score++;
  else addMistake({ q: cur.q, your: cur.o[oi], right: cur.o[cur.a], exT: cur.exT, exE: cur.exE, skill: set.skill, from: '#/test' });
  setTimeout(() => { if (!location.hash.startsWith('#/test')) return; qState.i++; qState.locked = false; app.innerHTML = quizHtml(); window.scrollTo(0, 0); }, 1100);
}
window.answer = answer;


/* ===== achievements (local, learning-tied) ===== */
function getAch() { try { return JSON.parse(localStorage.getItem('saad.ach.v1') || '{}'); } catch (e) { return {}; } }
function getBest() { try { return JSON.parse(localStorage.getItem('saad.quizbest.v1') || '{}'); } catch (e) { return {}; } }
function unlock(id) {
  const ach = getAch();
  if (ach[id]) return;
  ach[id] = new Date().toISOString();
  localStorage.setItem('saad.ach.v1', JSON.stringify(ach));
  const def = ACHIEVEMENTS.find((x) => x.id === id);
  if (def) setTimeout(() => toast('إنجاز جديد: ' + def.n), 300);
}
function onQuizDone() {
  const set = qState.set;
  unlock('lesson');
  const best = getBest();
  const prev = best[set.title];
  const full = qState.score === set.questions.length;
  if (full) {
    unlock('master');
    if (getMistakes().some((m) => m.skill === set.skill)) unlock('fix');
  }
  if (prev != null && qState.score > prev) unlock('improve');
  if (prev == null || qState.score > prev) {
    best[set.title] = qState.score;
    localStorage.setItem('saad.quizbest.v1', JSON.stringify(best));
  }
  if (getAch().master && getAch().challenge) unlock('cert');
}
function goalGet() { try { return JSON.parse(localStorage.getItem('saad.goal.v1') || 'null'); } catch (e) { return null; } }
function goalSet() {
  const el = document.getElementById('goalInput');
  const text = (el.value || '').trim();
  if (!text) return;
  localStorage.setItem('saad.goal.v1', JSON.stringify({ text, done: false }));
  route();
}
function goalToggle() {
  const g = goalGet();
  if (!g) return;
  g.done = !g.done;
  localStorage.setItem('saad.goal.v1', JSON.stringify(g));
  route();
}
window.goalSet = goalSet; window.goalToggle = goalToggle;
function achBlock() {
  const ach = getAch();
  const g = goalGet();
  let h = '<div class="section-title">إنجازاتي</div>';
  h += `<div class="qcard"><div class="qhead">هدفي التعليمي</div>`;
  if (g) {
    h += `<div class="goalrow"><label class="goalchk"><input type="checkbox" ${g.done ? 'checked' : ''} onchange="goalToggle()"> <span class="${g.done ? 'goaldone' : ''}">${esc(g.text)}</span></label></div>`;
  }
  h += `<div class="goalrow"><input id="goalInput" class="goalinput" type="text" maxlength="80" placeholder="مثال: أخلص درس قوى القوى هذا الأسبوع" value=""><button class="btn2 sm" onclick="goalSet()">حفظ الهدف</button></div>`;
  h += `<p class="dim" style="font-size:12px;margin:8px 0 0">هدف شخصي محفوظ على جهازك فقط — بدون ضغط ولا تذكيرات مزعجة.</p></div>`;
  h += '<div class="achgrid">';
  ACHIEVEMENTS.forEach((d) => {
    const got = ach[d.id];
    h += `<div class="achcard ${got ? 'on' : ''}"><div class="achic">${got ? '✓' : '·'}</div><div class="achn">${esc(d.n)}</div><div class="achd">${esc(d.desc)}</div>${got ? `<div class="achdate">${esc(got.slice(0, 10))}</div>` : ''}</div>`;
  });
  h += '</div>';
  const certReady = ach.master && ach.challenge;
  h += certReady
    ? `<a class="card quizlink" href="#/certificate"><span class="chip">${IC.award}</span><span class="txt"><h2>شهادة إتمام الوحدة</h2><div class="sub">تحققت شروطها: إتقان المهارة + حل التحدي</div></span><span class="arrow">‹</span></a>`
    : `<div class="qcard"><div class="qhead">شهادة إتمام الوحدة</div><p class="dim" style="font-size:13px;margin:6px 0 0">تُفتح عند تحقق شرطيها الفعليين: إتقان مهارة الدرس (علامة كاملة) وحل تحدي اليوم. حالتك الآن: إتقان ${ach.master ? '✓' : '—'} · تحدي ${ach.challenge ? '✓' : '—'}</p></div>`;
  return h;
}
function certificate() {
  const ach = getAch();
  if (!(ach.master && ach.challenge)) return account();
  const d = new Date().toISOString().slice(0, 10);
  return `<a class="back" href="#/account">‹ حسابي</a><div class="section-title">شهادة إتمام</div>
  <div class="cert">
    <div class="certband">رياضيات مع مستر سعد</div>
    <div class="certtitle">شهادة إتمام وحدة قوى القوى</div>
    <p class="certline">تشهد المنصة بأن هذا الطالب (وضع الزائر على هذا الجهاز) أتقن اختبار درس قوى القوى بالعلامة الكاملة وحل تحدي اليوم حلًّا صحيحًا.</p>
    <div class="certmeta"><span>التاريخ: ${d}</span><span>الرقم: ${'CERT-' + (ach.cert || d).slice(0, 10).replace(/-/g, '')}</span></div>
    <button class="btn2" onclick="shareLink('شهادة إتمام وحدة قوى القوى', '#/certificate', 'حصلت على شهادة إتمام وحدة قوى القوى في تطبيق رياضيات مع مستر سعد')">مشاركة</button>
  </div>`;
}

/* ===== اكتشف مستواك (diagnostic) ===== */
let dState = null;
function diag() {
  dState = { i: 0, per: {}, locked: false, plan: planGet() };
  return diagHtml();
}
function planGet() { try { return JSON.parse(localStorage.getItem('saad.plan.v1') || '{}'); } catch (e) { return {}; } }
function planToggle(skill) {
  const p = planGet();
  p[skill] = !p[skill];
  localStorage.setItem('saad.plan.v1', JSON.stringify(p));
  route();
}
window.planToggle = planToggle;
function diagHtml() {
  const qs = DIAG.questions;
  if (dState.i >= qs.length) {
    const skills = [...new Set(qs.map((q) => q.skill))];
    let h = `<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">نتيجة التشخيص</div>`;
    h += `<p class="dim labintro">${esc(DIAG.note)}</p>`;
    const needs = [];
    skills.forEach((s) => {
      const p = dState.per[s] || { c: 0, t: 0 };
      const mastered = p.c === p.t && p.t > 0;
      if (!mastered) needs.push(s);
      const q = qs.find((x) => x.skill === s);
      h += `<div class="labcard"><span class="labtag">${mastered ? 'متقنة' : 'تحتاج مراجعة'}</span><h3 style="margin:8px 0 4px;font-size:15px">${esc(s)} — أجبت صحيحًا على <bdi>${toArNum(p.c)} من ${toArNum(p.t)}</bdi></h3>
        ${mastered ? '<p class="dim">أداؤك هنا يشير إلى إتقان أولي لهذه المهارة.</p>'
          : `<p class="dim">الدرس المقترح: <a href="${q.lesson}">فتح الدرس</a> · والتدريب المناسب: <a href="#/test">اختبار قوى القوى</a> · راجع أخطاءك في <a href="#/mistakes">أخطائي</a>.</p>`}</div>`;
    });
    if (needs.length) {
      const plan = planGet();
      h += `<div class="labcard"><span class="labtag">خطة مراجعة قابلة للتعديل</span><p class="dim" style="margin-top:8px">اختر ما تريد إدراجه في خطتك — تُحفظ على جهازك:</p>`;
      needs.forEach((s) => {
        const on = plan[s] !== false;
        h += `<label class="goalchk planrow"><input type="checkbox" ${on ? 'checked' : ''} onchange="planToggle('${s}')"> مراجعة «${esc(s)}» ثم إعادة التشخيص</label>`;
      });
      h += '</div>';
    } else {
      h += `<div class="labcard"><p style="text-align:center">ممتاز — إجاباتك كلها صحيحة في هذا التشخيص الأولي. جرّب <a href="#/challenge">تحدي اليوم</a>.</p></div>`;
    }
    h += `<button class="btn2" onclick="location.hash='#/diagnostic'">إعادة التشخيص</button>`;
    return h;
  }
  const cur = qs[dState.i];
  return `<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">${esc(DIAG.title)}</div>
  <p class="dim labintro">${esc(DIAG.note)}</p>
  <div class="quiz"><div class="qcard">
    <div class="qhead">سؤال ${dState.i + 1} من ${qs.length} · ${esc(cur.skill)}</div>
    <div class="qtext eqwrap">${cur.q}</div>
    <div class="opts">${cur.o.map((o, oi) => `<button onclick="diagAnswer(${oi})">${o}</button>`).join('')}</div>
  </div></div>`;
}
function diagAnswer(oi) {
  if (dState.locked) return;
  dState.locked = true;
  const cur = DIAG.questions[dState.i];
  const p = dState.per[cur.skill] || (dState.per[cur.skill] = { c: 0, t: 0 });
  p.t++;
  const btns = document.querySelectorAll('.quiz .opts button');
  btns.forEach((b, bi) => {
    b.disabled = true;
    if (bi === cur.a) b.classList.add('ok');
    else if (bi === oi) b.classList.add('no');
  });
  if (oi === cur.a) p.c++;
  else addMistake({ q: cur.q, your: cur.o[oi], right: cur.o[cur.a], exH: cur.ex, skill: cur.skill, from: '#/diagnostic' });
  setTimeout(() => { if (!location.hash.startsWith('#/diagnostic')) return; dState.i++; dState.locked = false; app.innerHTML = diagHtml(); window.scrollTo(0, 0); }, 1100);
}
window.diagAnswer = diagAnswer;

/* ===== daily challenge ===== */
const CH_TZ = 'Asia/Riyadh';
function todayIso() { return new Intl.DateTimeFormat('en-CA', { timeZone: CH_TZ }).format(new Date()); }
function chIsToday(c) { return c.iso === todayIso(); }
function chLabel(c) { return chIsToday(c) ? 'تحدي اليوم' : 'أحدث تحدٍ منشور'; }
let chState = null;
function challenge() {
  window._chDone = false;
  chState = { done: false };
  return challengeHtml(CHALLENGES[0]);
}
function challengeHtml(c, done, picked) {
  let h = `<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">${chLabel(c)} · ${esc(c.date)}</div>
  <div class="quiz"><div class="qcard">
    <div class="qhead">${esc(c.cat)} · مستوى: ${esc(c.level)}</div>
    <div class="qtext eqwrap">${c.q}</div>
    <div class="opts">${c.o.map((o, oi) => {
      let cls = '';
      if (done) { if (oi === c.a) cls = ' class="ok"'; else if (oi === picked) cls = ' class="no"'; }
      return `<button${cls} onclick="chAnswer(${oi})" ${done ? 'disabled' : ''}>${o}</button>`;
    }).join('')}</div>`;
  if (done) {
    h += `<div class="explain ${picked === c.a ? 'good' : 'bad'}">
      <b>${picked === c.a ? 'إجابة صحيحة!' : 'الإجابة الصحيحة: ' + c.o[c.a]}</b>
      <div class="ot">${esc(c.exT)}</div>
      <span class="eqline">${c.exE}</span>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn2" onclick="location.hash='#/challenge'">محاولة تانية</button>
      <button class="btn2 ghost" onclick="shareLink('تحدي اليوم — رياضيات مع مستر سعد', '#/challenge', 'حل تحدي اليوم في تطبيق رياضيات مع مستر سعد')">شارك السؤال</button>
    </div>`;
  }
  h += `</div></div>${chIsToday(c) ? '<div class="note">تحدي جديد كل يوم — أرشيف التحديات السابقة هيظهر هنا مع أول تحدي سابق</div>' : '<div class="note">هذا أحدث تحدٍ منشور بتاريخه الظاهر أعلاه — لا يوجد تحدٍ جديد اليوم بعد.</div>'}`;
  return h;
}
function chAnswer(oi) {
  if (window._chDone) return;
  window._chDone = true;
  const c = CHALLENGES[0];
  if (oi === c.a) { unlock('challenge'); if (getAch().master) unlock('cert'); }
  if (oi !== c.a) addMistake({ q: c.q, your: c.o[oi], right: c.o[c.a], exT: c.exT, exE: c.exE, skill: c.cat, from: '#/challenge' });
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
      <div class="qtext" style="font-size:15px">${m.q}</div>
      <div class="mline bad">إجابتك: ${m.your}</div>
      <div class="mline good">الصح: ${m.right}</div>
      <div class="mex">${m.exE ? `<span class="ot">${esc(m.exT || '')}</span><span class="eqline">${m.exE}</span>` : (m.exH || esc(m.ex || ''))}</div>
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
    <div class="f eqwrap">${pg.f}</div>
    <div class="ex"><span class="exlabel">مثال</span><span class="eqline">${pg.ex}</span></div>
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

/* ===== sample video (approved ليه؟ sample) ===== */
function watchSample(yt) {
  const v = LEH_SAMPLE;
  if (yt !== v.yt) return soon();
  const u = '#/v/' + v.yt;
  setLast(u, v.n);
  return `<a class="back" href="#/t/leh">‹ ليه؟</a>
  <div class="section-title">${esc(v.n)}</div>
  <div class="playerwrap"><iframe src="https://www.youtube-nocookie.com/embed/${v.yt}" title="${esc(v.n)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
  <div class="actionrow">
    ${saveBtn(u, v.n)}
    ${shareBtn(v.n, u)}
  </div>`;
}

/* ===== account (guest, local) ===== */
function account() {
  const t = localStorage.getItem('saad.theme.v1') || 'auto';
  const s = getSaved().length, m = getMistakes().length, last = getLast();
  return `<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">حسابي</div>
  <div class="qcard">
    <div class="qhead">وضع الزائر</div>
    <p style="font-size:13.5px;line-height:1.9;color:var(--mut);margin:6px 0 0">تقدّمك محفوظ على جهازك فقط — بدون تسجيل. إنشاء الحسابات والمزامنة بين الأجهزة قريبًا.</p>
  </div>
  <a class="card" href="#/saved"><span class="chip">${IC.mark}</span><span class="txt"><h2>محفوظاتي</h2><div class="sub">${s} عنصر محفوظ</div></span><span class="arrow">‹</span></a>
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
  </div>
  ${achBlock()}`;
}

/* ===== router ===== */
function fileCard(f) {
  return `<div class="fcard">
    <div class="fic">${IC.folder}</div>
    <div class="fmeta">
      <div class="ft">${esc(f.title)}</div>
      <div class="fd">${esc(f.desc || '')}</div>
      <div class="ftags">${esc(f.grade || '')}${f.subject ? ' · ' + esc(f.subject) : ''}${f.added ? ' · أضيف ' + esc(f.added) : ''}</div>
    </div>
    <div class="fbtns">
      <a class="btn2 sm" href="${esc(f.url)}" target="_blank" rel="noopener">معاينة</a>
      ${f.allowDownload ? `<a class="btn2 sm ghost" href="${esc(f.url)}" download>تحميل</a>` : ''}
      <button class="btn2 sm ghost" onclick="shareLink('${esc(f.title)}', '${esc(f.url)}', '')">مشاركة</button>
    </div>
  </div>`;
}
function filesHome() {
  let h = '<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">مكتبة الملفات</div>';
  h += '<p class="dim labintro">أوراق عمل واختبارات وملخصات للمعلم والطالب. تُعرض هنا الملفات المعتمدة للنشر فقط.</p>';
  h += '<div class="labgrid">';
  LIB_CATS.forEach((c) => {
    const n = LIB_FILES.filter((f) => f.cat === c.id).length;
    h += `<a class="labitem" href="#/files/${c.id}"><span class="ic">${IC.folder}</span><span class="lt">${esc(c.n)}</span><span class="go">${n ? toArNum(n) + ' ملف' : 'فارغ حاليًا'}</span></a>`;
  });
  h += '</div>';
  return h;
}
function filesCat(id) {
  const c = LIB_CATS.find((x) => x.id === id);
  if (!c) return filesHome();
  const files = LIB_FILES.filter((f) => f.cat === id);
  let h = `<a class="back" href="#/files">‹ مكتبة الملفات</a><div class="section-title">${esc(c.n)}</div>`;
  if (!files.length) {
    h += `<div class="labcard"><p class="dim" style="text-align:center;padding:18px 0">لا توجد ملفات منشورة في هذا التصنيف بعد.<br>تُضاف الملفات هنا بعد اعتمادها للنشر.</p></div>`;
  } else files.forEach((f) => { h += fileCard(f); });
  return h;
}
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
  else if (p[0] === 'diagnostic') html = diag();
  else if (p[0] === 'certificate') html = certificate();
  else if (p[0] === 'v' && p[1]) html = watchSample(p[1]);
  else if (p[0] === 'files' && p[1]) html = filesCat(p[1]);
  else if (p[0] === 'files') html = filesHome();
  else if (p[0] === 'lab' && p[1]) html = LAB.labExp(p[1]);
  else if (p[0] === 'lab') html = LAB.labHome();
  else if (p[0] === 'mistakes') html = mistakes();
  else if (p[0] === 'soon') html = soon();
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
  const sy = trackNav();
  window.scrollTo(0, sy);
  if (sy) setTimeout(() => window.scrollTo(0, sy), 150);
  LAB.afterRender(p);
}
window.addEventListener('hashchange', route);
/* First-paint playback gate: a direct deep link to a bundled video must not
   mount its player before the CMS loader's first fetch resolves - a withdrawn
   (tombstoned) video may never start, even briefly. Non-player routes render
   immediately; the fallback timer matches the loader timeout so offline users
   are never trapped. */
var __initialRouteDone = false;
function __initialRoute() { if (__initialRouteDone) return; __initialRouteDone = true; route(); }
window.__resolveInitialRoute = __initialRoute;
if (/^#\/g\/[^/]+\/l\/\d+\/v\/\d+/.test(location.hash || '')) {
  app.innerHTML = '<div class="note">جارٍ التحميل…</div>';
  setTimeout(__initialRoute, 4000);
} else __initialRoute();
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

/* ===== SecureAdmin public content loader (additive, fail-safe) =====
   Loads published content from the private backend. Policy:
   - Bundled DATA is the fallback and is never wiped by absence/empties/errors.
   - A published CMS item whose payload carries `bundled` (key) REPLACES the
     bundled entity it names. Keys: video:<g>:<li>:<vi> | lesson:<g>:<li> |
     quiz:<id> | challenge:<id>.
   - A tombstone item (status 'tombstone', payload {bundled:key}) REMOVES the
     bundled entity for this session (CMS hidden/archived = suppressed).
   - Deleting the CMS record entirely returns authority to the bundled copy.
   - Merged content appears immediately only when no quiz is active and no
     video player is open; otherwise it shows on the next navigation. */
(function () {
  var REMOTE = 'https://secureadmin.mrsaad70541.workers.dev/api/public/content';
  var TIMEOUT_MS = 3500;
  var YT = /^[A-Za-z0-9_-]{6,15}$/;
  function payloadOf(it) {
    var p = it.payload;
    if (typeof p === 'string') { try { p = JSON.parse(p); } catch (e) { return null; } }
    return (p && typeof p === 'object') ? p : null;
  }
  function gradeOf(g) { return DATA.grades.find(function (x) { return x.id === g; }); }
  function removeBundled(key) {
    var k = String(key || '').split(':');
    if (k[0] === 'video' && k.length === 4) {
      var g = gradeOf(k[1]); if (!g) return false;
      var l = g.lessons[+k[2]]; if (!l || !l.videos[+k[3]] || l.videos[+k[3]]._gone) return false;
      l.videos[+k[3]] = { _gone: true, n: '', yt: '' }; return true; // in-place: links never retarget
    }
    if (k[0] === 'lesson' && k.length === 3) {
      var g2 = gradeOf(k[1]); if (!g2 || !g2.lessons[+k[2]] || g2.lessons[+k[2]]._gone) return false;
      g2.lessons[+k[2]] = { _gone: true, title: '', label: '', videos: [] }; return true;
    }
    if (k[0] === 'quiz' && k.length === 2) {
      if (!QUIZSETS[k[1]]) return false; delete QUIZSETS[k[1]]; return true;
    }
    if (k[0] === 'challenge' && k.length === 2) {
      var ci = CHALLENGES.findIndex(function (c) { return c.id === k[1]; });
      if (ci < 0) return false; CHALLENGES.splice(ci, 1); return true;
    }
    return false;
  }
  function replaceBundled(key, it, p) {
    var k = String(key || '').split(':');
    if (k[0] === 'video' && k.length === 4 && YT.test(p.yt || '') && p.n) {
      var g = gradeOf(k[1]); if (!g) return false;
      var l = g.lessons[+k[2]]; if (!l || !l.videos[+k[3]]) return false;
      l.videos[+k[3]] = { n: String(p.n).slice(0, 200), yt: p.yt }; return true;
    }
    if (k[0] === 'lesson' && k.length === 3 && p.title) {
      var g2 = gradeOf(k[1]); if (!g2 || !g2.lessons[+k[2]]) return false;
      var old = g2.lessons[+k[2]];
      g2.lessons[+k[2]] = { title: String(p.title).slice(0, 120),
        label: String(p.label || old.label || '').slice(0, 120),
        videos: (Array.isArray(p.videos) ? p.videos : old.videos)
          .filter(function (v) { return v && YT.test(v.yt || '') && v.n; })
          .map(function (v) { return { n: String(v.n).slice(0, 200), yt: v.yt }; }) };
      if (p.quiz && QUIZSETS[p.quiz]) g2.lessons[+k[2]].quiz = p.quiz;
      return true;
    }
    return false;
  }
  function mergeItems(rawItems) {
    var applied = 0;
    var items = rawItems.slice().sort(function (a, b) {
      return (a.type === 'quiz' ? -1 : 0) - (b.type === 'quiz' ? -1 : 0);
    });
    items.forEach(function (it) {
      try {
        var p = payloadOf(it);
        if (!p) return;
        if (it.status === 'tombstone' || p.tombstone === true) {
          if (p.bundled && removeBundled(p.bundled)) applied++;
          return;
        }
        if (it.status && it.status !== 'published' && it.status !== 'scheduled') return;
        if (p.bundled && replaceBundled(p.bundled, it, p)) { applied++; return; }
        if (it.type === 'video') {
          var g = gradeOf(p.g);
          if (!g || !YT.test(p.yt || '') || !p.n) return;
          var l = (typeof p.li === 'number') ? g.lessons[p.li]
            : g.lessons.find(function (x) { return x.title === p.lesson; });
          if (!l || l.videos.some(function (v) { return v.yt === p.yt; })) return;
          l.videos.push({ n: String(p.n).slice(0, 200), yt: p.yt });
          SEARCH.push({ t: String(p.n) + ' — ' + l.title + ' · ' + g.title, u: '#/g/' + g.id + '/l/' + g.lessons.indexOf(l) + '/v/' + (l.videos.length - 1) });
          applied++;
        } else if (it.type === 'lesson') {
          var g2 = gradeOf(p.g);
          if (!g2 || !p.title || g2.lessons.some(function (x) { return x.title === p.title; })) return;
          var vids = (Array.isArray(p.videos) ? p.videos : [])
            .filter(function (v) { return v && YT.test(v.yt || '') && v.n; })
            .map(function (v) { return { n: String(v.n).slice(0, 200), yt: v.yt }; });
          var nl = { title: String(p.title).slice(0, 120), label: String(p.label || '').slice(0, 120), videos: vids };
          if (p.quiz && QUIZSETS[p.quiz]) nl.quiz = p.quiz;
          g2.lessons.push(nl);
          SEARCH.push({ t: 'درس ' + nl.title + ' — ' + g2.title, u: '#/g/' + g2.id + '/l/' + (g2.lessons.length - 1) });
          applied++;
        } else if (it.type === 'quiz') {
          if (!p.id || !Array.isArray(p.questions) || !p.questions.length) return;
          QUIZSETS[p.id] = { title: p.title || it.title, skill: p.skill || '', questions: p.questions };
          applied++;
        } else if (it.type === 'challenge') {
          if (!p.id || !p.q || !Array.isArray(p.o) || !p.o.length) return;
          var nc = { id: p.id, date: p.date || '', iso: p.iso || '', title: p.title || it.title,
            q: p.q, o: p.o, a: (typeof p.a === 'number' ? p.a : 0), exT: p.exT || '', exE: p.exE || '',
            level: p.level || '', cat: p.cat || '' };
          var ci = CHALLENGES.findIndex(function (c) { return c.id === p.id; });
          if (ci >= 0) CHALLENGES[ci] = nc; else CHALLENGES.unshift(nc);
          applied++;
        } else if (it.type === 'section') {
          if (p.track === 'qudurat' || p.track === 'leh') {
            var t = DATA[p.track];
            if (!p.title || t.groups.some(function (gr) { return gr.title === p.title; })) return;
            t.groups.push({ title: String(p.title).slice(0, 120), skills: Array.isArray(p.skills) ? p.skills.slice(0, 60).map(String) : [] });
            applied++;
          } else if (p.id && p.title && /^[a-z0-9_-]{1,24}$/.test(p.id) && !gradeOf(p.id)) {
            DATA.grades.push({ id: p.id, title: String(p.title).slice(0, 120), lessons: [] });
            applied++;
          }
        }
      } catch (e) { /* one bad item never breaks the app */ }
    });
    return applied;
  }
  function currentRouteGone() {
    try {
      var m = (location.hash || '').match(/^#\/g\/([^/]+)\/l\/(\d+)(?:\/v\/(\d+))?/);
      if (!m) return false;
      var g = gradeOf(m[1]); if (!g) return false;
      var l = g.lessons[+m[2]]; if (!l) return false;
      if (l._gone) return true;
      if (m[3] != null) { var v = l.videos[+m[3]]; return !!v && !!v._gone; }
      return false;
    } catch (e) { return false; }
  }
  function safeToRerender() {
    try {
      if (typeof qState !== 'undefined' && qState && !qState.done) return false; // quiz in progress
      if (document.querySelector('#app iframe')) return false; // video player open
      var ae = document.activeElement;
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT')) return false; // form/search in use
    } catch (e) { return false; }
    return true;
  }
  var ac = ('AbortController' in window) ? new AbortController() : null;
  var to = setTimeout(function () { if (ac) ac.abort(); }, TIMEOUT_MS);
  fetch(REMOTE, ac ? { signal: ac.signal, cache: 'no-store' } : { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
    .then(function (d) {
      clearTimeout(to);
      if (!d || !Array.isArray(d.items) || !d.items.length) return; // empty never wipes anything
      var applied = mergeItems(d.items);
      var alreadyRouted = __initialRouteDone;
      if (window.__resolveInitialRoute) window.__resolveInitialRoute(); // gated first paint renders merged content
      // A tombstoned deep target must never keep playing: force re-render when the
      // current route's entity was withdrawn, even over the player-iframe guard.
      if (applied > 0 && alreadyRouted && (currentRouteGone() || safeToRerender())) route();
    })
    .catch(function () { clearTimeout(to); if (window.__resolveInitialRoute) window.__resolveInitialRoute(); /* bundled content stands */ });
})();
