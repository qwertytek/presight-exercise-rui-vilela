import { db as defaultDb } from '../../db';
import type { Database as DatabaseType } from 'better-sqlite3';

export class UserRepository {
  constructor(private db: DatabaseType = defaultDb) {}

  findAll({ page, limit }: { page?: number; limit?: number }) {
    const offset = (Number(page) - 1) * Number(limit);

    return this.db
      .prepare(
        `
            SELECT * FROM users
            ORDER BY id
            LIMIT ? OFFSET ?
        `,
      )
      .all(Number(limit), offset);
  }
}
