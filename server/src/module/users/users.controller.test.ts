import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { listUsers, getUsersById } from './users.controller';

// ---------------------------------------------------------------------------
// Mock UserService — vi.hoisted ensures mocks are available inside vi.mock
// ---------------------------------------------------------------------------
const { mockList, mockGetById } = vi.hoisted(() => ({
  mockList: vi.fn(),
  mockGetById: vi.fn(),
}));

vi.mock('./users.service', () => {
  const UserService = vi.fn(function (this: {
    list: typeof mockList;
    getById: typeof mockGetById;
  }) {
    this.list = mockList;
    this.getById = mockGetById;
  });
  return { UserService };
});

// ---------------------------------------------------------------------------
// Minimal app wired with just the users routes
// ---------------------------------------------------------------------------
const buildApp = () => {
  const app = express();

  app.use(express.json());
  app.get('/api/users', listUsers);
  app.get('/api/users/:id', getUsersById);

  return app;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with data and count', async () => {
    const fakeUsers = [
      { id: 1, first_name: 'Alice', last_name: 'Smith' },
      { id: 2, first_name: 'Bob', last_name: 'Jones' },
    ];

    mockList.mockReturnValue(fakeUsers);

    const res = await request(buildApp()).get('/api/users');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: fakeUsers, count: 2 });
  });

  it('returns count matching data length', async () => {
    mockList.mockReturnValue([{ id: 1, first_name: 'Alice', last_name: 'Smith' }]);

    const res = await request(buildApp()).get('/api/users');

    expect(res.body.count).toBe(res.body.data.length);
  });

  it('uses default page=1 and limit=20 when no query params are given', async () => {
    mockList.mockReturnValue([]);

    await request(buildApp()).get('/api/users');

    expect(mockList).toHaveBeenCalledWith(1, 20);
  });

  it('passes page and limit query params to the service', async () => {
    mockList.mockReturnValue([]);

    await request(buildApp()).get('/api/users?page=3&limit=5');

    expect(mockList).toHaveBeenCalledWith(3, 5);
  });

  it('returns an empty data array and count=0 when there are no users', async () => {
    mockList.mockReturnValue([]);

    const res = await request(buildApp()).get('/api/users');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [], count: 0 });
  });

  it('responds with JSON content-type', async () => {
    mockList.mockReturnValue([]);

    const res = await request(buildApp()).get('/api/users');

    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('GET /api/users/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fakeUser = {
    id: 1,
    first_name: 'Alice',
    last_name: 'Smith',
    age: 30,
    avatar: null,
    country: { code: 'PT', name: 'Portugal' },
    hobbies: [
      { id: 10, name: 'Reading', type: 'Indoor' },
      { id: 11, name: 'Cycling', type: 'Outdoor' },
    ],
  };

  it('returns 200 with data and hobby_count', async () => {
    mockGetById.mockReturnValue({ data: JSON.stringify(fakeUser) });

    const res = await request(buildApp()).get('/api/users/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: fakeUser, hobby_count: 2 });
  });

  it('calls service.getById with the numeric id from the route param', async () => {
    mockGetById.mockReturnValue({ data: JSON.stringify(fakeUser) });

    await request(buildApp()).get('/api/users/1');

    expect(mockGetById).toHaveBeenCalledWith(1);
  });

  it('returns hobby_count matching the hobbies array length', async () => {
    mockGetById.mockReturnValue({ data: JSON.stringify(fakeUser) });

    const res = await request(buildApp()).get('/api/users/1');

    expect(res.body.hobby_count).toBe(res.body.data.hobbies.length);
  });

  it('returns hobby_count of 0 when the user has no hobbies', async () => {
    const userNoHobbies = { ...fakeUser, hobbies: [] };
    mockGetById.mockReturnValue({ data: JSON.stringify(userNoHobbies) });

    const res = await request(buildApp()).get('/api/users/1');

    expect(res.body.hobby_count).toBe(0);
  });

  it('responds with JSON content-type', async () => {
    mockGetById.mockReturnValue({ data: JSON.stringify(fakeUser) });

    const res = await request(buildApp()).get('/api/users/1');

    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});
