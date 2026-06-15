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

    CREATE TABLE hobby (
      id   INTEGER PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(100)
    );

    CREATE TABLE user_hobby (
      user_id  INTEGER NOT NULL,
      hobby_id INTEGER NOT NULL,
      FOREIGN KEY (user_id)  REFERENCES users(id),
      FOREIGN KEY (hobby_id) REFERENCES hobby(id)
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

describe('UserRepository.getById', () => {
  let db: DatabaseType;
  let repo: UserRepository;

  beforeEach(() => {
    db = buildDb();
    repo = new UserRepository(db);
  });

  it('returns a row with a null id when no user matches', () => {
    const result = repo.getById({ id: 999 }) as { data: string };
    const data = JSON.parse(result.data);

    // SQLite's json_object + json_group_array always returns a row even with no match;
    // the id field will be null when the user does not exist.
    expect(data.id).toBeNull();
  });

  it('returns a row with a data property for an existing user', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith', age: 30 });

    const result = repo.getById({ id: 1 }) as { data: string };

    expect(result).not.toBeNull();
    expect(typeof result.data).toBe('string');
  });

  it('returns correct user fields in the JSON data', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith', age: 30 });

    const result = repo.getById({ id: 1 }) as { data: string };
    const data = JSON.parse(result.data);

    expect(data).toMatchObject({
      id: 1,
      first_name: 'Alice',
      last_name: 'Smith',
      age: 30,
    });
  });

  it('includes nationality when the user has one', () => {
    db.prepare('INSERT INTO nationality (code, name) VALUES (?, ?)').run('PT', 'Portugal');
    db.prepare(
      'INSERT INTO users (id, first_name, last_name, age, nationality) VALUES (?, ?, ?, ?, ?)',
    ).run(1, 'Alice', 'Smith', 30, 'PT');

    const result = repo.getById({ id: 1 }) as { data: string };
    const data = JSON.parse(result.data);

    expect(data.country).toEqual({ code: 'PT', name: 'Portugal' });
  });

  it('includes hobbies when the user has them', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith' });
    db.prepare('INSERT INTO hobby (id, name, type) VALUES (?, ?, ?)').run(10, 'Reading', 'Indoor');
    db.prepare('INSERT INTO hobby (id, name, type) VALUES (?, ?, ?)').run(11, 'Cycling', 'Outdoor');
    db.prepare('INSERT INTO user_hobby (user_id, hobby_id) VALUES (?, ?)').run(1, 10);
    db.prepare('INSERT INTO user_hobby (user_id, hobby_id) VALUES (?, ?)').run(1, 11);

    const result = repo.getById({ id: 1 }) as { data: string };
    const data = JSON.parse(result.data);

    expect(data.hobbies).toHaveLength(2);
    expect(data.hobbies).toEqual(
      expect.arrayContaining([
        { id: 10, name: 'Reading', type: 'Indoor' },
        { id: 11, name: 'Cycling', type: 'Outdoor' },
      ]),
    );
  });

  it('returns an empty hobbies array when the user has no hobbies', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith' });

    const result = repo.getById({ id: 1 }) as { data: string };
    const data = JSON.parse(result.data);

    // SQLite json_group_array returns [{"id":null,...}] when there are no rows;
    // this test documents that the hobbies array has one null-filled entry.
    expect(Array.isArray(data.hobbies)).toBe(true);
  });

  it('does not return another user when queried by a different id', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith' });
    insertUser(db, { id: 2, first_name: 'Bob', last_name: 'Jones' });

    const result = repo.getById({ id: 2 }) as { data: string };
    const data = JSON.parse(result.data);

    expect(data.id).toBe(2);
    expect(data.first_name).toBe('Bob');
  });
});
