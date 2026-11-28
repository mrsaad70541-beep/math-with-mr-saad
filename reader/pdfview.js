// Local test viewer - SYNTHETIC fixtures only (book-g3-t1.pdf 56p scanned-style no text layer;
// book-g3-t1-text.pdf / book-g3-t1b-text.pdf small text-layer fixtures). Vendored pdf.js 6.5.438 as ES module.
import * as pdfjsLib from './pdf.min.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.mjs';
window.pdfjsLib = pdfjsLib;
/*MANIFEST-BEGIN (production: built from the existing public content service, no hardcoded book list)*/
// Same endpoint, payload parsing and https-only rule as the app's own content merge (app.js).
// A published item of type 'book' with payload {pdf:<https url>, pc:<pages>, bk, bi, ed, order, t} becomes one reader entry.
// Book identity matches the app: slug = 'b-'+bi, else a hash of bk, else 'main'. Edition = payload.ed. Versions are numbered
// by a STABLE id = hash(edition + '|' + pdf url) (same function in app.js readerHref): inserting, reordering or deleting other
// editions never changes an existing id, so saved notes/bookmarks/share links keep pointing at the same PDF. Identical
// (edition, pdf) entries deduplicate; a different PDF or edition gets a different id and never reuses saved data.
var CONTENT_URL = 'https://secureadmin.mrsaad70541.workers.dev/api/public/content';
var MANIFEST = { books: [] };
function payloadOf(it) {
  var p = it && it.payload;
  if (typeof p === 'string') { try { p = JSON.parse(p); } catch (e) { return null; } }
  return (p && typeof p === 'object') ? p : null;
}
function bookSlug(p) {
  if (typeof p.bk === 'string' && p.bk.trim()) {
    if (typeof p.bi === 'string' && /^[a-z0-9-]{1,24}$/.test(p.bi)) return 'b-' + p.bi;
    var n = p.bk.trim().slice(0, 80), h = 0;
    for (var i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) | 0;
    return 'k' + Math.abs(h).toString(36);
  }
  return 'main';
}
function stableVid(ed, url) {
  var s = String(ed) + '|' + String(url), h1 = 0x811c9dc5, h2 = 5381;
  for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); h1 ^= c; h1 = Math.imul(h1, 16777619); h2 = (Math.imul(h2, 33) ^ c) | 0; }
  return 'e' + (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36);
}
function buildManifest(items) {
  var by = {};
  (Array.isArray(items) ? items : []).forEach(function (it) {
    if (!it || it.type !== 'book' || it.status === 'tombstone') return;
    var p = payloadOf(it);
    if (!p || p.tombstone === true || typeof p.pdf !== 'string' || !/^https:\/\/[^ "'<>]{1,300}$/.test(p.pdf)) return;
    if (typeof p.t !== 'string' || !p.t.trim() || !(parseInt(p.pc, 10) >= 1)) return;
    var slug = bookSlug(p);
    var b = by[slug] || (by[slug] = { id: slug, title: (typeof p.bk === 'string' && p.bk.trim()) ? p.bk.trim().slice(0, 80) : 'الكتاب', entries: [], no: 1e9 });
    var ord = Math.max(0, Math.min(999, parseInt(p.order, 10) || 0));
    if (ord <= b.no) { b.no = ord; if (typeof p.bk === 'string' && p.bk.trim()) b.title = p.bk.trim().slice(0, 80); }
    var ed = (typeof p.ed === 'string' && /^[0-9A-Za-z-]{1,24}$/.test(p.ed)) ? p.ed : '';
    b.entries.push({ ed: ed, ord: ord, url: p.pdf, label: ed || 'الأساسي', t: p.t.trim().slice(0, 80) });
  });
  var books = Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return a.no - b.no || (a.id < b.id ? -1 : 1); });
  books.forEach(function (b) {
    b.entries.sort(function (x, y) { return (x.ed < y.ed ? -1 : x.ed > y.ed ? 1 : 0) || x.ord - y.ord; });
    var seen = {}, vs = [];
    b.entries.forEach(function (e) {
      var key = e.ed + '|' + e.url; if (seen[key]) return; seen[key] = 1;
      vs.push({ v: stableVid(e.ed, e.url), label: e.label, url: e.url });
    });
    b.versions = vs; delete b.entries; delete b.no;
  });
  MANIFEST.books = books;
}
function loadManifestOnce() {
  return fetch(CONTENT_URL, { credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error('content http ' + r.status); return r.json(); })
    .then(function (d) { buildManifest(d && d.items); });
}
var READY = loadManifestOnce();
/*MANIFEST-END*/
var $ = function (id) { return document.getElementById(id); };
var doc = null, page = 1, total = 0, scale = 1.0;
var renderSeq = 0, loadSeq = 0, searchSeq = 0, renderTask = null;
var reqBook = null, reqVer = null; // identity EXPLICITLY requested by a link; never silently substituted
var bookId = 'g3t1', ver = '1'; // version id is a STRING (numeric in QA fixtures, stable content hash in production)
var storeKey = function (k) { return 'saad.pdfv1.' + bookId + '.v' + ver + '.' + k; };
var storeFailed = false, curUrl = '';
function storeWarnShow() { var w = $('storeWarn'); if (w) w.hidden = false; }
var jget = function (k, d, ok) {
  try {
    var v = JSON.parse(localStorage.getItem(k));
    if (v == null) return d;
    if (ok && !ok(v)) return d; // valid JSON but wrong type -> default
    return v;
  } catch (e) { return d; }
};
var jset = function (k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); }
  catch (e) { if (!storeFailed) { storeFailed = true; console.error('STOREFAIL', e && e.name); } storeWarnShow(); }
};
var isNum = function (v) { return typeof v === 'number' && isFinite(v); };
var isArr = function (v) { return Array.isArray(v); };
var isObj = function (v) { return v && typeof v === 'object' && !Array.isArray(v); };
var toAr = function (n) { return String(n).replace(/\d/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; }); };

