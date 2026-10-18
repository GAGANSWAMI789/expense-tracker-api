const request = require('supertest');
const app = require('../src/app');
const { createUser, bearer } = require('./helpers');

describe('validation and errors', () => {
  let token;

  beforeAll(async () => {
    token = await createUser('nisha@example.com');
  });

  it.each([
    [{ amount: 100 }, 'title'],
    [{ title: 'Coffee', amount: -20 }, 'amount'],
    [{ title: 'Coffee', amount: '20' }, 'amount'],
    [{ title: 'Coffee', amount: 20, spentOn: '18-10-2026' }, 'spentOn'],
    [{ title: 'Coffee', amount: 20, spentOn: '2026-13-45' }, 'spentOn'],
    [{ title: 'Coffee', amount: 20, spentOn: '2026-02-31' }, 'spentOn'],
  ])('rejects %j', async (body, field) => {
    const res = await request(app).post('/expenses').set(bearer(token)).send(body);

    expect(res.status).toBe(400);
    expect(res.body.details.map((detail) => detail.field)).toContain(field);
  });

  it('rejects malformed JSON', async () => {
    const res = await request(app)
      .post('/expenses')
      .set(bearer(token))
      .set('Content-Type', 'application/json')
      .send('{"title": "Coffee",');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Request body is not valid JSON');
  });

  it('lists each missing field when there is no JSON body', async () => {
    const res = await request(app).post('/expenses').set(bearer(token));

    expect(res.status).toBe(400);
    expect(res.body.details.map((detail) => detail.field)).toEqual(
      expect.arrayContaining(['title', 'amount']),
    );
  });

  it('rejects an invalid email on register', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
  });
});
