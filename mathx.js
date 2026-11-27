/* ===== MATHX — central reusable math-structure renderer (matrices, determinants, vectors) =====
   One implementation, called from both render paths (app.js mruns, theorems.js mxh).

   Notation (written inside ordinary text; digits may be Arabic-Indic ٠-٩ or ASCII 0-9):
     [[a,b],[c,d]]   matrix, any equal rows x cols. Rows split on "],[", entries on , أو ، أو ؛
     |[a,b],[c,d]|   determinant (straight bars)
     ⟨a,b⟩           row vector, 2 or more components (mathematical angle brackets U+27E8/27E9)
     [[a],[b]]       column vector (one-column matrix)
   Entry order follows Arabic reading direction: the first written entry sits top-right
   (grid is dir=rtl), consistent with the app's math-direction rule (never flip to LTR).
   Entries may contain digits, Arabic letters, signs, roots, ^ exponents and / fractions;
   fraction/exponent post-processing by the caller applies inside cells too.

   Contract: MATHX.render(escapedText) → html. Call AFTER HTML-escaping (entries are escaped
   text; the patterns contain no characters affected by escaping). Anything that does not
   parse as a well-formed structure is left exactly as written.
*/
window.MATHX = (function () {
  'use strict';

  function cells(s) {
    return s.split(/[،,؛;]/).map((x) => x.trim()).filter((x) => x.length > 0);
  }

  function rows(body) {
    return body.split(/\]\s*[،,]\s*\[/).map((r) => r.replace(/^\[|\]$/g, '')).map(cells);
  }

  function grid(rs, cls, lb, rb) {
    if (!rs.length) return null;
    const ncol = rs[0].length;
    if (!ncol || rs.some((r) => r.length !== ncol)) return null;
    const g = '<span class="mxg" style="grid-template-columns:repeat(' + ncol + ',auto)">'
      + rs.map((r) => r.map((c) => '<span class="mxc">' + c + '</span>').join('')).join('')
      + '</span>';
    return '<span class="mx ' + cls + '" dir="rtl"><span class="mxb mx1"></span>' + g + '<span class="mxb mx2"></span></span>';
  }

  function render(t) {
    // determinant: |[...],[...]|  (before matrix, since it starts with |)
    t = t.replace(/\|(\[.+?\])\|/g, (m0, body) => {
      const g = grid(rows(body), 'mxdet');
      return g || m0;
    });
    // matrix / column vector: [[...],[...]]
    t = t.replace(/\[\[(.+?)\]\]/g, (m0, body) => {
      const g = grid(rows(body), 'mxmat');
      return g || m0;
    });
    // row vector: ⟨a,b⟩ (angle brackets survive escaping)
    t = t.replace(/⟨([^⟨⟩]+)⟩/g, (m0, body) => {
      const cs = cells(body);
      if (cs.length < 2) return m0;
      const g = '<span class="mxg" style="grid-template-columns:repeat(' + cs.length + ',auto)">'
        + cs.map((c) => '<span class="mxc">' + c + '</span>').join('') + '</span>';
      return '<span class="mx mxvec" dir="rtl"><span class="mxvb">⟨</span>' + g + '<span class="mxvb">⟩</span></span>';
    });
    return t;
  }

  return { render: render };
})();
