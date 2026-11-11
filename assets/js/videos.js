// רקיע – סרטוני יוטיוב "קלים": מוצגת רק תמונה + כפתור ניגון, ויוטיוב עצמו נטען רק בלחיצה
// (32 iframes של יוטיוב היו מכבידים מאוד על העמוד). הנתונים ב-videos-data.js.
//
// נקודות עגינה ב-HTML:
//   <div data-yt-feature="home">            סרטון בודד גדול (FEATURES[key])
//   <div data-yt-row="sadeh">                שורת המלצות לפי תג (אפשר כמה: "chanukah,purim,jerusalem")
//   <div data-yt-row="home-picks">           ההמלצות הנבחרות לדף הבית (HOME_PICKS)
//   <div data-yt-trailer>                    טריילר שמתחלף לפי כפתורי הסינון (עמוד "הגיע הזמן")
//   <button data-yt-open="trailer:chanukah">  כפתור שפותח סרטון בחלון
//   מודאל ההצגות (#showModal): .m-trailer + .m-video ממולאים לפי ההצגה שנפתחה.
(function(){
  var D = window.RAKIA_VIDEOS;
  if(!D) return;
  var byId = {};
  D.ITEMS.forEach(function(it){ byId[it.id] = it; });
  var TAG_LABEL = { chanukah: 'חנוכה · בימים ההם', purim: 'פורים · הליצן משושן', jerusalem: 'ירושלים · חוזרים לירושלים', sigd: 'סיגד · המסע לירושלים', sadeh: 'שחקני שטח' };

  function esc(s){ var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
  function thumb(id){ return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'; }

  /* ---------- כרטיס סרטון (לפני ניגון) ---------- */
  function lite(o){
    // o: {id, v, title, who, quote, sub, tag}
    var label = o.title || ((o.who || '') + (o.quote ? ': ' + o.quote : ''));
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'yt-lite' + (o.v ? ' v' : ' h');
    b.dataset.yt = o.id;
    b.setAttribute('aria-label', 'ניגון סרטון: ' + label);
    // embed:false = יוטיוב לא מאפשר לנגן את הסרטון בתוך אתר ("שגיאה בהגדרות של נגן הווידאו") —
    // פותחים אותו ישירות ביוטיוב במקום להציג שגיאה
    if(o.embed === false){
      b.dataset.noembed = '1';
      b.setAttribute('aria-label', 'צפייה ביוטיוב (נפתח בכרטיסייה חדשה): ' + label);
    }
    // הציטוט כבר כתוב בתמונה של הסרטון עצמו — לא מכפילים אותו בפס כהה מעל הפנים.
    // שם הדובר מופיע מתחת לכרטיס (whoLine), הציטוט המלא נשאר ב-aria-label.
    b.innerHTML =
      '<img src="' + thumb(o.id) + '" alt="" loading="lazy" decoding="async">' +
      '<span class="yt-play" aria-hidden="true"></span>';
    return b;
  }
  function whoLine(it){
    if(!it.who) return null;
    var p = document.createElement('p');
    p.className = 'yt-who-below';
    p.setAttribute('aria-hidden', 'true'); // כבר נקרא בתוך aria-label של הכפתור
    p.textContent = it.who;
    return p;
  }

  /* ---------- ניגון: מחליף את הכרטיס ב-iframe; רק סרטון אחד מתנגן בכל רגע ---------- */
  var playing = null;
  function stop(frameWrap){
    if(!frameWrap || !frameWrap._lite) return;
    frameWrap.parentNode.replaceChild(frameWrap._lite, frameWrap);
    if(playing === frameWrap) playing = null;
  }
  function play(btn){
    var id = btn.dataset.yt;
    if(btn.dataset.noembed){
      window.open('https://www.youtube.com/watch?v=' + id, '_blank', 'noopener');
      return;
    }
    if(playing) stop(playing);
    var wrap = document.createElement('div');
    wrap.className = btn.className.replace('yt-lite', 'yt-frame');
    wrap.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
      '?autoplay=1&playsinline=1&rel=0&modestbranding=1" title="' + esc(btn.getAttribute('aria-label').replace('ניגון סרטון: ', '')) +
      '" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    wrap._lite = btn;
    btn.parentNode.replaceChild(wrap, btn);
    playing = wrap;
    var f = wrap.querySelector('iframe'); if(f) f.focus();
  }
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('.yt-lite');
    if(b){ e.preventDefault(); play(b); }
  });
  function stopAllIn(root){
    Array.prototype.slice.call(root.querySelectorAll('.yt-frame')).forEach(stop);
  }

  /* ---------- סרטון בודד לפי id (עמוד "תוכן חינמי"): <div data-yt-lite="ID" data-title="..."> ---------- */
  document.querySelectorAll('[data-yt-lite]').forEach(function(el){
    el.parentNode.replaceChild(lite({ id: el.getAttribute('data-yt-lite'), v: false, title: el.getAttribute('data-title') }), el);
  });

  /* ---------- סרטון ראשי ---------- */
  document.querySelectorAll('[data-yt-feature]').forEach(function(el){
    var f = D.FEATURES[el.getAttribute('data-yt-feature')];
    if(f) el.appendChild(lite(f));
  });

  /* ---------- שורות המלצות ---------- */
  function rowItems(spec){
    if(spec === 'home-picks'){
      // הנבחרות קודם, ואחריהן כל שאר ההמלצות האנכיות — לסירוגין בין ההצגות
      var first = D.HOME_PICKS.map(function(id){ return byId[id]; }).filter(Boolean);
      var groups = {}, order = [];
      D.ITEMS.forEach(function(it){
        if(!it.v || D.HOME_PICKS.indexOf(it.id) !== -1) return;
        if(!groups[it.tag]){ groups[it.tag] = []; order.push(it.tag); }
        groups[it.tag].push(it);
      });
      var mixed = [], left = true;
      while(left){
        left = false;
        order.forEach(function(t){ var it = groups[t].shift(); if(it){ mixed.push(it); left = true; } });
      }
      return first.concat(mixed);
    }
    var tags = spec.split(',');
    return D.ITEMS.filter(function(it){ return tags.indexOf(it.tag) !== -1; });
  }
  var rows = [];
  document.querySelectorAll('[data-yt-row]').forEach(function(el){
    var items = rowItems(el.getAttribute('data-yt-row'));
    var showTag = el.hasAttribute('data-yt-tags');
    items.forEach(function(it){
      var cell = document.createElement('div');
      cell.className = 'yt-cell' + (it.v ? ' v' : ' h');
      cell.dataset.tag = it.tag;
      if(showTag) cell.innerHTML = '<span class="yt-tag">' + esc(it.sub || TAG_LABEL[it.tag] || '') + '</span>';
      else if(it.sub) cell.innerHTML = '<span class="yt-tag">' + esc(it.sub) + '</span>';
      cell.appendChild(lite(it));
      var w = whoLine(it); if(w) cell.appendChild(w);
      el.appendChild(cell);
    });
    rows.push(el);
    setupMore(el);
    if(el.getAttribute('data-yt-row') === 'home-picks') carousel(el);
  });

  /* ---------- דף הבית: שורת המלצות נגללת עם חיצים ---------- */
  function carousel(row){
    row.classList.add('is-carousel');
    var box = document.createElement('div');
    box.className = 'yt-carousel';
    row.parentNode.insertBefore(box, row);
    box.appendChild(row);
    // RTL: ההמלצות הבאות נמצאות משמאל
    var next = document.createElement('button'), prev = document.createElement('button');
    next.type = prev.type = 'button';
    next.className = 'yt-arrow yt-next'; next.setAttribute('aria-label', 'להמלצות הבאות'); next.innerHTML = '&#8592;';
    prev.className = 'yt-arrow yt-prev'; prev.setAttribute('aria-label', 'להמלצות הקודמות'); prev.innerHTML = '&#8594;';
    box.appendChild(prev); box.appendChild(next);
    function step(){ return Math.max(200, row.clientWidth * 0.8); }
    next.addEventListener('click', function(){ row.scrollBy({ left: -step(), behavior: 'smooth' }); });
    prev.addEventListener('click', function(){ row.scrollBy({ left: step(), behavior: 'smooth' }); });
    function update(){
      var x = Math.abs(row.scrollLeft), max = row.scrollWidth - row.clientWidth;
      prev.disabled = x < 4;
      next.disabled = x > max - 4;
    }
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- "עוד המלצות": במחשב מציגים רק 2 שורות, והשאר בלחיצה ----------
     (בנייד השורה נגללת הצידה, אז שם הכל מוצג — ה-CSS מסתיר רק במחשב) */
  function cols(row){
    var t = getComputedStyle(row).gridTemplateColumns;
    return t && t !== 'none' ? t.split(' ').length : 4;
  }
  function applyLimit(row){
    if(!row._more) return;
    Array.prototype.forEach.call(row.querySelectorAll('.yt-cell[hidden]'), function(c){ c.classList.remove('is-extra'); });
    var cells = Array.prototype.filter.call(row.querySelectorAll('.yt-cell'), function(c){ return !c.hidden; });
    var max = cols(row) * 2, used = 0, extra = 0;
    cells.forEach(function(c){
      used += c.classList.contains('h') ? 2 : 1;
      var over = !row._expanded && used > max;
      c.classList.toggle('is-extra', over);
      if(over) extra++;
    });
    row._more.hidden = extra === 0;
    row._more.textContent = 'לעוד ' + extra + ' המלצות בווידאו';
  }
  function setupMore(row){
    if(row.getAttribute('data-yt-row') === 'home-picks') return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'yt-more btn-dark';
    row.parentNode.insertBefore(btn, row.nextSibling);
    row._more = btn;
    btn.addEventListener('click', function(){
      var first = row.querySelector('.yt-cell.is-extra');
      row._expanded = true; applyLimit(row);
      if(first){ var f = first.querySelector('.yt-lite'); if(f) f.focus({ preventScroll: true }); }
    });
    applyLimit(row);
  }
  var rt;
  window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ rows.forEach(applyLimit); }, 150); });

  /* ---------- טריילר שמתחלף לפי הסינון (עמוד "הגיע הזמן") ---------- */
  var trailerBox = document.querySelector('[data-yt-trailer]');
  function firstTrailer(){
    for(var k in D.TRAILERS){ if(D.TRAILERS[k]) return D.TRAILERS[k]; }
    return null;
  }
  function setTrailer(tag){
    if(!trailerBox) return;
    var t = tag ? D.TRAILERS[tag] : firstTrailer();
    var slot = trailerBox.querySelector('.yt-trailer-slot');
    stopAllIn(trailerBox);
    if(!t){ trailerBox.hidden = true; return; }
    trailerBox.hidden = false;
    if(slot.dataset.current === t.id) return;
    slot.textContent = '';
    slot.appendChild(lite({ id: t.id, v: false, title: t.title }));
    slot.dataset.current = t.id;
    var cap = trailerBox.querySelector('.yt-trailer-title');
    if(cap) cap.textContent = t.title;
  }
  setTrailer(null);

  /* ---------- חיבור לכפתורי סינון החגים ---------- */
  var filterBar = document.querySelector('.filter-bar');
  if(filterBar){
    filterBar.addEventListener('click', function(e){
      var btn = e.target.closest('button'); if(!btn) return;
      var tag = D.FILTER_TAG[btn.dataset.filter];
      rows.forEach(function(row){
        if(!row.hasAttribute('data-yt-filtered')) return;
        stopAllIn(row);
        var shown = 0;
        Array.prototype.forEach.call(row.querySelectorAll('.yt-cell'), function(c){
          var vis = !tag || c.dataset.tag === tag;
          c.hidden = !vis; if(vis) shown++;
        });
        var empty = row.parentNode.querySelector('.yt-empty');
        if(empty) empty.hidden = shown > 0;
        row.scrollLeft = 0;
        row._expanded = false; applyLimit(row);
      });
      setTrailer(tag && tag !== 'none' ? tag : (tag === 'none' ? '__none__' : null));
    });
  }

  /* ---------- מודאל ההצגות: טריילר בראש + המלצה נבחרת ---------- */
  var overlay = document.getElementById('showModal');
  if(overlay){
    var mImg = overlay.querySelector('.m-img');
    var mTrailer = overlay.querySelector('.m-trailer');
    var mVideo = overlay.querySelector('.m-video');
    document.querySelectorAll('.show-card').forEach(function(card){
      card.addEventListener('click', function(){
        var key = card.dataset.holidayKey;
        stopAllIn(overlay);
        // טריילר במקום התמונה הראשית (אם קיים להצגה הזו)
        var tk = D.SHOW_TRAILER[key], t = tk && D.TRAILERS[tk];
        if(mTrailer){
          mTrailer.textContent = '';
          mTrailer.hidden = !t;
          if(t) mTrailer.appendChild(lite({ id: t.id, v: false, title: t.title }));
        }
        if(mImg) mImg.hidden = !!t;
        // כל ההמלצות של ההצגה (לפי התג שלה), הנבחרת (SHOW_PICK) ראשונה
        var tag = D.FILTER_TAG[key], pickId = D.SHOW_PICK[key];
        var list = D.ITEMS.filter(function(it){ return tag && it.tag === tag; });
        if(!list.length && byId[pickId]) list = [byId[pickId]];
        list.sort(function(a, b){ return (b.id === pickId) - (a.id === pickId); });
        if(mVideo){
          mVideo.textContent = '';
          mVideo.hidden = !list.length;
          if(list.length){
            var h = document.createElement('p');
            h.className = 'm-video-title';
            h.textContent = list.length > 1 ? 'מה אומרים אחרי ההצגה (' + list.length + ' המלצות)' : 'מה אומרים אחרי ההצגה';
            mVideo.appendChild(h);
            var grid = document.createElement('div');
            grid.className = 'm-video-row';
            list.forEach(function(it){
              var cell = document.createElement('div');
              cell.className = 'yt-cell' + (it.v ? ' v' : ' h');
              cell.appendChild(lite(it));
              var pw = whoLine(it); if(pw) cell.appendChild(pw);
              grid.appendChild(cell);
            });
            mVideo.appendChild(grid);
          }
        }
      });
    });
    // סגירת המודאל עוצרת את הסרטון
    new MutationObserver(function(){
      if(!overlay.classList.contains('open')) stopAllIn(overlay);
    }).observe(overlay, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---------- חלון סרטון (כפתור "צפו בטריילר") ---------- */
  var vm = null, vmReturn = null;
  function openModal(o){
    if(!vm){
      vm = document.createElement('div');
      vm.className = 'yt-modal';
      vm.setAttribute('role', 'dialog');
      vm.setAttribute('aria-modal', 'true');
      vm.setAttribute('aria-label', 'צפייה בסרטון');
      vm.innerHTML = '<div class="yt-modal-box"><button type="button" class="yt-modal-x" aria-label="סגירת הסרטון">&times;</button><div class="yt-modal-slot"></div></div>';
      document.body.appendChild(vm);
      vm.addEventListener('click', function(e){ if(e.target === vm || e.target.closest('.yt-modal-x')) closeModal(); });
      document.addEventListener('keydown', function(e){
        if(!vm.classList.contains('open')) return;
        if(e.key === 'Escape') closeModal();
        if(e.key === 'Tab'){ // מלכודת פוקוס: כפתור הסגירה + הנגן
          var f = vm.querySelectorAll('button, iframe'); var first = f[0], last = f[f.length - 1];
          if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
          else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
        }
      });
    }
    vmReturn = document.activeElement;
    var slot = vm.querySelector('.yt-modal-slot');
    slot.textContent = '';
    slot.className = 'yt-modal-slot' + (o.v ? ' v' : ' h');
    var b = lite(o);
    slot.appendChild(b);
    vm.classList.add('open');
    document.body.style.overflow = 'hidden';
    play(b);
  }
  function closeModal(){
    stopAllIn(vm);
    vm.classList.remove('open');
    document.body.style.overflow = '';
    if(vmReturn && vmReturn.focus) vmReturn.focus();
  }
  // trailer:chanukah | feature:home | video:<id מתוך ITEMS>; אפשר שרשרת חלופות עם "|"
  // (למשל "trailer:purim|video:xEmjz9ZpCW4" — כשיתווסף טריילר לפורים הוא יחליף את הסרטון לבד).
  // רכיב [data-yt-label] בתוך הכפתור מקבל "צפו בטריילר" / "צפו בסרטון" לפי מה שנמצא.
  function resolve(spec){
    var parts = spec.split('|');
    for(var i = 0; i < parts.length; i++){
      var s = parts[i].split(':'), o = null;
      if(s[0] === 'trailer') o = D.TRAILERS[s[1]];
      else if(s[0] === 'feature') o = D.FEATURES[s[1]];
      else if(s[0] === 'video' && byId[s[1]]){ var it = byId[s[1]]; o = { id: it.id, v: it.v, title: it.who + ': ' + it.quote }; }
      if(o) return { o: o, kind: s[0] };
    }
    return null;
  }
  document.querySelectorAll('[data-yt-open]').forEach(function(btn){
    var r = resolve(btn.getAttribute('data-yt-open'));
    if(!r){ btn.hidden = true; return; }
    var o = r.o;
    var lbl = btn.querySelector('[data-yt-label]');
    if(lbl) lbl.textContent = r.kind === 'trailer' ? 'צפו בטריילר' : 'צפו בסרטון';
    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      openModal({ id: o.id, v: !!o.v, title: o.title });
    });
  });
  // קרוסלת ההצגות בדף הבית: לחיצה על התמונה של כרטיס פותחת את אותו סרטון כמו הכפתור שלו
  document.querySelectorAll('.sc-box').forEach(function(box){
    var btn = box.querySelector('[data-yt-open]'), media = box.querySelector('.sc-media');
    if(!btn || !media || btn.hidden) return;
    media.style.cursor = 'pointer';
    media.addEventListener('click', function(){ btn.click(); });
  });
})();
