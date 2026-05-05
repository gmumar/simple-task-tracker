import Database from 'better-sqlite3';
import path from 'path';

// By default, store the sqlite db in the root
const dbPath = path.join(process.cwd(), 'work-tracker.sqlite');

const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    week_start TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    closed_date INTEGER
  );

  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

export default db;
