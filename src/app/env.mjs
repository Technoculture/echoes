import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // OpenAI
    OPEN_AI_API_KEY: z.string().min(10),
    // Clerk
    CLERK_SECRET_KEY: z.string().min(10),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(10),
    // Upstash Redis
    REDIS_URL: z.string().url(),
    // Planetscale
    PLANETSCALE_DB_HOST: z.string().min(1),
    PLANETSCALE_DB_USERNAME: z.string().min(1),
    PLANETSCALE_DB_PASSWORD: z.string().min(1),
  },

  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(10),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().min(1),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().min(1),
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().min(1),
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().min(1),
  },

  runtimeEnv: {
    // Clerk (Auth)
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
    // Upstash (Redis)
    REDIS_URL: process.env.REDIS_URL,
    // OpenAI
    OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY,
    // Planetscale
    PLANETSCALE_DB_HOST: process.env.PLANETSCALE_DB_HOST,
    PLANETSCALE_DB_USERNAME: process.env.PLANETSCALE_DB_USERNAME,
    PLANETSCALE_DB_PASSWORD: process.env.PLANETSCALE_DB_PASSWORD,
  },
});

