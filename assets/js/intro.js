/* פתיח וילון: וילון אדום נפתח, הלוגו מופיע גדול ועף למקומו בעמוד (.hero-logo).
   מוצג פעם אחת בכל ביקור (sessionStorage), לא לבוטים ולא למי שביקש "פחות תנועה".
   נטען בתחילת <body> של דף הבית בלבד. לחיצה / מקש מדלגים. */
(function () {
  try {
    var d = document, w = window, html = d.documentElement;
    if (/bot|crawl|spider|lighthouse|headless|preview|slurp|facebookexternalhit|whatsapp/i.test(navigator.userAgent)) return;
    if (w.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (/[?&]nointro\b/.test(location.search)) return;
    var force = /[?&]intro\b/.test(location.search);
    try { if (!force && sessionStorage.getItem('rk-intro')) return; sessionStorage.setItem('rk-intro', '1'); } catch (e) { if (!force) return; }
    if (!d.body || !Element.prototype.animate) return;

    var css = '' +
      '#rk-intro{position:fixed;inset:0;z-index:2147483000;overflow:hidden;pointer-events:auto;cursor:pointer}' +
      '#rk-intro .bg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,#fffdf6 0%,#f6efdc 70%,#eadfc4 100%)}' +
      '#rk-intro .c{position:absolute;top:0;bottom:0;width:51%;' +
        'background:linear-gradient(to bottom,rgba(0,0,0,.35),rgba(0,0,0,0) 18%,rgba(0,0,0,0) 78%,rgba(0,0,0,.45)),' +
        'repeating-linear-gradient(90deg,#5e070d 0,#8f0f18 2.2%,#c41e28 4.4%,#e0343d 5.4%,#b3161f 7%,#7a0b12 9.5%,#5e070d 11%);' +
        'will-change:transform}' +
      '#rk-intro .c.l{left:0;box-shadow:inset -14px 0 18px -8px rgba(0,0,0,.55)}' +
      '#rk-intro .c.r{right:0;box-shadow:inset 14px 0 18px -8px rgba(0,0,0,.55)}' +
      '#rk-intro .c.l::after,#rk-intro .c.r::after{content:"";position:absolute;top:0;bottom:0;width:6px;background:linear-gradient(90deg,#b8862b,#f3d27a,#b8862b)}' +
      '#rk-intro .c.l::after{right:0}#rk-intro .c.r::after{left:0}' +
      '#rk-intro .v{position:absolute;left:0;right:0;top:0;height:11vh;min-height:56px;z-index:2;' +
        'background:repeating-linear-gradient(90deg,#6e0a10 0,#a3141d 3%,#cf2a33 4.5%,#8a0e16 7%,#6e0a10 9%);' +
        'border-bottom:6px solid #d9ad4f;box-shadow:0 8px 18px rgba(0,0,0,.35)}' +
      '#rk-intro .v::after{content:"";position:absolute;left:0;right:0;bottom:-22px;height:16px;' +
        'background:radial-gradient(circle at 50% 0,#9c121b 0 11px,transparent 12px) 0 0/34px 16px repeat-x}' +
      '#rk-intro img{position:absolute;left:50%;top:50%;width:min(72vw,520px,60vh);height:auto;transform:translate(-50%,-50%);transform-origin:50% 50%;z-index:1;opacity:0;will-change:transform,opacity}' +
      'html.rk-intro-on .hero-logo{opacity:0!important}' +
      'html.rk-intro-on{overflow:hidden}';
    var st = d.createElement('style'); st.textContent = css; d.head.appendChild(st);

    var o = d.createElement('div'); o.id = 'rk-intro'; o.setAttribute('aria-hidden', 'true');
    var SRC = 'media/logo-hero.png?v=3';
    o.innerHTML = '<div class="bg"></div><img src="' + SRC + '" alt=""><div class="c l"></div><div class="c r"></div><div class="v"></div>';
    d.body.insertBefore(o, d.body.firstChild);
    html.classList.add('rk-intro-on');

    var L = o.querySelector('.c.l'), R = o.querySelector('.c.r'), V = o.querySelector('.v'),
        BG = o.querySelector('.bg'), IMG = o.querySelector('img'), done = false, anims = [];
    var ease = 'cubic-bezier(.7,0,.25,1)';
    function A(el, k, opt) { var a = el.animate(k, opt); anims.push(a); return a; }

    function finish() {
      if (done) return; done = true;
      anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
      html.classList.remove('rk-intro-on');
      if (o.parentNode) o.parentNode.removeChild(o);
      if (st.parentNode) st.parentNode.removeChild(st);
    }
    o.addEventListener('click', finish);
    d.addEventListener('keydown', finish, { once: true });
    setTimeout(finish, 4500);

    var started = false;
    function start() {
      if (done || started) return; started = true;
      // 1. הווילון נפתח לצדדים
      A(L, [{ transform: 'translateX(0)' }, { transform: 'translateX(-102%)' }], { duration: 900, delay: 250, easing: ease, fill: 'forwards' });
      A(R, [{ transform: 'translateX(0)' }, { transform: 'translateX(102%)' }], { duration: 900, delay: 250, easing: ease, fill: 'forwards' });
      // 2. הלוגו מופיע גדול
      A(IMG, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.82)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }],
        { duration: 650, delay: 550, easing: 'cubic-bezier(.2,.9,.3,1.15)', fill: 'forwards' });
      // 3. הלוגו עף למקום שלו בכותרת, והאתר מופיע מסביב
      setTimeout(function () {
        if (done) return;
        var t = d.querySelector('.hero-logo') || d.querySelector('header .logo img'), r0 = IMG.getBoundingClientRect();
        var k = [{ opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }];
        if (t) {
          var r1 = t.getBoundingClientRect();
          if (r1.width > 0) {
            var dx = (r1.left + r1.width / 2) - (r0.left + r0.width / 2),
                dy = (r1.top + r1.height / 2) - (r0.top + r0.height / 2), s = r1.width / r0.width;
            k.push({ opacity: 1, transform: 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px)) scale(' + s + ')' });
          }
        }
        if (k.length < 2) k.push({ opacity: 0, transform: 'translate(-50%,-50%) scale(.4)' });
        A(IMG, k, { duration: 750, easing: 'cubic-bezier(.65,0,.3,1)', fill: 'forwards' }).onfinish = finish;
        A(BG, [{ opacity: 1 }, { opacity: 0 }], { duration: 600, delay: 150, easing: 'ease-out', fill: 'forwards' });
        A(V, [{ transform: 'translateY(0)' }, { transform: 'translateY(-130%)' }], { duration: 500, easing: ease, fill: 'forwards' });
      }, 1500);
    }
    if (IMG.complete) start(); else { IMG.onload = start; IMG.onerror = finish; setTimeout(start, 600); }
  } catch (e) {
    try { document.documentElement.classList.remove('rk-intro-on'); } catch (_) {}
  }
})();
