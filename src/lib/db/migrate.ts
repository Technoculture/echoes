// import { migrate } from "drizzle-orm/planetscale-serverless/migrator";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./";
import * as schema from "./schema";

// @ts-ignore
// migrate(db, { schema, migrationsFolder: "./src/lib/db/migrations" });
migrate(db, { schema, migrationsFolder: "./src/lib/db/miglite" });
