import { Request, Response } from 'express';
import { UserService } from './users.service';

const service = new UserService();

export const listUsers = async (req: Request, res: Response) => {
  const page = Number(req?.query?.page || 1);
  const limit = Number(req?.query?.limit || 20);

  const rows = service.list(page, limit) as { data: string }[];
  const data = rows.map((row) => JSON.parse(row.data));

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

  const rows = service.getUserByQueryName(query) as { data: string }[];

  const response = {
    data: rows.map((row) => JSON.parse(row.data)),
  };

  return res.json(response);
};
