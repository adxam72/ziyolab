import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { actor, route, sameOrigin, HttpError } from "@/lib/http";
export const POST = route(async (req) => {
  sameOrigin(req);
  const u = await actor(["TEACHER", "ADMIN"]);
  const data = z
    .object({
      groupId: z.string(),
      title: z.string().trim().min(3).max(200),
      description: z.string().trim().min(10).max(5000),
      dueAt: z.string().optional(),
    })
    .parse(await req.json());
  const group = await db.group.findFirst({
    where: {
      id: data.groupId,
      facultyId: u.facultyId,
      ...(u.role === "TEACHER" ? { teacherId: u.id } : {}),
    },
  });
  if (!group) throw new HttpError(403, "Guruhga ruxsat yo‘q.");
  let dueAt: Date | undefined;
  if (data.dueAt) {
    dueAt = new Date(data.dueAt);
    if (!Number.isFinite(dueAt.getTime()))
      throw new HttpError(400, "Muddat noto‘g‘ri.");
  }
  return NextResponse.json(
    await db.assignment.create({
      data: {
        groupId: data.groupId,
        title: data.title,
        description: data.description,
        dueAt,
        teacherId: u.id,
      },
    }),
    { status: 201 },
  );
});
export const PATCH = route(async (req) => {
  sameOrigin(req);
  const u = await actor(["TEACHER", "ADMIN"]);
  const data = z
    .object({
      submissionId: z.string(),
      grade: z.number().int().min(0).max(100),
      feedback: z.string().trim().min(1).max(3000),
    })
    .parse(await req.json());
  const s = await db.submission.findFirst({
    where: {
      id: data.submissionId,
      assignment: {
        group: {
          facultyId: u.facultyId,
          ...(u.role === "TEACHER" ? { teacherId: u.id } : {}),
        },
      },
    },
  });
  if (!s) throw new HttpError(404, "Javob topilmadi.");
  await db.submission.update({
    where: { id: s.id },
    data: { grade: data.grade, feedback: data.feedback },
  });
  return NextResponse.json({ ok: true });
});
