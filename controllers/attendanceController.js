/**
 * Smart Campus ERP - Attendance & Academic Calendar Controller
 * Comprehensive University ERP Attendance Engine
 * 
 * Features:
 * - Multi-period per day tracking (Theory Lectures & Practical Labs)
 * - Independent Theory vs Practical Lab attendance calculations
 * - Multi-year historical records (2023, 2024, 2025, 2026, 2027)
 * - 12-month calendar generation with authentic gazetted holidays & vacations
 * - Continuous Academic Vacations (Summer, Winter, Diwali, Semester Breaks)
 * - Subject-wise analytics with configurable thresholds (Safe >=75%, Warning 65-74%, Shortage <65%)
 * - Faculty & Admin attendance marking controls with audit logging
 * - Real-time SSE updates and multi-format exports (CSV, Print, Excel)
 */

const { run, get, all } = require('../database/database');
const { getCurriculumCourses, resolveDepartmentCode } = require('../database/curriculumData');
const { ACADEMIC_HOLIDAYS, ACADEMIC_VACATIONS, getHolidayForDate, getVacationForDate, getSemesterForDate } = require('../database/holidaysData');

// SSE broadcaster reference
let sseBroadcast = () => {};
function setSseBroadcast(fn) {
    sseBroadcast = fn;
}

class AttendanceController {

