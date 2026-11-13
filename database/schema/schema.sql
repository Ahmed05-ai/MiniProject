-- ============================================================================
-- SMART CAMPUS MANAGEMENT SYSTEM - COMPREHENSIVE RELATIONAL DATABASE SCHEMA
-- Authoritative SQLite Schema for all 20 Campus Modules across 28 Tables
-- Features: Foreign Key Constraints, Unique Constraints, Safe Cascading, Indexes
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- 1. DEPARTMENT MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. USER AUTHENTICATION & ROLE MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('super_admin', 'admin', 'faculty', 'student', 'accountant', 'librarian', 'hostel_warden')) DEFAULT 'student',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. FACULTY MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    employee_id TEXT NOT NULL UNIQUE,
    department_id INTEGER NOT NULL,
    designation TEXT NOT NULL,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 4. COURSE MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    credits INTEGER NOT NULL DEFAULT 3,
    department_id INTEGER NOT NULL,
    faculty_id INTEGER,
    semester INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- 5. STUDENT MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    enrollment_no TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    dob TEXT,
    gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')),
    department_id INTEGER NOT NULL,
    course_id INTEGER,
    current_semester INTEGER DEFAULT 1,
    academic_year TEXT DEFAULT '2025-2026',
    year_level TEXT DEFAULT '1st Year',
    section TEXT DEFAULT 'A',
    admission_date TEXT DEFAULT '2025-08-01',
    address TEXT,
    city TEXT DEFAULT 'New Delhi',
    state TEXT DEFAULT 'Delhi',
    guardian_name TEXT,
    guardian_phone TEXT,
    profile_image TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    status TEXT CHECK(status IN ('Active', 'Inactive', 'Graduated', 'Archived')) DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 6. SUBJECT MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    credits INTEGER NOT NULL DEFAULT 4,
    course_id INTEGER NOT NULL,
    department_id INTEGER NOT NULL,
    faculty_id INTEGER,
    semester INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- 7. ENROLLMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    academic_year TEXT NOT NULL DEFAULT '2025-2026',
    semester INTEGER NOT NULL DEFAULT 1,
    status TEXT CHECK(status IN ('Enrolled', 'Completed', 'Dropped')) DEFAULT 'Enrolled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id, academic_year, semester),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 8. ATTENDANCE MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enrollment_id INTEGER,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    subject_id INTEGER,
    date TEXT NOT NULL,
    status TEXT CHECK(status IN ('Present', 'Absent', 'Late')) NOT NULL,
    remarks TEXT DEFAULT '-',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE SET NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- 9. EXAMINATION MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    subject_id INTEGER,
    title TEXT NOT NULL,
    exam_type TEXT CHECK(exam_type IN ('Midterm', 'Final', 'Quiz', 'Assignment')) DEFAULT 'Midterm',
    max_marks REAL NOT NULL DEFAULT 100,
    exam_date TEXT NOT NULL,
    semester INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- 10. MARKS AND RESULTS MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    enrollment_id INTEGER,
    marks_obtained REAL NOT NULL,
    grade TEXT NOT NULL,
    grade_point REAL NOT NULL,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, student_id),
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE RESTRICT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- 11. FEES AND PAYMENT MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fee_invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL UNIQUE,
    student_id INTEGER NOT NULL,
    academic_year TEXT NOT NULL DEFAULT '2025-2026',
    semester INTEGER NOT NULL DEFAULT 1,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT CHECK(status IN ('Unpaid', 'Partial', 'Paid')) DEFAULT 'Unpaid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS fee_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_number TEXT NOT NULL UNIQUE,
    invoice_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    amount_paid REAL NOT NULL,
    payment_date TEXT NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('UPI', 'Card', 'NetBanking', 'Cash', 'Cheque')) DEFAULT 'UPI',
    transaction_ref TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES fee_invoices(id) ON DELETE RESTRICT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 12. TIMETABLE MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS timetable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    subject_id INTEGER,
    faculty_id INTEGER,
    department_id INTEGER NOT NULL,
    day_of_week TEXT CHECK(day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')) NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    room_number TEXT NOT NULL,
    semester INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 13. NOTICE AND ANNOUNCEMENT MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    published_by TEXT NOT NULL DEFAULT 'Admin',
    author_user_id INTEGER,
    category TEXT DEFAULT 'General',
    publish_date TEXT NOT NULL,
    is_pinned INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- 14. LIBRARY MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS library_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    isbn TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    total_copies INTEGER NOT NULL DEFAULT 5,
    available_copies INTEGER NOT NULL DEFAULT 5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS library_issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    issue_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    return_date TEXT,
    status TEXT CHECK(status IN ('Issued', 'Returned', 'Overdue')) DEFAULT 'Issued',
    fine_amount REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES library_books(id) ON DELETE RESTRICT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 15. HOSTEL MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hostel_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hostel_name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    floor INTEGER NOT NULL DEFAULT 1,
    capacity INTEGER NOT NULL DEFAULT 2,
    occupied INTEGER NOT NULL DEFAULT 0,
    room_type TEXT CHECK(room_type IN ('AC', 'Non-AC')) DEFAULT 'Non-AC',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hostel_name, room_number)
);

