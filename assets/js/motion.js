// רקיע – תנועה בגלילה. העיצוב ב-assets/css/motion.css.
//   1. פס התקדמות בראש העמוד (כל העמודים)
//   2. פס רץ עם שמות המוסדות — מאיץ ונמתח בגלילה מהירה (.rk-ticker)
//   3. "ההצגות שלנו" — גלילה אופקית ננעלת עם קרוסלה מסתובבת (.showcase)
//   4. הציפור מהלוגו עפה לאורך העמוד ונוחתת על טופס הפנייה (.hero-logo)
// הפחתת תנועה (הגדרת מערכת או "עצירת אנימציות" בתפריט הנגישות): הציפור נשארת בלוגו,
// הקרוסלה הופכת לשורה שגוללים בה ביד, והפס הרץ עוצר. אפשר להחליף מצב בלי לרענן את הדף.
(function(){
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function calm(){ return (mq && mq.matches) || root.classList.contains('a11y-reduce-motion'); }
  function clamp(v, a, b){ return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t){ return a + (b - a) * t; }
  function smooth(t){ return t * t * (3 - 2 * t); }
  function docTop(el){ var y = 0; while(el){ y += el.offsetTop; el = el.offsetParent; } return y; }
  function docLeft(el){ var x = 0; while(el){ x += el.offsetLeft; el = el.offsetParent; } return x; }
  var header = document.querySelector('header');
  function hdr(){ return header ? header.offsetHeight : 0; }

  /* ================= 1. פס התקדמות ================= */
  var bar = document.createElement('div');
  bar.className = 'rk-progress';
  bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<span></span>';
  document.body.appendChild(bar);
  var barFill = bar.firstChild, maxScroll = 1;

  /* ================= 2. פס רץ ================= */
  var ticker = document.querySelector('.rk-ticker');
  var tTrack = null, tSet = 0, tX = 0, tVisible = true, tLastSkew = null;
  if(ticker){
    tTrack = ticker.querySelector('.rk-ticker-track');
    var tUnit = tTrack.innerHTML;
    // משכפלים את הרשימה עד שהיא מכסה פעמיים את רוחב המסך — כך הלולאה רציפה
    var fillTicker = function(){
      tTrack.innerHTML = tUnit;
      var one = tTrack.scrollWidth || 1, n = Math.max(2, Math.ceil(window.innerWidth * 2 / one) + 1);
      var html = ''; for(var i = 0; i < n; i++) html += tUnit;
      tTrack.innerHTML = html;
      tSet = one;
    };
    fillTicker();
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(fillTicker);
    window.addEventListener('resize', fillTicker);
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ tVisible = es[0].isIntersecting; }).observe(ticker);
    }
  }

  /* ================= 3. ההצגות שלנו — גלילה אופקית ננעלת ================= */
  var sc = document.querySelector('.showcase');
  var S = null;
  if(sc){
    S = {
      sticky: sc.querySelector('.sc-sticky'),
      viewport: sc.querySelector('.sc-viewport'),
      track: sc.querySelector('.sc-track'),
      cards: Array.prototype.slice.call(sc.querySelectorAll('.sc-card')),
      now: sc.querySelector('.sc-now'),
      fill: sc.querySelector('.sc-rail-fill'),
      rail: sc.querySelector('.sc-rail'),
      on: false, dist: 0, start: 0, len: 1, centers: [], first: 0, vw: 0, lastP: -1, lastNow: -1
    };
    // מקלדת: כרטיס שמקבל פוקוס מחוץ למסך — גוללים אליו
    sc.addEventListener('focusin', function(e){
      if(!S.on) return;
      var card = e.target.closest('.sc-card'); if(!card) return;
      // הדפדפן "עוזר" וגולל הצידה את המכל הנעול כדי להראות את הכרטיס — מבטלים, המסילה עושה את זה
      var unscroll = function(){ S.sticky.scrollLeft = 0; S.viewport.scrollLeft = 0; };
      unscroll(); requestAnimationFrame(unscroll);
      var i = S.cards.indexOf(card);
      var p = S.dist ? clamp((S.first - S.centers[i]) / S.dist, 0, 1) : 0;
      window.scrollTo({ top: S.start + p * S.len, behavior: 'instant' });
    });
  }
  function measureShowcase(){
    if(!S) return;
    var on = !calm();
    sc.classList.toggle('is-pinned', on);
    S.on = on;
    S.track.style.transform = '';
    S.cards.forEach(function(c){ c.style.transform = ''; });
    S.cards.forEach(function(c){ c.style.opacity = ''; });
    if(!on){ sc.style.height = ''; S.track.style.paddingInline = ''; return; }
    var vw = S.viewport.clientWidth;
    S.vw = vw;
    // ריפוד כך שהכרטיס הראשון והאחרון נעצרים במרכז המסך
    S.track.style.paddingInline = Math.max(0, (vw - S.cards[0].offsetWidth) / 2) + 'px';
    // מרכזי הכרטיסים כשהמסילה במנוחה, ביחס למסך (מימין לשמאל, כמו בעברית)
    var base = S.track.offsetLeft;
    S.centers = S.cards.map(function(c){ return base + c.offsetLeft + c.offsetWidth / 2; });
    S.first = S.centers[0];
    S.dist = Math.max(0, S.first - S.centers[S.centers.length - 1]);
    sc.style.setProperty('--hdr', hdr() + 'px');
    var stickyH = S.sticky.offsetHeight;
    // פיקסל גלילה ≈ 1.15 פיקסל תנועה אופקית
    S.len = Math.max(1, S.dist * 1.15);
    sc.style.height = (stickyH + S.len) + 'px';
    S.start = docTop(sc) - hdr();
    S.lastP = -1;
  }
  function paintShowcase(y, vel){
    if(!S || !S.on) return;
    var p = clamp((y - S.start) / S.len, 0, 1);
    var moving = Math.abs(vel) > 0.05;
    if(p === S.lastP && !moving) return;
    S.lastP = p;
    var tx = p * S.dist;
    S.track.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,0,0)';
    if(S.fill) S.fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    // קרוסלה: הכרטיס שבמרכז ישר, השכנים מסתובבים ונדחקים לעומק
    var mid = S.vw / 2, best = 0, bestD = 1e9;
    var sk = clamp(vel * 0.12, -5, 5);
    S.cards.forEach(function(c, i){
      var d = (S.centers[i] + tx - mid) / S.vw;
      var ad = Math.abs(d);
      if(ad < bestD){ bestD = ad; best = i; }
      var cl = clamp(d, -1, 1);
      c.style.transform = 'rotateY(' + (cl * 34).toFixed(2) + 'deg) translateZ(' + (-Math.abs(cl) * 190).toFixed(1) +
        'px) skewX(' + sk.toFixed(2) + 'deg)';
      c.style.opacity = (1 - Math.min(0.45, Math.abs(cl) * 0.5)).toFixed(3);
    });
    if(best !== S.lastNow){
      S.lastNow = best;
      S.cards.forEach(function(c, i){ c.classList.toggle('is-center', i === best); });
      if(S.now) S.now.textContent = String(best + 1).padStart(2, '0');
    }
  }

  /* ================= 4. הציפור עפה ================= */
  var logo = document.querySelector('.hero-logo');
  var B = null;
  // מיקום הציפור בתוך קובץ הלוגו (logo-hero.png 767×510; הציפור על בד של 406×373)
  var IN_LOGO = { x: 361 / 767, y: -13 / 510, w: 406 / 767 };
  // ובלוגו שבתחתית (logo-footer.png 782×781, ריבועי — y מחושב לפי הרוחב)
  var IN_FOOT = { x: 376 / 782, y: 166 / 782, w: 406 / 782 };
  var BIRD_RATIO = 373 / 406, BASE_W = 160;
  var FEATHERS = ['#35d4a5', '#1ba6d6', '#2a3be0', '#9b3fd1', '#ff5a4a', '#f6b31b'];

  function buildBird(){
    var el = document.createElement('div');
    el.className = 'rk-bird';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="rk-bird-bank"><div class="rk-bird-turn">' +
      '<img class="wl" src="/media/bird/wing-low.webp?v=3" alt="" decoding="async">' +
      '<img class="bd" src="/media/bird/body.webp?v=3" alt="" decoding="async">' +
      '<img class="wu" src="/media/bird/wing-up.webp?v=3" alt="" decoding="async">' +
      '</div></div>';
    document.body.appendChild(el);
    var feathers = [];
    for(var i = 0; i < 12; i++){
      var f = document.createElement('span');
      f.className = 'rk-feather';
      f.setAttribute('aria-hidden', 'true');
      f.style.background = FEATHERS[i % FEATHERS.length];
      document.body.appendChild(f);
      feathers.push({ el: f, life: 0 });
    }
    return {
      el: el, bank: el.firstChild, turn: el.firstChild.firstChild,
      wu: el.querySelector('.wu'), wl: el.querySelector('.wl'), bd: el.querySelector('.bd'),
      feathers: feathers, fi: 0, emitAcc: 0,
      x: 0, y: 0, w: 0, vx: 0, vy: 0, rot: 0, face: 0, phase: 0, energy: 0,
      anchors: [], ready: false, flying: false, twitch: 0
    };
  }

  // נקודות עגינה: לכל נקודה — מיקום גלילה, ופונקציה שמחזירה {x, y, w, rest} במסך
  function measureBird(){
    if(!B) return;
    var vw = window.innerWidth, vh = window.innerHeight, H = hdr();
    var narrow = vw < 920;
    var fw = narrow ? 52 : clamp(vw * 0.062, 70, 104);
    var logoTop = docTop(logo), logoLeft = docLeft(logo);
    var A = [];
    var add = function(at, fn, walk){ A.push({ at: at, fn: fn, walk: !!walk }); };
    var side = function(fx, fy){ return function(){ return { x: vw * fx, y: H + (vh - H) * fy, w: fw }; }; };
    var sec = function(sel){ var e = document.querySelector(sel); return e ? docTop(e) : null; };

    // 0. בתוך הלוגו (זז יחד עם הדף)
    add(0, function(y){
      var lw = logo.offsetWidth, lh = logo.offsetHeight, w = lw * IN_LOGO.w;
      return { x: logoLeft + lw * IN_LOGO.x + w / 2, y: logoTop - y + lh * IN_LOGO.y + w * BIRD_RATIO / 2, w: w, rest: true };
    });
    // מובייל: אין שוליים פנויים ליד הטקסט — הציפור "נחה" בתוך פס הכותרת העליון, ברווח שבין
    // כפתור התפריט ללוגו, ולא מעל התוכן. perch(0) / perch(1) = שתי נקודות קרובות באותו רווח.
    var perch = function(k){
      return function(){
        var hb = document.querySelector('.hamburger'), lg = document.querySelector('header .logo');
        var l = hb ? hb.getBoundingClientRect().right : 56, r = lg ? lg.getBoundingClientRect().left : vw * 0.5;
        var gap = Math.max(40, r - l), w = Math.min(44, gap * 0.45);
        return { x: l + gap * (k ? 0.68 : 0.32), y: H / 2, w: w, inHeader: true };
      };
    };
    if(narrow){
      var c = sec('#cats'); if(c != null) add(Math.max(140, c - vh * 0.75), perch(0));
    } else {
      var t1 = sec('#cats'); if(t1 != null) add(t1 - vh * 0.55, side(0.045, 0.2));
    }
    // ההצגות שלנו: הציפור "הולכת" על פס ההתקדמות מתחת לכרטיסים (במחשב בלבד — בנייד הכרטיסים צמודים לפס)
    if(!narrow && S && S.on && S.rail){
      // הציפור עומדת על הפס עצמו (מרכזה מעט מעליו) — לא עולה על הכפתורים שבתחתית הכרטיסים
      // (המיקום נמדד חי מהמסך — החישוב הקודם לפי offsetTop הציב אותה ~100px מעל הפס, על הכפתורים)
      var railY = function(){ var r = S.rail.getBoundingClientRect(); return r.top + r.height / 2 - fw * BIRD_RATIO * 0.3; };
      var railR = docLeft(S.rail) + S.rail.offsetWidth, railL = docLeft(S.rail);
      add(S.start, function(){ return { x: railR - fw * 0.3, y: railY(), w: fw }; }, true);
      add(S.start + S.len, function(){ return { x: railL + fw * 0.3, y: railY(), w: fw }; }, true);
    }
    // במחשב: x קרוב לקצה המסך (0.045 / 0.955) — מחוץ לעמודת הטקסט
    var plan = narrow ? [
      ['.fit', 0.6, 1], ['.reel', 0.6, 0], ['.gallery', 0.6, 1],
      ['#testi', 0.6, 0], ['.clients', 0.6, 1]
    ] : [
      ['.fit', 0.5, 0.045, 0.24], ['.reel', 0.5, 0.955, 0.3], ['.gallery', 0.5, 0.045, 0.26],
      ['#testi', 0.5, 0.955, 0.22], ['.clients', 0.55, 0.955, 0.15]
    ];
    plan.forEach(function(p){
      var t = sec(p[0]); if(t == null) return;
      add(t - vh * p[1], narrow ? perch(p[2]) : side(p[2], p[3]));
    });
    var maxS = Math.max(0, document.documentElement.scrollHeight - vh);
    // ריחוף בשוליים, משמאל לטופס הפנייה (לא מעליו — שם היא כיסתה את השדות). במחשב בלבד.
    var form = document.querySelector('.quote-form');
    if(form && !narrow){
      var fTop = docTop(form), fLeft = docLeft(form);
      add(Math.min(maxS - 260, fTop - vh * 0.45), function(y){
        return { x: Math.max(fw * 0.6, fLeft - fw * 0.65), y: Math.max(H + fw * 0.6, fTop - y + fw * 0.6), w: fw };
      });
    }
    // נחיתה: חוזרת הביתה — אל הציפור שבלוגו בתחתית העמוד (סוגרת מעגל עם הלוגו שבראש העמוד)
    var flogo = document.querySelector('.footer-logo');
    if(flogo){
      var flTop = docTop(flogo), flLeft = docLeft(flogo);
      add(maxS, function(y){
        var lw = flogo.offsetWidth, w = lw * IN_FOOT.w;
        return { x: flLeft + lw * IN_FOOT.x + w / 2, y: flTop - y + lw * IN_FOOT.y + w * BIRD_RATIO / 2, w: w, rest: true, perch: true };
      });
    }
    // מיון + מונוטוניות (אם עמוד קצר)
    for(var i = 1; i < A.length; i++) if(A[i].at <= A[i - 1].at) A[i].at = A[i - 1].at + 1;
    B.anchors = A;
    B.hdr = H;
  }

  function birdTarget(y){
    var A = B.anchors, i = 0;
    while(i < A.length - 2 && y >= A[i + 1].at) i++;
    if(A.length === 1) return A[0].fn(y);
    var a = A[i], b = A[i + 1];
    // הציפור מחכה בנקודת העגינה (בשוליים) ועפה רק בקטע הגלילה האחרון לפני הנקודה הבאה —
    // כך כמעט אף פעם היא לא "נתקעת" באמצע המסך מעל טקסט/כפתור כשמפסיקים לגלול.
    // (ההליכה על פס ההתקדמות של "ההצגות שלנו" — walk — נשארת רציפה לאורך כל הקטע.)
    var span = b.at - a.at;
    var fly = (a.walk && b.walk) ? span : Math.min(span, Math.max(220, window.innerHeight * 0.35));
    var t = clamp((y - (b.at - fly)) / fly, 0, 1);
    var e = smooth(t);
    var pa = a.fn(y), pb = b.fn(y);
    var dx = pb.x - pa.x, dy = pb.y - pa.y, dist = Math.sqrt(dx * dx + dy * dy);
    // מעוף בקשת: באמצע המעבר הציפור מתרוממת מעל הקו הישר
    // (בהליכה על הפס אין קשת — אחרת היא "קפצה" 140px למעלה, על הכפתורים של הכרטיסים)
    var arc = (a.walk && b.walk) ? 0 : Math.sin(Math.PI * e) * Math.min(140, dist * 0.28);
    return {
      x: lerp(pa.x, pb.x, e), y: lerp(pa.y, pb.y, e) - arc, w: lerp(pa.w, pb.w, e),
      rest: (t < 0.002 && pa.rest) || (t > 0.998 && pb.rest), perch: t > 0.998 && pb.perch,
      inHeader: !!(pa.inHeader || pb.inHeader)
    };
  }

  function emitFeather(){
    var f = B.feathers[B.fi++ % B.feathers.length];
    f.life = 1;
    f.x = B.x + (Math.random() - 0.5) * B.w * 0.4;
    f.y = B.y + (Math.random() - 0.2) * B.w * 0.3;
    f.vx = -B.vx * 0.15 + (Math.random() - 0.5) * 1.2;
    f.vy = -B.vy * 0.1 + 0.6 + Math.random() * 0.8;
    f.r = Math.random() * 360; f.vr = (Math.random() - 0.5) * 14;
    f.s = 0.6 + Math.random() * 0.8;
  }

  function paintBird(y, dt, now){
    var tg = birdTarget(y);
    // באוויר — לא נכנסת מתחת לפס הניווט העליון (גם כשהלוגו עצמו כבר גלל אל מתחתיו)
    // (חוץ ממנוחה בתוך פס הכותרת בנייד — שם היא מעל הכותרת, ראה perch ו-motion.css)
    if(y > 2 && !tg.perch && !tg.inHeader) tg.y = Math.max(tg.y, B.hdr + tg.w * BIRD_RATIO * 0.6);
    var k = tg.rest && (y < 2 || tg.perch) ? 1 - Math.exp(-dt * 14) : 1 - Math.exp(-dt * 5.5);
    if(!B.ready){ B.x = tg.x; B.y = tg.y; B.w = tg.w; B.ready = true; k = 1; }
    var nx = lerp(B.x, tg.x, k), ny = lerp(B.y, tg.y, k), nw = lerp(B.w, tg.w, k);
    // בלוגו: נצמדת בדיוק (בלי השהיה), כדי שהלוגו ייראה שלם
    if(y < 2 && tg.rest){ nx = tg.x; ny = tg.y; nw = tg.w; }
    var f = dt > 0 ? 1 / (dt * 60) : 1;
    B.vx = lerp(B.vx, (nx - B.x) * f, 0.25);
    B.vy = lerp(B.vy, (ny - B.y) * f, 0.25);
    B.x = nx; B.y = ny; B.w = nw;
    var speed = Math.sqrt(B.vx * B.vx + B.vy * B.vy);
    var atRest = tg.rest && speed < 0.6;

    // כיוון: הציפור מסתכלת שמאלה; כשהיא עפה ימינה — מסתובבת (סיבוב תלת-ממדי אמיתי)
    var faceTarget = atRest ? 0 : (B.vx > 2.5 ? 180 : B.vx < -2.5 ? 0 : B.faceTarget || 0);
    B.faceTarget = faceTarget;
    B.face = lerp(B.face, faceTarget, 1 - Math.exp(-dt * 7));
    var dir = Math.cos(B.face * Math.PI / 180); // 1 = שמאלה, -1 = ימינה
    // הטיה: מטה את האף לכיוון התנועה
    var rotT = atRest ? 0 : clamp(-B.vy * 2.2 * dir, -26, 26);
    B.rot = lerp(B.rot, rotT, 1 - Math.exp(-dt * 6));

    // כנפיים: בלוגו/בנחיתה — שקטות (עם רפרוף קטן מדי פעם); באוויר — מנפנפות לפי המהירות
    var eT = atRest ? 0 : Math.max(0.38, Math.min(1, speed / 7));
    B.energy = lerp(B.energy, eT, 1 - Math.exp(-dt * (eT > B.energy ? 8 : 3)));
    B.phase += dt * (5.5 + Math.min(9, speed * 0.9)) * (0.35 + B.energy);
    var flap = B.energy * (0.5 - 0.5 * Math.cos(B.phase));
    if(atRest){
      // "נשימה": רפרוף כנפיים קטן כל כמה שניות
      var cyc = (now / 1000) % 4.6;
      if(cyc < 0.55) flap = Math.max(flap, 0.32 * Math.sin(Math.PI * cyc / 0.55));
    }
    var bob = atRest ? 0 : Math.sin(B.phase) * B.w * 0.03 * B.energy + Math.sin(now / 520) * B.w * 0.02;

    var s = B.w / BASE_W;
    B.el.style.transform = 'translate3d(' + (B.x - BASE_W / 2).toFixed(1) + 'px,' + (B.y - BASE_W * BIRD_RATIO / 2 + bob).toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
    B.bank.style.transform = 'rotate(' + B.rot.toFixed(2) + 'deg)';
    B.turn.style.transform = 'rotateY(' + B.face.toFixed(2) + 'deg)';
    B.wu.style.transform = 'rotate3d(.248,.969,0,' + (flap * 74).toFixed(2) + 'deg) rotate(' + (-flap * 9).toFixed(2) + 'deg)';
    B.wl.style.transform = 'rotate3d(-.074,.997,0,' + (flap * -62).toFixed(2) + 'deg)';
    B.bd.style.transform = 'translateY(' + (flap * 2.5).toFixed(2) + '%)';
    var flying = !atRest || y > 2;
    if(flying !== B.flying){ B.flying = flying; B.el.classList.toggle('is-flying', flying); }

    // נוצות נייר צבעוניות כשהציפור טסה מהר
    B.emitAcc += speed > 9 ? dt * Math.min(18, speed * 0.6) : 0;
    while(B.emitAcc >= 1){ B.emitAcc -= 1; emitFeather(); }
    B.feathers.forEach(function(p){
      if(p.life <= 0){ if(p.shown){ p.el.style.opacity = '0'; p.shown = false; } return; }
      p.life -= dt * 1.1;
      p.x += p.vx * dt * 60; p.y += p.vy * dt * 60; p.vy += dt * 2; p.r += p.vr * dt * 60;
      p.el.style.transform = 'translate3d(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px,0) rotate(' + p.r.toFixed(1) + 'deg) scale(' + p.s.toFixed(2) + ')';
      p.el.style.opacity = Math.max(0, p.life).toFixed(2);
      p.shown = true;
    });
  }

  var logoSrc = logo ? logo.getAttribute('src') : null;
  var footLogo = document.querySelector('.footer-logo');
  var footSrc = footLogo ? footLogo.getAttribute('src') : null;
  function setBird(on){
    if(!logo) return;
    if(on && !B){
      B = buildBird();
      // הלוגואים בלי הציפור — הציפור המונפשת יושבת בדיוק במקומה
      var swap = function(){
        logo.src = logoSrc.replace('logo-hero.png', 'logo-hero-text.png');
        if(footLogo) footLogo.src = footSrc.replace('logo-footer.png', 'logo-footer-text.png');
      };
      var imgs = [B.wu, B.wl, B.bd], left = imgs.length;
      imgs.forEach(function(im){
        var done = function(){ if(--left === 0 && B){ B.el.classList.add('is-on'); swap(); } };
        if(im.complete) done(); else { im.onload = done; im.onerror = function(){ setBird(false); }; }
      });
      measureBird();
    } else if(!on && B){
      B.el.remove();
      B.feathers.forEach(function(f){ f.el.remove(); });
      B = null;
      logo.src = logoSrc;
      if(footLogo) footLogo.src = footSrc;
    }
  }

  /* ================= מדידה + לולאת ציור אחת ================= */
  function measure(){
    maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    measureShowcase();
    if(B) measureBird();
  }
  function applyMode(){
    var still = calm();
    if(ticker) ticker.classList.toggle('is-still', still);
    setBird(!still);
    measure();
    if(tTrack && still){ tX = 0; tTrack.style.transform = ''; }
  }

  var lastY = window.scrollY || 0, vel = 0, lastT = 0, lastBar = -1;
  function frame(now){
    var dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 1 / 60;
    lastT = now;
    var y = window.scrollY || window.pageYOffset || 0;
    var dy = y - lastY; lastY = y;
    vel = lerp(vel, dy, 0.12);

    var p = clamp(y / maxScroll, 0, 1);
    if(p !== lastBar){ lastBar = p; barFill.style.transform = 'scaleX(' + p.toFixed(4) + ')'; }

    if(!calm()){
      if(tTrack && tVisible && tSet){
        // בסיס: זז ימינה (כיוון הקריאה). גלילה מהירה מאיצה; גלילה למעלה הופכת כיוון לרגע
        var push = vel * 0.55;
        tX += (0.75 + Math.abs(push)) * (push < -0.4 ? -1 : 1) * dt * 60;
        tX = ((tX % tSet) + tSet) % tSet;
        var sk = clamp(-vel * 0.45, -14, 14);
        tTrack.style.transform = 'translate3d(' + (tX - tSet).toFixed(1) + 'px,0,0) skewX(' + sk.toFixed(2) + 'deg)';
        tLastSkew = sk;
      }
      paintShowcase(y, vel);
      if(B) paintBird(y, dt, now);
    }
    requestAnimationFrame(frame);
  }

  applyMode();
  if(mq){ if(mq.addEventListener) mq.addEventListener('change', applyMode); else if(mq.addListener) mq.addListener(applyMode); }
  // תפריט הנגישות מחליף מחלקה על <html>
  new MutationObserver(function(){ applyMode(); }).observe(root, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  // תמונות שנטענות משנות את גובה העמוד — מודדים מחדש
  if('ResizeObserver' in window){
    var rT = 0;
    new ResizeObserver(function(){ clearTimeout(rT); rT = setTimeout(measure, 120); }).observe(document.body);
  }
  requestAnimationFrame(frame);
})();
