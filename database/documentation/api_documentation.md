# 📡 Smart Campus Management System — API Documentation

Complete RESTful API specifications for all 20 campus modules.

---

## 🔐 1. Authentication & Role Management

### Login
- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticates user via email or enrollment number with salted `bcrypt` password verification and issues a signed JSON Web Token (JWT).
- **Request Body:**
```json
{
  "identifier": "CS2025001",
  "password": "student123",
  "role": "student"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Student login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "student_id": 1,
    "name": "Rahul Sharma",
    "email": "rahul@campus.edu",
    "roll_no": "CS2025001",
    "department": "Computer Science & Engineering",
    "role": "student"
  }
}
```

---

## 📊 2. Dashboard Analytics

### Student Dashboard
- **Endpoint:** `GET /api/dashboard/student/:id`
- **Description:** Returns authoritative live metrics for a student (attendance percentage, CGPA, pending assignments, fee summary, library issues, hostel, transport).

### Admin Dashboard
- **Endpoint:** `GET /api/dashboard/admin`
- **Description:** Computes aggregated live campus metrics across all 28 database tables without any hardcoded numbers.
- **Response (200 OK):**
```json
{
  "stats": {
    "totalStudents": 55,
    "activeStudents": 53,
    "totalFaculty": 20,
    "totalDepartments": 8,
    "totalNotices": 12,
    "totalCourses": 30,
    "totalSubjects": 35,
    "totalInvoiced": 2942500,
    "totalCollected": 2000000,
    "outstandingFees": 942500,
    "libraryBooks": 30,
    "libraryAvailable": 182,
    "hostelRooms": 15,
    "hostelOccupancy": 20,
    "placementsCount": 15,
    "avgPlacementPackage": 14.28
  },
  "recentStudents": [...],
  "departmentDistribution": [...]
}
```

---

## 🎓 3. Student Management

### List Students
- **Endpoint:** `GET /api/students`
- **Query Params:**
  - `search`: Filter by name, email, or enrollment number
  - `department`: Filter by department ID or code
  - `semester`: Filter by semester (1-8)
  - `status`: Active, Inactive, Graduated, Archived
  - `limit`: Number of records (default 50)
  - `page`: Page index

### Get Student Profile
- **Endpoint:** `GET /api/students/:id`
- **Description:** Complete student details with dynamic attendance, GPA, and fees.

### Create Student
- **Endpoint:** `POST /api/students`
- **Description:** Creates linked records in both `users` and `students` tables.

### Update Student (Single Source of Truth)
- **Endpoint:** `PUT /api/students/:id`
- **Description:** Authoritative update with conflict detection. Automatically synchronizes name and email across all referencing entities.

### Safe Delete / Archive Student
- **Endpoint:** `DELETE /api/students/:id`
- **Description:** Protects referential integrity. Safely archives students with academic/financial history; prevents accidental cascade-deletion.

### Export Datasets
- **CSV:** `GET /api/students/export/csv`
- **JSON:** `GET /api/students/export/json`

---

## 🏛️ 4. Connected Campus Modules

| Module | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| **Departments** | `GET` | `/api/departments` | All 8 academic departments with live student counts |
| **Faculty** | `GET` | `/api/faculty` | All 20 faculty profiles joined with department info |
| **Courses** | `GET` | `/api/courses` | 30 course offerings with faculty & credit mappings |
| **Subjects** | `GET` | `/api/subjects` | 35 academic subjects linked to courses and departments |
| **Attendance** | `GET` | `/api/attendance` | Filter by `student_id`, `course_id`, `month` |
| **Attendance** | `POST`| `/api/attendance` | Record attendance with real-time SSE broadcast |
| **Results** | `GET` | `/api/results` | Student exam marks, grades, and grade points |
| **Fee Invoices**| `GET` | `/api/fees/invoices` | Tuition invoices with payment status |
| **Fee Payments**| `POST`| `/api/fees/payments` | Record payment; auto-updates invoice status to Paid |
| **Timetable** | `GET` | `/api/timetable` | Weekly schedules with room numbers and slots |
| **Notices** | `GET` | `/api/notices` | Pinned and chronological campus circulars |
| **Notices** | `POST`| `/api/notices` | Publish announcement with SSE broadcast |
| **Library Books**| `GET`| `/api/library/books` | Catalog of 30 textbooks with copy availability |
| **Library Issues**| `GET`| `/api/library/issues` | Active student book loans and fine calculations |
| **Hostel Rooms**| `GET` | `/api/hostels/rooms` | Residential room availability (AC/Non-AC) |
| **Hostel Allocations**| `GET` | `/api/hostels/allocations` | Active student room assignments |
| **Transport Routes**| `GET`| `/api/transport/routes` | Bus routes, pickup stops, and driver contacts |
| **Transport Allocations**| `GET`| `/api/transport/allocations` | Student bus pass allocations |
| **Assignments** | `GET` | `/api/assignments` | Course assignments with due dates and max marks |
| **Events** | `GET` | `/api/events` | Cultural, technical, and sports campus events |
| **Placements** | `GET` | `/api/placements` | Recruitment drive selections and LPA compensation |
| **Internships** | `GET`| `/api/internships` | Industry internship records and stipends |
| **Leaves** | `GET` | `/api/leaves` | Faculty and student leave applications |
| **Complaints** | `GET` | `/api/complaints` | Campus helpdesk and grievance tracking |
| **Feedback** | `GET` | `/api/feedback` | Course and faculty survey ratings (1-5 scale) |

---

## 📡 5. Real-Time Server-Sent Events (SSE)

- **Endpoint:** `GET /api/events`
- **Description:** Real-time push notification stream for instant multi-user synchronization.
- **Events Emitted:**
  - `student:created`
  - `student:updated`
  - `student:deleted`
  - `notice:created`
  - `notice:deleted`
  - `attendance:created`
  - `fee:payment`

