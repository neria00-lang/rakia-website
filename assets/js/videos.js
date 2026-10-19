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
  var TAG_LABEL = { chanukah: 'חנוכה · בימים ההם', purim: 'פורים · הליצן משושן', jerusalem: 'ירושלים · חוזרים לירושלים', sadeh: 'שחקני שטח' };

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
    b.innerHTML =
      '<img src="' + thumb(o.id) + '" alt="" loading="lazy" decoding="async">' +
      '<span class="yt-play" aria-hidden="true"></span>' +
      (o.quote ? '<span class="yt-cap" aria-hidden="true"><q>' + esc(o.quote) + '</q><span class="yt-who">' + esc(o.who) + '</span></span>' : '');
    return b;
  }

  /* ---------- ניגון: מחליף את הכרטיס ב-iframe; רק סרטון אחד מתנגן בכל רגע ---------- */
  var playing = null;
  function stop(frameWrap){
    if(!frameWrap || !frameWrap._lite) return;
    frameWrap.parentNode.replaceChild(frameWrap._lite, frameWrap);
    if(playing === frameWrap) playing = null;
  }
  function play(btn){
    if(playing) stop(playing);
    var id = btn.dataset.yt;
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

  /* ---------- סרטון ראשי ---------- */
  document.querySelectorAll('[data-yt-feature]').forEach(function(el){
    var f = D.FEATURES[el.getAttribute('data-yt-feature')];
    if(f) el.appendChild(lite(f));
  });

  /* ---------- שורות המלצות ---------- */
  function rowItems(spec){
    if(spec === 'home-picks') return D.HOME_PICKS.map(function(id){ return byId[id]; }).filter(Boolean);
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
      el.appendChild(cell);
    });
    rows.push(el);
  });

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
        // המלצה נבחרת
        var pick = byId[D.SHOW_PICK[key]];
        if(mVideo){
          mVideo.textContent = '';
          mVideo.hidden = !pick;
          if(pick){
            var h = document.createElement('p');
            h.className = 'm-video-title';
            h.textContent = 'מה אומרים אחרי ההצגה';
            mVideo.appendChild(h);
            var cell = document.createElement('div');
            cell.className = 'yt-cell' + (pick.v ? ' v' : ' h');
            cell.appendChild(lite(pick));
            mVideo.appendChild(cell);
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
  document.querySelectorAll('[data-yt-open]').forEach(function(btn){
    var spec = btn.getAttribute('data-yt-open').split(':'); // trailer:chanukah | feature:home
    var o = spec[0] === 'trailer' ? D.TRAILERS[spec[1]] : D.FEATURES[spec[1]];
    if(!o){ btn.hidden = true; return; }
    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      openModal({ id: o.id, v: !!o.v, title: o.title });
    });
  });
})();