// Normalize book/version selection ONCE (fixes stale/unknown identity in storage + share + hash).
function resolveSel() {
  if (!MANIFEST.books.length) return null; // production manifest with no books configured yet
  var b = MANIFEST.books.find(function (x) { return x.id === (reqBook || bookId); });
  if (!b) {
    if (reqBook) return { unavailable: 'book' }; // explicit unknown book: never becomes another book
    b = MANIFEST.books[0];
  }
  var wantV = reqBook ? reqVer : ver;
  var v = wantV != null ? b.versions.find(function (x) { return String(x.v) === String(wantV); }) : null;
  if (!v) {
    if (reqBook && reqVer) return { unavailable: 'version', book: b }; // explicit removed/replaced version: never another PDF
    v = b.versions[0];
  }
  bookId = b.id; ver = String(v.v); reqBook = reqVer = null; // identity now resolved and real
  return v;
}
function chooseVersion(bid, vid) { reqBook = reqVer = null; bookId = bid; ver = String(vid); page = 1; loadBook(false); writeHash(); }
function showUnavailable(u) {
  ++renderSeq; if (renderTask) { try { renderTask.cancel(); } catch (e) { /* already settled */ } } // nothing from the previous document may keep painting
  var cv0 = $('cv'); if (cv0) { delete cv0.dataset.rendered; cv0.width = cv0.height = 0; }
  document.body.classList.add('unavail');
  var old = $('unavail'); if (old) old.remove();
  var box = document.createElement('div'); box.id = 'unavail'; box.setAttribute('role', 'alert');
  var t = document.createElement('p'); t.textContent = u.unavailable === 'version' ? 'هذا الإصدار من الكتاب لم يعد متاحًا.' : 'هذا الكتاب غير متاح.'; box.appendChild(t);
  var h = document.createElement('p'); h.className = 'dim'; h.textContent = 'اختر إصدارًا متاحًا:'; box.appendChild(h);
  (u.book ? [u.book] : MANIFEST.books).forEach(function (bk) { bk.versions.forEach(function (v) {
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'sideBtn pickVer'; btn.textContent = bk.title + ' — ' + v.label;
    btn.onclick = function () { chooseVersion(bk.id, v.v); };
    box.appendChild(btn);
  }); });
  $('stage').appendChild(box);
  fillBookSel(true);
}
function showManifestError() {
  showLoadError('تعذر تحميل قائمة الكتب.', function () { READY = loadManifestOnce(); READY.then(start, function () { showManifestError(); }); });
}
function fillBookSel(none) {
  var s = $('bookSel'); s.textContent = '';
  if (none) { var o0 = document.createElement('option'); o0.value = ''; o0.textContent = 'اختر إصدارًا…'; s.appendChild(o0); }
  MANIFEST.books.forEach(function (b) { b.versions.forEach(function (v) {
    var o = document.createElement('option'); o.value = b.id + '|' + v.v; o.textContent = b.title + ' — ' + v.label; s.appendChild(o);
  }); });
  s.value = none ? '' : bookId + '|' + ver;
}
function parseHash() {
  var h = location.hash || '';
  var m = h.match(/book=([\w-]+)(?:&v=([\w-]+))?(?:&page=(\d+))?/);
  if (m) { reqBook = m[1]; reqVer = m[2] || null; if (m[3]) page = +m[3]; return !!m[3]; }
  if (/book=/.test(h)) { reqBook = '?'; reqVer = null; } // malformed identity: safe "unavailable", not a silent default
  return false;
}
function writeHash() { history.replaceState(null, '', '#book=' + bookId + '&v=' + ver + '&page=' + page); }

