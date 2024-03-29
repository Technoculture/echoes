import { InferModel } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, blob } from "drizzle-orm/sqlite-core";

export const chats = sqliteTable("chats", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  user_id: text("user_id", { length: 191 }).notNull(),
  messages: blob("messages", { mode: "json" }),
  title: text("title").default(""),
  image_url: text("image_url").default(""),
  creator: text("creator").default(""),
  type: text("type").default("chat"),
  audio: text("audio").default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  confidential: integer("confidential").default(0),
});
export type Chat = InferModel<typeof chats, "select">;
export type NewChat = InferModel<typeof chats, "insert">;
