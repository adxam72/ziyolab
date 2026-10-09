import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { actor, route, sameOrigin } from "@/lib/http";
import { portfolioSchema } from "@/lib/validation";
export const POST = route(async (req) => {
  sameOrigin(req);
  const u = await actor(["STUDENT"]);
  const d = portfolioSchema.parse(await req.json());
  return NextResponse.json(
    await db.portfolioItem.create({
      data: { ...d, url: d.url || null, userId: u.id },
    }),
    { status: 201 },
  );
});
