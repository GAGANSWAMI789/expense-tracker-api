if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set. Copy .env.example to .env and set a long random value.');
}

module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: 10,
};
