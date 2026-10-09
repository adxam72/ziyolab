import "dotenv/config";
import { z } from "zod";
import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/password";
async function main() {
  const d = z
    .object({
      email: z.email(),
      name: z.string().min(2),
      password: z.string().min(12).max(128),
      role: z.enum(["STUDENT", "TEACHER", "SUPERVISOR", "ADMIN"]),
      facultyId: z.string(),
    })
    .parse({
      email: process.env.NEW_USER_EMAIL,
      name: process.env.NEW_USER_NAME,
      password: process.env.NEW_USER_PASSWORD,
      role: process.env.NEW_USER_ROLE ?? "STUDENT",
      facultyId: process.env.NEW_USER_FACULTY ?? "pilot-faculty",
    });
  const { password, ...data } = d;
  await db.user.create({
    data: {
      ...data,
      email: data.email.toLowerCase(),
      passwordHash: await hashPassword(password),
    },
  });
  console.log("Foydalanuvchi yaratildi.");
}
main()
  .catch(() => {
    console.error(
      "Yaratilmadi. NEW_USER_* environment yoki emailni tekshiring.",
    );
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
