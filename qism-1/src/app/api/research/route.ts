import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { actor, route, sameOrigin, HttpError } from "@/lib/http";
import { projectScope } from "@/lib/research";
export const POST = route(async (req) => {
  sameOrigin(req);
  const u = await actor(["STUDENT"]);
  const data = z
    .object({
      title: z.string().trim().min(5).max(200),
      question: z.string().trim().min(10).max(2000),
      method: z.string().trim().min(10).max(3000),
      supervisorId: z.string().optional(),
    })
    .parse(await req.json());
  if (data.supervisorId) {
    const s = await db.user.findFirst({
      where: {
        id: data.supervisorId,
        facultyId: u.facultyId,
        role: "SUPERVISOR",
      },
    });
    if (!s) throw new HttpError(400, "Rahbar noto‘g‘ri.");
  }
  return NextResponse.json(
    await db.researchProject.create({
      data: {
        ...data,
        supervisorId: data.supervisorId || undefined,
        studentId: u.id,
        facultyId: u.facultyId,
      },
    }),
    { status: 201 },
  );
});
export const PATCH = route(async (req) => {
  sameOrigin(req);
  const u = await actor(["STUDENT", "SUPERVISOR", "ADMIN"]);
  const data = z
    .object({
      id: z.string(),
      stage: z.enum([
        "IDEA",
        "LITERATURE",
        "METHOD",
        "DATA",
        "ANALYSIS",
        "COMPLETED",
      ]),
      outcome: z.string().max(5000).optional(),
    })
    .parse(await req.json());
  const project = await db.researchProject.findFirst({
    where: { id: data.id, ...projectScope(u) },
  });
  if (!project) throw new HttpError(404, "Loyiha topilmadi.");
  if (data.stage === "COMPLETED" && !(data.outcome ?? project.outcome).trim())
    throw new HttpError(400, "Yakuniy natijani yozing.");
  await db.researchProject.update({
    where: { id: project.id },
    data: { stage: data.stage, outcome: data.outcome },
  });
  return NextResponse.json({ ok: true });
});
