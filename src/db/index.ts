import * as schema from "./schema";
import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const connection = connect({ 
  host: process.env.DATABASE_HOST || "", 
  username: process.env.DATABASE_USERNAME || "",
  password: process.env.DATABASE_PASSWORD || "",
});

console.log(connection);

export const db = drizzle(connection, { schema });
