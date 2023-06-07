import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./db";

// this will automatically run needed migrations on the database
migrate(db, { migrationsFolder: "./src/db/migrations" })
  .then(() => {
    console.log("Migrations complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migrations failed!", err);
    process.exit(1);
  });
