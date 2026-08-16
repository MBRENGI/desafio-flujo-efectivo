CREATE TABLE IF NOT EXISTS `attempts` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `student_name` text NOT NULL,
  `email` text NOT NULL,
  `attempt_number` integer NOT NULL,
  `score` integer NOT NULL,
  `grade` real NOT NULL,
  `remaining_seconds` integer NOT NULL,
  `scenario` text DEFAULT '' NOT NULL,
  `level` integer DEFAULT 1 NOT NULL,
  `consent_version` text DEFAULT '2026-08' NOT NULL,
  `ip_hash` text DEFAULT '' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `verification_codes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `email` text NOT NULL,
  `name` text NOT NULL,
  `code_hash` text NOT NULL,
  `expires_at` integer NOT NULL,
  `failed_attempts` integer DEFAULT 0 NOT NULL,
  `consumed_at` integer,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `verification_email_idx` ON `verification_codes` (`email`,`created_at`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `activity_progress` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `email` text NOT NULL,
  `student_name` text NOT NULL,
  `scenario` text NOT NULL,
  `level` integer NOT NULL,
  `exercise_id` text NOT NULL,
  `is_correct` integer NOT NULL,
  `remaining_seconds` integer NOT NULL,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `progress_email_idx` ON `activity_progress` (`email`,`created_at`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `security_events` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `event_type` text NOT NULL,
  `subject_hash` text DEFAULT '' NOT NULL,
  `detail` text DEFAULT '' NOT NULL,
  `created_at` integer NOT NULL
);
