import { InferModel } from 'drizzle-orm';
import { serial, text, mysqlTable } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull(),
});
//export const insertUserSchema = createInsertSchema(users);
//export const selectUserSchema = createSelectSchema(users);
export type User = InferModel<typeof users, 'select' | 'insert'> // return type when queried

//export const chats = mysqlTable('chats', {
//	id: serial('id').primaryKey(),
//  messages: text('messages'),
//	authorId: ('author_id').notNull().references(() => users.id),
//	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
//	updateAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
//});
////export const insertPostSchema = createInsertSchema(chats);
////export const selectPostSchema = createSelectSchema(chats);
//export type Chat = InferModel<typeof chats> // return type when queried
//export type InsertChat = InferModel<typeof chats, 'insert'> // insert type
//export type SelectChat = InferModel<typeof chats, 'select'> // insert type

