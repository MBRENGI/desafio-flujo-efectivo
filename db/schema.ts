import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const attempts = sqliteTable("attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentName: text("student_name").notNull(),
  email: text("email").notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  score: integer("score").notNull(),
  grade: real("grade").notNull(),
  remainingSeconds: integer("remaining_seconds").notNull(),
  scenario: text("scenario").notNull().default(""),
  level: integer("level").notNull().default(1),
  consentVersion: text("consent_version").notNull().default("2026-08"),
  ipHash: text("ip_hash").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const verificationCodes = sqliteTable("verification_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  name: text("name").notNull(),
  codeHash: text("code_hash").notNull(),
  expiresAt: integer("expires_at").notNull(),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  consumedAt: integer("consumed_at"),
  createdAt: integer("created_at").notNull(),
});

export const securityEvents = sqliteTable("security_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventType: text("event_type").notNull(),
  subjectHash: text("subject_hash").notNull().default(""),
  detail: text("detail").notNull().default(""),
  createdAt: integer("created_at").notNull(),
});
