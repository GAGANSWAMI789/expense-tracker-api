const { z } = require('zod');

const MAX_PASSWORD_BYTES = 72;

const email = z.string().trim().toLowerCase().max(254).email('email is not valid');

const withinBcryptLimit = (value) => Buffer.byteLength(value) <= MAX_PASSWORD_BYTES;

const registerSchema = z.object({
  email,
  password: z
    .string()
    .min(8, 'password must be at least 8 characters long')
    .refine(withinBcryptLimit, `password must be at most ${MAX_PASSWORD_BYTES} bytes long`),
});

const loginSchema = z.object({
  email,
  password: z
    .string()
    .min(1, 'password is required')
    .refine(withinBcryptLimit, `password must be at most ${MAX_PASSWORD_BYTES} bytes long`),
});

module.exports = { registerSchema, loginSchema };
