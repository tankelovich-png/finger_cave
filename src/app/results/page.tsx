"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStudent, type CurrentStudent } from "@/lib/student-storage";

type Detail = {
  questionId: string;
  text: string;
  selectedText: string;
  correctText: string;
  isCorrect: boolean;
  sourceHint: string;
};

type SubmitResult = {
  correctCount: number;
  totalCount: number;
  timeMs: number;
  details: Detail[];
};

type LeaderboardRow = {
  studentId: string;
  name: string;
  school: string;
  grade: string;
  classNumber: number;
  correctCount: number;
  totalCount: number;
  timeMs: number;
};

type GenderTotals = { "בן": number; "בת": number };

function formatTime(ms: number) {
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ResultsPage() {
  const router = useRouter();
  const [student, setStudent] = useState<CurrentStudent | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [genderTotals, setGenderTotals] = useState<GenderTotals | null>(null);
  const [loadingBoard, setLoadingBoard] = useState(true);

  useEffect(() => {
    const s = loadStudent();
    if (!s) {
      router.replace("/register");
      return;
    }
    setStudent(s);

    const raw = sessionStorage.getItem("fingerCave.lastResult");
    if (!raw) {
      router.replace("/quiz");
      return;
    }
    setResult(JSON.parse(raw));

    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setRows(data.rows ?? []);
        setGenderTotals(data.genderTotals ?? null);
      })
      .finally(() => setLoadingBoard(false));
  }, [router]);

  if (!student || !result) return null;

  const boysLead = genderTotals && genderTotals["בן"] !== genderTotals["בת"]
    ? genderTotals["בן"] > genderTotals["בת"]
    : null;

  const peerGroup = student.gender === "בן" ? "הבנים" : "הבנות";

  return (
    <main>
      <div className="card">
        <span className="eyebrow">שלב 4 • התוצאה שלך</span>
        <div className="result-summary">
          <div className="result-score">
            {result.correctCount}/{result.totalCount}
          </div>
          <div className="result-time">זמן: {formatTime(result.timeMs)} דקות</div>
        </div>

        <h3>מה למדנו הפעם?</h3>
        <ul className="explanation-list">
          {result.details.map((d) => (
            <li key={d.questionId} className={d.isCorrect ? "correct" : "incorrect"}>
              <strong>{d.text}</strong>
              <br />
              {d.isCorrect ? "✅ נכון!" : `❌ בחרת: ${d.selectedText}. התשובה הנכונה: ${d.correctText}`}
              <span className="hint">{d.sourceHint}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <span className="eyebrow">שלב 4 • לוח המובילים</span>
        <h2>הכי טובים בכיתה</h2>

        {genderTotals && boysLead !== null && (
          <div className="gender-banner">
            {boysLead
              ? `👦 הבנים מובילים כרגע על הבנות! (${genderTotals["בן"]} מול ${genderTotals["בת"]} תשובות נכונות)`
              : `👧 הבנות מובילות כרגע על הבנים! (${genderTotals["בת"]} מול ${genderTotals["בן"]} תשובות נכונות)`}
          </div>
        )}

        {loadingBoard ? (
          <p className="muted">טוען לוח מובילים...</p>
        ) : (
          <table className="leaderboard">
            <thead>
              <tr>
                <th>#</th>
                <th>שם</th>
                <th>כיתה</th>
                <th>נכונות</th>
                <th>זמן</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.studentId} className={row.studentId === student.id ? "you" : ""}>
                  <td>{i + 1}</td>
                  <td>{row.name}</td>
                  <td>
                    {row.grade}׳{row.classNumber}
                  </td>
                  <td>
                    {row.correctCount}/{row.totalCount}
                  </td>
                  <td>{formatTime(row.timeMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="muted" style={{ marginTop: 20, marginBottom: 10, textAlign: "center" }}>
          רוצה לנסות שוב ולהשיג תוצאה טובה יותר עבורך ועבור שאר {peerGroup}?
        </p>
        <button className="btn" onClick={() => router.push("/quiz")}>
          נסו שוב
        </button>
      </div>
    </main>
  );
}
