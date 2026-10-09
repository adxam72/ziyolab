import "dotenv/config";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/password";
const origin = process.env.APP_URL ?? "http://localhost:3000";
const id = "it-" + randomUUID();
const password = randomBytes(18).toString("base64url");
const cookies: Record<string, string> = {};
let count = 0;
async function request(
  path: string,
  role: string,
  body?: unknown,
  method = "POST",
  badOrigin = false,
) {
  return fetch(origin + path, {
    method: body === undefined ? "GET" : method,
    headers: {
      "Content-Type": "application/json",
      origin: badOrigin ? "https://invalid.example" : origin,
      ...(cookies[role] ? { cookie: cookies[role] } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
function check(ok: unknown, label: string) {
  assert.ok(ok, label);
  count++;
  console.log("PASS " + label);
}
async function main() {
  const hash = await hashPassword(password);
  await db.faculty.create({ data: { id, name: "Integration test faculty" } });
  await db.group.create({
    data: { id, facultyId: id, name: "Integration test group" },
  });
  for (const role of [
    "ADMIN",
    "TEACHER",
    "SUPERVISOR",
    "STUDENT",
    "OTHER",
  ] as const) {
    await db.user.create({
      data: {
        id: id + role,
        email: id + role.toLowerCase() + "@test.invalid",
        name: "Integration " + role,
        passwordHash: hash,
        role: role === "OTHER" ? "STUDENT" : role,
        facultyId: id,
        groupId: role === "STUDENT" ? id : null,
      },
    });
  }
  await db.group.update({ where: { id }, data: { teacherId: id + "TEACHER" } });
  check(
    (await request("/api/tasks", "", { id: "x", done: true }, "PATCH"))
      .status === 401,
    "Anonymous cannot mutate",
  );
  for (const role of ["ADMIN", "TEACHER", "SUPERVISOR", "STUDENT", "OTHER"]) {
    const r = await request("/api/auth/login", "", {
      email: id + role.toLowerCase() + "@test.invalid",
      password,
    });
    check(r.ok, "Login " + role);
    const cookie = r.headers.get("set-cookie") ?? "";
    check(
      cookie.includes("HttpOnly") && cookie.includes("SameSite=lax"),
      "Cookie protection " + role,
    );
    cookies[role] = cookie.split(";")[0];
  }
  check(
    (
      await request(
        "/api/tasks",
        "STUDENT",
        { id: "x", done: true },
        "PATCH",
        true,
      )
    ).status === 403,
    "Foreign origin denied",
  );
  check(
    (await request("/api/users", "STUDENT", { name: "X" })).status === 403,
    "Student cannot provision users",
  );
  check(
    (await request("/api/research", "STUDENT", { title: "x" })).status === 400,
    "Malformed payload denied",
  );
  const start = await request("/api/diagnostics", "STUDENT", {
    action: "start",
  });
  check(start.ok, "Diagnostic created");
  const assessment = await start.json();
  check(assessment.questions.length === 21, "21 real DB questions");
  check(!("correctIndex" in assessment.questions[0]), "Answer key not leaked");
  check(
    (
      await request("/api/diagnostics", "OTHER", {
        id: assessment.id,
        answers: {},
      })
    ).status === 404,
    "Other student cannot submit assessment",
  );
  check(
    (
      await request("/api/diagnostics", "STUDENT", {
        id: assessment.id,
        answers: {},
      })
    ).status === 400,
    "Incomplete diagnostic rejected",
  );
  const questions = await db.question.findMany();
  const answers = Object.fromEntries(
    questions.map((q) => [q.id, q.correctIndex]),
  );
  const finish = await request("/api/diagnostics", "STUDENT", {
    id: assessment.id,
    answers,
  });
  check(finish.ok, "Diagnostic submission");
  check(
    (await db.skillScore.count({ where: { userId: id + "STUDENT" } })) === 7,
    "Passport persisted",
  );
  check(
    (await db.learningTask.count({ where: { userId: id + "STUDENT" } })) === 7,
    "Learning plan persisted",
  );
  check(
    (
      await request("/api/diagnostics", "STUDENT", {
        id: assessment.id,
        answers,
      })
    ).ok,
    "Duplicate submit idempotent",
  );
  const task = await db.learningTask.findFirstOrThrow({
    where: { userId: id + "STUDENT" },
  });
  check(
    (await request("/api/tasks", "OTHER", { id: task.id, done: true }, "PATCH"))
      .status === 404,
    "Other student cannot change task",
  );
  check(
    (
      await request(
        "/api/tasks",
        "STUDENT",
        { id: task.id, done: true },
        "PATCH",
      )
    ).ok,
    "Task updates database",
  );
  const material = await request("/api/materials", "TEACHER", {
    title: "Test learning material",
    skillId: "writing",
    content:
      "Bu material integratsiya testi uchun yaratiladi. Manbalar bilan ishlash va akademik yozuv.",
  });
  check(material.ok, "Teacher creates material");
  const testMaterial = await material.json();
  const basis = "[" + [1, ...Array(767).fill(0)].join(",") + "]";
  await db.$executeRaw`INSERT INTO "MaterialChunk" ("id","materialId","content","embedding") VALUES (${id + "vector"},${testMaterial.id},${"Integration-only synthetic vector"},${basis}::vector)`;
  const nearest = await db.$queryRaw<
    { similarity: number }[]
  >`SELECT 1-("embedding" <=> ${basis}::vector) AS similarity FROM "MaterialChunk" WHERE "materialId"=${testMaterial.id}`;
  check(nearest[0].similarity === 1, "Real pgvector cosine query");
  check(
    (
      await request("/api/portfolio", "STUDENT", {
        title: "Ixtiyoriy havola",
        description: "Bo‘sh havola bilan portfolio yozuvi.",
        url: "",
      })
    ).ok,
    "Empty optional portfolio URL persists",
  );
  check(
    (
      await request("/api/portfolio", "STUDENT", {
        title: "Noto‘g‘ri havola",
        description: "Noto‘g‘ri havolani rad qilish tekshiruvi.",
        url: "invalid",
      })
    ).status === 400,
    "Malformed URL returns validation error",
  );
  const a = await request("/api/assignments", "TEACHER", {
    groupId: id,
    title: "Test topshiriq",
    description: "Akademik yozuvga oid mulohazalaringizni yozing.",
  });
  check(a.ok, "Teacher creates group assignment");
  const assignment = await a.json();
  check(
    (
      await request("/api/submissions", "OTHER", {
        assignmentId: assignment.id,
        content: "Bu boshqa guruh talabasi javobi.",
      })
    ).status === 404,
    "Other group cannot submit",
  );
  check(
    (
      await request("/api/submissions", "STUDENT", {
        assignmentId: assignment.id,
        content: "Manba keltirish akademik halollikning asosidir.",
      })
    ).ok,
    "Student submits assignment",
  );
  const submission = await db.submission.findFirstOrThrow({
    where: { assignmentId: assignment.id },
  });
  check(
    (
      await request(
        "/api/assignments",
        "TEACHER",
        {
          submissionId: submission.id,
          grade: 90,
          feedback: "Dalillar bilan asoslangan javob.",
        },
        "PATCH",
      )
    ).ok,
    "Teacher grades submission",
  );
  check(
    (
      await request("/api/submissions", "STUDENT", {
        assignmentId: assignment.id,
        content: "Baholangan javobni o‘zgartirish urinish.",
      })
    ).status === 409,
    "Graded submission locked",
  );
  const r = await request("/api/research", "STUDENT", {
    title: "Akademik yozuvni rivojlantirish",
    question: "Manba ko‘rsatish ko‘nikmasini qanday rivojlantirish mumkin?",
    method: "Matnlarni qiyosiy tahlil qilish va kuzatuv.",
    supervisorId: id + "SUPERVISOR",
  });
  check(r.ok, "Research creation");
  const project = await r.json();
  check(
    (
      await request(
        "/api/research",
        "OTHER",
        { id: project.id, stage: "DATA" },
        "PATCH",
      )
    ).status === 404,
    "Research owner isolation",
  );
  check(
    (
      await request("/api/research/comments", "SUPERVISOR", {
        projectId: project.id,
        content: "Tanlanma va kuzatuv mezonlarini aniqlang.",
      })
    ).ok,
    "Assigned supervisor comment",
  );
  check(
    (
      await request(
        "/api/research",
        "STUDENT",
        { id: project.id, stage: "COMPLETED" },
        "PATCH",
      )
    ).status === 400,
    "Completion requires evidence",
  );
  check(
    (
      await request(
        "/api/research",
        "STUDENT",
        {
          id: project.id,
          stage: "COMPLETED",
          outcome:
            "Matn tahlili asosida manba ko‘rsatish bo‘yicha tavsiyalar ishlab chiqildi.",
        },
        "PATCH",
      )
    ).ok,
    "Research completion persisted",
  );
  check(
    (
      await request("/api/portfolio", "STUDENT", {
        title: "Ilmiy natija",
        description:
          "Manbalarni to‘g‘ri ko‘rsatish bo‘yicha amaliy tavsiyalar.",
        url: "javascript:alert(1)",
      })
    ).status === 400,
    "Unsafe portfolio URL denied",
  );
  check(
    (
      await request("/api/portfolio", "STUDENT", {
        title: "Ilmiy natija",
        description:
          "Manbalarni to‘g‘ri ko‘rsatish bo‘yicha amaliy tavsiyalar.",
      })
    ).ok,
    "Portfolio persists",
  );
  if (!process.env.GEMINI_API_KEY)
    check(
      (
        await request("/api/chat", "STUDENT", {
          question: "Akademik yozuv nima?",
        })
      ).status === 503,
      "Unconfigured AI is explicit, no fake answer",
    );
  const expired = await db.session.findFirstOrThrow({
    where: { userId: id + "OTHER" },
  });
  await db.session.update({
    where: { id: expired.id },
    data: { expiresAt: new Date(0) },
  });
  check(
    (await request("/api/tasks", "OTHER", { id: task.id, done: true }, "PATCH"))
      .status === 401,
    "Expired session denied",
  );
  check((await request("/api/auth/logout", "STUDENT", {})).ok, "Logout works");
  check(
    (
      await request(
        "/api/tasks",
        "STUDENT",
        { id: task.id, done: true },
        "PATCH",
      )
    ).status === 401,
    "Logged-out token revoked",
  );
  console.log("Integration checks passed: " + count);
}
async function cleanup() {
  const users = { facultyId: id };
  await db.researchComment.deleteMany({
    where: { project: { facultyId: id } },
  });
  await db.researchProject.deleteMany({ where: { facultyId: id } });
  await db.submission.deleteMany({ where: { user: users } });
  await db.assignment.deleteMany({ where: { groupId: id } });
  await db.learningTask.deleteMany({ where: { user: users } });
  await db.skillScore.deleteMany({ where: { user: users } });
  await db.assessment.deleteMany({ where: { user: users } });
  await db.portfolioItem.deleteMany({ where: { user: users } });
  await db.material.deleteMany({ where: { facultyId: id } });
  await db.group.updateMany({ where: { id }, data: { teacherId: null } });
  await db.user.deleteMany({ where: users });
  await db.group.deleteMany({ where: { id } });
  await db.faculty.deleteMany({ where: { id } });
}
main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : "Integration failure");
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
    await db.$disconnect();
  });
