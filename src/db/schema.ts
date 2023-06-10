import { InferModel } from 'drizzle-orm';
import { json, varchar, timestamp, mysqlTable, serial } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
	id: serial("id").primaryKey().notNull(),	
  name: varchar("name", { length: 191 }).notNull(),
  username: varchar("username", { length: 191 }),
	email: varchar("email", { length: 191 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow()
});
export type User = InferModel<typeof users, 'select'>
export type NewUser = InferModel<typeof users, 'insert'>

export const chats = mysqlTable('chats', {
  id: serial("id").primaryKey().notNull(),
  user_id: varchar("user_id", { length: 191 }).notNull(),
  messages: json('messages'),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow()
});
export type Chat = InferModel<typeof chats, 'select'>
export type NewChat = InferModel<typeof chats, 'insert'>

