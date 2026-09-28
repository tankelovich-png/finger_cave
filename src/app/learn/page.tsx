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
        <p className="subtitle">
          לפני שניגשים לבוחן, כדאי להעיף מבט במקורות האלה - כל שאלות הטריוויה מבוססות עליהם.
        </p>
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

        <h3>פודקאסט</h3>
        <p className="muted">
          נגן פודקאסט קצר על מערת האצבע והכרמל יתווסף כאן בקרוב. (קובץ אודיו יונח בנתיב{" "}
          <code>public/podcast.mp3</code>).
        </p>
        <audio controls src="/podcast.mp3" />

        <button className="btn" onClick={() => router.push("/quiz")} style={{ marginTop: 20 }}>
          התחילו את בוחן הטריוויה
        </button>
      </div>
    </main>
  );
}
