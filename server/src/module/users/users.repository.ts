import { db as defaultDb } from '../../db';
import type { Database as DatabaseType } from 'better-sqlite3';

export class UserRepository {
  constructor(private db: DatabaseType = defaultDb) {}

  findAll({ page, limit }: { page?: number; limit?: number }) {
    const offset = (Number(page) - 1) * Number(limit);

    const rows = this.db
      .prepare(
        `
          SELECT
            json_object(
              'id', u.id,
              'first_name', u.first_name,
              'last_name', u.last_name,
              'avatar', u.avatar,
              'age', u.age,
              'nationality', json_object(
                'code', n.code,
                'name', n.name
              ),
              'hobbies', COALESCE(
                (
                  SELECT json_group_array(
                    json_object(
                      'id', h.id,
                      'name', h.name,
                      'type', h.type
                    )
                  )
                  FROM user_hobby uh
                  JOIN hobby h ON h.id = uh.hobby_id
                  WHERE uh.user_id = u.id
                ),
                '[]'
              )
            ) AS data
          FROM users u
          LEFT JOIN nationality n ON n.code = u.nationality
          ORDER BY u.id
          LIMIT ? OFFSET ?
        `,
      )
      .all(Number(limit), offset) as Array<{ data: string }>;

    return rows.map((row) => JSON.parse(row.data));
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

  filterNames({ query }: { query: string }) {
    const rows = this.db
      .prepare(
        `
        SELECT
          json_object(
            'id', u.id,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'avatar', u.avatar,
            'age', u.age,
            'nationality', json_object(
              'code', n.code,
              'name', n.name
            ),
            'hobbies', COALESCE(
              (
                SELECT json_group_array(
                  json_object(
                    'id', h.id,
                    'name', h.name,
                    'type', h.type
                  )
                )
                FROM user_hobby uh
                JOIN hobby h ON h.id = uh.hobby_id
                WHERE uh.user_id = u.id
              ),
              '[]'
            )
          ) AS data
        FROM users u
        LEFT JOIN nationality n ON n.code = u.nationality
        WHERE u.first_name LIKE '%' || ? || '%'
           OR u.last_name  LIKE '%' || ? || '%'
        GROUP BY u.id
      `,
      )
      .all(query, query) as Array<{ data: string }>;

    return rows.map((row) => JSON.parse(row.data));
  }

  getFacets(query?: string | null): {
    hobbies: Array<{ label: string; count: number }>;
    nationalities: Array<{ label: string; count: number }>;
  } {
    const trimmed = query != null ? query.trim() : '';
    const filtered = trimmed.length > 0;

    const hobbiesSql = filtered
      ? `SELECT h.name AS label, COUNT(*) AS count
         FROM user_hobby uh
         JOIN hobby h ON h.id = uh.hobby_id
         JOIN users u ON u.id = uh.user_id
         WHERE u.first_name LIKE '%' || ? || '%' OR u.last_name LIKE '%' || ? || '%'
         GROUP BY h.name
         ORDER BY count DESC, LOWER(h.name) ASC
         LIMIT 20`
      : `SELECT h.name AS label, COUNT(*) AS count
         FROM user_hobby uh
         JOIN hobby h ON h.id = uh.hobby_id
         JOIN users u ON u.id = uh.user_id
         GROUP BY h.name
         ORDER BY count DESC, LOWER(h.name) ASC
         LIMIT 20`;

    const nationalitiesSql = filtered
      ? `SELECT n.name AS label, COUNT(*) AS count
         FROM users u
         JOIN nationality n ON n.code = u.nationality
         WHERE u.first_name LIKE '%' || ? || '%' OR u.last_name LIKE '%' || ? || '%'
         GROUP BY n.name
         ORDER BY count DESC, LOWER(n.name) ASC
         LIMIT 20`
      : `SELECT n.name AS label, COUNT(*) AS count
         FROM users u
         JOIN nationality n ON n.code = u.nationality
         GROUP BY n.name
         ORDER BY count DESC, LOWER(n.name) ASC
         LIMIT 20`;

    const hobbies = filtered
      ? (this.db.prepare(hobbiesSql).all(trimmed, trimmed) as Array<{
          label: string;
          count: number;
        }>)
      : (this.db.prepare(hobbiesSql).all() as Array<{ label: string; count: number }>);

    const nationalities = filtered
      ? (this.db.prepare(nationalitiesSql).all(trimmed, trimmed) as Array<{
          label: string;
          count: number;
        }>)
      : (this.db.prepare(nationalitiesSql).all() as Array<{ label: string; count: number }>);

    return { hobbies, nationalities };
  }
}
