/**
 * Connected Campus Entities Router
 * Departments, Faculty, Courses, Attendance, Results, Fees, Notices
 */

const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database/database');

// Injected SSE broadcast function
let sseBroadcast = () => {};
function setSseBroadcast(fn) {
    sseBroadcast = fn;
}

// 1. Departments
router.get('/departments', async (req, res) => {
    try {
        const rows = await all(`
            SELECT d.*, COUNT(s.id) as student_count
            FROM departments d
            LEFT JOIN students s ON d.id = s.department_id AND s.status != 'Archived'
            GROUP BY d.id
            ORDER BY d.id ASC
        `);
        res.json({ success: true, departments: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. Faculty
router.get('/faculty', async (req, res) => {
    try {
        const rows = await all(`
            SELECT f.*, u.name, u.email, d.name as department_name, d.code as department_code
            FROM faculty f
            JOIN users u ON f.user_id = u.id
            JOIN departments d ON f.department_id = d.id
            ORDER BY f.id ASC
        `);
        res.json({ success: true, faculty: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. Courses
router.get('/courses', async (req, res) => {
    try {
        const { department, semester } = req.query;
        let sql = `
            SELECT c.*, d.name as department_name, d.code as department_code,
                   u.name as faculty_name
            FROM courses c
            JOIN departments d ON c.department_id = d.id
            LEFT JOIN faculty f ON c.faculty_id = f.id
            LEFT JOIN users u ON f.user_id = u.id
            WHERE 1=1
        `;
        const params = [];
        if (department) {
            sql += ` AND (c.department_id = ? OR d.code = ?)`;
            params.push(department, department);
        }
        if (semester) {
            sql += ` AND c.semester = ?`;
            params.push(parseInt(semester));
        }
        sql += ` ORDER BY c.id ASC`;

        const rows = await all(sql, params);
        res.json({ success: true, courses: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 4. Attendance (Record new attendance)
router.get('/attendance', async (req, res) => {
    try {
        const { student_id, date, month } = req.query;
        let sql = `
            SELECT a.*, s.full_name as student_name, s.enrollment_no, c.code as course_code, c.title as course_title
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            JOIN courses c ON a.course_id = c.id
            WHERE 1=1
        `;
        const params = [];
        if (student_id) {
            sql += ` AND a.student_id = ?`;
            params.push(parseInt(student_id));
        }
        if (date) {
            sql += ` AND a.date = ?`;
            params.push(date);
        }
        if (month) {
            sql += ` AND strftime('%Y-%m', a.date) = ?`;
            params.push(month);
        }
        sql += ` ORDER BY a.date DESC LIMIT 100`;

        const rows = await all(sql, params);
        res.json({ success: true, attendance: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/attendance', async (req, res) => {
    try {
        const { student_id, course_id, date, status, remarks } = req.body;
        if (!student_id || !course_id || !date || !status) {
            return res.status(400).json({ success: false, message: 'Missing required attendance fields.' });
        }
        const result = await run(`
            INSERT INTO attendance (student_id, course_id, date, status, remarks)
            VALUES (?, ?, ?, ?, ?)
        `, [student_id, course_id, date, status, remarks || '-']);

        sseBroadcast('attendance:created', { id: result.lastID, student_id, status, date });
        res.status(201).json({ success: true, id: result.lastID, message: 'Attendance recorded.' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// 5. Results & Marks
router.get('/results', async (req, res) => {
    try {
        const { student_id, semester } = req.query;
        let sql = `
            SELECT r.*, s.full_name as student_name, s.enrollment_no,
                   e.title as exam_title, e.exam_type, e.max_marks,
                   c.code as course_code, c.title as course_title, c.credits
            FROM results r
            JOIN students s ON r.student_id = s.id
            JOIN exams e ON r.exam_id = e.id
            JOIN courses c ON e.course_id = c.id
            WHERE 1=1
        `;
        const params = [];
        if (student_id) {
            sql += ` AND r.student_id = ?`;
            params.push(parseInt(student_id));
        }
        if (semester) {
            sql += ` AND e.semester = ?`;
            params.push(parseInt(semester));
        }
        sql += ` ORDER BY c.code ASC`;

        const rows = await all(sql, params);
        res.json({ success: true, results: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 6. Fees (Invoices & Payments)
router.get('/fees/invoices', async (req, res) => {
    try {
        const { student_id } = req.query;
        let sql = `
            SELECT fi.*, s.full_name as student_name, s.enrollment_no,
                   COALESCE((SELECT SUM(amount_paid) FROM fee_payments WHERE invoice_id = fi.id), 0) as paid_amount
            FROM fee_invoices fi
            JOIN students s ON fi.student_id = s.id
            WHERE 1=1
        `;
        const params = [];
        if (student_id) {
            sql += ` AND fi.student_id = ?`;
            params.push(parseInt(student_id));
        }
        sql += ` ORDER BY fi.due_date DESC`;

        const rows = await all(sql, params);
        res.json({ success: true, invoices: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/fees/payments', async (req, res) => {
    try {
        const { invoice_id, student_id, amount_paid, payment_method, transaction_ref } = req.body;
        if (!invoice_id || !student_id || !amount_paid) {
            return res.status(400).json({ success: false, message: 'Missing payment details.' });
        }
        const payNum = `PAY-2026-${Date.now().toString().slice(-4)}`;
        const result = await run(`
            INSERT INTO fee_payments (payment_number, invoice_id, student_id, amount_paid, payment_date, payment_method, transaction_ref)
            VALUES (?, ?, ?, ?, date('now'), ?, ?)
        `, [payNum, invoice_id, student_id, amount_paid, payment_method || 'UPI', transaction_ref || `TXN-${Date.now()}`]);

        // Check if invoice is now paid
        const inv = await get('SELECT amount FROM fee_invoices WHERE id = ?', [invoice_id]);
        const paidRow = await get('SELECT SUM(amount_paid) as totalPaid FROM fee_payments WHERE invoice_id = ?', [invoice_id]);
        if (inv && paidRow && paidRow.totalPaid >= inv.amount) {
            await run(`UPDATE fee_invoices SET status = 'Paid' WHERE id = ?`, [invoice_id]);
        } else {
            await run(`UPDATE fee_invoices SET status = 'Partial' WHERE id = ?`, [invoice_id]);
        }

        sseBroadcast('fee:payment', { invoice_id, student_id, amount_paid });
        res.status(201).json({ success: true, id: result.lastID, payment_number: payNum, message: 'Payment recorded successfully.' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// 7. Notices
router.get('/notices', async (req, res) => {
    try {
        const rows = await all(`SELECT * FROM notices ORDER BY is_pinned DESC, publish_date DESC`);
        res.json({ success: true, notices: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/notices', async (req, res) => {
    try {
        const { title, content, published_by, category, is_pinned } = req.body;
        if (!title) return res.status(400).json({ success: false, message: 'Notice title is required.' });

        const date = new Date().toISOString().split('T')[0];
        const result = await run(`
            INSERT INTO notices (title, content, published_by, category, publish_date, is_pinned)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [title, content || '', published_by || 'Admin', category || 'General', date, is_pinned ? 1 : 0]);

        const newNotice = await get('SELECT * FROM notices WHERE id = ?', [result.lastID]);
        sseBroadcast('notice:created', newNotice);

        res.status(201).json({ success: true, notice: newNotice });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.delete('/notices/:id', async (req, res) => {
    try {
        await run('DELETE FROM notices WHERE id = ?', [req.params.id]);
        sseBroadcast('notice:deleted', { id: parseInt(req.params.id) });
        res.json({ success: true, message: 'Notice removed.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 8. Subjects
router.get('/subjects', async (req, res) => {
    try {
        const rows = await all(`
            SELECT s.*, c.title as course_title, d.name as department_name, f.designation, u.name as faculty_name
            FROM subjects s
            JOIN courses c ON s.course_id = c.id
            JOIN departments d ON s.department_id = d.id
            LEFT JOIN faculty f ON s.faculty_id = f.id
            LEFT JOIN users u ON f.user_id = u.id
            ORDER BY s.id ASC
        `);
        res.json({ success: true, subjects: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 9. Timetable (Filtered by student or department)
router.get('/timetable', async (req, res) => {
    try {
        const studentId = req.query.student_id ? parseInt(req.query.student_id) : null;
        let deptCode = req.query.department_code || req.query.department;
        let deptId = req.query.department_id ? parseInt(req.query.department_id) : null;

        if (studentId) {
            const stu = await get(`
                SELECT s.department_id, d.code as department_code 
                FROM students s 
                JOIN departments d ON s.department_id = d.id 
                WHERE s.id = ?
            `, [studentId]);
            if (stu) {
                deptId = stu.department_id;
                deptCode = stu.department_code;
            }
        }

        let sql = `
            SELECT t.*, c.code as course_code, c.title as course_title,
                   d.name as department_name, d.code as department_code, u.name as faculty_name
            FROM timetable t
            JOIN courses c ON t.course_id = c.id
            JOIN departments d ON t.department_id = d.id
            LEFT JOIN faculty f ON t.faculty_id = f.id
            LEFT JOIN users u ON f.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (deptId) {
            sql += ` AND t.department_id = ?`;
            params.push(deptId);
        } else if (deptCode) {
            sql += ` AND (UPPER(d.code) = ? OR UPPER(d.name) = ?)`;
            params.push(deptCode.trim().toUpperCase(), deptCode.trim().toUpperCase());
        }

        sql += ` ORDER BY t.day_of_week ASC, t.start_time ASC`;

        const rows = await all(sql, params);
        res.json({ success: true, timetable: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 10. Library Books & Issues
router.get('/library/books', async (req, res) => {
    try {
        const rows = await all(`SELECT * FROM library_books ORDER BY title ASC`);
        res.json({ success: true, books: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/library/issues', async (req, res) => {
    try {
        const { student_id } = req.query;
        let sql = `
            SELECT li.*, b.title as book_title, b.author, b.isbn, s.full_name as student_name, s.enrollment_no
            FROM library_issues li
            JOIN library_books b ON li.book_id = b.id
            JOIN students s ON li.student_id = s.id
            WHERE 1=1
        `;
        const params = [];
        if (student_id) {
            sql += ` AND li.student_id = ?`;
            params.push(student_id);
        }
        sql += ` ORDER BY li.id DESC`;
        const rows = await all(sql, params);
        res.json({ success: true, issues: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 11. Hostel Management
router.get('/hostels/rooms', async (req, res) => {
    try {
        const rows = await all(`SELECT * FROM hostel_rooms ORDER BY hostel_name ASC, room_number ASC`);
        res.json({ success: true, rooms: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/hostels/allocations', async (req, res) => {
    try {
        const rows = await all(`
            SELECT ha.*, hr.hostel_name, hr.room_number, hr.room_type, s.full_name as student_name, s.enrollment_no
            FROM hostel_allocations ha
            JOIN hostel_rooms hr ON ha.room_id = hr.id
            JOIN students s ON ha.student_id = s.id
            ORDER BY ha.id DESC
        `);
        res.json({ success: true, allocations: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 12. Transport Management
router.get('/transport/routes', async (req, res) => {
    try {
        const rows = await all(`SELECT * FROM transport_routes ORDER BY route_number ASC`);
        res.json({ success: true, routes: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/transport/allocations', async (req, res) => {
    try {
        const rows = await all(`
            SELECT ta.*, tr.route_number, tr.route_name, tr.bus_number, tr.driver_name, tr.driver_phone,
                   s.full_name as student_name, s.enrollment_no
            FROM transport_allocations ta
            JOIN transport_routes tr ON ta.route_id = tr.id
            JOIN students s ON ta.student_id = s.id
            ORDER BY ta.id DESC
        `);
        res.json({ success: true, allocations: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 13. Assignments (Field & Department Aware)
router.get('/assignments', async (req, res) => {
    try {
        const studentId = req.query.student_id ? parseInt(req.query.student_id) : null;
        const deptCode = req.query.department_code || req.query.department || null;

        let query = `
            SELECT a.*, c.title as course_title, c.code as course_code, c.department_id,
                   d.name as department_name, d.code as department_code, u.name as faculty_name,
                   sub.id as submission_id, sub.status as submission_status, sub.marks_awarded, sub.submission_date
            FROM assignments a
            JOIN courses c ON a.course_id = c.id
            LEFT JOIN departments d ON c.department_id = d.id
            LEFT JOIN faculty f ON a.faculty_id = f.id
            LEFT JOIN users u ON f.user_id = u.id
            LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id ${studentId ? 'AND sub.student_id = ' + studentId : ''}
        `;

        const conditions = [];
        const params = [];

        if (studentId) {
            conditions.push(`c.department_id = (SELECT department_id FROM students WHERE id = ?)`);
            params.push(studentId);
        } else if (deptCode) {
            conditions.push(`(UPPER(d.code) = ? OR UPPER(d.name) = ?)`);
            params.push(deptCode.trim().toUpperCase(), deptCode.trim().toUpperCase());
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY a.due_date ASC';

        let rows = await all(query, params);

        // Fallback: If no records matched, fetch by department of student
        if (studentId && (!rows || rows.length === 0)) {
            rows = await all(`
                SELECT a.*, c.title as course_title, c.code as course_code, c.department_id,
                       d.name as department_name, d.code as department_code, u.name as faculty_name,
                       sub.id as submission_id, sub.status as submission_status, sub.marks_awarded, sub.submission_date
                FROM assignments a
                JOIN courses c ON a.course_id = c.id
                LEFT JOIN departments d ON c.department_id = d.id
                LEFT JOIN faculty f ON a.faculty_id = f.id
                LEFT JOIN users u ON f.user_id = u.id
                LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = ?
                WHERE c.department_id = (SELECT department_id FROM students WHERE id = ?)
                ORDER BY a.due_date ASC
            `, [studentId, studentId]);
        }

        res.json({ success: true, assignments: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 14. Events
router.get('/events', async (req, res) => {
    try {
        const rows = await all(`SELECT * FROM events ORDER BY start_date ASC`);
        res.json({ success: true, events: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 15. Placements & Internships
router.get('/placements', async (req, res) => {
    try {
        const rows = await all(`
            SELECT p.*, s.full_name as student_name, s.enrollment_no, d.name as department_name
            FROM placements p
            JOIN students s ON p.student_id = s.id
            JOIN departments d ON s.department_id = d.id
            ORDER BY p.package_lpa DESC
        `);
        res.json({ success: true, placements: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/internships', async (req, res) => {
    try {
        const rows = await all(`
            SELECT i.*, s.full_name as student_name, s.enrollment_no, d.name as department_name
            FROM internships i
            JOIN students s ON i.student_id = s.id
            JOIN departments d ON s.department_id = d.id
            ORDER BY i.id DESC
        `);
        res.json({ success: true, internships: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 16. Leaves
router.get('/leaves', async (req, res) => {
    try {
        const rows = await all(`
            SELECT l.*, u.name as applicant_name, u.role as applicant_role
            FROM leaves l
            JOIN users u ON l.user_id = u.id
            ORDER BY l.id DESC
        `);
        res.json({ success: true, leaves: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 17. Complaints
router.get('/complaints', async (req, res) => {
    try {
        const rows = await all(`
            SELECT c.*, u.name as user_name, u.role as user_role
            FROM complaints c
            JOIN users u ON c.user_id = u.id
            ORDER BY c.id DESC
        `);
        res.json({ success: true, complaints: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 18. Feedback
router.get('/feedback', async (req, res) => {
    try {
        const rows = await all(`
            SELECT fb.*, u.name as student_name, c.title as course_title, fu.name as faculty_name
            FROM feedback fb
            JOIN users u ON fb.user_id = u.id
            LEFT JOIN courses c ON fb.course_id = c.id
            LEFT JOIN faculty f ON fb.faculty_id = f.id
            LEFT JOIN users fu ON f.user_id = fu.id
            ORDER BY fb.id DESC
        `);
        res.json({ success: true, feedback: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = { router, setSseBroadcast };
