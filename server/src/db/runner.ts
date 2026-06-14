import { runMigrations } from './migrate';
import db from '.';

runMigrations(db);
