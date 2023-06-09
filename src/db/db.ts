import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const client = createClient({ 
  url: process.env.DATABASE_URL || "", 
  authToken: process.env.DATABASE_AUTH_TOKEN || "",
});

console.log(client);

export const db = drizzle(client);
