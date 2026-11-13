const { run, all } = require('../database/database');

async function updateAdmissionDates() {
    await run(`UPDATE students SET admission_date = '2023-07-15', academic_year = '2023-2024' WHERE current_semester >= 7`);
    await run(`UPDATE students SET admission_date = '2024-07-15', academic_year = '2024-2025' WHERE current_semester IN (5, 6)`);
    await run(`UPDATE students SET admission_date = '2025-07-15', academic_year = '2025-2026' WHERE current_semester IN (3, 4)`);
    await run(`UPDATE students SET admission_date = '2026-07-15', academic_year = '2026-2027' WHERE current_semester IN (1, 2)`);

    const students = await all(`SELECT id, full_name, year_level, current_semester, admission_date, academic_year FROM students ORDER BY id ASC LIMIT 10`);
    console.log('Updated students admission dates:');
    students.forEach(s => console.log(`${s.id}. ${s.full_name} (${s.year_level}, Sem ${s.current_semester}): Admission ${s.admission_date}`));
}

updateAdmissionDates().catch(console.error);

