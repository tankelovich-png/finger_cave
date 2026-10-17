import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "סיסמה שגויה" }, { status: 401 });
  }

  const students = await prisma.student.findMany({
    include: { attempts: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    students: students.map((s) => ({
      id: s.id,
      name: s.name,
      school: s.school,
      grade: s.grade,
      classNumber: s.classNumber,
      gender: s.gender,
      attempts: s.attempts.map((a) => ({
        id: a.id,
        correctCount: a.correctCount,
        totalCount: a.totalCount,
        timeMs: a.timeMs,
        isPractice: a.isPractice,
        createdAt: a.createdAt,
      })),
    })),
  });
}
