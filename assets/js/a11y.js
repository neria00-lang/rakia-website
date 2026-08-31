/* ============================================================
   רקיע – חינוך יצירתי | תפריט נגישות (כלי העדפות משתמש)
   ------------------------------------------------------------
   כלי נוחות בלבד: מחליף מחלקות CSS על <html> לפי בחירת המשתמש.
   אינו משנה תוכן, אינו כותב alt/aria, אינו "מתקן" את האתר אוטומטית.
   תואם דרישת תקנה 35 / ת"י 5568. קיצור מקלדת: Alt+A.
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'rakia_a11y_v1';
  var VERSION = 1;

  var DEFAULTS = {
    version: VERSION,
    links: false,
    contrast: 'off',      // off | high | invert | mono
    textSize: 100,        // 100 | 115 | 130 | 150
    lineSpacing: 'normal',// normal | 16 | 20
    readableFont: false,
    headings: false,
    cursorBig: false,
    reduceMotion: false
  };

  // מקור אמת יחיד — חייב להיות זהה לסקריפט ה-bootstrap שב-<head> של כל עמוד.
  var CLASS_RULES = [
    ['a11y-links',           function (p) { return !!p.links; }],
    ['a11y-contrast-high',   function (p) { return p.contrast === 'high'; }],
    ['a11y-contrast-invert', function (p) { return p.contrast === 'invert'; }],
    ['a11y-contrast-mono',   function (p) { return p.contrast === 'mono'; }],
    ['a11y-text-115',        function (p) { return p.textSize === 115; }],
    ['a11y-text-130',        function (p) { return p.textSize === 130; }],
    ['a11y-text-150',        function (p) { return p.textSize === 150; }],
    ['a11y-lines-16',        function (p) { return p.lineSpacing === '16'; }],
    ['a11y-lines-20',        function (p) { return p.lineSpacing === '20'; }],
    ['a11y-readable-font',   function (p) { return !!p.readableFont; }],
    ['a11y-headings',        function (p) { return !!p.headings; }],
    ['a11y-cursor-big',      function (p) { return !!p.cursorBig; }],
    ['a11y-reduce-motion',   function (p) { return !!p.reduceMotion; }]
  ];

  var CONTRAST_CYCLE = ['off', 'high', 'invert', 'mono'];
  var CONTRAST_LABEL = { off: 'רגיל', high: 'ניגודיות גבוהה', invert: 'ניגודיות הפוכה', mono: 'גווני אפור' };
  var TEXT_CYCLE = [100, 115, 130, 150];
  var LINE_CYCLE = ['normal', '16', '20'];
  var LINE_LABEL = { normal: 'רגיל', '16': 'מוגדל', '20': 'מרווח' };

  function read() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(DEFAULTS);
      var p = JSON.parse(raw);
      if (!p || p.version !== VERSION) return clone(DEFAULTS);
      var out = clone(DEFAULTS);
      for (var k in DEFAULTS) { if (k in p) out[k] = p[k]; }
      out.version = VERSION;
      return out;
    } catch (e) { return clone(DEFAULTS); }
  }
  function write(p) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (e) {}
  }
  function clone(o) { var c = {}; for (var k in o) c[k] = o[k]; return c; }

  function apply(p) {
    var c = document.documentElement.classList;
    for (var i = 0; i < CLASS_RULES.length; i++) {
      c.toggle(CLASS_RULES[i][0], CLASS_RULES[i][1](p));
    }
  }
  function anyActive(p) {
    return p.links || p.contrast !== 'off' || p.textSize !== 100 ||
      p.lineSpacing !== 'normal' || p.readableFont || p.headings ||
      p.cursorBig || p.reduceMotion;
  }

  var prefs = read();
  apply(prefs); // רשת ביטחון אם סקריפט ה-bootstrap לא רץ

  document.addEventListener('DOMContentLoaded', function () {
    buildWidget();
  });

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  }

  var trigger, panel, liveRegion, lastFocused;

  function buildWidget() {
    if (document.getElementById('a11y-widget-trigger')) return;

    liveRegion = el('div', { id: 'a11y-live', role: 'status', 'aria-live': 'polite', class: 'sr-only' });

    trigger = el('button', {
      id: 'a11y-widget-trigger', type: 'button',
      'aria-label': 'פתיחת תפריט נגישות', 'aria-haspopup': 'dialog',
      'aria-expanded': 'false', 'aria-controls': 'a11y-widget-panel',
      'aria-keyshortcuts': 'Alt+A', title: 'תפריט נגישות (Alt+A)'
    },
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="26" height="26">' +
      '<circle cx="12" cy="3.6" r="2.1" fill="currentColor"/>' +
      '<path fill="currentColor" d="M12 7c-2.5 0-5.5-.6-7.3-1.1a1.1 1.1 0 0 0-.6 2.1c1.4.4 3.4.9 5.4 1.1l-.7 4.3-1.9 6.1a1.15 1.15 0 0 0 2.2.7L11 15h2l1.9 5.2a1.15 1.15 0 0 0 2.2-.7l-1.9-6.1-.7-4.3c2-.2 4-.7 5.4-1.1a1.1 1.1 0 0 0-.6-2.1C17.5 6.4 14.5 7 12 7z"/>' +
      '</svg>'
    );
    if (anyActive(prefs)) trigger.classList.add('is-active');
    trigger.addEventListener('click', openPanel);

    panel = el('div', {
      id: 'a11y-widget-panel', role: 'dialog', 'aria-modal': 'true',
      'aria-labelledby': 'a11y-widget-title', hidden: 'hidden'
    });

    var head = el('div', { class: 'a11y-head' });
    head.appendChild(el('h2', { id: 'a11y-widget-title' }, 'תפריט נגישות'));
    var closeBtn = el('button', { type: 'button', class: 'a11y-close', 'aria-label': 'סגירת תפריט נגישות' }, '&times;');
    closeBtn.addEventListener('click', closePanel);
    head.appendChild(closeBtn);
    panel.appendChild(head);

    var grid = el('div', { class: 'a11y-grid' });
    grid.appendChild(card('קישורים מודגשים', 'toggle', 'links'));
    grid.appendChild(card('ניגודיות', 'cycle-contrast'));
    grid.appendChild(card('הגדלת טקסט', 'cycle-text'));
    grid.appendChild(card('מרווח שורות', 'cycle-line'));
    grid.appendChild(card('גופן קריא', 'toggle', 'readableFont'));
    grid.appendChild(card('הדגשת כותרות', 'toggle', 'headings'));
    grid.appendChild(card('סמן גדול', 'toggle', 'cursorBig'));
    grid.appendChild(card('עצירת אנימציות', 'toggle', 'reduceMotion'));
    panel.appendChild(grid);

    var resetBtn = el('button', { type: 'button', class: 'a11y-reset' }, 'איפוס כל ההגדרות');
    resetBtn.addEventListener('click', function () {
      prefs = clone(DEFAULTS);
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      apply(prefs); refreshCards(); trigger.classList.remove('is-active');
      announce('כל הגדרות הנגישות אופסו');
    });
    panel.appendChild(resetBtn);

    var note = el('p', { class: 'a11y-note' },
      'הכלי מסייע בהתאמת התצוגה להעדפותיך. לפרטים מלאים ולפנייה בנושא נגישות — ' +
      '<a href="negishut.html">הצהרת הנגישות</a>.');
    panel.appendChild(note);

    document.body.appendChild(liveRegion);
    document.body.appendChild(trigger);
    document.body.appendChild(panel);

    document.addEventListener('keydown', function (e) {
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.code === 'KeyA') {
        e.preventDefault();
        panel.hasAttribute('hidden') ? openPanel() : closePanel();
      }
      if (e.key === 'Escape' && !panel.hasAttribute('hidden')) { closePanel(); }
    });
    panel.addEventListener('keydown', trapTab);

    refreshCards();
  }

  var cardRefs = [];
  function card(label, kind, key) {
    var btn = el('button', { type: 'button', class: 'a11y-card', 'data-kind': kind });
    if (key) btn.setAttribute('data-key', key);
    btn._label = label; btn._kind = kind; btn._key = key;
    btn.addEventListener('click', function () { onCard(btn); });
    cardRefs.push(btn);
    return btn;
  }

  function onCard(btn) {
    var kind = btn._kind;
    if (kind === 'toggle') {
      prefs[btn._key] = !prefs[btn._key];
      announce(btn._label + ': ' + (prefs[btn._key] ? 'פועל' : 'כבוי'));
    } else if (kind === 'cycle-contrast') {
      prefs.contrast = CONTRAST_CYCLE[(CONTRAST_CYCLE.indexOf(prefs.contrast) + 1) % CONTRAST_CYCLE.length];
      announce('ניגודיות: ' + CONTRAST_LABEL[prefs.contrast]);
    } else if (kind === 'cycle-text') {
      prefs.textSize = TEXT_CYCLE[(TEXT_CYCLE.indexOf(prefs.textSize) + 1) % TEXT_CYCLE.length];
      announce('גודל טקסט: ' + prefs.textSize + '%');
    } else if (kind === 'cycle-line') {
      prefs.lineSpacing = LINE_CYCLE[(LINE_CYCLE.indexOf(prefs.lineSpacing) + 1) % LINE_CYCLE.length];
      announce('מרווח שורות: ' + LINE_LABEL[prefs.lineSpacing]);
    }
    prefs.version = VERSION;
    write(prefs); apply(prefs); refreshCards();
    trigger.classList.toggle('is-active', anyActive(prefs));
  }

  function refreshCards() {
    for (var i = 0; i < cardRefs.length; i++) {
      var b = cardRefs[i], kind = b._kind, on = false, valueLabel = '';
      if (kind === 'toggle') {
        on = !!prefs[b._key];
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      } else {
        b.removeAttribute('aria-pressed');
        if (kind === 'cycle-contrast') { on = prefs.contrast !== 'off'; valueLabel = on ? CONTRAST_LABEL[prefs.contrast] : ''; }
        if (kind === 'cycle-text') { on = prefs.textSize !== 100; valueLabel = on ? prefs.textSize + '%' : ''; }
        if (kind === 'cycle-line') { on = prefs.lineSpacing !== 'normal'; valueLabel = on ? LINE_LABEL[prefs.lineSpacing] : ''; }
        b.setAttribute('aria-label', b._label + (valueLabel ? ': ' + valueLabel : ''));
      }
      b.classList.toggle('is-on', on);
      b.innerHTML = '<span class="a11y-card-ic" aria-hidden="true">' + icon(b) + '</span>' +
        '<span class="a11y-card-tx">' + b._label + '</span>' +
        (valueLabel ? '<span class="a11y-card-val">' + valueLabel + '</span>' :
          (kind === 'toggle' && on ? '<span class="a11y-card-val">פועל</span>' : ''));
    }
  }

  function icon(b) {
    var k = b._key || b._kind;
    var map = {
      links: 'A', 'cycle-contrast': '◑', 'cycle-text': 'א+', 'cycle-line': '≡',
      readableFont: 'אב', headings: 'H', cursorBig: '➤', reduceMotion: '❚❚'
    };
    return map[k] || '•';
  }

  function announce(msg) { if (liveRegion) { liveRegion.textContent = ''; setTimeout(function () { liveRegion.textContent = msg; }, 30); } }

  function openPanel() {
    lastFocused = document.activeElement;
    panel.removeAttribute('hidden');
    trigger.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', outsideClick, true);
    var first = panel.querySelector('.a11y-close');
    if (first) first.focus();
  }
  function closePanel() {
    if (panel.hasAttribute('hidden')) return;
    panel.setAttribute('hidden', 'hidden');
    trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', outsideClick, true);
    if (lastFocused && lastFocused.focus) lastFocused.focus(); else trigger.focus();
  }
  function outsideClick(e) {
    if (!panel.contains(e.target) && e.target !== trigger && !trigger.contains(e.target)) closePanel();
  }
  function trapTab(e) {
    if (e.key !== 'Tab') return;
    var f = panel.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
})();
