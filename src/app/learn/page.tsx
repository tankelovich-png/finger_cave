"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStudent, type CurrentStudent } from "@/lib/student-storage";

const RESOURCES = [
  {
    title: "מערת הנחל (ויקיפדיה)",
    href: "https://he.wikipedia.org/wiki/%D7%9E%D7%A2%D7%A8%D7%AA_%D7%94%D7%A0%D7%97%D7%9C",
    note: "רקע כללי על נחל המערות, ההיסטוריה והממצאים הארכיאולוגיים.",
  },
  {
    title: "נחל מערות (ויקיפדיה)",
    href: "https://he.wikipedia.org/wiki/%D7%A0%D7%97%D7%9C_%D7%9E%D7%A2%D7%A8%D7%95%D7%AA",
    note: "על השמורה, המסלולים והמערות השונות באתר.",
  },
  {
    title: "Nahal Me'arot Nature Reserve (UNESCO)",
    href: "https://whc.unesco.org/en/list/1393/",
    note: "האתר הרשמי של אונסק\"ו על אתר המורשת העולמי.",
  },
  {
    title: "רכס אצבע ומערת אצבע (רשות הטבע והגנים)",
    href: "https://www.parks.org.il/trip/etzba-cave/",
    note: "מידע על מסלול הטיול למערת האצבע עצמה.",
  },
];

export default function LearnPage() {
  const router = useRouter();
  const [student, setStudent] = useState<CurrentStudent | null>(null);
  const [showLinks, setShowLinks] = useState(false);

  useEffect(() => {
    const s = loadStudent();
    if (!s) {
      router.replace("/");
      return;
    }
    setStudent(s);
  }, [router]);

  if (!student) return null;

  return (
    <main>
      <div className="card">
        <span className="eyebrow">שלב 1 • למידה</span>
        <h1>שלום {student.name}!</h1>
        <p className="subtitle">הצפו, האזינו, ואז בחרו איך להתחיל - כל המידע שבבוחן נמצא כאן.</p>

        <div className="media-embed">
          <iframe
            src="https://drive.google.com/file/d/1xbNLvuuU09ACR3eHTQr3P2GKAIzOaSbO/preview"
            allow="autoplay; fullscreen"
            allowFullScreen
            title="וידיאו: קומפלקס הדירות הפרהיסטורי של הכרמל"
          />
        </div>
        <div className="media-embed media-embed-audio">
          <iframe
            src="https://drive.google.com/file/d/1PXpOtoRdBoToQGnMHelLbRJ87DkBof1F/preview"
            allow="autoplay"
            title="פודקאסט: כשניאנדרטלים והומו ספיינס חיו בכרמל"
          />
        </div>

        <a href="/presentation.pptx" download className="resource-list-single">
          📊 מצגת סיכום - להורדה / צפייה
          <small>12 שקפים עם כל המידע מהבוחן, בעיצוב בסגנון הכרמל</small>
        </a>

        <button
          type="button"
          className="link-toggle"
          onClick={() => setShowLinks((v) => !v)}
          aria-expanded={showLinks}
        >
          {showLinks ? "הסתירו ▲" : "אם תרצו לקרוא עוד ▼"}
        </button>
        {showLinks && (
          <ul className="resource-list">
            {RESOURCES.map((r) => (
              <li key={r.href}>
                <a href={r.href} target="_blank" rel="noreferrer">
                  {r.title}
                  <small>{r.note}</small>
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="quiz-cta-row">
          <button className="btn" onClick={() => router.push("/quiz")}>
            בוחן רשמי
          </button>
          <button className="btn btn-secondary" onClick={() => router.push("/quiz?practice=1")}>
            סיבוב תרגול
          </button>
        </div>
        <p className="muted" style={{ marginTop: 10 }}>
          בסיבוב תרגול תראו את התוצאה שלכם, אבל היא לא תיכנס ללוח המובילים.
        </p>
      </div>
    </main>
  );
}
