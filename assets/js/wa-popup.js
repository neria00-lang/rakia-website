// רקיע – הזמנה לקבוצת הוואטסאפ (תוכן חינמי). קופצת אחרי 10 שניות גלישה באתר
// (הזמן נספר מהעמוד הראשון בביקור, גם במעבר בין עמודים). כרטיס לא-חוסם בפינה:
// לא גונב פוקוס, נסגר ב-X / "לא עכשיו" / Escape. אחרי סגירה — לא מופיע שוב 7 ימים;
// אחרי לחיצה על "להצטרפות" — לא מופיע יותר. העיצוב ב-assets/css/cast.css (סעיף 8).
(function(){
  var GROUP = 'https://chat.whatsapp.com/EoU7nK4JyKT7KrKsjJ6Qp8?s=cl&p=a&ilr=0';
  var DELAY = 10000, SNOOZE_DAYS = 7, KEY = 'rakia_wa_popup', T0 = 'rakia_visit_t0';

  // בעמוד התוכן החינמי כבר יש הזמנה מלאה לקבוצה
  if(/tochen-chinami/.test(location.pathname)) return;

  function lsGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function lsSet(k, v){ try { localStorage.setItem(k, v); } catch(e){} }
  function ssGet(k){ try { return sessionStorage.getItem(k); } catch(e){ return null; } }
  function ssSet(k, v){ try { sessionStorage.setItem(k, v); } catch(e){} }

  var state = lsGet(KEY);
  if(state === 'joined') return;
  if(state && Date.now() - parseInt(state, 10) < SNOOZE_DAYS * 864e5) return;
  if(ssGet(KEY + '_shown')) return;

  var t0 = parseInt(ssGet(T0) || '0', 10);
  if(!t0){ t0 = Date.now(); ssSet(T0, String(t0)); }
  var wait = Math.max(1500, DELAY - (Date.now() - t0));

  var WA_ICON = '<svg class="ico-wa" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.001 3C9.383 3 4 8.373 4 15c0 2.634.858 5.079 2.312 7.062L4.8 27.2l5.302-1.68A11.94 11.94 0 0 0 16.001 27C22.619 27 28 21.627 28 15S22.619 3 16.001 3zm6.965 16.541c-.297.836-1.47 1.53-2.403 1.727-.639.135-1.474.243-4.283-.92-3.594-1.487-5.906-5.14-6.086-5.379-.173-.239-1.456-1.939-1.456-3.699 0-1.76.897-2.623 1.216-2.982.297-.334.648-.418.865-.418.216 0 .433.002.622.011.216.01.483-.082.756.577.297.716.996 2.472 1.083 2.653.087.181.146.393.029.632-.115.239-.173.388-.343.597-.173.209-.362.467-.518.627-.173.179-.354.373-.152.732.202.359.897 1.481 1.926 2.398 1.325 1.182 2.443 1.549 2.802 1.727.359.179.567.15.777-.09.216-.239.867-1.011 1.099-1.359.231-.348.462-.29.777-.174.318.116 2.011.949 2.357 1.121.347.174.577.26.663.404.087.144.087.836-.211 1.672z"/></svg>';

  function show(){
    // לא קופצים מעל מודאל/לייטבוקס/תפריט פתוחים — מנסים שוב עוד רגע
    if(document.querySelector('.modal-overlay.open, .lightbox.open, .main-nav.open, #a11y-widget-panel:not([hidden])')){
      setTimeout(show, 4000); return;
    }
    ssSet(KEY + '_shown', '1');
    var box = document.createElement('aside');
    box.className = 'wa-pop';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'false');
    box.setAttribute('aria-labelledby', 'wa-pop-title');
    box.innerHTML =
      '<img class="cast-img wa-pop-char" src="/media/cast/c13.webp" alt="" aria-hidden="true" width="681" height="772">' +
      '<button type="button" class="wa-pop-x" aria-label="סגירת ההודעה">&times;</button>' +
      '<p class="wa-pop-kicker">בחינם · בלי התחייבות</p>' +
      '<h2 id="wa-pop-title">רוצים תוכן חינמי לחגים?</h2>' +
      '<p class="wa-pop-text">הצטרפו לקבוצת הוואטסאפ שלנו וקבלו ראשונים סרטונים, הפעלות וחומרים לכל חג — ישר לנייד.</p>' +
      '<a class="btn-wa wa-pop-join" href="' + GROUP + '" target="_blank" rel="noopener">' + WA_ICON + ' להצטרפות לקבוצה</a>' +
      '<button type="button" class="wa-pop-later">לא עכשיו</button>';
    document.body.appendChild(box);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ box.classList.add('open'); }); });

    function close(snooze){
      if(snooze) lsSet(KEY, String(Date.now()));
      box.classList.remove('open');
      document.removeEventListener('keydown', onKey);
      setTimeout(function(){ if(box.parentNode) box.parentNode.removeChild(box); }, 400);
    }
    function onKey(e){ if(e.key === 'Escape') close(true); }
    box.querySelector('.wa-pop-x').addEventListener('click', function(){ close(true); });
    box.querySelector('.wa-pop-later').addEventListener('click', function(){ close(true); });
    box.querySelector('.wa-pop-join').addEventListener('click', function(){ lsSet(KEY, 'joined'); close(false); });
    document.addEventListener('keydown', onKey);
  }

  setTimeout(show, wait);
})();
