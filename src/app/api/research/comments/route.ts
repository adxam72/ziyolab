import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { actor, route, sameOrigin, HttpError } from "@/lib/http";
import { projectScope } from "@/lib/research";
export const POST = route(async (req) => {
  sameOrigin(req);
  const u = await actor(["SUPERVISOR", "ADMIN"]);
  const d = z
    .object({
      projectId: z.string(),
      content: z.string().trim().min(3).max(3000),
    })
    .parse(await req.json());
  if (
    !(await db.researchProject.findFirst({
      where: { id: d.projectId, ...projectScope(u) },
    }))
  )
    throw new HttpError(404, "Loyiha topilmadi.");
  await db.researchComment.create({ data: { ...d, authorId: u.id } });
  return NextResponse.json({ ok: true });
});
