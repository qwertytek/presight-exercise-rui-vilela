import { runMigrations } from './migrate';
import { db, initDb } from '.';

initDb(db);
runMigrations(db);
