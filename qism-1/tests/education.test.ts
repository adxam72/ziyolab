import { describe, it, expect } from "vitest";
import {
  grade,
  level,
  chunkText,
  type SnapshotQuestion,
} from "../src/lib/education";
import { hashPassword, verifyPassword, tokenHash } from "../src/lib/password";
import { projectScope } from "../src/lib/research";
const qs: SnapshotQuestion[] = [
  {
    id: "1",
    skillId: "a",
    prompt: "A?",
    options: ["x", "y"],
    correctIndex: 0,
    explanation: "A",
  },
  {
    id: "2",
    skillId: "a",
    prompt: "B?",
    options: ["x", "y"],
    correctIndex: 1,
    explanation: "B",
  },
  {
    id: "3",
    skillId: "b",
    prompt: "C?",
    options: ["x", "y"],
    correctIndex: 1,
    explanation: "C",
  },
];
describe("Server grading", () => {
  it("calculates each skill separately and gives corrective evidence", () => {
    const r = grade(qs, { "1": 0, "2": 0, "3": 1 });
    expect(r.bySkill.a.percent).toBe(50);
    expect(r.bySkill.b.percent).toBe(100);
    expect(r.feedback[1]).toMatchObject({
      correct: false,
      selected: "x",
      correctAnswer: "y",
      explanation: "B",
    });
  });
  it.each([
    { "1": 0 },
    { "1": 0, "2": 1, "3": 8 },
    { "1": 0, "2": 1, "3": 1, "4": 1 },
    { "1": 0, "2": 1, "3": 1.5 },
  ])("rejects incomplete or manipulated answers", (answers) =>
    expect(() => grade(qs, answers as Record<string, number>)).toThrow(),
  );
  it("does not treat missing evidence as zero", () => {
    expect(level(null)).toBe("Baholanmagan");
    expect(level(49)).toBe("Rivojlantirish kerak");
    expect(level(50)).toBe("O‘rta");
    expect(level(80)).toBe("Yuqori");
  });
});
describe("RAG chunk boundaries", () => {
  it("preserves whole document with overlap", () => {
    const text = "a".repeat(3000);
    const chunks = chunkText(text);
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toHaveLength(1400);
    expect(chunks[2]).toHaveLength(560);
  });
  it("rejects infinite-loop configurations", () =>
    expect(() => chunkText("test", 100, 100)).toThrow());
});
describe("Authentication secrets", () => {
  it("uses salted password hashes and rejects wrong passwords", async () => {
    const a = await hashPassword("correct horse battery staple");
    const b = await hashPassword("correct horse battery staple");
    expect(a).not.toBe(b);
    expect(await verifyPassword("correct horse battery staple", a)).toBe(true);
    expect(await verifyPassword("wrong", a)).toBe(false);
    expect(await verifyPassword("x", "bad")).toBe(false);
  });
  it("never stores raw session token", () =>
    expect(tokenHash("opaque-token")).not.toContain("opaque-token"));
});
describe("Research permissions", () => {
  it("scopes student to owner, supervisor to assignment, admin to faculty", () => {
    expect(projectScope({ id: "s", role: "STUDENT", facultyId: "f" })).toEqual({
      facultyId: "f",
      studentId: "s",
    });
    expect(
      projectScope({ id: "r", role: "SUPERVISOR", facultyId: "f" }),
    ).toEqual({ facultyId: "f", supervisorId: "r" });
    expect(projectScope({ id: "a", role: "ADMIN", facultyId: "f" })).toEqual({
      facultyId: "f",
    });
  });
});
