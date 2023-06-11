import { InferModel } from 'drizzle-orm';
import { 
  text, 
  json, 
  varchar, 
  timestamp, 
  serial ,
  mysqlTable, 
  mysqlEnum, 
} from 'drizzle-orm/mysql-core';

export const chats = mysqlTable('chats', {
  id: serial("id").primaryKey().notNull(),
  user_id: varchar("user_id", { length: 191 }).notNull(),
  messages: json('messages'),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow()
});
export type Chat = InferModel<typeof chats, 'select'>
export type NewChat = InferModel<typeof chats, 'insert'>

export const system_messages = mysqlTable('system_messages', {
  id: serial("id").primaryKey().notNull(),
  name: varchar("name", { length: 191 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["persona", "task"]),
  message: text("message").notNull(),
});
export type SystemMessage = InferModel<typeof system_messages, 'select'>
export type NewSystemMessage = InferModel<typeof system_messages, 'insert'>

