import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

async function run(source: string, target: string) {
  return new Promise<number | null>((resolve, reject) => {
    const child = spawn(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/transfer-database.ts"], {
      env: { ...process.env, DATABASE_URL: source, TARGET_DATABASE_URL: target },
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", resolve);
  });
}

async function main() {
  const source = await PGlite.create({ extensions: { vector } });
  const target = await PGlite.create({ extensions: { vector } });
  const servers = [
    new PGLiteSocketServer({ db: source, host: "127.0.0.1", port: 54330, maxConnections: 5 }),
    new PGLiteSocketServer({ db: target, host: "127.0.0.1", port: 54331, maxConnections: 5 }),
  ];
  try {
    for (const database of [source, target]) {
      await database.exec("CREATE ROLE anon; CREATE ROLE authenticated;");
      await database.exec(readFileSync("prisma/migrations/202610080001_initial/migration.sql", "utf8"));
      await database.exec(readFileSync("prisma/migrations/202610080002_supabase_security/migration.sql", "utf8"));
    }
    await source.exec(`
      INSERT INTO "Faculty" VALUES ('transfer-faculty','Test');
      INSERT INTO "Skill" VALUES ('transfer-skill','Test',0);
      INSERT INTO "User" (id,email,name,"passwordHash",role,"facultyId")
        VALUES ('transfer-user','transfer@example.invalid','Test','preserve-hash','TEACHER','transfer-faculty');
      INSERT INTO "Group" VALUES ('transfer-group','Test','transfer-faculty','transfer-user');
      UPDATE "User" SET "groupId"='transfer-group';
      INSERT INTO "Question" VALUES ('transfer-question','transfer-skill','Savol','["A","B"]',0,'Izoh');
      INSERT INTO "Assessment" (id,"userId",questions,answers)
        VALUES ('transfer-assessment','transfer-user','[{"id":"q1","options":["A","B"]}]','{"q1":0}');
      INSERT INTO "Session" VALUES ('old-session','old-token','transfer-user',NOW()+INTERVAL '1 day');
      INSERT INTO "Material" (id,"facultyId","skillId","authorId",title,content)
        VALUES ('transfer-material','transfer-faculty','transfer-skill','transfer-user','Test','Manba');
    `);
    const embedding = "[" + [1, ...Array<number>(767).fill(0)].join(",") + "]";
    await source.query('INSERT INTO "MaterialChunk" (id,"materialId",content,embedding) VALUES ($1,$2,$3,$4::vector)',
      ["transfer-chunk", "transfer-material", "Manba", embedding]);
    for (const server of servers) await server.start();
    const urls = [54330, 54331].map((port) => `postgresql://postgres:postgres@127.0.0.1:${port}/postgres`);
    assert.equal(await run(urls[0], urls[1]), 0);
    const user = (await target.query<{ groupId: string; passwordHash: string }>('SELECT "groupId","passwordHash" FROM "User"')).rows[0];
    assert.equal(user.groupId, "transfer-group");
    assert.equal(user.passwordHash, "preserve-hash");
    const question = (await target.query<{ options: string[] }>('SELECT options FROM "Question"')).rows[0];
    assert.deepEqual(question.options, ["A", "B"]);
    const assessment = (await target.query<{ answers: unknown }>('SELECT answers FROM "Assessment"')).rows[0];
    assert.deepEqual(assessment.answers, { q1: 0 });
    const chunk = (await target.query<{ embedding: string }>('SELECT embedding::text FROM "MaterialChunk"')).rows[0];
    assert.equal(chunk.embedding, embedding);
    assert.equal((await target.query('SELECT * FROM "Session"')).rows.length, 0);
    const security = await target.query<{ secure: boolean }>(`
      SELECT bool_and(relrowsecurity AND NOT has_table_privilege('anon',oid,'SELECT')
        AND NOT has_table_privilege('authenticated',oid,'SELECT')) AS secure
      FROM pg_class WHERE relnamespace='public'::regnamespace AND relkind='r'
    `);
    assert.equal(security.rows[0].secure, true);
    assert.equal(await run(urls[0], urls[1]), 1);
    assert.equal((await target.query('SELECT * FROM "User"')).rows.length, 1);
    console.log("PASS: JSON, FK cycle, hashes, session reset, RLS and populated-target protection");
  } finally {
    for (const server of servers) await server.stop();
    await source.close();
    await target.close();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
