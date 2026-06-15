import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { UserRepository } from './users.repository';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const buildDb = (): DatabaseType => {
  const db = new Database(':memory:');

  db.exec(`
    CREATE TABLE nationality (
      code VARCHAR(2) PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    );

    CREATE TABLE users (
      id        INTEGER PRIMARY KEY,
      avatar    TEXT,
      first_name VARCHAR(100) NOT NULL,
      last_name  VARCHAR(100) NOT NULL,
      age        INTEGER,
      nationality VARCHAR(2),
      FOREIGN KEY (nationality) REFERENCES nationality(code)
    );
  `);

  return db;
};

const insertUser = (
  db: DatabaseType,
  user: { id: number; first_name: string; last_name: string; age?: number },
) => {
  db.prepare(
    'INSERT INTO users (id, first_name, last_name, age) VALUES (@id, @first_name, @last_name, @age)',
  ).run({ age: null, ...user });
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('UserRepository.findAll', () => {
  let db: DatabaseType;
  let repo: UserRepository;

  beforeEach(() => {
    db = buildDb();
    repo = new UserRepository(db);
  });

  it('returns an empty array when there are no users', () => {
    const result = repo.findAll({ page: 1, limit: 10 });

    expect(result).toEqual([]);
  });

  it('returns all users when count is below the limit', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith' });
    insertUser(db, { id: 2, first_name: 'Bob', last_name: 'Jones' });

    const result = repo.findAll({ page: 1, limit: 10 });

    expect(result).toHaveLength(2);
  });

  it('returns users ordered by id ascending', () => {
    insertUser(db, { id: 3, first_name: 'Charlie', last_name: 'Brown' });
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith' });
    insertUser(db, { id: 2, first_name: 'Bob', last_name: 'Jones' });

    const result = repo.findAll({ page: 1, limit: 10 }) as { id: number }[];

    expect(result.map((u) => u.id)).toEqual([1, 2, 3]);
  });

  it('respects the limit', () => {
    for (let i = 1; i <= 5; i++) {
      insertUser(db, { id: i, first_name: `User${i}`, last_name: 'Test' });
    }

    const result = repo.findAll({ page: 1, limit: 2 });

    expect(result).toHaveLength(2);
  });

  it('returns the correct page of results', () => {
    for (let i = 1; i <= 6; i++) {
      insertUser(db, { id: i, first_name: `User${i}`, last_name: 'Test' });
    }

    const page1 = repo.findAll({ page: 1, limit: 3 }) as { id: number }[];
    const page2 = repo.findAll({ page: 2, limit: 3 }) as { id: number }[];

    expect(page1.map((u) => u.id)).toEqual([1, 2, 3]);
    expect(page2.map((u) => u.id)).toEqual([4, 5, 6]);
  });

  it('returns the last partial page correctly', () => {
    for (let i = 1; i <= 5; i++) {
      insertUser(db, { id: i, first_name: `User${i}`, last_name: 'Test' });
    }

    const result = repo.findAll({ page: 2, limit: 3 }) as { id: number }[];

    expect(result).toHaveLength(2);
    expect(result.map((u) => u.id)).toEqual([4, 5]);
  });

  it('returns an empty array when page is beyond available data', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith' });

    const result = repo.findAll({ page: 99, limit: 10 });

    expect(result).toEqual([]);
  });

  it('throws when page is undefined (NaN offset is not a valid SQL parameter)', () => {
    // Number(undefined) = NaN → (NaN-1)*limit = NaN → SQLite rejects NaN as a bind value
    // This test documents the current (broken) behavior. The fix is to default page to 1
    // in findAll when the value is not a valid number.
    expect(() => repo.findAll({ limit: 2 })).toThrow();
  });

  it('returns correct shape for each user row', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith', age: 30 });

    const [user] = repo.findAll({ page: 1, limit: 10 }) as Record<string, unknown>[];

    expect(user).toMatchObject({
      id: 1,
      first_name: 'Alice',
      last_name: 'Smith',
      age: 30,
    });
  });
});
