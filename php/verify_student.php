<?php
/**
 * Smart Campus Management System - Student Verification CLI
 * Verifies student admission, current semester, and department status
 * Usage: php php/verify_student.php <enrollment_no_or_id>
 */

require_once __DIR__ . '/db.php';

$query = $argv[1] ?? 'CS2025001';

try {
    $db = CampusDB::getConnection();
    
    $stmt = $db->prepare("
        SELECT s.*, d.name as department_name, d.code as department_code
        FROM students s
        LEFT JOIN departments d ON s.department_id = d.id
        WHERE UPPER(s.enrollment_no) = ? OR s.id = ? OR LOWER(s.email) = ?
        LIMIT 1
    ");
    $stmt->execute([strtoupper($query), is_numeric($query) ? (int)$query : 0, strtolower($query)]);
    $student = $stmt->fetch();

    if ($student) {
        echo json_encode([
            'verified' => true,
            'status' => 'Active',
            'student_id' => (int)$student['id'],
            'full_name' => $student['full_name'],
            'enrollment_no' => $student['enrollment_no'],
            'email' => $student['email'],
            'department' => $student['department_name'],
            'department_code' => $student['department_code'],
            'semester' => (int)$student['current_semester'],
            'year_level' => $student['year_level'],
            'section' => $student['section'],
            'timestamp' => date('Y-m-d H:i:s')
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    } else {
        echo json_encode([
            'verified' => false,
            'message' => "Student record not found for query: {$query}"
        ], JSON_PRETTY_PRINT);
    }
} catch (Exception $e) {
    fwrite(STDERR, "Verification error: " . $e->getMessage() . PHP_EOL);
    exit(1);
}

