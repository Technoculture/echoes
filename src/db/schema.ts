import { sql, InferModel } from 'drizzle-orm';
import { integer, sqliteTable, text, blob } from 'drizzle-orm/sqlite-core';
// import { ChatLog } from '@/types/types';
// import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});
//export const insertUserSchema = createInsertSchema(users);
//export const selectUserSchema = createSelectSchema(users);
export type User = InferModel<typeof users> // return type when queried
export type InsertUser = InferModel<typeof users, 'insert'> // insert type
export type SelectUser = InferModel<typeof users, 'select'> // insert type

export const chats = sqliteTable('chats', {
	id: integer('id').primaryKey(),
  messages: blob('messages'),
	authorId: integer('author_id').notNull().references(() => users.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
	updateAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});
//export const insertPostSchema = createInsertSchema(chats);
//export const selectPostSchema = createSelectSchema(chats);
export type Chat = InferModel<typeof chats> // return type when queried
export type InsertChat = InferModel<typeof chats, 'insert'> // insert type
export type SelectChat = InferModel<typeof chats, 'select'> // insert type

