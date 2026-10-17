import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "סיסמה שגויה" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 50) {
    return NextResponse.json({ error: "שם לא תקין" }, { status: 400 });
  }

  const student = await prisma.student.update({
    where: { id: params.id },
    data: { name },
  });

  return NextResponse.json({ id: student.id, name: student.name });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "סיסמה שגויה" }, { status: 401 });
  }

  await prisma.attempt.deleteMany({ where: { studentId: params.id } });
  await prisma.student.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
