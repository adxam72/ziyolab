import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { actor, route, sameOrigin, HttpError } from "@/lib/http";
export const POST = route(async (req) => {
  sameOrigin(req);
  const u = await actor(["STUDENT"]);
  const d = z
    .object({
      assignmentId: z.string(),
      content: z.string().trim().min(10).max(10000),
    })
    .parse(await req.json());
  const a = await db.assignment.findFirst({
    where: {
      id: d.assignmentId,
      groupId: u.groupId ?? "none",
      group: { facultyId: u.facultyId },
    },
  });
  if (!a) throw new HttpError(404, "Topshiriq topilmadi.");
  if (a.dueAt && a.dueAt < new Date())
    throw new HttpError(409, "Topshiriq muddati tugagan.");
  const existing = await db.submission.findUnique({
    where: { userId_assignmentId: { userId: u.id, assignmentId: a.id } },
  });
  if (existing?.grade !== null && existing)
    throw new HttpError(409, "Baholangan javobni o‘zgartirib bo‘lmaydi.");
  await db.submission.upsert({
    where: { userId_assignmentId: { userId: u.id, assignmentId: a.id } },
    create: { ...d, userId: u.id },
    update: { content: d.content },
  });
  return NextResponse.json({ ok: true });
});
