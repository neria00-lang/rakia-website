// רקיע – חינוך יצירתי | סקריפט משותף

document.addEventListener('DOMContentLoaded', function(){

  /* helper משותף: מחזיר מחרוזת עם escaping ל-HTML (למניעת הזרקה דרך innerHTML) */
  function esc(s){
    var d = document.createElement('div');
    d.textContent = s == null ? '' : s;
    return d.innerHTML;
  }

  /* ---------- המלצות אקראיות: 3 מתוך המאגר המשותף בכל טעינת דף ---------- */
  var testiGrid = document.querySelector('.testi-grid');
  if(testiGrid && Array.isArray(window.TESTIMONIALS) && window.TESTIMONIALS.length){
    var pool = window.TESTIMONIALS.slice();
    // ערבוב Fisher-Yates
    for(var i = pool.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    var picked = pool.slice(0, Math.min(3, pool.length));
    testiGrid.innerHTML = picked.map(function(t){
      return '<div class="card"><div class="q">&#8220;</div>' +
        '<p>' + esc(t.quote) + '</p>' +
        '<div class="who"><span><b>' + esc(t.name) + '</b> · ' + esc(t.role) + '</span>' +
        '<span class="tag">' + esc(t.tag) + '</span></div></div>';
    }).join('');
  }

  /* ---------- נגישות מקלדת לאלמנטים לחיצים (div[role=button]) ---------- */
  document.querySelectorAll('[role="button"][tabindex]').forEach(function(el){
    el.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        el.click();
      }
    });
  });

  /* ---------- שם נגיש נקי לכרטיסיות לחיצות (במקום שרשור כל הטקסט הפנימי) ---------- */
  document.querySelectorAll('.show-card, .case-card').forEach(function(el){
    var t = el.dataset.title;
    if(t && !el.hasAttribute('aria-label')){
      el.setAttribute('aria-label', el.classList.contains('show-card')
        ? 'פרטים על ההצגה ' + t
        : 'צפייה בגלריה: ' + t);
    }
  });

  /* ---------- תפריט מובייל ---------- */
  var burger = document.querySelector('.hamburger');
  var nav = document.querySelector('.main-nav');
  if(burger && nav){
    var navScrim = document.createElement('div');
    navScrim.className = 'nav-scrim';
    navScrim.hidden = true;
    document.body.appendChild(navScrim);

    var openNav = function(){
      burger.classList.add('open');
      nav.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
      navScrim.hidden = false;
      var firstLink = nav.querySelector('a');
      if(firstLink) firstLink.focus();
    };
    var closeNav = function(returnFocus){
      burger.classList.remove('open');
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      navScrim.hidden = true;
      if(returnFocus) burger.focus();
    };
    burger.addEventListener('click', function(){
      nav.classList.contains('open') ? closeNav(false) : openNav();
    });
    navScrim.addEventListener('click', function(){ closeNav(true); });
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ closeNav(false); });
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && nav.classList.contains('open')) closeNav(true);
    });
  }

  /* ---------- וידאו-רילז: לחיצה על פוסטר -> הפעלה ---------- */
  document.querySelectorAll('.reel-box').forEach(function(box){
    box.addEventListener('click', function(){
      var video = box.querySelector('video');
      var poster = box.querySelector('img');
      var play = box.querySelector('.play');
      if(!video) return;
      video.style.display = 'block';
      if(poster) poster.style.display = 'none';
      if(play) play.style.display = 'none';
      video.controls = true;
      video.play();
    });
  });

  /* ---------- אקורדיון שאלות נפוצות ---------- */
  document.querySelectorAll('.faq-item').forEach(function(item, idx){
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if(!q || !a) return;
    var aid = 'faq-a-' + (idx + 1);
    a.id = a.id || aid;
    a.setAttribute('role', 'region');
    q.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
    q.setAttribute('aria-controls', a.id);
    q.addEventListener('click', function(){
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(other){
        if(other !== item){
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
          var oq = other.querySelector('.faq-q');
          if(oq) oq.setAttribute('aria-expanded', 'false');
        }
      });
      if(isOpen){ item.classList.remove('open'); a.style.maxHeight = null; q.setAttribute('aria-expanded', 'false'); }
      else{ item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; q.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- ניהול פוקוס משותף למודאלים (מודאל הצגה + לייטבוקס) ---------- */
  function trapFocus(container, e){
    if(e.key !== 'Tab') return;
    var f = container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
    f = Array.prototype.filter.call(f, function(el){ return el.offsetParent !== null; });
    if(!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }
  var lastModalFocus = null;

  /* ---------- קטלוג הצגות: מודאל פרטים ---------- */
  var overlay = document.getElementById('showModal');
  if(overlay){
    var mImg = overlay.querySelector('.m-img');
    var mHoliday = overlay.querySelector('.m-holiday');
    var mTitle = overlay.querySelector('.m-title');
    var mMeta = overlay.querySelector('.m-meta');
    var mDesc = overlay.querySelector('.m-desc');
    var mStrip = overlay.querySelector('.m-strip');
    var mWa = overlay.querySelector('.m-wa');

    document.querySelectorAll('.show-card').forEach(function(card){
      card.addEventListener('click', function(){
        var d = card.dataset;
        mImg.src = d.img; mImg.alt = d.title || '';
        mHoliday.textContent = d.holiday;
        mTitle.textContent = d.title;
        mMeta.innerHTML =
          '<span>&#128100; ' + esc(d.cast) + '</span>' +
          '<span>&#127775; ' + esc(d.ages) + '</span>' +
          '<span>&#9200; ' + esc(d.duration) + '</span>';
        mDesc.textContent = d.desc;
        mStrip.textContent = '';
        (d.gallery || '').split('|').filter(Boolean).forEach(function(src){
          var img = document.createElement('img');
          img.src = src;
          img.alt = d.title || '';
          mStrip.appendChild(img);
        });
        var msg = encodeURIComponent('שלום נריה, מתעניין/ת בהצגה "' + d.title + '" מסדרת הגיע הזמן. נשמח לשמוע פרטים והצעת מחיר.');
        mWa.href = 'https://wa.me/972526154838?text=' + msg;
        lastModalFocus = card;
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        var closeBtn = overlay.querySelector('.modal-close');
        if(closeBtn) closeBtn.focus();
      });
    });
    var closeModal = function(){
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      if(lastModalFocus && lastModalFocus.focus){ lastModalFocus.focus(); lastModalFocus = null; }
    };
    overlay.addEventListener('click', function(e){
      if(e.target === overlay || e.target.closest('.modal-close')) closeModal();
    });
    overlay.addEventListener('keydown', function(e){ trapFocus(overlay, e); });
  }

  /* ---------- קטלוג הצגות: סינון לפי חג ---------- */
  var filterBar = document.querySelector('.filter-bar');
  if(filterBar){
    filterBar.setAttribute('role', 'group');
    filterBar.setAttribute('aria-label', 'סינון הצגות לפי חג');
    filterBar.querySelectorAll('button').forEach(function(b){
      b.setAttribute('aria-pressed', b.classList.contains('active') ? 'true' : 'false');
    });
    filterBar.addEventListener('click', function(e){
      var btn = e.target.closest('button');
      if(!btn) return;
      filterBar.querySelectorAll('button').forEach(function(b){
        b.classList.remove('active'); b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      var f = btn.dataset.filter;
      var shown = 0;
      document.querySelectorAll('.show-card').forEach(function(card){
        var vis = (f === 'all' || card.dataset.holidayKey === f);
        card.style.display = vis ? '' : 'none';
        if(vis) shown++;
      });
      var live = document.getElementById('catalog-live');
      if(live) live.textContent = shown === 1 ? 'מוצגת הצגה אחת' : ('מוצגות ' + shown + ' הצגות');
    });
  }

  /* ---------- שחקני שטח: לייטבוקס פורטפוליו ---------- */
  var lb = document.getElementById('lightbox');
  if(lb){
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('.lb-cap');
    var currentSet = [];
    var currentIdx = 0;

    function openLightbox(set, idx){
      currentSet = set; currentIdx = idx;
      show();
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      var c = lb.querySelector('.lb-close');
      if(c) c.focus();
    }
    function show(){
      var item = currentSet[currentIdx];
      lbImg.src = item.src;
      lbCap.textContent = item.cap || '';
    }
    document.querySelectorAll('.case-card').forEach(function(card){
      card.addEventListener('click', function(){
        var imgs = (card.dataset.images || card.dataset.img).split('|').filter(Boolean);
        var cap = card.dataset.title || '';
        var set = imgs.map(function(src){ return {src: src, cap: cap}; });
        lastModalFocus = card;
        openLightbox(set, 0);
      });
    });
    lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
    lb.addEventListener('click', function(e){ if(e.target === lb) closeLightbox(); });
    lb.addEventListener('keydown', function(e){ trapFocus(lb, e); });
    lb.querySelector('.lb-next').addEventListener('click', function(){ currentIdx = (currentIdx+1) % currentSet.length; show(); });
    lb.querySelector('.lb-prev').addEventListener('click', function(){ currentIdx = (currentIdx-1+currentSet.length) % currentSet.length; show(); });
    function closeLightbox(){
      lb.classList.remove('open'); document.body.style.overflow='';
      if(lastModalFocus && lastModalFocus.focus){ lastModalFocus.focus(); lastModalFocus = null; }
    }
  }

  /* ---------- סגירה במקש Escape (מודאל + לייטבוקס) ---------- */
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Escape') return;
    var openOverlay = document.querySelector('.modal-overlay.open');
    var openLb = document.querySelector('.lightbox.open');
    if(openOverlay || openLb){
      if(openOverlay) openOverlay.classList.remove('open');
      if(openLb) openLb.classList.remove('open');
      document.body.style.overflow = '';
      if(lastModalFocus && lastModalFocus.focus){ lastModalFocus.focus(); lastModalFocus = null; }
    }
  });

  /* ---------- טופס בקשת הצעת מחיר -> וואטסאפ ---------- */
  var quoteForm = document.getElementById('quoteForm');
  if(quoteForm){
    var formStatus = document.createElement('p');
    formStatus.className = 'form-status';
    formStatus.setAttribute('role', 'status');
    formStatus.setAttribute('aria-live', 'polite');
    formStatus.hidden = true;
    quoteForm.appendChild(formStatus);

    var setStatus = function(msg, isError){
      formStatus.textContent = msg;
      formStatus.classList.toggle('is-error', !!isError);
      formStatus.hidden = false;
    };

    quoteForm.addEventListener('submit', function(e){
      e.preventDefault();
      var fd = new FormData(quoteForm);
      var name = (fd.get('name') || '').toString().trim();
      if(!name){
        setStatus('נא למלא שם מלא כדי שנוכל לחזור אליכם.', true);
        var nameField = quoteForm.querySelector('#q-name');
        if(nameField){ nameField.setAttribute('aria-invalid', 'true'); nameField.focus(); }
        return;
      }
      var nf = quoteForm.querySelector('#q-name');
      if(nf) nf.removeAttribute('aria-invalid');
      var org = fd.get('org') || '';
      var type = fd.get('type') || '';
      var date = fd.get('date') || '';
      var msg = fd.get('msg') || '';
      var text = 'שלום נריה, שמי ' + name +
        (org ? ' מ-' + org : '') +
        '.\nמתעניין/ת ב: ' + type +
        (date ? '\nמועד משוער: ' + date : '') +
        (msg ? '\n' + msg : '');
      var win = window.open('https://wa.me/972526154838?text=' + encodeURIComponent(text), '_blank', 'noopener');
      if(win){
        setStatus('נפתח חלון וואטסאפ עם הפרטים שמילאתם — צריך רק ללחוץ "שליחה". אם החלון לא נפתח, אפשר להתקשר 052-6154838.', false);
      } else {
        setStatus('הדפדפן חסם את פתיחת וואטסאפ. אפשר לכתוב ישירות למספר 052-6154838 או לאפשר חלונות קופצים ולנסות שוב.', true);
      }
    });
  }

});
