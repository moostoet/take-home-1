CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`org_id` text NOT NULL,
	`status` text NOT NULL,
	`contact_name` text NOT NULL,
	`contact_email` text NOT NULL,
	`event_title` text NOT NULL,
	`event_location_id` text NOT NULL,
	`event_start` text NOT NULL,
	`event_end` text NOT NULL,
	`event_details` text NOT NULL,
	`request_note` text
);
