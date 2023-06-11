import { migrate } from "drizzle-orm/planetscale-serverless/migrator";
import { db } from "./";
import * as schema from "./schema";

// @ts-ignore
migrate(db, { schema, migrationsFolder: "./src/lib/db/migrations" });

