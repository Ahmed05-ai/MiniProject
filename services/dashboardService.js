/**
 * Authoritative Dashboard & Analytics Service Layer
 * Computes all metrics dynamically from stored records rather than hardcoded copies.
 */

const { get, all } = require('../database/database');
const StudentService = require('./studentService');

class DashboardService {
    /**
     * Get dynamic metrics for a Student Dashboard
     */
    static async getStudentDashboard(studentId) {
        const student = await StudentService.getStudentById(studentId);
        if (!student) throw new Error(`Student ${studentId} not found.`);

        // 1. Attendance Metrics (Dynamically computed from attendance table)
        const attendance = await StudentService.getStudentAttendanceStats(studentId);

        // 2. Marks & CGPA Metrics (Dynamically computed from results table)
        const academics = await StudentService.getStudentAcademicSummary(studentId);

        // 3. Dynamic Assignment Metrics from assignments & assignment_submissions tables
        const assignmentCounts = await get(`
            SELECT 
                COUNT(DISTINCT a.id) as totalEnrolledAssignments,
                COUNT(DISTINCT s.id) as completedCount
            FROM assignments a
            JOIN courses c ON a.course_id = c.id
            JOIN students st ON st.id = ?
            LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = ?
            WHERE c.department_id = st.department_id
        `, [studentId, studentId]);

        const totalEnrolled = (assignmentCounts && assignmentCounts.totalEnrolledAssignments) ? assignmentCounts.totalEnrolledAssignments : 3;
        const completed = (assignmentCounts && assignmentCounts.completedCount) ? assignmentCounts.completedCount : 0;
        const pendingAssignments = Math.max(0, totalEnrolled - completed);

        // 4. Dynamic Notices Count
        const noticesCountRow = await get(`SELECT COUNT(*) as count FROM notices`);
        const noticesCount = noticesCountRow ? noticesCountRow.count : 0;

        // 5. Dynamic Upcoming Assignments (Department & Field Specific)
        let upcomingAssignments = await all(`
            SELECT 
                a.id,
                a.title,
                a.description,
                a.due_date,
                c.code as subject,
                c.department_id,
                d.code as department_code,
                CASE WHEN s.id IS NOT NULL THEN 'Completed' ELSE 'Pending' END as status
            FROM assignments a
            JOIN courses c ON a.course_id = c.id
            LEFT JOIN departments d ON c.department_id = d.id
            JOIN students st ON st.id = ?
            LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = ?
            WHERE c.department_id = st.department_id
            ORDER BY a.due_date ASC
            LIMIT 5
        `, [studentId, studentId]);

        if (!upcomingAssignments || upcomingAssignments.length === 0) {
            upcomingAssignments = await all(`
                SELECT a.id, a.title, a.description, a.due_date, c.code as subject, c.department_id, d.code as department_code, 'Pending' as status
                FROM assignments a
                JOIN courses c ON a.course_id = c.id
                LEFT JOIN departments d ON c.department_id = d.id
                JOIN students st ON st.id = ?
                WHERE c.department_id = st.department_id
                ORDER BY a.due_date ASC
                LIMIT 3
            `, [studentId]);
        }

        const getDeptIcon = (code) => {
            if (!code) return 'fa-book-open';
            if (code.startsWith('ME')) return 'fa-gear';
            if (code.startsWith('CE')) return 'fa-compass-drafting';
            if (code.startsWith('EC')) return 'fa-microchip';
            if (code.startsWith('EE')) return 'fa-bolt';
            if (code.startsWith('IT')) return 'fa-network-wired';
            if (code.startsWith('BT')) return 'fa-dna';
            if (code.startsWith('MB')) return 'fa-chart-line';
            return 'fa-code';
        };

        const formattedAssignments = (upcomingAssignments || []).map((a) => ({
            id: a.id,
            title: a.title,
            description: a.description || 'Complete required project documentation & exercises.',
            due_date: a.due_date,
            icon: getDeptIcon(a.subject || a.department_code),
            subject: a.subject || 'SUB',
            status: a.status || 'Pending'
        }));

        // 6. Fee Summary (Dynamically computed from fee_invoices and fee_payments tables)
        const feeSummary = await StudentService.getStudentFeeSummary(studentId);

        // 7. Library issues for this student
        const libraryIssues = await all(`
            SELECT li.id, b.title as book_title, b.author, li.issue_date, li.due_date, li.status, li.fine_amount
            FROM library_issues li
            JOIN library_books b ON li.book_id = b.id
            WHERE li.student_id = ?
            ORDER BY li.id DESC
        `, [studentId]);

        // 8. Hostel allocation for this student
        const hostelAllocation = await get(`
            SELECT ha.id, hr.hostel_name, hr.room_number, hr.floor, hr.room_type, ha.allocation_date, ha.status
            FROM hostel_allocations ha
            JOIN hostel_rooms hr ON ha.room_id = hr.id
            WHERE ha.student_id = ? AND ha.status = 'Active'
        `, [studentId]);

        // 9. Transport allocation for this student
        const transportAllocation = await get(`
            SELECT ta.id, tr.route_number, tr.route_name, tr.bus_number, tr.driver_name, tr.driver_phone, ta.pickup_point, ta.status
            FROM transport_allocations ta
            JOIN transport_routes tr ON ta.route_id = tr.id
            WHERE ta.student_id = ? AND ta.status = 'Active'
        `, [studentId]);

        return {
            student: {
                id: student.id,
                full_name: student.full_name,
                first_name: student.first_name,
                last_name: student.last_name,
                enrollment_no: student.enrollment_no,
                email: student.email,
                phone: student.phone,
                department: student.department_name,
                department_name: student.department_name,
                department_code: student.department_code,
                current_semester: student.current_semester,
                year_level: student.year_level,
                section: student.section,
                dob: student.dob,
                gender: student.gender,
                address: student.address,
                city: student.city,
                state: student.state,
                guardian_name: student.guardian_name,
                guardian_phone: student.guardian_phone,
                profile_image: student.profile_image,
                status: student.status
            },
            stats: {
                attendancePercentage: `${attendance.overallPercentage}%`,
                attendanceSubtitle: 'This Month',
                cgpa: `${academics.cgpa} CGPA`,
                cgpaSubtitle: 'Current Semester',
                assignmentsCount: pendingAssignments,
                assignmentsSubtitle: 'Pending',
                noticesCount: noticesCount,
                noticesSubtitle: 'New'
            },
            attendanceOverview: {
                percentage: attendance.overallPercentage,
                breakdown: attendance.breakdown,
                presentCount: attendance.presentCount,
                absentCount: attendance.absentCount,
                lateCount: attendance.lateCount,
                total: attendance.totalSessions
            },
            academics,
            feeSummary,
            upcomingAssignments: formattedAssignments,
            libraryIssues,
            hostelAllocation,
            transportAllocation
        };
    }

