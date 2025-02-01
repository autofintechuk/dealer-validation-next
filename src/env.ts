import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    MARKETPLACE_API_URL: z.string().url(),
    MARKETPLACE_CLIENT_ID: z.string().min(1),
    MARKETPLACE_CLIENT_SECRET: z.string().min(1),
    AUTH_PASSWORD: z
      .string()
      .min(1)
      .refine((val) => {
        // Ensure each password is at least 1 character long after trimming
        return val.split(",").every((p) => p.trim().length >= 1);
      }, "Each password must be at least 1 character long"),
  },
  client: {},
  runtimeEnv: {
    MARKETPLACE_API_URL: process.env.MARKETPLACE_API_URL,
    MARKETPLACE_CLIENT_ID: process.env.MARKETPLACE_CLIENT_ID,
    MARKETPLACE_CLIENT_SECRET: process.env.MARKETPLACE_CLIENT_SECRET,
    AUTH_PASSWORD: process.env.AUTH_PASSWORD,
  },
});