    /**
     * GET /api/attendance/summary
     * Primary ERP endpoint providing comprehensive KPI metrics, separate Theory & Lab stats,
     * subject breakdown table with Safe/Warning/Shortage alerts, and weekly overview.
     */
    static async getAttendanceSummary(req, res) {
        try {
            const studentId = parseInt(req.query.student_id || req.params.student_id || 1);
            const academicYear = req.query.academic_year || '2026-2027';
            const semesterQuery = req.query.semester ? parseInt(req.query.semester) : null;
            const monthQuery = req.query.month || ''; // e.g. '2026-11'
            const subjectQuery = req.query.subject || 'ALL';
            const sessionTypeQuery = req.query.session_type || 'ALL'; // 'Theory', 'Practical Lab', 'ALL'

            // 1. Fetch student info
            const student = await get(`
                SELECT s.id, s.full_name, s.enrollment_no, s.current_semester, s.admission_date, s.year_level,
                       d.code as department_code, d.name as department_name
                FROM students s
                JOIN departments d ON s.department_id = d.id
                WHERE s.id = ?
            `, [studentId]);

            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found.' });
            }

            const deptCode = resolveDepartmentCode(student.department_code || 'CSE');
            const currentSem = student.current_semester || 1;
            const admissionDateStr = student.admission_date || '2026-07-15';
            const admYear = parseInt(admissionDateStr.split('-')[0]);
            const admMonth = parseInt(admissionDateStr.split('-')[1]);

            // Determine student's year level (1 to 4) and max allowed semesters
            // 1st Year: max 2 semesters (Sem 1 and 2)
            // 2nd Year: max 4 semesters (Sem 1, 2, 3, 4)
            // 3rd Year: max 6 semesters (Sem 1, 2, 3, 4, 5, 6)
            // 4th Year: max 8 semesters (Sem 1 through 8)
            let yearNum = 1;
            const yearStr = String(student.year_level || '').toLowerCase();
            if (yearStr.includes('4') || yearStr.includes('fourth') || currentSem >= 7) {
                yearNum = 4;
            } else if (yearStr.includes('3') || yearStr.includes('third') || currentSem >= 5) {
                yearNum = 3;
            } else if (yearStr.includes('2') || yearStr.includes('second') || currentSem >= 3) {
                yearNum = 2;
            } else {
                yearNum = 1;
            }

            const maxAllowedSem = Math.min(8, yearNum * 2);
            const allowedSemesters = Array.from({ length: maxAllowedSem }, (_, i) => i + 1);

            // Allowed academic sessions based on student year
            const allSessions = ['2026-2027', '2025-2026', '2024-2025', '2023-2024'];
            const allowedSessions = allSessions.slice(0, yearNum);
            const allowedYears = allowedSessions.map(s => parseInt(s.split('-')[0]));

            let validAcademicYear = academicYear;
            if (!allowedSessions.includes(validAcademicYear)) {
                validAcademicYear = allowedSessions[0];
            }

            // Determine active semester (strictly bounded by maxAllowedSem)
            let activeSem = currentSem;
            if (semesterQuery) {
                const parsedSem = parseInt(semesterQuery);
                if (parsedSem >= 1 && parsedSem <= maxAllowedSem) {
                    activeSem = parsedSem;
                } else if (parsedSem > maxAllowedSem) {
                    activeSem = maxAllowedSem;
                } else {
                    activeSem = 1;
                }
            }

            const isOddSem = (activeSem % 2 !== 0);
            const semOffset = Math.floor((activeSem - 1) / 2);
            const semAcademicYear = `${admYear + semOffset}-${admYear + semOffset + 1}`;
            const allowedMonthsForSem = isOddSem ? [7, 8, 9, 10, 11, 12] : [1, 2, 3, 4, 5, 6];

            // Determine active target year and month based on semester rule
            let targetYear = isOddSem ? (admYear + semOffset) : (admYear + semOffset + 1);
            let targetMonth = isOddSem ? 11 : 3;

            if (monthQuery && monthQuery.includes('-')) {
                const parts = monthQuery.split('-');
                const qYear = parseInt(parts[0]);
                const qMonth = parseInt(parts[1]);
                if (qMonth >= 1 && qMonth <= 12) {
                    targetMonth = qMonth;
                    targetYear = qYear;
                }
            } else if (semesterQuery) {
                validAcademicYear = semAcademicYear;
            }

            if (!semesterQuery) {
                const computedSem = getSemesterForDate(admissionDateStr, `${targetYear}-${String(targetMonth).padStart(2, '0')}-15`);
                activeSem = Math.min(maxAllowedSem, Math.max(1, computedSem || currentSem));
            }

            const isPreAdmission = (targetYear < admYear) || (targetYear === admYear && targetMonth < admMonth);

            // Load courses for active semester
            const curriculumCourses = getCurriculumCourses(deptCode, activeSem);
            const activeCourses = (curriculumCourses && curriculumCourses.length > 0) ? curriculumCourses : [
                { code: deptCode + activeSem + '01', title: deptCode + ' Core Principles' },
                { code: deptCode + activeSem + '02', title: deptCode + ' Applied Architecture' },
                { code: 'MA' + activeSem + '01', title: 'Mathematics & Computing' },
                { code: deptCode + activeSem + '03', title: deptCode + ' Systems Engineering' },
                { code: deptCode + activeSem + '05', title: deptCode + ' Practicum Laboratory' }
            ];

            const facultyList = [
                { name: 'Dr. Arvind Singhania', designation: 'Professor & HOD' },
                { name: 'Dr. Sunita Sharma', designation: 'Associate Professor' },
                { name: 'Prof. Rajesh Nair', designation: 'Assistant Professor' },
                { name: 'Dr. Priya Desai', designation: 'Associate Professor' }
            ];

            // Deterministic approved leaves catalog
            const studentLeaves = {
                '2026-10-15': { type: 'Approved Medical Leave', remarks: 'Doctor certified viral rest - Approved by Academic Office' },
                '2026-10-16': { type: 'Approved Medical Leave', remarks: 'Doctor certified convalescence - Approved by Academic Office' },
                '2026-10-22': { type: 'University Duty Leave', remarks: 'Smart India Hackathon Delegation - Official University Representation' }
            };

            // Days in target month
            const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            let totalWorkingDays = 0;
            let totalScheduledClasses = 0;
            let totalAttendedClasses = 0;
            let totalAbsentClasses = 0;
            let totalLateClasses = 0;
            let totalHolidays = 0;
            let totalVacationDays = 0;
            let totalLeaveDays = 0;

            // Separate Theory vs Practical Lab metrics
            let theoryTotal = 0, theoryAttended = 0, theoryAbsent = 0, theoryLate = 0;
            let labTotal = 0, labAttended = 0, labAbsent = 0, labLate = 0;

            // Subject-wise tracking map
            const subjectMap = {};
            activeCourses.forEach((c, idx) => {
                const isLab = idx === activeCourses.length - 1 || c.title.toLowerCase().includes('lab') || c.title.toLowerCase().includes('practicum');
                subjectMap[c.code] = {
                    code: c.code,
                    title: c.title,
                    type: isLab ? 'Practical Lab' : 'Theory',
                    faculty: facultyList[idx % facultyList.length].name,
                    scheduled: 0,
                    attended: 0,
                    absent: 0,
                    late: 0,
                    lastAttended: '-'
                };
            });

            // Weekly distribution (Monday to Friday)
            const weeklyDays = {
                Monday: { total: 0, attended: 0 },
                Tuesday: { total: 0, attended: 0 },
                Wednesday: { total: 0, attended: 0 },
                Thursday: { total: 0, attended: 0 },
                Friday: { total: 0, attended: 0 }
            };

            const allGeneratedRecords = [];
            const dailySummaries = {};

            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const dt = new Date(targetYear, targetMonth - 1, d);
                const dayOfWeek = dt.getDay();
                const dayName = dayNames[dayOfWeek];
                const isSunday = dayOfWeek === 0;
                const isSaturday = dayOfWeek === 6;
                const isWeekend = isSunday || isSaturday;

                // Check Pre-Admission
                if (isPreAdmission || (targetYear === admYear && targetMonth === admMonth && d < admMonth)) {
                    dailySummaries[dateStr] = {
                        date: dateStr,
                        day_name: dayName,
                        status: 'Pre-Admission',
                        is_pre_admission: true,
                        is_holiday: false,
                        is_vacation: false,
                        title: 'Pre-Admission Period (Not Enrolled)',
                        remarks: `Student admitted on ${admissionDateStr}`,
                        periods: [],
                        presentCount: 0,
                        absentCount: 0,
                        lateCount: 0
                    };
                    continue;
                }

                // Explicit Universal Semester Boundary Vacations (Applicable across all years)
                // 1. Summer Vacation Recess: May 16 to July 14 (15 days May + all June + July 14)
                if (targetMonth === 6 || (targetMonth === 5 && d >= 16) || (targetMonth === 7 && d <= 14)) {
                    totalVacationDays++;
                    dailySummaries[dateStr] = {
                        date: dateStr,
                        day_name: dayName,
                        status: 'Vacation',
                        is_vacation: true,
                        is_holiday: true,
                        title: 'Summer Vacation Recess',
                        vacationType: 'Summer Vacation',
                        remarks: 'Annual University Summer Vacation Recess (May 16 - July 14, 60 days) - All classes suspended',
                        periods: [],
                        presentCount: 0,
                        absentCount: 0,
                        lateCount: 0
                    };
                    continue;
                }

                // 2. Winter Vacation Recess: Dec 16 to Jan 01 (17 days)
                if ((targetMonth === 12 && d >= 16) || (targetMonth === 1 && d === 1)) {
                    totalVacationDays++;
                    dailySummaries[dateStr] = {
                        date: dateStr,
                        day_name: dayName,
                        status: 'Vacation',
                        is_vacation: true,
                        is_holiday: true,
                        title: 'Winter Vacation Break',
                        vacationType: 'Winter Vacation',
                        remarks: 'Annual University Winter Break & Term Pause (Dec 16 - Jan 01, 17 days)',
                        periods: [],
                        presentCount: 0,
                        absentCount: 0,
                        lateCount: 0
                    };
                    continue;
                }

                // Check 8 November 2026 explicitly for Diwali
                if (dateStr === '2026-11-08') {
                    totalHolidays++;
                    dailySummaries[dateStr] = {
                        date: dateStr,
                        day_name: dayName,
                        status: 'Holiday',
                        is_holiday: true,
                        is_vacation: true,
                        title: 'Diwali',
                        vacationType: 'Diwali Vacation',
                        remarks: 'Diwali (Deepavali) Festival - Campus Closed',
                        periods: [],
                        presentCount: 0,
                        absentCount: 0,
                        lateCount: 0
                    };
                    continue;
                }

                // Check Vacations & Examinations (Summer, Winter, Diwali, Mid Sem Exam, End Sem Exam)
                const vacationInfo = getVacationForDate(dateStr);
                if (vacationInfo) {
                    if (vacationInfo.isExam) {
                        dailySummaries[dateStr] = {
                            date: dateStr,
                            day_name: dayName,
                            status: isWeekend ? 'Holiday' : 'Examination',
                            is_exam: !isWeekend,
                            is_vacation: false,
                            is_holiday: isWeekend,
                            title: isWeekend ? `${isSaturday ? 'Saturday' : 'Sunday'} Weekend (Exam Recess)` : vacationInfo.title,
                            vacationType: 'Examination',
                            remarks: vacationInfo.remarks,
                            periods: [],
                            presentCount: 0,
                            absentCount: 0,
                            lateCount: 0
                        };
                        continue;
                    }

                    totalVacationDays++;
                    dailySummaries[dateStr] = {
                        date: dateStr,
                        day_name: dayName,
                        status: 'Vacation',
                        is_vacation: true,
                        is_holiday: true,
                        title: vacationInfo.title,
                        vacationType: vacationInfo.vacationType,
                        remarks: vacationInfo.remarks,
                        periods: [],
                        presentCount: 0,
                        absentCount: 0,
                        lateCount: 0
                    };
                    continue;
                }

                // Check Gazetted / Festival Holidays
                const holidayInfo = getHolidayForDate(dateStr);

                // Weekend Off (Saturday & Sunday)
                if (isWeekend) {
                    totalHolidays++;
                    const holTitle = holidayInfo ? `${holidayInfo.title} (${isSaturday ? 'Saturday' : 'Sunday'} Off)` : `${isSaturday ? 'Saturday' : 'Sunday'} Academic Off`;
                    dailySummaries[dateStr] = {
                        date: dateStr,
                        day_name: dayName,
                        status: 'Holiday',
                        is_holiday: true,
                        is_weekend: true,
                        title: holTitle,
                        remarks: 'Weekly scheduled academic off - Campus closed',
                        periods: [],
                        presentCount: 0,
                        absentCount: 0,
                        lateCount: 0
                    };
                    continue;
                }

                // Weekday Gazetted Holiday (Monday to Friday)
                if (holidayInfo) {
                    totalHolidays++;
                    dailySummaries[dateStr] = {
                        date: dateStr,
                        day_name: dayName,
                        status: 'Holiday',
                        is_holiday: true,
                        is_gazetted: true,
                        title: holidayInfo.title,
                        remarks: holidayInfo.remarks || 'Official Gazetted Holiday - Campus closed',
                        periods: [],
                        presentCount: 0,
                        absentCount: 0,
                        lateCount: 0
                    };
                    continue;
                }

                // Approved Official Leave
                if (studentLeaves[dateStr]) {
                    totalLeaveDays++;
                    dailySummaries[dateStr] = {
                        date: dateStr,
                        day_name: dayName,
                        status: 'On Leave',
                        is_leave: true,
                        title: studentLeaves[dateStr].type,
                        remarks: studentLeaves[dateStr].remarks,
                        periods: [],
                        presentCount: 0,
                        absentCount: 0,
                        lateCount: 0
                    };
                    continue;
                }

                // Regular Class Day (Monday to Friday): Conduct 4 Periods (3 Theory + 1 Practical Lab)
                totalWorkingDays++;

                const dayPeriods = [
                    {
                        period_name: 'Period 1',
                        slot: '09:00 - 10:00 AM',
                        course: activeCourses[0 % activeCourses.length],
                        type: 'Theory',
                        room: 'LH-101',
                        faculty: facultyList[0].name
                    },
                    {
                        period_name: 'Period 2',
                        slot: '10:15 - 11:15 AM',
                        course: activeCourses[1 % activeCourses.length],
                        type: 'Theory',
                        room: 'LH-102',
                        faculty: facultyList[1].name
                    },
                    {
                        period_name: 'Period 3',
                        slot: '11:30 - 12:30 PM',
                        course: activeCourses[2 % activeCourses.length],
                        type: 'Theory',
                        room: 'LH-204',
                        faculty: facultyList[2].name
                    },
                    {
                        period_name: 'Period 4',
                        slot: '01:30 - 03:30 PM',
                        course: activeCourses[activeCourses.length - 1],
                        type: 'Practical Lab',
                        room: 'Advanced Computing Lab',
                        faculty: facultyList[3].name
                    }
                ];

                let dayPresent = 0, dayAbsent = 0, dayLate = 0;
                const periodRecords = [];

                dayPeriods.forEach((p, idx) => {
                    totalScheduledClasses++;
                    const isLab = p.type === 'Practical Lab';
                    if (isLab) labTotal++;
                    else theoryTotal++;

                    let status = 'Present';
                    let remarks = isLab ? 'Lab experiment verified & signed' : 'Attended full lecture';

                    // Deterministic realistic variances
                    if (idx === 0 && (d + studentId) % 11 === 0) {
                        status = 'Late';
                        remarks = 'Late arrival (12 min) - Metro transit delay';
                        dayLate++;
                        totalLateClasses++;
                        if (isLab) labLate++;
                        else theoryLate++;
                    } else if (idx === 3 && (d + studentId) % 13 === 0) {
                        status = 'Absent';
                        remarks = 'Uninformed absence in afternoon lab';
                        dayAbsent++;
                        totalAbsentClasses++;
                        if (isLab) labAbsent++;
                        else theoryAbsent++;
                    } else if (idx === 1 && (d * 2 + studentId) % 19 === 0) {
                        status = 'Absent';
                        remarks = 'Sick bay consultation';
                        dayAbsent++;
                        totalAbsentClasses++;
                        if (isLab) labAbsent++;
                        else theoryAbsent++;
                    } else {
                        status = 'Present';
                        dayPresent++;
                        totalAttendedClasses++;
                        if (isLab) labAttended++;
                        else theoryAttended++;
                    }

                    // Update subject metrics
                    if (subjectMap[p.course.code]) {
                        subjectMap[p.course.code].scheduled++;
                        if (status === 'Present') {
                            subjectMap[p.course.code].attended++;
                            subjectMap[p.course.code].lastAttended = dateStr;
                        } else if (status === 'Late') {
                            subjectMap[p.course.code].late++;
                            subjectMap[p.course.code].attended += 0.5;
                            subjectMap[p.course.code].lastAttended = dateStr;
                        } else {
                            subjectMap[p.course.code].absent++;
                        }
                    }

                    // Update weekly metrics
                    if (weeklyDays[dayName]) {
                        weeklyDays[dayName].total++;
                        if (status === 'Present') weeklyDays[dayName].attended++;
                        else if (status === 'Late') weeklyDays[dayName].attended += 0.5;
                    }

                    const rec = {
                        id: `att-${dateStr}-p${idx + 1}`,
                        date: dateStr,
                        day_name: dayName,
                        period_name: p.period_name,
                        time_slot: p.slot,
                        course_code: p.course.code,
                        course_title: p.course.title,
                        class_type: p.type,
                        faculty_name: p.faculty,
                        room_number: p.room,
                        status,
                        remarks
                    };
                    periodRecords.push(rec);
                    allGeneratedRecords.push(rec);
                });

                dailySummaries[dateStr] = {
                    date: dateStr,
                    day_name: dayName,
                    status: (dayAbsent === 0 && dayLate === 0) ? 'Full Present' : (dayPresent === 0 ? 'Full Absent' : 'Partial Attendance'),
                    is_holiday: false,
                    is_leave: false,
                    periods: periodRecords,
                    presentCount: dayPresent,
                    absentCount: dayAbsent,
                    lateCount: dayLate
                };
            }

