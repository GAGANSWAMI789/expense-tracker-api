const request = require('supertest');
const app = require('../src/app');

async function createUser(email, password = 'password123') {
  const registered = await request(app).post('/auth/register').send({ email, password });
  if (![201, 409].includes(registered.status)) {
    throw new Error(`Registering ${email} failed with status ${registered.status}`);
  }

  const res = await request(app).post('/auth/login').send({ email, password });
  if (res.status !== 200) {
    throw new Error(`Logging in as ${email} failed with status ${res.status}`);
  }

  return res.body.token;
}

function bearer(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = { createUser, bearer };
