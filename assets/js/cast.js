// רקיע – דמויות שחקני השטח: חשיפה בגלילה, פרלקסה בשורת השחקנים, בועות דיבור,
// וראש שמציץ מאחורי כפתור הוואטסאפ הצף. העיצוב ב-assets/css/cast.css.
(function(){
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function calm(){ return (mq && mq.matches) || root.classList.contains('a11y-reduce-motion'); }

  /* ---------- חשיפה כשהאלמנט נכנס למסך ---------- */
  var reveal = document.querySelectorAll('[data-cast-reveal]');
  if(!('IntersectionObserver' in window)){
    reveal.forEach(function(el){ el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -40px 0px' });
    reveal.forEach(function(el){ io.observe(el); });
  }

  /* ---------- שורת השחקנים: פרלקסה + בועות דיבור ---------- */
  var lineup = document.querySelector('.cast-lineup');
  if(lineup){
    var actors = Array.prototype.slice.call(lineup.querySelectorAll('.cast-actor'));
    var ticking = false;
    var paint = function(){
      ticking = false;
      var y = window.scrollY || 0;
      var still = calm() || window.innerWidth <= 920 || y > 900;
      actors.forEach(function(a){
        a.style.setProperty('--py', still ? '0px' : (y * parseFloat(a.dataset.p || '0.1')).toFixed(1) + 'px');
      });
    };
    window.addEventListener('scroll', function(){
      if(!ticking){ ticking = true; window.requestAnimationFrame(paint); }
    }, { passive: true });

    // במגע: הקשה על דמות מציגה את הבועה שלה
    actors.forEach(function(a){
      a.addEventListener('click', function(){
        var on = !a.classList.contains('talk');
        actors.forEach(function(o){ o.classList.remove('talk'); });
        if(on) a.classList.add('talk');
      });
    });

    // "הדמויות חיות": אחרי הכניסה, אחת מהן אומרת משהו לרגע
    var intro = lineup.querySelector('.cast-actor[data-intro]');
    if(intro && !calm()){
      setTimeout(function(){
        intro.classList.add('talk');
        setTimeout(function(){ intro.classList.remove('talk'); }, 3600);
      }, 1700);
    }
  }

  /* ---------- כפתור הוואטסאפ הצף: ראש של דמות מציץ אחרי גלילה ---------- */
  var wa = document.querySelector('.wa-float');
  if(wa){
    var HEADS = ['c06','c29','c25','c01','c26','c14','c20','c30','c05','c12'];
    var idx = 0;
    try { idx = parseInt(sessionStorage.getItem('rakia_cast_head') || '0', 10) || 0; } catch(e){}
    var peek = null, shown = false;
    var place = function(){
      if(!peek) return;
      var r = wa.getBoundingClientRect();
      peek.style.left = r.left + 'px';
      peek.style.width = r.width + 'px';
      peek.style.bottom = (window.innerHeight - r.top - r.height / 2) + 'px';
    };
    window.addEventListener('resize', place);
    var setHead = function(){
      var img = peek.querySelector('img');
      img.src = '/media/cast/' + HEADS[idx % HEADS.length] + '.webp';
      idx++;
      try { sessionStorage.setItem('rakia_cast_head', String(idx)); } catch(e){}
    };
    var check = function(){
      var y = window.scrollY || 0;
      if(!shown && y > 650){
        if(!peek){
          peek = document.createElement('span');
          peek.className = 'cast-peek wa-peek';
          peek.setAttribute('aria-hidden', 'true');
          peek.innerHTML = '<img class="cast-img" alt="" decoding="async">';
          document.body.appendChild(peek);
        }
        place();
        setHead();
        shown = true;
        // מחכים שהתמונה תיטען כדי שהקפיצה תהיה חלקה
        var img = peek.querySelector('img');
        var go = function(){ requestAnimationFrame(function(){ peek.classList.add('is-in'); }); };
        if(img.complete) go(); else img.onload = go;
      } else if(shown && y < 300){
        shown = false;
        if(peek) peek.classList.remove('is-in');
      }
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
  }
})();
