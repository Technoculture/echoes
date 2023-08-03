import * as schema from "./schema";

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DB_URL || "",
  authToken: process.env.TURSO_DB_AUTH_TOKEN || "",
});

export const db = drizzle(client, { schema });
