"use client";

import { useEffect, useState } from "react";

type Attempt = {
  id: string;
  correctCount: number;
  totalCount: number;
  timeMs: number;
  isPractice: boolean;
  createdAt: string;
};

type Student = {
  id: string;
  name: string;
  school: string;
  role: string;
  grade: string;
  classNumber: number;
  gender: string;
  attempts: Attempt[];
};

const PASSWORD_KEY = "fingerCave.adminPassword";

function formatTime(ms: number) {
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(PASSWORD_KEY);
      if (saved) {
        setPassword(saved);
        void load(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  async function load(pwd: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/overview", {
        headers: { "x-admin-password": pwd },
      });
      if (!res.ok) {
        setAuthorized(false);
        setError("סיסמה שגויה");
        return;
      }
      const data = await res.json();
      setStudents(data.students ?? []);
      setAuthorized(true);
      try {
        sessionStorage.setItem(PASSWORD_KEY, pwd);
      } catch {
        // ignore
      }
    } catch {
      setError("שגיאת תקשורת");
    } finally {
      setLoading(false);
    }
  }

  async function saveName(studentId: string) {
    if (!editingName.trim()) return;
    const res = await fetch(`/api/admin/students/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ name: editingName.trim() }),
    });
    if (res.ok) {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, name: editingName.trim() } : s))
      );
      setEditingId(null);
    }
  }

  async function deleteAttempt(attemptId: string) {
    if (!confirm("למחוק את הניסיון הזה?")) return;
    const res = await fetch(`/api/admin/attempts/${attemptId}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      setStudents((prev) =>
        prev.map((s) => ({ ...s, attempts: s.attempts.filter((a) => a.id !== attemptId) }))
      );
    }
  }

  async function deleteStudent(studentId: string) {
    if (!confirm("למחוק את התלמיד הזה ואת כל הניסיונות שלו?")) return;
    const res = await fetch(`/api/admin/students/${studentId}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    }
  }

  if (!authorized) {
    return (
      <main>
        <div className="card">
          <span className="eyebrow">ניהול</span>
          <h1>כניסת אדמין</h1>
          <label htmlFor="pwd">סיסמה</label>
          <input
            id="pwd"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="error-text">{error}</p>}
          <button className="btn" disabled={loading || !password} onClick={() => load(password)}>
            {loading ? "בודק..." : "כניסה"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="card">
        <span className="eyebrow">ניהול</span>
        <h1>תלמידים וניסיונות</h1>
        <p className="muted">{students.length} תלמידים רשומים</p>
      </div>

      {students.map((s) => (
        <div className="card" key={s.id}>
          {editingId === s.id ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                style={{ marginBottom: 0 }}
              />
              <button className="btn" style={{ width: "auto" }} onClick={() => saveName(s.id)}>
                שמירה
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: "auto" }}
                onClick={() => setEditingId(null)}
              >
                ביטול
              </button>
            </div>
          ) : (
            <h3 style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>
                {s.name} ({s.role}, {s.gender}) - {s.school}
                {s.role === "תלמיד" ? `, ${s.grade}׳${s.classNumber}` : ""}
              </span>
              <span style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-secondary"
                  style={{ width: "auto", padding: "6px 14px", fontSize: "0.85rem" }}
                  onClick={() => {
                    setEditingId(s.id);
                    setEditingName(s.name);
                  }}
                >
                  ערכו שם
                </button>
                <button
                  className="btn"
                  style={{
                    width: "auto",
                    padding: "6px 14px",
                    fontSize: "0.85rem",
                    background: "var(--danger)",
                  }}
                  onClick={() => deleteStudent(s.id)}
                >
                  מחקו תלמיד
                </button>
              </span>
            </h3>
          )}

          {s.attempts.length === 0 ? (
            <p className="muted">אין ניסיונות עדיין</p>
          ) : (
            <table className="leaderboard">
              <thead>
                <tr>
                  <th>נכונות</th>
                  <th>זמן</th>
                  <th>סוג</th>
                  <th>תאריך</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {s.attempts.map((a) => (
                  <tr key={a.id}>
                    <td>
                      {a.correctCount}/{a.totalCount}
                    </td>
                    <td>{formatTime(a.timeMs)}</td>
                    <td>{a.isPractice ? "תרגול" : "רשמי"}</td>
                    <td>{new Date(a.createdAt).toLocaleString("he-IL")}</td>
                    <td>
                      <button
                        className="btn"
                        style={{
                          width: "auto",
                          padding: "4px 10px",
                          fontSize: "0.8rem",
                          background: "var(--danger)",
                        }}
                        onClick={() => deleteAttempt(a.id)}
                      >
                        מחקו
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </main>
  );
}
