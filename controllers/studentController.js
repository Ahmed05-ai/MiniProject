/**
 * Student Controller
 * Handles HTTP requests for Student CRUD, search, filters, and exports
 */

const StudentService = require('../services/studentService');
const { all, get } = require('../database/database');
const { getCurriculumCourses, resolveDepartmentCode } = require('../database/curriculumData');
const { ACADEMIC_HOLIDAYS, getHolidayForDate, getSemesterForDate } = require('../database/holidaysData');
const fs = require('fs');
const path = require('path');

// Reference to SSE broadcast function (injected by server.js)
let sseBroadcast = () => {};
function setSseBroadcast(fn) {
    sseBroadcast = fn;
}

class StudentController {
    /**
     * GET /api/students
     */
    static async getAllStudents(req, res) {
        try {
            const { search, department, semester, status, page, limit } = req.query;
            const result = await StudentService.getAllStudents({
                search,
                department,
                semester,
                status,
                page,
                limit
            });
            res.json({ success: true, ...result });
        } catch (err) {
            console.error('Error fetching students:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    }

    /**
     * GET /api/students/:id
     */
    static async getStudentById(req, res) {
        try {
            const student = await StudentService.getStudentById(req.params.id);
            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found.' });
            }
            res.json({ success: true, student });
        } catch (err) {
            console.error('Error fetching student by ID:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    }

    /**
     * POST /api/students
     */
    static async createStudent(req, res) {
        try {
            const newStudent = await StudentService.createStudent(req.body);
            sseBroadcast('student:created', newStudent);
            res.status(201).json({
                success: true,
                message: 'Student created successfully.',
                student: newStudent
            });
        } catch (err) {
            console.error('Error creating student:', err);
            res.status(400).json({ success: false, message: err.message });
        }
    }

    /**
     * PUT /api/students/:id
     * PRIMARY GOAL: Updates student details, validates uniqueness, propagates to all screens
     */
    static async updateStudent(req, res) {
        try {
            const result = await StudentService.updateStudent(req.params.id, req.body);
            
            // Broadcast real-time update to all connected clients
            sseBroadcast('student:updated', result.student);

            res.json({
                success: true,
                message: 'Student details updated successfully.',
                student: result.student,
                conflicts: result.conflicts || [],
                historyPreserved: true
            });
        } catch (err) {
            console.error('Error updating student:', err);
            res.status(400).json({ success: false, message: err.message });
        }
    }

    /**
     * DELETE /api/students/:id
     */
    static async deleteStudent(req, res) {
        try {
            const forceDelete = req.query.force === 'true';
            const result = await StudentService.deleteStudent(req.params.id, { forceDelete });
            
            sseBroadcast('student:deleted', { id: parseInt(req.params.id), archived: result.archived });

            res.json({
                success: true,
                ...result
            });
        } catch (err) {
            console.error('Error deleting student:', err);
            res.status(400).json({ success: false, message: err.message });
        }
    }

    /**
     * GET /api/students/:id/attendance
     * Multi-period per day attendance tracking with gazetted campus holidays,
     * student tenure tracking from admission date, and Monday-Friday classes with Sat-Sun off.
     */
    static async getStudentAttendance(req, res) {
        try {
            const studentId = parseInt(req.params.id);
            const { month, status, subject } = req.query; // e.g. month: '2023-10' or '2026-11'

            // 1. Fetch student department, semester, admission date, and year level
            const student = await get(`
                SELECT s.id, s.full_name, s.current_semester, s.department_id, s.admission_date, s.year_level,
                       d.code as department_code, d.name as department_name
                FROM students s
                JOIN departments d ON s.department_id = d.id
                WHERE s.id = ?
            `, [studentId]);

            const deptCode = resolveDepartmentCode(student ? student.department_code : 'CSE');
            const sem = (student && student.current_semester) ? student.current_semester : 1;

            // Determine authoritative admission date
            const admYear = 2026 - Math.floor((sem - 1) / 2);
            const admissionDateStr = (student && student.admission_date) ? student.admission_date : `${admYear}-07-15`;
            const admissionYear = parseInt(admissionDateStr.split('-')[0]);
            const admissionMonth = parseInt(admissionDateStr.split('-')[1]);

            // Allowed years and months list for student tenure
            const allowedYears = [];
            for (let y = admissionYear; y <= 2026; y++) {
                allowedYears.push(y);
            }

            const allowedMonths = [];
            for (let y = admissionYear; y <= 2026; y++) {
                const startM = (y === admissionYear) ? admissionMonth : 1;
                const endM = (y === 2026) ? 11 : 12; // Current month is November 2026
                for (let m = startM; m <= endM; m++) {
                    const mVal = `${y}-${String(m).padStart(2, '0')}`;
                    allowedMonths.push(mVal);
                }
            }

            // Determine target month (default to November 2026 or October 2026)
            let targetYear = 2026;
            let targetMonthNum = 11;

            if (month && month.trim() !== '') {
                const parts = month.split('-');
                if (parts.length === 2) {
                    targetYear = parseInt(parts[0].length === 4 ? parts[0] : parts[1]);
                    targetMonthNum = parseInt(parts[0].length === 4 ? parts[1] : parts[0]);
                }
            }

            const isPreAdmission = (targetYear < admissionYear) || (targetYear === admissionYear && targetMonthNum < admissionMonth);

            // Determine which semester the student was in during this target month
            const targetDateForSem = `${targetYear}-${String(targetMonthNum).padStart(2, '0')}-15`;
            const activeSem = isPreAdmission ? 1 : (getSemesterForDate(admissionDateStr, targetDateForSem) || sem);
            const curriculumCourses = getCurriculumCourses(deptCode, activeSem);

            const activeCourses = (curriculumCourses && curriculumCourses.length > 0) ? curriculumCourses : [
                { code: deptCode + activeSem + '01', title: deptCode + ' Engineering Principles' },
                { code: deptCode + activeSem + '02', title: deptCode + ' Applied Analysis' },
                { code: 'MA' + activeSem + '01', title: 'Mathematics & Computing' },
                { code: deptCode + activeSem + '03', title: deptCode + ' Systems Architecture' },
                { code: deptCode + activeSem + '05', title: deptCode + ' Practicum Laboratory' }
            ];

            const facultyMembers = [
                { name: 'Dr. Arvind Singhania', designation: 'Professor & HOD' },
                { name: 'Dr. Sunita Sharma', designation: 'Associate Professor' },
                { name: 'Prof. Rajesh Nair', designation: 'Assistant Professor' },
                { name: 'Dr. Priya Desai', designation: 'Associate Professor' },
                { name: 'Dr. Vikram Seth', designation: 'Professor' }
            ];

            const lectureRooms = ['Lecture Hall LH-101', 'Lecture Hall LH-102', 'Lecture Hall LH-204', 'Seminar Room S-12', 'Smart Room 302'];
            const labRooms = ['Advanced Computing Lab 1', 'Department Simulation Lab 2', 'Systems & Networks Lab', 'Central Engineering Lab'];

            // Deterministic approved leave days for students
            const studentLeaves = {
                '2026-10-15': { type: 'Approved Medical Leave', remarks: 'Doctor certified viral rest - Approved by Academic Office' },
                '2026-10-16': { type: 'Approved Medical Leave', remarks: 'Doctor certified convalescence - Approved by Academic Office' },
                '2026-10-22': { type: 'University Duty Leave', remarks: 'Smart India Hackathon Delegation - Official University Representation' },
                '2025-09-18': { type: 'Approved Medical Leave', remarks: 'Medical Rest - Approved by Student Welfare' },
                '2024-03-12': { type: 'University Duty Leave', remarks: 'Technical Symposium Representation Duty Leave' }
            };

            let allGeneratedRecords = [];
            let totalClassSessions = 0;
            let presentCount = 0;
            let absentCount = 0;
            let lateCount = 0;
            let leaveCount = 0;
            let holidayCount = 0;

            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const daysInMonth = new Date(targetYear, targetMonthNum, 0).getDate();

            for (let d = daysInMonth; d >= 1; d--) {
                const dateObj = new Date(targetYear, targetMonthNum - 1, d);
                const dayOfWeek = dateObj.getDay();
                const dayName = dayNames[dayOfWeek];
                const dateStr = `${targetYear}-${String(targetMonthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

                // Case 1: Pre-Admission period (student was not enrolled before admission date)
                if (isPreAdmission || (targetYear === admissionYear && targetMonthNum === admissionMonth && d < 15)) {
                    allGeneratedRecords.push({
                        id: `pre-${dateStr}`,
                        date: dateStr,
                        day_name: dayName,
                        period_name: 'All Day',
                        time_slot: 'Pre-Admission',
                        course_code: 'NOT-ENROLLED',
                        course_title: 'Pre-Admission Period (Not Enrolled)',
                        class_type: 'Pre-Admission',
                        faculty_name: 'Admissions Office',
                        room_number: '-',
                        status: 'Pre-Admission',
                        is_holiday: false,
                        is_leave: false,
                        is_pre_admission: true,
                        remarks: `Student admitted on ${admissionDateStr}. Prior academic records not applicable.`
                    });
                    continue;
                }

                // Check Indian Gazetted / Festival Holidays from authoritative holiday database
                const holidayInfo = getHolidayForDate(dateStr);

                // Case 2: Saturday (Weekend Academic Off - Red)
                if (dayOfWeek === 6) {
                    holidayCount++;
                    const holidayTitle = holidayInfo ? `${holidayInfo.title} (Saturday Off)` : 'Saturday Academic Off';
                    const holidayRemarks = holidayInfo ? holidayInfo.remarks : 'Saturday scheduled academic off / Campus closed';
                    allGeneratedRecords.push({
                        id: `hol-${dateStr}`,
                        date: dateStr,
                        day_name: dayName,
                        period_name: 'All Day',
                        time_slot: 'Weekend Off',
                        course_code: 'CAMPUS',
                        course_title: holidayTitle,
                        class_type: 'Holiday',
                        faculty_name: 'Campus Closed',
                        room_number: '-',
                        status: 'Holiday',
                        is_holiday: true,
                        is_leave: false,
                        remarks: holidayRemarks
                    });
                    continue;
                }

                // Case 3: Sunday (Weekend Academic Off - Red)
                if (dayOfWeek === 0) {
                    holidayCount++;
                    const holidayTitle = holidayInfo ? `${holidayInfo.title} (Sunday Off)` : 'Sunday Academic Off';
                    const holidayRemarks = holidayInfo ? holidayInfo.remarks : 'Sunday scheduled academic off / Campus closed';
                    allGeneratedRecords.push({
                        id: `hol-${dateStr}`,
                        date: dateStr,
                        day_name: dayName,
                        period_name: 'All Day',
                        time_slot: 'Weekend Off',
                        course_code: 'CAMPUS',
                        course_title: holidayTitle,
                        class_type: 'Holiday',
                        faculty_name: 'Campus Closed',
                        room_number: '-',
                        status: 'Holiday',
                        is_holiday: true,
                        is_leave: false,
                        remarks: holidayRemarks
                    });
                    continue;
                }

                // Case 4: Weekday Gazetted / Festival Holiday (Monday to Friday - Red)
                if (holidayInfo) {
                    holidayCount++;
                    allGeneratedRecords.push({
                        id: `hol-${dateStr}`,
                        date: dateStr,
                        day_name: dayName,
                        period_name: 'All Day',
                        time_slot: 'Campus Holiday',
                        course_code: 'HOLIDAY',
                        course_title: holidayInfo.title,
                        class_type: 'Holiday',
                        faculty_name: 'Campus Closed',
                        room_number: '-',
                        status: 'Holiday',
                        is_holiday: true,
                        is_leave: false,
                        remarks: holidayInfo.remarks
                    });
                    continue;
                }

                // Case 5: Approved Student Leave (Medical or Duty Leave - Purple)
                if (studentLeaves[dateStr]) {
                    leaveCount++;
                    allGeneratedRecords.push({
                        id: `leave-${dateStr}`,
                        date: dateStr,
                        day_name: dayName,
                        period_name: 'Full Day',
                        time_slot: 'Approved Leave',
                        course_code: 'LEAVE',
                        course_title: studentLeaves[dateStr].type,
                        class_type: 'Leave',
                        faculty_name: 'HOD / Dean Approved',
                        room_number: '-',
                        status: 'On Leave',
                        is_holiday: false,
                        is_leave: true,
                        remarks: studentLeaves[dateStr].remarks
                    });
                    continue;
                }

                // Case 6: Regular Working Day (Monday to Friday only): 4 Academic Periods per Day
                const periods = [
                    {
                        slot: 'Period 1 (09:00 - 10:00 AM)',
                        course: activeCourses[0 % activeCourses.length],
                        type: 'Lecture',
                        room: lectureRooms[0 % lectureRooms.length],
                        faculty: facultyMembers[0 % facultyMembers.length].name
                    },
                    {
                        slot: 'Period 2 (10:15 - 11:15 AM)',
                        course: activeCourses[1 % activeCourses.length],
                        type: 'Lecture',
                        room: lectureRooms[1 % lectureRooms.length],
                        faculty: facultyMembers[1 % facultyMembers.length].name
                    },
                    {
                        slot: 'Period 3 (11:30 - 12:30 PM)',
                        course: activeCourses[2 % activeCourses.length],
                        type: 'Lecture',
                        room: lectureRooms[2 % lectureRooms.length],
                        faculty: facultyMembers[2 % facultyMembers.length].name
                    },
                    {
                        slot: 'Period 4 (01:30 - 03:30 PM)',
                        course: activeCourses[activeCourses.length - 1],
                        type: 'Practical Lab',
                        room: labRooms[(d + studentId) % labRooms.length],
                        faculty: facultyMembers[3 % facultyMembers.length].name
                    }
                ];

                // Process each period individually
                periods.forEach((p, pIdx) => {
                    totalClassSessions++;
                    let status = 'Present';
                    let remarks = p.type === 'Practical Lab' 
                        ? 'Lab experiment conducted & verified' 
                        : 'Attended full session & participated';

                    // Individual class attendance variances:
                    if (pIdx === 0 && (d + studentId) % 11 === 0) {
                        status = 'Late';
                        remarks = 'Late entry (12 mins) - Metropolitan transit delay';
                        lateCount++;
                    } else if (pIdx === 2 && (d * 3 + studentId) % 23 === 0) {
                        status = 'Late';
                        remarks = 'Late arrival (10 mins) - Seminar venue shift';
                        lateCount++;
                    } else if (pIdx === 3 && (d + studentId) % 13 === 0) {
                        status = 'Absent';
                        remarks = 'Uninformed absence in afternoon lab session';
                        absentCount++;
                    } else if (pIdx === 1 && (d * 2 + studentId) % 19 === 0) {
                        status = 'Absent';
                        remarks = 'Sick bay consultation / indisposed';
                        absentCount++;
                    } else {
                        presentCount++;
                    }

                    allGeneratedRecords.push({
                        id: `att-${dateStr}-p${pIdx + 1}`,
                        date: dateStr,
                        day_name: dayName,
                        period_name: `Period ${pIdx + 1}`,
                        time_slot: p.slot,
                        course_code: p.course.code,
                        course_title: p.course.title,
                        class_type: p.type,
                        faculty_name: p.faculty,
                        room_number: p.room,
                        status,
                        is_holiday: false,
                        is_leave: false,
                        remarks
                    });
                });
            }

            // Calculate overall percentage & eligibility
            const overallPct = totalClassSessions > 0 
                ? Math.round(((presentCount + 0.5 * lateCount) / totalClassSessions) * 100)
                : (isPreAdmission ? 0 : 85);
            const strictPresentPct = totalClassSessions > 0 
                ? Math.round((presentCount / totalClassSessions) * 100)
                : (isPreAdmission ? 0 : 80);
            const isEligible = overallPct >= 75;

            const stats = {
                totalSessions: totalClassSessions,
                presentCount,
                absentCount,
                lateCount,
                leaveDays: leaveCount,
                holidayDays: holidayCount,
                overallPercentage: overallPct,
                strictPresentPercentage: strictPresentPct,
                isEligibleForExams: isEligible,
                eligibilityBadge: isEligible ? 'Eligible (> 75%)' : 'Shortage Alert (< 75%)',
                breakdown: {
                    presentPct: totalClassSessions > 0 ? Math.round((presentCount / totalClassSessions) * 100) : (isPreAdmission ? 0 : 85),
                    absentPct: totalClassSessions > 0 ? Math.round((absentCount / totalClassSessions) * 100) : 0,
                    latePct: totalClassSessions > 0 ? Math.round((lateCount / totalClassSessions) * 100) : 0,
                    leaveCount,
                    holidayCount
                }
            };

            // Apply optional filters (by status, subject)
            let filteredRecords = allGeneratedRecords;
            if (status && status.trim() !== '' && status !== 'ALL') {
                if (status === 'CLASSES') {
                    filteredRecords = filteredRecords.filter(r => !r.is_holiday && !r.is_leave && !r.is_pre_admission);
                } else {
                    filteredRecords = filteredRecords.filter(r => r.status.toLowerCase() === status.toLowerCase());
                }
            }
            if (subject && subject.trim() !== '' && subject !== 'ALL') {
                filteredRecords = filteredRecords.filter(r => r.course_code === subject);
            }

            // Build dailySummaries dictionary for instant calendar rendering
            const dailySummaries = {};
            allGeneratedRecords.forEach(r => {
                if (!dailySummaries[r.date]) {
                    dailySummaries[r.date] = {
                        date: r.date,
                        day_name: r.day_name,
                        is_holiday: r.is_holiday,
                        is_leave: r.is_leave,
                        is_pre_admission: r.is_pre_admission || false,
                        title: r.is_holiday ? r.course_title : (r.is_leave ? r.course_title : (r.is_pre_admission ? r.course_title : 'Regular Lecture & Lab Day')),
                        status: r.is_holiday ? 'Holiday' : (r.is_leave ? 'On Leave' : (r.is_pre_admission ? 'Pre-Admission' : 'Working Day')),
                        remarks: r.remarks,
                        periods: [],
                        presentCount: 0,
                        absentCount: 0,
                        lateCount: 0
                    };
                }
                if (!r.is_holiday && !r.is_leave && !r.is_pre_admission) {
                    dailySummaries[r.date].periods.push(r);
                    if (r.status === 'Present') dailySummaries[r.date].presentCount++;
                    else if (r.status === 'Absent') dailySummaries[r.date].absentCount++;
                    else if (r.status === 'Late') dailySummaries[r.date].lateCount++;
                }
            });

            res.json({
                success: true,
                records: filteredRecords,
                allRecords: allGeneratedRecords,
                dailySummaries,
                allRecordsCount: allGeneratedRecords.length,
                totalSessions: totalClassSessions,
                stats,
                tenure: {
                    admissionDate: admissionDateStr,
                    admissionYear,
                    admissionMonth,
                    currentYear: 2026,
                    currentMonth: 11,
                    yearLevel: student ? student.year_level : '1st Year',
                    activeSemesterForMonth: activeSem,
                    isPreAdmission,
                    allowedYears,
                    allowedMonths
                },
                studentInfo: {
                    id: student ? student.id : studentId,
                    name: student ? student.full_name : 'Student',
                    department: deptCode,
                    semester: sem,
                    admissionDate: admissionDateStr,
                    yearLevel: student ? student.year_level : '1st Year'
                }
            });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    /**
     * GET /api/students/:id/results
     */
    static async getStudentResults(req, res) {
        try {
            const semester = req.query.semester ? parseInt(req.query.semester) : null;
            const summary = await StudentService.getStudentAcademicSummary(req.params.id, { semester });
            res.json({ success: true, ...summary });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    /**
     * GET /api/students/:id/fees
     */
    static async getStudentFees(req, res) {
        try {
            const fees = await StudentService.getStudentFeeSummary(req.params.id);
            res.json({ success: true, ...fees });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    /**
     * GET /api/students/export/json
     */
    static async exportJson(req, res) {
        try {
            const students = await all(`
                SELECT s.id, s.enrollment_no, s.full_name, s.first_name, s.last_name,
                       s.email, s.phone, s.dob, s.gender, d.name as department_name, d.code as department_code,
                       s.current_semester, s.year_level, s.section, s.status, s.guardian_name, s.guardian_phone
                FROM students s
                JOIN departments d ON s.department_id = d.id
                ORDER BY s.id ASC
            `);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename="students_export.json"');
            res.send(JSON.stringify(students, null, 2));
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    /**
     * GET /api/students/export/csv
     */
    static async exportCsv(req, res) {
        try {
            const students = await all(`
                SELECT s.id, s.enrollment_no, s.full_name, s.first_name, s.last_name,
                       s.email, s.phone, s.dob, s.gender, d.name as department_name, d.code as department_code,
                       s.current_semester, s.year_level, s.section, s.status, s.guardian_name, s.guardian_phone
                FROM students s
                JOIN departments d ON s.department_id = d.id
                ORDER BY s.id ASC
            `);

            if (students.length === 0) {
                return res.send('');
            }

            const headers = Object.keys(students[0]).join(',');
            const rows = students.map(st => {
                return Object.values(st).map(val => {
                    const str = String(val === null || val === undefined ? '' : val);
                    return `"${str.replace(/"/g, '""')}"`;
                }).join(',');
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="students_export.csv"');
            res.send([headers, ...rows].join('\n'));
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = { StudentController, setSseBroadcast };
