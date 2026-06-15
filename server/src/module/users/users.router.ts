import express from 'express';
import { listUsers, getUsersById, getUsersByNameQuery } from './users.controller';

const router = express.Router();

router.get('/', listUsers);
router.get('/filter-name', getUsersByNameQuery);
router.get('/:id', getUsersById);

export default router;
