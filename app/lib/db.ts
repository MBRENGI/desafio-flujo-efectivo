export const db=async()=>{const {env}=await import("cloudflare:workers");const database=(env as unknown as {DB?:D1Database}).DB;if(!database)throw new Error("DB binding unavailable");return database};
export async function ensureSecuritySchema(){const d=await db();await d.batch([
 d.prepare("CREATE TABLE IF NOT EXISTS verification_codes (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, name TEXT NOT NULL, code_hash TEXT NOT NULL, expires_at INTEGER NOT NULL, failed_attempts INTEGER NOT NULL DEFAULT 0, consumed_at INTEGER, created_at INTEGER NOT NULL)"),
 d.prepare("CREATE INDEX IF NOT EXISTS verification_email_idx ON verification_codes(email, created_at)"),
 d.prepare("CREATE TABLE IF NOT EXISTS security_events (id INTEGER PRIMARY KEY AUTOINCREMENT, event_type TEXT NOT NULL, subject_hash TEXT NOT NULL DEFAULT '', detail TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL)"),
 d.prepare("CREATE TABLE IF NOT EXISTS activity_progress (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, student_name TEXT NOT NULL, scenario TEXT NOT NULL, level INTEGER NOT NULL, exercise_id TEXT NOT NULL, is_correct INTEGER NOT NULL, remaining_seconds INTEGER NOT NULL, created_at INTEGER NOT NULL)"),
 d.prepare("CREATE INDEX IF NOT EXISTS progress_email_idx ON activity_progress(email, created_at)"),
 d.prepare("CREATE TABLE IF NOT EXISTS attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, student_name TEXT NOT NULL, email TEXT NOT NULL, attempt_number INTEGER NOT NULL, score INTEGER NOT NULL, grade REAL NOT NULL, remaining_seconds INTEGER NOT NULL, scenario TEXT NOT NULL DEFAULT '', level INTEGER NOT NULL DEFAULT 1, consent_version TEXT NOT NULL DEFAULT '2026-08', ip_hash TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)")
]);}
