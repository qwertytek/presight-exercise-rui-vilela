import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';

export const initDb = (db: DatabaseType) =>
  db.exec(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          run_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

const dbPath = process.env.DB_PATH ?? './server-database.db';

const db = new Database(dbPath, {
  // eslint-disable-next-line no-console
  verbose: console.log,
});

db.pragma('journal_mode = WAL');

export default db;
