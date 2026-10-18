const request = require('supertest');
const app = require('../src/app');
const { createUser, bearer } = require('./helpers');

async function addExpenses(token, expenses) {
  for (const expense of expenses) {
    await request(app).post('/expenses').set(bearer(token)).send(expense);
  }
}

describe('reports', () => {
  let token;
  let otherToken;

  beforeAll(async () => {
    token = await createUser('tara@example.com');
    otherToken = await createUser('arjun@example.com');

    await addExpenses(token, [
      { title: 'Rent', amount: 15000, category: 'housing', spentOn: '2026-03-01' },
      { title: 'Groceries', amount: 2400, category: 'food', spentOn: '2026-03-04' },
      { title: 'Dinner out', amount: 1100, category: 'food', spentOn: '2026-03-12' },
      { title: 'Metro card', amount: 500, category: 'travel', spentOn: '2026-03-15' },
      { title: 'Groceries', amount: 2100, category: 'food', spentOn: '2026-04-06' },
      { title: 'Flight', amount: 6200, category: 'travel', spentOn: '2026-07-19' },
    ]);

    await addExpenses(otherToken, [
      { title: 'Laptop', amount: 85000, category: 'electronics', spentOn: '2026-03-10' },
    ]);
  });

  describe('GET /reports/monthly', () => {
    it('requires authentication', async () => {
      const res = await request(app).get('/reports/monthly');
      expect(res.status).toBe(401);
    });

    it('groups spending by category for the month', async () => {
      const res = await request(app).get('/reports/monthly?month=2026-03').set(bearer(token));

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ month: '2026-03', total: 19000, count: 4 });
      expect(res.body.breakdown).toEqual([
        { category: 'housing', count: 1, total: 15000 },
        { category: 'food', count: 2, total: 3500 },
        { category: 'travel', count: 1, total: 500 },
      ]);
    });

    it('excludes expenses from other users', async () => {
      const res = await request(app).get('/reports/monthly?month=2026-03').set(bearer(token));
      expect(res.status).toBe(200);
    });

    it('returns an empty summary for a month without expenses', async () => {
      const res = await request(app).get('/reports/monthly?month=2026-01').set(bearer(token));

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ month: '2026-01', total: 0, count: 0, breakdown: [] });
    });

    it.each(['2026-13', '2026-3', 'march'])('rejects month=%s', async (month) => {
      const res = await request(app).get(`/reports/monthly?month=${month}`).set(bearer(token));
      expect(res.status).toBe(400);
    });
  });

  describe('GET /reports/yearly', () => {
    it('returns a total for every month of the year', async () => {
      const res = await request(app).get('/reports/yearly?year=2026').set(bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(27300);
      expect(res.body.months).toHaveLength(12);
      expect(res.body.months[2]).toEqual({ month: '2026-03', total: 19000, count: 4 });
      expect(res.body.months[4]).toEqual({ month: '2026-05', total: 0, count: 0 });
    });

    it('rejects an out of range year', async () => {
      const res = await request(app).get('/reports/yearly?year=1800').set(bearer(token));
      expect(res.status).toBe(400);
    });
  });
});
