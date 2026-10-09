import "dotenv/config";
import { db } from "../src/lib/db";
async function main() {
  if (process.env.VERCEL || process.env.NODE_ENV === "production")
    throw new Error("Local fixture cleanup only");
  const testUsers = { id: { startsWith: "e2e-" }, facultyId: "pilot-faculty" };
  const ids = (
    await db.user.findMany({ where: testUsers, select: { id: true } })
  ).map((u) => u.id);
  if (!ids.length) return;
  await db.researchComment.deleteMany({
    where: { project: { studentId: { in: ids } } },
  });
  await db.researchProject.deleteMany({ where: { studentId: { in: ids } } });
  await db.portfolioItem.deleteMany({ where: { userId: { in: ids } } });
  await db.submission.deleteMany({ where: { userId: { in: ids } } });
  const groups = (
    await db.group.findMany({
      where: { id: { startsWith: "e2e-" }, facultyId: "pilot-faculty" },
      select: { id: true },
    })
  ).map((g) => g.id);
  await db.assignment.deleteMany({ where: { groupId: { in: groups } } });
  await db.group.updateMany({
    where: { id: { in: groups } },
    data: { teacherId: null },
  });
  await db.user.deleteMany({ where: testUsers });
  await db.group.deleteMany({ where: { id: { in: groups } } });
  console.log("Task-owned browser test fixtures cleaned: " + ids.length);
}
main()
  .catch(() => {
    console.error("Fixture cleanup failed");
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
