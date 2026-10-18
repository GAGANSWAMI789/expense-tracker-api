const request = require('supertest');
const app = require('../src/app');

describe('auth', () => {
  it('registers a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'Asha@Example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('asha@example.com');
    expect(res.body).not.toHaveProperty('password_hash');
  });

  it('rejects a duplicate email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'asha@example.com', password: 'password123' });

    expect(res.status).toBe(409);
  });

  it('rejects a short password', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'ravi@example.com', password: 'short' });

    expect(res.status).toBe(400);
  });

  it('logs in and returns a token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'asha@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
  });

  it('rejects login for an unknown email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(res.status).toBe(401);
  });
});
