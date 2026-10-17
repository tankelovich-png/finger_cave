import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const VALID_GRADES = ["א", "ב", "ג", "ד", "ה", "ו"];
const VALID_GENDERS = ["בן", "בת"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const school = typeof body?.school === "string" ? body.school.trim() : "";
  const grade = typeof body?.grade === "string" ? body.grade.trim() : "";
  const classNumber = Number.isInteger(body?.classNumber) ? body.classNumber : NaN;
  const gender = typeof body?.gender === "string" ? body.gender.trim() : "";

  if (!name || !school || !grade || !gender || Number.isNaN(classNumber)) {
    return NextResponse.json({ error: "יש למלא את כל השדות" }, { status: 400 });
  }
  if (name.length > 50 || school.length > 100) {
    return NextResponse.json({ error: "שם או בית ספר ארוכים מדי" }, { status: 400 });
  }
  if (!VALID_GRADES.includes(grade)) {
    return NextResponse.json({ error: "שכבה לא תקינה" }, { status: 400 });
  }
  if (classNumber < 1 || classNumber > 10) {
    return NextResponse.json({ error: "מספר כיתה לא תקין" }, { status: 400 });
  }
  if (!VALID_GENDERS.includes(gender)) {
    return NextResponse.json({ error: "יש לבחור בן/בת" }, { status: 400 });
  }

  const student = await prisma.student.upsert({
    where: { name_school_grade_classNumber: { name, school, grade, classNumber } },
    update: { gender },
    create: { name, school, grade, classNumber, gender },
  });

  return NextResponse.json({
    id: student.id,
    name: student.name,
    school: student.school,
    grade: student.grade,
    classNumber: student.classNumber,
    gender: student.gender,
  });
}
