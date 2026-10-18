const request = require('supertest');
const app = require('../src/app');
const { createUser, bearer } = require('./helpers');

describe('expenses', () => {
  let token;
  let otherToken;

  beforeAll(async () => {
    token = await createUser('meera@example.com');
    otherToken = await createUser('kabir@example.com');
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/expenses');
    expect(res.status).toBe(401);
  });

  it('rejects an invalid token', async () => {
    const res = await request(app).get('/expenses').set(bearer('not-a-real-token'));
    expect(res.status).toBe(401);
  });

  it('creates an expense', async () => {
    const res = await request(app)
      .post('/expenses')
      .set(bearer(token))
      .send({ title: 'Groceries', amount: 450, category: 'food', spentOn: '2026-10-01' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Groceries', amount: 450, category: 'food' });
  });

  it('rejects an expense without a title', async () => {
    const res = await request(app).post('/expenses').set(bearer(token)).send({ amount: 100 });
    expect(res.status).toBe(400);
  });

  it('only lists expenses that belong to the user', async () => {
    await request(app)
      .post('/expenses')
      .set(bearer(otherToken))
      .send({ title: 'Movie tickets', amount: 600, category: 'entertainment' });

    const res = await request(app).get('/expenses').set(bearer(token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Groceries');
  });

  it("does not return another user's expense", async () => {
    const created = await request(app)
      .post('/expenses')
      .set(bearer(otherToken))
      .send({ title: 'Gym membership', amount: 1500, category: 'health' });

    const res = await request(app).get(`/expenses/${created.body.id}`).set(bearer(token));
    expect(res.status).toBe(404);
  });

  it('deletes an expense', async () => {
    const created = await request(app)
      .post('/expenses')
      .set(bearer(token))
      .send({ title: 'Taxi', amount: 220, category: 'travel' });

    const res = await request(app).delete(`/expenses/${created.body.id}`).set(bearer(token));
    expect(res.status).toBe(204);

    const lookup = await request(app).get(`/expenses/${created.body.id}`).set(bearer(token));
    expect(lookup.status).toBe(404);
  });
});
