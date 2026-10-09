import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, tokenHash } from "@/lib/password";
import { route, sameOrigin, rateLimit, HttpError } from "@/lib/http";
import { sessionResponse } from "@/lib/session-response";

const schema = z
  .strictObject({
    name: z.string().trim().min(2).max(100),
    email: z
      .string()
      .trim()
      .pipe(z.email().max(254))
      .transform((v) => v.toLowerCase()),
    password: z.string().min(12).max(128),
    confirmPassword: z.string().min(12).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parollar mos kelmadi.",
    path: ["confirmPassword"],
  });

export const POST = route(async (req) => {
  sameOrigin(req);
  const client = process.env.VERCEL
    ? (req.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim()
        .slice(0, 128) ?? "unknown")
    : "local";
  await rateLimit("register:client:" + client, 40, 3600);
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    throw new HttpError(
      400,
      parsed.error.issues.some((issue) => issue.path[0] === "confirmPassword")
        ? "Parollar mos kelmadi. Ikkala maydonga bir xil parol kiriting."
        : "Ism, email va kamida 12 belgili parolni tekshiring.",
    );
  const data = parsed.data;
  await rateLimit("register:email:" + data.email, 5, 3600);
  const facultyId = process.env.REGISTRATION_FACULTY_ID ?? "pilot-faculty";
  const faculty = await db.faculty.findUnique({
    where: { id: facultyId },
    select: { id: true },
  });
  if (!faculty)
    throw new HttpError(
      503,
      "Ro‘yxatdan o‘tish hozircha sozlanmagan. Mas’ulga murojaat qiling.",
    );
  const passwordHash = await hashPassword(data.password);
  const token = randomBytes(32).toString("hex");
  try {
    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash,
          role: "STUDENT",
          facultyId,
        },
      });
      await tx.session.create({
        data: {
          userId: user.id,
          tokenHash: tokenHash(token),
          expiresAt: new Date(Date.now() + 7 * 86400000),
        },
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      throw new HttpError(
        409,
        "Bu email bilan akkaunt mavjud. Tizimga kiring.",
      );
    throw error;
  }
  return sessionResponse(token, 201);
});