function ensureCanvas() {
  var cv = $('cv');
  if (!cv) { cv = document.createElement('canvas'); cv.id = 'cv'; $('stage').appendChild(cv); }
  return cv;
}
function showLoadError(msg, retryFn) {
  var e = $('loadErr'); if (!e) { e = document.createElement('div'); e.id = 'loadErr'; $('stage').appendChild(e); }
  e.hidden = false; e.textContent = '';
  var t = document.createElement('span'); t.textContent = msg; e.appendChild(t);
  if (retryFn) {
    var b = document.createElement('button'); b.id = 'loadRetry'; b.type = 'button'; b.textContent = 'إعادة المحاولة';
    b.onclick = retryFn; // re-attempt the SAME operation that failed (same fromHash semantics / same page)
    e.appendChild(b);
  }
  if (curUrl && /^https:\/\/[^ "'<>]{1,300}$/.test(curUrl)) { // original file stays reachable even when it is not CORS-readable here
    var a = document.createElement('a'); a.id = 'origLink'; a.href = curUrl; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = 'فتح الملف الأصلي في تبويب جديد'; e.appendChild(a);
  }
}
function hideLoadError() { var e = $('loadErr'); if (e) e.hidden = true; }

// isEvalSupported:false = CVE-2024-4367 mitigation, kept for the vendored pdf.js 6.5.438
// fromHash=true means the caller already resolved bookId/ver/page from the URL hash;
// loadBook itself NEVER re-reads the hash (a bookSel change must not be reverted by a stale hash).
function loadBook(fromHash) {
  var myLoad = ++loadSeq;
  doc = null; total = 0; $('q').value = ''; closeSide();
  searchCache = {}; ++searchSeq; // invalidate any in-flight search for the old doc
  var sel = resolveSel(); // normalize bookId+ver BEFORE the request
  curUrl = sel && !sel.unavailable ? sel.url : '';
  if (sel && sel.unavailable) { showUnavailable(sel); return; } // no render, no hash write, no storage write
  document.body.classList.remove('unavail'); var ua = $('unavail'); if (ua) ua.remove();
  if (!sel) { // empty production manifest: honest empty state, no crash
    var st = $('stage'); st.textContent = '';
    var m = document.createElement('div'); m.id = 'emptyState'; m.style.padding = '40px 16px'; m.style.color = 'var(--mut)';
    m.textContent = 'لا توجد كتب مضافة بعد.';
    st.appendChild(m);
    var bs = $('bookSel'); bs.textContent = ''; bs.disabled = true;
    return;
  }
  fillBookSel();
  pdfjsLib.getDocument({ url: sel.url, isEvalSupported: false }).promise.then(function (d) {
    if (myLoad !== loadSeq) { if (d.destroy) d.destroy(); return; } // stale load: never touch state
    doc = d; total = d.numPages; $('pgTotal').textContent = '/ ' + toAr(total);
    if (!fromHash) page = jget(storeKey('last'), 1, isNum);
    page = Math.min(Math.max(1, page), total);
    // auto fit-width on first load when the page is wider than the screen (mobile)
    d.getPage(page).then(function (p) {
      if (myLoad !== loadSeq) return;
      var avail = Math.min(document.body.clientWidth - 20, 1100);
      var nat = p.getViewport({ scale: 1 }).width;
      if (nat > avail) scale = avail / nat;
      render(); // outline loads on demand via #idx
    }, function (e) { if (myLoad === loadSeq) showLoadError('تعذر فتح صفحة الكتاب.', function () { loadBook(fromHash); }); });
  }).catch(function (e) {
    if (myLoad !== loadSeq) return;
    console.error('LOADFAIL', e && e.name, e && e.message);
    ensureCanvas(); // keep the canvas in the DOM for the retry path
    showLoadError('تعذر فتح ملف الكتاب.', function () { loadBook(fromHash); });
  });
}

function render() {
  if (!doc) return;
  var d = doc, myPage = page, seq = ++renderSeq;
  var cv0 = $('cv'); if (cv0) delete cv0.dataset.rendered; // clear completion marker until THIS render paints
  if (renderTask) { try { renderTask.cancel(); } catch (e) {} renderTask = null; } // never two renders on one canvas
  d.getPage(myPage).then(function (p) {
    if (seq !== renderSeq || d !== doc) return;
    var vp = p.getViewport({ scale: scale });
    var cv = ensureCanvas(), ctx = cv.getContext('2d');
    cv.width = vp.width; cv.height = vp.height;
    var task = p.render({ canvasContext: ctx, viewport: vp });
    renderTask = task;
    task.promise.then(function () {
      if (renderTask === task) renderTask = null; // a settling stale task must not erase a newer handle
      if (seq !== renderSeq || d !== doc) return;
      // success-only side effects: nothing below marks progress on a failed/cancelled render
      $('pg').value = myPage;
      $('zlvl').textContent = Math.round(scale * 100) + '%';
      jset(storeKey('last'), myPage);
      var best = Math.max(jget(storeKey('prog'), 1, isNum), myPage);
      jset(storeKey('prog'), best);
      $('prog').firstElementChild.style.width = Math.round(100 * best / total) + '%';
      var bms = jget(storeKey('bm'), [], isArr);
      $('bm').textContent = bms.indexOf(myPage) >= 0 ? '★' : '☆';
      $('bm').classList.toggle('on', bms.indexOf(myPage) >= 0);
      var notes = jget(storeKey('notes'), {}, isObj);
      $('notes').classList.toggle('on', !!(notes[myPage] && String(notes[myPage]).trim()));
      writeHash();
      cv.dataset.rendered = String(myPage); // test hook: page actually painted
      hideLoadError();
    }, function (err) {
      if (renderTask === task) renderTask = null;
      if (err && err.name === 'RenderingCancelledException') return; // superseded by a newer render: stay silent
      console.error('RENDERFAIL', err && err.name, err && err.message);
      if (seq === renderSeq && d === doc) showLoadError('تعذر عرض الصفحة.', function () { render(); });
    });
  }, function (err) {
    console.error('GETPAGEFAIL', err && err.name, err && err.message);
    if (seq === renderSeq && d === doc) showLoadError('تعذر فتح صفحة الكتاب.', function () { loadBook(false); });
  });
}
function go(n) { n = Math.min(Math.max(1, n), total || 1); if (n !== page || !doc) { page = n; render(); } }
$('prev').onclick = function () { go(page - 1); };
$('next').onclick = function () { go(page + 1); };
$('pg').onchange = function () { go(+$('pg').value || 1); };
$('zin').onclick = function () { scale = Math.min(3, scale + 0.2); render(); };
$('zout').onclick = function () { scale = Math.max(0.4, scale - 0.2); render(); };
$('fit').onclick = function () { if (!doc) return; doc.getPage(page).then(function (p) { var w = Math.min(document.body.clientWidth - 20, 1100); scale = w / p.getViewport({ scale: 1 }).width; render(); }); };
$('bm').onclick = function () { var bms = jget(storeKey('bm'), [], isArr); var i = bms.indexOf(page); if (i >= 0) bms.splice(i, 1); else { bms.push(page); bms.sort(function (a, b) { return a - b; }); } jset(storeKey('bm'), bms); render(); };
$('bookSel').onchange = function () { var v = $('bookSel').value; if (!v) return; var parts = v.split('|'); chooseVersion(parts[0], parts[1]); };
$('share').onclick = function () { var u = location.origin + location.pathname + '#book=' + bookId + '&v=' + ver + '&page=' + page; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { $('share').textContent = 'نُسخ الرابط'; setTimeout(function () { $('share').textContent = 'مشاركة الصفحة'; }, 1500); }, function () { prompt('انسخ الرابط:', u); }); };

