import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import {
  createMigrationRepo,
  getMigrationFiles,
  runMigration,
  createRunner,
  runMigrations,
} from './migrate';

// --------------------
// Mocks
// --------------------
vi.mock('fs');

const mockFs = fs as unknown as {
  readdirSync: ReturnType<typeof vi.fn>;
};

type FakeStmt = {
  get: ReturnType<typeof vi.fn>;
  run: ReturnType<typeof vi.fn>;
};

const makeDb = () => {
  const stmt: FakeStmt = {
    get: vi.fn(),
    run: vi.fn(),
  };

  return {
    prepare: vi.fn(() => stmt),
    exec: vi.fn(),
    transaction: vi.fn((fn: any) => fn),
  };
};

describe('migrations utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------------
  // getMigrationFiles
  // --------------------
  it('should read and sort sql migration files', () => {
    mockFs.readdirSync.mockReturnValue(['2-init.sql', '10-users.sql', '1-base.sql', 'readme.txt']);

    const result = getMigrationFiles();

    expect(result).toEqual(['1-base.sql', '2-init.sql', '10-users.sql']);
  });

  // --------------------
  // createMigrationRepo
  // --------------------
  it('should detect existing migration', () => {
    const db = makeDb();

    const repo = createMigrationRepo(db as any);

    (db.prepare().get as any).mockReturnValue({ 1: 1 });

    expect(repo.hasMigration('001.sql')).toBe(true);
  });

  it('should insert migration record', () => {
    const db = makeDb();

    const repo = createMigrationRepo(db as any);

    repo.insertMigration('001.sql');

    expect(db.prepare().run).toHaveBeenCalledWith('001.sql');
  });

  // --------------------
  // runMigration / createRunner
  // --------------------
  it('runMigration executes SQL and records migration', () => {
    const db = makeDb();
    const insert = vi.fn();

    const runner = runMigration(db as any, insert);

    runner('001.sql', 'CREATE TABLE test (id INTEGER);');

    expect(db.exec).toHaveBeenCalledWith('CREATE TABLE test (id INTEGER);');
    expect(insert).toHaveBeenCalledWith('001.sql');
  });

  it('createRunner behaves same as runMigration', () => {
    const db = makeDb();
    const insert = vi.fn();

    const runner = createRunner(db as any, insert);

    runner('002.sql', 'SELECT 1;');

    expect(db.exec).toHaveBeenCalledWith('SELECT 1;');
    expect(insert).toHaveBeenCalledWith('002.sql');
  });

  it('runs unapplied migrations', () => {
    const db = makeDb();

    mockFs.readdirSync.mockReturnValue(['001.sql']);

    (db.prepare().get as any).mockReturnValue(null);

    vi.spyOn(fs, 'readFileSync').mockReturnValue('CREATE TABLE users(id INTEGER);' as any);

    runMigrations(db as any);

    expect(db.exec).toHaveBeenCalledWith('CREATE TABLE users(id INTEGER);');

    expect(db.prepare().run).toHaveBeenCalledWith('001.sql');
  });

  it('skips already applied migrations', () => {
    const db = makeDb();

    mockFs.readdirSync.mockReturnValue(['001.sql']);

    // migration already exists
    (db.prepare().get as any).mockReturnValue({ 1: 1 });

    const readSpy = vi.spyOn(fs, 'readFileSync');

    runMigrations(db as any);

    // migration file never loaded
    expect(readSpy).not.toHaveBeenCalled();

    // migration table check was performed
    expect(db.prepare().get).toHaveBeenCalledWith('001.sql');

    // migration was not recorded again
    expect(db.prepare().run).not.toHaveBeenCalled();
  });
});
