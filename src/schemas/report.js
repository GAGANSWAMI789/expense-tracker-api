const { z } = require('zod');

const currentMonth = () => new Date().toISOString().slice(0, 7);
const currentYear = () => new Date().getFullYear();

const monthlyReportQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must use the YYYY-MM format')
    .default(currentMonth),
});

const yearlyReportQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).default(currentYear),
});

module.exports = { monthlyReportQuerySchema, yearlyReportQuerySchema };
