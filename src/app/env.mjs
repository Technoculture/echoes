import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // OpenAI
    OPEN_AI_API_KEY: z.string().min(10),
    // Azure OpenAI
    // AZURE_OPENAI_API_KEY: z.string().min(1),
    // AZURE_OPENAI_API_VERSION: z.string().min(1),
    // AZURE_OPENAI_API_INSTANCE_NAME: z.string().min(1),
    // AZURE_OPENAI_API_DEPLOYMENT_NAME: z.string().min(1),
    // langsmith
    LANGCHAIN_TRACING_V2: z.string().min(1),
    LANGCHAIN_ENDPOINT: z.string().min(1),
    LANGCHAIN_API_KEY: z.string().min(1),
    LANGCHAIN_PROJECT: z.string().min(1),
    // Clerk
    CLERK_SECRET_KEY: z.string().min(10),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(10),
    // Upstash Redis
    REDIS_URL: z.string().url(),
    // Turso db
    TURSO_DB_URL: z.string().min(1),
    TURSO_DB_AUTH_TOKEN: z.string().min(1),
    // sentry
    SENTRY_AUTH_TOKEN: z.string().min(1),
    SENTRY_ORG: z.string().min(1),
    SENTRY_PROJECT: z.string().min(1),
    // aws
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    AWS_REGION: z.string().min(1),
    BUCKET_NAME: z.string().min(1),
    IMAGE_PREFIX_URL: z.string().min(1),
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
    // Azure OpenAI
    // AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
    // AZURE_OPENAI_API_VERSION: process.env.AZURE_OPENAI_API_VERSION,
    // AZURE_OPENAI_API_INSTANCE_NAME: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    // AZURE_OPENAI_API_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
    // langsmith
    LANGCHAIN_TRACING_V2: process.env.LANGCHAIN_TRACING_V2,
    LANGCHAIN_ENDPOINT: process.env.LANGCHAIN_ENDPOINT,
    LANGCHAIN_API_KEY: process.env.LANGCHAIN_API_KEY,
    LANGCHAIN_PROJECT: process.env.LANGCHAIN_PROJECT,
    // turso db
    TURSO_DB_URL: process.env.TURSO_DB_URL,
    TURSO_DB_AUTH_TOKEN: process.env.TURSO_DB_AUTH_TOKEN,
    // sentry
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_AUTH_TOKEN,
    // aws
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    BUCKET_NAME: process.env.BUCKET_NAME,
    IMAGE_PREFIX_URL: process.env.IMAGE_PREFIX_URL,
  },
});