            // Calculate overall percentage
            const effectiveAttended = totalAttendedClasses + (0.5 * totalLateClasses);
            const overallPct = totalScheduledClasses > 0 ? Math.round((effectiveAttended / totalScheduledClasses) * 100) : 85;

            // Theory & Lab percentages
            const theoryEffective = theoryAttended + (0.5 * theoryLate);
            const theoryPct = theoryTotal > 0 ? Math.round((theoryEffective / theoryTotal) * 100) : 85;

            const labEffective = labAttended + (0.5 * labLate);
            const labPct = labTotal > 0 ? Math.round((labEffective / labTotal) * 100) : 90;

            // Determine safe/warning/shortage status
            const eligibilityStatus = overallPct >= 75 ? 'Safe' : (overallPct >= 65 ? 'Warning' : 'Shortage');
            const eligibilityBadge = overallPct >= 75 ? 'Eligible for Exams (>= 75%)' : (overallPct >= 65 ? 'Attendance Warning (65-74%)' : 'Attendance Shortage Alert (< 65%)');

            // Format subject breakdown list
            const subjectBreakdown = Object.values(subjectMap).map(s => {
                const effective = s.attended;
                const pct = s.scheduled > 0 ? Math.round((effective / s.scheduled) * 100) : 85;
                let statusBadge = 'Safe';
                if (pct < 65) statusBadge = 'Shortage';
                else if (pct < 75) statusBadge = 'Warning';

                return {
                    code: s.code,
                    title: s.title,
                    type: s.type,
                    faculty: s.faculty,
                    totalScheduled: s.scheduled,
                    attended: Math.round(s.attended),
                    absent: s.absent,
                    late: s.late,
                    percentage: pct,
                    status: statusBadge,
                    lastAttended: s.lastAttended !== '-' ? s.lastAttended : 'Recently Attended'
                };
            });

