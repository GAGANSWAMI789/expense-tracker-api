const request = require('supertest');
const app = require('../src/app');
const { createUser, bearer } = require('./helpers');

describe('listing expenses', () => {
  let token;

  beforeAll(async () => {
    token = await createUser('dev@example.com');

    const expenses = [
      { title: 'Rent', amount: 15000, category: 'housing', spentOn: '2026-10-01' },
      { title: 'Electricity', amount: 1200, category: 'utilities', spentOn: '2026-10-05' },
      { title: 'Dinner', amount: 800, category: 'food', spentOn: '2026-10-07' },
      { title: 'Breakfast', amount: 150, category: 'food', spentOn: '2026-10-09' },
      { title: 'Internet', amount: 700, category: 'utilities', spentOn: '2026-10-10' },
    ];

    for (const expense of expenses) {
      await request(app).post('/expenses').set(bearer(token)).send(expense);
    }
  });

  it('returns the newest expenses first', async () => {
    const res = await request(app).get('/expenses').set(bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.data[0].title).toBe('Internet');
    expect(res.body.pagination).toEqual({ page: 1, limit: 20, total: 5, totalPages: 1 });
  });

  it('paginates results', async () => {
    const res = await request(app).get('/expenses?page=2&limit=2').set(bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.data.map((expense) => expense.title)).toEqual(['Dinner', 'Electricity']);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('filters by category', async () => {
    const res = await request(app).get('/expenses?category=food').set(bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.every((expense) => expense.category === 'food')).toBe(true);
  });

  it('treats the category filter as a value, not as SQL', async () => {
    const category = encodeURIComponent("x' or '1'='1");
    const res = await request(app).get(`/expenses?category=${category}`).set(bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });

  it('rejects a limit above 100', async () => {
    const res = await request(app).get('/expenses?limit=500').set(bearer(token));
    expect(res.status).toBe(400);
  });
});
