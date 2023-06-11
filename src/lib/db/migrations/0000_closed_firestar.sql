CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`name` varchar(191) NOT NULL,
	`username` varchar(191),
	`email` varchar(191) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP);
