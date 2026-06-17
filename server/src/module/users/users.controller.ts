import { Request, Response } from 'express';
import { UserService } from './users.service';

const service = new UserService();

export const listUsers = async (req: Request, res: Response) => {
  const page = Number(req?.query?.page || 1);
  const limit = Number(req?.query?.limit || 20);

  const data = service.list(page, limit);

  const response = {
    data,
    count: data.length,
  };

  res.json(response);
};

export const getUsersById = async (req: Request, res: Response) => {
  const userId = req?.params?.id;

  const row = service.getById(Number(userId)) as { data: string };
  const data = JSON.parse(row.data);

  const response = {
    data,
    hobby_count: data?.hobbies?.length,
  };

  return res.json(response);
};

export const getUsersByNameQuery = async (req: Request, res: Response) => {
  const query = (req?.query?.q as string) || '';

  if (!query.length) {
    return res.json({
      data: [],
    });
  }

  const data = service.getUserByQueryName(query);

  const response = {
    data,
  };

  return res.json(response);
};

export const getFacetsByQuery = async (req: Request, res: Response) => {
  const q = req.query.q;

  if (Array.isArray(q)) {
    return res.status(400).json({ error: 'Invalid query parameter' });
  }

  if (typeof q === 'string' && q.length > 200) {
    return res.status(400).json({ error: 'Query parameter too long' });
  }

  const normalised = typeof q === 'string' && q.trim().length > 0 ? q.trim() : undefined;

  try {
    const result = service.getFacets(normalised);
    return res.status(200).json(result);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
