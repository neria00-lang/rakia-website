# AGENTS.md — מדריך מלא לכל סוכן שעובד על אתר רקיע

מסמך זה נועד לתת לכל סוכן (Claude Code, סוכן ענן, או כל AI אחר) את כל המידע הדרוש
כדי לבצע שינויים באתר תיאטרון רקיע **מקצה לקצה, בעצמו, בלי תלות בשיחה קודמת.**
תעדכן את המסמך הזה עצמו בכל פעם שמשהו מהותי משתנה (מבנה, דיפלוי, החלטות עיצוב).

---

## 1. מה זה הפרויקט

אתר תדמית (marketing site) לתיאטרון רקיע — חברה שמעבירה הצגות/סדנאות/הפעלות
חינוכיות-חוויתיות (בעיקר בנושאי ירושלים/היסטוריה) לבתי ספר, קייטנות ואירועים.
האתר בעברית, RTL, קהל היעד: רכזים/מנהלים בבתי ספר ומוסדות חינוך שמחליטים אם
להזמין את התיאטרון.

**בעל הפרויקט**: נריה צור (neria00@gmail.com).

---

## 2. מיקום ומבנה טכני

- **תיקיית repo**: `C:\Users\User\Desktop\מגירת השולחן\עסקים\רקיע\אתר\דף-בית`
  (זה ה-git root בפועל. התיקייה `אתר` שמעליה **אינה** repo — אל תנסה git שם.)
- **אתר סטטי טהור**: HTML + CSS + JS וניל, **בלי שום build step, בלי framework,
  בלי npm run build**. מה שכתוב בקובץ HTML זה בדיוק מה שיוצג בדפדפן.
- **5 עמודי HTML**, כל אחד עצמאי ומלא (לא template engine, אין includes):
  - `index.html` — דף הבית
  - `higia-hazman.html` — עמוד תוכנית/שירות ספציפי
  - `sadeh.html` — עמוד תוכנית/שירות ספציפי (שחקני שטח)
  - `tochen-chinami.html` — תוכן חינמי (פלייליסט יוטיוב "סיור סליחות" + קישור לקבוצת וואטסאפ)
  - `about.html` — אודות
