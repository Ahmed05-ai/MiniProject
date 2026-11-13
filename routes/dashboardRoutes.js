/**
 * Dashboard Express Router
 */

const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');

router.get('/student/:id', DashboardController.getStudentDashboard);
router.get('/admin', DashboardController.getAdminDashboard);

module.exports = router;
