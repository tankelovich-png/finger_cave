"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStudent, type CurrentStudent } from "@/lib/student-storage";

type ApiQuestion = { id: string; text: string; choices: string[] };
type Answer = { questionId: string; selectedText: string };

export default function QuizPage() {
  const router = useRouter();
  const [student, setStudent] = useState<CurrentStudent | null>(null);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const s = loadStudent();
    if (!s) {
      router.replace("/");
      return;
    }
    setStudent(s);

    fetch("/api/questions")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setQuestions(data.questions);
        startRef.current = Date.now();
      })
      .catch(() => setError("לא הצלחנו לטעון שאלות, נסו לרענן"))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!startRef.current) return;
    const interval = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - (startRef.current ?? Date.now())) / 1000));
    }, 250);
    return () => clearInterval(interval);
  }, [questions]);

  if (!student) return null;
  if (loading) return <main><div className="card">טוען שאלות...</div></main>;
  if (error) return <main><div className="card"><p className="error-text">{error}</p></div></main>;
  if (questions.length === 0) return null;

  const current = questions[index];
  const isLast = index === questions.length - 1;

  function choose(choiceText: string) {
    setSelected(choiceText);
  }

  async function next() {
    if (!selected || !student) return;
    const updatedAnswers = [...answers, { questionId: current.id, selectedText: selected }];
    setAnswers(updatedAnswers);
    setSelected(null);

    if (!isLast) {
      setIndex(index + 1);
      return;
    }

    setSubmitting(true);
    const timeMs = Date.now() - (startRef.current ?? Date.now());
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, timeMs, answers: updatedAnswers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "שגיאה בשליחת התשובות");
        setSubmitting(false);
        return;
      }
      sessionStorage.setItem("fingerCave.lastResult", JSON.stringify(data));
      router.push("/results");
    } catch {
      setError("שגיאת תקשורת בשליחת התשובות");
      setSubmitting(false);
    }
  }

  const progressPct = ((index + (selected ? 1 : 0)) / questions.length) * 100;
  const minutes = Math.floor(elapsedSec / 60);
  const seconds = elapsedSec % 60;

  return (
    <main>
      <div className="card">
        <span className="eyebrow">
          שלב 2 • שאלה {index + 1} מתוך {questions.length}
        </span>
        <span className="timer-badge">
          ⏱ {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="question-text">{current.text}</p>
        {current.choices.map((choice) => (
          <button
            key={choice}
            className={`choice-btn${selected === choice ? " selected" : ""}`}
            onClick={() => choose(choice)}
            disabled={submitting}
          >
            {choice}
          </button>
        ))}
        <button
          className="btn"
          style={{ marginTop: 16 }}
          onClick={next}
          disabled={!selected || submitting}
        >
          {submitting ? "שולח..." : isLast ? "סיימו את הבוחן" : "לשאלה הבאה"}
        </button>
        {error && <p className="error-text">{error}</p>}
      </div>
    </main>
  );
}
