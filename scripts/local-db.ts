import "dotenv/config";
import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { resolve } from "node:path";
import { mkdirSync } from "node:fs";
async function main() {
  mkdirSync(".data", { recursive: true });
  const db = await PGlite.create({
    dataDir: resolve(".data/postgres"),
    extensions: { vector },
  });
  await db.exec("CREATE EXTENSION IF NOT EXISTS vector");
  const server = new PGLiteSocketServer({
    db,
    host: "127.0.0.1",
    port: 54329,
    maxConnections: 20,
  });
  await server.start();
  console.log("Persistent PostgreSQL + pgvector: 127.0.0.1:54329");
  for (const signal of ["SIGINT", "SIGTERM"] as const)
    process.on(signal, async () => {
      await server.stop();
      await db.close();
      process.exit(0);
    });
}
main().catch((e) => {
  console.error("Mahalliy bazani ishga tushirishda xato.", e);
  process.exit(1);
});
