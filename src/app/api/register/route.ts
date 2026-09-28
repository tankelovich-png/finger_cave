import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const className = typeof body?.className === "string" ? body.className.trim() : "";

  if (!name || !className) {
    return NextResponse.json({ error: "יש למלא שם וכיתה" }, { status: 400 });
  }
  if (name.length > 50 || className.length > 20) {
    return NextResponse.json({ error: "שם או כיתה ארוכים מדי" }, { status: 400 });
  }

  const student = await prisma.student.upsert({
    where: { name_className: { name, className } },
    update: {},
    create: { name, className },
  });

  return NextResponse.json({ id: student.id, name: student.name, className: student.className });
}
