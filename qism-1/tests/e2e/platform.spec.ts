import "dotenv/config";
import { test, expect } from "@playwright/test";
import { randomBytes, randomUUID } from "node:crypto";
import { db } from "../../src/lib/db";
import { hashPassword } from "../../src/lib/password";
import { mkdirSync } from "node:fs";
const id = "e2e-" + randomUUID();
const email = id + "@test.invalid";
const password = randomBytes(18).toString("base64url");
test.beforeAll(async () => {
  await db.group.create({
    data: {
      id: id + "group",
      name: "Sinov guruhi",
      facultyId: "pilot-faculty",
    },
  });
  const hash = await hashPassword(password);
  for (const role of ["TEACHER", "SUPERVISOR"] as const)
    await db.user.create({
      data: {
        id: id + role,
        email: id + role.toLowerCase() + "@test.invalid",
        name: role === "TEACHER" ? "Sinov o‘qituvchisi" : "Sinov rahbari",
        role,
        facultyId: "pilot-faculty",
        passwordHash: hash,
      },
    });
  await db.group.update({
    where: { id: id + "group" },
    data: { teacherId: id + "TEACHER" },
  });
  await db.user.create({
    data: {
      id,
      name: "Sinov talabasi",
      email,
      passwordHash: await hashPassword(password),
      role: "STUDENT",
      facultyId: "pilot-faculty",
      groupId: id + "group",
    },
  });
  mkdirSync("docs/qa", { recursive: true });
});
test.afterAll(async () => {
  await db.researchComment.deleteMany({
    where: { project: { studentId: id } },
  });
  await db.researchProject.deleteMany({ where: { studentId: id } });
  await db.submission.deleteMany({ where: { userId: id } });
  await db.assignment.deleteMany({ where: { groupId: id + "group" } });
  await db.group.update({
    where: { id: id + "group" },
    data: { teacherId: null },
  });
  await db.portfolioItem.deleteMany({ where: { userId: id } });
  await db.user.deleteMany({
    where: { id: { in: [id, id + "TEACHER", id + "SUPERVISOR"] } },
  });
  await db.group.delete({ where: { id: id + "group" } });
  await db.$disconnect();
});
test("student workflow desktop and mobile", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/kirish");
  await expect(
    page.getByRole("heading", { name: "Tizimga kirish" }),
  ).toBeVisible();
  await page.getByLabel("Email manzilingiz").fill(email);
  await page.getByLabel("Parol", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Kirish", exact: true }).click();
  await expect(page).toHaveURL(/bosh-sahifa/);
  await expect(
    page.getByRole("heading", { name: "Xush kelibsiz!" }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/qa/dashboard-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "Menyuni ochish" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "docs/qa/dashboard-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Menyuni ochish" }).click();
  await page.getByRole("link", { name: "Bilim pasporti", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Bilim pasporti" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1505, height: 1045 });
  await page.getByRole("link", { name: "Diagnostika", exact: true }).click();
  await page.getByRole("button", { name: "Diagnostikani boshlash" }).click();
  const fieldsets = page.locator("fieldset");
  await expect(fieldsets).toHaveCount(21);
  for (let i = 0; i < 21; i++)
    await fieldsets.nth(i).getByRole("radio").first().check();
  await page.getByRole("button", { name: "Natijani olish" }).click();
  await expect(
    page.getByText("Diagnostika yakunlandi", { exact: true }),
  ).toBeVisible();
  expect(await db.skillScore.count({ where: { userId: id } })).toBe(7);
  await page.getByRole("link", { name: "O‘quv yo‘lim", exact: true }).click();
  await page.getByRole("button", { name: "O‘rganib bo‘ldim" }).first().click();
  await expect(
    page.getByRole("button", { name: "Bajarildi — qayta ochish" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Ilmiy faoliyat", exact: true }).click();
  await page.getByLabel("Loyiha nomi").fill("Ona tilini o‘qitish metodlari");
  await page
    .getByLabel("Ilmiy savol")
    .fill("Til o‘rganishda misollar qanday yordam beradi?");
  await page
    .getByLabel("Tadqiqot usuli")
    .fill("Kuzatish va matnlarni qiyosiy tahlil qilish.");
  await page.getByLabel("Ilmiy rahbar").selectOption(id + "SUPERVISOR");
  await page.getByRole("button", { name: "Loyiha yaratish" }).click();
  await expect(
    page.getByText("Ona tilini o‘qitish metodlari", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Portfolio", exact: true }).click();
  await page.getByLabel("Natija nomi").fill("Yozuv ko‘nikmasi natijasi");
  await page
    .getByLabel("Natija tavsifi")
    .fill("Akademik yozuv bo‘yicha amaliy mashq yakunlandi.");
  await page.getByRole("button", { name: "Portfolioga qo‘shish" }).click();
  await expect(
    page.getByText("Yozuv ko‘nikmasi natijasi", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "AI yordamchi", exact: true }).click();
  await expect(page.getByLabel("Savolingiz")).toBeVisible();
  await page.getByRole("button", { name: "Chiqish", exact: true }).click();
  await expect(page).toHaveURL(/kirish/);
  expect(errors).toEqual([]);
});

test("teacher assignment, grading and supervisor feedback", async ({
  page,
  browser,
}) => {
  async function login(target: typeof page, mail: string) {
    await target.goto("/kirish");
    await target.getByLabel("Email manzilingiz").fill(mail);
    await target.getByLabel("Parol", { exact: true }).fill(password);
    await target.getByRole("button", { name: "Kirish", exact: true }).click();
    await expect(target).toHaveURL(/bosh-sahifa/);
  }
  await login(page, id + "teacher@test.invalid");
  await page
    .getByRole("link", { name: "O‘qituvchi paneli", exact: true })
    .click();
  await expect(page.getByText("Sinov guruhi", { exact: true })).toBeVisible();
  await page.getByLabel("Topshiriq nomi").fill("Manbalar bilan ishlash");
  await page
    .getByLabel("Topshiriq sharti")
    .fill("Akademik matnda manba ko‘rsatish sabablarini yozing.");
  await page.getByRole("button", { name: "Topshiriqni berish" }).click();
  await expect(
    page.getByText("Manbalar bilan ishlash", { exact: true }),
  ).toBeVisible();
  const studentContext = await browser.newContext();
  const studentPage = await studentContext.newPage();
  await login(studentPage, email);
  await studentPage.goto("/oquv-yolim");
  await studentPage
    .getByLabel("Javobingiz")
    .fill(
      "Manbalar dalillarni tekshirish va akademik halollikni saqlashga yordam beradi.",
    );
  await studentPage.getByRole("button", { name: "Javobni yuborish" }).click();
  await expect(
    studentPage.getByText("Muvaffaqiyatli saqlandi.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByLabel("Baho (0–100)").fill("92");
  await page
    .getByLabel("Izoh va tavsiya")
    .fill("Dalilga asoslangan fikringiz yaxshi. Misol bilan mustahkamlang.");
  await page.getByRole("button", { name: "Baholash", exact: true }).click();
  await expect(
    page.getByText("Muvaffaqiyatli saqlandi.", { exact: true }),
  ).toBeVisible();
  await studentPage.reload();
  await expect(
    studentPage.getByText("Baho: 92/100", { exact: true }),
  ).toBeVisible();
  await studentContext.close();
  await page.getByRole("button", { name: "Chiqish", exact: true }).click();
  await login(page, id + "supervisor@test.invalid");
  await page.getByRole("link", { name: "Ilmiy faoliyat", exact: true }).click();
  await expect(
    page.getByText("Ona tilini o‘qitish metodlari", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Tavsiya va fikringiz")
    .fill("Tadqiqot savolini aniq mezonlar bilan to‘ldiring.");
  await page.getByRole("button", { name: "Fikr bildirish" }).click();
  await expect(
    page.getByText("Tadqiqot savolini aniq mezonlar bilan to‘ldiring.", {
      exact: true,
    }),
  ).toBeVisible();
});