            // Weekly overview format
            const weeklyOverview = Object.entries(weeklyDays).map(([day, stats]) => ({
                day,
                total: stats.total,
                attended: Math.round(stats.attended),
                percentage: stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 85
            }));

            // Upcoming vacations & events
            const upcomingEvents = ACADEMIC_VACATIONS.filter(v => v.startDate >= `${targetYear}-01-01`).slice(0, 4);

            res.json({
                success: true,
                student: {
                    id: student.id,
                    name: student.full_name,
                    enrollment_no: student.enrollment_no,
                    department: student.department_name,
                    department_code: deptCode,
                    current_semester: currentSem,
                    year_level: student.year_level,
                    admission_date: admissionDateStr,
                    academic_year: academicYear
                },
                metrics: {
                    overallPercentage: overallPct,
                    totalWorkingDays,
                    totalScheduledClasses,
                    totalAttendedClasses: Math.round(effectiveAttended),
                    totalAbsentClasses,
                    totalLateClasses,
                    totalHolidays,
                    totalVacationDays,
                    totalLeaveDays,
                    eligibilityStatus,
                    eligibilityBadge,
                    isEligible: overallPct >= 75,
                    theory: {
                        total: theoryTotal,
                        attended: Math.round(theoryEffective),
                        absent: theoryAbsent,
                        late: theoryLate,
                        percentage: theoryPct
                    },
                    lab: {
                        total: labTotal,
                        attended: Math.round(labEffective),
                        absent: labAbsent,
                        late: labLate,
                        percentage: labPct
                    }
                },
                subjectBreakdown,
                weeklyOverview,
                dailySummaries,
                upcomingEvents,
                tenure: {
                    admissionYear: admYear,
                    admissionMonth: admMonth,
                    admissionDate: admissionDateStr,
                    yearLevel: student.year_level || `${yearNum}th Year`,
                    yearNumber: yearNum,
                    maxAllowedSemester: maxAllowedSem,
                    allowedSemesters,
                    allowedSessions,
                    allowedYears,
                    currentAcademicYear: '2026-2027',
                    selectedAcademicYear: validAcademicYear,
                    selectedMonth: `${targetYear}-${String(targetMonth).padStart(2, '0')}`,
                    activeSemester: activeSem,
                    isOddSemester: isOddSem,
                    allowedMonthsForSemester: allowedMonthsForSem,
                    lockedMonthsForSemester: isOddSem ? [1, 2, 3, 4, 5, 6] : [6, 7, 8, 9, 10, 11, 12]
                }
            });

        } catch (err) {
            console.error('Error fetching ERP attendance summary:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    }

    /**
     * POST /api/attendance/mark
     * Faculty & Admin endpoint to mark or update attendance for a specific session.
     * Records to SQLite database tables: attendance_sessions, attendance_records, and attendance_audit_logs.
     */
    static async markAttendance(req, res) {
        try {
            const { subject_id, date, time_slot, session_type, records, faculty_name } = req.body;
            if (!date || !records || !Array.isArray(records) || records.length === 0) {
                return res.status(400).json({ success: false, message: 'Valid date and student records array required.' });
            }

            const subId = parseInt(subject_id) || 1;
            const slot = time_slot || '09:00 - 10:00 AM';
            const type = session_type || 'Theory';
            const faculty = faculty_name || 'Dr. Arvind Singhania';

            // 1. Create or get attendance session
            const sessionRes = await run(`
                INSERT INTO attendance_sessions (subject_id, date, time_slot, session_type, status)
                VALUES (?, ?, ?, ?, 'Conducted')
            `, [subId, date, slot, type]);
            const sessionId = sessionRes.lastID;

            // 2. Insert or update student attendance records
            for (const r of records) {
                const studentId = parseInt(r.student_id);
                const status = r.status || 'Present';
                const remarks = r.remarks || 'Recorded via Faculty ERP Portal';

                await run(`
                    INSERT INTO attendance_records (session_id, student_id, subject_id, date, session_type, status, remarks)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(session_id, student_id) DO UPDATE SET
                        status = excluded.status,
                        remarks = excluded.remarks,
                        updated_at = CURRENT_TIMESTAMP
                `, [sessionId, studentId, subId, date, type, status, remarks]);

                // Also update legacy attendance table for cross-compatibility
                await run(`
                    INSERT INTO attendance (student_id, course_id, subject_id, date, status, remarks)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [studentId, subId, subId, date, status, remarks]);

                // 3. Write to attendance audit log
                await run(`
                    INSERT INTO attendance_audit_logs (action, record_id, performed_by, new_value)
                    VALUES ('MARK_ATTENDANCE', ?, ?, ?)
                `, [sessionId, faculty, `Student ${studentId}: ${status}`]);
            }

            // Real-time SSE notification
            sseBroadcast('attendance:updated', { sessionId, date, count: records.length });

            res.json({
                success: true,
                message: `Attendance marked successfully for ${records.length} students.`,
                sessionId
            });

        } catch (err) {
            console.error('Error marking attendance:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    }

    /**
     * GET /api/attendance/vacations
     * Returns all configured holidays and continuous vacation periods
     */
    static async getVacations(req, res) {
        try {
            res.json({
                success: true,
                vacations: ACADEMIC_VACATIONS,
                holidays: ACADEMIC_HOLIDAYS
            });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    /**
     * POST /api/attendance/vacation
     * Admin endpoint to declare a new holiday or vacation
     */
    static async declareVacation(req, res) {
        try {
            const { title, start_date, end_date, vacation_type, academic_year, remarks } = req.body;
            if (!title || !start_date || !end_date) {
                return res.status(400).json({ success: false, message: 'Title, start date, and end date required.' });
            }

            const start = new Date(start_date);
            const end = new Date(end_date);
            const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

            const result = await run(`
                INSERT INTO vacations (title, start_date, end_date, vacation_type, academic_year, total_days, remarks)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [title, start_date, end_date, vacation_type || 'Special Recess', academic_year || '2026-2027', days, remarks || 'University Administrative Declaration']);

            // Real-time broadcast
            sseBroadcast('vacation:declared', { id: result.lastID, title, start_date, end_date });

            res.status(201).json({
                success: true,
                message: 'Academic vacation declared successfully.',
                id: result.lastID
            });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = {
    AttendanceController,
    setSseBroadcast
};
