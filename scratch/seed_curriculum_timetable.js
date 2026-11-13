const { run, get, all } = require('../database/database');

async function seedFieldCurriculumAndTimetable() {
    console.log('Seeding authentic department-wise courses, timetable, and assignments...');

    // 1. Department Courses Definitions
    const deptCourses = {
        CSE: [
            { code: 'CS101', title: 'Problem Solving & C Programming', credits: 4 },
            { code: 'CS102', title: 'Data Structures & Algorithms', credits: 4 },
            { code: 'CS201', title: 'Database Management Systems', credits: 4 },
            { code: 'CS202', title: 'Computer Networks & Security', credits: 3 },
            { code: 'CS301', title: 'Operating Systems & Shell Internals', credits: 4 },
            { code: 'CS401', title: 'Cloud Computing & Full-Stack Web', credits: 3 }
        ],
        ECE: [
            { code: 'EC101', title: 'Semiconductor Devices & Network Analysis', credits: 4 },
            { code: 'EC102', title: 'Digital Logic & Microprocessors', credits: 4 },
            { code: 'EC201', title: 'Signals, Systems & Transforms', credits: 4 },
            { code: 'EC202', title: 'Analog Communication Systems', credits: 3 },
            { code: 'EC301', title: 'VLSI Circuit Design & CMOS Tech', credits: 4 },
            { code: 'EC401', title: 'Wireless & Optical Communication', credits: 3 }
        ],
        ME: [
            { code: 'ME101', title: 'Engineering Mechanics (Statics & Dynamics)', credits: 4 },
            { code: 'ME102', title: 'Thermodynamics & Heat Transfer', credits: 4 },
            { code: 'ME201', title: 'Fluid Mechanics & Hydraulic Machinery', credits: 4 },
            { code: 'ME202', title: 'Mechanics of Solids & Strength of Materials', credits: 3 },
            { code: 'ME301', title: 'Kinematics & Dynamics of Machinery', credits: 4 },
            { code: 'ME401', title: 'Robotics & Industrial Automation', credits: 3 }
        ],
        CE: [
            { code: 'CE101', title: 'Surveying & Geomatics Fieldwork', credits: 4 },
            { code: 'CE102', title: 'Structural Analysis & Mechanics', credits: 4 },
            { code: 'CE201', title: 'Concrete Technology & IS456 Mix Design', credits: 4 },
            { code: 'CE202', title: 'Fluid Mechanics & Open Channel Hydraulics', credits: 3 },
            { code: 'CE301', title: 'Environmental Engineering & Water Supply', credits: 4 },
            { code: 'CE401', title: 'Transportation & Highway Engineering', credits: 3 }
        ],
        EE: [
            { code: 'EE101', title: 'Electric Circuit Theory & Networks', credits: 4 },
            { code: 'EE102', title: 'Electrical Machines & Transformers', credits: 4 },
            { code: 'EE201', title: 'Transmission & Power System Analysis', credits: 4 },
            { code: 'EE202', title: 'Linear Automatic Control Systems', credits: 3 },
            { code: 'EE301', title: 'Power Electronics Converters & Drives', credits: 4 },
            { code: 'EE401', title: 'Renewable Energy & Smart Grid Systems', credits: 3 }
        ],
        IT: [
            { code: 'IT101', title: 'Python Programming & Problem Solving', credits: 4 },
            { code: 'IT102', title: 'Object-Oriented Programming (Java/C++)', credits: 4 },
            { code: 'IT201', title: 'Relational Database & Advanced SQL', credits: 4 },
            { code: 'IT202', title: 'Web Application Development & REST APIs', credits: 3 },
            { code: 'IT301', title: 'Information Security & Cryptography', credits: 4 },
            { code: 'IT401', title: 'Big Data Engineering & Apache Spark', credits: 3 }
        ],
        BT: [
            { code: 'BT101', title: 'Cell Biology & Genetics', credits: 4 },
            { code: 'BT102', title: 'Biochemistry & Biomolecules', credits: 4 },
            { code: 'BT201', title: 'Bioprocess Engineering & Fermentation', credits: 4 },
            { code: 'BT202', title: 'Microbiology & Analytical Methods', credits: 3 },
            { code: 'BT301', title: 'Bioinformatics & Computational Genomics', credits: 4 },
            { code: 'BT401', title: 'Genetic Engineering & Recombinant DNA', credits: 3 }
        ],
        MBA: [
            { code: 'MB101', title: 'Principles of Management & Leadership Dynamics', credits: 4 },
            { code: 'MB102', title: 'Managerial Economics & Market Analysis', credits: 4 },
            { code: 'MB201', title: 'Financial Accounting & Corporate Valuation', credits: 4 },
            { code: 'MB202', title: 'Marketing Management & Consumer Insights', credits: 4 },
            { code: 'MB301', title: 'Operations Management & Supply Chain Logistics', credits: 4 },
            { code: 'MB401', title: 'Business Analytics, PowerBI & Decision Science', credits: 3 }
        ]
    };

    // Insert or update courses
    const departments = await all('SELECT id, code FROM departments');
    const deptIdMap = {};
    departments.forEach(d => { deptIdMap[d.code] = d.id; });

    const faculty = await all('SELECT id, department_id FROM faculty');
    const facByDept = {};
    faculty.forEach(f => {
        if (!facByDept[f.department_id]) facByDept[f.department_id] = [];
        facByDept[f.department_id].push(f.id);
    });

    for (const [code, cList] of Object.entries(deptCourses)) {
        const deptId = deptIdMap[code];
        if (!deptId) continue;
        const facList = facByDept[deptId] || [1];

        for (let i = 0; i < cList.length; i++) {
            const c = cList[i];
            const facId = facList[i % facList.length];
            const existing = await get('SELECT id FROM courses WHERE code = ?', [c.code]);
            if (existing) {
                await run(`UPDATE courses SET title = ?, department_id = ?, credits = ?, faculty_id = ? WHERE id = ?`,
                    [c.title, deptId, c.credits, facId, existing.id]);
            } else {
                await run(`INSERT INTO courses (code, title, credits, department_id, faculty_id, semester) VALUES (?, ?, ?, ?, ?, 1)`,
                    [c.code, c.title, c.credits, deptId, facId]);
            }
        }
    }

    // 2. Clear old timetable and seed clean department-specific timetables
    await run('DELETE FROM timetable');
    await run("DELETE FROM sqlite_sequence WHERE name='timetable'");

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const slots = [
        { start: '09:00', end: '10:00', type: 'Lecture' },
        { start: '10:15', end: '11:15', type: 'Lecture' },
        { start: '11:30', end: '12:30', type: 'Lecture' },
        { start: '01:30', end: '02:30', type: 'Practical Lab' },
        { start: '02:45', end: '04:15', type: 'Tutorial' }
    ];

    for (const [code, cList] of Object.entries(deptCourses)) {
        const deptId = deptIdMap[code];
        if (!deptId) continue;
        const facList = facByDept[deptId] || [1];
        const dbCourses = await all('SELECT id, code, title FROM courses WHERE department_id = ?', [deptId]);
        if (dbCourses.length === 0) continue;

        let courseIdx = 0;
        for (let di = 0; di < days.length; di++) {
            const day = days[di];
            for (let si = 0; si < slots.length; si++) {
                const slot = slots[si];
                const course = dbCourses[(di + si) % dbCourses.length];
                const facId = facList[courseIdx % facList.length];
                courseIdx++;

                const room = (slot.type === 'Practical Lab') 
                    ? `${code} Systems Lab ${Math.floor(si % 3) + 1}`
                    : `Lecture Hall ${code}-${100 + (di * 10) + si + 1}`;

                await run(`
                    INSERT INTO timetable (course_id, subject_id, faculty_id, department_id, day_of_week, start_time, end_time, room_number, semester)
                    VALUES (?, NULL, ?, ?, ?, ?, ?, ?, 1)
                `, [course.id, facId, deptId, day, slot.start, slot.end, room]);
            }
        }
    }

    // 3. Ensure assignments exist for MBA, BT, and other departments
    const extraAssignments = [
        // MBA
        { code: 'MB101', title: 'Strategic Leadership & Corporate Governance Analysis', desc: 'Case study analysis of Fortune 500 leadership failure, governance reform, and stakeholder dynamics.', due: '2026-11-20', status: 'Pending' },
        { code: 'MB102', title: 'Managerial Economics - Price Elasticity & Market Strategy', desc: 'Quantitative evaluation of consumer demand shifts, marginal revenue optimization, and monopolistic competition.', due: '2026-11-24', status: 'Pending' },
        { code: 'MB201', title: 'Corporate Finance - DCF Valuation & Capital Budgeting', desc: 'Build 5-year discounted cash flow valuation model with WACC calculation and sensitivity matrices.', due: '2026-11-28', status: 'Pending' },
        { code: 'MB202', title: 'Marketing Management - Brand Equity & Omni-Channel Campaign', desc: 'Develop full-scale go-to-market digital positioning and customer journey acquisition model.', due: '2026-12-02', status: 'Pending' },
        { code: 'MB301', title: 'Operations Management - Supply Chain Network Simulation', desc: 'Simulate multi-echelon inventory control and vehicle routing optimization with cost minimization.', due: '2026-10-20', descDone: 'Submitted and approved by department faculty.', status: 'Completed', grade: 'A+', marks: 49 },

        // BT
        { code: 'BT101', title: 'Recombinant DNA - Plasmid Vector Cloning & Restriction Mapping', desc: 'Design in-silico restriction digestion map for pUC19 plasmid vector with multiple cloning sites.', due: '2026-11-20', status: 'Pending' },
        { code: 'BT201', title: 'Bioprocess Engineering - Microbial Fermentation Kinetics', desc: 'Calculate Monod growth constants, substrate consumption rates, and batch bioreactor volumetric yield.', due: '2026-11-25', status: 'Pending' },
        { code: 'BT301', title: 'Bioinformatics - BLAST Sequence Alignment & Phylogenetic Tree', desc: 'Perform multi-sequence alignment of protein homologous sequences using ClustalW and Neighbor-Joining.', due: '2026-11-29', status: 'Pending' },
        { code: 'BT102', title: 'Biochemistry - Protein Purification Chromatography Report', desc: 'Experimental report on ion exchange and size-exclusion chromatography resolution of enzymes.', due: '2026-10-20', status: 'Completed', grade: 'A+', marks: 48 }
    ];

    for (const a of extraAssignments) {
        const c = await get('SELECT id, department_id, faculty_id FROM courses WHERE code = ?', [a.code]);
        if (!c) continue;
        const existing = await get('SELECT id FROM assignments WHERE title = ?', [a.title]);
        if (!existing) {
            await run(`
                INSERT INTO assignments (title, description, course_id, subject_id, faculty_id, due_date, max_marks)
                VALUES (?, ?, ?, NULL, ?, ?, 50)
            `, [a.title, a.desc, c.id, c.faculty_id || 1, a.due]);
        }
    }

    const tCount = await get('SELECT count(*) as count FROM timetable');
    const cCount = await get('SELECT count(*) as count FROM courses');
    const aCount = await get('SELECT count(*) as count FROM assignments');
    console.log(`✅ Success! Timetable rows: ${tCount.count}, Courses: ${cCount.count}, Assignments: ${aCount.count}`);
}

seedFieldCurriculumAndTimetable().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
