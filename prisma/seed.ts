import { questions } from "./questions.data";
import { prisma } from "../src/lib/db";

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
