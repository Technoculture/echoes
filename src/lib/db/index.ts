import * as schema from "./schema";
import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

const connection = connect({ 
  host: process.env.PLANETSCALE_DB_HOST || "", 
  username: process.env.PLANETSCALE_DB_USERNAME || "",
  password: process.env.PLANETSCALE_DB_PASSWORD || "",
});

export const db = drizzle(connection, { schema });
