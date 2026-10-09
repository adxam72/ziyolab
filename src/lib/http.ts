import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { currentUser } from "./auth";
import { db } from "./db";
import { tokenHash } from "./password";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function actor(roles?: string[]) {
  const u = await currentUser();
  if (!u) throw new HttpError(401, "Avval tizimga kiring.");
  if (roles && !roles.includes(u.role))
    throw new HttpError(403, "Bu amal uchun ruxsat yo‘q.");
  return u;
}
export function sameOrigin(req: Request) {
  const configured = process.env.APP_URL;
  if (!configured) throw new HttpError(503, "APP_URL sozlanmagan.");
  if (req.headers.get("origin") !== new URL(configured).origin)
    throw new HttpError(403, "So‘rov manbasi tasdiqlanmadi.");
}
export async function rateLimit(key: string, max: number, seconds: number) {
  const hashed = tokenHash(key);
  const cutoff = new Date(Date.now() - seconds * 1000);
  const rows = await db.$queryRaw<
    { count: number }[]
  >`INSERT INTO "RateLimit" ("key","count","windowStart") VALUES (${hashed},1,NOW()) ON CONFLICT ("key") DO UPDATE SET "count"=CASE WHEN "RateLimit"."windowStart" < ${cutoff} THEN 1 ELSE "RateLimit"."count"+1 END, "windowStart"=CASE WHEN "RateLimit"."windowStart" < ${cutoff} THEN NOW() ELSE "RateLimit"."windowStart" END RETURNING "count"`;
  if (rows[0].count > max)
    throw new HttpError(
      429,
      "Juda ko‘p urinish. Birozdan so‘ng qayta urinib ko‘ring.",
    );
}
export function route(fn: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    try {
      return await fn(req);
    } catch (e) {
      if (e instanceof HttpError)
        return NextResponse.json({ error: e.message }, { status: e.status });
      if (e instanceof ZodError)
        return NextResponse.json(
          { error: "Kiritilgan ma’lumotlarni tekshiring." },
          { status: 400 },
        );
      console.error(
        "Server operation failed",
        e instanceof Error ? e.name : "Unknown",
      );
      return NextResponse.json(
        { error: "Amal bajarilmadi. Qayta urinib ko‘ring." },
        { status: 500 },
      );
    }
  };
}
