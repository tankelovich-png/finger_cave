"use client";

import { useRouter } from "next/navigation";

const STEPS = [
  { title: "הרשמה", desc: "ספרו לנו מי אתם - תלמיד/ה או הורה, שם, כיתה (לתלמידים), ומי אתם." },
  { title: "למידה", desc: "צפו בוידיאו, האזינו לפודקאסט, ואם בא לכם - קראו עוד." },
  { title: "שאלון", desc: "5 שאלות טריוויה כיפיות. אפשר לנסות כמה פעמים שרוצים!" },
  { title: "תוצאות אישיות, ובנים מול בנות", desc: "ראו איפה אתם מדורגים ביחס לכיתה, ומי מנצח כרגע - הבנים או הבנות." },
];

const PARENTS_NOTE =
  "גם הורים מוזמנים לשחק! יש לכם לוח מובילים נפרד משלכם (לא מתחרה בתלמידים), וגם תחרות משלכם - אמהות מול אבות.";

export default function IntroPage() {
  const router = useRouter();

  return (
    <main>
      <div className="card">
        <span className="eyebrow">טיול הכיתה • מערת האצבע</span>
        <h1 className="hero-title">גלו את סודות מערת האצבע והכרמל</h1>
        <p className="subtitle">
          זה לא מבחן, זה משחק - קצת למידה, קצת תחרות כיפית, וטיול מגניב בדרך. ככה זה עובד:
        </p>

        <ol className="steps-list">
          {STEPS.map((s, i) => (
            <li key={s.title} className="steps-list-item">
              <span className="steps-list-number">{i + 1}</span>
              <span>
                <strong>{s.title}</strong>
                <br />
                <span className="muted">{s.desc}</span>
              </span>
            </li>
          ))}
        </ol>

        <p className="muted" style={{ marginTop: 16 }}>
          👨‍👩‍👧 {PARENTS_NOTE}
        </p>

        <button className="btn" onClick={() => router.push("/register")} style={{ marginTop: 20 }}>
          בואו נתחיל! 🎉
        </button>
      </div>
    </main>
  );
}
