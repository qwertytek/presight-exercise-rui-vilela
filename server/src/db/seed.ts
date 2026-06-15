import db from './index';
import nationalities from './seeds/nationalities.json';
import fs from 'fs';
import path from 'path';
import users from './seeds/users.json';

const seed = db.transaction(() => {
  // NATIONALITIES
  for (const [key, value] of Object.entries(nationalities)) {
    db.prepare('INSERT OR IGNORE INTO nationality (code, name) VALUES (?, ?)').run(key, value);
  }

  // HOBBIES
  const hobbiesPath = path.join(__dirname, 'seeds/hobbies.csv');
  const hobbiesContent = fs.readFileSync(hobbiesPath, 'utf-8');

  const lines = hobbiesContent.split('\n');

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].trim();
    const values = currentLine.split(',');

    db.prepare('INSERT OR IGNORE INTO hobby (id, name, type) VALUES (?, ?, ?)').run(
      i,
      values[0],
      values[1],
    );
  }

  // USERS
  for (const u of users) {
    db.prepare(
      'INSERT OR IGNORE INTO users (id, avatar, first_name, last_name, age, nationality) VALUES (?, ?, ?, ?, ?, ?)',
    ).run(u.id, u.avatar, u.first_name, u.last_name, u.age, u.nationality);
    for (const hobbyId of u.hobbies) {
      db.prepare('INSERT OR IGNORE INTO user_hobby (user_id, hobby_id) VALUES (?, ?)').run(
        u.id,
        hobbyId,
      );
    }
  }
});

seed();
