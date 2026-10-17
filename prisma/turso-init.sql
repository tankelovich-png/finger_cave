-- Student and Attempt tables changed shape (school/grade/classNumber/gender, isPractice).
-- Question is untouched and NOT included here - this file does not touch it.
--
-- Running this against an existing Turso DB wipes any Student/Attempt rows already
-- there (fine before real launch - back up first if real student data exists).
--
-- First time ever running this against a brand-new Turso database? You also need
-- the Question table, which only exists in git history before this change - ask
-- Claude to regenerate it, or run `prisma db push` against the Turso URL directly.

DROP TABLE IF EXISTS "Attempt";
DROP TABLE IF EXISTS "Student";

CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "classNumber" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "timeMs" INTEGER NOT NULL,
    "isPractice" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Student_name_school_grade_classNumber_key" ON "Student"("name", "school", "grade", "classNumber");
CREATE INDEX "Attempt_studentId_idx" ON "Attempt"("studentId");
