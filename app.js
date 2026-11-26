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
function applyTz() { const z = +localStorage.getItem('saad.tz.v1') || 1; document.documentElement.style.setProperty('--tz', z); }
applyTz();
function setTz(z) { localStorage.setItem('saad.tz.v1', z); applyTz(); route(); }
window.setTz = setTz;
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

function toast(msg, undo) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  if (undo) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'toast-undo'; b.textContent = 'تراجع';
    b.onclick = () => { clearTimeout(t._h); t.classList.remove('show'); undo(); };
    t.appendChild(b);
  }
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), undo ? 6000 : 2200);
}

/* ===== storage: saved / last-watched / mistakes ===== */
function jget(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
const getSaved = () => jget('saad.saved.v1', []);
const isSaved = (u) => getSaved().some((x) => x.u === u);
function toggleSave(u, t) {
  let s = getSaved();
  if (s.some((x) => x.u === u)) {
    const old = s.slice(); s = s.filter((x) => x.u !== u);
    toast('اتشالت من محفوظاتك', () => { localStorage.setItem('saad.saved.v1', JSON.stringify(old)); route(); });
  }
  else { s.unshift({ u, t }); toast('اتحفظت في محفوظاتك'); }
  localStorage.setItem('saad.saved.v1', JSON.stringify(s));
  route();
}
window.toggleSave = toggleSave;
const getLast = () => jget('saad.last.v1', null);
const setLast = (u, t) => localStorage.setItem('saad.last.v1', JSON.stringify({ u, t }));
const getMistakes = () => jget('saad.mistakes.v1', []);
function removeMistake(q) { localStorage.setItem('saad.mistakes.v1', JSON.stringify(getMistakes().filter((x) => x.q !== q))); }
function addMistake(m) {
  const ms = getMistakes().filter((x) => x.q !== m.q);
  ms.unshift(m);
  localStorage.setItem('saad.mistakes.v1', JSON.stringify(ms.slice(0, 50)));
}

/* ===== share (real links) ===== */
function seoUrl(u) {
  const m = /^#\/g\/(g\d)\/l\/(\d+)\/v\/(\d+)$/.exec(u);
  if (!m || typeof DATA === 'undefined') return null;
  const g = DATA.grades.find((x) => x.id === m[1]), l = g && g.lessons[+m[2]];
  return l && l.videos[+m[3]] ? location.origin + location.pathname + 's/' + m[1] + '-l' + m[2] + '-v' + m[3] + '.html' : null;
}
function fullUrl(u) { return /^https?:\/\//.test(u) ? u : (seoUrl(u) || location.origin + location.pathname + u); }
window.fullUrl = fullUrl;
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
  if (l.quiz) SEARCH.push({ t: `اختبار درس ${l.title}`, u: '#/test/' + l.quiz });
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
const SKINDS = [['all', 'الكل'], ['video', 'فيديو'], ['lesson', 'درس'], ['quiz', 'اختبار'], ['lab', 'تجربة'], ['file', 'ملفات وكتب'], ['other', 'أخرى']];
function sKind(u) {
  if (/^#\/g\/[^/]+\/l\/\d+\/v\//.test(u) || /^#\/v\//.test(u)) return 'video';
  if (/^#\/g\/[^/]+\/l\//.test(u)) return 'lesson';
  if (/^#\/(test|diagnostic|challenge)/.test(u)) return 'quiz';
  if (/^#\/lab/.test(u)) return 'lab';
  if (/^#\/(files|book)/.test(u)) return 'file';
  return 'other';
}
let SFILTER = 'all';
function saFilter(k) { SFILTER = k; const el = document.getElementById('q'); saSearch(el ? el.value : ''); }
function saSearch(q) {
  const box = document.getElementById('sres');
  const nq = norm(q).trim();
  if (!nq) { box.classList.remove('open'); box.innerHTML = ''; return; }
  const scored = [];
  SEARCH.forEach((s) => {
    const t = norm(s.t), k = norm(s.k || '');
    let sc = -1;
    if (t.startsWith(nq)) sc = 0;
    else if (t.split(/[\s—:·-]+/).some((w) => w.startsWith(nq))) sc = 1;
    else if (t.includes(nq)) sc = 2;
    else if (k.includes(nq)) sc = 3;
    if (sc >= 0) scored.push({ s: s, sc: sc, kind: sKind(s.u) });
  });
  scored.sort((a, b) => a.sc - b.sc || a.s.t.length - b.s.t.length);
  const counts = {};
  scored.forEach((x) => { counts[x.kind] = (counts[x.kind] || 0) + 1; });
  if (SFILTER !== 'all' && !counts[SFILTER]) SFILTER = 'all';
  const hits = scored.filter((x) => SFILTER === 'all' || x.kind === SFILTER).slice(0, 8);
  const chips = scored.length > 1 ? '<div class="schips">' + SKINDS.filter((c) => c[0] === 'all' || counts[c[0]]).map((c) => `<button type="button" class="${SFILTER === c[0] ? 'on' : ''}" onmousedown="event.preventDefault()" onclick="saFilter('${c[0]}')">${c[1]}${c[0] === 'all' ? '' : ' ' + counts[c[0]]}</button>`).join('') + '</div>' : '';
  box.innerHTML = chips + (hits.length
    ? hits.map((h) => `<a href="${h.s.u}">${esc(h.s.t)}</a>`).join('')
    : '<span class="none">لا توجد نتائج مطابقة</span>');
  box.classList.add('open');
}
window.saFilter = saFilter;
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
var HOME_IDS = ['paths', 'challenge', 'tools', 'latest'];
var HOME_NAMES = { paths: 'مسارات التعلم', challenge: 'تحدي اليوم', tools: 'أدوات التعلم', latest: 'أحدث المحتويات' };
var HOMECFG = { order: HOME_IDS.slice(), hide: [], soon: [] };
var NOTICES = [];
function noticesHtml() {
  const gone = jget('saad.notice.gone', []);
  return NOTICES.filter((n) => gone.indexOf(n.id) < 0).map((n) => `<div class="note" role="status" style="border-color:var(--gold)"><b>${n.t}</b><div>${n.x}</div><button type="button" class="btn2 sm ghost" onclick="dismissNotice('${n.id}')">إخفاء</button></div>`).join('');
}
function dismissNotice(id) { const g = jget('saad.notice.gone', []); if (g.indexOf(id) < 0) g.push(id); localStorage.setItem('saad.notice.gone', JSON.stringify(g.slice(-50))); if (typeof route === 'function') route(); }
window.dismissNotice = dismissNotice;
var HOME_ITEMS = { '#/manhag': 'manhag', '#/t/leh': 'leh', '#/t/qudurat': 'qudurat', '#/test': 'test', '#/book': 'book', '#/lab': 'lab', '#/diagnostic': 'diagnostic', '#/files': 'files' };
function homeItems(html) {
  var hi = HOMECFG.hideItems || [], si = HOMECFG.soonItems || [];
  if (!hi.length && !si.length) return html;
  return html.split('\n').map(function (ln) {
    var m = ln.match(/<a [^>]*href="(#\/[^"]+)"/);
    var id = m && HOME_ITEMS[m[1]];
    if (!id) return ln;
    if (hi.indexOf(id) >= 0) return '';
    if (si.indexOf(id) >= 0) {
      return ln.replace(/<a ([^>]*?)href="#\/[^"]+"/, '<a aria-disabled="true" style="opacity:.75;cursor:default" $1')
        .replace(/<span class="st[^"]*">[^<]*<\/span>/, '<span class="st">قريبًا</span>');
    }
    return ln;
  }).join('\n');
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
  const B = {};
  B.paths = `
  <div class="section-title">مسارات التعلم</div>
  <div class="trio">
    <a class="p1" href="#/manhag"><span class="ic">${IC.cap}</span><h3>المنهج المصري</h3><span class="st on">متاح الآن</span></a>
    <a class="p2" href="#/t/leh"><span class="ic">${IC.bulb}</span><h3>ليه؟</h3><span class="st on2">نموذج متاح</span></a>
    <a class="p3" href="#/t/qudurat"><span class="ic">${IC.sigma}</span><h3>القدرات الكمي</h3><span class="st">قريبًا</span></a>
  </div>
`;
  B.challenge = `
  <a class="chcard" href="#/challenge">
    <span class="ic">${IC.target}</span>
    <span class="txt"><span class="lbl">${chLabel(ch)} · ${esc(ch.date)}</span><span class="t">${esc(ch.title)}</span></span>
    <span class="go">ابدأ التحدي</span>
  </a>
`;
  B.tools = `
  <div class="section-title">أدوات التعلم</div>
  <div class="tools"><div class="grid">
    <a class="tile" href="#/test"><span class="ic">${IC.quiz}</span><span class="name">الاختبارات والتدريبات</span><span class="st on">نموذج متاح</span></a>
    <a class="tile" href="#/book"><span class="ic">${IC.book}</span><span class="name">الكتاب التفاعلي</span><span class="st on">نموذج متاح</span></a>
    <a class="tile" href="#/lab"><span class="ic">${IC.flask}</span><span class="name">مختبر الرياضيات</span><span class="st on2">متاح الآن</span></a>
    <a class="tile" href="#/diagnostic"><span class="ic">${IC.target || IC.quiz}</span><span class="name">اكتشف مستواك</span><span class="st on2">متاح الآن</span></a>
    <a class="tile" href="#/files"><span class="ic">${IC.folder}</span><span class="name">مكتبة الملفات</span><span class="st">${LIB_FILES.length ? toArNum(LIB_FILES.length) + ' ملف' : 'بانتظار المحتوى'}</span></a>
  </div></div>
`;
  let lh = `
  <div class="section-title">أحدث المحتويات</div>`;
  const latest = [];
  DATA.grades.forEach((g) => g.lessons.forEach((l, li) => l.videos.forEach((v, vi) => {
    if (v._gone) return;
    if (v.yt) latest.push({ t: v.n, s: `${l.title} · ${g.title}`, u: `#/g/${g.id}/l/${li}/v/${vi}` });
  })));
  latest.slice(-3).reverse().forEach((x) => {
    lh += `<div class="vrow">${saveBtn(x.u, x.t)}<span class="vn">${esc(x.t)}<span class="vsub">${esc(x.s)}</span></span><a class="play" href="${x.u}">${IC.play} تشغيل</a></div>`;
  });
  B.latest = lh;
  const cfg = (typeof HOMECFG !== 'undefined') ? HOMECFG : { order: ['paths','challenge','tools','latest'], hide: [], soon: [] };
  cfg.order.forEach((id) => {
    if (!B[id] || cfg.hide.indexOf(id) >= 0) return;
    h += (cfg.soon.indexOf(id) >= 0) ? `<div class="section-title">${HOME_NAMES[id]}</div><div class="note">قريبًا</div>` : ((id === 'paths' || id === 'tools') ? homeItems(B[id]) : B[id]);
  });
  return noticesHtml() + h;
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
  if (l.term || l.unit) h += `<div class="lmeta"><p>${esc([l.term, l.unit].filter(Boolean).join(' · '))}</p></div>`;
  if (l.skills && l.skills.length) h += `<div class="lmeta"><h3>المهارات المرتبطة</h3><div class="skillchips">${l.skills.map((x) => `<span class="skillchip">${esc(x)}</span>`).join('')}</div></div>`;
  if (l.cmeta) {
    h += '<div class="lmeta">';
    if (l.cmeta.d) h += `<p>${esc(l.cmeta.d)}</p>`;
    const chips = (l.cmeta.level ? [l.cmeta.level] : []).concat(l.cmeta.tags || []);
    if (chips.length) h += `<div class="skillchips">${chips.map((c) => `<span class="skillchip">${esc(c)}</span>`).join('')}</div>`;
    h += '</div>';
  }
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
  if (l.quiz) h += `<a class="card quizlink" href="#/test/${l.quiz}"><span class="chip">${IC.quiz}</span><span class="txt"><h2>اختبار الدرس</h2><div class="sub">${QUIZSETS[l.quiz].questions.length} أسئلة مع تصحيح فوري وتفسير</div></span><span class="arrow">‹</span></a>`;
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
/* ===== video player extras: resume, speed, next (YouTube IFrame API, plain iframe stays as fallback) ===== */
const VPOS = 'saad.vpos.v1';
const VP = { pl: null, iv: 0, key: '' };
function vpGet() { try { return JSON.parse(localStorage.getItem(VPOS) || '{}'); } catch (e) { return {}; } }
function vpSet(o) { try { localStorage.setItem(VPOS, JSON.stringify(o)); } catch (e) { /* storage off */ } }
function vpStart(yt) { const p = vpGet()[yt]; return p && p.t >= 5 ? '&start=' + Math.floor(p.t) : ''; }
function vpFmt(t) { t = Math.floor(t); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); }
function vpStop() { if (VP.iv) clearInterval(VP.iv); VP.iv = 0; VP.pl = null; }
function vpInit(yt, nu, nname, tries) {
  vpStop();
  const fr = document.getElementById('ytframe'), tools = document.getElementById('vtools');
  if (!fr || !tools) { if ((tries || 0) < 25) setTimeout(() => vpInit(yt, nu, nname, (tries || 0) + 1), 120); return; }
  if (fr.src.indexOf(yt) < 0) return; // stale retry from a previous route
  let saved = vpGet()[yt];
  const load = (cb) => {
    if (window.YT && window.YT.Player) return cb();
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); cb(); };
    if (!document.getElementById('ytapi')) { const sc = document.createElement('script'); sc.id = 'ytapi'; sc.src = 'https://www.youtube.com/iframe_api'; sc.async = true; document.head.appendChild(sc); }
  };
  load(() => {
    if (document.getElementById('ytframe') !== fr) return; // route changed meanwhile
    try {
      VP.pl = new window.YT.Player(fr, { events: {
        onReady: () => {
          const rates = [0.75, 1, 1.25, 1.5, 2];
          let dur = 0; try { dur = VP.pl.getDuration() || 0; } catch (e) { dur = 0; }
          if (saved && (!(dur > 0) || saved.t > dur - 10)) {
            // stored position does not fit this video: drop it, no resume offer, start from 0
            const o = vpGet(); delete o[yt]; vpSet(o);
            if (dur > 0) { try { VP.pl.cueVideoById({ videoId: yt, startSeconds: 0 }); } catch (e) { /* ignore */ } }
            saved = null;
          }
          tools.hidden = false;
          tools.innerHTML = (saved && saved.t >= 5 ? '<div class="vresume">تكمل من ' + vpFmt(saved.t) + ' · <button type="button" id="vrestart">من البداية</button></div>' : '') +
            '<div class="vspeed"><span>السرعة</span>' + rates.map((r) => '<button type="button" data-r="' + r + '" class="' + (r === 1 ? 'on' : '') + '">' + String(r).replace('.', '٫') + '×</button>').join('') + '</div>';
          tools.onclick = (e) => {
            const b = e.target.closest('button'); if (!b || !VP.pl) return;
            if (b.id === 'vrestart') { VP.pl.seekTo(0, true); return; }
            if (b.dataset.r) { VP.pl.setPlaybackRate(+b.dataset.r); tools.querySelectorAll('.vspeed button').forEach((x) => x.classList.toggle('on', x === b)); }
          };
        },
        onStateChange: (ev) => {
          const st = ev.data;
          if (st === 0) {
            const o = vpGet(); delete o[yt]; vpSet(o);
            const rz = document.querySelector('.vresume'); if (rz) rz.remove();
            const nx = document.getElementById('vnext');
            if (nx && nu) { nx.hidden = false; nx.innerHTML = '<a class="nextbtn" href="' + nu + '">التالي: ' + esc(nname || 'المهارة التالية') + ' ‹</a>'; }
          }
        },
      } });
      VP.iv = setInterval(() => {
        if (document.getElementById('ytframe') !== fr) { vpStop(); return; }
        try {
          if (VP.pl && VP.pl.getPlayerState && VP.pl.getPlayerState() === 1) {
            const t = VP.pl.getCurrentTime(), d = VP.pl.getDuration();
            const o = vpGet();
            if (d && t > d - 10) delete o[yt]; else if (t >= 5) o[yt] = { t: Math.floor(t), at: Date.now() };
            vpSet(o);
          }
        } catch (e) { /* player not ready */ }
      }, 4000);
    } catch (e) { /* API blocked: plain iframe keeps working */ }
  });
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
  setTimeout(() => vpInit(v.yt, nu, next && next.n), 0);
  return `<a class="back" href="#/g/${g.id}/l/${li}">‹ ${esc(l.title)}</a>
  <div class="section-title">${esc(v.n)}</div>
  <div class="playerwrap"><iframe id="ytframe" src="https://www.youtube-nocookie.com/embed/${v.yt}?enablejsapi=1&origin=${encodeURIComponent(location.origin)}${vpStart(v.yt)}" title="${esc(v.n)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
  <div class="actionrow">
    ${saveBtn(u, v.n)}
    ${shareBtn(v.n, u)}
    ${nu ? `<a class="nextbtn" href="${nu}">المهارة التالية ‹</a>` : ''}
  </div>
  <div id="vtools" class="vtools" hidden></div><div id="vnext" class="vnextcard" hidden></div>`;
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
const QPROG = 'saad.quizprog.v1';
const QTEXT = ['num', 'frac', 'fill'];
function qProg() { try { return JSON.parse(localStorage.getItem(QPROG) || 'null'); } catch (e) { return null; } }
function qSave() {
  try {
    if (!qState || qState.done || qState.id === '_mistakes') { localStorage.removeItem(QPROG); return; }
    localStorage.setItem(QPROG, JSON.stringify({ id: qState.id, i: qState.i, score: qState.score, shuffle: qState.shuffle, practice: qState.practice, timer: qState.timer, orders: qState.orders }));
  } catch (e) { /* storage unavailable: quiz still works */ }
}
function mruns(html) {
  let inMath = 0;
  return String(html).split(/(<[^>]+>)/).map((part) => {
    if (part.charAt(0) === '<') {
      if (/^<math[\s>]/i.test(part)) inMath++;
      else if (/^<\/math>/i.test(part)) inMath = Math.max(0, inMath - 1);
      return part;
    }
    if (inMath) return part;
    return part.replace(/\(*[0-9٠-٩][0-9٠-٩\s+\-−×÷=\/().٫,%^²³]*[0-9٠-٩)%]|\(*[0-9٠-٩]/g, (m) => '<span class="mrun" dir="ltr">' + m.trim() + '</span>');
  }).join('');
}
function qVisual(cur) {
  let vis = '';
  if (cur.img && /^https:\/\//.test(cur.img)) vis += `<img class="qimg" src="${esc(cur.img)}" alt="${esc(cur.alt || '')}" loading="lazy">`;
  if (cur.geo) vis += geoSvg(cur.geo);
  return vis;
}
function qTimerStop() { if (qState && qState.tid) { clearInterval(qState.tid); qState.tid = 0; } }
function qPendingReroute() {
  const m = (location.hash.match(/^#\/test\/([^/?]+)/) || [])[1];
  if (m && m !== '_mistakes' && (!qState || (QUIZSETS[m] && qState.id !== m && qState.i === 0 && !qState.locked && !(qState.score > 0)))) route();
}
function test(id) {
  qTimerStop();
  if (id && id !== '_mistakes' && !QUIZSETS[id]) {
    qState = null;
    const back = '<a class="back" href="#/">‹ الرئيسية</a>';
    if (window.__qRemote === 'ok') return back + '<div class="section-title">الاختبار غير متاح</div><div class="note">هذا الاختبار غير موجود أو تم إيقافه. يمكنك العودة للرئيسية واختيار اختبار آخر.</div><a class="btn2" href="#/test">اختبار الدرس الأساسي</a>';
    if (window.__qRemote === 'fail') return back + '<div class="section-title">تعذّر تحميل الاختبار</div><div class="note">تأكد من اتصالك بالإنترنت ثم حاول مرة أخرى.</div><a class="btn2" href="javascript:location.reload()">إعادة المحاولة</a>';
    return back + '<div class="section-title">جارٍ تحميل الاختبار…</div><div class="note">لحظات ونعرض الاختبار.</div>';
  }
  let pseudo = null;
  if (id === '_mistakes') {
    const qs = [];
    getMistakes().forEach((m) => {
      const st = m.setId && QUIZSETS[m.setId], qq = st && st.questions[m.qi];
      if (qq) qs.push(Object.assign({}, qq, { _sid: m.setId, _qi: m.qi, _mk: m.q }));
    });
    pseudo = { title: 'مراجعة أخطائي', skill: '', questions: qs };
    if (!qs.length) return `<a class="back" href="#/mistakes">‹ أخطائي</a><div class="section-title">مراجعة أخطائي</div><div class="note">لا توجد أخطاء قابلة للإعادة الآن.</div>`;
  }
  id = pseudo ? '_mistakes' : ((id && QUIZSETS[id]) ? id : 'g3l1');
  const pr = pseudo ? null : qProg();
  const n = (pseudo || QUIZSETS[id]).questions.length;
  qState = { id: id, set: pseudo || QUIZSETS[id], i: 0, score: 0, wrong: 0, locked: false, shuffle: false, practice: false, timer: 0, orders: [], tid: 0,
    resume: (pr && pr.id === id && pr.i > 0 && pr.i < n) ? pr : null };
  return quizHtml();
}
function qOrder(i) {
  const cur = qState.set.questions[i];
  if (!qState.orders[i]) {
    const idx = cur.o.map((x, k) => k);
    if (qState.shuffle && cur.t !== 'tf') for (let k = idx.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); const t = idx[k]; idx[k] = idx[j]; idx[j] = t; }
    qState.orders[i] = idx;
  }
  return qState.orders[i];
}
function qDigits(s) {
  return String(s || '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٫،]/g, '.').replace(/[−–]/g, '-').replace(/[÷⁄∕]/g, '/').replace(/\s+/g, '');
}
function qGcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a; }
function qCheckText(cur, raw) {
  const v = qDigits(raw);
  if (!v) return false;
  if (cur.t === 'num') {
    const x = parseFloat(v), a = parseFloat(qDigits(cur.ans));
    return isFinite(x) && /^-?\d*\.?\d+$/.test(v) && isFinite(a) && Math.abs(x - a) <= (Number(cur.tol) || 0) + 1e-9;
  }
  if (cur.t === 'frac') {
    const m = v.match(/^(-?\d+)\/(-?\d+)$/), k = qDigits(cur.ans).match(/^(-?\d+)\/(-?\d+)$/);
    if (!m || !k) return false;
    const a = +m[1], b = +m[2], c = +k[1], d = +k[2];
    if (!b || !d || a * d !== c * b) return false;
    return cur.reduced ? qGcd(a, b) === 1 : true;
  }
  const n = norm(String(raw).trim().replace(/\s+/g, ' '));
  return [cur.ans].concat(cur.alts || []).some((x) => norm(String(x).trim().replace(/\s+/g, ' ')) === n);
}
function geoSvg(g) {
  if (!g || typeof g !== 'object') return '';
  const f = (x) => (isFinite(Number(x)) ? Number(x) : 0);
  const T = (x, y, s) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="11" fill="currentColor">${esc(String(s))}</text>`;
  let b = '';
  if (g.shape === 'rect') {
    const w = Math.max(f(g.w), 1), hh = Math.max(f(g.h), 1), k = Math.min(140 / w, 80 / hh), W = w * k, H = hh * k, x0 = (200 - W) / 2, y0 = (120 - H) / 2;
    b = `<rect x="${x0}" y="${y0}" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="2"/>${T(100, y0 + H + 14, g.w)}${T(x0 - 12, y0 + H / 2 + 4, g.h)}`;
  } else if (g.shape === 'tri') {
    const a = Math.max(f(g.a), 1), c = Math.max(f(g.b), 1), k = Math.min(140 / a, 90 / c), A = a * k, C = c * k, x0 = (200 - A) / 2, y0 = 110;
    b = `<polygon points="${x0},${y0} ${x0 + A},${y0} ${x0},${y0 - C}" fill="none" stroke="currentColor" stroke-width="2"/><path d="M${x0} ${y0 - 10}h10v10" fill="none" stroke="currentColor"/>${T(100, y0 + 14, g.a)}${T(x0 - 12, y0 - C / 2, g.b)}${g.c ? T(x0 + A / 2 + 14, y0 - C / 2 - 4, g.c) : ''}`;
  } else if (g.shape === 'circle') {
    b = `<circle cx="100" cy="60" r="45" fill="none" stroke="currentColor" stroke-width="2"/><line x1="100" y1="60" x2="145" y2="60" stroke="currentColor" stroke-width="2"/><circle cx="100" cy="60" r="2" fill="currentColor"/>${T(124, 54, g.r)}`;
  } else if (g.shape === 'angle') {
    const d = Math.min(Math.max(f(g.deg), 1), 179), r = d * Math.PI / 180, L = 80;
    b = `<line x1="40" y1="100" x2="${40 + L * 1.6}" y2="100" stroke="currentColor" stroke-width="2"/><line x1="40" y1="100" x2="${40 + L * Math.cos(r)}" y2="${100 - L * Math.sin(r)}" stroke="currentColor" stroke-width="2"/><path d="M${40 + 28} 100 A28 28 0 0 0 ${40 + 28 * Math.cos(r)} ${100 - 28 * Math.sin(r)}" fill="none" stroke="currentColor"/>${T(40 + 46, 92, g.deg + '°')}`;
  } else return '';
  return `<svg class="qgeo" viewBox="0 0 200 130" role="img" aria-label="شكل هندسي">${b}</svg>`;
}
function qOptsBar() {
  if (qState.i !== 0 || qState.locked) return '';
  const on = (v) => (v ? ' on' : '');
  return `<div class="qopts">
    <button class="chipbtn${on(qState.shuffle)}" onclick="qOpt('shuffle')">ترتيب عشوائي</button>
    <button class="chipbtn${on(qState.timer)}" onclick="qOpt('timer')">مؤقت ٣٠ ثانية</button>
    <button class="chipbtn${on(qState.practice)}" onclick="qOpt('practice')">وضع التدريب</button>
  </div>${qState.resume ? `<div class="note">لديك تقدم محفوظ في سؤال ${qState.resume.i + 1} <button class="btn2 sm" onclick="qResume()">استكمال</button> <button class="btn2 sm ghost" onclick="qFresh()">بدء من جديد</button></div>` : ''}`;
}
function quizHtml() {
  const set = qState.set;
  qTimerStop();
  if (qState.i >= set.questions.length) {
    if (!qState.done) { qState.done = true; qSave(); if (qState.id !== '_mistakes') onQuizDone(); }
    const others = Object.keys(QUIZSETS).filter((k) => k !== qState.id && QUIZSETS[k].questions.length);
    const totalM = getMistakes().length;
    return `<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">${esc(set.title)}</div>
    <div class="quiz"><div class="qcard result">
      <div class="qhead">نتيجتك</div>
      <div class="score">${qState.score} <span class="of">من</span> ${set.questions.length}</div>
      <div class="cap">${qState.score === set.questions.length ? 'ممتاز! جاهز للدرس اللي بعده' : 'راجع الدرس وحاول تاني — الأسئلة اللي غلطت فيها اتحفظت في «أخطائي»'}</div>
      <div class="cap sub">أخطاء هذه المحاولة: ${qState.wrong} · المحفوظ في «أخطائي» من كل المحاولات: ${totalM}</div>
      <button class="btn2" onclick="restartQuiz()">إعادة الاختبار</button>
      <a class="btn2 ghost" href="#/g/g3/l/0">مراجعة الدرس</a>
      ${totalM ? `<a class="btn2 ghost" href="#/mistakes">كل أخطائي المحفوظة (${totalM})</a>` : ''}
      ${others.length ? `<div class="qmore"><h3>اختبارات أخرى</h3>${others.map((k) => `<a class="btn2 sm ghost" href="#/test/${esc(k)}">${esc(QUIZSETS[k].title)}</a>`).join(' ')}</div>` : ''}
    </div></div>`;
  }
  const cur = set.questions[qState.i];
  const t = cur.t || 'mcq';
  const vis = qVisual(cur);
  let inp;
  if (QTEXT.indexOf(t) >= 0) {
    inp = `<div class="qin"><input id="qin" type="text" dir="ltr" inputmode="${t === 'fill' ? 'text' : 'decimal'}" autocomplete="off" placeholder="${t === 'frac' ? 'مثال: ٣/٤' : t === 'num' ? 'اكتب الرقم' : 'اكتب الإجابة'}" onkeydown="if(event.key==='Enter')answerText()"><button class="btn2" onclick="answerText()">تحقق</button></div>`;
  } else {
    const ord = qOrder(qState.i);
    inp = `<div class="opts">${ord.map((oi, pos) => `<button onclick="answer(${pos})">${mruns(cur.o[oi])}</button>`).join('')}</div>`;
  }
  const timer = qState.timer ? `<div class="qtimer" id="qtimer" aria-live="off">⏱ ${qState.timer}</div>` : '';
  const html = `<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">${esc(set.title)}</div>
  <div class="quiz">${qOptsBar()}<div class="qcard">
    <div class="qhead">سؤال ${qState.i + 1} من ${set.questions.length}${timer}</div>
    <div class="qtext eqwrap">${mruns(cur.q)}</div>${vis}
    ${inp}
    <div id="qfb"></div>
  </div></div>`;
  if (qState.timer) setTimeout(qTimerStart, 0);
  return html;
}
function qTimerStart() {
  qTimerStop();
  if (!qState || !qState.timer || qState.done) return;
  qState.left = qState.timer;
  qState.tid = setInterval(() => {
    if (!qState || qState.locked) return qTimerStop();
    if (!location.hash.startsWith('#/test')) return qTimerStop();
    qState.left--;
    const el = document.getElementById('qtimer'); if (el) el.textContent = '⏱ ' + Math.max(qState.left, 0);
    if (qState.left <= 0) { qTimerStop(); qFinish(false, '', true); }
  }, 1000);
}
function qRight(cur) {
  if (QTEXT.indexOf(cur.t) >= 0) return String(cur.ans);
  return cur.o[cur.a];
}
function qFinish(ok, yourText, timeout) {
  if (qState.locked) return;
  qState.locked = true; qTimerStop();
  const set = qState.set, cur = set.questions[qState.i];
  if (ok) qState.score++;
  else {
    const isT = QTEXT.indexOf(cur.t) >= 0;
    addMistake({ q: cur.q + qVisual(cur), your: timeout ? 'انتهى الوقت' : (isT ? esc(yourText) : yourText), right: isT ? esc(qRight(cur)) : qRight(cur), exT: cur.exT, exE: cur.exE, skill: set.skill, from: '#/test/' + (qState.id === '_mistakes' ? '_mistakes' : qState.id), setId: cur._sid || qState.id, qi: cur._qi != null ? cur._qi : qState.i });
    qState.wrong++;
  }
  if (ok && qState.id === '_mistakes' && cur._mk) removeMistake(cur._mk);
  const fb = document.getElementById('qfb');
  if (fb) {
    let m = ok ? '<b>إجابة صحيحة</b>' : (timeout ? '<b>انتهى الوقت</b>' : '<b>إجابة غير صحيحة</b>');
    if (!ok) m += ' الإجابة الصحيحة: <span class="eqwrap">' + (QTEXT.indexOf(cur.t) >= 0 ? '<span class="mrun" dir="ltr">' + esc(qRight(cur)) + '</span>' : mruns(qRight(cur))) + '</span>';
    if (qState.practice) m += (cur.exT ? '<div>' + esc(cur.exT) + '</div>' : '') + (cur.exE ? '<div class="eqwrap">' + cur.exE + '</div>' : '');
    fb.innerHTML = '<div class="qfb ' + (ok ? 'ok' : 'no') + '">' + m + '</div>' + (qState.practice ? '<button class="btn2" id="qnext" onclick="qNext()">التالي</button>' : '');
  }
  if (!qState.practice) setTimeout(qNext, 1100);
}
function qNext() {
  if (!qState || !qState.locked) return;
  if (!location.hash.startsWith('#/test')) return;
  qState.i++; qState.locked = false; qState.resume = null; qSave();
  app.innerHTML = quizHtml(); window.scrollTo(0, 0);
}
function answer(pos) {
  if (qState.locked) return;
  const set = qState.set, cur = set.questions[qState.i], ord = qOrder(qState.i), oi = ord[pos];
  const btns = document.querySelectorAll('.quiz .opts button');
  btns.forEach((b, bi) => {
    b.disabled = true;
    if (ord[bi] === cur.a) b.classList.add('ok');
    else if (bi === pos) b.classList.add('no');
  });
  qFinish(oi === cur.a, cur.o[oi], false);
}
function answerText() {
  if (qState.locked) return;
  const el = document.getElementById('qin'); if (!el || !String(el.value).trim()) return;
  const cur = qState.set.questions[qState.i];
  el.disabled = true;
  qFinish(qCheckText(cur, el.value), el.value, false);
}
function qOpt(k) {
  if (!qState || qState.i !== 0 || qState.locked) return;
  if (k === 'timer') qState.timer = qState.timer ? 0 : 30; else qState[k] = !qState[k];
  if (k === 'shuffle') qState.orders = [];
  app.innerHTML = quizHtml();
}
function qResume() {
  const pr = qState.resume; if (!pr) return;
  qState.i = pr.i; qState.score = pr.score; qState.shuffle = !!pr.shuffle; qState.practice = !!pr.practice; qState.timer = pr.timer || 0; qState.orders = Array.isArray(pr.orders) ? pr.orders : []; qState.resume = null;
  app.innerHTML = quizHtml();
}
function qFresh() { try { localStorage.removeItem(QPROG); } catch (e) {} qState.resume = null; app.innerHTML = quizHtml(); }
function restartQuiz() { const id = qState && qState.id; try { localStorage.removeItem(QPROG); } catch (e) {} app.innerHTML = test(id); window.scrollTo(0, 0); }
window.answer = answer; window.answerText = answerText; window.qOpt = qOpt; window.qResume = qResume; window.qFresh = qFresh; window.qNext = qNext; window.restartQuiz = restartQuiz;


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
  return h + '<div class="quiz">' + chArchive() + '</div>';
}
function chHist() { return jget('saad.chhist.v1', []); }
function chSaveResult(c, ok) {
  const h = chHist().filter((x) => x.iso !== c.iso);
  h.unshift({ iso: c.iso, d: c.date, ok: !!ok });
  localStorage.setItem('saad.chhist.v1', JSON.stringify(h.slice(0, 60)));
}
function chArchive() {
  const h = chHist();
  const rows = h.length ? h.map((x) => '<div class="chrow"><span>' + esc(x.d || x.iso) + '</span><b class="' + (x.ok ? 'ok' : 'no') + '">' + (x.ok ? 'صحيحة ✓' : 'غير صحيحة ✗') + '</b></div>').join('') : '<div class="dim" style="font-size:13px">لسه ما حليتش أي تحدي — نتيجتك هتتسجل هنا على جهازك.</div>';
  const older = CHALLENGES.length > 1 ? '' : '<div class="dim" style="font-size:12px;margin-top:8px">التحديات السابقة هتظهر هنا لما يتنشر تحدي جديد.</div>';
  return '<div class="qcard chhist"><div class="qhead">أرشيف تحدياتك ونتائجك</div>' + rows + older + '</div>';
}
function chAnswer(oi) {
  if (window._chDone) return;
  window._chDone = true;
  const c = CHALLENGES[0];
  chSaveResult(c, oi === c.a);
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
  if (ms.some((m) => m.setId && QUIZSETS[m.setId] && QUIZSETS[m.setId].questions[m.qi])) h += `<a class="btn2" href="#/test/_mistakes">تدرّب على أخطائي</a>`;
  ms.forEach((m, i) => {
    h += `<div class="qcard mcard">
      <div class="qhead">${esc(m.skill)}</div>
      <div class="qtext" style="font-size:15px">${mruns(m.q)}</div>
      <div class="mline bad">إجابتك: ${mruns(m.your)}</div>
      <div class="mline good">الصح: ${mruns(m.right)}</div>
      <div class="mex">${m.exE ? `<span class="ot">${esc(m.exT || '')}</span><span class="eqline">${m.exE}</span>` : (m.exH || esc(m.ex || ''))}</div>
      <a class="btn2 ghost" href="${m.from}">إعادة المحاولة</a>
    </div>`;
  });
  return h;
}

/* ===== interactive book sample ===== */
let bp = 0;
function bkGet(k, d) { return jget('saad.book.' + k, d); }
function bkZ() { return Math.min(1.6, Math.max(0.8, +bkGet('zoom', 1) || 1)); }
function bookZ(d) { bkSet('zoom', Math.round((bkZ() + d) * 10) / 10); const y = window.scrollY; app.innerHTML = bookHtml(); window.scrollTo(0, y); }
window.bookZ = bookZ;
function bkSet(k, v) { localStorage.setItem('saad.book.' + k, JSON.stringify(v)); }
function book() {
  const m = /^#\/book\/(\d+)/.exec(location.hash);
  const n = m ? +m[1] : (+bkGet('last', 1) || 1);
  bp = Math.min(BOOK.length - 1, Math.max(0, n - 1));
  bkSet('last', bp + 1); bkSet('maxp', Math.max(+bkGet('maxp', 0) || 0, bp + 1));
  return bookHtml();
}
function bookHtml() {
  const pg = BOOK[bp];
  const bms = bkGet('bm', []), isbm = bms.indexOf(bp + 1) >= 0;
  const note = (bkGet('notes', {}))[bp + 1] || '';
  return `<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">الكتاب التفاعلي — نموذج</div>
  <div class="bkzoom"><span>تكبير الصفحة</span><button type="button" onclick="bookZ(-0.1)" aria-label="تصغير">−</button><b>${Math.round(bkZ() * 100)}٪</b><button type="button" onclick="bookZ(0.1)" aria-label="تكبير">+</button><span class="bkprog">تقدّم القراءة: ${Math.max(bkGet('maxp', 0), bp + 1)} من ${BOOK.length} صفحات</span></div>
  <div class="bookpg" style="zoom:${bkZ()}">
    <div class="ptag">${pg.cid ? '' : 'وحدة قوى القوى · الصف الثالث الإعدادي · '}صفحة ${bp + 1} من ${BOOK.length}</div>
    <h3>${pg.t}</h3>
    <p>${pg.p}</p>
    ${pg.cid && !pg.ft ? '' : `<div class="f eqwrap">${pg.f}</div>`}
    ${pg.cid && !pg.ex ? '' : `<div class="ex"><span class="exlabel">مثال</span><span class="eqline">${pg.ex}</span></div>`}
  </div>
  <div class="booknav">
    <button onclick="bookGo(-1)" ${bp === 0 ? 'disabled' : ''}>‹ السابق</button>
    <button onclick="bookGo(1)" ${bp === BOOK.length - 1 ? 'disabled' : ''}>التالي ›</button>
  </div>
  <div class="dots">${BOOK.map((_, i) => `<i class="${i === bp ? 'on' : ''}"></i>`).join('')}</div>
  <div class="bktools">
    <label>اذهب إلى صفحة <select id="bkgo" onchange="bookTo(+this.value)">${BOOK.map((_, i) => `<option value="${i + 1}"${i === bp ? ' selected' : ''}>${i + 1}</option>`).join('')}</select></label>
    <button type="button" class="btn2 sm ${isbm ? '' : 'ghost'}" onclick="bookBm()">${isbm ? 'إزالة الإشارة المرجعية' : 'إشارة مرجعية للصفحة'}</button>
    <button type="button" class="btn2 sm ghost" onclick="shareLink('الكتاب التفاعلي — صفحة ${bp + 1}', '#/book/${bp + 1}', 'صفحة ${bp + 1} من الكتاب التفاعلي')">مشاركة الصفحة</button>
  </div>
  <div class="qcard bkidx"><div class="qhead">فهرس الكتاب والبحث فيه</div>
    <input id="bksearch" type="search" placeholder="ابحث في صفحات الكتاب…" oninput="bookSearch(this.value)" aria-label="بحث في الكتاب">
    <div id="bkres">${bookIndexHtml('')}</div></div>
  ${pg.cid ? '' : '<div class="bktools"><a class="btn2 sm ghost" href="#/g/g3/l/0">فيديوهات الدرس</a><a class="btn2 sm ghost" href="#/test/g3l1">اختبار الدرس</a></div>'}
  <div class="qcard bknote"><div class="qhead">ملاحظتي على هذه الصفحة (محفوظة على جهازك فقط)</div>
    <textarea id="bknote" rows="3" placeholder="اكتب ملاحظتك…" oninput="bookNote(this.value)">${esc(note)}</textarea></div>
  ${bms.length ? '<div class="note">صفحاتك المُشار إليها: ' + bms.slice().sort((x, y) => x - y).map((x) => '<a href="#/book/' + x + '">' + x + '</a>').join(' · ') + '</div>' : ''}
  <div class="note">نموذج تجريبي من ٤ صفحات — الكتاب الكامل قريبًا</div>`;
}
function bkPlain(h) { const d = document.createElement('div'); d.innerHTML = String(h || ''); return (d.textContent || '').replace(/\s+/g, ' '); }
function bookIndexHtml(q) {
  const k = (q || '').trim();
  const r = BOOK.map((p, i) => ({ i, p })).filter((x) => !k || (x.p.t + ' ' + bkPlain(x.p.p)).indexOf(k) >= 0);
  return r.length ? r.map((x) => '<a class="bkrow' + (x.i === bp ? ' on' : '') + '" href="#/book/' + (x.i + 1) + '"><b>' + (x.i + 1) + '</b> ' + esc(x.p.t) + '</a>').join('') : '<div class="dim" style="font-size:13px">لا توجد صفحة تطابق بحثك.</div>';
}
function bookSearch(v) { const e = document.getElementById('bkres'); if (e) e.innerHTML = bookIndexHtml(v); }
window.bookSearch = bookSearch;
function bookTo(n) {
  bp = Math.min(BOOK.length - 1, Math.max(0, n - 1));
  bkSet('last', bp + 1); bkSet('maxp', Math.max(+bkGet('maxp', 0) || 0, bp + 1));
  history.replaceState(null, '', '#/book/' + (bp + 1));
  app.innerHTML = bookHtml();
  window.scrollTo(0, 0);
}
window.bookTo = bookTo;
function bookGo(d) { bookTo(bp + 1 + d); }
function bookBm() {
  const b = bkGet('bm', []), i = b.indexOf(bp + 1);
  if (i >= 0) b.splice(i, 1); else b.push(bp + 1);
  bkSet('bm', b);
  const y = window.scrollY; app.innerHTML = bookHtml(); window.scrollTo(0, y);
  toast(i >= 0 ? 'أُزيلت الإشارة المرجعية' : 'تمت الإشارة المرجعية للصفحة');
}
window.bookBm = bookBm;
function bookNote(v) { const n = bkGet('notes', {}); if (v.trim()) n[bp + 1] = v; else delete n[bp + 1]; bkSet('notes', n); }
window.bookNote = bookNote;
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
  <div class="qcard">
    <div class="qhead">حجم النص</div>
    <div class="themerow">
      ${[[1, 'عادي'], [1.15, 'كبير'], [1.3, 'أكبر']].map((z) => `<button class="tbtn ${(+localStorage.getItem('saad.tz.v1') || 1) === z[0] ? 'on' : ''}" onclick="setTz(${z[0]})">${z[1]}</button>`).join('')}
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
  const files = LIB_FILES.filter((f) => f.cat === id).sort((x, y) => (x.book ? 1 : 0) - (y.book ? 1 : 0) || (x.book || '').localeCompare(y.book || '', 'ar') || (x.order || 0) - (y.order || 0));
  let h = `<a class="back" href="#/files">‹ مكتبة الملفات</a><div class="section-title">${esc(c.n)}</div>`;
  if (!files.length) {
    h += `<div class="labcard"><p class="dim" style="text-align:center;padding:18px 0">لا توجد ملفات منشورة في هذا التصنيف بعد.<br>تُضاف الملفات هنا بعد اعتمادها للنشر.</p></div>`;
  } else { let lastBook = ''; files.forEach((f) => { if (f.book && f.book !== lastBook) { h += `<div class="section-title" style="font-size:15px;margin-top:14px">${esc(f.book)}</div>`; } lastBook = f.book || ''; h += fileCard(f); }); }
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
  else if (p[0] === 'test') html = test(p[1]);
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
  /* Allowlist sanitizer for CMS-entered HTML/MathML (structure tags only). */
  function sanHTML(str) {
    if (typeof DOMParser === 'undefined') return String(str == null ? '' : str);
    var ALLOW = { MATH: 1, MROW: 1, MSUP: 1, MSUB: 1, MSUBSUP: 1, MFRAC: 1, MSQRT: 1, MROOT: 1, MO: 1, MN: 1, MI: 1, MTEXT: 1, MSPACE: 1, MSTYLE: 1, MUNDER: 1, MOVER: 1, MUNDEROVER: 1, MTABLE: 1, MTR: 1, MTD: 1, SPAN: 1, B: 1, STRONG: 1, I: 1, EM: 1, U: 1, BR: 1, DIV: 1, P: 1, SUB: 1, SUP: 1 };
    var ATTR = { DIR: 1, CLASS: 1, MATHVARIANT: 1, DISPLAY: 1 };
    var doc = new DOMParser().parseFromString('<div>' + String(str == null ? '' : str) + '</div>', 'text/html');
    (function walk(node) {
      var kids = [].slice.call(node.childNodes);
      for (var i = 0; i < kids.length; i++) {
        var k = kids[i];
        if (k.nodeType === 1) {
          if (!ALLOW[String(k.tagName).toUpperCase()]) { var t = document.createTextNode(k.textContent || ''); node.replaceChild(t, k); continue; }
          var attrs = [].slice.call(k.attributes);
          for (var j = 0; j < attrs.length; j++) { if (!ATTR[attrs[j].name.toUpperCase()]) k.removeAttribute(attrs[j].name); }
          walk(k);
        } else if (k.nodeType !== 3) { node.removeChild(k); }
      }
    })(doc.body);
    return doc.body.firstChild.innerHTML;
  }
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
          var vm = metaOf(p); l.videos.push({ n: String(p.n).slice(0, 200), yt: p.yt, cmeta: vm });
          SEARCH.push({ k: metaKeys(vm), t: String(p.n) + ' — ' + l.title + ' · ' + g.title, u: '#/g/' + g.id + '/l/' + g.lessons.indexOf(l) + '/v/' + (l.videos.length - 1) });
          applied++;
        } else if (it.type === 'lesson') {
          var g2 = gradeOf(p.g);
          if (!g2 || !p.title || g2.lessons.some(function (x) { return x.title === p.title; })) return;
          var vids = (Array.isArray(p.videos) ? p.videos : [])
            .filter(function (v) { return v && YT.test(v.yt || '') && v.n; })
            .map(function (v) { return { n: String(v.n).slice(0, 200), yt: v.yt }; });
          var nl = { title: String(p.title).slice(0, 120), label: String(p.label || '').slice(0, 120), videos: vids, cmeta: metaOf(p), term: String(p.term || '').slice(0, 80), unit: String(p.unit || '').slice(0, 80), skills: (Array.isArray(p.skills) ? p.skills : []).filter(function (x) { return typeof x === 'string' && x.trim(); }).slice(0, 20).map(function (x) { return x.trim().slice(0, 80); }) };
          if (p.quiz && QUIZSETS[p.quiz]) nl.quiz = p.quiz;
          g2.lessons.push(nl);
          SEARCH.push({ k: metaKeys(nl.cmeta) + ' ' + nl.term + ' ' + nl.unit + ' ' + nl.skills.join(' '), t: 'درس ' + nl.title + ' — ' + g2.title, u: '#/g/' + g2.id + '/l/' + (g2.lessons.length - 1) });
          applied++;
        } else if (it.type === 'quiz') {
          if (!p.id || !Array.isArray(p.questions) || !p.questions.length) return;
          var sani = function (q) {
            var t = ['mcq', 'tf', 'num', 'frac', 'fill'].indexOf(q.t) >= 0 ? q.t : 'mcq';
            var o = { q: sanHTML(q.q), o: (Array.isArray(q.o) ? q.o : []).map(sanHTML), a: (typeof q.a === 'number' ? q.a : 0), exT: typeof q.exT === 'string' ? q.exT : '', exE: sanHTML(q.exE), t: t };
            if (t === 'tf' && o.o.length !== 2) o.o = ['صح', 'خطأ'];
            if (t === 'tf' && o.a > 1) o.a = 0;
            if (t === 'num' || t === 'frac' || t === 'fill') { o.ans = String(q.ans == null ? '' : q.ans).slice(0, 80); o.alts = (Array.isArray(q.alts) ? q.alts : []).slice(0, 10).map(function (x) { return String(x).slice(0, 80); }); o.tol = Math.max(0, Number(q.tol) || 0); o.reduced = q.reduced === true; if (!o.ans) o.q = ''; }
            if (typeof q.img === 'string' && /^https:\/\/[^ ]{1,300}$/.test(q.img)) { o.img = q.img; o.alt = String(q.alt || '').slice(0, 200); }
            var gg = q.geo;
            if (gg && typeof gg === 'object' && ['rect', 'tri', 'circle', 'angle'].indexOf(gg.shape) >= 0) { var nn = function (x) { x = Number(x); return isFinite(x) ? x : 0; }; o.geo = { shape: gg.shape, w: nn(gg.w), h: nn(gg.h), a: nn(gg.a), b: nn(gg.b), c: gg.c ? String(gg.c).slice(0, 12) : '', r: String(gg.r == null ? '' : gg.r).slice(0, 12), deg: nn(gg.deg) }; }
            return o;
          };
          QUIZSETS[p.id] = { title: String(p.title || it.title || '').slice(0, 200), skill: String(p.skill || '').slice(0, 120), questions: p.questions.map(sani).filter(function (q) { return q.q && (q.o.length || ['num', 'frac', 'fill'].indexOf(q.t) >= 0); }) };
          if (!QUIZSETS[p.id].questions.length) { delete QUIZSETS[p.id]; return; }
          applied++;
        } else if (it.type === 'challenge') {
          if (!p.id || !p.q || !Array.isArray(p.o) || !p.o.length) return;
          var nc = { id: p.id, date: p.date || '', iso: p.iso || '', title: String(p.title || it.title || '').slice(0, 200),
            q: sanHTML(p.q), o: p.o.map(sanHTML), a: (typeof p.a === 'number' ? p.a : 0), exT: typeof p.exT === 'string' ? p.exT : '', exE: sanHTML(p.exE),
            level: String(p.level || '').slice(0, 60), cat: String(p.cat || '').slice(0, 60) };
          var ci = CHALLENGES.findIndex(function (c) { return c.id === p.id; });
          if (ci >= 0) CHALLENGES[ci] = nc; else CHALLENGES.unshift(nc);
          applied++;
        } else if (it.type === 'home') {
          var ids = ['paths', 'challenge', 'tools', 'latest'];
          var hl = function (a) { return (Array.isArray(a) ? a : []).filter(function (x, i, ar) { return ids.indexOf(x) >= 0 && ar.indexOf(x) === i; }); };
          var ord = hl(p.order); ids.forEach(function (x) { if (ord.indexOf(x) < 0) ord.push(x); });
          var iids = ['manhag', 'leh', 'qudurat', 'test', 'book', 'lab', 'diagnostic', 'files'];
          var il = function (a) { return (Array.isArray(a) ? a : []).filter(function (x) { return iids.indexOf(x) >= 0; }); };
          HOMECFG = { order: ord, hide: hl(p.hide), soon: hl(p.soon), hideItems: il(p.hideItems), soonItems: il(p.soonItems) };
          applied++;
        } else if (it.type === 'file') {
          if (!it.id || !/^[A-Za-z0-9_-]{1,64}$/.test(String(it.id)) || typeof p.url !== 'string' || !/^https:\/\/[^ ]{1,300}$/.test(p.url)) return;
          var fcat = LIB_CATS.some(function (c) { return c.id === p.cat; }) ? p.cat : 'educational';
          var fobj = { id: 'cms-' + it.id, title: String(it.title || '').slice(0, 200), desc: String(p.desc || '').slice(0, 300), grade: String(p.grade || '').slice(0, 40), subject: String(p.subject || '').slice(0, 60), cat: fcat, url: p.url, added: '', allowDownload: p.allowDownload === true, book: String(p.book || '').slice(0, 80), order: Math.max(0, Math.min(999, parseInt(p.order, 10) || 0)) };
          var fidx = LIB_FILES.findIndex(function (x) { return x.id === fobj.id; });
          if (fidx >= 0) LIB_FILES[fidx] = fobj; else LIB_FILES.push(fobj);
          applied++;
        } else if (it.type === 'notice') {
          if (typeof p.text !== 'string' || !p.text.trim() || !it.id || !/^[A-Za-z0-9_-]{1,64}$/.test(String(it.id))) return;
          var nn = { id: String(it.id), t: esc(String(it.title || '').slice(0, 120)), x: esc(p.text.slice(0, 300)) };
          var ni = NOTICES.findIndex(function (x) { return x.id === nn.id; });
          if (ni >= 0) NOTICES[ni] = nn; else NOTICES.push(nn);
          applied++;
        } else if (it.type === 'book') {
          if (typeof p.t !== 'string' || !p.t.trim() || typeof p.p !== 'string' || !p.p.trim() || !it.id) return;
          var bpg = { cid: String(it.id), ft: String(p.ft || '').trim(), t: esc(p.t.slice(0, 120)), p: esc(p.p.slice(0, 1500)),
            f: '<span dir="ltr">' + esc(String(p.ft || '').slice(0, 200)) + '</span>', ex: esc(String(p.ex || '').slice(0, 300)) };
          var bi = BOOK.findIndex(function (x) { return x.cid === bpg.cid; });
          bpg.o = Math.max(0, Math.min(999, parseInt(p.order, 10) || 0));
          if (bi >= 0) BOOK[bi] = bpg; else BOOK.push(bpg);
          var bcms = BOOK.filter(function (x) { return x.cid; }).sort(function (x, y) { return x.o - y.o; });
          var bsmp = BOOK.filter(function (x) { return !x.cid; });
          BOOK.length = 0; bsmp.concat(bcms).forEach(function (x) { BOOK.push(x); });
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
  function metaOf(p) {
    var m = p && p.meta; if (!m || typeof m !== 'object') return null;
    var o = {};
    if (typeof m.desc === 'string' && m.desc.trim()) o.d = m.desc.trim().slice(0, 500);
    if (Array.isArray(m.tags)) o.tags = m.tags.filter(function (x) { return typeof x === 'string' && x.trim(); }).slice(0, 10).map(function (x) { return x.trim().slice(0, 30); });
    if (['سهل', 'متوسط', 'صعب'].indexOf(m.level) >= 0) o.level = m.level;
    return (o.d || (o.tags && o.tags.length) || o.level) ? o : null;
  }
  function metaKeys(o) { return o ? ((o.d || '') + ' ' + (o.tags || []).join(' ')) : ''; }
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
      if (!d || !Array.isArray(d.items) || !d.items.length) { window.__qRemote = (d && Array.isArray(d.items)) ? 'ok' : 'fail'; qPendingReroute(); return; } // empty never wipes anything
      window.__qRemote = 'ok';
      var applied = mergeItems(d.items);
      var alreadyRouted = __initialRouteDone;
      if (window.__resolveInitialRoute) window.__resolveInitialRoute(); // gated first paint renders merged content
      // A tombstoned deep target must never keep playing: force re-render when the
      // current route's entity was withdrawn, even over the player-iframe guard.
      if (applied > 0 && alreadyRouted && (currentRouteGone() || safeToRerender())) route();
      qPendingReroute();
    })
    .catch(function () { clearTimeout(to); window.__qRemote = 'fail'; qPendingReroute(); if (window.__resolveInitialRoute) window.__resolveInitialRoute(); /* bundled content stands */ });
})();
