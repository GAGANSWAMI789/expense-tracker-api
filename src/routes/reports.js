const express = require('express');
const requireAuth = require('../middleware/auth');
const validate = require('../middleware/validate');
const reportService = require('../services/reportService');
const { monthlyReportQuerySchema, yearlyReportQuerySchema } = require('../schemas/report');

const router = express.Router();

router.use(requireAuth);

router.get('/monthly', validate(monthlyReportQuerySchema, 'query'), (req, res) => {
  res.json(reportService.getMonthlySummary(req.user.id, req.query.month));
});

router.get('/yearly', validate(yearlyReportQuerySchema, 'query'), (req, res) => {
  res.json(reportService.getYearlySummary(req.user.id, req.query.year));
});

module.exports = router;
