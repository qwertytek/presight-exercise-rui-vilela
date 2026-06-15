import { UserRepository } from './users.repository';

export class UserService {
  constructor(private repo = new UserRepository()) {}

  list(page: number, limit: number) {
    return this.repo.findAll({ page, limit });
  }

  getById(id: number) {
    return this.repo.getById({ id });
  }

  getUserByQueryName(query: string) {
    return this.repo.filterNames({ query });
  }
}
