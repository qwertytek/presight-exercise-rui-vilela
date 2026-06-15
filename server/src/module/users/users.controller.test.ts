import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { listUsers } from './users.controller';

// ---------------------------------------------------------------------------
// Mock UserService — vi.hoisted ensures mockList is available inside vi.mock
// ---------------------------------------------------------------------------
const { mockList } = vi.hoisted(() => ({ mockList: vi.fn() }));

vi.mock('./users.service', () => {
  const UserService = vi.fn(function (this: { list: typeof mockList }) {
    this.list = mockList;
  });
  return { UserService };
});

// ---------------------------------------------------------------------------
// Minimal app wired with just the users route
// ---------------------------------------------------------------------------
const buildApp = () => {
  const app = express();

  app.use(express.json());
  app.get('/api/users', listUsers);

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
