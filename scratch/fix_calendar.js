const fs = require('fs');
let html = fs.readFileSync('public/dashboard.html', 'utf8');

const regex = /            <!-- ============================================================\r?\n                 VIEW: UNIVERSITY ACADEMIC CALENDAR & HOLIDAYS \(SECTIONS 2, 3 & 4\)\r?\n                 ============================================================ -->\r?\n            <main class="dashboard-content portal-view" id="view-calendar" style="display: none;">[\s\S]*?<\/main>\r?\n/g;

html = html.replace(regex, '');

const markTarget = '            <!-- ============================================================\r\n                 VIEW 4: MARKS & GRADES MODULE';
const markTargetLF = '            <!-- ============================================================\n                 VIEW 4: MARKS & GRADES MODULE';

const block = `            <!-- ============================================================
                 VIEW: UNIVERSITY ACADEMIC CALENDAR & HOLIDAYS (SECTIONS 2, 3 & 4)
                 ============================================================ -->
            <main class="dashboard-content portal-view" id="view-calendar" style="display: none;">
                <div class="dashboard-greeting" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; margin-bottom: 20px;">
                    <div>
                        <h1 class="greeting-title" style="display: flex; align-items: center; gap: 10px;">
                            <i class="fa-solid fa-calendar-days" style="color: #002b66;"></i> University Academic Calendar
                        </h1>
                        <p class="greeting-subtitle">Authoritative multi-year institutional schedule (2023–2027) with authentic vacations, festival recesses, and gazetted holidays.</p>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        <button type="button" class="btn-erp-action" onclick="openAcademicVacationsModal()" title="View Continuous Vacations & Gazetted Holidays">
                            <i class="fa-solid fa-umbrella-beach"></i> Vacations List
                        </button>
                        <button type="button" class="btn-secondary-action" onclick="switchPortalView('attendance')">
                            <i class="fa-regular fa-calendar-check"></i> Back to Attendance
                        </button>
                    </div>
                </div>

                <div class="erp-filters-card" style="background: #ffffff; border: 1px solid #dce4ec; border-radius: 14px; padding: 18px 22px; margin-bottom: 24px; box-shadow: 0 4px 14px rgba(0, 43, 102, 0.04);">
                    <!-- 1. Year Selector Bar (2023 to 2027) -->
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid #e2e8f0;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 0.85rem; font-weight: 800; color: #475569; text-transform: uppercase;"><i class="fa-solid fa-graduation-cap"></i> Academic Year:</span>
                            <div class="acad-year-pills" id="page-acad-year-pills-container">
                                <button type="button" class="acad-year-pill" id="page-acad-yr-2023" onclick="selectAcadCalendarYear(2023)">2023</button>
                                <button type="button" class="acad-year-pill" id="page-acad-yr-2024" onclick="selectAcadCalendarYear(2024)">2024</button>
                                <button type="button" class="acad-year-pill" id="page-acad-yr-2025" onclick="selectAcadCalendarYear(2025)">2025</button>
                                <button type="button" class="acad-year-pill active" id="page-acad-yr-2026" onclick="selectAcadCalendarYear(2026)">2026</button>
                                <button type="button" class="acad-year-pill" id="page-acad-yr-2027" onclick="selectAcadCalendarYear(2027)">2027</button>
                            </div>
                        </div>
                        
                        <!-- Category Filters -->
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                            <button type="button" class="cal-filter-pill active" id="page-acad-cat-all" onclick="setAcadCalendarFilter('ALL')">All Dates</button>
                            <button type="button" class="cal-filter-pill" id="page-acad-cat-vacations" onclick="setAcadCalendarFilter('VACATIONS')"><i class="fa-solid fa-umbrella-beach"></i> Extended Vacations</button>
                            <button type="button" class="cal-filter-pill" id="page-acad-cat-national" onclick="setAcadCalendarFilter('NATIONAL')"><i class="fa-solid fa-flag"></i> National Gazetted</button>
                            <button type="button" class="cal-filter-pill" id="page-acad-cat-festivals" onclick="setAcadCalendarFilter('FESTIVALS')"><i class="fa-solid fa-gifts"></i> Festival Breaks</button>
                        </div>
                    </div>

                    <!-- 2. Month Selector & Navigation Bar -->
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 18px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <button type="button" class="cal-arrow-btn" onclick="navAcadCalendarMonth(-1)" title="Previous Month">
                                <i class="fa-solid fa-chevron-left"></i>
                            </button>
                            <h2 id="page-acad-cal-month-title" style="margin: 0; font-size: 1.35rem; font-weight: 800; color: #002b66; min-width: 180px;">
                                November 2026
                            </h2>
                            <button type="button" class="cal-arrow-btn" onclick="navAcadCalendarMonth(1)" title="Next Month">
                                <i class="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                        
                        <!-- Quick Month Chips (Jan to Dec) -->
                        <div class="acad-month-chips" id="page-acad-month-chips-container">
                            <!-- Rendered dynamically via renderAcadCalendarView() -->
                        </div>
                    </div>

                    <!-- 3. Dual Section: Interactive Month Grid + Month Ledger -->
                    <div style="display: grid; grid-template-columns: 1.35fr 1fr; gap: 20px; margin-bottom: 18px;">
                        <!-- Left: Interactive Calendar Grid -->
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px;">
                            <div class="acad-cal-grid" style="margin-bottom: 8px;">
                                <div class="acad-cal-day-header" style="color: #dc2626;">Sun</div>
                                <div class="acad-cal-day-header">Mon</div>
                                <div class="acad-cal-day-header">Tue</div>
                                <div class="acad-cal-day-header">Wed</div>
                                <div class="acad-cal-day-header">Thu</div>
                                <div class="acad-cal-day-header">Fri</div>
                                <div class="acad-cal-day-header" style="color: #dc2626;">Sat</div>
                            </div>
                            <div class="acad-cal-grid" id="page-acad-cal-days-grid">
                                <!-- Populated dynamically via renderAcadCalendarView() -->
                            </div>
                            
                            <!-- Grid Legend -->
                            <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 0.78rem; font-weight: 700;">
                                <span style="display: flex; align-items: center; gap: 5px; color: #7c3aed;"><span style="width: 10px; height: 10px; background: #7c3aed; border-radius: 50%;"></span> Continuous Vacation</span>
                                <span style="display: flex; align-items: center; gap: 5px; color: #16a34a;"><span style="width: 10px; height: 10px; background: #16a34a; border-radius: 50%;"></span> Gazetted Holiday</span>
                                <span style="display: flex; align-items: center; gap: 5px; color: #d97706;"><span style="width: 10px; height: 10px; background: #d97706; border-radius: 50%;"></span> Festival Break</span>
                                <span style="display: flex; align-items: center; gap: 5px; color: #94a3b8;"><span style="width: 10px; height: 10px; background: #94a3b8; border-radius: 50%;"></span> Weekend Off</span>
                            </div>
                        </div>

                        <!-- Right: Selected Month Holiday / Vacation Ledger -->
                        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; display: flex; flex-direction: column;">
                            <div style="font-size: 1rem; font-weight: 800; color: #002b66; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
                                <span><i class="fa-solid fa-list-check"></i> Month Schedule & Events</span>
                                <span id="page-acad-events-count-badge" class="duration-badge" style="background: #f1f5f9; color: #334155;">0 Events</span>
                            </div>
                            
                            <div id="page-acad-month-events-list" style="display: flex; flex-direction: column; gap: 10px; overflow-y: auto; max-height: 440px; padding-right: 4px;">
                                <!-- Populated dynamically via renderAcadCalendarView() -->
                            </div>
                        </div>
                    </div>

                    <!-- Footer ERP Policy Disclaimer -->
                    <div style="padding: 12px 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; font-size: 0.82rem; color: #166534; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-circle-check"></i> <strong>University ERP Policy:</strong> All officially scheduled continuous vacations (Summer Recess, Winter Break, Diwali Vacation) and national gazetted holidays are designated non-working university days and are fully excused from student absence metrics.
                    </div>
                </div>
            </main>

`;

if (html.includes(markTarget)) {
    html = html.replace(markTarget, block + markTarget);
} else if (html.includes(markTargetLF)) {
    html = html.replace(markTargetLF, block + markTargetLF);
}

fs.writeFileSync('public/dashboard.html', html, 'utf8');
console.log('Cleaned and set exactly 1 view-calendar');

