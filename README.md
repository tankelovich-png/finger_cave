# טריוויית מערת האצבע 🪨

משחק ווב קטן לכיתה: הרשמה → למידה → בוחן טריוויה (5 שאלות אקראיות מתוך מאגר של 30) → תוצאה + לוח מובילים.
בנוי עם Next.js 14 (App Router) + TypeScript + Prisma + SQLite.

## ⚠️ לפני שמפרסמים לתלמידים

הקובץ [`prisma/questions.data.ts`](prisma/questions.data.ts) מכיל **טיוטה** של 30 שאלות טריוויה, מבוססת על ויקיפדיה, אתר אונסק"ו ורשות הטבע והגנים. **חשוב לעבור על כל השאלות והתשובות ולאשר/לתקן אותן** לפני שהאתר יוצא לתלמידים - זה תוכן חינוכי ואני מעדיף שתאשרו דיוק עובדתי במקום לסמוך על טיוטה אוטומטית.

לאחר עריכת הקובץ, מריצים שוב:

```bash
npm run db:seed
```

## הרצה מקומית

```bash
npm install
cp .env.example .env       # יוצר DATABASE_URL מקומי (קובץ SQLite)
npx prisma db push         # יוצר את טבלאות מסד הנתונים
npm run db:seed            # טוען את 30 שאלות הטריוויה
npm run dev                # http://localhost:3000
```

## הוספת פודקאסט

יש להניח קובץ אודיו (mp3) בנתיב `public/podcast.mp3` - הוא יופיע אוטומטית בעמוד הלמידה (`/learn`).

## פריסה לאינטרנט (כדי שהתלמידים יוכלו להיכנס מבחוץ)

הקוד כבר תומך ב-**Turso** (SQLite מנוהל בענן) + **Vercel**. השלבים הבאים דורשים את חשבונות ה-Turso/Vercel/GitHub שלכם ולכן לא בוצעו אוטומטית כאן.

### 1. יצירת מסד הנתונים ב-Turso

הכי פשוט דרך לוח הבקרה באתר turso.tech: "Create Database", ואז בעמוד "Connect" מעתיקים את ה-**Database URL** (`libsql://...`) ולוחצים "Create Token" לקבלת auth token.

(יש גם [CLI](https://docs.turso.tech/cli/installation) אם מעדיפים שורת פקודה, אבל לא חובה - השלבים הבאים לא דורשים אותו.)

### 2. יצירת הטבלאות במסד ה-Turso

אין צורך ב-Turso CLI - יש script בפרויקט (`scripts/apply-schema.mjs`) שמריץ את [`prisma/turso-init.sql`](prisma/turso-init.sql) (סכימת הטבלאות: Student, Question, Attempt) ישירות מול Turso באמצעות Node:

```bash
npm install
TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npm run db:push-turso
```

### 3. טעינת 30 השאלות למסד ה-Turso

מריצים מקומית, עם משתני הסביבה של Turso בלבד (לא DATABASE_URL הרגיל):

```bash
TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npm run db:seed
```

### 4. פריסה ב-Vercel

1. נכנסים ל-[vercel.com/new](https://vercel.com/new) ומחברים את ריפו ה-GitHub `finger_cave`.
2. בהגדרות הפרויקט → Environment Variables, מוסיפים:
   - `DATABASE_URL` = `file:./dev.db` (נדרש רק כדי ש-Prisma לא יתלונן בזמן build, לא בפועל בשימוש כש-TURSO מוגדר)
   - `TURSO_DATABASE_URL` = כתובת ה-libsql שקיבלתם
   - `TURSO_AUTH_TOKEN` = הטוקן שקיבלתם
3. Deploy. Vercel ייתן כתובת אינטרנט (למשל `finger-cave.vercel.app`) - זו הכתובת שנותנים לתלמידים.

לאחר הפריסה כדאי לבדוק שהאתר עובד end-to-end: הרשמה → למידה → בוחן → תוצאה + לוח מובילים.

## מבנה הפרויקט

- `src/app/page.tsx` - הרשמה (שם + כיתה)
- `src/app/learn/page.tsx` - מקורות למידה + פודקאסט
- `src/app/quiz/page.tsx` - בוחן הטריוויה (5 שאלות אקראיות, טיימר)
- `src/app/results/page.tsx` - תוצאה אישית + לוח מובילים
- `src/app/api/*` - כל הלוגיקה של בדיקת תשובות וניקוד רצה בשרת (לא ניתן "לרמות" מהדפדפן)
- `prisma/schema.prisma` - מודל הנתונים (תלמיד, שאלה, ניסיון)
- `prisma/questions.data.ts` - מאגר 30 השאלות (לעריכה!)

## איך נקבע הדירוג בלוח המובילים?

לכל תלמיד נשמר **הניסיון הטוב ביותר** שלו בלבד. המיון הוא לקסיקוגרפי: קודם מספר התשובות הנכונות (מי שיותר מדויק מדורג גבוה יותר), ורק בין תלמידים עם אותה רמת דיוק - הזמן המהיר יותר מכריע.
