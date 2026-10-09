import "dotenv/config";
import { Client } from "pg";

// Foreign keys determine this order. Sessions deliberately require a fresh login.
const tables = [
  "Faculty", "Skill", "User", "Group", "Question", "Material",
  "MaterialChunk", "Assessment", "SkillScore", "LearningTask", "Assignment",
  "Submission", "ResearchProject", "ResearchComment", "PortfolioItem", "ChatMessage",
];

async function main() {
  const sourceUrl = process.env.DATABASE_URL;
  const targetUrl = process.env.TARGET_DATABASE_URL;
  if (!sourceUrl || !targetUrl || sourceUrl === targetUrl)
    throw new Error("Alohida DATABASE_URL va TARGET_DATABASE_URL talab qilinadi.");
  const source = new Client({ connectionString: sourceUrl });
  const target = new Client({ connectionString: targetUrl });
  try {
    await source.connect();
    await target.connect();
    await source.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    await target.query("BEGIN");
    // Refuse a populated target; never overwrite another application's records.
    for (const table of tables) {
      const result = await target.query(`SELECT 1 FROM "${table}" LIMIT 1`);
      if (result.rowCount) throw new Error("Maqsad baza bo‘sh emas: " + table);
    }
    // User.groupId and Group.teacherId form a cycle, so set these after copying.
    const memberships: { id: string; groupId: string }[] = [];
    for (const table of tables) {
      const { rows, fields } = await source.query(`SELECT * FROM "${table}"`);
      const columns = fields.map((field) => field.name);
      const names = columns.map((column) => '"' + column.replaceAll('"', '""') + '"');
      for (const row of rows) {
        if (table === "User" && row.groupId) {
          memberships.push({ id: row.id, groupId: row.groupId });
          row.groupId = null;
        }
        const values = columns.map((column, index) => {
          const value = row[column];
          // pg encodes JS arrays as PostgreSQL arrays; explicitly encode JSON columns.
          return fields[index].dataTypeID === 114 || fields[index].dataTypeID === 3802
            ? (value === null ? null : JSON.stringify(value)) : value;
        });
        await target.query(
          `INSERT INTO "${table}" (${names.join(",")}) VALUES (${columns.map((_, i) => "$" + (i + 1)).join(",")})`,
          values,
        );
      }
      console.log(table + ": " + rows.length);
    }
    for (const member of memberships)
      await target.query('UPDATE "User" SET "groupId"=$1 WHERE "id"=$2', [member.groupId, member.id]);
    await target.query("COMMIT");
    await source.query("COMMIT");
    console.log("Ma’lumotlar ko‘chirildi. Yangi bazada qayta kirish talab qilinadi.");
  } catch (error) {
    await target.query("ROLLBACK").catch(() => {});
    await source.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await source.end();
    await target.end();
  }
}
main().catch(() => {
  console.error("Ko‘chirish bajarilmadi. Ulanish, sxema va bo‘sh maqsad bazani tekshiring.");
  process.exitCode = 1;
});
