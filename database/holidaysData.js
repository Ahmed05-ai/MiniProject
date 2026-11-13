/**
 * Authoritative Multi-Year Academic Calendar & Indian Gazetted Holidays Catalog
 * Covers 2023, 2024, 2025, and 2026 Academic Years
 */

const ACADEMIC_HOLIDAYS = {
    // =========================================================================
    // YEAR 2023
    // =========================================================================
    '2023-01-26': { title: 'Republic Day', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2023-02-18': { title: 'Maha Shivratri', remarks: 'Gazetted Religious Holiday - Campus Closed' },
    '2023-03-08': { title: 'Holi (Festival of Colors)', remarks: 'National Festival Holiday - Campus Closed' },
    '2023-04-04': { title: 'Mahavir Jayanti', remarks: 'Gazetted Holiday - Campus Closed' },
    '2023-04-07': { title: 'Good Friday', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2023-04-14': { title: 'Dr. B. R. Ambedkar Jayanti', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2023-04-22': { title: 'Eid-ul-Fitr', remarks: 'Gazetted Festival Holiday - Campus Closed' },
    '2023-05-05': { title: 'Buddha Purnima', remarks: 'Gazetted Holiday - Campus Closed' },
    '2023-06-29': { title: 'Bakrid / Eid-ul-Adha', remarks: 'Gazetted Festival Holiday - Campus Closed' },
    '2023-07-29': { title: 'Muharram', remarks: 'Gazetted Holiday - Campus Closed' },
    '2023-08-15': { title: 'Independence Day', remarks: 'National Gazetted Holiday (77th Independence Day)' },
    '2023-08-30': { title: 'Raksha Bandhan', remarks: 'Campus Festival Observance - Closed' },
    '2023-09-07': { title: 'Janmashtami', remarks: 'Gazetted Festival Holiday - Campus Closed' },
    '2023-09-28': { title: 'Milad-un-Nabi (Eid-e-Milad)', remarks: 'Gazetted Holiday - Campus Closed' },
    '2023-10-02': { title: 'Mahatma Gandhi Jayanti', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2023-10-24': { title: 'Dussehra (Vijayadashami)', remarks: 'National Festival Holiday - Campus Closed' },
    '2023-11-12': { title: 'Diwali (Deepavali)', remarks: 'National Festival Holiday - Campus Closed' },
    '2023-11-13': { title: 'Govardhan Puja', remarks: 'State Festival Holiday - Campus Closed' },
    '2023-11-15': { title: 'Bhai Dooj', remarks: 'Campus Festival Holiday - Closed' },
    '2023-11-27': { title: 'Guru Nanak Jayanti', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2023-12-25': { title: 'Christmas Day', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2023-12-26': { title: 'Winter Academic Recess', remarks: 'Term Break - University Closed' },
    '2023-12-27': { title: 'Winter Academic Recess', remarks: 'Term Break - University Closed' },
    '2023-12-28': { title: 'Winter Academic Recess', remarks: 'Term Break - University Closed' },
    '2023-12-29': { title: 'Winter Academic Recess', remarks: 'Term Break - University Closed' },
    '2023-12-30': { title: 'Winter Academic Recess', remarks: 'Term Break - University Closed' },

    // =========================================================================
    // YEAR 2024
    // =========================================================================
    '2024-01-01': { title: "New Year's Day", remarks: 'Campus Academic Holiday - Campus Closed' },
    '2024-01-26': { title: 'Republic Day (75th Republic Day)', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2024-03-08': { title: 'Maha Shivratri', remarks: 'Gazetted Religious Holiday - Campus Closed' },
    '2024-03-25': { title: 'Holi (Dhulandi)', remarks: 'National Festival Holiday - Campus Closed' },
    '2024-03-29': { title: 'Good Friday', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2024-04-11': { title: 'Eid-ul-Fitr', remarks: 'Gazetted Festival Holiday - Campus Closed' },
    '2024-04-14': { title: 'Dr. B. R. Ambedkar Jayanti', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2024-04-17': { title: 'Ram Navami', remarks: 'Gazetted Religious Holiday - Campus Closed' },
    '2024-04-21': { title: 'Mahavir Jayanti', remarks: 'Gazetted Holiday - Campus Closed' },
    '2024-05-23': { title: 'Buddha Purnima', remarks: 'Gazetted Holiday - Campus Closed' },
    '2024-06-17': { title: 'Eid-ul-Adha (Bakrid)', remarks: 'Gazetted Festival Holiday - Campus Closed' },
    '2024-07-17': { title: 'Muharram', remarks: 'Gazetted Holiday - Campus Closed' },
    '2024-08-15': { title: 'Independence Day', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2024-08-19': { title: 'Raksha Bandhan', remarks: 'Campus Festival Observance - Closed' },
    '2024-08-26': { title: 'Janmashtami', remarks: 'Gazetted Festival Holiday - Campus Closed' },
    '2024-09-16': { title: 'Milad-un-Nabi (Eid-e-Milad)', remarks: 'Gazetted Holiday - Campus Closed' },
    '2024-10-02': { title: 'Mahatma Gandhi Jayanti', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2024-10-12': { title: 'Dussehra (Vijayadashami)', remarks: 'National Festival Holiday - Campus Closed' },
    '2024-10-31': { title: 'Diwali (Deepavali)', remarks: 'National Festival Holiday - Campus Closed' },
    '2024-11-02': { title: 'Govardhan Puja', remarks: 'State Festival Holiday - Campus Closed' },
    '2024-11-03': { title: 'Bhai Dooj', remarks: 'Campus Festival Holiday - Closed' },
    '2024-11-15': { title: 'Guru Nanak Jayanti', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2024-12-25': { title: 'Christmas Day', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2024-12-26': { title: 'Winter Academic Recess', remarks: 'Term Break - University Closed' },
    '2024-12-27': { title: 'Winter Academic Recess', remarks: 'Term Break - University Closed' },
    '2024-12-28': { title: 'Winter Academic Recess', remarks: 'Term Break - University Closed' },
    '2024-12-29': { title: 'Winter Academic Recess', remarks: 'Term Break - University Closed' },
    '2024-12-30': { title: 'Winter Academic Recess', remarks: 'Term Break - University Closed' },

    // =========================================================================
    // YEAR 2025
    // =========================================================================
    '2025-01-01': { title: "New Year's Day", remarks: 'Campus Academic Holiday - Campus Closed' },
    '2025-01-26': { title: 'Republic Day', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2025-02-26': { title: 'Maha Shivratri', remarks: 'Gazetted Religious Holiday - Campus Closed' },
    '2025-03-14': { title: 'Holi (Festival of Colors)', remarks: 'National Festival Holiday - Campus Closed' },
    '2025-03-31': { title: 'Eid-ul-Fitr', remarks: 'Gazetted Festival Holiday - Campus Closed' },
    '2025-04-10': { title: 'Mahavir Jayanti', remarks: 'Gazetted Holiday - Campus Closed' },
    '2025-04-14': { title: 'Dr. B. R. Ambedkar Jayanti', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2025-04-18': { title: 'Good Friday', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2025-05-12': { title: 'Buddha Purnima', remarks: 'Gazetted Holiday - Campus Closed' },
    '2025-06-07': { title: 'Eid-ul-Adha (Bakrid)', remarks: 'Gazetted Festival Holiday - Campus Closed' },
    '2025-07-06': { title: 'Muharram', remarks: 'Gazetted Holiday - Campus Closed' },
    '2025-08-15': { title: 'Independence Day', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2025-08-16': { title: 'Janmashtami', remarks: 'Gazetted Festival Holiday - Campus Closed' },
    '2025-09-05': { title: 'Milad-un-Nabi (Eid-e-Milad)', remarks: 'Gazetted Holiday - Campus Closed' },
    '2025-10-02': { title: 'Mahatma Gandhi Jayanti & Dussehra', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2025-10-20': { title: 'Diwali (Deepavali)', remarks: 'National Festival Holiday - Campus Closed' },
    '2025-10-22': { title: 'Govardhan Puja', remarks: 'State Festival Holiday - Campus Closed' },
    '2025-10-23': { title: 'Bhai Dooj', remarks: 'Campus Festival Holiday - Closed' },
    '2025-11-05': { title: 'Guru Nanak Jayanti', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2025-12-25': { title: 'Christmas Day', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2025-12-26': { title: 'Winter Academic Recess', remarks: 'Term Break - University Closed' },
    '2025-12-27': { title: 'Winter Academic Recess', remarks: 'Term Break - University Closed' },
    '2025-12-28': { title: 'Winter Academic Recess', remarks: 'Term Break - University Closed' },
    '2025-12-29': { title: 'Winter Academic Recess', remarks: 'Term Break - University Closed' },
    '2025-12-30': { title: 'Winter Academic Recess', remarks: 'Term Break - University Closed' },

    // =========================================================================
    // YEAR 2026
    // =========================================================================
    '2026-01-01': { title: "New Year's Day", remarks: 'Campus Academic Holiday - Campus Closed' },
    '2026-01-12': { title: 'National Youth Day & Cultural Meet', remarks: 'University Youth Fest Special Campus Observance' },
    '2026-01-26': { title: 'Republic Day', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2026-02-14': { title: 'University Annual Sports Meet Day 1', remarks: 'Annual Athletics & Sports Championship - Classes Suspended' },
    '2026-02-15': { title: 'Maha Shivratri & Sports Meet Finals', remarks: 'Gazetted Religious Holiday & Sports Finals - Campus Closed' },
    '2026-02-28': { title: 'National Science Day Tech Expo', remarks: 'Inter-College STEM Exhibition - Academic Off' },
    '2026-03-03': { title: 'Holi (Festival of Colors)', remarks: 'National Festival Holiday - Campus Closed' },
    '2026-03-04': { title: 'Dhulandi Campus Festive Holiday', remarks: 'University Post-Holi Festival Off - Campus Closed' },
    '2026-03-20': { title: 'Eid-ul-Fitr', remarks: 'Gazetted Festival Holiday - Campus Closed' },
    '2026-04-03': { title: 'Good Friday', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2026-04-14': { title: 'Dr. B. R. Ambedkar Jayanti', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2026-04-18': { title: 'Annual Cultural Fest "TechnoPulse" Day 1', remarks: 'Mega Inter-University Cultural Extravaganza - Classes Off' },
    '2026-04-19': { title: 'Annual Cultural Fest "TechnoPulse" Day 2', remarks: 'Celebrity Night & Cultural Competitions - Campus Celebration' },
    '2026-05-01': { title: 'Buddha Purnima & International Workers Day', remarks: 'Gazetted Holiday - Campus Closed' },
    '2026-05-27': { title: 'Eid-ul-Adha (Bakrid)', remarks: 'Gazetted Festival Holiday - Campus Closed' },
    '2026-06-25': { title: 'Muharram', remarks: 'Gazetted Holiday - Campus Closed' },
    '2026-08-15': { title: 'Independence Day (80th Independence Day)', remarks: 'National Flag Hoisting & Celebrations' },
    '2026-08-28': { title: 'Raksha Bandhan Festival', remarks: 'Campus Festival Observance - Closed' },
    '2026-09-04': { title: 'Janmashtami Celebrations', remarks: 'Gazetted Festival Holiday - Campus Closed' },
    '2026-09-15': { title: 'Engineers Day & Project Showcase', remarks: 'Honorary Sir M. Visvesvaraya Memorial Observance & Hackathon' },
    '2026-10-02': { title: 'Mahatma Gandhi Jayanti', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2026-10-24': { title: 'University Foundation Day & Convocation', remarks: 'Official Foundation Gala & Degree Distribution Ceremony - Academic Off' },
    '2026-11-08': { title: 'Diwali', remarks: 'Diwali (Deepavali) Festival - Campus Closed' },
    '2026-11-15': { title: 'Guru Nanak Jayanti & Kartik Purnima', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2026-11-20': { title: 'Alumni Homecoming & Tech Summit', remarks: 'Annual Global Alumni Meet - Academic Lectures Excused' },
    '2026-12-25': { title: 'Christmas Day', remarks: 'National Gazetted Holiday - Campus Closed' },

    // =========================================================================
    // YEAR 2027
    // =========================================================================
    '2027-01-01': { title: "New Year's Day", remarks: 'Campus Academic Holiday - Campus Closed' },
    '2027-01-26': { title: 'Republic Day (78th Republic Day)', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2027-03-06': { title: 'Maha Shivratri', remarks: 'Gazetted Religious Holiday - Campus Closed' },
    '2027-03-22': { title: 'Holi (Festival of Colors)', remarks: 'National Festival Holiday - Campus Closed' },
    '2027-03-26': { title: 'Good Friday', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2027-04-10': { title: 'Eid-ul-Fitr', remarks: 'Gazetted Festival Holiday - Campus Closed' },
    '2027-04-14': { title: 'Dr. B. R. Ambedkar Jayanti', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2027-04-19': { title: 'Mahavir Jayanti', remarks: 'Gazetted Holiday - Campus Closed' },
    '2027-05-20': { title: 'Buddha Purnima', remarks: 'Gazetted Holiday - Campus Closed' },
    '2027-06-16': { title: 'Eid-ul-Adha (Bakrid)', remarks: 'Gazetted Festival Holiday - Campus Closed' },
    '2027-07-16': { title: 'Muharram', remarks: 'Gazetted Holiday - Campus Closed' },
    '2027-08-15': { title: 'Independence Day (81st Independence Day)', remarks: 'National Flag Hoisting & Celebrations' },
    '2027-08-27': { title: 'Raksha Bandhan Festival', remarks: 'Campus Festival Observance - Closed' },
    '2027-09-04': { title: 'Janmashtami Celebrations', remarks: 'Gazetted Festival Holiday - Campus Closed' },
    '2027-10-02': { title: 'Mahatma Gandhi Jayanti', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2027-10-09': { title: 'Dussehra (Vijayadashami)', remarks: 'National Festival Holiday - Campus Closed' },
    '2027-10-29': { title: 'Diwali (Deepavali) Festival', remarks: 'National Festival Holiday - Campus Closed' },
    '2027-10-31': { title: 'Govardhan Puja', remarks: 'State Festival Holiday - Campus Closed' },
    '2027-11-01': { title: 'Bhai Dooj Festive Holiday', remarks: 'Campus Festival Holiday - Closed' },
    '2027-11-14': { title: 'Guru Nanak Jayanti', remarks: 'National Gazetted Holiday - Campus Closed' },
    '2027-12-25': { title: 'Christmas Day', remarks: 'National Gazetted Holiday - Campus Closed' }
};

// =============================================================================
// CONTINUOUS ACADEMIC VACATIONS & RECESS PERIODS (2023 - 2027)
// Rule:
// Odd Semesters: July 16 - Dec 15 | Winter Break: Dec 16 - Jan 01
// Even Semesters: Jan 02 - May 15 | Summer Vacation: May 16 - July 14 (15 days May + June + July 14)
// Extended Festival Breaks: Diwali (5-6 days), Dussehra (5 days), Holi (3-4 days)
// =============================================================================
const ACADEMIC_VACATIONS = [
    // 2023 Vacations
    { title: 'Holi Festive Break 2023', startDate: '2023-03-07', endDate: '2023-03-09', type: 'Special Recess', academicYear: '2022-2023', remarks: 'Holi Festival Extended Vacation (3 days) - Campus closed' },
    { title: 'Summer Vacation 2023', startDate: '2023-05-16', endDate: '2023-07-14', type: 'Summer Vacation', academicYear: '2022-2023', remarks: 'Annual Summer Vacation Recess (May 16 - July 14, 60 days) - All academic classes suspended' },
    { title: 'Autumn Recess & Dussehra Break 2023', startDate: '2023-10-21', endDate: '2023-10-25', type: 'Semester Break', academicYear: '2023-2024', remarks: 'Autumn festive break & mid-semester recess (5 days)' },
    { title: 'Diwali Festive Break 2023', startDate: '2023-11-03', endDate: '2023-11-12', type: 'Diwali Vacation', academicYear: '2023-2024', remarks: 'Diwali Festive Recess (03 Nov - 12 Nov, 10 days) - Campus closed' },
    { title: 'Winter Vacation 2023-24', startDate: '2023-12-16', endDate: '2024-01-01', type: 'Winter Vacation', academicYear: '2023-2024', remarks: 'Annual Winter Vacation & Term Break (Dec 16 - Jan 01, 17 days)' },

    // 2024 Vacations
    { title: 'Holi Festive Break 2024', startDate: '2024-03-24', endDate: '2024-03-26', type: 'Special Recess', academicYear: '2023-2024', remarks: 'Holi Festival Extended Vacation (3 days) - Campus closed' },
    { title: 'Summer Vacation 2024', startDate: '2024-05-16', endDate: '2024-07-14', type: 'Summer Vacation', academicYear: '2023-2024', remarks: 'Annual Summer Vacation Recess (May 16 - July 14, 60 days) - Campus closed' },
    { title: 'Dussehra & Autumn Recess 2024', startDate: '2024-10-10', endDate: '2024-10-14', type: 'Semester Break', academicYear: '2024-2025', remarks: 'Autumn vacation & term pause (5 days)' },
    { title: 'Diwali Festive Break 2024', startDate: '2024-10-30', endDate: '2024-11-04', type: 'Diwali Vacation', academicYear: '2024-2025', remarks: 'Diwali & Govardhan Puja Holiday Vacation (6 days)' },
    { title: 'Winter Vacation 2024-25', startDate: '2024-12-16', endDate: '2025-01-01', type: 'Winter Vacation', academicYear: '2024-2025', remarks: 'Annual Winter Recess & Year-End Break (Dec 16 - Jan 01, 17 days)' },

    // 2025 Vacations
    { title: 'Holi Festive Break 2025', startDate: '2025-03-13', endDate: '2025-03-15', type: 'Special Recess', academicYear: '2024-2025', remarks: 'Holi Festival Extended Vacation (3 days) - Campus closed' },
    { title: 'Summer Vacation 2025', startDate: '2025-05-16', endDate: '2025-07-14', type: 'Summer Vacation', academicYear: '2024-2025', remarks: 'Annual Summer Vacation Recess (May 16 - July 14, 60 days) - Campus closed' },
    { title: 'Dussehra & Autumn Recess 2025', startDate: '2025-10-01', endDate: '2025-10-05', type: 'Semester Break', academicYear: '2025-2026', remarks: 'Autumn Dussehra break & mid-semester pause (5 days)' },
    { title: 'Diwali Festive Break 2025', startDate: '2025-10-19', endDate: '2025-10-24', type: 'Diwali Vacation', academicYear: '2025-2026', remarks: 'Diwali Festive Vacation Recess (6 days)' },
    { title: 'Winter Vacation 2025-26', startDate: '2025-12-16', endDate: '2026-01-01', type: 'Winter Vacation', academicYear: '2025-2026', remarks: 'Annual Winter Recess & Term Break (Dec 16 - Jan 01, 17 days)' },

    // 2026 Vacations & Examinations
    { title: 'Holi Festive Break 2026', startDate: '2026-03-02', endDate: '2026-03-05', type: 'Special Recess', academicYear: '2025-2026', remarks: 'Holi & Dhulandi Extended Campus Festival Vacation (4 days)' },
    { title: 'Summer Vacation 2026', startDate: '2026-05-16', endDate: '2026-07-14', type: 'Summer Vacation', academicYear: '2025-2026', remarks: 'Annual Summer Vacation Recess (May 16 - July 14, 60 days) - All academic operations suspended' },
    { title: 'Mid Semester Examination 2026', startDate: '2026-10-05', endDate: '2026-10-07', type: 'Semester Break', isExam: true, academicYear: '2026-2027', remarks: 'Official Mid Semester Examination (05 Oct - 07 Oct, 3 days) • Written & Practical Evaluations' },
    { title: 'Diwali Festive Vacation 2026', startDate: '2026-11-03', endDate: '2026-11-12', type: 'Diwali Vacation', academicYear: '2026-2027', remarks: 'Official Diwali Vacation (03 Nov - 12 Nov, 10 days) • 8 Nov: Diwali' },
    { title: 'End Semester Examination 2026', startDate: '2026-11-23', endDate: '2026-12-03', type: 'Semester Break', isExam: true, academicYear: '2026-2027', remarks: 'Official End Semester University Examination (23 Nov - 03 Dec, 11 days) • Final Theory & Lab Board Exams' },
    { title: 'Winter Vacation 2026-27', startDate: '2026-12-16', endDate: '2027-01-01', type: 'Winter Vacation', academicYear: '2026-2027', remarks: 'Annual Winter Vacation & New Year Recess (Dec 16 - Jan 01, 17 days)' },

    // 2027 Vacations
    { title: 'Holi Festive Break 2027', startDate: '2027-03-21', endDate: '2027-03-24', type: 'Special Recess', academicYear: '2026-2027', remarks: 'Holi Extended Campus Festival Vacation (4 days)' },
    { title: 'Summer Vacation 2027', startDate: '2027-05-16', endDate: '2027-07-14', type: 'Summer Vacation', academicYear: '2026-2027', remarks: 'Annual Summer Vacation Recess (May 16 - July 14, 60 days)' },
    { title: 'Dussehra & Autumn Recess 2027', startDate: '2027-10-08', endDate: '2027-10-12', type: 'Semester Break', academicYear: '2027-2028', remarks: 'Dussehra festival & mid-term recess (5 days)' },
    { title: 'Diwali Festive Vacation 2027', startDate: '2027-10-27', endDate: '2027-11-01', type: 'Diwali Vacation', academicYear: '2027-2028', remarks: 'Diwali & Govardhan Puja Official Festival Break (6 days)' },
    { title: 'Winter Vacation 2027-28', startDate: '2027-12-16', endDate: '2028-01-01', type: 'Winter Vacation', academicYear: '2027-2028', remarks: 'Annual Winter Vacation & New Year Recess (Dec 16 - Jan 01, 17 days)' }
];

/**
 * Check if a date falls inside any officially declared continuous vacation
 */
function getVacationForDate(dateStr) {
    if (!dateStr) return null;
    for (const v of ACADEMIC_VACATIONS) {
        if (dateStr >= v.startDate && dateStr <= v.endDate) {
            return {
                isVacation: !v.isExam,
                isExam: Boolean(v.isExam),
                title: v.title,
                vacationType: v.type,
                academicYear: v.academicYear,
                remarks: v.remarks
            };
        }
    }
    return null;
}

/**
 * Get holiday details for any specific date
 */
function getHolidayForDate(dateStr) {
    // 1. Direct gazetted holiday match
    if (ACADEMIC_HOLIDAYS[dateStr]) {
        return ACADEMIC_HOLIDAYS[dateStr];
    }
    // 2. Check continuous vacation match
    const vac = getVacationForDate(dateStr);
    if (vac) {
        return {
            title: vac.title,
            remarks: vac.remarks,
            isVacation: true,
            vacationType: vac.vacationType
        };
    }
    return null;
}

/**
 * Calculate the academic semester (1 to 8) for a student on a specific date
 * based on their university admission date.
 */
function getSemesterForDate(admissionDateStr, targetDateStr) {
    const adm = new Date(admissionDateStr || '2025-07-15');
    const tgt = new Date(targetDateStr);

    const admYear = adm.getFullYear();
    const tgtYear = tgt.getFullYear();
    const tgtMonth = tgt.getMonth() + 1; // 1-12

    // Prior to admission date
    if (tgt < adm) return null;

    // Odd semester: July (7) to December (12)
    // Even semester: January (1) to June (6)
    const yearDiff = tgtYear - admYear;
    const isOdd = tgtMonth >= 7 && tgtMonth <= 12;

    let sem = (yearDiff * 2) + (isOdd ? 1 : 0);
    if (sem < 1) sem = 1;
    if (sem > 8) sem = 8;
    return sem;
}

module.exports = {
    ACADEMIC_HOLIDAYS,
    ACADEMIC_VACATIONS,
    getHolidayForDate,
    getVacationForDate,
    getSemesterForDate
};

