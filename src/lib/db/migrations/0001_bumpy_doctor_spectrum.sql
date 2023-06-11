CREATE TABLE `chats` (
	`id` int PRIMARY KEY NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`messages` json,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP);
