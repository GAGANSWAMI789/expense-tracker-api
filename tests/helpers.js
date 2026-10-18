const request = require('supertest');
const app = require('../src/app');

async function createUser(email, password = 'password123') {
  await request(app).post('/auth/register').send({ email, password });
  const res = await request(app).post('/auth/login').send({ email, password });
  return res.body.token;
}

function bearer(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = { createUser, bearer };
