import "dotenv/config";
import { test, expect } from "@playwright/test";
import { randomBytes, randomUUID } from "node:crypto";
import { db } from "../../src/lib/db";
import { tokenHash } from "../../src/lib/password";

const email = "signup-browser-" + randomUUID() + "@test.invalid";
const password = randomBytes(20).toString("base64url");

test.afterAll(async () => {
  await db.user.deleteMany({ where: { email } });
  await db.rateLimit.deleteMany({
    where: {
      key: {
        in: [tokenHash("register:email:" + email), tokenHash("login:" + email)],
      },
    },
  });
  await db.$disconnect();
});

test("registration from login, mobile validation, automatic session and later login", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/kirish");
  await page
    .getByRole("link", { name: "Ro‘yxatdan o‘ting", exact: true })
    .click();
  await expect(page).toHaveURL(/royxatdan-otish/);
  await expect(
    page.getByRole("heading", { name: "Ro‘yxatdan o‘tish", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/qa/registration-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByLabel("Ism va familiyangiz").fill("Yangi talaba");
  await page.getByLabel("Email manzilingiz").fill(email);
  await page
    .getByLabel("Parol (kamida 12 belgi)", { exact: true })
    .fill(password);
  await page.getByLabel("Parolni tasdiqlang").fill(password + "x");
  await page.getByRole("button", { name: "Akkaunt yaratish" }).click();
  await expect(page.getByRole("status")).toContainText("Parollar mos kelmadi");
  await page.getByLabel("Parolni tasdiqlang").fill(password);
  await page.screenshot({
    path: "docs/qa/registration-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Akkaunt yaratish" }).click();
  await expect(page).toHaveURL(/bosh-sahifa/);
  await expect(
    page.getByRole("heading", { name: "Xush kelibsiz!" }),
  ).toBeVisible();
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  expect(user.role).toBe("STUDENT");
  await page.goto("/royxatdan-otish");
  await expect(page).toHaveURL(/bosh-sahifa/);
  await page.getByRole("button", { name: "Menyuni ochish" }).click();
  await page.getByRole("button", { name: "Chiqish", exact: true }).click();
  await expect(page).toHaveURL(/kirish/);
  await page.getByLabel("Email manzilingiz").fill(email);
  await page.getByLabel("Parol", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Kirish", exact: true }).click();
  await expect(page).toHaveURL(/bosh-sahifa/);
  expect(errors).toEqual([]);
});
