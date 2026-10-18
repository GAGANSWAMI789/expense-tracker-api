const { z } = require('zod');

const email = z.string().trim().toLowerCase().email('email is not valid');

const registerSchema = z.object({
  email,
  password: z.string().min(8, 'password must be at least 8 characters long').max(72),
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, 'password is required'),
});

module.exports = { registerSchema, loginSchema };
