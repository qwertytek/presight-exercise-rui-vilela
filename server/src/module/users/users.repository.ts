import { db } from '../../db';

export class UserRepository {
  findAll({ page, limit }: { page?: number; limit?: number }) {
    const offset = (Number(page) - 1) * Number(limit);

    return db
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
