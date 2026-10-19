// רקיע – מאגר סרטוני היוטיוב של האתר (מתוך הפלייליסטים בערוץ).
// להוספת סרטון: מוסיפים שורה ל-ITEMS עם ה-id (11 התווים שבכתובת היוטיוב) ותג.
// להוספת טריילר: ממלאים את ה-id ב-TRAILERS (למשל jerusalem) — הוא יופיע אוטומטית
// בעמוד "הגיע הזמן" ובחלונות ההצגות הרלוונטיות. ההתנהגות ב-assets/js/videos.js.
//
// tag:  chanukah | purim | jerusalem  = המלצות על הצגות "הגיע הזמן"
//       sadeh                         = המלצות על שחקני השטח
// v:    true = סרטון אנכי (רילס/שורטס), false = רוחבי
window.RAKIA_VIDEOS = {
  TRAILERS: {
    chanukah:  { id: 'mFgkA-UprSo', title: 'טריילר – "בימים ההם", הצגת חנוכה' },
    jerusalem: null   // יתווסף כשיעלה ליוטיוב: { id: '...', title: 'טריילר – "חוזרים לירושלים"' }
  },

  FEATURES: {
    // סרטון ראשי בדף הבית
    home:          { id: 'UQRZvDPYHTI', v: true,  title: 'שחקני שטח עם תאטרון רקיע | לכל מקום יש סיפור' },
    // "שנייה בשטח" בעמוד שחקני שטח
    sadehMain:     { id: '1EK4kjVrPS8', v: true,  title: 'ערך בחוויה – שחקני שטח של תאטרון רקיע' },
    sadehJerusalem:{ id: '53kMiGN2aAo', v: false, title: 'ירושלים של משחק – סיור חלומי לכל אירוע' }
  },

  ITEMS: [
    // ---- חנוכה: "בימים ההם" ----
    { id: '8gDIINJr0yw', tag: 'chanukah', v: true,  who: 'הרב רועי אמגר, נתניה', quote: 'לא ראינו הצגה כזו איכותית המון זמן' },
    { id: '5hzSzxFq1Ss', tag: 'chanukah', v: true,  who: 'רחל, רכזת גרעין תורני רמלה', quote: 'חמישים דקות לא זזו' },
    { id: 'B9Li_QF6_8s', tag: 'chanukah', v: true,  who: 'רויטל, רכזת גרעין פרדס חנה', quote: 'הילדים ישבו מרותקים' },
    { id: 'VaCK_x_Qpgc', tag: 'chanukah', v: true,  who: 'צביקה, מנהל בית ספר הר ברכה', quote: 'הילדים היו מרותקים' },
    { id: '5AIWVxlVq5M', tag: 'chanukah', v: false, who: 'אבא מגרעין קריית גת', quote: 'ההצגה הייתה ממש מרתקת, ממש לימודית' },
    { id: 'de59XT9IXQU', tag: 'chanukah', v: true,  who: 'הורים מנתניה', quote: 'מסר מאוד מאוד יפה לכל הגילאים' },
    { id: 'okpYaA9iEK4', tag: 'chanukah', v: true,  who: 'צופה מטירת כרמל', quote: 'היה כיף, כל כך היה מרשים' },
    { id: 'stlfmt_Eh0A', tag: 'chanukah', v: true,  who: 'אלקנה כהן, צלם', quote: 'קראתי את הספר, אני ממש התחברתי' },

    // ---- פורים: "הליצן משושן" ----
    { id: 'xEmjz9ZpCW4', tag: 'purim', v: true, who: 'הורה ממגדל עוז', quote: 'הילדים הקשיבו ונהנו' },

    // ---- ירושלים: "חוזרים לירושלים" (יום העצמאות / יום ירושלים / בין המצרים) ----
    { id: 'h9UWckVjoRw', tag: 'jerusalem', v: true,  who: 'יעקב, הגרעין התורני בקריית גת', quote: 'הצגה ערכית, מרגשת, מצחיקה' },
    { id: '0mMX0reVQFw', tag: 'jerusalem', v: true,  who: 'אלון, מורה ואבא מעלי', quote: 'גם צחוק וגם הרבה פנימיות ועומק' },
    { id: 'LnD4Y5WmzXs', tag: 'jerusalem', v: true,  who: 'תמר, מנהלת ספרייה, אלון מורה', quote: 'הילדים ישבו מרותקים' },
    { id: '3P7HVfid85I', tag: 'jerusalem', v: false, who: 'יונית ולס, בית הספר אילים, אלעד', quote: 'הצגה מדהימה' },
    { id: 'mFG_mtIw9a4', tag: 'jerusalem', v: true,  who: 'דינה, רכזת בית ספר שירה חדשה, בת ים', quote: 'חוויה נהדרת' },
    { id: '7ctDoJX6ZiI', tag: 'jerusalem', v: true,  who: 'מורה מנצח ישראל, פתח תקווה', quote: 'הכי יפה ויצירתית ושמחה' },
    { id: 'VuyZe_Cr4_g', tag: 'jerusalem', v: true,  who: 'תלמידה מנצח ישראל, פתח תקווה', quote: 'הצגה מאוד מעניינת' },
    { id: 'DccmieToRIE', tag: 'jerusalem', v: true,  who: 'אריאל, תל אביב', quote: 'הילדים נהנו, אנחנו ההורים נהנינו' },
    { id: 'Czqzk7vZfc4', tag: 'jerusalem', v: true,  who: 'אברהם, מורה ואבא מעלי', quote: 'הילדים היו מרותקים' },

    // ---- שחקני שטח ----
    { id: 'X1mzMVSHVj0', tag: 'sadeh', v: true,  who: 'רכזת מרכז שפירא', quote: 'הילדים היו פעורי פה וממש רצו לשמוע עוד' },
    { id: 'xnADL2zlMHA', tag: 'sadeh', v: true,  who: 'הרב חן, בית הספר נועם רז, לוד', quote: 'היה ממש הנאה גדולה', sub: 'ירושלים של משחק' },
    { id: 'F5rMTxN4sFs', tag: 'sadeh', v: true,  who: 'הורים ממליצים', quote: 'כל פעם דמות אחרת... היה ממש מרגש', sub: 'ירושלים של משחק' },
    { id: 'bZhBylEP55I', tag: 'sadeh', v: true,  who: 'הורים ממליצים', quote: 'היה סיור מהמם, מגוון, מתאים לילדים', sub: 'ירושלים של משחק' },
    { id: 'Qi-C3Z6EQ34', tag: 'sadeh', v: true,  who: 'הורים ממליצים', quote: 'ההצגות היו מדהימות, מדריך מלא מוטיבציה', sub: 'ירושלים של משחק' },
    { id: 'pmHNfeRS2AE', tag: 'sadeh', v: true,  who: 'הורים ממליצים', quote: 'בצורה מאוד חווייתית, וממש ממש נהנינו', sub: 'ירושלים של משחק' },
    { id: 'IScqz22sBFU', tag: 'sadeh', v: false, who: 'חיה, מחנכת כיתה א׳', quote: 'זה היה מרגש, זה היה מלמד', sub: 'מסיבת סידור' },
    { id: 'bc8DqxdBz0s', tag: 'sadeh', v: true,  who: 'הורים ממליצים', quote: 'ממש מרתק את הילדים', sub: 'מסיבת סידור' }
  ],

  // ההמלצה המוצגת בחלון הפרטים של כל הצגה (לפי data-holiday-key של כרטיס ההצגה)
  SHOW_PICK: { chanukah: '8gDIINJr0yw', purim: 'xEmjz9ZpCW4', atzmaut: 'h9UWckVjoRw', metzarim: '0mMX0reVQFw' },
  // לאיזה טריילר כל הצגה שייכת
  SHOW_TRAILER: { chanukah: 'chanukah', atzmaut: 'jerusalem', metzarim: 'jerusalem' },
  // חיבור כפתורי סינון החגים בעמוד "הגיע הזמן" לתגי הסרטונים
  FILTER_TAG: { all: null, chanukah: 'chanukah', purim: 'purim', atzmaut: 'jerusalem', metzarim: 'jerusalem', sigd: 'none' },

  // ההמלצות הנבחרות בדף הבית (אחת מכל תחום)
  HOME_PICKS: ['8gDIINJr0yw', 'h9UWckVjoRw', 'xEmjz9ZpCW4', 'X1mzMVSHVj0']
};
