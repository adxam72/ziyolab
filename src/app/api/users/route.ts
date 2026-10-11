import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { actor, route, sameOrigin, HttpError } from "@/lib/http";
import { hashPassword } from "@/lib/password";
export const POST = route(async (req) => {
  sameOrigin(req);
  const u = await actor(["ADMIN"]);
  const d = z
    .object({
      name: z.string().trim().min(2).max(100),
      email: z
        .email()
        .max(254)
        .transform((v) => v.toLowerCase()),
      password: z.string().min(12).max(128),
      role: z.enum(["STUDENT", "TEACHER", "SUPERVISOR"]),
      groupId: z.string().optional(),
    })
    .parse(await req.json());
  if (await db.user.findUnique({ where: { email: d.email } }))
    throw new HttpError(409, "Bu email allaqachon mavjud.");
  if (
    d.groupId &&
    !(await db.group.findFirst({
      where: { id: d.groupId, facultyId: u.facultyId },
    }))
  )
    throw new HttpError(400, "Guruh noto‘g‘ri.");
  const user = await db.user.create({
    data: {
      name: d.name,
      email: d.email,
      passwordHash: await hashPassword(d.password),
      role: d.role,
      facultyId: u.facultyId,
      groupId: d.role === "STUDENT" ? d.groupId || undefined : undefined,
    },
    select: { id: true, name: true },
  });
  if (d.role === "TEACHER" && d.groupId)
    await db.group.update({
      where: { id: d.groupId },
      data: { teacherId: user.id },
    });
  return NextResponse.json(user, { status: 201 });
});
