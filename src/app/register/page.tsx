"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStudent, saveStudent } from "@/lib/student-storage";

const GRADES = ["א", "ב", "ג", "ד", "ה", "ו"];
const CLASS_NUMBERS = Array.from({ length: 10 }, (_, i) => i + 1);
const DEFAULT_SCHOOL = "בית ספר בבלי, תל אביב";
const DEFAULT_GRADE = "ה";
const DEFAULT_CLASS_NUMBER = "3";

type Role = "תלמיד" | "הורה";

type LeaderRow = {
  name: string;
  grade: string;
  classNumber: number;
  correctCount: number;
  totalCount: number;
};

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("תלמיד");
  const [name, setName] = useState("");
  const [school, setSchool] = useState(DEFAULT_SCHOOL);
  const [grade, setGrade] = useState(DEFAULT_GRADE);
  const [classNumber, setClassNumber] = useState(DEFAULT_CLASS_NUMBER);
  const [gender, setGender] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [leader, setLeader] = useState<LeaderRow | null>(null);
  const [returningName, setReturningName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        const top = data.rows?.[0];
        if (top) setLeader(top);
      })
      .catch(() => {});

    const existing = loadStudent();
    if (existing) {
      const existingRole: Role = existing.role === "הורה" ? "הורה" : "תלמיד";
      setRole(existingRole);
      setName(existing.name);
      setSchool(existing.school);
      if (existingRole === "תלמיד") {
        setGrade(existing.grade || DEFAULT_GRADE);
        setClassNumber(existing.classNumber ? String(existing.classNumber) : DEFAULT_CLASS_NUMBER);
      }
      setGender(existing.gender ?? "");
      setReturningName(existing.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRoleChange(nextRole: Role) {
    setRole(nextRole);
    setGender(""); // gender options differ between roles, so reset the choice
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !school.trim() || !gender) {
      setError("יש למלא את כל השדות");
      return;
    }
    if (role === "תלמיד" && (!grade || !classNumber)) {
      setError("יש למלא את כל השדות");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          school: school.trim(),
          role,
          grade: role === "תלמיד" ? grade : undefined,
          classNumber: role === "תלמיד" ? Number(classNumber) : undefined,
          gender,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "שגיאה ברישום");
        return;
      }
      saveStudent(data);
      router.push("/learn");
    } catch {
      setError("שגיאת תקשורת, נסו שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="card">
        <span className="eyebrow">שלב 1 • הרשמה</span>
        <h1 className="hero-title">גלו את סודות מערת האצבע והכרמל</h1>
        <p className="subtitle">
          זה כיף, זה תחרותי, וזה בכלל לא חובה 😉 - הירשמו כדי להתחיל את המסע.
        </p>

        {leader && (
          <div className="gender-banner">
            🏆 כרגע מוביל/ה: {leader.name} ({leader.grade}׳{leader.classNumber}) עם{" "}
            {leader.correctCount}/{leader.totalCount} נכונות!
          </div>
        )}

        {returningName && (
          <p className="muted" style={{ marginBottom: 12 }}>
            נראה שכבר נרשמת בעבר בתור <strong>{returningName}</strong>. אפשר להמשיך איתו/ה, או
            לשנות את השם ולהירשם בתור מתחרה חדש/ה.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label>מי אתם?</label>
          <div className="gender-toggle" style={{ marginBottom: 16 }}>
            <button
              type="button"
              className={`choice-btn gender-btn${role === "תלמיד" ? " selected" : ""}`}
              onClick={() => handleRoleChange("תלמיד")}
            >
              תלמיד/ה
            </button>
            <button
              type="button"
              className={`choice-btn gender-btn${role === "הורה" ? " selected" : ""}`}
              onClick={() => handleRoleChange("הורה")}
            >
              הורה
            </button>
          </div>

          <label htmlFor="name">שם מלא</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="לדוגמה: נועה כהן"
            autoComplete="name"
          />

          <label htmlFor="school">בית ספר</label>
          <input
            id="school"
            type="text"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="שם בית הספר"
          />

          {role === "תלמיד" && (
            <>
              <div className="field-row">
                <div>
                  <label htmlFor="grade">שכבה</label>
                  <select id="grade" value={grade} onChange={(e) => setGrade(e.target.value)}>
                    <option value="" disabled>
                      בחרו שכבה
                    </option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}׳
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="classNumber">מספר כיתה</label>
                  <select
                    id="classNumber"
                    value={classNumber}
                    onChange={(e) => setClassNumber(e.target.value)}
                  >
                    <option value="" disabled>
                      בחרו מספר
                    </option>
                    {CLASS_NUMBERS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {grade === "ה" && classNumber === "3" && (
                <p className="class-slogan">ה׳3 בבלי הכי טובים! 🏆</p>
              )}

              <label>מין</label>
              <p className="muted" style={{ marginTop: -4, marginBottom: 8 }}>
                יש גם תחרות בנים נגד בנות! ככל שיותר בנים ובנות יענו, כך יגדלו הסיכויים של הקבוצה
                שלכם לנצח 💪
              </p>
              <div className="gender-toggle">
                <button
                  type="button"
                  className={`choice-btn gender-btn${gender === "בן" ? " selected" : ""}`}
                  onClick={() => setGender("בן")}
                >
                  בן
                </button>
                <button
                  type="button"
                  className={`choice-btn gender-btn${gender === "בת" ? " selected" : ""}`}
                  onClick={() => setGender("בת")}
                >
                  בת
                </button>
              </div>
            </>
          )}

          {role === "הורה" && (
            <>
              <label>אתם...</label>
              <div className="gender-toggle">
                <button
                  type="button"
                  className={`choice-btn gender-btn${gender === "אבא" ? " selected" : ""}`}
                  onClick={() => setGender("אבא")}
                >
                  אבא
                </button>
                <button
                  type="button"
                  className={`choice-btn gender-btn${gender === "אמא" ? " selected" : ""}`}
                  onClick={() => setGender("אמא")}
                >
                  אמא
                </button>
              </div>
              <p className="muted" style={{ marginTop: 8 }}>
                יש לכם לוח מובילים נפרד משלכם - לא תתחרו בילדים/ות 😉 ויש גם תחרות אבות נגד אמהות!
              </p>
            </>
          )}

          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn" disabled={loading} style={{ marginTop: 16 }}>
            {loading ? "נרשמים..." : "בואו נתחיל"}
          </button>
        </form>
      </div>
    </main>
  );
}
