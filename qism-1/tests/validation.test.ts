import { describe, it, expect } from "vitest";
import { portfolioSchema } from "../src/lib/validation";
const input = {
  title: "Ilmiy natija",
  description: "Tadqiqotdan olingan yangi natija.",
};
describe("Optional portfolio URL regression", () => {
  it.each([
    "",
    undefined,
    "https://example.org/result",
    "http://example.org/result",
  ])("accepts omitted, empty and web links", (url) => {
    expect(portfolioSchema.safeParse({ ...input, url }).success).toBe(true);
  });
  it.each(["javascript:alert(1)", "not a URL", "file:///etc/passwd"])(
    "rejects unsafe and malformed URL without throwing",
    (url) => {
      expect(portfolioSchema.safeParse({ ...input, url }).success).toBe(false);
    },
  );
});
