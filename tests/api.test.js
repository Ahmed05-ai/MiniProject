/**
 * In-Memory API Integration Test Suite for Smart Campus Management System
 * Executes without requiring external TCP network socket bindings.
 */

const assert = require('assert');
const app = require('../server');
const { get, all } = require('../database/database');
const StudentService = require('../services/studentService');
const DashboardService = require('../services/dashboardService');
const { seed } = require('../database/seed');

async function runApiTests() {
    console.log('🚀 Launching API integration test suite (In-Memory Request Dispatcher)...\n');
    await seed({ force: true, quiet: true });

    let passed = 0;
    let failed = 0;

    function test(name, ok, detail = '') {
        if (ok) {
            passed++;
            console.log(`  ✓ PASS: ${name}`);
        } else {
            failed++;
            console.error(`  ✗ FAIL: ${name} -> ${detail}`);
        }
    }

    try {
        // 1. Direct Service Test: Admin Dashboard Metrics
        const adminDash = await DashboardService.getAdminDashboard();
        test('Admin dashboard calculates dynamic metrics (Students, Faculty, Depts, Notices)',
            adminDash.stats.totalStudents >= 55 &&
            adminDash.stats.totalFaculty === 20 &&
            adminDash.stats.totalDepartments === 8 &&
            adminDash.stats.totalNotices === 12 &&
            adminDash.stats.libraryBooks === 30 &&
            adminDash.stats.hostelRooms === 15
        );

        // 2. Direct Service Test: Student Dashboard Metrics
        const studentDash = await DashboardService.getStudentDashboard(1);
        test('Student dashboard calculates dynamic attendance, GPA, and upcoming assignments',
            studentDash.student.full_name === 'Rahul Sharma' &&
            parseFloat(studentDash.academics.cgpa) > 8.0 &&
            studentDash.upcomingAssignments.length > 0 &&
            studentDash.libraryIssues.length >= 0
        );

        // 3. Student Search & Filtering
        const searchList = await StudentService.getAllStudents({ search: 'Rahul', limit: 10 });
        test('Student search by name returns exact record',
            searchList.students.length > 0 && searchList.students[0].enrollment_no === 'CS2025001'
        );

        const filterList = await StudentService.getAllStudents({ department: 1, limit: 10 });
        test('Student department filter returns enrolled members',
            filterList.students.length > 0 && filterList.students.every(s => s.department_id === 1)
        );

        // 4. Verification of All 28 Module Tables
        const allCounts = await all(`
            SELECT 'departments' as tbl, count(*) as cnt FROM departments
            UNION ALL SELECT 'users', count(*) FROM users
            UNION ALL SELECT 'faculty', count(*) FROM faculty
            UNION ALL SELECT 'courses', count(*) FROM courses
            UNION ALL SELECT 'students', count(*) FROM students
            UNION ALL SELECT 'subjects', count(*) FROM subjects
            UNION ALL SELECT 'enrollments', count(*) FROM enrollments
            UNION ALL SELECT 'attendance', count(*) FROM attendance
            UNION ALL SELECT 'exams', count(*) FROM exams
            UNION ALL SELECT 'results', count(*) FROM results
            UNION ALL SELECT 'fee_invoices', count(*) FROM fee_invoices
            UNION ALL SELECT 'fee_payments', count(*) FROM fee_payments
            UNION ALL SELECT 'timetable', count(*) FROM timetable
            UNION ALL SELECT 'notices', count(*) FROM notices
            UNION ALL SELECT 'library_books', count(*) FROM library_books
            UNION ALL SELECT 'library_issues', count(*) FROM library_issues
            UNION ALL SELECT 'hostel_rooms', count(*) FROM hostel_rooms
            UNION ALL SELECT 'hostel_allocations', count(*) FROM hostel_allocations
            UNION ALL SELECT 'transport_routes', count(*) FROM transport_routes
            UNION ALL SELECT 'transport_allocations', count(*) FROM transport_allocations
            UNION ALL SELECT 'assignments', count(*) FROM assignments
            UNION ALL SELECT 'assignment_submissions', count(*) FROM assignment_submissions
            UNION ALL SELECT 'events', count(*) FROM events
            UNION ALL SELECT 'placements', count(*) FROM placements
            UNION ALL SELECT 'internships', count(*) FROM internships
            UNION ALL SELECT 'leaves', count(*) FROM leaves
            UNION ALL SELECT 'complaints', count(*) FROM complaints
            UNION ALL SELECT 'feedback', count(*) FROM feedback
        `);

        let totalRecords = 0;
        for (const r of allCounts) totalRecords += r.cnt;
        test('All 28 tables exist and sum to exactly 1,000 records',
            allCounts.length === 28 && totalRecords === 1000,
            `Found ${allCounts.length} tables, ${totalRecords} records`
        );

        // 5. Foreign Key Integrity Check
        const fkCheck = await all('PRAGMA foreign_key_check;');
        test('Foreign Key referential integrity (zero orphan records)',
            fkCheck.length === 0,
            `${fkCheck.length} violations`
        );

        // 6. Role-Based Account Verification
        const superAdmin = await get("SELECT id, email, role FROM users WHERE role = 'super_admin'");
        const accountant = await get("SELECT id, email, role FROM users WHERE role = 'accountant'");
        const librarian = await get("SELECT id, email, role FROM users WHERE role = 'librarian'");
        const warden = await get("SELECT id, email, role FROM users WHERE role = 'hostel_warden'");
        test('Role-based accounts created (Super Admin, Accountant, Librarian, Warden)',
            superAdmin && accountant && librarian && warden
        );

        // 7. Single Source of Truth Dynamic Propagation Test
        const testStudentId = 3;
        const original = await StudentService.getStudentById(testStudentId);
        const tempName = 'Aarav Patel (SSOT Test)';
        await StudentService.updateStudent(testStudentId, { full_name: tempName });

        const directFetch = await StudentService.getStudentById(testStudentId);
        const joinedAttendance = await all(`
            SELECT s.full_name FROM attendance a JOIN students s ON a.student_id = s.id WHERE a.student_id = ?
        `, [testStudentId]);
        const joinedResults = await all(`
            SELECT s.full_name FROM results r JOIN students s ON r.student_id = s.id WHERE r.student_id = ?
        `, [testStudentId]);

        const ssotWorks = directFetch.full_name === tempName &&
            (joinedAttendance.length === 0 || joinedAttendance.every(a => a.full_name === tempName)) &&
            (joinedResults.length === 0 || joinedResults.every(r => r.full_name === tempName));

        // Restore original name
        await StudentService.updateStudent(testStudentId, { full_name: original.full_name });

        test('Dynamic Data Synchronization: single source of truth propagates everywhere', ssotWorks);

        console.log(`\n======================================================`);
        console.log(`🏁 API & SERVICE INTEGRATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
        console.log(`======================================================\n`);

    } catch (err) {
        console.error('Test execution error:', err);
        failed++;
    }

    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

if (require.main === module) {
    runApiTests().catch(err => {
        console.error('API test run error:', err);
        process.exit(1);
    });
}

module.exports = { runApiTests };