CREATE TABLE IF NOT EXISTS hostel_allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL UNIQUE,
    academic_year TEXT NOT NULL DEFAULT '2025-2026',
    allocation_date TEXT NOT NULL,
    status TEXT CHECK(status IN ('Active', 'Vacated')) DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES hostel_rooms(id) ON DELETE RESTRICT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 16. TRANSPORT MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transport_routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route_number TEXT NOT NULL UNIQUE,
    route_name TEXT NOT NULL,
    start_point TEXT NOT NULL,
    end_point TEXT NOT NULL,
    bus_number TEXT NOT NULL,
    driver_name TEXT NOT NULL,
    driver_phone TEXT NOT NULL,
    monthly_fee REAL NOT NULL DEFAULT 1500,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transport_allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL UNIQUE,
    pickup_point TEXT NOT NULL,
    academic_year TEXT NOT NULL DEFAULT '2025-2026',
    status TEXT CHECK(status IN ('Active', 'Cancelled')) DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES transport_routes(id) ON DELETE RESTRICT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 17. ASSIGNMENT MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    course_id INTEGER NOT NULL,
    subject_id INTEGER,
    faculty_id INTEGER,
    due_date TEXT NOT NULL,
    max_marks REAL NOT NULL DEFAULT 50,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    submission_date TEXT NOT NULL,
    file_url TEXT DEFAULT 'https://campus.edu/submissions/doc.pdf',
    marks_awarded REAL,
    status TEXT CHECK(status IN ('Submitted', 'Graded', 'Late')) DEFAULT 'Submitted',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, student_id),
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE RESTRICT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 18. EVENT MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT CHECK(event_type IN ('Academic', 'Cultural', 'Sports', 'Technical', 'Workshop')) DEFAULT 'Academic',
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    venue TEXT NOT NULL,
    organizer_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- 19. PLACEMENT AND INTERNSHIP MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS placements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    job_role TEXT NOT NULL,
    package_lpa REAL NOT NULL,
    drive_date TEXT NOT NULL,
    student_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('Selected', 'Shortlisted', 'Attended')) DEFAULT 'Selected',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS internships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    company_name TEXT NOT NULL,
    role TEXT NOT NULL,
    stipend REAL DEFAULT 0,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT CHECK(status IN ('Ongoing', 'Completed')) DEFAULT 'Ongoing',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 20. LEAVE MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leaves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    leave_type TEXT CHECK(leave_type IN ('Sick', 'Casual', 'Academic', 'Maternity', 'Emergency')) DEFAULT 'Casual',
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
    approved_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- 21. COMPLAINT AND FEEDBACK MANAGEMENT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT CHECK(category IN ('Academic', 'Hostel', 'Transport', 'Infrastructure', 'Ragging', 'Other')) DEFAULT 'Academic',
    priority TEXT CHECK(priority IN ('Low', 'Medium', 'High', 'Urgent')) DEFAULT 'Medium',
    status TEXT CHECK(status IN ('Open', 'In Progress', 'Resolved')) DEFAULT 'Open',
    resolution_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER,
    faculty_id INTEGER,
    rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
    comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_students_enrollment ON students(enrollment_no);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_faculty_dept ON faculty(department_id);
