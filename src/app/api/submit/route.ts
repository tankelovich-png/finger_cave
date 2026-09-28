import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type SubmittedAnswer = { questionId: string; selectedText: string };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const studentId = typeof body?.studentId === "string" ? body.studentId : "";
  const timeMs = Number.isFinite(body?.timeMs) ? Math.max(0, Math.round(body.timeMs)) : null;
  const answers: SubmittedAnswer[] = Array.isArray(body?.answers) ? body.answers : [];

  if (!studentId || timeMs === null || answers.length === 0) {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    return NextResponse.json({ error: "תלמיד לא נמצא, יש להירשם מחדש" }, { status: 404 });
  }

  const questionIds = answers.map((a) => a.questionId);
  const questions = await prisma.question.findMany({ where: { id: { in: questionIds } } });
  const byId = new Map(questions.map((q) => [q.id, q]));

  let correctCount = 0;
  const details = answers.map((a) => {
    const q = byId.get(a.questionId);
    if (!q) {
      return {
        questionId: a.questionId,
        text: "",
        selectedText: a.selectedText,
        correctText: "",
        isCorrect: false,
        sourceHint: "",
      };
    }
    const choices = JSON.parse(q.choices) as string[];
    const correctText = choices[q.correctIndex];
    const isCorrect = a.selectedText === correctText;
    if (isCorrect) correctCount += 1;
    return {
      questionId: q.id,
      text: q.text,
      selectedText: a.selectedText,
      correctText,
      isCorrect,
      sourceHint: q.sourceHint,
    };
  });

  await prisma.attempt.create({
    data: {
      studentId,
      correctCount,
      totalCount: answers.length,
      timeMs,
    },
  });

  return NextResponse.json({
    correctCount,
    totalCount: answers.length,
    timeMs,
    details,
  });
}
