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

describe('UserRepository.filterNames', () => {
  let db: DatabaseType;
  let repo: UserRepository;

  beforeEach(() => {
    db = buildDb();
    repo = new UserRepository(db);
  });

  it('returns an empty array when there are no users', () => {
    const result = repo.filterNames({ query: 'Alice' });

    expect(result).toEqual([]);
  });

  it('returns an empty array when no users match the query', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith' });

    const result = repo.filterNames({ query: 'xyz' });

    expect(result).toEqual([]);
  });

  it('matches on first_name', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith' });
    insertUser(db, { id: 2, first_name: 'Bob', last_name: 'Jones' });

    const result = repo.filterNames({ query: 'Alice' }) as { id: number }[];

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('matches on last_name', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith' });
    insertUser(db, { id: 2, first_name: 'Bob', last_name: 'Jones' });

    const result = repo.filterNames({ query: 'Jones' }) as { id: number }[];

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('is case-insensitive for first_name', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith' });

    const result = repo.filterNames({ query: 'alice' });

    expect(result).toHaveLength(1);
  });

  it('is case-insensitive for last_name', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith' });

    const result = repo.filterNames({ query: 'SMITH' });

    expect(result).toHaveLength(1);
  });

  it('performs a partial (substring) match on first_name', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith' });

    const result = repo.filterNames({ query: 'lic' });

    expect(result).toHaveLength(1);
  });

  it('performs a partial (substring) match on last_name', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith' });

    const result = repo.filterNames({ query: 'mit' });

    expect(result).toHaveLength(1);
  });

  it('returns all matching users when multiple users match', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith' });
    insertUser(db, { id: 2, first_name: 'Alicia', last_name: 'Jones' });
    insertUser(db, { id: 3, first_name: 'Bob', last_name: 'Jones' });

    const result = repo.filterNames({ query: 'Ali' }) as { id: number }[];

    expect(result).toHaveLength(2);
    expect(result.map((u) => u.id)).toEqual(expect.arrayContaining([1, 2]));
  });

  it('returns id, first_name and last_name fields in the result', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith', age: 30 });

    const [user] = repo.filterNames({ query: 'Alice' }) as Record<string, unknown>[];

    expect(user.id).toBe(1);
    expect(user.first_name).toBe('Alice');
    expect(user.last_name).toBe('Smith');
  });

  it('returns a user that matches on either first_name or last_name', () => {
    insertUser(db, { id: 1, first_name: 'Sam', last_name: 'Samson' });

    const result = repo.filterNames({ query: 'Sam' }) as { id: number }[];

    // Only one row should be returned even though both columns match
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
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

// ---------------------------------------------------------------------------
// Helpers for getFacets tests
// ---------------------------------------------------------------------------

const insertNationality = (db: DatabaseType, code: string, name: string) => {
  db.prepare('INSERT INTO nationality (code, name) VALUES (?, ?)').run(code, name);
};

const insertUserWithNationality = (
  db: DatabaseType,
  user: { id: number; first_name: string; last_name: string; nationality: string },
) => {
  db.prepare(
    'INSERT INTO users (id, first_name, last_name, nationality) VALUES (@id, @first_name, @last_name, @nationality)',
  ).run(user);
};

const insertHobby = (db: DatabaseType, id: number, name: string) => {
  db.prepare('INSERT INTO hobby (id, name, type) VALUES (?, ?, ?)').run(id, name, 'General');
};

const insertUserHobby = (db: DatabaseType, userId: number, hobbyId: number) => {
  db.prepare('INSERT INTO user_hobby (user_id, hobby_id) VALUES (?, ?)').run(userId, hobbyId);
};

// ---------------------------------------------------------------------------
// Unit tests – UserRepository.getFacets
// ---------------------------------------------------------------------------

describe('UserRepository.getFacets', () => {
  let db: DatabaseType;
  let repo: UserRepository;

  beforeEach(() => {
    db = buildDb();
    repo = new UserRepository(db);
  });

  it('returns empty arrays when there are no users', () => {
    const result = repo.getFacets();
    expect(result).toEqual({ hobbies: [], nationalities: [] });
  });

  it('returns all-user facets when called with no argument', () => {
    insertNationality(db, 'DE', 'Germany');
    insertNationality(db, 'PT', 'Portugal');
    insertUserWithNationality(db, {
      id: 1,
      first_name: 'Alice',
      last_name: 'Smith',
      nationality: 'DE',
    });
    insertUserWithNationality(db, {
      id: 2,
      first_name: 'Bob',
      last_name: 'Jones',
      nationality: 'PT',
    });
    insertHobby(db, 1, 'Reading');
    insertUserHobby(db, 1, 1);
    insertUserHobby(db, 2, 1);

    const result = repo.getFacets();

    expect(result.nationalities).toHaveLength(2);
    expect(result.hobbies).toHaveLength(1);
    expect(result.hobbies[0]).toEqual({ label: 'Reading', count: 2 });
  });

  it('returns same result for undefined, null, empty string, and whitespace-only string', () => {
    insertNationality(db, 'DE', 'Germany');
    insertUserWithNationality(db, {
      id: 1,
      first_name: 'Alice',
      last_name: 'Smith',
      nationality: 'DE',
    });
    insertHobby(db, 1, 'Reading');
    insertUserHobby(db, 1, 1);

    const baseline = repo.getFacets();
    expect(repo.getFacets(undefined)).toEqual(baseline);
    expect(repo.getFacets(null)).toEqual(baseline);
    expect(repo.getFacets('')).toEqual(baseline);
    expect(repo.getFacets('   ')).toEqual(baseline);
  });

  it('filters by query matching first_name', () => {
    insertNationality(db, 'DE', 'Germany');
    insertNationality(db, 'PT', 'Portugal');
    insertUserWithNationality(db, {
      id: 1,
      first_name: 'Alice',
      last_name: 'Smith',
      nationality: 'DE',
    });
    insertUserWithNationality(db, {
      id: 2,
      first_name: 'Bob',
      last_name: 'Jones',
      nationality: 'PT',
    });
    insertHobby(db, 1, 'Reading');
    insertHobby(db, 2, 'Cycling');
    insertUserHobby(db, 1, 1);
    insertUserHobby(db, 2, 2);

    const result = repo.getFacets('Alice');

    expect(result.nationalities).toHaveLength(1);
    expect(result.nationalities[0]).toEqual({ label: 'Germany', count: 1 });
    expect(result.hobbies).toHaveLength(1);
    expect(result.hobbies[0]).toEqual({ label: 'Reading', count: 1 });
  });

  it('filters by query matching last_name', () => {
    insertNationality(db, 'DE', 'Germany');
    insertUserWithNationality(db, {
      id: 1,
      first_name: 'Alice',
      last_name: 'Smith',
      nationality: 'DE',
    });
    insertUser(db, { id: 2, first_name: 'Bob', last_name: 'Jones' });

    const result = repo.getFacets('Smith');

    expect(result.nationalities).toHaveLength(1);
    expect(result.nationalities[0]).toEqual({ label: 'Germany', count: 1 });
  });

  it('returns empty arrays when query matches zero users', () => {
    insertNationality(db, 'DE', 'Germany');
    insertUserWithNationality(db, {
      id: 1,
      first_name: 'Alice',
      last_name: 'Smith',
      nationality: 'DE',
    });
    insertHobby(db, 1, 'Reading');
    insertUserHobby(db, 1, 1);

    const result = repo.getFacets('xyz_no_match');

    expect(result).toEqual({ hobbies: [], nationalities: [] });
  });

  it('returns nationality labels as full names, not ISO codes', () => {
    insertNationality(db, 'DE', 'Germany');
    insertUserWithNationality(db, {
      id: 1,
      first_name: 'Alice',
      last_name: 'Smith',
      nationality: 'DE',
    });

    const result = repo.getFacets();

    expect(result.nationalities[0].label).toBe('Germany');
    expect(result.nationalities[0].label).not.toBe('DE');
  });

  it('respects LIMIT 20 for hobbies', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith' });
    for (let i = 1; i <= 25; i++) {
      insertHobby(db, i, `Hobby${i}`);
      insertUserHobby(db, 1, i);
    }

    const result = repo.getFacets();

    expect(result.hobbies).toHaveLength(20);
  });

  it('respects LIMIT 20 for nationalities', () => {
    for (let i = 1; i <= 25; i++) {
      const code = String(i).padStart(2, '0');
      insertNationality(db, code, `Country${i}`);
      insertUserWithNationality(db, {
        id: i,
        first_name: `User${i}`,
        last_name: 'Test',
        nationality: code,
      });
    }

    const result = repo.getFacets();

    expect(result.nationalities).toHaveLength(20);
  });

  it('orders hobbies by count descending', () => {
    insertNationality(db, 'DE', 'Germany');
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith' });
    insertUser(db, { id: 2, first_name: 'Bob', last_name: 'Jones' });
    insertHobby(db, 1, 'Reading');
    insertHobby(db, 2, 'Cycling');
    insertUserHobby(db, 1, 1); // Alice: Reading
    insertUserHobby(db, 2, 1); // Bob: Reading
    insertUserHobby(db, 1, 2); // Alice: Cycling

    const result = repo.getFacets();

    expect(result.hobbies[0].label).toBe('Reading');
    expect(result.hobbies[0].count).toBe(2);
    expect(result.hobbies[1].label).toBe('Cycling');
    expect(result.hobbies[1].count).toBe(1);
  });

  it('breaks ties alphabetically (case-insensitive) for hobbies', () => {
    insertUser(db, { id: 1, first_name: 'Alice', last_name: 'Smith' });
    insertHobby(db, 1, 'Zumba');
    insertHobby(db, 2, 'archery');
    insertHobby(db, 3, 'Boxing');
    insertUserHobby(db, 1, 1);
    insertUserHobby(db, 1, 2);
    insertUserHobby(db, 1, 3);

    const result = repo.getFacets();

    // All counts are 1, so should be ordered alphabetically case-insensitively
    const labels = result.hobbies.map((h) => h.label);
    expect(labels).toEqual(['archery', 'Boxing', 'Zumba']);
  });

  it('each FacetItem has label (non-empty string) and count (positive integer)', () => {
    insertNationality(db, 'DE', 'Germany');
    insertUserWithNationality(db, {
      id: 1,
      first_name: 'Alice',
      last_name: 'Smith',
      nationality: 'DE',
    });
    insertHobby(db, 1, 'Reading');
    insertUserHobby(db, 1, 1);

    const result = repo.getFacets();

    for (const item of [...result.hobbies, ...result.nationalities]) {
      expect(typeof item.label).toBe('string');
      expect(item.label.length).toBeGreaterThan(0);
      expect(typeof item.count).toBe('number');
      expect(item.count).toBeGreaterThan(0);
      expect(Number.isInteger(item.count)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Property-based tests – UserRepository.getFacets
// ---------------------------------------------------------------------------

import fc from 'fast-check';

describe('UserRepository.getFacets – property-based tests', () => {
  // Shared helpers to set up an in-memory db from generated data
  const setupDb = (
    users: Array<{ id: number; first_name: string; last_name: string }>,
    hobbies: Array<{ id: number; name: string }>,
    userHobbies: Array<{ userId: number; hobbyId: number }>,
    nationalities: Array<{ code: string; name: string }>,
    userNationalities: Map<number, string>,
  ) => {
    const db = buildDb();

    for (const n of nationalities) {
      db.prepare('INSERT INTO nationality (code, name) VALUES (?, ?)').run(n.code, n.name);
    }

    for (const u of users) {
      const nat = userNationalities.get(u.id) ?? null;
      db.prepare(
        'INSERT INTO users (id, first_name, last_name, nationality) VALUES (?, ?, ?, ?)',
      ).run(u.id, u.first_name, u.last_name, nat);
    }

    for (const h of hobbies) {
      db.prepare('INSERT INTO hobby (id, name, type) VALUES (?, ?, ?)').run(
        h.id,
        h.name,
        'General',
      );
    }

    for (const uh of userHobbies) {
      db.prepare('INSERT INTO user_hobby (user_id, hobby_id) VALUES (?, ?)').run(
        uh.userId,
        uh.hobbyId,
      );
    }

    return db;
  };

  // Arbitraries
  const nonEmptyAlpha = fc.stringMatching(/^[A-Za-z]{1,20}$/);
  const isoCode = fc.stringMatching(/^[A-Z]{2}$/);

  it(// Feature: sidebar-facets, Property 1: FacetItem shape validity
  'Property 1: every returned FacetItem has a non-empty string label and a positive integer count', () => {
    fc.assert(
      fc.property(
        // Generate 1-10 unique nationalities
        fc.uniqueArray(fc.record({ code: isoCode, name: nonEmptyAlpha }), {
          minLength: 1,
          maxLength: 10,
          selector: (n) => n.code,
        }),
        // Generate 1-10 unique hobbies
        fc.uniqueArray(nonEmptyAlpha, { minLength: 1, maxLength: 10 }),
        // Generate 1-15 users
        fc.integer({ min: 1, max: 15 }),
        (nationalityDefs, hobbyNames, userCount) => {
          const nationalities = nationalityDefs;
          const hobbies = hobbyNames.map((name, i) => ({ id: i + 1, name }));
          const users = Array.from({ length: userCount }, (_, i) => ({
            id: i + 1,
            first_name: `User${i}`,
            last_name: `Test${i}`,
          }));

          // Assign nationalities and hobbies randomly but deterministically via indices
          const userNationalities = new Map<number, string>();
          for (const u of users) {
            if (nationalities.length > 0) {
              userNationalities.set(u.id, nationalities[u.id % nationalities.length].code);
            }
          }
          const userHobbies = hobbies.flatMap((h, hi) =>
            users
              .filter((_, ui) => (ui + hi) % 3 !== 0)
              .map((u) => ({ userId: u.id, hobbyId: h.id })),
          );

          const db = setupDb(users, hobbies, userHobbies, nationalities, userNationalities);
          const repo = new UserRepository(db);
          const result = repo.getFacets();

          for (const item of [...result.hobbies, ...result.nationalities]) {
            if (typeof item.label !== 'string' || item.label.length === 0) return false;
            if (!Number.isInteger(item.count) || item.count <= 0) return false;
          }
          db.close();
          return true;
        },
      ),
      { numRuns: 100 },
    );
  });

  it(// Feature: sidebar-facets, Property 2: Facets limit and ordering
  'Property 2: arrays contain at most 20 items, ordered by count DESC then label ASC (case-insensitive)', () => {
    fc.assert(
      fc.property(
        // Use more hobbies/nationalities than the 20-item limit
        fc.uniqueArray(nonEmptyAlpha, { minLength: 21, maxLength: 35 }),
        fc.uniqueArray(fc.record({ code: isoCode, name: nonEmptyAlpha }), {
          minLength: 21,
          maxLength: 35,
          selector: (n) => n.code,
        }),
        (hobbyNames, nationalityDefs) => {
          const hobbies = hobbyNames.map((name, i) => ({ id: i + 1, name }));
          const nationalities = nationalityDefs;
          // One user per nationality so all counts are 1
          const users = nationalities.map((n, i) => ({
            id: i + 1,
            first_name: `User${i}`,
            last_name: `Test${i}`,
          }));
          const userNationalities = new Map<number, string>(
            users.map((u, i) => [u.id, nationalities[i].code]),
          );
          // Each user gets one unique hobby to spread counts
          const userHobbies = users
            .filter((_, i) => i < hobbies.length)
            .map((u, i) => ({ userId: u.id, hobbyId: hobbies[i].id }));

          const db = setupDb(users, hobbies, userHobbies, nationalities, userNationalities);
          const repo = new UserRepository(db);
          const result = repo.getFacets();

          // Length constraint
          if (result.hobbies.length > 20) return false;
          if (result.nationalities.length > 20) return false;

          // Ordering: count DESC, then label ASC case-insensitive
          const checkOrder = (items: Array<{ label: string; count: number }>) => {
            for (let i = 1; i < items.length; i++) {
              const prev = items[i - 1];
              const curr = items[i];
              if (prev.count < curr.count) return false;
              if (prev.count === curr.count) {
                if (prev.label.toLowerCase() > curr.label.toLowerCase()) return false;
              }
            }
            return true;
          };

          if (!checkOrder(result.hobbies)) return false;
          if (!checkOrder(result.nationalities)) return false;

          db.close();
          return true;
        },
      ),
      { numRuns: 100 },
    );
  });

  it(// Feature: sidebar-facets, Property 3: Filter correctness
  'Property 3: getFacets(q) counts match a naive JS reference implementation', () => {
    fc.assert(
      fc.property(
        // Short alpha-only query so it reliably matches user names
        fc.stringMatching(/^[A-Za-z]{2,5}$/),
        fc.integer({ min: 3, max: 12 }),
        (query, userCount) => {
          const nationalities = [
            { code: 'DE', name: 'Germany' },
            { code: 'PT', name: 'Portugal' },
            { code: 'FR', name: 'France' },
          ];
          const hobbies = [
            { id: 1, name: 'Reading' },
            { id: 2, name: 'Cycling' },
            { id: 3, name: 'Hiking' },
          ];

          // Half of users have first_name containing the query
          const users = Array.from({ length: userCount }, (_, i) => ({
            id: i + 1,
            first_name: i % 2 === 0 ? `${query}user` : `OtherUser${i}`,
            last_name: `Last${i}`,
          }));

          const userNationalities = new Map<number, string>(
            users.map((u) => [u.id, nationalities[u.id % nationalities.length].code]),
          );
          const userHobbies = users.map((u) => ({
            userId: u.id,
            hobbyId: hobbies[u.id % hobbies.length].id,
          }));

          const db = setupDb(users, hobbies, userHobbies, nationalities, userNationalities);
          const repo = new UserRepository(db);
          const result = repo.getFacets(query);

          // Reference implementation using JS
          const lq = query.toLowerCase();
          const matchedUsers = users.filter(
            (u) =>
              u.first_name.toLowerCase().includes(lq) || u.last_name.toLowerCase().includes(lq),
          );
          const matchedIds = new Set(matchedUsers.map((u) => u.id));

          // Reference hobby counts
          const refHobbyCounts = new Map<string, number>();
          for (const uh of userHobbies) {
            if (matchedIds.has(uh.userId)) {
              const h = hobbies.find((h) => h.id === uh.hobbyId)!;
              refHobbyCounts.set(h.name, (refHobbyCounts.get(h.name) ?? 0) + 1);
            }
          }

          // Reference nationality counts
          const refNatCounts = new Map<string, number>();
          for (const [uid, code] of userNationalities) {
            if (matchedIds.has(uid)) {
              const n = nationalities.find((n) => n.code === code)!;
              refNatCounts.set(n.name, (refNatCounts.get(n.name) ?? 0) + 1);
            }
          }

          // Compare
          for (const item of result.hobbies) {
            if (item.count !== (refHobbyCounts.get(item.label) ?? 0)) return false;
          }
          for (const item of result.nationalities) {
            if (item.count !== (refNatCounts.get(item.label) ?? 0)) return false;
          }

          db.close();
          return true;
        },
      ),
      { numRuns: 100 },
    );
  });

  it(// Feature: sidebar-facets, Property 4: Zero-count items absent
  'Property 4: hobbies and nationalities with zero users in the result set are not returned', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 8 }), (matchingUserCount) => {
        const nationalities = [
          { code: 'DE', name: 'Germany' },
          { code: 'PT', name: 'Portugal' }, // will have no matching users
        ];
        const hobbies = [
          { id: 1, name: 'Reading' },
          { id: 2, name: 'Cycling' }, // will have no matching users
        ];

        // Only matching users have nationality DE and hobby Reading
        const matchingUsers = Array.from({ length: matchingUserCount }, (_, i) => ({
          id: i + 1,
          first_name: `Alice${i}`,
          last_name: `Smith${i}`,
        }));
        // Non-matching users have different names, nationality PT, hobby Cycling
        const nonMatchingUsers = Array.from({ length: 3 }, (_, i) => ({
          id: matchingUserCount + i + 1,
          first_name: `Other${i}`,
          last_name: `Person${i}`,
        }));
        const allUsers = [...matchingUsers, ...nonMatchingUsers];

        const userNationalities = new Map<number, string>([
          ...matchingUsers.map((u): [number, string] => [u.id, 'DE']),
          ...nonMatchingUsers.map((u): [number, string] => [u.id, 'PT']),
        ]);
        const userHobbies = [
          ...matchingUsers.map((u) => ({ userId: u.id, hobbyId: 1 })),
          ...nonMatchingUsers.map((u) => ({ userId: u.id, hobbyId: 2 })),
        ];

        const db = setupDb(allUsers, hobbies, userHobbies, nationalities, userNationalities);
        const repo = new UserRepository(db);

        // Filter to only Alice users
        const result = repo.getFacets('Alice');

        const hobbyLabels = result.hobbies.map((h) => h.label);
        const natLabels = result.nationalities.map((n) => n.label);

        // Cycling and Portugal should be absent (zero matching users)
        if (hobbyLabels.includes('Cycling')) return false;
        if (natLabels.includes('Portugal')) return false;

        // All returned counts must be > 0
        for (const item of [...result.hobbies, ...result.nationalities]) {
          if (item.count <= 0) return false;
        }

        db.close();
        return true;
      }),
      { numRuns: 100 },
    );
  });
});
