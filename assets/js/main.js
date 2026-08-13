// רקיע – חינוך יצירתי | סקריפט משותף

document.addEventListener('DOMContentLoaded', function(){

  /* ---------- נגישות מקלדת לאלמנטים לחיצים (div[role=button]) ---------- */
  document.querySelectorAll('[role="button"][tabindex]').forEach(function(el){
    el.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        el.click();
      }
    });
  });

  /* ---------- תפריט מובייל ---------- */
  var burger = document.querySelector('.hamburger');
  var nav = document.querySelector('.main-nav');
  if(burger && nav){
    burger.addEventListener('click', function(){
      burger.classList.toggle('open');
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ burger.classList.remove('open'); nav.classList.remove('open'); });
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
  document.querySelectorAll('.faq-item').forEach(function(item){
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function(){
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(other){
        if(other !== item){ other.classList.remove('open'); other.querySelector('.faq-a').style.maxHeight = null; }
      });
      if(isOpen){ item.classList.remove('open'); a.style.maxHeight = null; }
      else{ item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });

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
        mImg.src = d.img; mImg.alt = d.title;
        mHoliday.textContent = d.holiday;
        mTitle.textContent = d.title;
        mMeta.innerHTML =
          '<span>&#128100; ' + d.cast + '</span>' +
          '<span>&#127775; ' + d.ages + '</span>' +
          '<span>&#9200; ' + d.duration + '</span>';
        mDesc.textContent = d.desc;
        mStrip.innerHTML = (d.gallery || '').split('|').filter(Boolean).map(function(src){
          return '<img src="' + src + '" alt="' + d.title + '">';
        }).join('');
        var msg = encodeURIComponent('שלום נריה, מתעניין/ת בהצגה "' + d.title + '" מסדרת הגיע הזמן. נשמח לשמוע פרטים והצעת מחיר.');
        mWa.href = 'https://wa.me/972526154838?text=' + msg;
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    overlay.addEventListener('click', function(e){
      if(e.target === overlay || e.target.closest('.modal-close')){
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---------- קטלוג הצגות: סינון לפי חג ---------- */
  var filterBar = document.querySelector('.filter-bar');
  if(filterBar){
    filterBar.addEventListener('click', function(e){
      var btn = e.target.closest('button');
      if(!btn) return;
      filterBar.querySelectorAll('button').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.dataset.filter;
      document.querySelectorAll('.show-card').forEach(function(card){
        card.style.display = (f === 'all' || card.dataset.holidayKey === f) ? '' : 'none';
      });
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
        openLightbox(set, 0);
      });
    });
    lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
    lb.addEventListener('click', function(e){ if(e.target === lb) closeLightbox(); });
    lb.querySelector('.lb-next').addEventListener('click', function(){ currentIdx = (currentIdx+1) % currentSet.length; show(); });
    lb.querySelector('.lb-prev').addEventListener('click', function(){ currentIdx = (currentIdx-1+currentSet.length) % currentSet.length; show(); });
    function closeLightbox(){ lb.classList.remove('open'); document.body.style.overflow=''; }
  }

  /* ---------- סגירה במקש Escape (מודאל + לייטבוקס) ---------- */
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Escape') return;
    var openOverlay = document.querySelector('.modal-overlay.open');
    if(openOverlay){ openOverlay.classList.remove('open'); document.body.style.overflow=''; }
    var openLb = document.querySelector('.lightbox.open');
    if(openLb){ openLb.classList.remove('open'); document.body.style.overflow=''; }
  });

  /* ---------- טופס בקשת הצעת מחיר -> וואטסאפ ---------- */
  var quoteForm = document.getElementById('quoteForm');
  if(quoteForm){
    quoteForm.addEventListener('submit', function(e){
      e.preventDefault();
      var fd = new FormData(quoteForm);
      var name = fd.get('name') || '';
      var org = fd.get('org') || '';
      var type = fd.get('type') || '';
      var date = fd.get('date') || '';
      var msg = fd.get('msg') || '';
      var text = 'שלום נריה, שמי ' + name +
        (org ? ' מ-' + org : '') +
        '.\nמתעניין/ת ב: ' + type +
        (date ? '\nמועד משוער: ' + date : '') +
        (msg ? '\n' + msg : '');
      window.open('https://wa.me/972526154838?text=' + encodeURIComponent(text), '_blank');
    });
  }

});
