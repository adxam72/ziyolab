import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { COOKIE } from "@/lib/auth";
import { tokenHash } from "@/lib/password";
import { route, sameOrigin } from "@/lib/http";
export const POST = route(async (req) => {
  sameOrigin(req);
  const token = (await cookies()).get(COOKIE)?.value;
  if (token)
    await db.session.deleteMany({ where: { tokenHash: tokenHash(token) } });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
  return res;
});