- **CSS משותף**: `assets/css/style.css` (קובץ אחד, כל העמודים מפנים אליו).
- **JS משותף**: `assets/js/main.js` (טעינת התנהגות: תפריט מובייל, בחירת המלצות
  אקראיות, וכו').
- **מאגר תוכן**: `assets/js/testimonials-data.js` — מערך JS גלובלי `window.TESTIMONIALS`.
- **פונטים**: Google Fonts בענן (Heebo לטקסט רגיל, Secular One לכותרות) +
  פונט "Dana Yad" (כתב יד עברי) מתארח עצמאית ב-`assets/fonts/` (otf+woff),
  משמש ל-class `.script`.
- **מדיה**: תיקיית `media/` — תמונות, וידאו, ותת-תיקיות `media/sadeh/`,
  `media/shows/<שם הצגה>/`, `media/clients/` (לוגואים של לקוחות).

### עץ קבצים מלא (נכון לעכשיו)
```
about.html
higia-hazman.html
index.html
sadeh.html
tochen-chinami.html
negishut.html               ← הצהרת נגישות (ראה סעיף 9)
package.json
assets/css/style.css
assets/css/a11y.css         ← שכבת נגישות (ראה סעיף 9)
assets/js/main.js
assets/js/a11y.js           ← תפריט נגישות (ראה סעיף 9)
assets/js/testimonials-data.js
assets/fonts/DanaYadAlefAlefAlef-Normal.{otf,woff}
media/                      ← תמונות/וידאו כלליים
media/hero/                 ← hero-1..4.jpg — 4 תמונות הסליידשואו של דף הבית (דחוסות, 1920px)
media/clients/              ← 13 לוגואים אמיתיים של לקוחות (למרקיע הנע)
media/sadeh/                ← תמונות/וידאו לעמוד sadeh
media/shows/<שם>/            ← תמונות/פוסטרים לפי הצגה ספציפית
```

---

## 3. Design system (טוקנים ב-`:root` בתוך style.css)

```css
--navy:#0e1830;   --navy2:#0a1124;     /* כחול-כהה, רקע header/כפתורים כהים */
--cream:#efe8d8;  --cream2:#f5efe2;    /* רקע בהיר עיקרי של הדף */
--teal:#177c72;   --teal-dark:#0f5f58; /* טורקיז — צבע משני */
--amber:#f2a71b;  --gold:#f6b31b;      /* זהב/כתום — הדגשות, כותרות script */
--blue:#2456d6;   --red:#c2374a;       /* צבעי הדגשה נקודתיים */
--green:#25d366;                       /* צבע וואטסאפ הרשמי — לכפתורי CTA */
--ink:#1c2333;                         /* צבע טקסט עיקרי */
```
- גופן טקסט: `'Heebo', sans-serif`. גופן כותרות: `'Secular One', sans-serif`.
- `.script` = כתב יד (Dana Yad) בצבע `--gold`, לשימוש בציטוטים/כותרות רגשיות.
- Layout: `.wrap{max-width:1240px;margin:0 auto;padding:0 5vw}` — מיכל תוכן סטנדרטי.
- RTL מלא — כתוב `dir="rtl"` ב-`<html>` של כל עמוד; היזהר מ-`margin-left`/`right`
  הפוכים כשמוסיפים CSS חדש.

---

## 4. דיפלוי (Production) — כל הפרטים

- **Hosting**: Railway (PaaS). **בלי** `railway.json` בפרויקט הזה — Railway
  מזהה אוטומטית שזה Node app לפי `package.json` ומריץ `npm start`
  שמריץ `serve . -l $PORT` (חבילת `serve` שמוגדרת כ-dependency).
- **GitHub repo**: `neria00-lang/rakia-website`
  URL: `https://github.com/neria00-lang/rakia-website.git`, branch: `main`.
- **כתובת חיה**: `https://rakia-website-production.up.railway.app/`
  (אין עדיין דומיין מותאם אישית — רק סאב-דומיין של Railway).
- **Railway project id**: `db9fc2a9-ad1a-45b9-a64f-d7755f61292b`
- **Railway service id**: `5fba8bb3-feb8-4c6f-bd4f-8e11017b44d5`
- **Railway environment id (production)**: `a800b20f-d3e1-4a86-90d0-e6880f35339e`
- **אין env vars מיוחדים** לפרויקט הזה (זה סטטי, בלי DB/API keys).

### תהליך פרסום שינוי (חובה בכל שינוי!)
1. ערוך את הקבצים (HTML/CSS/JS/מדיה).
2. `git add -A`
3. `git commit -m "תיאור ברור באנגלית או עברית"`
4. `git push origin main`
5. Railway מזהה את ה-push אוטומטית ומתחיל build+deploy (סטטוס `BUILDING` → `SUCCESS`).
   אם יש לך גישת MCP ל-Railway, אפשר לבדוק סטטוס עם `list-deployments`
   (projectId+serviceId למעלה). בלי MCP — פשוט תבדוק את האתר החי אחרי דקה-שתיים.
6. **אם עובד מסביבת ענן/sandbox מבודדת**: ייתכן שאין הרשאת push ל-repo הזה
   (הודעת שגיאה טיפוסית: `not in this session's authorized repository set`).
   הפתרון: להוסיף את `neria00-lang/rakia-website` לרשימת ה-repos המורשים
   של ה-GitHub App/connector של הסביבה (ב-github.com/settings/installations
   או בהגדרות הפרויקט של הכלי שבו אתה עובד). **אם אין אפשרות לתקן את ההרשאה
   מיידית — תעצור ותבקש מהמשתמש לדחוף בעצמו** (ה-commit המקומי כבר קיים ומוכן,
   זו פעולה של שנייה מהמחשב שלו כי שם יש credentials שמורים).

### בעיה שחוזרת: קובצי git lock תקועים
אם `git` נכשל עם שגיאה כמו:
```
fatal: Unable to create '.git/index.lock': File exists.
fatal: cannot lock ref 'HEAD': .git/HEAD.lock File exists.
```
זה כמעט תמיד lock ריק (0 bytes) שנשאר מתהליך git קודם שנקטע (crash/timeout).
**לפני שמוחקים** — ודא שאין תהליך git פעיל באמת (למשל `tasklist | grep git`
ב-Windows). אם אין תהליך פעיל, מותר למחוק את קובצי ה-`.lock` בבטחה ולנסות שוב.

---

## 5. "מתכונים" — איך לבצע שינויי תוכן נפוצים

### להוסיף/לערוך המלצה
המלצות **לא** כתובות בתוך ה-HTML. הן חיות במערך אחד משותף:
`assets/js/testimonials-data.js` → `window.TESTIMONIALS = [ {quote, name, role, tag}, ... ]`.
ב-`main.js`, כל עמוד שיש בו `<div class="testi-grid">` בוחר **3 המלצות אקראיות**
מהמאגר בכל טעינת דף (Fisher-Yates shuffle) ומרנדר אותן ל-HTML. **לכן: כדי
להוסיף המלצה חדשה, פשוט מוסיפים אובייקט חדש למערך ב-testimonials-data.js —
היא תופיע אוטומטית בכל 4 העמודים בלי לגעת ב-HTML בכלל.**

⚠️ **חשוב מאוד: כל ההמלצות במאגר הן ציטוטים אמיתיים** ממכתבי המלצה חתומים
או הודעות וואטסאפ אמיתיות מלקוחות אמיתיים — **אסור להמציא או "לייפות" ציטוטים
חדשים**. אם מתבקש להוסיף המלצה, יש למצוא אותה בפועל בתיקיית
`C:\Users\User\Desktop\מגירת השולחן\עסקים\רקיע\המלצות` (או בתיקיות המקור
המקוריות כמו "ירושלים של משחק", "גפ''ן", "הצגה בהפתעה" וכו' תחת
`C:\Users\User\Desktop\מגירת השולחן\עסקים\רקיע`) ולצטט במדויק את הכתוב שם.

### להוסיף/להחליף לוגו לקוח בסרט הנע (marquee)
1. שים את קובץ הלוגו ב-`media/clients/` (עדיף PNG/SVG עם רקע שקוף; אם הלוגו
   עצמו לבן/בהיר מדי לרקע שקוף, סמן אותו כ-`dark-bg` — ראה למטה).
2. בכל אחד מ-3 העמודים שיש בהם marquee (`index.html`, `higia-hazman.html`,
   `sadeh.html` — לא ב-`about.html`), בתוך `<div class="marquee-track">`
   יש **3 עותקים זהים** של כל הלוגואים ברצף (לא 2! זה תוקן ב-commit `d3afa74`
   כדי שהלולאה תישאר חלקה גם במסכים רחבים) — צריך להוסיף את הלוגו החדש
   ב-3 המקומות (3 הפעמים שהרשימה חוזרת), באותו סדר, בפורמט:
   ```html
   <div class="client-logo"><img src="media/clients/NAME.png" alt="שם המוסד"></div>
   ```
   בעותקים 2 ו-3 (שקיימים רק לצורך הרצף החזותי, לא לנגישות) יש להוסיף
   `aria-hidden="true"` ל-div ו-`alt=""` ריק ל-img (בעותק הראשון בלבד יש alt מלא).
3. אם הלוגו לבן/בהיר וצריך רקע כהה כדי להיראות — הוסף גם `class="client-logo dark-bg"`
   ל-div (יוצר halo עגול כהה מאחורי הלוגו, ראה CSS `.client-logo.dark-bg img`).
4. **הרקע מאחורי כל הלוגואים שקוף** (לא ריבוע לבן — זה תוקן לפי בקשת הלקוח
   ב-commit `b4a58b8`). אל תחזיר בטעות `background:#fff` ל-`.client-logo`.
5. CSS רלוונטי ב-`style.css`: `.marquee`, `.marquee-track` (האנימציה עצמה,
   `@keyframes marquee-scroll`, duration 42s, `linear infinite`), `.client-logo`,
   `.client-logo.dark-bg`. יש `mask-image` לדהייה בקצוות, `animation-play-state:paused`
   בהובר, ותמיכה ב-`prefers-reduced-motion`.
   ⚠️ ל-`.marquee` יש `direction:ltr` **בכוונה** (commit `cdf2119`). בלי זה, בגלל
   ה-RTL של הדף, ה-`.marquee-track` מתיישר לימין וכל 3 העותקים הכפולים "תלויים"
   משמאל מחוץ לאזור הנראה — האנימציה שמזיזה שמאלה מרוקנת את הסרט אחרי מחזור אחד
   (~22 שניות) והאזור נשאר ריק. **אל תסיר את `direction:ltr` מ-`.marquee`.**
   הסדר של הלוגואים הופך ל-LTR (לוגו ראשון משמאל) — זה בסדר, הסדר שרירותי.
6. **אם לוגו קיים לא איכותי/שבור**: חפש את הלוגו הרשמי באתר של המוסד עצמו
   (לא ויקיפדיה — קבצי לוגו שם לרוב מסומנים "non-free / fair use" ואסורים
   לשימוש מסחרי). דוגמה שכבר נעשתה: רשות הטבע והגנים —
   `https://static.parks.org.il/wp-content/uploads/2025/01/cropped-LOGO_FINAL_RGB-03-2.png`.

### לעדכן את עמוד "תוכן חינמי" (`tochen-chinami.html`)
- **סרטוני הפלייליסט**: כל 9 הסרטונים מוטמעים ידנית כ-`<iframe>` (youtube-nocookie,
  `loading="lazy"`) בתוך `.video-grid` → `.video-card`. הפלייליסט המקור:
  `https://www.youtube.com/playlist?list=PLMGjToKeCQ7g` ("*הגיע הזמן* - סיור סליחות",
  ערוץ נריה צור). כדי להוסיף סרטון — עוד `.video-card` עם ה-VIDEO_ID החדש.
- **קבוצת וואטסאפ**: הקישור `https://chat.whatsapp.com/EoU7nK4JyKT7KrKsjJ6Qp8`
  הופק מהברקוד `אתר/ברקוד לקבוצות.png` (הועתק ל-`media/whatsapp-groups-qr.png`).
  אם הברקוד/הקבוצה משתנים — לפענח מחדש את ה-QR ולעדכן גם את התמונה וגם את ה-href.
- CSS ייעודי ב-`style.css` תחת הכותרת "תוכן חינמי": `.free-content`, `.video-grid`,
  `.video-card`, `.groups`.

### לשנות את ה-Hero של דף הבית (סליידשואו תמונות + טקסט גדול מיושר לימין)
ה-Hero בדף הבית (`index.html`, `<section class="hero">`) הוא **סליידשואו רקע**
של 4 תמונות שמתחלפות ב-crossfade + זום עדין (Ken Burns), עם טקסט גדול מיושר
לימין וממורכז אנכית (בהשראת shahart.co.il). **CSS טהור — בלי JS.**
- **התמונות**: `media/hero/hero-1.jpg` … `hero-4.jpg`. כדי להחליף — פשוט
  מחליפים את הקובץ באותו שם. **חובה לדחוס** לפני הוספה (יש ffmpeg במחשב):
  `ffmpeg -y -i <מקור> -vf "scale=1920:-2" -q:v 5 media/hero/hero-N.jpg`
  (יעד ~300–600KB לתמונה). עדכן גם את `width`/`height` ב-`<img>` המתאים אם
  יחס הגובה-רוחב שונה. להוסיף/להסיר תמונות = לעדכן גם את מספר ה-`.hero-slide`
  ב-HTML וגם את `animation-delay` + חלוקת ה-% ב-`@keyframes heroFade` (כרגע
  4 תמונות × 6s, מחזור 24s; ל-N תמונות: delay = i×(24/N), משך = 24s).
- **קריאוּת הטקסט** מגיעה מ-`.hero-scrim` (שכבת גרדיאנט כהה, כהה יותר בצד ימין
  מאחורי הטקסט). אם תמונה חדשה בהירה מדי והטקסט לא נקרא — מגבירים את
  ה-opacity ב-`.hero-scrim` (ב-`style.css`, גם ברירת מחדל וגם ב-media query
  של מובייל).
- **התמונה הראשונה** מקבלת `opacity:1` ב-CSS כברירת מחדל (`.hero-slide:nth-child(1)`)
  כדי שלא יהיה פריים ריק לפני שהאנימציה מתחילה / אם אין תמיכה באנימציות.
  **אל תסיר את זה** (זה בדיוק הבאג שהיה בסרט הנע). `prefers-reduced-motion`
  מכובד — בלי אנימציה, מציג רק את התמונה הראשונה.
- CSS רלוונטי ב-`style.css` תחת "HERO (home)": `.hero`, `.hero-slides`,
  `.hero-slide`, `@keyframes heroFade`, `.hero-scrim`, `.hero-inner`,
  `.hero-center`, `.hero h1`, `.hero-arrow`.

### להחליף וידאו מוטמע (embed)
בדף הבית (`index.html`) יש אזור `.reel-box.yt-embed` עם iframe שמצביע ל-
`https://www.youtube-nocookie.com/embed/<VIDEO_ID>` (גרסת פרטיות משופרת של
יוטיוב — לא `youtube.com` הרגיל). כדי להחליף וידאו, מספיק להחליף את ה-`<VIDEO_ID>`
בכתובת ה-`src` של ה-iframe.

### כפתורי/אייקוני וואטסאפ
בכל מקום באתר שיש קישור ל-WhatsApp (כפתור צף, CTA, ניווט, סושיאל בפוטר),
האייקון הוא SVG מוטמע inline בשם class `.ico-wa` (לא אמוג'י, לא תמונה חיצונית) —
כך שהוא בצבע אחיד (`fill="currentColor"`) ותלוי-הקשר (גודל שונה לכל מיקום
לפי `.wa-float .ico-wa`, `.btn-wa .ico-wa`, `.nav-cta .ico-wa`, `.socials a .ico-wa`
ב-style.css). אם מוסיפים כפתור וואטסאפ חדש — להעתיק את אותו ה-SVG הקיים,
לא ליצור אייקון חדש.

### להוסיף עמוד/הצגה חדשה
אין מנגנון תבניות — יוצרים HTML חדש עם אותו header/footer/nav כמו שאר
העמודים (העתק-הדבק את המבנה מ-`sadeh.html` והתאם תוכן), ומוסיפים קישור
אליו ב-`nav.main-nav` בכל 5 העמודים הקיימים (חשוב לעדכן את הניווט בכולם,
לא רק בעמוד החדש).

---

## 6. מלכודות ידועות — קרא לפני שאתה עורך

1. **לעולם אל תערוך את קבצי ה-HTML/CSS/JS דרך `perl`/`sed`/shell text pipelines.**
   קרה כבר מקרה שבו slurp-mode של perl בלי `:encoding(UTF-8)` על **כל** זרם
   ה-I/O (לא רק קובץ צד) השחית את כל הטקסט העברי לג'יבריש (mojibake). **תמיד
   להשתמש בכלי Edit/Read הרגילים של הסוכן** לעריכת טקסט עברי.
2. **קובצי git lock תקועים** — ראה סעיף 4 למעלה.
3. **אין build step** — אם אתה רואה את עצמך רוצה להריץ `npm run build`,
   `vite`, `webpack` וכו' — עצור, זה לא הפרויקט הנכון. זה HTML סטטי טהור.
4. **וידאו/תמונות כבדים**: יש כמה קובצי mp4/png גדולים תחת `media/` — היזהר
   לא להוסיף עוד קבצים כבדים בלי דחיסה (זה כבר סומן כ-TODO, ראה סעיף 7).
5. **`git push` איטי**: ה-repo מכיל הרבה מדיה בינארית; push ראשוני/גדול יכול
   לחרוג מ-timeout קצר (כמה דקות) — אם אתה סוכן עם timeout מוגבל, הרץ אותו
   ברקע/async ולא בהמתנה חוסמת.

---

## 7. משימות פתוחות / TODO ידוע (נכון לתאריך כתיבת המסמך)

- [x] וידאו יוטיוב בדף הבית, אייקוני וואטסאפ, המלצות אמיתיות + רוטציה אקראית,
      לוגואים אמיתיים בסרט נע, רקע שקוף ללוגואים, לופ רציף בסרט הנע — **כולם בוצעו ועלו לפרודקשן**.
- [ ] **איסוף קבצי מקור להמלצות**: יש לאתר את קובצי המקור המקוריים (מכתבים
      סרוקים/צילומי מסך וואטסאפ/PDF) של כל אחת מ-16 ההמלצות שבתוך
      `testimonials-data.js`, ולהעתיק (COPY בלבד, לא להזיז) אותם לתיקייה
      `C:\Users\User\Desktop\מגירת השולחן\עסקים\רקיע\המלצות`. ניסיון קודם
      לבצע זאת נכשל (agent נתקל במגבלת usage) — עדיין לא הושלם.
- [ ] דחיסת קובצי וידאו כבדים ב-`media/`.
- [ ] תמונות אמיתיות חסרות להצגת "המסע לירושלים" (סיגד).
- [ ] קישורי רשתות חברתיות אמיתיים בפוטר — ה-placeholders (אינסטגרם/פייסבוק עם
      `href="#"`) **הוסרו** בפאס הנגישות. כשיהיו חשבונות אמיתיים — להוסיף קישורים
      חדשים ל-`.socials` בכל העמודים, עם `aria-label` ברור ואייקון (לא אמוג'י).
- [x] **עמוד הצהרת נגישות + הנגשת האתר לפי ת"י 5568 (WCAG 2.0 AA)** — בוצע. ראה סעיף 9.

---

## 8. פרויקט קשור (לא לגעת בו מפה)

יש פרויקט נפרד לגמרי בשם **BizFlow** (מערכת ניהול עסקי, לא אתר תדמית) באותו
תיקיית משתמש (`C:\Users\User\Desktop\BizFlow-Planner\bizflow-new`), עם
repo/Railway/deploy נפרדים לחלוטין. זו החלטה ארכיטקטונית מכוונת — אל תערבב
שינויים בין שני הפרויקטים, ואל תניח שהגדרות/credentials של אחד תקפים לשני.

---

## 9. נגישות (ת"י 5568 / WCAG 2.0 AA) — איך זה בנוי

הנגישות מיושמת בקוד עצמו, לא ע"י תוסף/overlay. אל תסיר את הרכיבים הבאים:

- **`negishut.html`** — עמוד הצהרת נגישות (חובה חוקית). מקושר בפוטר של כל העמודים
  (`.flinks`). מכיל את כל 7 סעיפי החובה: מחויבות, תקן, אמצעי נגישות, מגבלות ידועות,
  פרטי איש קשר (נריה צור / neria00@gmail.com / 052-6154838), תאריך ביקורת, ועברית.
  **אם משנים מבנה/רכיב מהותי באתר — לעדכן את "מגבלות נגישות ידועות" ואת תאריך
  העדכון בעמוד הזה.**
- **`assets/css/a11y.css`** — שכבת CSS נפרדת (נטענת אחרי `style.css` בכל עמוד).
  מכילה: `.skip-link`, `:focus-visible` גלובלי, `.sr-only`, `.nav-scrim`,
  `.form-status`, וכל מחלקות ה-`a11y-*` שתפריט הנגישות מפעיל על `<html>`,
  counter-invert, ו-`@media print` שמאפס הכל. **נשמר בנפרד מ-`style.css` בכוונה**
  (סעיף 3 אומר "קובץ CSS אחד" — זה החריג המכוון היחיד, לבידוד שכבת הנגישות).
- **`assets/js/a11y.js`** — תפריט הנגישות (וידג'ט תקנה 35). כפתור צף בפינה +
  חלונית עם 8 טוגלים (הדגשת קישורים, ניגודיות, גודל טקסט, מרווח שורות, גופן קריא,
  הדגשת כותרות, סמן גדול, עצירת אנימציות) + איפוס. קיצור: `Alt+A`. ההעדפות
  נשמרות ב-`localStorage` תחת המפתח `rakia_a11y_v1` (version 1).
  הכלי **רק מחליף מחלקות CSS על `<html>`** — אסור שיגע ב-DOM של התוכן, ב-`alt`,
  או ב-ARIA. זו הגבולה בין כלי-נוחות מותר ל-overlay אסור (ה-FTC קנס את accessiBe
  ב-2025 על overlay שהתיימר "לתקן" אתרים).
- **סקריפט bootstrap ב-`<head>` של כל עמוד** — לפני `</head>`, מיד אחרי טעינת
  `a11y.css`. מיישם את מחלקות ה-`a11y-*` השמורות **לפני** הצביעה הראשונה (מונע
  הבהוב). **חייב להישאר זהה ל-`CLASS_RULES` שב-`a11y.js`** — אם מוסיפים טוגל
  חדש, לעדכן את שניהם + את `a11y.css` + לקדם את מספר ה-version בכל המקומות.

מבנה סמנטי שקיים בכל עמוד (לא להסיר): `<a class="skip-link">` ראשון ב-`<body>`,
`<nav class="main-nav" aria-label="ניווט ראשי">`, `<main id="main-content" tabindex="-1">`
עוטף את כל התוכן, `<nav class="flinks" aria-label="ניווט תחתון">` בפוטר.
הכפתור hamburger מקבל `aria-expanded`/`aria-controls`. המודאל (`#showModal`)
והלייטבוקס (`#lightbox`) מקבלים `role="dialog"` + `aria-modal` + ניהול פוקוס
ב-`main.js` (שמירת פוקוס קודם, מלכודת Tab, Escape, החזרת פוקוס).

### תיקוני ניגודיות שבוצעו (ב-`style.css`, אל תחזיר לאחור)
`.filter-bar button` ו-`.free-content .playlist-link a` → `var(--teal-dark)`;
`.show-card .meta`, `.section-sub`, `.reel p.cap`, `.card .who` → `#5a5a5a`.
כל אלה היו מתחת ל-4.5:1 מול הרקע.
