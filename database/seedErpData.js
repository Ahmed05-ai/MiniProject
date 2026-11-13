/**
 * Seed ERP Academic Years, Continuous Vacations, and Gazetted Holidays
 */
const { run, get } = require('./database');
const { ACADEMIC_HOLIDAYS, ACADEMIC_VACATIONS } = require('./holidaysData');

async function seedErpData() {
    try {
        // 1. Seed Academic Years (2023–2024 through 2026–2027)
        const years = [
            { code: '2023-2024', start: '2023-07-01', end: '2024-06-30', is_current: 0 },
            { code: '2024-2025', start: '2024-07-01', end: '2025-06-30', is_current: 0 },
            { code: '2025-2026', start: '2025-07-01', end: '2026-06-30', is_current: 0 },
            { code: '2026-2027', start: '2026-07-01', end: '2027-06-30', is_current: 1 }
        ];

        for (const y of years) {
            const existing = await get('SELECT id FROM academic_years WHERE code = ?', [y.code]);
            if (!existing) {
                await run(`
                    INSERT INTO academic_years (code, start_date, end_date, is_current)
                    VALUES (?, ?, ?, ?)
                `, [y.code, y.start, y.end, y.is_current]);
            }
        }

        // 1.5. Clean up removed vacations and holidays for 2026
        await run("DELETE FROM vacations WHERE title = 'Autumn Recess & Dussehra Break 2026' OR (start_date = '2026-10-11' AND end_date = '2026-10-15')");
        await run("DELETE FROM holidays WHERE date IN ('2026-10-12', '2026-10-31', '2026-11-01', '2026-11-02')");

        // 2. Seed Continuous Vacations & Examinations
        for (const v of ACADEMIC_VACATIONS) {
            const existing = await get('SELECT id FROM vacations WHERE title = ? AND start_date = ?', [v.title, v.startDate]);
            const totalDays = Math.round((new Date(v.endDate) - new Date(v.startDate)) / (1000 * 60 * 60 * 24)) + 1;
            if (existing) {
                await run(`
                    UPDATE vacations SET end_date = ?, vacation_type = ?, total_days = ?, academic_year = ?, remarks = ? WHERE id = ?
                `, [v.endDate, v.type, totalDays, v.academicYear, v.remarks, existing.id]);
            } else {
                await run(`
                    INSERT INTO vacations (title, vacation_type, start_date, end_date, total_days, academic_year, remarks)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [v.title, v.type, v.startDate, v.endDate, totalDays, v.academicYear, v.remarks]);
            }
        }

        // 3. Seed Gazetted Holidays
        for (const [dateStr, h] of Object.entries(ACADEMIC_HOLIDAYS)) {
            const existing = await get('SELECT id FROM holidays WHERE date = ?', [dateStr]);
            const remarks = h.remarks || '';
            const holType = remarks.includes('National') ? 'National' : 'Festival';
            if (existing) {
                await run(`
                    UPDATE holidays SET title = ?, holiday_type = ?, is_gazetted = 1, remarks = ? WHERE id = ?
                `, [h.title, holType, remarks || 'Official Campus Holiday', existing.id]);
            } else {
                await run(`
                    INSERT INTO holidays (title, date, holiday_type, is_gazetted, remarks)
                    VALUES (?, ?, ?, ?, ?)
                `, [h.title, dateStr, holType, 1, remarks || 'Official Campus Holiday']);
            }
        }

        console.log('✅ Seeded ERP Academic Years, Continuous Vacations, and Gazetted Holidays.');
    } catch (err) {
        console.error('Error seeding ERP data:', err);
    }
}

if (require.main === module) {
    seedErpData().then(() => process.exit(0));
}

module.exports = { seedErpData };
