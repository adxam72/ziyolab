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
// Only log validated error codes; messages and adapter metadata can contain credentials.
export function serverErrorDetails(error: unknown) {
  const codes = new Set<string>();
  const seen = new Set<object>();
  function visit(value: unknown, depth: number) {
    if (!value || typeof value !== "object" || depth > 5 || seen.has(value)) return;
    seen.add(value);
    const entry = value as Record<string, unknown>;
    for (const key of ["code", "originalCode", "sqlState", "sqlstate"]) {
      const code = entry[key];
      if (typeof code === "string" && /^(?:P\d{4}|[0-9A-Z]{5}|ECONNREFUSED|ECONNRESET|ENOTFOUND|ETIMEDOUT|DEPTH_ZERO_SELF_SIGNED_CERT|SELF_SIGNED_CERT_IN_CHAIN|CERT_HAS_EXPIRED)$/.test(code)) codes.add(code);
    }
    for (const key of ["meta", "cause", "driverAdapterError", "error", "originalError"]) visit(entry[key], depth + 1);
  }
  visit(error, 0);
  const hints: Record<string, string> = {
    P1000: "Database authentication failed", "28P01": "Database authentication failed",
    P1001: "Database server unreachable", ECONNREFUSED: "Database server unreachable",
    ENOTFOUND: "Database hostname could not be resolved", ETIMEDOUT: "Database connection timed out",
    P2021: "Required database table missing", "42P01": "Required database table missing",
    P2022: "Required database column missing", "42703": "Required database column missing",
    "42501": "Database role lacks permission", "3D000": "Database does not exist",
    "53300": "Database connection limit reached", "23503": "Related database record missing",
    DEPTH_ZERO_SELF_SIGNED_CERT: "Database TLS certificate rejected",
    SELF_SIGNED_CERT_IN_CHAIN: "Database TLS certificate rejected", CERT_HAS_EXPIRED: "Database TLS certificate expired",
  };
  return { codes: [...codes], reason: [...codes].map(code => hints[code]).find(Boolean) ?? "Database or server operation failed" };
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
        JSON.stringify(serverErrorDetails(e)),
      );
      return NextResponse.json(
        { error: "Amal bajarilmadi. Qayta urinib ko‘ring." },
        { status: 500 },
      );
    }
  };
}
