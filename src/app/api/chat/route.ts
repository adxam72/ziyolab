import { NextResponse } from "next/server";
import { z } from "zod";
import { actor, route, sameOrigin, rateLimit } from "@/lib/http";
import { rag } from "@/lib/ai";
export const POST = route(async (req) => {
  sameOrigin(req);
  const u = await actor();
  await rateLimit("chat:" + u.id, 20, 3600);
  const data = z
    .object({ question: z.string().trim().min(3).max(2000) })
    .parse(await req.json());
  return NextResponse.json(await rag(u.id, u.facultyId, data.question));
});
