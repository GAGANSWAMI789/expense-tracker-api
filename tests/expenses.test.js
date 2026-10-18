const request = require('supertest');
const jwt = require('jsonwebtoken');
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

  it('rejects a token signed with a different secret', async () => {
    const forged = jwt.sign({ sub: 1, email: 'meera@example.com' }, 'some-other-secret');
    const res = await request(app).get('/expenses').set(bearer(forged));
    expect(res.status).toBe(401);
  });

  it('rejects an expired token', async () => {
    const expired = jwt.sign({ sub: 1, email: 'meera@example.com' }, process.env.JWT_SECRET, {
      expiresIn: -1,
    });
    const res = await request(app).get('/expenses').set(bearer(expired));
    expect(res.status).toBe(401);
  });

  it('accepts a lowercase bearer scheme', async () => {
    const res = await request(app).get('/expenses').set({ Authorization: `bearer ${token}` });
    expect(res.status).toBe(200);
  });

  it('creates an expense', async () => {
    const res = await request(app)
      .post('/expenses')
      .set(bearer(token))
      .send({ title: 'Groceries', amount: 450, category: 'Food', spentOn: '2026-10-01' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: 'Groceries', amount: 450, category: 'food' });
  });

  it('only lists expenses that belong to the user', async () => {
    await request(app)
      .post('/expenses')
      .set(bearer(otherToken))
      .send({ title: 'Movie tickets', amount: 600, category: 'entertainment' });

    const res = await request(app).get('/expenses').set(bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Groceries');
    expect(res.body.pagination.total).toBe(1);
  });

  it("does not return another user's expense", async () => {
    const created = await request(app)
      .post('/expenses')
      .set(bearer(otherToken))
      .send({ title: 'Gym membership', amount: 1500, category: 'health' });

    const res = await request(app).get(`/expenses/${created.body.id}`).set(bearer(token));
    expect(res.status).toBe(404);
  });

  it('updates part of an expense', async () => {
    const created = await request(app)
      .post('/expenses')
      .set(bearer(token))
      .send({ title: 'Lunch', amount: 180, category: 'food', spentOn: '2026-10-03' });

    const res = await request(app)
      .patch(`/expenses/${created.body.id}`)
      .set(bearer(token))
      .send({ amount: 210 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ title: 'Lunch', amount: 210, category: 'food' });
  });

  it('rejects an empty update', async () => {
    const created = await request(app)
      .post('/expenses')
      .set(bearer(token))
      .send({ title: 'Snacks', amount: 60 });

    const res = await request(app).patch(`/expenses/${created.body.id}`).set(bearer(token)).send({});
    expect(res.status).toBe(400);
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

  it("cannot delete another user's expense", async () => {
    const created = await request(app)
      .post('/expenses')
      .set(bearer(otherToken))
      .send({ title: 'Concert', amount: 2500, category: 'entertainment' });

    const res = await request(app).delete(`/expenses/${created.body.id}`).set(bearer(token));
    expect(res.status).toBe(404);

    const lookup = await request(app).get(`/expenses/${created.body.id}`).set(bearer(otherToken));
    expect(lookup.status).toBe(200);
  });
});
