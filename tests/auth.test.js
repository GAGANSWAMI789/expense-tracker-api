const request = require('supertest');
const app = require('../src/app');

const register = (body) => request(app).post('/auth/register').send(body);
const login = (body) => request(app).post('/auth/login').send(body);

describe('auth', () => {
  beforeAll(async () => {
    await register({ email: 'existing@example.com', password: 'password123' });
  });

  describe('register', () => {
    it('creates an account with a normalized email', async () => {
      const res = await register({ email: 'Asha@Example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('asha@example.com');
      expect(res.body).not.toHaveProperty('password_hash');
    });

    it('rejects a duplicate email', async () => {
      const res = await register({ email: 'Existing@example.com', password: 'password123' });
      expect(res.status).toBe(409);
    });

    it('returns 409 for concurrent registrations of the same email', async () => {
      const body = { email: 'race@example.com', password: 'password123' };
      const statuses = (await Promise.all([register(body), register(body)])).map((res) => res.status);

      expect(statuses.sort()).toEqual([201, 409]);
    });

    it('rejects a short password', async () => {
      const res = await register({ email: 'ravi@example.com', password: 'short' });
      expect(res.status).toBe(400);
    });

    it('rejects a password longer than 72 bytes', async () => {
      const res = await register({ email: 'long@example.com', password: 'a'.repeat(73) });
      expect(res.status).toBe(400);
    });

    it('rejects an overly long email without hanging', async () => {
      const res = await register({ email: `a@${'.'.repeat(50000)} `, password: 'password123' });
      expect(res.status).toBe(400);
    });

    it.each([
      [{ email: 1, password: 'password123' }],
      [{ email: ['a@b.co'], password: 'password123' }],
      [{ email: 'num@example.com', password: 12345678 }],
    ])('rejects non-string input %j', async (body) => {
      const res = await register(body);
      expect(res.status).toBe(400);
    });
  });

  describe('login', () => {
    it('returns a token for valid credentials', async () => {
      const res = await login({ email: 'existing@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(typeof res.body.token).toBe('string');
    });

    it('rejects a wrong password', async () => {
      const res = await login({ email: 'existing@example.com', password: 'wrong-password' });

      expect(res.status).toBe(401);
      expect(res.body).not.toHaveProperty('token');
    });

    it('rejects an unknown email', async () => {
      const res = await login({ email: 'nobody@example.com', password: 'password123' });
      expect(res.status).toBe(401);
    });

    it('rejects non-string input', async () => {
      const res = await login({ email: 1, password: 'password123' });
      expect(res.status).toBe(400);
    });

    it('rejects a password longer than 72 bytes before hashing', async () => {
      const res = await login({ email: 'existing@example.com', password: 'a'.repeat(50000) });
      expect(res.status).toBe(400);
    });

    it('returns 400 for malformed JSON', async () => {
      const res = await request(app)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"email":');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Request body is not valid JSON');
    });
  });
});
