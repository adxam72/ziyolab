import "dotenv/config";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { db } from "../src/lib/db";
import { tokenHash, verifyPassword } from "../src/lib/password";

const origin = process.env.APP_URL ?? "http://localhost:3000";
const prefix = "signup-" + randomUUID();
const email = prefix + "@test.invalid";
const concurrentEmail = prefix + "-race@test.invalid";
const password = randomBytes(20).toString("base64url");
const data = {
  name: "Sinov talabasi",
  email,
  password,
  confirmPassword: password,
};
let checks = 0;
function check(ok: unknown, label: string) {
  assert.ok(ok, label);
  checks++;
  console.log("PASS " + label);
}
async function register(body: unknown, requestOrigin = origin) {
  return fetch(origin + "/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json", origin: requestOrigin },
    body: JSON.stringify(body),
  });
}
async function main() {
  check(
    (await register(data, "https://invalid.example")).status === 403,
    "Foreign-origin registration rejected",
  );
  check(
    (await register({ ...data, password: "short", confirmPassword: "short" }))
      .status === 400,
    "Weak password rejected",
  );
  check(
    (await register({ ...data, confirmPassword: password + "x" })).status ===
      400,
    "Password mismatch rejected",
  );
  check(
    (await register({ ...data, role: "ADMIN" })).status === 400,
    "Role injection rejected",
  );
  check(
    (await register({ ...data, facultyId: "another-faculty" })).status === 400,
    "Faculty injection rejected",
  );
  const response = await register({
    ...data,
    email: "  " + email.toUpperCase() + "  ",
  });
  check(response.status === 201, "Registration creates real account");
  const setCookie = response.headers.get("set-cookie") ?? "";
  check(
    /httponly/i.test(setCookie) && /samesite=lax/i.test(setCookie),
    "Session cookie protection",
  );
  const cookie = setCookie.split(";")[0];
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  check(
    user.role === "STUDENT" && user.groupId === null,
    "Student only, no unauthorized group",
  );
  check(
    user.facultyId === (process.env.REGISTRATION_FACULTY_ID ?? "pilot-faculty"),
    "Server chooses registration faculty",
  );
  check(
    user.passwordHash !== password &&
      (await verifyPassword(password, user.passwordHash)),
    "Password is hashed",
  );
  check(
    (await db.session.count({ where: { userId: user.id } })) === 1,
    "Session persisted with account",
  );
  const home = await fetch(origin + "/bosh-sahifa", {
    headers: { cookie },
    redirect: "manual",
  });
  check(home.status === 200, "Registration session opens dashboard");
  check(
    (
      await fetch(origin + "/api/users", {
        method: "POST",
        headers: { origin, cookie, "Content-Type": "application/json" },
        body: "{}",
      })
    ).status === 403,
    "Registrant cannot provision privileged accounts",
  );
  check((await register(data)).status === 409, "Duplicate email rejected");
  const race = await Promise.all([
    register({ ...data, email: concurrentEmail }),
    register({ ...data, email: concurrentEmail }),
  ]);
  check(
    race
      .map((result) => result.status)
      .sort()
      .join(",") === "201,409",
    "Concurrent duplicate registration is atomic",
  );
  check(
    (await db.session.count({
      where: { user: { email: concurrentEmail } },
    })) === 1,
    "Concurrent duplicate creates one session",
  );
  for (let i = 0; i < 3; i++) await register(data);
  check(
    (await register(data)).status === 429,
    "Repeated registration rate limited",
  );
  const login = await fetch(origin + "/api/auth/login", {
    method: "POST",
    headers: { origin, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  check(login.status === 200, "Registered credentials work with login");
  console.log("Registration checks passed: " + checks);
}
main()
  .catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Registration failure",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.user.deleteMany({
      where: { email: { in: [email, concurrentEmail] } },
    });
    await db.rateLimit.deleteMany({
      where: {
        key: {
          in: [
            tokenHash("register:email:" + email),
            tokenHash("register:email:" + concurrentEmail),
            tokenHash("login:" + email),
          ],
        },
      },
    });
    await db.$disconnect();
  });
