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

  getById({ id }: { id: number }) {
    return this.db
      .prepare(
        `
          SELECT json_object(
              'id', u.id,
              'first_name', u.first_name,
              'last_name', u.last_name,
              'avatar', u.avatar,
              'age', u.age,
              'country', json_object(
                'code', n.code,
                'name', n.name
              ),
              'hobbies', json_group_array(
                json_object(
                  'id', uh.hobby_id,
                  'name', h.name,
                  'type', h.type
                )
              )
            ) as data
          FROM users u
          LEFT JOIN nationality n ON n.code = u.nationality
          LEFT JOIN user_hobby uh ON uh.user_id = u.id
          LEFT JOIN hobby h ON uh.hobby_id = h.id
          WHERE u.id = ?
        `,
      )
      .get(id);
  }
}
