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
