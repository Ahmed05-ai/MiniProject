const { all } = require('../database/database');
(async () => {
    console.log('MBA Timetable:', await all(`
        SELECT t.day_of_week, t.start_time, c.code, c.title, d.code as dept, u.name as faculty
        FROM timetable t
        JOIN courses c ON t.course_id = c.id
        JOIN departments d ON t.department_id = d.id
        LEFT JOIN faculty f ON t.faculty_id = f.id
        LEFT JOIN users u ON f.user_id = u.id
        WHERE d.code = 'MBA' LIMIT 5
    `));
    console.log('ME Timetable:', await all(`
        SELECT t.day_of_week, t.start_time, c.code, c.title, d.code as dept, u.name as faculty
        FROM timetable t
        JOIN courses c ON t.course_id = c.id
        JOIN departments d ON t.department_id = d.id
        LEFT JOIN faculty f ON t.faculty_id = f.id
        LEFT JOIN users u ON f.user_id = u.id
        WHERE d.code = 'ME' LIMIT 5
    `));
    process.exit(0);
})();

