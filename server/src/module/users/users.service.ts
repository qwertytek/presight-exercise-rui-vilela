import { UserRepository } from './users.repository';

export class UserService {
  constructor(private repo = new UserRepository()) {}

  list(page: number, limit: number) {
    return this.repo.findAll({ page, limit });
  }
}
