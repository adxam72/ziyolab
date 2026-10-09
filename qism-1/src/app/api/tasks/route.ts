import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { actor, route, sameOrigin, HttpError } from "@/lib/http";
export const PATCH = route(async (req) => {
  sameOrigin(req);
  const u = await actor(["STUDENT"]);
  const data = z
    .object({ id: z.string(), done: z.boolean() })
    .parse(await req.json());
  const r = await db.learningTask.updateMany({
    where: { id: data.id, userId: u.id },
    data: { done: data.done },
  });
  if (!r.count) throw new HttpError(404, "Vazifa topilmadi.");
  return NextResponse.json({ ok: true });
});
