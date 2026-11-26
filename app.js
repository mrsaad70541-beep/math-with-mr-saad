const app = document.getElementById('app');
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 2200);
}

function featureRow(icon, name) {
  return `<a class="card feature" href="#/soon"><span class="chip">${icon}</span><span class="txt"><h2>${name}</h2><div class="sub">قيد التطوير — هتشتغل هنا</div><span class="badge soon">غير متاح حاليًا</span></span></a>`;
}

function home() {
  let h = '<div class="section-title">أقسام المكتبة</div>';
  h += `<a class="card" href="#/manhag"><span class="chip">١٢٣</span><span class="txt"><h2>المنهج المصري</h2><div class="sub">الصف الأول والثاني والثالث الإعدادي — صف ← درس ← مهارة</div><span class="badge">متاح الآن</span></span><span class="arrow">‹</span></a>`;
  h += `<a class="card" href="#/t/qudurat"><span class="chip">∑</span><span class="txt"><h2>القدرات</h2><div class="sub">المنهج السعودي — مرتبة حسب أبواب الكتاب</div><span class="badge soon">قريبًا</span></span><span class="arrow">‹</span></a>`;
  h += `<a class="card" href="#/t/leh"><span class="chip">؟</span><span class="txt"><h2>ليه؟</h2><div class="sub">رياضيات عامة — أفكار وحيل وألغاز</div><span class="badge soon">قريبًا</span></span><span class="arrow">‹</span></a>`;
  h += '<div class="section-title">ميزات قادمة</div>';
  h += featureRow('✏', 'اختبارات وتدريبات');
  h += featureRow('📕', 'الكتاب التفاعلي');
  h += featureRow('👤', 'حساب الطالب');
  return h;
}
function manhag() {
  let h = '<a class="back" href="#/">‹ رجوع</a><div class="section-title">اختر صفّك</div>';
  const nums = { g1: '١', g2: '٢', g3: '٣' };
  for (const g of DATA.grades) h += `<a class="card" href="#/g/${g.id}"><span class="chip">${nums[g.id] || '•'}</span><span class="txt"><h2>${esc(g.title)}</h2></span><span class="arrow">‹</span></a>`;
  return h;
}
function grade(gid) {
  const g = DATA.grades.find((x) => x.id === gid);
  let h = `<a class="back" href="#/manhag">‹ المنهج</a><div class="section-title">${esc(g.title)} — الدروس</div>`;
  g.lessons.forEach((l, i) => { h += `<a class="card" href="#/g/${g.id}/l/${i}"><span class="chip">${i + 1}</span><span class="txt"><h2>${esc(l.title)}</h2><div class="sub">${esc(l.label)}</div></span><span class="arrow">‹</span></a>`; });
  return h;
}
function lesson(gid, li) {
  const g = DATA.grades.find((x) => x.id === gid);
  const l = g.lessons[li];
  let h = `<a class="back" href="#/g/${g.id}">‹ ${esc(g.title)}</a><div class="section-title">${esc(l.title)}</div>`;
  l.videos.forEach((v, vi) => {
    h += v.yt
      ? `<div class="vrow"><span class="vn">${esc(v.n)}</span><a class="play" href="#/g/${g.id}/l/${li}/v/${vi}">▶ تشغيل</a></div>`
      : `<div class="vrow"><span class="vn">${esc(v.n)}</span><a class="play off" href="#/soon">قريبًا</a></div>`;
  });
  return h;
}
function track(tid) {
  const t = DATA[tid];
  let h = `<a class="back" href="#/">‹ الرئيسية</a><div class="section-title">${esc(t.title)} — ${esc(t.subtitle)}</div>`;
  if (!t.groups.length) h += `<div class="note">قريبًا — شغالين على تجهيز المكتبة كاملة</div>`;
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
  h += `<div class="note">باقي مهارات الدرس قريبًا</div>`;
  return h;
}
function watch(gid, li, vi) {
  const g = DATA.grades.find((x) => x.id === gid);
  const v = g.lessons[li].videos[vi];
  return `<a class="back" href="#/g/${g.id}/l/${li}">‹ ${esc(g.lessons[li].title)}</a>
  <div class="section-title">${esc(v.n)}</div>
  <div class="playerwrap"><iframe src="https://www.youtube-nocookie.com/embed/${v.yt}" title="${esc(v.n)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
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
  else html = home();
  app.innerHTML = html;
  document.querySelectorAll('#tabbar a').forEach((a) => a.classList.toggle('active',
    (p[0] === 'manhag' || p[0] === 'g' || p[0] === 't') ? a.dataset.route === 'manhag' : a.dataset.route === 'home' && p.length === 0));
  window.scrollTo(0, 0);
  if (p[0] === 'soon') toast('غير متاح حاليًا — شغالين عليها');
}
window.addEventListener('hashchange', route);
route();
