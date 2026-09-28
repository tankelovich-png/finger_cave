import { PrismaClient } from "@prisma/client";
import { questions } from "./questions.data";

const prisma = new PrismaClient();

async function main() {
  await prisma.question.deleteMany();
  await prisma.question.createMany({
    data: questions.map((q) => ({
      text: q.text,
      choices: JSON.stringify(q.choices),
      correctIndex: q.correctIndex,
      sourceHint: q.sourceHint,
    })),
  });
  console.log(`Seeded ${questions.length} questions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
