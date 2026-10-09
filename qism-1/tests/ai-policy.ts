import "dotenv/config";
import assert from "node:assert/strict";
import { aiConfigured, embed, rag } from "../src/lib/ai";
import { HttpError } from "../src/lib/http";
import { db } from "../src/lib/db";

async function main() {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  const originalEnabled = process.env.AI_ENABLED;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    throw new Error("Disabled AI must never contact a provider");
  };
  try {
    process.env.GEMINI_API_KEY = "test-key-not-a-real-secret";
    process.env.AI_ENABLED = "false";
    assert.equal(aiConfigured(), false);
    await assert.rejects(
      embed("Manba", "RETRIEVAL_DOCUMENT"),
      (error) => error instanceof HttpError && error.status === 503,
    );
    await assert.rejects(
      rag("user", "faculty", "Savol"),
      (error) => error instanceof HttpError && error.status === 503,
    );
    assert.equal(calls, 0);
    console.log(
      "PASS Hosting disabled AI makes no provider calls, even with a key present",
    );
    process.env.AI_ENABLED = "true";
    assert.equal(aiConfigured(), true);
    process.env.GEMINI_API_KEY = "";
    assert.equal(aiConfigured(), false);
    console.log("PASS Local AI remains available when enabled and configured");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    if (originalEnabled === undefined) delete process.env.AI_ENABLED;
    else process.env.AI_ENABLED = originalEnabled;
  }
}
main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