    /**
     * Get dynamic metrics for Admin Dashboard
     */
    static async getAdminDashboard() {
        const studentCountRow = await get(`SELECT COUNT(*) as count FROM students WHERE status != 'Archived'`);
        const activeStudentCountRow = await get(`SELECT COUNT(*) as count FROM students WHERE status = 'Active'`);
        const facultyCountRow = await get(`SELECT COUNT(*) as count FROM faculty`);
        const deptCountRow = await get(`SELECT COUNT(*) as count FROM departments`);
        const noticesCountRow = await get(`SELECT COUNT(*) as count FROM notices`);
        const courseCountRow = await get(`SELECT COUNT(*) as count FROM courses`);
        const subjectCountRow = await get(`SELECT COUNT(*) as count FROM subjects`);

        // Financial Metrics
        const feeSummary = await get(`
            SELECT 
                COALESCE(SUM(amount), 0) as totalInvoiced,
                COALESCE((SELECT SUM(amount_paid) FROM fee_payments), 0) as totalCollected
            FROM fee_invoices
        `);

        const totalInvoiced = feeSummary ? feeSummary.totalInvoiced : 0;
        const totalCollected = feeSummary ? feeSummary.totalCollected : 0;
        const outstandingFees = Math.max(0, totalInvoiced - totalCollected);

        // Library & Campus Facilities Metrics
        const libraryStats = await get(`
            SELECT 
                COUNT(*) as totalBooks,
                COALESCE(SUM(available_copies), 0) as availableCopies,
                (SELECT COUNT(*) FROM library_issues WHERE status = 'Issued') as activeIssues
            FROM library_books
        `);

        const hostelStats = await get(`
            SELECT 
                COUNT(*) as totalRooms,
                (SELECT COUNT(*) FROM hostel_allocations WHERE status = 'Active') as activeResidents
            FROM hostel_rooms
        `);

        const placementStats = await get(`
            SELECT 
                COUNT(*) as totalPlaced,
                COALESCE(ROUND(AVG(package_lpa), 2), 0) as avgPackageLPA,
                COALESCE(MAX(package_lpa), 0) as highestPackageLPA
            FROM placements
            WHERE status = 'Selected'
        `);

        // Recent 5 Students
        const recentStudents = await all(`
            SELECT s.id, s.enrollment_no, s.full_name, s.email, d.code as department, s.status, s.current_semester
            FROM students s
            JOIN departments d ON s.department_id = d.id
            WHERE s.status != 'Archived'
            ORDER BY s.id DESC
            LIMIT 5
        `);

        // Department-wise distribution
        const departmentDistribution = await all(`
            SELECT d.code, d.name, COUNT(s.id) as student_count
            FROM departments d
            LEFT JOIN students s ON d.id = s.department_id AND s.status != 'Archived'
            GROUP BY d.id
            ORDER BY student_count DESC
        `);

        return {
            stats: {
                totalStudents: studentCountRow ? studentCountRow.count : 0,
                activeStudents: activeStudentCountRow ? activeStudentCountRow.count : 0,
                totalFaculty: facultyCountRow ? facultyCountRow.count : 0,
                totalDepartments: deptCountRow ? deptCountRow.count : 0,
                totalNotices: noticesCountRow ? noticesCountRow.count : 0,
                totalCourses: courseCountRow ? courseCountRow.count : 0,
                totalSubjects: subjectCountRow ? subjectCountRow.count : 0,
                totalInvoiced,
                totalCollected,
                outstandingFees,
                libraryBooks: libraryStats ? libraryStats.totalBooks : 0,
                libraryAvailable: libraryStats ? libraryStats.availableCopies : 0,
                hostelRooms: hostelStats ? hostelStats.totalRooms : 0,
                hostelOccupancy: hostelStats ? hostelStats.activeResidents : 0,
                placementsCount: placementStats ? placementStats.totalPlaced : 0,
                avgPlacementPackage: placementStats ? placementStats.avgPackageLPA : 0,
                highestPlacementPackage: placementStats ? placementStats.highestPackageLPA : 0
            },
            recentStudents,
            departmentDistribution
        };
    }
}

module.exports = DashboardService;
