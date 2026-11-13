/**
 * Smart Campus ERP - Attendance Routes
 * Provides comprehensive ERP endpoints for:
 * - Summary & Dashboard KPIs
 * - Multi-year & Month calendar retrieval
 * - Faculty attendance marking
 * - Vacations & holidays catalog
 * - Admin vacation declarations
 */

const express = require('express');
const router = express.Router();
const { AttendanceController } = require('../controllers/attendanceController');

// 1. Attendance Summary & Dashboard Analytics
router.get('/summary', AttendanceController.getAttendanceSummary);

// 2. Mark / Update Attendance (Faculty & Admin Control)
router.post('/mark', AttendanceController.markAttendance);

// 3. Vacations & Holidays Catalog
router.get('/vacations', AttendanceController.getVacations);

// 4. Admin Declaration of Vacation / Holiday
router.post('/vacation', AttendanceController.declareVacation);

module.exports = router;
