/**
 * Student Express Router
 */

const express = require('express');
const router = express.Router();
const { StudentController } = require('../controllers/studentController');

// Export routes
router.get('/export/csv', StudentController.exportCsv);
router.get('/export/json', StudentController.exportJson);

// General student CRUD
router.get('/', StudentController.getAllStudents);
router.get('/:id', StudentController.getStudentById);
router.post('/', StudentController.createStudent);
router.put('/:id', StudentController.updateStudent);
router.delete('/:id', StudentController.deleteStudent);

// Student sub-resource routes
router.get('/:id/attendance', StudentController.getStudentAttendance);
router.get('/:id/results', StudentController.getStudentResults);
router.get('/:id/fees', StudentController.getStudentFees);

module.exports = router;
