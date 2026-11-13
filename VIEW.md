# 🖥️ Smart Campus Management System — Project Views & UI Guide

Welcome to the comprehensive **Interface & Views Directory** for the Smart Campus Student Management System. This document provides a complete visual breakdown, navigation flows, and interactive feature map of all portal screens.

---

## 📑 Table of Contents
1. [Portal Architecture & Route Map](#-portal-architecture--route-map)
2. [Public & Authentication Views](#-1-public--authentication-views)
   - [Campus Landing Page (`index.html`)](#11-campus-landing-page-indexhtml)
   - [Student & Admin Login Portal (`login.html`)](#12-student--admin-login-portal-loginhtml)
   - [GDPR Cookie Consent Banner & Controls](#13-cookie-consent-banner--controls)
3. [Student Portal Views (`dashboard.html`)](#-2-student-portal-views-dashboardhtml)
   - [Dashboard Overview & KPI Cards](#21-dashboard-overview--kpi-cards)
   - [Field-Specific Classes & Weekly Timetable](#22-field-specific-classes--weekly-timetable)
   - [Assignments & Coursework Submission Module](#23-assignments--coursework-submission-module)
   - [Interactive Academic & Holiday Calendar](#24-interactive-academic--holiday-calendar)
   - [Attendance Analytics & Donut Visualization](#25-attendance-analytics--donut-visualization)
   - [Examinations, Results & Grade Report](#26-examinations-results--grade-report)
   - [Fee Invoices & Digital Transactions](#27-fee-invoices--digital-transactions)
   - [Campus Facilities (Hostel, Transport, Library)](#28-campus-facilities-hostel-transport-library)
   - [Authoritative Profile & Live Edit Modal](#29-authoritative-profile--live-edit-modal)
4. [Administrative Management Views](#-3-administrative-management-views)
5. [Demo User Credentials & Department Directory](#-4-demo-user-credentials--department-directory)

---

## 🗺️ Portal Architecture & Route Map

```
Smart Campus System
│
├── 🌐 Public Layer
│   ├── Landing Page (index.html)
│   ├── Login Portal (login.html) ───► Cookie Consent Banner ([Accept] / [Decline])
│   └── Registration Page (register.html)
│
├── 🎓 Student Dashboard (dashboard.html)
│   ├── 📊 Overview KPI Cards (Attendance %, CGPA, Due Coursework, Active Notices)
│   ├── 📅 Classes & Timetable (Field-Specific: MBA, ME, CSE, ECE, CE, EE, IT, BT)
│   ├── 📝 Assignments & Projects (Pending vs Completed + PDF/Doc File Uploader)
│   ├── 🗓️ Academic Calendar (Mid-Sem Oct 5-7, Diwali Nov 3-12, End-Sem Nov 23-Dec 3)
│   ├── 📈 Attendance Tracking (Interactive Donut Ring + Day-wise Detail Modal)
│   ├── 🎯 Examination Grades (Semester-wise credits, marks & GPA calculation)
│   ├── 💳 Fee Breakdown & Receipts (Semester tuition, hostel, payment history)
│   ├── 📢 Notice Board & Circulars (University broadcasts, exam schedules)
│   ├── 🏢 Facilities (Hostel Room allocation, Bus Route tracking, Issued Books)
│   └── ⚙️ Student Profile (Real-time live synchronization)
│
└── 🛠️ Admin Portal (admin-dashboard.html & admin-students.html)
    ├── Student Admissions CRUD Table
    ├── Department & Faculty Management
    └── Academic Schedule Management
```

---

## 🔐 1. Public & Authentication Views

### 1.1 Campus Landing Page (`index.html`)
* **URL:** `http://localhost:5000/index.html` (or `http://localhost:5000/`)
* **Purpose:** The welcoming portal entry showcasing university accreditations, quick statistics, campus announcements, and quick access links to Student and Staff portals.
* **Key Components:**
  - Modern hero section with university branding.
  - Quick action buttons directing to login or enrollment inquiry.
  - University news and event highlights.

---

### 1.2 Student & Admin Login Portal (`login.html`)
* **URL:** `http://localhost:5000/login.html`
* **Purpose:** Secure multi-role authentication gate supporting Students, Faculty, and System Administrators.
* **Design Highlights:**
  - **Single Screen Fit:** Optimized compact vertical footprint designed to view all fields without scrolling.
  - **Quick Student Selector:** Dropdown listing pre-configured accredited department profiles (Student 1 = CSE, Student 2 = ECE, Student 3 = ME, Student 8 = MBA).
  - **Password Visibility Toggle:** Interactive eye icon for credential inspection.
  - **Password Reset:** Modal popup supporting registered email or roll number verification.

---

### 1.3 Cookie Consent Banner & Controls
* **Trigger:** Appears at the bottom of `login.html` on initial visit.
* **Text:**
  > *"This website uses cookies to ensure you get the best experience on our campus portal."*
* **Interactive Buttons:**
  - **`[Accept]`**: Saves 365-day persistent consent cookie (`cookie_consent=accepted`) and animates down smoothly.
  - **`[Decline]`**: Clears previous tracking cookies and dismisses for the current session.
* **Reopen Control (`#cookie-settings-pill`):**
  - A subtle floating button `🍪 Cookies` stays anchored on the bottom-right corner, allowing users to re-open and adjust cookie settings at any moment.

---

## 🎓 2. Student Portal Views (`dashboard.html`)

### 2.1 Dashboard Overview & KPI Cards
* **Top Metric Cards:**
  1. **Attendance Rate:** Displays dynamic percentage (e.g. `89%`) with "This Month" badge.
  2. **Academic CGPA:** Displays current cumulative grade point average (e.g. `8.95 CGPA`).
  3. **Pending Coursework:** Live counter of pending assignments due.
  4. **Official Notices:** Real-time count of active administrative announcements.
* **Quick Donut Visualization:** Dynamic SVG conic-gradient ring reflecting Present, Absent, and Late attendance breakdown.

---

### 2.2 Field-Specific Classes & Weekly Timetable
* **Tab:** `Classes & Timetable`
* **Department Isolation:** Strictly aligned to the logged-in student's field:
  - **MBA:** *Managerial Economics, Financial Accounting, Operations Management, Marketing Strategy, Corporate Governance, Business Analytics*.
  - **Mechanical (ME):** *Thermodynamics, Fluid Mechanics, Mechanics of Solids, Robotics, Manufacturing Technology, Kinematics*.
  - **Computer Science (CSE):** *Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks, Theory of Computation, AI*.
  - **ECE, Civil, EE, IT, Biotech:** Dedicated accredited curriculums and designated faculty members.
* **Schedule Breakdown:** Monday through Friday, 5 distinct time slots daily (9:00 AM – 4:15 PM) with Lecture / Practical Lab badges.

---

### 2.3 Assignments & Coursework Submission Module
* **Tab:** `Assignments & Projects`
* **Features:**
  - **Dual Tabs:** Filter instantly between `Pending` and `Completed` coursework.
  - **Field Badges:** Color-coded department tags (e.g. Blue for CSE, Orange for ME, Indigo for MBA, Pink for BT).
  - **View & Submit Modal:** Detailed problem statement, deadline warning countdown, and guidelines.
  - **Document & PDF Upload:** Integrated dropzone supporting `.pdf`, `.docx`, `.pptx`, `.zip`, and `.png` file attachments with real-time file size & icon preview.

---

### 2.4 Interactive Academic & Holiday Calendar
* **Tab:** `Academic Calendar`
* **Visual Calendar Grid:** Full monthly interactive calendar with distinct category color coding:
  - **Mid-Semester Examination:** 5, 6, 7 October 2026 (Marked with purple exam badges).
  - **Diwali Festive Vacation:** 3 November to 12 November 2026 (Continuous 10-day holiday recess).
  - **Main Diwali Festival:** 8 November 2026 (Special festive badge & campus closed notification).
  - **End-Semester Examination:** 23 November to 3 December 2026 (Marked across November and December).
* **Day-Click Modal:** Clicking any date opens a modal displaying that day's scheduled lectures, holidays, or examination papers.

---

### 2.5 Attendance Analytics & Donut Visualization
* **Tab:** `Attendance`
* **Features:**
  - Conic gradient visual ring chart reflecting percentage attendance.
  - Detailed monthly lecture log with date, subject, faculty, and status pill (`Present`, `Absent`, `Late`).
  - Attendance threshold advisory flagging minimum 75% university eligibility requirement.

---

### 2.6 Examinations, Results & Grade Report
* **Tab:** `Examinations & Results`
* **Features:**
  - Semester selection ratio filter (1st to 8th semester).
  - Tabular mark sheet with Course Code, Course Title, Total Credits, Marks Scored (100), Grade Point, and Letter Grade (`A+`, `A`, `B+`).
  - SGPA and CGPA computation display.

---

### 2.7 Fee Invoices & Digital Transactions
* **Tab:** `Fees & Invoices`
* **Features:**
  - Invoices for Academic Tuition, Hostel Residency, and Examination Dues.
  - Payment status indicators (`Paid`, `Pending`, `Partial`).
  - Digital payment modal supporting UPI, Card, and Net Banking simulation with instantaneous receipt generation.

---

### 2.8 Campus Facilities (Hostel, Transport, Library)
* **Tab:** `Campus Facilities` (and Profile Contact Card)
* **Components:**
  - **Hostel Allocation:** Building name (e.g. *Tagore Bhawan*), Room number, floor level, and resident warden contact.
  - **Transport Management:** Assigned city express route, bus registration number, and verified driver contact.
  - **Library Issues:** Active book loans, author information, issue dates, and return deadlines with zero-fine clearance badges.

---

### 2.9 Authoritative Profile & Live Edit Modal
* **Trigger:** Click `Edit Profile` from the profile menu or topbar user avatar.
* **Fields:** Student Full Name, Enrollment No, Email Address, Phone, Academic Department, Current Semester, Section, Date of Birth, Gender, and Residential Address.
* **Live Update:** Changes immediately propagate to the Topbar, KPI summary, Timetable, and Coursework views without requiring a page reload.

---

## 🏢 3. Administrative Management Views

* **Route:** `http://localhost:5000/admin-students.html`
* **Features:**
  - Comprehensive searchable directory of all registered university students.
  - Department filtering (CSE, ECE, ME, CE, EE, IT, BT, MBA).
  - Real-time student addition, academic profile modification, and enrollment record auditing.

---

## 👥 4. Demo User Credentials & Department Directory

For evaluation, testing, and live demonstrations, use any of the pre-configured academic profiles:

| Student ID | Full Name | Department / Field | Enrollment No | Default Password |
|:---:|---|---|---|---|
| **1** | **Rahul Sharma** | Computer Science & Engineering (CSE) | `CS2025001` | `student123` |
| **2** | **Priya Verma** | Electronics & Communication (ECE) | `EC2025002` | `student123` |
| **3** | **Aarav Patel** | Mechanical Engineering (ME) | `ME2025003` | `student123` |
| **4** | **Neha Gupta** | Civil Engineering (CE) | `CE2025004` | `student123` |
| **5** | **Rohan Singh** | Electrical Engineering (EE) | `EE2025005` | `student123` |
| **6** | **Ananya Roy** | Information Technology (IT) | `IT2025006` | `student123` |
| **7** | **Vikram Malhotra** | Biotechnology & Bioinformatics (BT) | `BT2025007` | `student123` |
| **8** | **Kavya Nair** | Management Studies (MBA) | `MB2025008` | `student123` |
| **Admin** | **System Admin** | University Administration | `admin@campus.edu` | `admin123` |

---

## 🚀 Running the Views Locally

1. Start the server:
   ```bash
   node server.js
   ```
2. Open in browser:
   - **Login View:** [http://localhost:5000/login.html](http://localhost:5000/login.html)
   - **Student Dashboard:** [http://localhost:5000/dashboard.html](http://localhost:5000/dashboard.html)
   - **Campus Overview:** [http://localhost:5000/index.html](http://localhost:5000/index.html)