// ---- sidebar: DOM-built (no untrusted text in innerHTML), close button, Escape, focus management ----
var sideLastFocus = null, sideOwner = null;
function closeSide() {
  var s = $('side');
  if (sideOwner === 'search') ++searchSeq; // explicitly closing the panel cancels a pending search too
  sideOwner = null;
  s.classList.remove('open');
  s.textContent = ''; // never leave stale panel content (e.g. an in-flight search spinner) behind
  if (sideLastFocus && document.contains(sideLastFocus)) sideLastFocus.focus();
  sideLastFocus = null;
}
function openSide(buildFn) {
  var s = $('side');
  if (!s.classList.contains('open')) sideLastFocus = document.activeElement;
  s.textContent = '';
  var head = document.createElement('div'); head.className = 'sideHead';
  var x = document.createElement('button'); x.type = 'button'; x.className = 'sideClose'; x.textContent = '✕';
  x.setAttribute('aria-label', 'إغلاق اللوحة');
  x.onclick = function () { closeSide(); };
  head.appendChild(x); s.appendChild(head);
  var body = document.createElement('div'); body.id = 'sideBody'; s.appendChild(body);
  buildFn(body);
  s.classList.add('open');
  x.focus();
}
function openSideAs(owner, buildFn) { if (owner !== 'search') ++searchSeq; // switching to notes/index cancels a running search so its completion cannot replace this panel
  sideOwner = owner; openSide(buildFn); }
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSide(); });
function sideTitle(body, txt) { var h = document.createElement('h3'); h.textContent = txt; body.appendChild(h); }
function sideDim(body, txt) { var d = document.createElement('div'); d.className = 'dim'; d.textContent = txt; body.appendChild(d); return d; }

