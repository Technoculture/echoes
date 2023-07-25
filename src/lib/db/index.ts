import * as schema from "./schema";
// import { connect } from "@planetscale/database";
// import { drizzle } from "drizzle-orm/planetscale-serverless";

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });

// const connection = connect({
//   host: process.env.PLANETSCALE_DB_HOST || "",
//   username: process.env.PLANETSCALE_DB_USERNAME || "",
//   password: process.env.PLANETSCALE_DB_PASSWORD || "",
// });

// //console.log(connection);
// export const db = drizzle(connection, { schema });

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DB_URL || "",
  authToken: process.env.TURSO_DB_AUTH_TOKEN || "",
});

// export const db = drizzle(connection, { schema });
export const db = drizzle(client, { schema });
