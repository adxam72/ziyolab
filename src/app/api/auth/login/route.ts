import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { sessionResponse } from "@/lib/session-response";
import { hashPassword, verifyPassword, tokenHash } from "@/lib/password";
import { route, sameOrigin, rateLimit, HttpError } from "@/lib/http";
const schema = z.object({
  email: z
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
  password: z.string().min(1).max(128),
});
let dummy: Promise<string> | undefined;
export const POST = route(async (req) => {
  sameOrigin(req);
  const data = schema.parse(await req.json());
  await rateLimit("login:" + data.email, 8, 900);
  const user = await db.user.findUnique({ where: { email: data.email } });
  dummy ??= hashPassword(randomBytes(24).toString("hex"));
  const valid = await verifyPassword(
    data.password,
    user?.passwordHash ?? (await dummy),
  );
  if (!user || !valid) throw new HttpError(401, "Email yoki parol noto‘g‘ri.");
  const token = randomBytes(32).toString("hex");
  await db.session.create({
    data: {
      tokenHash: tokenHash(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    },
  });
  return sessionResponse(token);
});
