const { z } = require('zod');

const email = z.string().trim().toLowerCase().max(254).email('email is not valid');

const registerSchema = z.object({
  email,
  password: z
    .string()
    .min(8, 'password must be at least 8 characters long')
    .refine((value) => Buffer.byteLength(value) <= 72, 'password must be at most 72 bytes long'),
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, 'password is required'),
});

module.exports = { registerSchema, loginSchema };
