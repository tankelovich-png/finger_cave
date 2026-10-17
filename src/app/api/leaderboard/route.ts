import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function isBetter(
  a: { correctCount: number; timeMs: number },
  b: { correctCount: number; timeMs: number }
) {
  if (a.correctCount !== b.correctCount) return a.correctCount > b.correctCount;
  return a.timeMs < b.timeMs;
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") === "הורה" ? "הורה" : "תלמיד";

  const attempts = await prisma.attempt.findMany({
    where: { isPractice: false, student: { role } },
    include: { student: true },
  });

  const bestByStudent = new Map<string, (typeof attempts)[number]>();
  for (const attempt of attempts) {
    const current = bestByStudent.get(attempt.studentId);
    if (!current || isBetter(attempt, current)) {
      bestByStudent.set(attempt.studentId, attempt);
    }
  }

  const bestAttempts = Array.from(bestByStudent.values());

  const rows = bestAttempts
    .sort((a, b) => (isBetter(a, b) ? -1 : isBetter(b, a) ? 1 : 0))
    .map((attempt) => ({
      studentId: attempt.studentId,
      name: attempt.student.name,
      school: attempt.student.school,
      grade: attempt.student.grade,
      classNumber: attempt.student.classNumber,
      correctCount: attempt.correctCount,
      totalCount: attempt.totalCount,
      timeMs: attempt.timeMs,
    }));

  let genderTotals: Record<string, number> | null = null;
  if (role === "תלמיד") {
    genderTotals = { "בן": 0, "בת": 0 };
    for (const attempt of bestAttempts) {
      const gender = attempt.student.gender;
      if (gender === "בן" || gender === "בת") {
        genderTotals[gender] += attempt.correctCount;
      }
    }
  }

  return NextResponse.json({ rows, genderTotals });
}
