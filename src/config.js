if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set. Copy .env.example to .env and set a long random value.');
}

const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: /^\d+$/.test(expiresIn) ? Number(expiresIn) : expiresIn,
  bcryptRounds: 10,
};
