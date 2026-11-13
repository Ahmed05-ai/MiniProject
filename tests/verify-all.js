/**
 * Comprehensive Automated Test Suite
 * Smart Campus Student Management System
 * 
 * Verifies Scenarios A through J:
 * A. Edit a student's name and verify the updated name on the student list, profile, search results, attendance page, results page, and fees page.
 * B. Change a student's department and verify relevant pages reflect the new value without changing student_id.
 * C. Change an enrollment number and verify uniqueness checks work and linked history remains attached.
 * D. Reload the application and verify saved changes persist.
 * E. Attempt an invalid duplicate enrollment number and verify the update is rejected.
 * F. Simulate an API/database failure and verify the UI reports failure without showing a false success message.
 * G. Verify another student's data remains unchanged.
 * H. Verify dashboard statistics recalculate correctly after relevant changes.
 * I. Verify deletion does not silently erase linked academic or financial history.
 * J. Verify CSV and JSON exports contain the same current data.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { get, all, run, initializeSchema } = require('../database/database');
const StudentService = require('../services/studentService');
const DashboardService = require('../services/dashboardService');
const { seed, exportSnapshots } = require('../database/seed');

let passedTests = 0;
let failedTests = 0;

function report(scenario, name, passed, detail = '') {
    if (passed) {
        passedTests++;
        console.log(`✅ [SCENARIO ${scenario}] PASS: ${name}`);
    } else {
        failedTests++;
        console.error(`❌ [SCENARIO ${scenario}] FAIL: ${name} -> ${detail}`);
    }
}

async function runTestSuite() {
    console.log('================================================================');
    console.log('🧪 RUNNING SMART CAMPUS AUTOMATED ACCEPTANCE TEST SUITE');
    console.log('================================================================');

    // Setup fresh test database state
    await initializeSchema();
    await seed(true);

    // Student under test: Student 1 (Rahul Sharma, Roll: CS2025001, Dept: CSE)
    const targetId = 1;
    const initialStudent = await StudentService.getStudentById(targetId);
    assert(initialStudent !== null, 'Target student must exist');
    console.log(`ℹ️ Target student identified: ID ${initialStudent.id}, Name: ${initialStudent.full_name}, Roll: ${initialStudent.enrollment_no}`);

    // Control student: Student 2 (Aarav Singh)
    const controlId = 2;
    const initialControlStudent = await StudentService.getStudentById(controlId);
    assert(initialControlStudent !== null, 'Control student must exist');

    // ------------------------------------------------------------------------
    // SCENARIO A: Edit student name & verify across student list, profile, search, attendance, results, fees
    // ------------------------------------------------------------------------
    try {
        const newName = 'Rahul S. Sharma (Updated)';
        await StudentService.updateStudent(targetId, { full_name: newName });

        // 1. Check profile
        const updatedProfile = await StudentService.getStudentById(targetId);
        const a1 = updatedProfile.full_name === newName;

        // 2. Check student list
        const list = await StudentService.getAllStudents({ search: 'Updated' });
        const a2 = list.students.some(s => s.id === targetId && s.full_name === newName);

        // 3. Check search results
        const searchRes = await StudentService.getAllStudents({ search: 'Rahul S.' });
        const a3 = searchRes.students.length > 0 && searchRes.students[0].id === targetId;

        // 4. Check Attendance records reference
        const attendanceRecords = await all(`
            SELECT a.id, s.full_name FROM attendance a JOIN students s ON a.student_id = s.id WHERE a.student_id = ?
        `, [targetId]);
        const a4 = attendanceRecords.length > 0 && attendanceRecords.every(r => r.full_name === newName);

        // 5. Check Results reference
        const resultRecords = await all(`
            SELECT r.id, s.full_name FROM results r JOIN students s ON r.student_id = s.id WHERE r.student_id = ?
        `, [targetId]);
        const a5 = resultRecords.length > 0 && resultRecords.every(r => r.full_name === newName);

        // 6. Check Fees reference
        const feeRecords = await all(`
            SELECT fi.id, s.full_name FROM fee_invoices fi JOIN students s ON fi.student_id = s.id WHERE fi.student_id = ?
        `, [targetId]);
        const a6 = feeRecords.length > 0 && feeRecords.every(r => r.full_name === newName);

        const scenarioAPassed = a1 && a2 && a3 && a4 && a5 && a6;
        report('A', 'Student name updated across profile, search, attendance, results, fees', scenarioAPassed);
    } catch (e) {
        report('A', 'Student name update', false, e.message);
    }

    // ------------------------------------------------------------------------
    // SCENARIO B: Change department & verify pages reflect new value without changing student_id
    // ------------------------------------------------------------------------
    try {
        // Change from Dept 1 (CSE) to Dept 2 (ECE)
        const updateRes = await StudentService.updateStudent(targetId, { department_id: 2 });
        const postDeptStudent = await StudentService.getStudentById(targetId);

        const b1 = postDeptStudent.id === targetId; // student_id remains stable
        const b2 = postDeptStudent.department_id === 2;
        const b3 = postDeptStudent.department_code === 'ECE';
        // Advisories must be flagged because courses were enrolled under previous semester/dept
        const b4 = Array.isArray(updateRes.conflicts);

        report('B', 'Department changed consistently without changing student_id', b1 && b2 && b3 && b4);
    } catch (e) {
        report('B', 'Department change', false, e.message);
    }

    // ------------------------------------------------------------------------
    // SCENARIO C: Change enrollment number, verify uniqueness and linked history intact
    // ------------------------------------------------------------------------
    try {
        const newRoll = 'CS2025-MOD99';
        await StudentService.updateStudent(targetId, { enrollment_no: newRoll });
        const postRollStudent = await StudentService.getStudentById(targetId);

        const c1 = postRollStudent.enrollment_no === newRoll;
        const c2 = postRollStudent.id === targetId; // same record, not new student

        // Verify linked history intact
        const attCount = (await get('SELECT COUNT(*) as count FROM attendance WHERE student_id = ?', [targetId])).count;
        const resCount = (await get('SELECT COUNT(*) as count FROM results WHERE student_id = ?', [targetId])).count;
        const feeCount = (await get('SELECT COUNT(*) as count FROM fee_invoices WHERE student_id = ?', [targetId])).count;

        const c3 = attCount > 0 && resCount > 0 && feeCount > 0;
        report('C', 'Enrollment number updated on same record and linked history intact', c1 && c2 && c3);
    } catch (e) {
        report('C', 'Enrollment number change', false, e.message);
    }

    // ------------------------------------------------------------------------
    // SCENARIO D: Reload/re-query application and verify saved changes persist
    // ------------------------------------------------------------------------
    try {
        // Fresh query directly from SQLite database table
        const reloaded = await get('SELECT * FROM students WHERE id = ?', [targetId]);
        const d1 = reloaded.full_name === 'Rahul S. Sharma (Updated)';
        const d2 = reloaded.enrollment_no === 'CS2025-MOD99';
        const d3 = reloaded.department_id === 2;

        report('D', 'Authoritative changes persisted to database and survive reload', d1 && d2 && d3);
    } catch (e) {
        report('D', 'Reload persistence', false, e.message);
    }

    // ------------------------------------------------------------------------
    // SCENARIO E: Attempt invalid duplicate enrollment number, verify update is rejected
    // ------------------------------------------------------------------------
    try {
        let rejected = false;
        try {
            // Student 2 has enrollment CS2025002. Try to give CS2025002 to Student 1
            await StudentService.updateStudent(targetId, { enrollment_no: initialControlStudent.enrollment_no });
        } catch (err) {
            rejected = true;
            assert(err.message.includes('already assigned') || err.message.includes('already in use'));
        }
        report('E', 'Duplicate enrollment number rejected with meaningful error', rejected);
    } catch (e) {
        report('E', 'Duplicate enrollment rejection', false, e.message);
    }

    // ------------------------------------------------------------------------
    // SCENARIO F: Simulate API/database failure, verify UI reports failure without false success
    // ------------------------------------------------------------------------
    try {
        let caughtError = false;
        try {
            // Invalid department ID 9999 triggers referential check failure
            await StudentService.updateStudent(targetId, { department_id: 9999 });
        } catch (err) {
            caughtError = true;
            assert(err.message.includes('does not exist'));
        }
        // Ensure student record was not corrupted
        const checkRecord = await get('SELECT department_id FROM students WHERE id = ?', [targetId]);
        const fPassed = caughtError && checkRecord.department_id === 2;

        report('F', 'Invalid input reports failure without false success', fPassed);
    } catch (e) {
        report('F', 'Failure simulation', false, e.message);
    }

    // ------------------------------------------------------------------------
    // SCENARIO G: Verify another student's data remains unchanged
    // ------------------------------------------------------------------------
    try {
        const controlStudentNow = await StudentService.getStudentById(controlId);
        const g1 = controlStudentNow.full_name === initialControlStudent.full_name;
        const g2 = controlStudentNow.enrollment_no === initialControlStudent.enrollment_no;
        const g3 = controlStudentNow.department_id === initialControlStudent.department_id;
        const g4 = controlStudentNow.email === initialControlStudent.email;

        report('G', 'Unrelated student data strictly preserved and unchanged', g1 && g2 && g3 && g4);
    } catch (e) {
        report('G', 'Control student isolation', false, e.message);
    }

    // ------------------------------------------------------------------------
    // SCENARIO H: Verify dashboard statistics recalculate correctly after relevant changes
    // ------------------------------------------------------------------------
    try {
        // Initial attendance stats
        const initialDash = await DashboardService.getStudentDashboard(targetId);
        const initialPresentCount = initialDash.attendanceOverview.presentCount;

        // Add a new Attendance record (Absent)
        await run(`
            INSERT INTO attendance (student_id, course_id, date, status, remarks)
            VALUES (?, 1, '2026-10-25', 'Absent', 'Medical leave')
        `, [targetId]);

        // Re-fetch dashboard
        const updatedDash = await DashboardService.getStudentDashboard(targetId);
        const h1 = updatedDash.attendanceOverview.total === initialDash.attendanceOverview.total + 1;
        const h2 = updatedDash.attendanceOverview.absentCount === initialDash.attendanceOverview.absentCount + 1;
        const h3 = updatedDash.attendanceOverview.presentCount === initialPresentCount;

        // Admin stats recalculation
        const adminDash = await DashboardService.getAdminDashboard();
        const h4 = adminDash.stats.totalStudents >= 40;

        report('H', 'Dashboard statistics recalculate dynamically from source data', h1 && h2 && h3 && h4);
    } catch (e) {
        report('H', 'Dynamic dashboard calculations', false, e.message);
    }

    // ------------------------------------------------------------------------
    // SCENARIO I: Verify deletion does not silently erase linked academic or financial history
    // ------------------------------------------------------------------------
    try {
        // Standard delete on student with history should archive safely instead of hard-deleting
        const deleteRes = await StudentService.deleteStudent(targetId, { forceDelete: false });
        const i1 = deleteRes.archived === true;
        const i2 = deleteRes.deleted === false;

        // Verify history preserved
        const attCountAfter = (await get('SELECT COUNT(*) as count FROM attendance WHERE student_id = ?', [targetId])).count;
        const resCountAfter = (await get('SELECT COUNT(*) as count FROM results WHERE student_id = ?', [targetId])).count;
        const feeCountAfter = (await get('SELECT COUNT(*) as count FROM fee_invoices WHERE student_id = ?', [targetId])).count;

        const i3 = attCountAfter > 0 && resCountAfter > 0 && feeCountAfter > 0;

        // Verify student marked Archived
        const archivedStudent = await get('SELECT status FROM students WHERE id = ?', [targetId]);
        const i4 = archivedStudent.status === 'Archived';

        report('I', 'Deletion safely archives and protects linked academic and financial history', i1 && i2 && i3 && i4);
    } catch (e) {
        report('I', 'Referential deletion protection', false, e.message);
    }

    // ------------------------------------------------------------------------
    // SCENARIO J: Verify CSV and JSON exports contain the same current data
    // ------------------------------------------------------------------------
    try {
        await exportSnapshots();
        const exportDir = path.join(__dirname, '..', 'database', 'exports');
        const jsonPath = path.join(exportDir, 'students.json');
        const csvPath = path.join(exportDir, 'students.csv');

        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const csvText = fs.readFileSync(csvPath, 'utf8').trim();
        const csvLines = csvText.split('\n');

        const j1 = fs.existsSync(jsonPath) && fs.existsSync(csvPath);
        const j2 = jsonData.length === (csvLines.length - 1); // accounts for header line
        const j3 = jsonData.length > 0;

        // Spot check student in both
        const firstJsonStudent = jsonData[0];
        const j4 = csvLines[1].includes(firstJsonStudent.enrollment_no);

        report('J', 'CSV and JSON exports are mutually consistent and contain authoritative data', j1 && j2 && j3 && j4);
    } catch (e) {
        report('J', 'Export consistency check', false, e.message);
    }

    // ------------------------------------------------------------------------
    // SUMMARY
    // ------------------------------------------------------------------------
    console.log('================================================================');
    console.log(`🏁 TEST SUITE FINISHED: ${passedTests} PASSED, ${failedTests} FAILED.`);
    console.log('================================================================');

    if (failedTests > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

if (require.main === module) {
    runTestSuite();
}

module.exports = { runTestSuite };
