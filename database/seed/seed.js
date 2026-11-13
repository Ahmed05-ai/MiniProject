/**
 * Deterministic Seeding Script for Smart Campus Management System
 * 
 * Generates EXACTLY 1,000 synthetic records across all 20 modules & 28 tables:
 *  1. departments:           8
 *  2. users:                88
 *  3. faculty:              20
 *  4. courses:              30
 *  5. students:             55
 *  6. subjects:             35
 *  7. enrollments:         165
 *  8. attendance:          155
 *  9. exams:                20
 * 10. results:              68
 * 11. fee_invoices:         55
 * 12. fee_payments:         40
 * 13. timetable:            25
 * 14. notices:              12
 * 15. library_books:        30
 * 16. library_issues:       25
 * 17. hostel_rooms:         15
 * 18. hostel_allocations:   20
 * 19. transport_routes:      6
 * 20. transport_allocations:18
 * 21. assignments:          20
 * 22. assignment_submissions: 20
 * 23. events:               10
 * 24. placements:           15
 * 25. internships:          10
 * 26. leaves:               15
 * 27. complaints:           10
 * 28. feedback:             10
 * ----------------------------
 * TOTAL:                 1,000 records
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { run, get, all, initializeSchema, DB_PATH } = require('../database');

// Mulberry32 PRNG for deterministic, reproducible generation
function mulberry32(seed) {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

const rng = mulberry32(20261104);

function pick(arr) {
    return arr[Math.floor(rng() * arr.length)];
}

function randInt(min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
}

// Convert dataset to CSV
function toCSV(headers, rows) {
    const escapeField = (val) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const headerLine = headers.join(',');
    const bodyLines = rows.map(row => headers.map(h => escapeField(row[h])).join(','));
    return [headerLine, ...bodyLines].join('\n');
}

async function seed(force = false) {
    console.log('🌱 Starting comprehensive database seeding (1,000 records target across 28 tables)...');
    
    const isForced = force || process.argv.indexOf('--force') !== -1;
    const existingCount = await get("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='students'");
    if (existingCount && existingCount.count > 0 && !isForced) {
        const studentCount = await get('SELECT COUNT(*) as count FROM students');
        if (studentCount && studentCount.count >= 55) {
            console.log(`ℹ️ Database already contains ${studentCount.count} students. Use --force to re-seed.`);
            return;
        }
    }

    if (isForced) {
        console.log('🧹 Dropping existing tables for clean schema upgrade...');
        await run('PRAGMA foreign_keys = OFF;');
        const oldTables = await all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        for (const t of oldTables) {
            await run(`DROP TABLE IF EXISTS ${t.name};`);
        }
        await run('PRAGMA foreign_keys = ON;');
    }

    // Ensure clean schema
    await initializeSchema();

    console.log('🧹 Clearing old tables for fresh deterministic generation...');
    const allTableNames = [
        'feedback', 'complaints', 'leaves', 'internships', 'placements',
        'events', 'assignment_submissions', 'assignments',
        'transport_allocations', 'transport_routes',
        'hostel_allocations', 'hostel_rooms',
        'library_issues', 'library_books',
        'notices', 'timetable', 'fee_payments', 'fee_invoices',
        'results', 'exams', 'attendance', 'enrollments',
        'subjects', 'students', 'courses', 'faculty', 'users', 'departments'
    ];

    for (const tbl of allTableNames) {
        try {
            await run(`DELETE FROM ${tbl};`);
            await run(`DELETE FROM sqlite_sequence WHERE name='${tbl}';`);
        } catch (e) {
            // Ignore if table was empty
        }
    }

    const counts = {};

    // ------------------------------------------------------------------------
    // 1. DEPARTMENTS (8 records)
    // ------------------------------------------------------------------------
    const departmentsData = [
        { code: 'CSE', name: 'Computer Science & Engineering', description: 'Computing, Software Systems, AI & Cybersecurity' },
        { code: 'ECE', name: 'Electronics & Communication', description: 'VLSI, Embedded Systems, IoT & Telecommunication' },
        { code: 'ME', name: 'Mechanical Engineering', description: 'Robotics, Thermal Engineering & Advanced Manufacturing' },
        { code: 'CE', name: 'Civil Engineering', description: 'Structural Engineering, Urban Planning & Smart Infrastructure' },
        { code: 'EE', name: 'Electrical Engineering', description: 'Power Grids, Renewable Energy & Control Systems' },
        { code: 'IT', name: 'Information Technology', description: 'Cloud Computing, Enterprise Networks & Data Engineering' },
        { code: 'BT', name: 'Biotechnology & Bioinformatics', description: 'Genetic Engineering, Bioprocessing & Health Informatics' },
        { code: 'MBA', name: 'Management Studies', description: 'Finance, Marketing, Operations & Strategic Management' }
    ];

    for (const d of departmentsData) {
        await run('INSERT INTO departments (code, name, description) VALUES (?, ?, ?)', [d.code, d.name, d.description]);
    }
    counts.departments = departmentsData.length; // 8

    // ------------------------------------------------------------------------
    // 2. USERS (88 records)
    // 1 Super Admin, 3 Admins, 20 Faculty, 55 Students, 3 Accountants, 3 Librarians, 3 Wardens
    // Pre-hash common passwords for security & instant performance
    // ------------------------------------------------------------------------
    const adminHash = bcrypt.hashSync('admin123', 8);
    const studentHash = bcrypt.hashSync('student123', 8);
    const staffHash = bcrypt.hashSync('campus123', 8);

    const usersToInsert = [];

    // Super Admin & Admins (4)
    usersToInsert.push({ name: 'System Super Administrator', email: 'superadmin@campus.edu', password: adminHash, role: 'super_admin' });
    usersToInsert.push({ name: 'Academic Administrator', email: 'admin@campus.edu', password: adminHash, role: 'admin' });
    usersToInsert.push({ name: 'Examinations Officer', email: 'exam.admin@campus.edu', password: adminHash, role: 'admin' });
    usersToInsert.push({ name: 'Registrar Office', email: 'registrar@campus.edu', password: adminHash, role: 'admin' });

    // Faculty Users (20)
    const facultyNames = [
        { name: 'Dr. Arvind Singhania', dept: 1, desig: 'Professor & HOD' },
        { name: 'Dr. Sunita Sharma', dept: 1, desig: 'Associate Professor' },
        { name: 'Prof. Rajesh Nair', dept: 1, desig: 'Assistant Professor' },
        { name: 'Dr. Vikram Seth', dept: 2, desig: 'Professor & HOD' },
        { name: 'Dr. Priya Desai', dept: 2, desig: 'Associate Professor' },
        { name: 'Prof. Ananya Sen', dept: 2, desig: 'Assistant Professor' },
        { name: 'Dr. Manoj Tiwari', dept: 3, desig: 'Professor & HOD' },
        { name: 'Dr. Harish Patel', dept: 3, desig: 'Associate Professor' },
        { name: 'Prof. Suresh Kumar', dept: 4, desig: 'Professor & HOD' },
        { name: 'Dr. Meena Iyer', dept: 4, desig: 'Associate Professor' },
        { name: 'Dr. Ramesh Chandra', dept: 5, desig: 'Professor & HOD' },
        { name: 'Prof. Alok Verma', dept: 5, desig: 'Assistant Professor' },
        { name: 'Dr. Geeta Pillai', dept: 6, desig: 'Professor & HOD' },
        { name: 'Prof. Sanjay Rathore', dept: 6, desig: 'Assistant Professor' },
        { name: 'Dr. Kavita Menon', dept: 7, desig: 'Professor & HOD' },
        { name: 'Prof. Deepak Joshi', dept: 7, desig: 'Associate Professor' },
        { name: 'Dr. Sandeep Kulkarni', dept: 8, desig: 'Professor & Dean' },
        { name: 'Prof. Ritu Kapoor', dept: 8, desig: 'Associate Professor' },
        { name: 'Dr. Manish Pandey', dept: 1, desig: 'Assistant Professor' },
        { name: 'Prof. Swati Mukherjee', dept: 2, desig: 'Assistant Professor' }
    ];

    for (let i = 0; i < facultyNames.length; i++) {
        const f = facultyNames[i];
        const email = f.name.toLowerCase().replace(/[^a-z]/g, '.').replace(/\.+/g, '.') + '@faculty.campus.edu';
        usersToInsert.push({ name: f.name, email, password: staffHash, role: 'faculty' });
    }

    // Student Names Pool (55 realistic Indian names)
    const firstNames = [
        'Rahul', 'Priya', 'Aarav', 'Ananya', 'Rohan', 'Sneha', 'Aditya', 'Kavya', 'Vikram', 'Neha',
        'Ishaan', 'Tanvi', 'Aryan', 'Pooja', 'Dhruv', 'Riya', 'Arjun', 'Shreya', 'Kunal', 'Divya',
        'Varun', 'Meera', 'Nikhil', 'Simran', 'Ayush', 'Isha', 'Siddharth', 'Aditi', 'Gaurav', 'Bhavna',
        'Abhishek', 'Swati', 'Harsh', 'Preeti', 'Pranav', 'Rashmi', 'Karan', 'Deepika', 'Akash', 'Shruti',
        'Manish', 'Komal', 'Mohit', 'Pallavi', 'Yash', 'Anjali', 'Mayank', 'Ritu', 'Sourabh', 'Nisha',
        'Vivek', 'Sakshi', 'Tarun', 'Vandana', 'Chirag'
    ];
    const lastNames = [
        'Sharma', 'Verma', 'Patel', 'Iyer', 'Gupta', 'Reddy', 'Joshi', 'Nair', 'Singh', 'Deshmukh',
        'Chopra', 'Malhotra', 'Bhat', 'Rao', 'Mukherjee', 'Mehta', 'Kulkarni', 'Kapoor', 'Pandey', 'Saxena',
        'Bose', 'Mishra', 'Agarwal', 'Chatterjee', 'Dubey', 'Soni', 'Tripathi', 'Trivedi', 'Yadav', 'Gowda'
    ];

    const studentList = [];
    for (let i = 0; i < 55; i++) {
        const isFirst = (i === 0);
        const fn = isFirst ? 'Rahul' : firstNames[i];
        const ln = isFirst ? 'Sharma' : lastNames[i % lastNames.length];
        const fullName = `${fn} ${ln}`;
        const email = isFirst ? 'rahul@campus.edu' : `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@campus.edu`;
        usersToInsert.push({ name: fullName, email, password: studentHash, role: 'student' });
        studentList.push({ fn, ln, fullName, email, index: i });
    }

    // Accountants (3)
    usersToInsert.push({ name: 'Chief Accounts Officer', email: 'accounts@campus.edu', password: staffHash, role: 'accountant' });
    usersToInsert.push({ name: 'Finance Executive 1', email: 'fees1@campus.edu', password: staffHash, role: 'accountant' });
    usersToInsert.push({ name: 'Finance Executive 2', email: 'fees2@campus.edu', password: staffHash, role: 'accountant' });

    // Librarians (3)
    usersToInsert.push({ name: 'Head Librarian', email: 'librarian@campus.edu', password: staffHash, role: 'librarian' });
    usersToInsert.push({ name: 'Assistant Librarian A', email: 'lib.assistant1@campus.edu', password: staffHash, role: 'librarian' });
    usersToInsert.push({ name: 'Assistant Librarian B', email: 'lib.assistant2@campus.edu', password: staffHash, role: 'librarian' });

    // Hostel Wardens (3)
    usersToInsert.push({ name: 'Chief Hostel Warden', email: 'warden.chief@campus.edu', password: staffHash, role: 'hostel_warden' });
    usersToInsert.push({ name: 'Boys Hostel Warden', email: 'warden.boys@campus.edu', password: staffHash, role: 'hostel_warden' });
    usersToInsert.push({ name: 'Girls Hostel Warden', email: 'warden.girls@campus.edu', password: staffHash, role: 'hostel_warden' });

    for (const u of usersToInsert) {
        await run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [u.name, u.email, u.password, u.role]);
    }
    counts.users = usersToInsert.length; // 88

    // ------------------------------------------------------------------------
    // 3. FACULTY (20 records)
    // ------------------------------------------------------------------------
    const facultyUserRows = await all("SELECT id, name FROM users WHERE role='faculty' ORDER BY id ASC");
    for (let i = 0; i < facultyUserRows.length; i++) {
        const u = facultyUserRows[i];
        const fMeta = facultyNames[i];
        const empId = `FAC${String(i + 1).padStart(3, '0')}`;
        const phone = `+91 98${randInt(10, 99)} ${randInt(10000, 99999)}`;
        await run(
            'INSERT INTO faculty (user_id, employee_id, department_id, designation, phone) VALUES (?, ?, ?, ?, ?)',
            [u.id, empId, fMeta.dept, fMeta.desig, phone]
        );
    }
    counts.faculty = facultyUserRows.length; // 20

    // ------------------------------------------------------------------------
    // 4. COURSES (30 records)
    // ------------------------------------------------------------------------
    const coursesData = [
        // CSE (1)
        { code: 'CS101', title: 'Programming & Problem Solving', credits: 4, dept: 1, fac: 1, sem: 1 },
        { code: 'CS102', title: 'Data Structures & Algorithms', credits: 4, dept: 1, fac: 2, sem: 2 },
        { code: 'CS201', title: 'Database Management Systems', credits: 4, dept: 1, fac: 3, sem: 3 },
        { code: 'CS202', title: 'Computer Networks & Security', credits: 3, dept: 1, fac: 1, sem: 4 },
        { code: 'CS301', title: 'Artificial Intelligence & ML', credits: 4, dept: 1, fac: 2, sem: 5 },
        { code: 'CS401', title: 'Cloud Infrastructure & DevOps', credits: 3, dept: 1, fac: 3, sem: 7 },
        // ECE (2)
        { code: 'EC101', title: 'Digital Electronics & Logic Design', credits: 4, dept: 2, fac: 4, sem: 1 },
        { code: 'EC102', title: 'Signals and Systems', credits: 3, dept: 2, fac: 5, sem: 2 },
        { code: 'EC201', title: 'Microprocessors & Microcontrollers', credits: 4, dept: 2, fac: 6, sem: 3 },
        { code: 'EC301', title: 'VLSI Circuit Design', credits: 4, dept: 2, fac: 4, sem: 5 },
        // ME (3)
        { code: 'ME101', title: 'Engineering Mechanics', credits: 4, dept: 3, fac: 7, sem: 1 },
        { code: 'ME102', title: 'Thermodynamics & Heat Transfer', credits: 4, dept: 3, fac: 8, sem: 2 },
        { code: 'ME201', title: 'Fluid Mechanics & Machinery', credits: 3, dept: 3, fac: 7, sem: 3 },
        { code: 'ME301', title: 'Robotics & Automation', credits: 4, dept: 3, fac: 8, sem: 5 },
        // CE (4)
        { code: 'CE101', title: 'Surveying & Geomatics', credits: 3, dept: 4, fac: 9, sem: 1 },
        { code: 'CE102', title: 'Structural Analysis', credits: 4, dept: 4, fac: 10, sem: 2 },
        { code: 'CE201', title: 'Concrete Technology', credits: 3, dept: 4, fac: 9, sem: 3 },
        { code: 'CE301', title: 'Environmental Engineering', credits: 3, dept: 4, fac: 10, sem: 5 },
        // EE (5)
        { code: 'EE101', title: 'Electrical Circuits & Networks', credits: 4, dept: 5, fac: 11, sem: 1 },
        { code: 'EE102', title: 'Electrical Machines', credits: 4, dept: 5, fac: 12, sem: 2 },
        { code: 'EE201', title: 'Power System Engineering', credits: 4, dept: 5, fac: 11, sem: 3 },
        { code: 'EE301', title: 'Control Systems Engineering', credits: 3, dept: 5, fac: 12, sem: 5 },
        // IT (6)
        { code: 'IT101', title: 'Web Application Development', credits: 4, dept: 6, fac: 13, sem: 1 },
        { code: 'IT201', title: 'Information & Cyber Security', credits: 3, dept: 6, fac: 14, sem: 3 },
        { code: 'IT301', title: 'Big Data Engineering', credits: 4, dept: 6, fac: 13, sem: 5 },
        // BT (7)
        { code: 'BT101', title: 'Cell Biology & Genetics', credits: 4, dept: 7, fac: 15, sem: 1 },
        { code: 'BT201', title: 'Bioprocess Engineering', credits: 4, dept: 7, fac: 16, sem: 3 },
        { code: 'BT301', title: 'Bioinformatics & Computational Bio', credits: 3, dept: 7, fac: 15, sem: 5 },
        // MBA (8)
        { code: 'MB101', title: 'Principles of Management & OB', credits: 3, dept: 8, fac: 17, sem: 1 },
        { code: 'MB201', title: 'Financial Management & Analytics', credits: 4, dept: 8, fac: 18, sem: 3 }
    ];

    for (const c of coursesData) {
        await run(
            'INSERT INTO courses (code, title, credits, department_id, faculty_id, semester, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [c.code, c.title, c.credits, c.dept, c.fac, c.sem, `Comprehensive curriculum for ${c.title}`]
        );
    }
    counts.courses = coursesData.length; // 30

    // ------------------------------------------------------------------------
    // 5. STUDENTS (55 records)
    // ------------------------------------------------------------------------
    const studentUserRows = await all("SELECT id, name, email FROM users WHERE role='student' ORDER BY id ASC");
    const cities = ['New Delhi', 'Noida', 'Gurugram', 'Jaipur', 'Mumbai', 'Pune', 'Bengaluru', 'Hyderabad', 'Lucknow', 'Chandigarh'];
    const states = ['Delhi', 'Uttar Pradesh', 'Haryana', 'Rajasthan', 'Maharashtra', 'Maharashtra', 'Karnataka', 'Telangana', 'Uttar Pradesh', 'Punjab'];

    for (let i = 0; i < studentUserRows.length; i++) {
        const u = studentUserRows[i];
        const sMeta = studentList[i];
        const isFirst = (i === 0);
        
        const enrollmentNo = isFirst ? 'CS2025001' : `SPSU2026${String(i + 1).padStart(3, '0')}`;
        const deptId = isFirst ? 1 : ((i % 8) + 1);
        const courseId = isFirst ? 1 : ((i % 30) + 1);
        const sem = isFirst ? 1 : ((i % 8) + 1);
        const yearLevel = sem <= 2 ? '1st Year' : (sem <= 4 ? '2nd Year' : (sem <= 6 ? '3rd Year' : '4th Year'));
        const femaleFirstNames = new Set([
            'Priya', 'Ananya', 'Sneha', 'Kavya', 'Neha', 'Tanvi', 'Pooja', 'Riya',
            'Shreya', 'Divya', 'Meera', 'Simran', 'Isha', 'Aditi', 'Bhavna', 'Swati',
            'Preeti', 'Rashmi', 'Deepika', 'Shruti', 'Komal', 'Pallavi', 'Anjali',
            'Ritu', 'Nisha', 'Sakshi', 'Vandana'
        ]);
        const gender = femaleFirstNames.has(sMeta.fn) ? 'Female' : 'Male';
        const dobYear = 2007 - Math.floor((sem - 1) / 2);
        const dob = `${dobYear}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(10, 28)).padStart(2, '0')}`;
        const phone = `+91 9${randInt(100, 999)} ${randInt(10000, 99999)}`;
        const cityIndex = i % cities.length;
        const city = cities[cityIndex];
        const state = states[cityIndex];
        const address = `${randInt(10, 99)}, Sector ${randInt(1, 62)}, ${city}`;
        const guardianName = gender === 'Female' ? `Mr. R. K. ${sMeta.ln}` : `Mr. S. ${sMeta.ln}`;
        const guardianPhone = `+91 98${randInt(10, 99)} ${randInt(10000, 99999)}`;
        const status = (i === 53) ? 'Graduated' : ((i === 54) ? 'Inactive' : 'Active');
        const femaleImg = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256';
        const maleImg = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256';
        const profileImage = gender === 'Female' ? femaleImg : maleImg;

        const admissionYear = 2026 - Math.floor((sem - 1) / 2);
        const admissionDate = `${admissionYear}-07-15`;
        const academicYearStr = `${admissionYear}-${admissionYear + 1}`;

        await run(`
            INSERT INTO students (
                user_id, enrollment_no, first_name, last_name, full_name, email, phone, dob, gender,
                department_id, course_id, current_semester, academic_year, year_level, section,
                admission_date, address, city, state, guardian_name, guardian_phone, profile_image, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            u.id, enrollmentNo, sMeta.fn, sMeta.ln, sMeta.fullName, u.email, phone, dob, gender,
            deptId, courseId, sem, academicYearStr, yearLevel, (i % 2 === 0 ? 'A' : 'B'),
            admissionDate, address, city, state, guardianName, guardianPhone, profileImage, status
        ]);
    }
    counts.students = studentUserRows.length; // 55

    // ------------------------------------------------------------------------
    // 6. SUBJECTS (35 records)
    // ------------------------------------------------------------------------
    const subjectsData = [
        { code: 'SUB-CS101', name: 'Computer Programming Laboratory', credits: 2, course: 1, dept: 1, fac: 1, sem: 1 },
        { code: 'SUB-CS102', name: 'Discrete Mathematical Structures', credits: 4, course: 1, dept: 1, fac: 2, sem: 1 },
        { code: 'SUB-CS103', name: 'Object-Oriented Programming (Java)', credits: 4, course: 2, dept: 1, fac: 3, sem: 2 },
        { code: 'SUB-CS104', name: 'Data Structures Lab', credits: 2, course: 2, dept: 1, fac: 2, sem: 2 },
        { code: 'SUB-CS201', name: 'Relational Database Design', credits: 3, course: 3, dept: 1, fac: 3, sem: 3 },
        { code: 'SUB-CS202', name: 'DBMS Practice & SQL Lab', credits: 2, course: 3, dept: 1, fac: 1, sem: 3 },
        { code: 'SUB-CS203', name: 'Operating System Internals', credits: 4, course: 4, dept: 1, fac: 2, sem: 4 },
        { code: 'SUB-CS204', name: 'Cryptography & Network Security', credits: 3, course: 4, dept: 1, fac: 3, sem: 4 },
        { code: 'SUB-CS301', name: 'Deep Learning & Neural Networks', credits: 4, course: 5, dept: 1, fac: 19, sem: 5 },
        { code: 'SUB-CS302', name: 'Natural Language Processing', credits: 3, course: 5, dept: 1, fac: 2, sem: 5 },
        { code: 'SUB-EC101', name: 'Analog Circuit Analysis', credits: 4, course: 7, dept: 2, fac: 4, sem: 1 },
        { code: 'SUB-EC102', name: 'Digital Logic Lab', credits: 2, course: 7, dept: 2, fac: 5, sem: 1 },
        { code: 'SUB-EC201', name: 'Embedded C & ARM Processors', credits: 4, course: 9, dept: 2, fac: 6, sem: 3 },
        { code: 'SUB-EC202', name: 'IoT Systems & Sensors Lab', credits: 2, course: 9, dept: 2, fac: 20, sem: 3 },
        { code: 'SUB-EC301', name: 'FPGA Prototyping & Verilog', credits: 4, course: 10, dept: 2, fac: 4, sem: 5 },
        { code: 'SUB-ME101', name: 'Engineering Drawing & CAD', credits: 3, course: 11, dept: 3, fac: 7, sem: 1 },
        { code: 'SUB-ME102', name: 'Workshop Manufacturing Practice', credits: 2, course: 11, dept: 3, fac: 8, sem: 1 },
        { code: 'SUB-ME201', name: 'Kinematics & Dynamics of Machines', credits: 4, course: 13, dept: 3, fac: 7, sem: 3 },
        { code: 'SUB-ME301', name: 'Industrial Robotics & Mechatronics', credits: 4, course: 14, dept: 3, fac: 8, sem: 5 },
        { code: 'SUB-CE101', name: 'Building Materials & Construction', credits: 3, course: 15, dept: 4, fac: 9, sem: 1 },
        { code: 'SUB-CE201', name: 'Geotechnical Soil Mechanics', credits: 4, course: 17, dept: 4, fac: 10, sem: 3 },
        { code: 'SUB-CE301', name: 'Hydrology & Water Resources', credits: 3, course: 18, dept: 4, fac: 9, sem: 5 },
        { code: 'SUB-EE101', name: 'Network Analysis & Synthesis', credits: 4, course: 19, dept: 5, fac: 11, sem: 1 },
        { code: 'SUB-EE201', name: 'Power Transmission & Distribution', credits: 4, course: 21, dept: 5, fac: 12, sem: 3 },
        { code: 'SUB-EE301', name: 'Renewable Solar & Wind Systems', credits: 3, course: 22, dept: 5, fac: 11, sem: 5 },
        { code: 'SUB-IT101', name: 'Frontend Architecture with React', credits: 4, course: 23, dept: 6, fac: 13, sem: 1 },
        { code: 'SUB-IT102', name: 'Full-Stack Node.js & REST APIs', credits: 4, course: 23, dept: 6, fac: 14, sem: 1 },
        { code: 'SUB-IT201', name: 'Ethical Hacking & Penetration Testing', credits: 3, course: 24, dept: 6, fac: 13, sem: 3 },
        { code: 'SUB-IT301', name: 'Distributed Systems & Spark', credits: 4, course: 25, dept: 6, fac: 14, sem: 5 },
        { code: 'SUB-BT101', name: 'Biochemistry & Molecular Biology', credits: 4, course: 26, dept: 7, fac: 15, sem: 1 },
        { code: 'SUB-BT201', name: 'Immunology & Diagnostics', credits: 3, course: 27, dept: 7, fac: 16, sem: 3 },
        { code: 'SUB-BT301', name: 'Genomics & Proteomics', credits: 4, course: 28, dept: 7, fac: 15, sem: 5 },
        { code: 'SUB-MB101', name: 'Managerial Economics', credits: 3, course: 29, dept: 8, fac: 17, sem: 1 },
        { code: 'SUB-MB102', name: 'Marketing Management & Digital Strategy', credits: 4, course: 29, dept: 8, fac: 18, sem: 1 },
        { code: 'SUB-MB201', name: 'Corporate Finance & Investment', credits: 4, course: 30, dept: 8, fac: 17, sem: 3 }
    ];

    for (const sub of subjectsData) {
        await run(`
            INSERT INTO subjects (code, name, credits, course_id, department_id, faculty_id, semester)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [sub.code, sub.name, sub.credits, sub.course, sub.dept, sub.fac, sub.sem]);
    }
    counts.subjects = subjectsData.length; // 35

    // ------------------------------------------------------------------------
    // 7. ENROLLMENTS (165 records - 3 courses per student: 55 * 3 = 165)
    // ------------------------------------------------------------------------
    let enrollmentCounter = 0;
    const studentRows = await all('SELECT id, department_id, current_semester FROM students ORDER BY id ASC');
    const courseRows = await all('SELECT id, department_id FROM courses ORDER BY id ASC');

    for (const s of studentRows) {
        // Find courses for this department or fallback
        const deptCourses = courseRows.filter(c => c.department_id === s.department_id);
        const selectedCourses = [];
        
        // Take dept courses first
        for (const dc of deptCourses) {
            if (selectedCourses.length < 3) selectedCourses.push(dc.id);
        }
        // Fill remaining with other courses if needed
        for (const ac of courseRows) {
            if (selectedCourses.length < 3 && !selectedCourses.includes(ac.id)) {
                selectedCourses.push(ac.id);
            }
        }

        for (const cid of selectedCourses) {
            await run(`
                INSERT INTO enrollments (student_id, course_id, academic_year, semester, status)
                VALUES (?, ?, '2025-2026', ?, 'Enrolled')
            `, [s.id, cid, s.current_semester]);
            enrollmentCounter++;
        }
    }
    counts.enrollments = enrollmentCounter; // 165

    // ------------------------------------------------------------------------
    // 8. ATTENDANCE (155 records)
    // ------------------------------------------------------------------------
    const enrollmentRows = await all('SELECT id, student_id, course_id FROM enrollments ORDER BY id ASC');
    let attendanceCounter = 0;

    // Student 1 (Rahul) gets exactly 20 attendance records in October 2026: 17 Present, 2 Absent, 1 Late = 85% attendance
    const rahulEnrollments = enrollmentRows.filter(e => e.student_id === 1);
    for (let day = 1; day <= 20; day++) {
        const enr = rahulEnrollments[day % rahulEnrollments.length];
        const date = `2026-10-${String(day + 1).padStart(2, '0')}`;
        let status = 'Present';
        if (day === 8 || day === 15) status = 'Absent';
        if (day === 12) status = 'Late';

        await run(`
            INSERT INTO attendance (enrollment_id, student_id, course_id, subject_id, date, status, remarks)
            VALUES (?, 1, ?, 1, ?, ?, ?)
        `, [enr.id, enr.course_id, date, status, status === 'Late' ? 'Traffic delay' : '-']);
        attendanceCounter++;
    }

    // Remaining 135 attendance records distributed across other students in October 2026
    for (let i = 21; i <= 155; i++) {
        const enr = enrollmentRows[i % enrollmentRows.length];
        const day = (i % 25) + 1;
        const date = `2026-10-${String(day).padStart(2, '0')}`;
        const roll = rng();
        const status = roll < 0.85 ? 'Present' : (roll < 0.95 ? 'Absent' : 'Late');
        const subjectId = (i % 35) + 1;

        await run(`
            INSERT INTO attendance (enrollment_id, student_id, course_id, subject_id, date, status, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [enr.id, enr.student_id, enr.course_id, subjectId, date, status, '-']);
        attendanceCounter++;
    }
    counts.attendance = attendanceCounter; // 155

    // ------------------------------------------------------------------------
    // 9. EXAMS (20 records)
    // ------------------------------------------------------------------------
    const examTypes = ['Midterm', 'Final', 'Quiz', 'Assignment'];
    for (let i = 1; i <= 20; i++) {
        const cid = ((i - 1) % 15) + 1;
        const subId = ((i - 1) % 25) + 1;
        const eType = examTypes[(i - 1) % 4];
        const maxM = eType === 'Quiz' ? 25 : (eType === 'Assignment' ? 50 : 100);
        const examDate = `2026-04-${String((i % 20) + 10).padStart(2, '0')}`;
        const title = `${eType} Examination - Course CS/ENG-${cid}`;

        await run(`
            INSERT INTO exams (course_id, subject_id, title, exam_type, max_marks, exam_date, semester)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [cid, subId, title, eType, maxM, examDate, ((i % 4) + 1)]);
    }
    counts.exams = 20;

    // ------------------------------------------------------------------------
    // 10. RESULTS (68 records)
    // ------------------------------------------------------------------------
    // Rahul (student 1) gets 6 records matching high CGPA (~8.38)
    const rahulMarks = [
        { exam: 1, marks: 92, grade: 'A+', gp: 10.0, rem: 'Outstanding' },
        { exam: 2, marks: 85, grade: 'A', gp: 9.0, rem: 'Excellent' },
        { exam: 3, marks: 84, grade: 'A', gp: 9.0, rem: 'Very Good' },
        { exam: 4, marks: 90, grade: 'A+', gp: 10.0, rem: 'Top Performer' },
        { exam: 5, marks: 82, grade: 'A', gp: 9.0, rem: 'Consistent' },
        { exam: 6, marks: 74, grade: 'B+', gp: 8.0, rem: 'Good' }
    ];

    let resultCounter = 0;
    for (const rm of rahulMarks) {
        await run(`
            INSERT INTO results (exam_id, student_id, enrollment_id, marks_obtained, grade, grade_point, remarks)
            VALUES (?, 1, 1, ?, ?, ?, ?)
        `, [rm.exam, rm.marks, rm.grade, rm.gp, rm.rem]);
        resultCounter++;
    }

    // 62 more results for other students
    const gradePool = [
        { grade: 'A+', gp: 10.0, min: 90, max: 98 },
        { grade: 'A', gp: 9.0, min: 80, max: 89 },
        { grade: 'B+', gp: 8.0, min: 70, max: 79 },
        { grade: 'B', gp: 7.0, min: 60, max: 69 },
        { grade: 'C', gp: 6.0, min: 50, max: 59 }
    ];

    for (let i = 7; i <= 68; i++) {
        const studentId = ((i % 30) + 2); // students 2..31
        const examId = ((i % 14) + 7); // exams 7..20
        const gpObj = gradePool[i % gradePool.length];
        const marks = randInt(gpObj.min, gpObj.max);

        // Check uniqueness for (exam_id, student_id)
        const exists = await get('SELECT id FROM results WHERE exam_id=? AND student_id=?', [examId, studentId]);
        if (!exists) {
            await run(`
                INSERT INTO results (exam_id, student_id, enrollment_id, marks_obtained, grade, grade_point, remarks)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [examId, studentId, studentId, marks, gpObj.grade, gpObj.gp, 'Academic Assessment']);
            resultCounter++;
        }
    }
    // Fill up to exactly 68 if any skipped due to unique constraint
    let fillStudent = 32;
    while (resultCounter < 68) {
        const examId = (resultCounter % 20) + 1;
        const exists = await get('SELECT id FROM results WHERE exam_id=? AND student_id=?', [examId, fillStudent]);
        if (!exists) {
            await run(`
                INSERT INTO results (exam_id, student_id, enrollment_id, marks_obtained, grade, grade_point, remarks)
                VALUES (?, ?, ?, 85, 'A', 9.0, 'Regular Evaluation')
            `, [examId, fillStudent, fillStudent]);
            resultCounter++;
        }
        fillStudent++;
    }
    counts.results = resultCounter; // 68

    // ------------------------------------------------------------------------
    // 11. FEE INVOICES (55 records - 1 per student)
    // ------------------------------------------------------------------------
    for (let i = 1; i <= 55; i++) {
        const invNum = `INV-2026-${String(i).padStart(3, '0')}`;
        const amount = 53500.00; // Tuition ₹45,000 + Lab/Dev ₹8,500
        const status = (i <= 35) ? 'Paid' : (i <= 45 ? 'Partial' : 'Unpaid');
        const dueDate = '2026-05-15';

        await run(`
            INSERT INTO fee_invoices (invoice_number, student_id, academic_year, semester, description, amount, due_date, status)
            VALUES (?, ?, '2025-2026', 1, 'Semester Academic Tuition & Campus Services Fee', ?, ?, ?)
        `, [invNum, i, amount, dueDate, status]);
    }
    counts.fee_invoices = 55;

    // ------------------------------------------------------------------------
    // 12. FEE PAYMENTS (40 records)
    // ------------------------------------------------------------------------
    const paymentMethods = ['UPI', 'NetBanking', 'Card', 'Cheque'];
    for (let i = 1; i <= 40; i++) {
        const payNum = `PAY-2026-${String(i).padStart(4, '0')}`;
        const invId = i;
        const studentId = i;
        const amountPaid = (i <= 35) ? 53500.00 : 25000.00;
        const method = paymentMethods[i % paymentMethods.length];
        const payDate = `2026-02-${String((i % 25) + 1).padStart(2, '0')}`;
        const txRef = `TXN${randInt(10000000, 99999999)}`;

        await run(`
            INSERT INTO fee_payments (payment_number, invoice_id, student_id, amount_paid, payment_date, payment_method, transaction_ref, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Official payment acknowledgment via portal')
        `, [payNum, invId, studentId, amountPaid, payDate, method, txRef]);
    }
    counts.fee_payments = 40;

    // ------------------------------------------------------------------------
    // 13. TIMETABLE (25 records)
    // ------------------------------------------------------------------------
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
        { start: '09:00', end: '10:00' },
        { start: '10:15', end: '11:15' },
        { start: '11:30', end: '12:30' },
        { start: '13:30', end: '14:30' },
        { start: '14:45', end: '15:45' }
    ];

    for (let i = 1; i <= 25; i++) {
        const cid = ((i - 1) % 15) + 1;
        const subId = ((i - 1) % 25) + 1;
        const facId = ((i - 1) % 20) + 1;
        const deptId = ((i - 1) % 8) + 1;
        const day = days[(i - 1) % 5];
        const slot = timeSlots[Math.floor((i - 1) / 5)];
        const room = `Lecture Hall ${String.fromCharCode(65 + (i % 4))}-${randInt(101, 305)}`;

        await run(`
            INSERT INTO timetable (course_id, subject_id, faculty_id, department_id, day_of_week, start_time, end_time, room_number, semester)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [cid, subId, facId, deptId, day, slot.start, slot.end, room, ((i % 4) + 1)]);
    }
    counts.timetable = 25;

    // ------------------------------------------------------------------------
    // 14. NOTICES (12 records)
    // ------------------------------------------------------------------------
    const noticesData = [
        { title: 'Academic Calendar Spring 2026 Released', cat: 'Academic', date: '2026-01-10', pin: 1, author: 1, body: 'The university senate has officially published the Spring 2026 academic calendar. Midterms begin April 10.' },
        { title: 'Midterm Examination Schedule & Seating Plan', cat: 'Academic', date: '2026-03-01', pin: 1, author: 2, body: 'All students are advised to check the examination portal for individual hall tickets and assigned seating halls.' },
        { title: 'Annual Techfest - Innovate 2026 Call for Entries', cat: 'Event', date: '2026-02-15', pin: 1, author: 1, body: 'Registrations are now live for hackathons, robotics challenges, and paper presentations at Innovate 2026.' },
        { title: 'Campus Placement Drive: Google India & Microsoft', cat: 'Placement', date: '2026-02-20', pin: 0, author: 3, body: 'Final year and pre-final year students eligible for cloud engineering profiles are requested to upload resumes.' },
        { title: 'Library Extended Hours During Examination Week', cat: 'Library', date: '2026-03-05', pin: 0, author: 1, body: 'The central digital library will remain open 24x7 starting next Monday to facilitate exam revision.' },
        { title: 'Fee Payment Deadline for Semester 2', cat: 'Fees', date: '2026-02-28', pin: 0, author: 1, body: 'Late fee charges of ₹500 will apply to tuition payments received after May 15, 2026.' },
        { title: 'Hostel Maintenance & Wi-Fi Upgrade Notice', cat: 'Hostel', date: '2026-02-12', pin: 0, author: 4, body: 'High-speed Wi-Fi 6 access points are being configured across Aryabhata and Sarojini hostels.' },
        { title: 'Inter-Departmental Cricket & Football Tournament', cat: 'Sports', date: '2026-02-18', pin: 0, author: 1, body: 'Teams are invited to register at the student sports council office by February 25.' },
        { title: 'Workshop on Generative AI & Cloud Kubernetes', cat: 'Workshop', date: '2026-02-22', pin: 0, author: 2, body: 'Hands-on practical session hosted by Department of Computer Science & Engineering.' },
        { title: 'Bus Route R-04 Timing Revision Notice', cat: 'Transport', date: '2026-02-25', pin: 0, author: 4, body: 'Morning departure from Noida Sector 62 is preponed by 15 minutes due to expressway roadwork.' },
        { title: 'Blood Donation & Free Medical Checkup Camp', cat: 'Event', date: '2026-03-02', pin: 0, author: 1, body: 'Organized jointly with Red Cross Society at the Campus Health Center.' },
        { title: 'Summer Internship Applications Guidelines', cat: 'Placement', date: '2026-03-04', pin: 0, author: 3, body: 'Corporate internship guidelines for 2nd and 3rd year students are now available on the portal.' }
    ];

    for (const n of noticesData) {
        await run(`
            INSERT INTO notices (title, content, published_by, author_user_id, category, publish_date, is_pinned)
            VALUES (?, ?, 'Administration Office', ?, ?, ?, ?)
        `, [n.title, n.body, n.author, n.cat, n.date, n.pin]);
    }
    counts.notices = noticesData.length; // 12

    // ------------------------------------------------------------------------
    // 15. LIBRARY BOOKS (30 records)
    // ------------------------------------------------------------------------
    const booksData = [
        { isbn: '978-0131103627', title: 'The C Programming Language', author: 'Brian Kernighan & Dennis Ritchie', cat: 'Computer Science', total: 10, avail: 8 },
        { isbn: '978-0262033848', title: 'Introduction to Algorithms (CLRS)', author: 'Thomas H. Cormen et al.', cat: 'Computer Science', total: 12, avail: 9 },
        { isbn: '978-0132350884', title: 'Clean Code: A Handbook of Agile Craftsmanship', author: 'Robert C. Martin', cat: 'Computer Science', total: 8, avail: 6 },
        { isbn: '978-0073523323', title: 'Database System Concepts', author: 'Abraham Silberschatz et al.', cat: 'Computer Science', total: 10, avail: 7 },
        { isbn: '978-0133594140', title: 'Operating Systems: Internals & Design', author: 'William Stallings', cat: 'Computer Science', total: 6, avail: 5 },
        { isbn: '978-0132856201', title: 'Computer Networks', author: 'Andrew S. Tanenbaum', cat: 'Computer Science', total: 8, avail: 6 },
        { isbn: '978-0262035613', title: 'Deep Learning', author: 'Ian Goodfellow, Yoshua Bengio', cat: 'AI & Data Science', total: 6, avail: 4 },
        { isbn: '978-0134444321', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell & Peter Norvig', cat: 'AI & Data Science', total: 8, avail: 6 },
        { isbn: '978-0195139051', title: 'Microelectronic Circuits', author: 'Adel S. Sedra & Kenneth C. Smith', cat: 'Electronics', total: 10, avail: 8 },
        { isbn: '978-0070146143', title: 'Electronic Principles', author: 'Albert Malvino & David Bates', cat: 'Electronics', total: 7, avail: 5 },
        { isbn: '978-0131850101', title: 'Digital Design: Principles & Practices', author: 'John F. Wakerly', cat: 'Electronics', total: 6, avail: 4 },
        { isbn: '978-0131424647', title: 'Signals and Systems', author: 'Alan V. Oppenheim', cat: 'Electronics', total: 8, avail: 6 },
        { isbn: '978-0073398204', title: 'Engineering Mechanics: Statics & Dynamics', author: 'Ferdinand P. Beer et al.', cat: 'Mechanical', total: 8, avail: 6 },
        { isbn: '978-0073398174', title: 'Thermodynamics: An Engineering Approach', author: 'Yunus A. Cengel & Michael Boles', cat: 'Mechanical', total: 9, avail: 7 },
        { isbn: '978-0470547557', title: 'Fluid Mechanics', author: 'Frank M. White', cat: 'Mechanical', total: 6, avail: 5 },
        { isbn: '978-0134056388', title: 'Introduction to Robotics: Mechanics & Control', author: 'John J. Craig', cat: 'Mechanical', total: 5, avail: 4 },
        { isbn: '978-0134482804', title: 'Structural Analysis', author: 'Russell C. Hibbeler', cat: 'Civil', total: 8, avail: 6 },
        { isbn: '978-0471216445', title: 'Soil Mechanics and Foundations', author: 'Muni Budhu', cat: 'Civil', total: 6, avail: 5 },
        { isbn: '978-0070151413', title: 'Surveying (Vol I & II)', author: 'B. C. Punmia', cat: 'Civil', total: 7, avail: 6 },
        { isbn: '978-0135000045', title: 'Electric Circuits', author: 'James W. Nilsson', cat: 'Electrical', total: 8, avail: 6 },
        { isbn: '978-0070151437', title: 'Electrical Machines', author: 'I. J. Nagrath & D. P. Kothari', cat: 'Electrical', total: 8, avail: 6 },
        { isbn: '978-0070144781', title: 'Modern Power System Analysis', author: 'D. P. Kothari & I. J. Nagrath', cat: 'Electrical', total: 6, avail: 5 },
        { isbn: '978-0470088517', title: 'Control Systems Engineering', author: 'Norman S. Nise', cat: 'Electrical', total: 7, avail: 6 },
        { isbn: '978-0134685991', title: 'Effective Java', author: 'Joshua Bloch', cat: 'IT & Software', total: 8, avail: 6 },
        { isbn: '978-1491950296', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', cat: 'IT & Software', total: 10, avail: 8 },
        { isbn: '978-0321356680', title: 'Molecular Biology of the Gene', author: 'James D. Watson et al.', cat: 'Biotechnology', total: 6, avail: 5 },
        { isbn: '978-0130877888', title: 'Bioprocess Engineering Principles', author: 'Pauline M. Doran', cat: 'Biotechnology', total: 5, avail: 4 },
        { isbn: '978-0134787039', title: 'Management: A Global & Entrepreneurial Perspective', author: 'Harold Koontz & Heinz Weihrich', cat: 'Management', total: 8, avail: 7 },
        { isbn: '978-0133856460', title: 'Marketing Management', author: 'Philip Kotler & Kevin Lane Keller', cat: 'Management', total: 10, avail: 8 },
        { isbn: '978-0078034770', title: 'Corporate Finance', author: 'Stephen A. Ross et al.', cat: 'Management', total: 8, avail: 6 }
    ];

    for (const b of booksData) {
        await run(`
            INSERT INTO library_books (isbn, title, author, category, total_copies, available_copies)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [b.isbn, b.title, b.author, b.cat, b.total, b.avail]);
    }
    counts.library_books = booksData.length; // 30

    // ------------------------------------------------------------------------
    // 16. LIBRARY ISSUES (25 records)
    // ------------------------------------------------------------------------
    for (let i = 1; i <= 25; i++) {
        const bookId = ((i - 1) % 30) + 1;
        const studentId = ((i - 1) % 25) + 1;
        const issueDate = `2026-02-${String((i % 20) + 1).padStart(2, '0')}`;
        const dueDate = `2026-03-${String((i % 20) + 1).padStart(2, '0')}`;
        const isReturned = (i % 3 === 0);
        const returnDate = isReturned ? `2026-03-02` : null;
        const status = isReturned ? 'Returned' : (i === 7 ? 'Overdue' : 'Issued');
        const fine = (status === 'Overdue') ? 50.0 : 0.0;

        await run(`
            INSERT INTO library_issues (book_id, student_id, issue_date, due_date, return_date, status, fine_amount)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [bookId, studentId, issueDate, dueDate, returnDate, status, fine]);
    }
    counts.library_issues = 25;

    // ------------------------------------------------------------------------
    // 17. HOSTEL ROOMS (15 records)
    // ------------------------------------------------------------------------
    const hostels = [
        { name: 'Aryabhata Boys Hostel', rooms: ['101', '102', '103', '201', '202', '203'] },
        { name: 'Sarojini Girls Hostel', rooms: ['101', '102', '103', '201', '202'] },
        { name: 'C.V. Raman International Hostel', rooms: ['301', '302', '303', '304'] }
    ];

    for (const h of hostels) {
        for (const rm of h.rooms) {
            const floor = parseInt(rm[0]);
            const type = (rm.endsWith('1') || rm.endsWith('2')) ? 'Non-AC' : 'AC';
            await run(`
                INSERT INTO hostel_rooms (hostel_name, room_number, floor, capacity, occupied, room_type)
                VALUES (?, ?, ?, 2, 1, ?)
            `, [h.name, rm, floor, type]);
        }
    }
    counts.hostel_rooms = 15;

    // ------------------------------------------------------------------------
    // 18. HOSTEL ALLOCATIONS (20 records)
    // ------------------------------------------------------------------------
    for (let i = 1; i <= 20; i++) {
        const roomId = ((i - 1) % 15) + 1;
        const studentId = i; // Students 1..20
        await run(`
            INSERT INTO hostel_allocations (room_id, student_id, academic_year, allocation_date, status)
            VALUES (?, ?, '2025-2026', '2025-08-01', 'Active')
        `, [roomId, studentId]);
    }
    counts.hostel_allocations = 20;

    // ------------------------------------------------------------------------
    // 19. TRANSPORT ROUTES (6 records)
    // ------------------------------------------------------------------------
    const routesData = [
        { num: 'R-01', name: 'Delhi Connaught Place Express', start: 'CP Block B, New Delhi', end: 'Campus Gate 1', bus: 'DL-01-AB-1234', driver: 'Gurmeet Singh', phone: '+91 98111 22334', fee: 1800 },
        { num: 'R-02', name: 'Noida City Center Shuttle', start: 'Noida City Center Metro', end: 'Campus Gate 2', bus: 'UP-16-CD-5678', driver: 'Mukesh Sharma', phone: '+91 98222 33445', fee: 1500 },
        { num: 'R-03', name: 'Gurugram Cyber Hub Line', start: 'Cyber Hub Phase 2, Gurugram', end: 'Campus Gate 1', bus: 'HR-26-EF-9012', driver: 'Rajinder Pal', phone: '+91 98333 44556', fee: 2000 },
        { num: 'R-04', name: 'Ghaziabad Anand Vihar Link', start: 'Anand Vihar ISBT', end: 'Campus Gate 2', bus: 'UP-14-GH-3456', driver: 'Surender Yadav', phone: '+91 98444 55667', fee: 1600 },
        { num: 'R-05', name: 'South Delhi Nehru Place Line', start: 'Nehru Place Terminal', end: 'Campus Gate 1', bus: 'DL-04-IJ-7890', driver: 'Balwinder Singh', phone: '+91 98555 66778', fee: 1750 },
        { num: 'R-06', name: 'Faridabad Bata Chowk Link', start: 'Bata Chowk Metro, Faridabad', end: 'Campus Gate 2', bus: 'HR-51-KL-2345', driver: 'Om Prakash', phone: '+91 98666 77889', fee: 1700 }
    ];

    for (const r of routesData) {
        await run(`
            INSERT INTO transport_routes (route_number, route_name, start_point, end_point, bus_number, driver_name, driver_phone, monthly_fee)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [r.num, r.name, r.start, r.end, r.bus, r.driver, r.phone, r.fee]);
    }
    counts.transport_routes = routesData.length; // 6

    // ------------------------------------------------------------------------
    // 20. TRANSPORT ALLOCATIONS (18 records)
    // ------------------------------------------------------------------------
    for (let i = 1; i <= 18; i++) {
        const routeId = ((i - 1) % 6) + 1;
        const studentId = i + 20; // Students 21..38
        const rMeta = routesData[routeId - 1];

        await run(`
            INSERT INTO transport_allocations (route_id, student_id, pickup_point, academic_year, status)
            VALUES (?, ?, ?, '2025-2026', 'Active')
        `, [routeId, studentId, `${rMeta.start} Pickup Stop`]);
    }
    counts.transport_allocations = 18;

    // ------------------------------------------------------------------------
    // 21. ASSIGNMENTS (20 records - Department & Field Specific)
    // ------------------------------------------------------------------------
    const assignmentsCatalog = [
        // CSE (Department 1: Courses 1..4)
        { title: 'Programming in C - Dynamic Memory Allocation & File Indexer', desc: 'Implement multi-threaded text file indexing system using pointers, malloc/free, and binary search.', cid: 1, subId: 1, facId: 1, dueDate: '2026-11-18' },
        { title: 'DSA - Red-Black Tree Implementation & Benchmark', desc: 'Construct self-balancing search tree with left/right rotations and benchmark performance against AVL trees.', cid: 2, subId: 3, facId: 2, dueDate: '2026-11-22' },
        { title: 'DBMS - University ERP Relational Schema & 3NF Normalization', desc: 'Design entity-relationship diagrams, write complex nested SQL joins, and optimize B-Tree index queries.', cid: 3, subId: 5, facId: 3, dueDate: '2026-11-26' },
        { title: 'Computer Networks - Multi-Threaded TCP Socket Server', desc: 'Build client-server socket architecture with sliding window flow control and packet header inspection.', cid: 4, subId: 7, facId: 1, dueDate: '2026-11-30' },

        // ECE (Department 2: Courses 7..10)
        { title: 'Digital Electronics - 4-Bit ALU Design in Verilog', desc: 'Synthesize arithmetic and logic unit performing 8 operations using multiplexers, full adders, and status flags.', cid: 7, subId: 11, facId: 4, dueDate: '2026-11-18' },
        { title: 'Signals & Systems - Fourier Transform & Convolution Simulation', desc: 'Compute continuous and discrete-time convolution integrals and analyze frequency response of low-pass filters.', cid: 7, subId: 12, facId: 5, dueDate: '2026-11-22' },
        { title: 'Embedded Systems - ARM Cortex-M Traffic Controller Firmware', desc: 'Develop bare-metal C timer interrupt routines and GPIO drivers for a 4-way intelligent intersection controller.', cid: 9, subId: 13, facId: 6, dueDate: '2026-11-26' },
        { title: 'VLSI Design - CMOS Inverter Stick Diagram & Delay Modeling', desc: 'Design DRC/LVS clean stick diagram and transient SPICE timing analysis for sub-micron CMOS inverter standard cell.', cid: 10, subId: 15, facId: 4, dueDate: '2026-11-30' },

        // ME (Department 3: Courses 11..14)
        { title: 'Engineering Mechanics - Truss Equilibrium & Load Analysis', desc: 'Analyze 2D pin-jointed bridge truss using method of joints and method of sections. Plot internal stress distribution.', cid: 11, subId: 16, facId: 7, dueDate: '2026-11-18' },
        { title: 'Thermodynamics - Rankine Steam Power Cycle Simulation', desc: 'Calculate thermal efficiency and steam quality across boiler, turbine, and condenser stages for a 500MW thermal plant.', cid: 11, subId: 17, facId: 8, dueDate: '2026-11-22' },
        { title: 'Fluid Mechanics - Pipe Network Head Loss Calculation', desc: 'Determine friction factor using Darcy-Weisbach equation and Moody chart for laminar and turbulent Reynolds numbers.', cid: 13, subId: 18, facId: 7, dueDate: '2026-11-26' },
        { title: 'Robotics - Forward Kinematics & DH Parameter Modeling', desc: 'Formulate Denavit-Hartenberg transformation matrices for 6-DOF industrial robotic arm and simulate end-effector trajectory.', cid: 14, subId: 19, facId: 8, dueDate: '2026-11-30' },

        // CE (Department 4: Courses 15..18)
        { title: 'Surveying & Geomatics - Total Station Traverse Mapping', desc: 'Perform closed loop traverse computation, apply Bowditch balancing rule, and draft contour elevation profiles.', cid: 15, subId: 20, facId: 9, dueDate: '2026-11-18' },
        { title: 'Structural Analysis - Bending Moment & Shear Force Diagram', desc: 'Evaluate cantilever and continuous beams under uniformly distributed and point loads using moment distribution method.', cid: 15, subId: 20, facId: 10, dueDate: '2026-11-22' },
        { title: 'Concrete Technology - M30 Mix Design & Compressive Strength', desc: 'Design concrete mix proportioning per IS 10262 standards and verify 28-day cube curing compressive strength results.', cid: 17, subId: 21, facId: 9, dueDate: '2026-11-26' },
        { title: 'Environmental Engg - Water Treatment Plant Hydraulic Sizing', desc: 'Design rapid sand filter beds, sedimentation basins, and chemical coagulation dosing for 20 MLD urban water supply.', cid: 18, subId: 22, facId: 10, dueDate: '2026-11-30' },

        // EE (Department 5: Courses 19..21)
        { title: 'Network Analysis - Thevenin & Norton Equivalent Circuits', desc: 'Solve complex AC mesh circuits with coupled inductors and compute maximum power transfer conditions.', cid: 19, subId: 23, facId: 11, dueDate: '2026-11-18' },
        { title: 'Electrical Machines - Three-Phase Induction Motor Torque-Slip', desc: 'Perform blocked-rotor and no-load laboratory tests to extract equivalent circuit parameters and starting torque.', cid: 21, subId: 24, facId: 12, dueDate: '2026-11-24' },

        // IT (Department 6: Courses 23..24)
        { title: 'Web Application Development - Microservices REST API with JWT', desc: 'Build responsive single-page web app with secure role-based session middleware and database transactions.', cid: 23, subId: 26, facId: 13, dueDate: '2026-11-20' },
        { title: 'Cyber Security - RSA Cryptographic Engine & Packet Penetration', desc: 'Implement asymmetric key generation, prime factorization verification, and vulnerability scanning.', cid: 24, subId: 28, facId: 14, dueDate: '2026-11-28' }
    ];

    for (const a of assignmentsCatalog) {
        await run(`
            INSERT INTO assignments (title, description, course_id, subject_id, faculty_id, due_date, max_marks)
            VALUES (?, ?, ?, ?, ?, ?, 50)
        `, [a.title, a.desc, a.cid, a.subId, a.facId, a.dueDate]);
    }
    counts.assignments = assignmentsCatalog.length; // 20

    // ------------------------------------------------------------------------
    // 22. ASSIGNMENT SUBMISSIONS (20 records - Enrolled Department Students)
    // ------------------------------------------------------------------------
    const submissionStudentMap = [
        1,  // Assign 1 (CSE) -> Student 1 (CSE - Rahul)
        9,  // Assign 2 (CSE) -> Student 9 (CSE)
        1,  // Assign 3 (CSE) -> Student 1 (CSE - Rahul)
        9,  // Assign 4 (CSE) -> Student 9 (CSE)
        2,  // Assign 5 (ECE) -> Student 2 (ECE - Priya)
        10, // Assign 6 (ECE) -> Student 10 (ECE)
        2,  // Assign 7 (ECE) -> Student 2 (ECE - Priya)
        10, // Assign 8 (ECE) -> Student 10 (ECE)
        3,  // Assign 9 (ME)  -> Student 3 (ME - Aarav Patel)
        11, // Assign 10 (ME) -> Student 11 (ME)
        3,  // Assign 11 (ME) -> Student 3 (ME - Aarav Patel)
        11, // Assign 12 (ME) -> Student 11 (ME)
        4,  // Assign 13 (CE) -> Student 4 (CE - Ananya Iyer)
        12, // Assign 14 (CE) -> Student 12 (CE)
        4,  // Assign 15 (CE) -> Student 4 (CE - Ananya Iyer)
        12, // Assign 16 (CE) -> Student 12 (CE)
        5,  // Assign 17 (EE) -> Student 5 (EE - Rohan Gupta)
        13, // Assign 18 (EE) -> Student 13 (EE)
        6,  // Assign 19 (IT) -> Student 6 (IT - Sneha)
        14  // Assign 20 (IT) -> Student 14 (IT)
    ];

    for (let i = 0; i < 20; i++) {
        const assignId = i + 1;
        const studentId = submissionStudentMap[i];
        const subDate = `2026-11-0${(i % 5) + 1}`;
        const marks = randInt(40, 49);

        await run(`
            INSERT INTO assignment_submissions (assignment_id, student_id, submission_date, file_url, marks_awarded, status)
            VALUES (?, ?, ?, 'https://campus.edu/submissions/project_report.pdf', ?, 'Graded')
        `, [assignId, studentId, subDate, marks]);
    }
    counts.assignment_submissions = 20;

    // ------------------------------------------------------------------------
    // 23. EVENTS (10 records)
    // ------------------------------------------------------------------------
    const eventsData = [
        { title: 'Innovate 2026: National Techfest & Hackathon', type: 'Technical', start: '2026-04-15', end: '2026-04-17', venue: 'Campus Auditorium & Labs', org: 1, desc: 'Flagship university technical symposium with 48-hour national hackathon.' },
        { title: 'Spandan 2026: Annual Inter-College Cultural Fest', type: 'Cultural', start: '2026-04-24', end: '2026-04-26', venue: 'Open Air Amphitheatre', org: 2, desc: 'Music, drama, fine arts, dance, and celebrity band performances.' },
        { title: 'Campus Champions League: Annual Sports Meet', type: 'Sports', start: '2026-03-10', end: '2026-03-14', venue: 'University Sports Complex', org: 1, desc: 'Track and field athletics, cricket, football, basketball, and badminton tournaments.' },
        { title: 'Global Seminar on Generative AI & Robotics', type: 'Workshop', start: '2026-03-22', end: '2026-03-22', venue: 'Seminar Hall 1', org: 3, desc: 'Keynote talks by leading AI researchers from academia and industry.' },
        { title: 'Alumni Homecoming & Leadership Summit 2026', type: 'Academic', start: '2026-05-02', end: '2026-05-02', venue: 'Convention Center', org: 1, desc: 'Distinguished alumni interaction and mentorship sessions for graduating seniors.' },
        { title: 'Red Cross Mega Blood Donation Drive', type: 'Workshop', start: '2026-03-18', end: '2026-03-18', venue: 'Health Center Lawn', org: 2, desc: 'Community welfare initiative organized by university student volunteers.' },
        { title: 'National Conference on Green Energy Technologies', type: 'Academic', start: '2026-05-10', end: '2026-05-11', venue: 'Department of Electrical Engineering', org: 4, desc: 'Peer-reviewed research paper presentations on solar grids and storage systems.' },
        { title: 'Campus Cyber Defense Workshop & Capture The Flag', type: 'Technical', start: '2026-03-28', end: '2026-03-29', venue: 'Computer Center Lab 4', org: 1, desc: 'Hands-on ethical hacking, reverse engineering, and threat analysis challenge.' },
        { title: 'Youth Entrepreneurship & Startup Pitch Day', type: 'Workshop', start: '2026-04-05', end: '2026-04-05', venue: 'Incubation & Innovation Hub', org: 3, desc: 'Student startups pitch ideas to venture capitalists and angel investors.' },
        { title: 'World Environment Day Tree Plantation Drive', type: 'Cultural', start: '2026-06-05', end: '2026-06-05', venue: 'Campus Eco Park', org: 2, desc: 'University-wide environmental awareness and botanical conservation event.' }
    ];

    for (const e of eventsData) {
        await run(`
            INSERT INTO events (title, description, event_type, start_date, end_date, venue, organizer_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [e.title, e.desc, e.type, e.start, e.end, e.venue, e.org]);
    }
    counts.events = eventsData.length; // 10

    // ------------------------------------------------------------------------
    // 24. PLACEMENTS (15 records)
    // ------------------------------------------------------------------------
    const placementOffers = [
        { comp: 'Google India', role: 'Software Development Engineer', lpa: 32.5, sid: 41 },
        { comp: 'Microsoft IDC', role: 'Cloud Solution Engineer', lpa: 28.0, sid: 42 },
        { comp: 'Amazon AWS', role: 'Support Engineer / DevOps', lpa: 22.0, sid: 43 },
        { comp: 'Deloitte USI', role: 'Technology Consultant', lpa: 12.5, sid: 44 },
        { comp: 'Tata Consultancy Services', role: 'Systems Engineer', lpa: 7.2, sid: 45 },
        { comp: 'Infosys Limited', role: 'Specialist Programmer', lpa: 9.5, sid: 46 },
        { comp: 'Wipro Technologies', role: 'Project Engineer', lpa: 6.5, sid: 47 },
        { comp: 'Larsen & Toubro (L&T)', role: 'Graduate Engineer Trainee', lpa: 8.0, sid: 48 },
        { comp: 'Tata Motors', role: 'Automotive Design Engineer', lpa: 8.5, sid: 49 },
        { comp: 'HDFC Bank', role: 'Financial Analyst (Tech)', lpa: 10.0, sid: 50 },
        { comp: 'Oracle India', role: 'Database Associate', lpa: 16.0, sid: 51 },
        { comp: 'Cisco Systems', role: 'Network Software Engineer', lpa: 18.5, sid: 52 },
        { comp: 'Qualcomm India', role: 'Hardware Design Engineer', lpa: 20.0, sid: 53 },
        { comp: 'Biocon Biologics', role: 'Bioprocess Research Associate', lpa: 7.5, sid: 54 },
        { comp: 'Maruti Suzuki', role: 'Robotics Integration Specialist', lpa: 8.2, sid: 55 }
    ];

    for (const p of placementOffers) {
        await run(`
            INSERT INTO placements (company_name, job_role, package_lpa, drive_date, student_id, status)
            VALUES (?, ?, ?, '2026-02-15', ?, 'Selected')
        `, [p.comp, p.role, p.lpa, p.sid]);
    }
    counts.placements = placementOffers.length; // 15

    // ------------------------------------------------------------------------
    // 25. INTERNSHIPS (10 records)
    // ------------------------------------------------------------------------
    const internshipsData = [
        { sid: 31, comp: 'Samsung R&D Institute', role: 'AI Research Intern', stipend: 45000, start: '2026-01-10', end: '2026-06-30' },
        { sid: 32, comp: 'Intel India', role: 'VLSI Engineering Intern', stipend: 40000, start: '2026-01-15', end: '2026-06-30' },
        { sid: 33, comp: 'ISRO Telemetry', role: 'Signal Processing Trainee', stipend: 25000, start: '2026-02-01', end: '2026-05-31' },
        { sid: 34, comp: 'Bosch Engineering', role: 'Embedded Systems Intern', stipend: 30000, start: '2026-01-10', end: '2026-06-30' },
        { sid: 35, comp: 'Goldman Sachs', role: 'Operations & Quantitative Analyst', stipend: 60000, start: '2026-02-01', end: '2026-07-31' },
        { sid: 36, comp: 'Zomato Engineering', role: 'Backend Software Intern', stipend: 35000, start: '2026-01-20', end: '2026-06-20' },
        { sid: 37, comp: 'Razorpay', role: 'Frontend Web Intern', stipend: 30000, start: '2026-02-01', end: '2026-05-31' },
        { sid: 38, comp: 'Bharat Biotech', role: 'R&D Laboratory Trainee', stipend: 20000, start: '2026-01-15', end: '2026-06-15' },
        { sid: 39, comp: 'DLF Infrastructure', role: 'Site Engineering Trainee', stipend: 22000, start: '2026-02-10', end: '2026-05-10' },
        { sid: 40, comp: 'Schneider Electric', role: 'Power Systems Trainee', stipend: 28000, start: '2026-01-15', end: '2026-06-30' }
    ];

    for (const inData of internshipsData) {
        await run(`
            INSERT INTO internships (student_id, company_name, role, stipend, start_date, end_date, status)
            VALUES (?, ?, ?, ?, ?, ?, 'Ongoing')
        `, [inData.sid, inData.comp, inData.role, inData.stipend, inData.start, inData.end]);
    }
    counts.internships = internshipsData.length; // 10

    // ------------------------------------------------------------------------
    // 26. LEAVES (15 records)
    // ------------------------------------------------------------------------
    const leaveTypes = ['Sick', 'Casual', 'Academic'];
    for (let i = 1; i <= 15; i++) {
        const userId = ((i - 1) % 25) + 5; // faculty & student users
        const lType = leaveTypes[(i - 1) % 3];
        const startDate = `2026-02-${String((i % 20) + 1).padStart(2, '0')}`;
        const endDate = `2026-02-${String((i % 20) + 3).padStart(2, '0')}`;
        const status = (i <= 10) ? 'Approved' : (i <= 13 ? 'Pending' : 'Rejected');

        await run(`
            INSERT INTO leaves (user_id, leave_type, start_date, end_date, reason, status, approved_by)
            VALUES (?, ?, ?, ?, 'Medical or official university representation requirement', ?, 1)
        `, [userId, lType, startDate, endDate, status]);
    }
    counts.leaves = 15;

    // ------------------------------------------------------------------------
    // 27. COMPLAINTS (10 records)
    // ------------------------------------------------------------------------
    const complaintsData = [
        { u: 5, t: 'Projector connectivity issue in Lecture Hall B-204', cat: 'Infrastructure', pri: 'Medium', stat: 'Resolved', res: 'HDMI cable and port replaced by AV team.' },
        { u: 8, t: 'Low water pressure on 2nd Floor Aryabhata Hostel', cat: 'Hostel', pri: 'High', stat: 'Resolved', res: 'Booster pump motor repaired.' },
        { u: 12, t: 'Route R-02 bus air conditioning malfunction', cat: 'Transport', pri: 'Medium', stat: 'In Progress', res: 'Bus scheduled for AC servicing this Saturday.' },
        { u: 16, t: 'Wi-Fi connectivity drops in Central Library reading hall', cat: 'Infrastructure', pri: 'High', stat: 'Resolved', res: 'New dual-band access point installed.' },
        { u: 20, t: 'Lab equipment calibration needed for Digital Signal Processing', cat: 'Academic', pri: 'Medium', stat: 'Resolved', res: 'Lab technician recalibrated all oscilloscopes.' },
        { u: 24, t: 'Cafeteria food hygiene inspection request', cat: 'Infrastructure', pri: 'Urgent', stat: 'Resolved', res: 'Sanitary inspection conducted; vendor issued guidelines.' },
        { u: 28, t: 'Hostel room door lock jammed in room 103', cat: 'Hostel', pri: 'High', stat: 'Resolved', res: 'Carpenter installed new biometric handle lock.' },
        { u: 32, t: 'Request for additional electrical power strips in study room', cat: 'Infrastructure', pri: 'Low', stat: 'In Progress', res: 'Procurement requested from store.' },
        { u: 36, t: 'Delay in library catalog update for renewed textbooks', cat: 'Academic', pri: 'Low', stat: 'Open', res: null },
        { u: 40, t: 'Streetlight blinking near Campus Gate 2 crossing', cat: 'Infrastructure', pri: 'Medium', stat: 'Resolved', res: 'LED fixture replaced by electrical maintenance.' }
    ];

    for (const c of complaintsData) {
        await run(`
            INSERT INTO complaints (user_id, title, description, category, priority, status, resolution_notes)
            VALUES (?, ?, 'Formal student/staff issue logged through helpdesk portal', ?, ?, ?, ?)
        `, [c.u, c.t, c.cat, c.pri, c.stat, c.res]);
    }
    counts.complaints = complaintsData.length; // 10

    // ------------------------------------------------------------------------
    // 28. FEEDBACK (10 records)
    // ------------------------------------------------------------------------
    const feedbackData = [
        { u: 25, cid: 1, fid: 1, r: 5, com: 'Exceptional teaching methodology and clear conceptual explanations.' },
        { u: 26, cid: 2, fid: 2, r: 5, com: 'Very helpful practical problem solving and algorithm analysis.' },
        { u: 27, cid: 3, fid: 3, r: 4, com: 'Great database design assignments and live query walkthroughs.' },
        { u: 28, cid: 4, fid: 1, r: 5, com: 'Network architecture concepts made very easy to comprehend.' },
        { u: 29, cid: 5, fid: 2, r: 5, com: 'Inspiring lectures on AI, machine learning, and deep neural nets.' },
        { u: 30, cid: 7, fid: 4, r: 4, com: 'Thorough coverage of electronic logic gates and circuits.' },
        { u: 31, cid: 11, fid: 7, r: 5, com: 'Clear mechanical engineering diagrams and numerical guidance.' },
        { u: 32, cid: 15, fid: 9, r: 4, com: 'Practical field surveying exercises were very well organized.' },
        { u: 33, cid: 19, fid: 11, r: 4, com: 'Detailed derivations and good balance of theoretical concepts.' },
        { u: 34, cid: 23, fid: 13, r: 5, com: 'Modern web stack training with React and Express was outstanding.' }
    ];

    for (const fb of feedbackData) {
        await run(`
            INSERT INTO feedback (user_id, course_id, faculty_id, rating, comments)
            VALUES (?, ?, ?, ?, ?)
        `, [fb.u, fb.cid, fb.fid, fb.r, fb.com]);
    }
    counts.feedback = feedbackData.length; // 10

    // ------------------------------------------------------------------------
    // TOTAL VERIFICATION
    // ------------------------------------------------------------------------
    let totalGenerated = 0;
    for (const key of Object.keys(counts)) {
        totalGenerated += counts[key];
    }

    console.log(`\n======================================================`);
    console.log(`🎉 COMPLETED SEEDING: Exactly ${totalGenerated} records created across ${Object.keys(counts).length} tables!`);
    console.log(`======================================================`);
    for (const [tbl, cnt] of Object.entries(counts)) {
        console.log(`   ✓ ${tbl.padEnd(24)} : ${String(cnt).padStart(4)} records`);
    }
    console.log(`------------------------------------------------------`);
    console.log(`   TOTAL SUM                : ${totalGenerated} records`);
    console.log(`======================================================\n`);

    // ------------------------------------------------------------------------
    // EXPORT TO CSV AND JSON (Full dataset synchronization)
    // ------------------------------------------------------------------------
    console.log('📦 Exporting comprehensive CSV and JSON datasets...');
    const csvDir = path.join(__dirname, '..', 'csv');
    const jsonDir = path.join(__dirname, '..', 'json');
    const legacyExportDir = path.join(__dirname, '..', 'exports');

    [csvDir, jsonDir, legacyExportDir].forEach(d => {
        if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    });

    const exportManifest = {
        generated_at: new Date().toISOString(),
        total_records: totalGenerated,
        total_tables: Object.keys(counts).length,
        modules: counts,
        files: {}
    };

    for (const tbl of Object.keys(counts)) {
        const rows = await all(`SELECT * FROM ${tbl} ORDER BY id ASC`);
        
        // Write JSON
        const jsonPath = path.join(jsonDir, `${tbl}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2), 'utf8');

        // Write CSV
        if (rows.length > 0) {
            const headers = Object.keys(rows[0]);
            const csvContent = toCSV(headers, rows);
            const csvPath = path.join(csvDir, `${tbl}.csv`);
            fs.writeFileSync(csvPath, csvContent, 'utf8');
        }

        exportManifest.files[tbl] = {
            records: rows.length,
            json: `database/json/${tbl}.json`,
            csv: `database/csv/${tbl}.csv`
        };
    }

    // Export backwards-compatible students files
    const allStudentsFull = await all(`
        SELECT s.*, d.name as department_name, d.code as department_code, c.title as course_title
        FROM students s
        JOIN departments d ON s.department_id = d.id
        LEFT JOIN courses c ON s.course_id = c.id
        ORDER BY s.id ASC
    `);
    fs.writeFileSync(path.join(legacyExportDir, 'students.json'), JSON.stringify(allStudentsFull, null, 2), 'utf8');
    if (allStudentsFull.length > 0) {
        const headers = Object.keys(allStudentsFull[0]);
        fs.writeFileSync(path.join(legacyExportDir, 'students.csv'), toCSV(headers, allStudentsFull), 'utf8');
    }

    // Save manifest
    fs.writeFileSync(path.join(__dirname, '..', 'manifest.json'), JSON.stringify(exportManifest, null, 2), 'utf8');
    console.log('✅ Exported all CSV and JSON files, updated database/manifest.json');

    return counts;
}

async function exportSnapshots() {
    const legacyExportDir = path.join(__dirname, '..', 'exports');
    if (!fs.existsSync(legacyExportDir)) fs.mkdirSync(legacyExportDir, { recursive: true });
    const allStudentsFull = await all(`
        SELECT s.*, d.name as department_name, d.code as department_code, c.title as course_title
        FROM students s
        JOIN departments d ON s.department_id = d.id
        LEFT JOIN courses c ON s.course_id = c.id
        ORDER BY s.id ASC
    `);
    fs.writeFileSync(path.join(legacyExportDir, 'students.json'), JSON.stringify(allStudentsFull, null, 2), 'utf8');
    if (allStudentsFull.length > 0) {
        const headers = Object.keys(allStudentsFull[0]);
        fs.writeFileSync(path.join(legacyExportDir, 'students.csv'), toCSV(headers, allStudentsFull), 'utf8');
    }
}

if (require.main === module) {
    seed(true)
        .then(() => {
            console.log('Seeding finished successfully.');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Seeding failed with error:', err);
            process.exit(1);
        });
}

module.exports = { seed, exportSnapshots };
