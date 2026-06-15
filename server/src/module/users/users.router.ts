import express from 'express';
import { listUsers } from './users.controller';

const router = express.Router();

router.get('/', listUsers);

export default router;
