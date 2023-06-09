import { InferModel } from 'drizzle-orm';
import { int, varchar, timestamp, json, mysqlTable, serial } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
	id: serial("id").primaryKey().notNull(),	
  name: varchar("name", { length: 191 }).notNull(),
  username: varchar("username", { length: 191 }),
	email: varchar("email", { length: 191 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow()
});
export type User = InferModel<typeof users, 'select'>

export const chats = mysqlTable('chats', {
  id: int("id").primaryKey().notNull(),
  user_id: varchar("user_id", { length: 191 }).notNull(),
  messages: json('messages'),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow()
});
export type Chat = InferModel<typeof chats, 'select'>

