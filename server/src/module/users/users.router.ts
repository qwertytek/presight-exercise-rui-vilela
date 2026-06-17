import express from 'express';
import { listUsers, getUsersById, getUsersByNameQuery, getFacetsByQuery } from './users.controller';

const router = express.Router();

router.get('/', listUsers);
router.get('/filter-name', getUsersByNameQuery);
router.get('/facets', getFacetsByQuery);
router.get('/:id', getUsersById);

export default router;
