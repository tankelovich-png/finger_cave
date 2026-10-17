import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "סיסמה שגויה" }, { status: 401 });
  }

  await prisma.attempt.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