$('notes').onclick = function () {
  // Pin the editor to the page/book/version at OPEN time: navigating the reader afterwards
  // must never retarget Save/Delete to a different page or book.
  var pinPage = page, pinBook = bookId, pinVer = ver;
  var nkey = 'saad.pdfv1.' + pinBook + '.v' + pinVer + '.notes';
  var pinBk = MANIFEST.books.find(function (x) { return x.id === pinBook; }) || {};
  var pinVx = (pinBk.versions || []).find(function (x) { return String(x.v) === String(pinVer); }) || {};
  var bookLabel = (pinBk.title || pinBook) + ' — ' + (pinVx.label || pinVer);
  var notes = jget(nkey, {}, isObj);
  openSideAs('notes', function (body) {
    sideTitle(body, 'ملاحظتي على صفحة ' + toAr(pinPage));
    sideDim(body, bookLabel + ' · تُحفظ على هذا الجهاز فقط.');
    var ta = document.createElement('textarea'); ta.id = 'noteTa'; ta.placeholder = 'اكتب ملاحظتك الخاصة هنا…'; body.appendChild(ta);
    var row = document.createElement('div'); row.style.marginTop = '8px'; body.appendChild(row);
    var save = document.createElement('button'); save.id = 'noteSave'; save.className = 'sideBtn'; save.textContent = 'حفظ';
    var del = document.createElement('button'); del.id = 'noteDel'; del.className = 'sideBtn alt'; del.textContent = 'حذف';
    row.appendChild(save); row.appendChild(del);
    var list = document.createElement('div'); list.id = 'noteList'; list.style.marginTop = '14px'; body.appendChild(list);
    ta.value = notes[pinPage] || '';
    save.onclick = function () { var n = jget(nkey, {}, isObj); var t = ta.value; if (t.trim()) n[pinPage] = t; else delete n[pinPage]; jset(nkey, n); render(); drawNoteList(nkey); };
    del.onclick = function () { var n = jget(nkey, {}, isObj); delete n[pinPage]; jset(nkey, n); ta.value = ''; render(); drawNoteList(nkey); };
    drawNoteList(nkey);
  });
};
function drawNoteList(nkey) {
  var n = jget(nkey, {}, isObj), el = $('noteList'); if (!el) return;
  el.textContent = '';
  sideDim(el, 'صفحات بها ملاحظات:');
  Object.keys(n).sort(function (a, b) { return a - b; }).forEach(function (p) {
    var it = document.createElement('div'); it.className = 'item';
    it.appendChild(document.createTextNode('صفحة ' + toAr(p)));
    var sm = document.createElement('small'); sm.textContent = String(n[p]).slice(0, 60) + '…'; it.appendChild(sm);
    it.onclick = function () { go(+p); }; // navigates the READER only; the editor stays pinned
    el.appendChild(it);
  });
}

