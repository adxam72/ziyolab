import "dotenv/config";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { db } from "../src/lib/db";
import { hashPassword, tokenHash } from "../src/lib/password";
import { COOKIE } from "../src/lib/auth";

const origin = process.env.APP_URL ?? "http://localhost:3000";
const prefix = "live-ai-" + randomUUID();
const facultyId = "pilot-faculty";
const materialIds = [
  "phonetics",
  "morphology",
  "syntax",
  "punctuation",
  "writing",
  "critical",
  "research",
].map((id) => "material-" + id);
let count = 0;
function check(value: unknown, label: string) {
  assert.ok(value, label);
  count++;
  console.log("PASS " + label);
}

async function main() {
  if (!process.env.GEMINI_API_KEY)
    throw new Error("GEMINI_API_KEY sozlanmagan.");
  if (process.env.VERCEL || !/localhost|127\.0\.0\.1/.test(origin))
    throw new Error(
      "Bu test faqat mahalliy yoki alohida test muhitida ishlaydi.",
    );
  const hash = await hashPassword(randomBytes(24).toString("base64url"));
  const tokens: Record<string, string> = {};
  await db.faculty.create({
    data: { id: prefix, name: "Vaqtinchalik AI sinov fakulteti" },
  });
  for (const role of ["ADMIN", "STUDENT", "OTHER"] as const) {
    const userId = prefix + role;
    await db.user.create({
      data: {
        id: userId,
        email: userId + "@test.invalid",
        name: "AI sinov foydalanuvchisi",
        role: role === "OTHER" ? "STUDENT" : role,
        facultyId: role === "OTHER" ? prefix : facultyId,
        passwordHash: hash,
      },
    });
    const token = randomBytes(32).toString("hex");
    tokens[role] = COOKIE + "=" + token;
    await db.session.create({
      data: {
        userId,
        tokenHash: tokenHash(token),
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
  }
  async function request(
    path: string,
    role: string,
    body: unknown,
    method = "POST",
  ) {
    return fetch(origin + path, {
      method,
      headers: {
        origin,
        cookie: tokens[role],
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90000),
    });
  }
  const materials = await db.material.findMany({
    where: { id: { in: materialIds }, facultyId },
    select: {
      id: true,
      title: true,
      indexedAt: true,
      embeddingModel: true,
      _count: { select: { chunks: true } },
    },
  });
  check(materials.length === 7, "Seven real curriculum materials exist");
  check(
    (
      await request(
        "/api/materials",
        "STUDENT",
        { id: materialIds[0] },
        "PATCH",
      )
    ).status === 403,
    "Student cannot index materials",
  );
  for (const material of materials) {
    if (
      material.id !== "material-writing" &&
      material.indexedAt &&
      material.embeddingModel ===
        (process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001") &&
      material._count.chunks > 0
    ) {
      check(true, "Existing Gemini index: " + material.title);
      continue;
    }
    const response = await request(
      "/api/materials",
      "ADMIN",
      { id: material.id },
      "PATCH",
    );
    check(
      response.ok,
      "Gemini indexing: " + material.title + " (HTTP " + response.status + ")",
    );
  }
  const chunks = await db.$queryRaw<{ count: number; dimension: number }[]>`
    SELECT count(*)::int AS count, min(vector_dims(embedding))::int AS dimension
    FROM "MaterialChunk" WHERE "materialId" IN ('material-phonetics','material-morphology','material-syntax','material-punctuation','material-writing','material-critical','material-research')`;
  check(
    chunks[0].count >= 7 && chunks[0].dimension === 768,
    "Real Gemini 768-dimensional vectors persisted",
  );
  const question = "Akademik yozuvda manba ko‘rsatish nima uchun muhim?";
  check(
    (await request("/api/chat", "OTHER", { question })).status === 422,
    "Other faculty cannot retrieve pilot materials",
  );
  const response = await request("/api/chat", "STUDENT", { question });
  check(
    response.ok,
    "Gemini RAG answer via authenticated API (HTTP " + response.status + ")",
  );
  const result = await response.json();
  check(
    typeof result.answer === "string" &&
      result.answer.length > 30 &&
      /\[\d+\]/.test(result.answer),
    "Answer contains source references",
  );
  check(
    Array.isArray(result.citations) &&
      result.citations.length > 0 &&
      result.citations.every((source: { id: string }) =>
        materialIds.includes(source.id),
      ),
    "Citations reference permitted database materials",
  );
  const history = await db.chatMessage.findMany({
    where: { userId: prefix + "STUDENT" },
    orderBy: { createdAt: "asc" },
  });
  check(
    history.length === 2 &&
      history.some(
        (message) =>
          message.role === "assistant" && message.content === result.answer,
      ),
    "Chat question and answer persist",
  );
  const page = await fetch(origin + "/ai-yordamchi", {
    headers: { cookie: tokens.STUDENT },
  });
  check(
    page.ok && (await page.text()).includes("Akademik yozuv"),
    "AI page renders persisted chat",
  );
  console.log("Live AI checks passed: " + count);
}
main()
  .catch((error) => {
    console.error(
      error instanceof Error ? error.message : "AI verification failed",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.chatMessage.deleteMany({
      where: { userId: { startsWith: prefix } },
    });
    await db.user.deleteMany({ where: { id: { startsWith: prefix } } });
    await db.faculty.deleteMany({ where: { id: prefix } });
    await db.rateLimit.deleteMany({
      where: {
        key: {
          in: [
            tokenHash("index:" + prefix + "ADMIN"),
            tokenHash("chat:" + prefix + "STUDENT"),
            tokenHash("chat:" + prefix + "OTHER"),
          ],
        },
      },
    });
    await db.$disconnect();
  });