CREATE INDEX IF NOT EXISTS idx_courses_dept ON courses(department_id);
CREATE INDEX IF NOT EXISTS idx_subjects_course ON subjects(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_results_student ON results(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student ON fee_invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_library_issues_student ON library_issues(student_id);
CREATE INDEX IF NOT EXISTS idx_hostel_alloc_student ON hostel_allocations(student_id);
CREATE INDEX IF NOT EXISTS idx_transport_alloc_student ON transport_allocations(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_sub_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_placements_student ON placements(student_id);

-- ============================================================================
-- 22. ACADEMIC SESSIONS & SEMESTERS (ERP ATTENDANCE SPECIFICATION)
-- ============================================================================
CREATE TABLE IF NOT EXISTS academic_years (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    is_current INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS semesters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    academic_year_id INTEGER NOT NULL,
    semester_number INTEGER NOT NULL,
    term_type TEXT CHECK(term_type IN ('Odd', 'Even')) NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    semester INTEGER NOT NULL DEFAULT 1,
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_id, academic_year),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT
);

-- ============================================================================
-- 23. CLASS & LAB SCHEDULES
-- ============================================================================
CREATE TABLE IF NOT EXISTS class_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,
    faculty_id INTEGER,
    room_number TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    session_type TEXT CHECK(session_type IN ('Theory', 'Practical Lab')) DEFAULT 'Theory',
    semester INTEGER NOT NULL,
    academic_year TEXT DEFAULT '2026-2027',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lab_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,
    faculty_id INTEGER,
    lab_room TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    session_type TEXT DEFAULT 'Practical Lab',
    semester INTEGER NOT NULL,
    academic_year TEXT DEFAULT '2026-2027',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
);

-- ============================================================================
-- 24. ATTENDANCE SESSIONS & ATTENDANCE RECORDS (WITH AUDITING)
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,
    faculty_id INTEGER,
    date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    room_number TEXT,
    session_type TEXT CHECK(session_type IN ('Theory', 'Practical Lab')) DEFAULT 'Theory',
    topic TEXT,
    status TEXT CHECK(status IN ('Conducted', 'Cancelled', 'Pending')) DEFAULT 'Conducted',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    faculty_id INTEGER,
    date TEXT NOT NULL,
    session_type TEXT CHECK(session_type IN ('Theory', 'Practical Lab')) DEFAULT 'Theory',
    status TEXT CHECK(status IN ('Present', 'Absent', 'Late', 'Pending')) NOT NULL,
    remarks TEXT DEFAULT '-',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, student_id),
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
);

-- ============================================================================
-- 25. HOLIDAYS, VACATIONS & ACADEMIC CALENDAR
-- ============================================================================
CREATE TABLE IF NOT EXISTS holidays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    holiday_type TEXT CHECK(holiday_type IN ('National', 'Festival', 'University', 'Weekly')) DEFAULT 'Festival',
    is_gazetted INTEGER DEFAULT 1,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vacations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    vacation_type TEXT CHECK(vacation_type IN ('Summer Vacation', 'Winter Vacation', 'Diwali Vacation', 'Semester Break', 'Special Recess')) DEFAULT 'Summer Vacation',
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    total_days INTEGER NOT NULL,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS academic_calendar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_title TEXT NOT NULL,
    event_type TEXT CHECK(event_type IN ('Holiday', 'Vacation', 'Examination', 'Academic Term', 'Workshop')) DEFAULT 'Holiday',
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    academic_year TEXT DEFAULT '2026-2027',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_corrections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id INTEGER,
    student_id INTEGER NOT NULL,
    requested_by INTEGER NOT NULL,
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Approved',
    approved_by INTEGER,
    approved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS attendance_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    record_id INTEGER,
    performed_by TEXT NOT NULL DEFAULT 'Faculty',
    old_value TEXT,
    new_value TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);


