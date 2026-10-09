import { z } from "zod";
export const portfolioSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(5000),
  url: z
    .union([
      z.literal(""),
      z
        .url()
        .max(2000)
        .refine((v) => /^https?:\/\//i.test(v)),
    ])
    .optional(),
});
