import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { tokenHash } from "./password";
export const COOKIE = "dtpi_session";
export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: tokenHash(token) },
    include: { user: { include: { faculty: true, group: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/kirish");
  return user;
}
