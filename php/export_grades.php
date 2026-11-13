<?php
/**
 * Smart Campus Management System - Grade & Marksheet Export Utility
 * Usage: php php/export_grades.php [format=csv|json] [student_id=optional]
 */

require_once __DIR__ . '/db.php';

try {
    $db = CampusDB::getConnection();
    
    $studentId = $argv[1] ?? null;
    $format = isset($argv[2]) && strtolower($argv[2]) === 'json' ? 'json' : 'csv';

    $sql = "
        SELECT s.id as student_id, s.enrollment_no, s.full_name, d.name as department,
               c.code as course_code, c.title as course_title, c.credits,
               r.marks_obtained, r.grade, r.grade_point
        FROM results r
        JOIN students s ON r.student_id = s.id
        LEFT JOIN departments d ON s.department_id = d.id
        LEFT JOIN exams e ON r.exam_id = e.id
        LEFT JOIN courses c ON e.course_id = c.id
        WHERE 1=1
    ";
    
    $params = [];
    if ($studentId && is_numeric($studentId)) {
        $sql .= " AND s.id = ?";
        $params[] = (int)$studentId;
    }
    
    $sql .= " ORDER BY s.id ASC, c.code ASC LIMIT 100";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $records = $stmt->fetchAll();

    if ($format === 'json') {
        echo json_encode([
            'status' => 'success',
            'total_records' => count($records),
            'generated_at' => date('Y-m-d H:i:s'),
            'data' => $records
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    } else {
        // Output as CSV
        echo "Student ID,Enrollment No,Full Name,Department,Course Code,Course Title,Credits,Marks Obtained,Grade,Grade Point\n";
        foreach ($records as $row) {
            echo sprintf(
                "\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%s,%s,\"%s\",%s\n",
                $row['student_id'],
                $row['enrollment_no'],
                $row['full_name'],
                $row['department'],
                $row['course_code'],
                str_replace('"', '""', $row['course_title']),
                $row['credits'] ?? 3,
                $row['marks_obtained'] ?? 0,
                $row['grade'] ?? 'A',
                $row['grade_point'] ?? 9.0
            );
        }
    }
} catch (Exception $e) {
    fwrite(STDERR, "Error exporting grades: " . $e->getMessage() . PHP_EOL);
    exit(1);
}

