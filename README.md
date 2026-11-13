# 🎓 Smart Campus Student Management System

A full-stack, responsive web application designed for modern campus administration, faculty grading, and student academic tracking.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

---

## 📋 Compliance with Minor Project Guidelines

This project structure directly satisfies all requirements listed in the **Web Development Minor Project Guidelines**:

| # | Technical Requirement | Project Implementation & Corresponding Files |
|---|-----------------------|----------------------------------------------|
| **1** | **HTML5** | Semantic structure, forms, data tables, and multimedia (`public/*.html`) |
| **2** | **CSS3** | Modern styling, Flexbox, CSS Grid, animations, and media queries (`public/css/`) |
| **3** | **JavaScript** | DOM manipulation, dynamic rendering, input validation (`public/js/`) |
| **4** | **AJAX / JSON / API** | Asynchronous REST communication via `fetch` API (`public/js/api.js`, `routes/`) |
| **5** | **Backend & PHP Integration** | Node.js Express architecture & PHP ERP Analytics/Reporting (`server.js`, `php/*.php`, `routes/`) |
| **6** | **Database & SQL** | Relational SQL schema, 28 tables, relational constraints & CRUD (`database/schema.sql`, `config/db.js`, `php/db.php`) |
| **7** | **Authentication** | Role-based authentication (Admin, Faculty, Student) with sessions/JWT (`middleware/authMiddleware.js`, `controllers/authController.js`) |
| **8** | **Version Control** | Git version control ready (`.gitignore`, `README.md`) |
| **9** | **Testing & Debugging** | Test suites and error handling middleware (`tests/api.test.js`, `middleware/errorMiddleware.js`) |
| **10** | **Deployment & Optimization** | SEO meta tags, environment variables, and modular architecture (`.env.example`) |

---

## 📁 Project Directory Structure

```text
mini project/
├── config/
│   └── db.js                  # MySQL database connection pool
├── controllers/
│   ├── authController.js      # Login, registration, token generation
│   ├── studentController.js   # Student CRUD operations
│   ├── courseController.js    # Course catalog & enrollment logic
│   ├── attendanceController.js# Attendance recording & calculations
│   └── gradeController.js     # Marks entry & GPA calculations
├── database/
│   ├── schema.sql             # MySQL database schema (Tables & Relationships)
│   └── seed.sql               # Initial sample data for testing
├── docs/
│   └── project_report_template.md # Guidelines-compliant project report template
├── middleware/
│   ├── authMiddleware.js      # JWT & Role-Based Access Control (RBAC)
│   └── errorMiddleware.js     # Centralized error & 404 handler
├── php/
│   ├── db.php                 # PHP PDO database connection bridge
│   ├── export_grades.php      # Student grade & marksheet exporter (CSV/JSON)
│   ├── attendance_report.php  # Department-wise attendance reporting utility
│   └── verify_student.php     # Student enrollment credential verification script
├── public/
│   ├── css/
│   │   ├── style.css          # Design system, typography, colors, resets
│   │   ├── dashboard.css      # Dashboard layout, sidebar, tables & cards
│   │   └── responsive.css     # Mobile & tablet responsive breakpoints
│   ├── js/
│   │   ├── api.js             # Centralized AJAX/Fetch wrapper for REST API
│   │   ├── auth.js            # Login/Register validation & session handling
│   │   ├── main.js            # General UI interactions & notifications
│   │   ├── dashboard.js       # Dynamic dashboard widgets & stats
│   │   ├── students.js        # Student CRUD client-side logic
│   │   ├── courses.js         # Course catalog & enrollment
│   │   ├── attendance.js      # Attendance tracking & filters
│   │   └── grades.js          # Marksheet rendering & GPA calculation
│   ├── index.html             # Landing & campus overview page
│   ├── login.html             # Authentication login page
│   ├── register.html          # New account registration page
│   ├── dashboard.html         # Main user/student dashboard
│   ├── admin-students.html    # Admin student management (CRUD) page
│   ├── courses.html           # Course enrollment page
│   ├── attendance.html        # Attendance tracking page
│   ├── grades.html            # Results & report card page
│   └── profile.html           # User profile & settings page
├── routes/
│   ├── authRoutes.js          # /api/auth endpoints
│   ├── studentRoutes.js       # /api/students endpoints
│   ├── courseRoutes.js        # /api/courses endpoints
│   ├── attendanceRoutes.js    # /api/attendance endpoints
│   └── gradeRoutes.js         # /api/grades endpoints
├── tests/
│   └── api.test.js            # API integration & unit test script
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore configuration
├── package.json               # Node.js project manifest & dependencies
├── README.md                  # Project documentation & guidelines mapping
└── server.js                  # Main Express backend server entry point
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **MySQL Server** (e.g., XAMPP, MySQL Workbench, or MySQL Community Server)

### 2. Setup Environment
```bash
# Clone or open the project folder
cd "mini project"

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

### 3. Setup Database
1. Open your MySQL client (e.g. phpMyAdmin, MySQL Workbench, or CLI).
2. Execute `database/schema.sql` to create `smart_campus_db` and its tables.
3. (Optional) Run `database/seed.sql` to populate sample data.

### 4. Run Application
```bash
# Start backend server
npm start

# Or with automatic reload (development mode)
npm run dev
```

Access the application in your browser at: `http://localhost:5000`

---

## 🐘 PHP Academic Utilities & ERP Reporting

The project includes modular **PHP 8** administrative reporting and student analytics utilities located in the `/php` directory:

1. **Student Grade & Marksheet Exporter:**
   ```bash
   php php/export_grades.php [csv|json] [student_id]
   ```
   *Exports student coursework marks, credit points, and GPA directly to CSV or JSON.*

2. **Departmental Attendance Reporter:**
   ```bash
   php php/attendance_report.php [department_code]
   ```
   *Generates formatted monthly attendance summaries across CSE, ME, MBA, ECE, and other departments.*

3. **Student Credential & Enrollment Verification:**
   ```bash
   php php/verify_student.php <enrollment_no_or_id>
   ```
   *Validates student admission status, semester enrollment, and active credentials via CLI.*
