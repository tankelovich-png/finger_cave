import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { shuffle } from "@/lib/shuffle";

const QUIZ_LENGTH = 5;

export const dynamic = "force-dynamic";

export async function GET() {
  const all = await prisma.question.findMany({ select: { id: true } });
  if (all.length === 0) {
    return NextResponse.json({ error: "מאגר השאלות ריק - יש להריץ seed" }, { status: 500 });
  }

  const pickedIds = shuffle(all).slice(0, Math.min(QUIZ_LENGTH, all.length)).map((q) => q.id);
  const picked = await prisma.question.findMany({ where: { id: { in: pickedIds } } });

  // findMany doesn't preserve `in` order, so re-order to match our random pick
  const byId = new Map(picked.map((q) => [q.id, q]));
  const ordered = pickedIds.map((id) => byId.get(id)!);

  const payload = ordered.map((q) => ({
    id: q.id,
    text: q.text,
    choices: shuffle(JSON.parse(q.choices) as string[]),
  }));

  return NextResponse.json({ questions: payload });
}
