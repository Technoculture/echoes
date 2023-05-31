CREATE TABLE `message` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer,
	`message` text NOT NULL,
	`role` text NOT NULL,
	`author_id` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`)
);

CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
