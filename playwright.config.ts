import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  timeout: 120000,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    viewport: { width: 1505, height: 1045 },
    launchOptions: { channel: "msedge" },
  },
  reporter: "list",
});
