import express from 'express';
import { listUsers, getUsersById } from './users.controller';

const router = express.Router();

router.get('/', listUsers);
router.get('/:id', getUsersById);

export default router;
