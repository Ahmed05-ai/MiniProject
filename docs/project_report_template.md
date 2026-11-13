# Minor Project Report: Smart Campus Student Management System

**Course**: Web Development  
**Project Title**: Smart Campus Student Management System  
**Academic Year**: 2025–2026  

---

## 1. Introduction & Objectives
- **Problem Statement**: Traditional campus record management is manual, error-prone, and fragmented across departments.
- **Objectives**: Design a unified, responsive web portal for managing student records, attendance, courses, and academic grades in real time.

---

## 2. Requirement Analysis & User Personas
- **Target Users**:
  1. *Admin*: Full control over student records, course offerings, and user accounts.
  2. *Faculty*: Mark attendance, enter marks/grades, view enrolled students.
  3. *Student*: View enrolled courses, track attendance %, check report card/grades.

---

## 3. System Architecture & Database Design
- **Architecture**: Client-Server RESTful Architecture (HTML5/CSS3/JS Frontend <-> Express.js REST API <-> MySQL Database)
- **Entity Relationship (ER) Model**:
  - `users` (id, username, email, password_hash, role)
  - `students` (id, user_id, student_id_number, first_name, last_name, department, semester, ...)
  - `courses` (id, course_code, course_title, credits, department)
  - `enrollments` (id, student_id, course_id, semester, academic_year)
  - `attendance` (id, student_id, course_id, date, status, remarks)
  - `grades` (id, student_id, course_id, exam_type, marks_obtained, max_marks, grade_letter)

---

## 4. Technical Implementation & Compliance
1. **HTML5**: Semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`), forms, tables.
2. **CSS3**: Flexbox, CSS Grid layouts, custom CSS variables, responsive breakpoints.
3. **JavaScript**: DOM manipulation, event listeners, form validation.
4. **AJAX/JSON/API**: Asynchronous client-server communication via `fetch()`.
5. **Backend**: Node.js with Express server.
6. **Database**: MySQL relational database with CRUD operations.
7. **Authentication**: Role-based access control (Admin, Faculty, Student) with secure sessions.
8. **Version Control**: Git & GitHub repository management.
9. **Testing & Debugging**: API endpoint testing and error handling.
10. **Deployment & Optimization**: Lightweight assets, basic SEO meta tags, responsive design.

---

## 5. Results & Conclusion
- Summary of implemented modules, screenshots, and future enhancements.
