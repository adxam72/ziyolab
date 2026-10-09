import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { actor, route, sameOrigin, rateLimit } from "@/lib/http";
import { indexMaterial } from "@/lib/ai";
export const POST = route(async (req) => {
  sameOrigin(req);
  const u = await actor(["TEACHER", "ADMIN"]);
  const data = z
    .object({
      title: z.string().trim().min(3).max(200),
      content: z.string().trim().min(30).max(18000),
      skillId: z.string(),
    })
    .parse(await req.json());
  const material = await db.material.create({
    data: { ...data, facultyId: u.facultyId, authorId: u.id },
  });
  return NextResponse.json({ id: material.id }, { status: 201 });
});
export const PATCH = route(async (req) => {
  sameOrigin(req);
  const u = await actor(["TEACHER", "ADMIN"]);
  await rateLimit("index:" + u.id, 25, 3600);
  const data = z.object({ id: z.string() }).parse(await req.json());
  await indexMaterial(data.id, u.facultyId);
  return NextResponse.json({ ok: true });
});