// ---- outline: DOM-built titles; destination resolution for named strings / explicit arrays / refs / numbers ----
function resolveDest(d, dest) {
  var d0 = Array.isArray(dest) ? dest[0] : dest;
  var pr = (typeof d0 === 'string') ? d.getDestination(d0) : Promise.resolve(dest);
  return pr.then(function (d2) {
    if (!d2) return Promise.reject(new Error('bad dest'));
    var ref = Array.isArray(d2) ? d2[0] : d2;
    return (typeof ref === 'number') ? ref : d.getPageIndex(ref);
  });
}
$('idx').onclick = function () {
  if (!doc) return;
  var d = doc;
  d.getOutline().then(function (ol) {
    if (d !== doc) return;
    openSideAs('idx', function (body) {
      sideTitle(body, 'الفهرس');
      if (!ol || !ol.length) { sideDim(body, 'لا يحتوي هذا الملف على فهرس مدمج. يُعرض الفهرس هنا عندما يوفره ملف الكتاب.'); return; }
      var walk = function (items, depth) {
        items.forEach(function (it) {
          var el = document.createElement('div'); el.className = 'item';
          el.style.marginInlineStart = (depth * 12) + 'px';
          el.textContent = String(it.title == null ? '' : it.title); // PDF titles stay literal text
          el.onclick = function () { resolveDest(d, it.dest).then(function (i) { if (d === doc) go(i + 1); }, function () {}); };
          body.appendChild(el);
          if (it.items && it.items.length) walk(it.items, depth + 1);
        });
      };
      walk(ol, 0);
    });
  });
};

// ---- search: pinned doc/book/ver, generation guard, cache cleared per load, DOM-built results ----
var searchCache = {};
function pageText(d, n) {
  if (searchCache[n]) return searchCache[n];
  var pr = d.getPage(n).then(function (p) { return p.getTextContent(); }).then(function (tc) { return tc.items.map(function (i) { return i.str; }).join(' '); });
  searchCache[n] = pr;
  pr.then(null, function () { if (searchCache[n] === pr) delete searchCache[n]; }); // evict only THIS rejected promise so a retry can truly retry
  return pr;
}
var qTimer = null;
$('q').oninput = function () {
  clearTimeout(qTimer); qTimer = setTimeout(runSearch, 500);
  ++searchSeq; // invalidate any in-flight search IMMEDIATELY, not only when the next search starts
  if ($('q').value.trim().length < 2 && sideOwner === 'search') closeSide(); // cleared query must not leave stale results
};
function runSearch() {
  var q = $('q').value.trim(); if (!doc || q.length < 2) return;
  var d = doc, myBook = bookId, myVer = ver, myTotal = total, mySearch = ++searchSeq;
  openSideAs('search', function (body) { sideTitle(body, 'بحث: ' + q); sideDim(body, 'جارٍ البحث…'); });
  var hits = [], failed = false, chain = Promise.resolve();
  var alive = function () { return mySearch === searchSeq && d === doc && bookId === myBook && ver === myVer; };
  for (var n = 1; n <= myTotal; n++) (function (n) {
    chain = chain.then(function () {
      if (!alive()) return null; // stale search: stop walking, never write results
      return pageText(d, n).then(function (t) { var i = t.indexOf(q); if (i >= 0) hits.push({ p: n, snip: t.slice(Math.max(0, i - 30), i + q.length + 30) }); }, function () { failed = true; });
    });
  })(n);
  chain.then(function () {
    if (!alive()) return;
    if (failed) { openSideAs('search', function (body) { sideTitle(body, 'بحث: ' + q); sideDim(body, 'تعذر استخراج نص بعض الصفحات.'); var rb = document.createElement('button'); rb.id = 'searchRetry'; rb.className = 'sideBtn'; rb.textContent = 'إعادة المحاولة'; rb.onclick = function () { runSearch(); }; body.appendChild(rb); }); return; }
    openSideAs('search', function (body) {
      sideTitle(body, 'بحث: ' + q);
      if (!hits.length) { sideDim(body, 'لا نتائج.'); return; }
      hits.forEach(function (h) {
        var it = document.createElement('div'); it.className = 'item'; it.dataset.p = h.p;
        it.appendChild(document.createTextNode('صفحة ' + toAr(h.p)));
        var sm = document.createElement('small'); sm.textContent = '…' + h.snip + '…'; it.appendChild(sm);
        it.onclick = function () { go(h.p); };
        body.appendChild(it);
      });
    });
  }, function () { /* chain rejection already handled per-page; nothing else to do */ });
}
window.addEventListener('hashchange', function () { var had = parseHash(); if (reqBook || had || !doc) loadBook(had); else { fillBookSel(); render(); } });
function start() { var hadInitial = parseHash(); loadBook(hadInitial); }
READY.then(start, function () { showManifestError(); });
