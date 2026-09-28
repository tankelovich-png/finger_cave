"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveStudent } from "@/lib/student-storage";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !className.trim()) {
      setError("יש למלא שם וכיתה");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), className: className.trim() }),
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
        <span className="eyebrow">טיול הכיתה • מערת האצבע</span>
        <h1 className="hero-title">גלו את סודות מערת האצבע והכרמל</h1>
        <p className="subtitle">
          לפני הטיול, בואו נלמד קצת ונתחרה קצת. הירשמו כדי להתחיל את המסע.
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">שם מלא</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="לדוגמה: נועה כהן"
            autoComplete="name"
          />
          <label htmlFor="className">כיתה</label>
          <input
            id="className"
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="לדוגמה: ו׳2"
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "נרשמים..." : "בואו נתחיל"}
          </button>
        </form>
      </div>
    </main>
  );
}
