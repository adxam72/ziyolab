import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const globalDb = globalThis as unknown as { prisma?: PrismaClient };
function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL sozlanmagan.");
  if (process.env.VERCEL && /localhost|127\.0\.0\.1/.test(url))
    throw new Error("Production tashqi PostgreSQL talab qiladi.");
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: url,
      max: 1,
      connectionTimeoutMillis: 10000,
    }),
  });
}
export const db = globalDb.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalDb.prisma = db;
