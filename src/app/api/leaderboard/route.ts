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

export async function GET() {
  const attempts = await prisma.attempt.findMany({
    include: { student: true },
  });

  const bestByStudent = new Map<string, (typeof attempts)[number]>();
  for (const attempt of attempts) {
    const current = bestByStudent.get(attempt.studentId);
    if (!current || isBetter(attempt, current)) {
      bestByStudent.set(attempt.studentId, attempt);
    }
  }

  const rows = Array.from(bestByStudent.values())
    .sort((a, b) => (isBetter(a, b) ? -1 : isBetter(b, a) ? 1 : 0))
    .map((attempt) => ({
      studentId: attempt.studentId,
      name: attempt.student.name,
      className: attempt.student.className,
      correctCount: attempt.correctCount,
      totalCount: attempt.totalCount,
      timeMs: attempt.timeMs,
    }));

  return NextResponse.json({ rows });
}
