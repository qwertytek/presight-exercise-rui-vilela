import fs from 'fs';
import path from 'path';
import type { Database as DatabaseType } from 'better-sqlite3';

const MIGRATION_DIR = path.join(__dirname, 'migrations');

export const createMigrationRepo = (db: DatabaseType) => {
  const selectStmt = db.prepare('SELECT 1 FROM migrations WHERE name = ?');

  const insertStmt = db.prepare('INSERT INTO migrations(name) VALUES (?)');

  return {
    hasMigration: (file: string): boolean => !!selectStmt.get(file),
    insertMigration: (file: string): unknown => insertStmt.run(file),
  };
};

export const getMigrationFiles = () =>
  fs
    .readdirSync(MIGRATION_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export const getFilePath = (file: string) => path.join(MIGRATION_DIR, file);

export const runMigration = (db: DatabaseType, insertMigration: (file: string) => unknown) =>
  db.transaction((file: string, sql: string) => {
    db.exec(sql);
    insertMigration(file);
  });

export const createRunner = (db: DatabaseType, insertMigration: (file: string) => unknown) =>
  db.transaction((file: string, sql: string) => {
    db.exec(sql);
    insertMigration(file);
  });

export const runMigrations = (db: DatabaseType) => {
  const { insertMigration, hasMigration } = createMigrationRepo(db);

  const runMigration = createRunner(db, insertMigration);

  for (const file of getMigrationFiles()) {
    if (hasMigration(file)) continue;

    const sql = fs.readFileSync(getFilePath(file), 'utf-8');

    try {
      runMigration(file, sql);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Migration failed: ${file}`);
      throw err;
    }
  }
};
