import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const VALID_GRADES = ["א", "ב", "ג", "ד", "ה", "ו"];
const VALID_ROLES = ["תלמיד", "הורה"];
const VALID_STUDENT_GENDERS = ["בן", "בת"];
const VALID_PARENT_GENDERS = ["אבא", "אמא"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const school = typeof body?.school === "string" ? body.school.trim() : "";
  const role = VALID_ROLES.includes(body?.role) ? body.role : "תלמיד";
  const gender = typeof body?.gender === "string" ? body.gender.trim() : "";

  if (!name || !school || !gender) {
    return NextResponse.json({ error: "יש למלא את כל השדות" }, { status: 400 });
  }
  if (name.length > 50 || school.length > 100) {
    return NextResponse.json({ error: "שם או בית ספר ארוכים מדי" }, { status: 400 });
  }

  let grade = "";
  let classNumber = 0;

  if (role === "תלמיד") {
    grade = typeof body?.grade === "string" ? body.grade.trim() : "";
    classNumber = Number.isInteger(body?.classNumber) ? body.classNumber : NaN;

    if (!grade || Number.isNaN(classNumber)) {
      return NextResponse.json({ error: "יש למלא את כל השדות" }, { status: 400 });
    }
    if (!VALID_GRADES.includes(grade)) {
      return NextResponse.json({ error: "שכבה לא תקינה" }, { status: 400 });
    }
    if (classNumber < 1 || classNumber > 10) {
      return NextResponse.json({ error: "מספר כיתה לא תקין" }, { status: 400 });
    }
    if (!VALID_STUDENT_GENDERS.includes(gender)) {
      return NextResponse.json({ error: "יש לבחור בן/בת" }, { status: 400 });
    }
  } else {
    if (!VALID_PARENT_GENDERS.includes(gender)) {
      return NextResponse.json({ error: "יש לבחור אבא/אמא" }, { status: 400 });
    }
  }

  const student = await prisma.student.upsert({
    where: { name_school_role_grade_classNumber: { name, school, role, grade, classNumber } },
    update: { gender },
    create: { name, school, role, grade, classNumber, gender },
  });

  return NextResponse.json({
    id: student.id,
    name: student.name,
    school: student.school,
    role: student.role,
    grade: student.grade,
    classNumber: student.classNumber,
    gender: student.gender,
  });
}
