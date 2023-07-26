import { InferModel } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, blob } from "drizzle-orm/sqlite-core";

// export const system_messages = mysqlTable("system_messages", {
//   id: serial("id").primaryKey().notNull(),
//   name: varchar("name", { length: 191 }).notNull(),
//   description: text("description"),
//   category: mysqlEnum("category", ["persona", "task"]),
//   message: text("message").notNull(),
// });
// export type SystemMessage = InferModel<typeof system_messages, "select">;
// export type NewSystemMessage = InferModel<typeof system_messages, "insert">;

export const chats = sqliteTable("chats", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  user_id: text("user_id", { length: 191 }).notNull(),
  messages: blob("messages", { mode: "json" }),
  title: text("title").default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});
export type Chat = InferModel<typeof chats, "select">;
export type NewChat = InferModel<typeof chats, "insert">;
