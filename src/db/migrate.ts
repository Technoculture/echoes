import { migrate } from "drizzle-orm/planetscale-serverless/migrator";
import { db } from "./";
import * as schema from "./schema";

// this will automatically run needed migrations on the database
//migrate(db, { migrationsFolder: "./src/db/migrations" })
//  .then(() => {
//    console.log("Migrations complete!");
//    process.exit(0);
//  })
//  .catch((err) => {
//    console.error("Migrations failed!", err);
//    process.exit(1);
//  }
//);

// @ts-ignore
migrate(db, { schema, migrationsFolder: "./src/db/migrations" });

