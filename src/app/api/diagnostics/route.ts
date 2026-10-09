import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { actor, route, sameOrigin, HttpError, rateLimit } from "@/lib/http";
import { grade, type SnapshotQuestion } from "@/lib/education";
export const GET = route(async () => {
  const u = await actor(["STUDENT"]);
  const a = await db.assessment.findFirst({
    where: { userId: u.id, status: "STARTED" },
    orderBy: { createdAt: "desc" },
  });
  if (!a) return NextResponse.json(null);
  const qs = a.questions as unknown as SnapshotQuestion[];
  return NextResponse.json({
    id: a.id,
    questions: qs.map(({ id, skillId, prompt, options }) => ({
      id,
      skillId,
      prompt,
      options,
    })),
  });
});
export const POST = route(async (req) => {
  sameOrigin(req);
  const u = await actor(["STUDENT"]);
  await rateLimit("diagnostic:" + u.id, 20, 3600);
  const body = await req.json();
  if (body.action === "start") {
    const existing = await db.assessment.findFirst({
      where: { userId: u.id, status: "STARTED" },
    });
    const questions = await db.question.findMany({
      orderBy: { skillId: "asc" },
    });
    if (!questions.length) throw new HttpError(503, "Savol banki tayyor emas.");
    const a =
      existing ??
      (await db.assessment.create({
        data: {
          userId: u.id,
          questions: questions.map((q) => ({
            id: q.id,
            skillId: q.skillId,
            prompt: q.prompt,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
          })) as Prisma.InputJsonValue,
        },
      }));
    const qs = a.questions as unknown as SnapshotQuestion[];
    return NextResponse.json({
      id: a.id,
      questions: qs.map(({ id, skillId, prompt, options }) => ({
        id,
        skillId,
        prompt,
        options,
      })),
    });
  }
  const data = z
    .object({ id: z.string(), answers: z.record(z.string(), z.number().int()) })
    .parse(body);
  const assessment = await db.assessment.findFirst({
    where: { id: data.id, userId: u.id },
  });
  if (!assessment) throw new HttpError(404, "Diagnostika topilmadi.");
  if (assessment.status === "COMPLETED")
    return NextResponse.json(assessment.results);
  let result: ReturnType<typeof grade>;
  try {
    result = grade(
      assessment.questions as unknown as SnapshotQuestion[],
      data.answers,
    );
  } catch {
    throw new HttpError(400, "Barcha savollarga javob bering.");
  }
  const materials = await db.material.findMany({
    where: { facultyId: u.facultyId },
    select: { id: true, skillId: true },
  });
  await db.$transaction(async (tx) => {
    const lock = await tx.assessment.updateMany({
      where: { id: assessment.id, status: "STARTED" },
      data: {
        status: "COMPLETED",
        answers: data.answers,
        results: result as Prisma.InputJsonValue,
        completedAt: new Date(),
      },
    });
    if (!lock.count) return;
    for (const [skillId, s] of Object.entries(result.bySkill)) {
      await tx.skillScore.upsert({
        where: { userId_skillId: { userId: u.id, skillId } },
        create: {
          userId: u.id,
          skillId,
          percent: s.percent,
          evidenceCount: s.total,
        },
        update: { percent: s.percent, evidenceCount: s.total },
      });
      await tx.learningTask.upsert({
        where: { userId_skillId: { userId: u.id, skillId } },
        create: {
          userId: u.id,
          skillId,
          materialId: materials.find((m) => m.skillId === skillId)?.id,
          recommendation:
            s.percent < 80
              ? "Materialni o‘rganing va mavzuni qayta mashq qiling."
              : "Bilimingizni amaliy misol bilan mustahkamlang.",
        },
        update: {
          done: false,
          recommendation:
            s.percent < 80
              ? "Materialni o‘rganing va mavzuni qayta mashq qiling."
              : "Bilimingizni amaliy misol bilan mustahkamlang.",
        },
      });
    }
  });
  return NextResponse.json(result);
});
