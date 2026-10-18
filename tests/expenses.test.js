const request = require('supertest');
const app = require('../src/app');

describe('expenses', () => {
  it('creates an expense', async () => {
    const res = await request(app)
      .post('/expenses')
      .send({ title: 'Groceries', amount: 450, category: 'food', spentOn: '2026-10-01' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Groceries', amount: 450, category: 'food' });
  });

  it('rejects an expense without a title', async () => {
    const res = await request(app).post('/expenses').send({ amount: 100 });
    expect(res.status).toBe(400);
  });

  it('lists expenses', async () => {
    const res = await request(app).get('/expenses');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('returns 404 for a missing expense', async () => {
    const res = await request(app).get('/expenses/9999');
    expect(res.status).toBe(404);
  });

  it('deletes an expense', async () => {
    const created = await request(app)
      .post('/expenses')
      .send({ title: 'Taxi', amount: 220, category: 'travel' });

    const res = await request(app).delete(`/expenses/${created.body.id}`);
    expect(res.status).toBe(204);

    const lookup = await request(app).get(`/expenses/${created.body.id}`);
    expect(lookup.status).toBe(404);
  });
});
