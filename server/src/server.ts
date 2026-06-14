import app from './app';
import db, { initDb } from './db';
import { runMigrations } from './db/migrate';

initDb(db);
runMigrations(db);

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('API running on http://localhost:3000');
});
