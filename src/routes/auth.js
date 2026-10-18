const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_BYTES = 72;
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('not-a-real-password', config.bcryptRounds);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ error: 'email is not valid' });
    }
    if (password.length < 8 || Buffer.byteLength(password) > MAX_PASSWORD_BYTES) {
      return res
        .status(400)
        .json({ error: 'password must be at least 8 characters and at most 72 bytes long' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

    let result;
    try {
      result = db
        .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
        .run(normalizedEmail, passwordHash);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }
      throw err;
    }

    res.status(201).json({ id: result.lastInsertRowid, email: normalizedEmail });
  }),
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
    const passwordMatches = await bcrypt.compare(
      password,
      user ? user.password_hash : DUMMY_PASSWORD_HASH,
    );

    if (!user || !passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    res.json({ token, expiresIn: config.jwtExpiresIn });
  }),
);

module.exports = router;
