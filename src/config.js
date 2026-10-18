module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'expense-tracker-dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: 10,
};
