/**
 * Authoritative Curriculum Catalog for Smart Campus Management System
 * Defines 8-semester accredited curriculum across all departments:
 * 1. CSE - Computer Science & Engineering
 * 2. ECE - Electronics & Communication
 * 3. ME  - Mechanical Engineering
 * 4. CE  - Civil Engineering
 * 5. EE  - Electrical Engineering
 * 6. IT  - Information Technology
 * 7. BT  - Biotechnology & Bioinformatics
 * 8. MBA - Management Studies
 */

const CURRICULUM = {
    CSE: {
        1: [
            { code: 'CS101', title: 'Problem Solving & C Programming', credits: 4 },
            { code: 'MA101', title: 'Engineering Mathematics I (Calculus & Linear Algebra)', credits: 4 },
            { code: 'PH101', title: 'Engineering Physics & Semiconductor Devices', credits: 3 },
            { code: 'CS102', title: 'Digital Logic & Binary Systems', credits: 3 },
            { code: 'CS103', title: 'Computer Programming Laboratory', credits: 2 }
        ],
        2: [
            { code: 'CS201', title: 'Object-Oriented Programming (Java)', credits: 4 },
            { code: 'MA102', title: 'Engineering Mathematics II (Differential Equations)', credits: 4 },
            { code: 'CS202', title: 'Discrete Mathematics & Graph Theory', credits: 3 },
            { code: 'EE101', title: 'Basic Electrical & Electronics Engineering', credits: 3 },
            { code: 'CS203', title: 'Data Structures & OOP Practicum', credits: 2 }
        ],
        3: [
            { code: 'CS301', title: 'Data Structures & Algorithms', credits: 4 },
            { code: 'CS302', title: 'Database Management Systems', credits: 4 },
            { code: 'CS303', title: 'Computer Organization & Architecture', credits: 3 },
            { code: 'CS304', title: 'Principles of Programming Languages', credits: 3 },
            { code: 'CS305', title: 'DBMS & Advanced SQL Laboratory', credits: 2 }
        ],
        4: [
            { code: 'CS401', title: 'Operating Systems Internals & Shell', credits: 4 },
            { code: 'CS402', title: 'Theory of Computation & Automata', credits: 4 },
            { code: 'CS403', title: 'Computer Networks & Security', credits: 3 },
            { code: 'CS404', title: 'Software Engineering & Agile Methodologies', credits: 3 },
            { code: 'CS405', title: 'Operating Systems & Linux Kernel Lab', credits: 2 }
        ],
        5: [
            { code: 'CS501', title: 'Design & Analysis of Algorithms', credits: 4 },
            { code: 'CS502', title: 'Artificial Intelligence & Machine Learning', credits: 4 },
            { code: 'CS503', title: 'Microprocessors & Embedded Systems', credits: 3 },
            { code: 'CS504', title: 'Web Technologies & Full-Stack Development', credits: 3 },
            { code: 'CS505', title: 'AI & Full-Stack Development Practicum', credits: 2 }
        ],
        6: [
            { code: 'CS601', title: 'Compiler Construction & Optimization', credits: 4 },
            { code: 'CS602', title: 'Cryptography & Cyber Security', credits: 4 },
            { code: 'CS603', title: 'Cloud Computing & DevOps Architecture', credits: 3 },
            { code: 'CS604', title: 'Data Science & Big Data Engineering', credits: 3 },
            { code: 'CS605', title: 'Cloud Infrastructure & CI/CD Lab', credits: 2 }
        ],
        7: [
            { code: 'CS701', title: 'Distributed Systems & Blockchain Technology', credits: 4 },
            { code: 'CS702', title: 'Deep Learning & Neural Network Architectures', credits: 4 },
            { code: 'CS703', title: 'Cyber Forensics & Threat Intelligence', credits: 3 },
            { code: 'CS704', title: 'Internet of Things & Edge Computing', credits: 3 },
            { code: 'CS705', title: 'Major Capstone Project - Phase 1', credits: 2 }
        ],
        8: [
            { code: 'CS801', title: 'Autonomous Robotics & Edge AI Systems', credits: 4 },
            { code: 'CS802', title: 'Natural Language Processing & LLMs', credits: 4 },
            { code: 'CS803', title: 'Engineering Economics & Tech Entrepreneurship', credits: 3 },
            { code: 'CS804', title: 'Major Capstone Project - Phase 2 (Implementation)', credits: 6 },
            { code: 'CS805', title: 'Comprehensive Technical Viva Voce', credits: 2 }
        ]
    },
    ECE: {
        1: [
            { code: 'EC101', title: 'Semiconductor Devices & Network Analysis', credits: 4 },
            { code: 'MA101', title: 'Engineering Mathematics I', credits: 4 },
            { code: 'PH101', title: 'Physics of Electromagnetic Fields', credits: 3 },
            { code: 'ME101', title: 'Engineering Drawing & CAD', credits: 3 },
            { code: 'EC102', title: 'Basic Electronics Workshop', credits: 2 }
        ],
        2: [
            { code: 'EC201', title: 'Electronic Circuits & Amplifiers', credits: 4 },
            { code: 'MA102', title: 'Engineering Mathematics II', credits: 4 },
            { code: 'CS101', title: 'Programming in C & Data Structures', credits: 3 },
            { code: 'EC202', title: 'Electrical Technology & Transformers', credits: 3 },
            { code: 'EC203', title: 'Analog Electronic Circuits Lab', credits: 2 }
        ],
        3: [
            { code: 'EC301', title: 'Digital Logic & Finite State Machines', credits: 4 },
            { code: 'EC302', title: 'Signals, Systems & Transforms', credits: 4 },
            { code: 'EC303', title: 'Electromagnetic Wave Propagation', credits: 3 },
            { code: 'EC304', title: 'Electronic Measurement & Instrumentation', credits: 3 },
            { code: 'EC305', title: 'Digital Electronics & Simulation Lab', credits: 2 }
        ],
        4: [
            { code: 'EC401', title: 'Analog Communication Systems', credits: 4 },
            { code: 'EC402', title: 'Microprocessors & Microcontrollers (8086/ARM)', credits: 4 },
            { code: 'EC403', title: 'Linear Integrated Circuits & Op-Amps', credits: 3 },
            { code: 'EC404', title: 'Automatic Control Systems', credits: 3 },
            { code: 'EC405', title: 'Microcontroller Programming Lab', credits: 2 }
        ],
        5: [
            { code: 'EC501', title: 'Digital Signal Processing & Filter Design', credits: 4 },
            { code: 'EC502', title: 'Digital Communication & Information Theory', credits: 4 },
            { code: 'EC503', title: 'VLSI Circuit Design & CMOS Technology', credits: 4 },
            { code: 'EC504', title: 'Transmission Lines & Waveguides', credits: 3 },
            { code: 'EC505', title: 'DSP & HDL Simulation Lab', credits: 2 }
        ],
        6: [
            { code: 'EC601', title: 'Wireless Communication, LTE & 5G', credits: 4 },
            { code: 'EC602', title: 'Embedded Systems & Real-Time Operating Systems', credits: 4 },
            { code: 'EC603', title: 'Microwave Engineering & Radar Systems', credits: 3 },
            { code: 'EC604', title: 'Optical Fiber Communication Systems', credits: 3 },
            { code: 'EC605', title: 'Embedded Systems & IoT Lab', credits: 2 }
        ],
        7: [
            { code: 'EC701', title: 'Satellite Communication & GPS Navigation', credits: 4 },
            { code: 'EC702', title: 'RF & Antenna Design Engineering', credits: 4 },
            { code: 'EC703', title: 'Biomedical Signal & Image Processing', credits: 3 },
            { code: 'EC704', title: 'Machine Learning for Signal Processing', credits: 3 },
            { code: 'EC705', title: 'Major Project Work - Phase 1', credits: 2 }
        ],
        8: [
            { code: 'EC801', title: 'Mobile Ad-Hoc & Sensor Networks', credits: 4 },
            { code: 'EC802', title: 'Nanoelectronics & MEMS Sensors', credits: 4 },
            { code: 'EC803', title: 'Telecom Regulatory & Project Management', credits: 3 },
            { code: 'EC804', title: 'Major Project Work - Phase 2', credits: 6 },
            { code: 'EC805', title: 'Technical Seminar & Viva Voce', credits: 2 }
        ]
    },
    ME: {
        1: [
            { code: 'ME101', title: 'Engineering Mechanics (Statics & Dynamics)', credits: 4 },
            { code: 'MA101', title: 'Engineering Mathematics I', credits: 4 },
            { code: 'PH101', title: 'Engineering Physics', credits: 3 },
            { code: 'ME102', title: 'Engineering Graphics & Computer Aided Drawing', credits: 3 },
            { code: 'ME103', title: 'Workshop Practice & Manufacturing Lab', credits: 2 }
        ],
        2: [
            { code: 'ME201', title: 'Material Science & Engineering Metallurgy', credits: 4 },
            { code: 'MA102', title: 'Engineering Mathematics II', credits: 4 },
            { code: 'CH101', title: 'Engineering Chemistry', credits: 3 },
            { code: 'ME202', title: 'Thermodynamics Fundamentals', credits: 3 },
            { code: 'ME203', title: 'Computer Aided Machine Drawing Lab', credits: 2 }
        ],
        3: [
            { code: 'ME301', title: 'Applied Thermodynamics & Heat Engines', credits: 4 },
            { code: 'ME302', title: 'Fluid Mechanics & Hydraulic Machinery', credits: 4 },
            { code: 'ME303', title: 'Mechanics of Solids & Strength of Materials', credits: 3 },
            { code: 'ME304', title: 'Manufacturing Processes I (Casting & Welding)', credits: 3 },
            { code: 'ME305', title: 'Fluid Mechanics & Thermal Engineering Lab', credits: 2 }
        ],
        4: [
            { code: 'ME401', title: 'Kinematics of Machinery & Mechanism Design', credits: 4 },
            { code: 'ME402', title: 'Manufacturing Processes II (Machining & Tooling)', credits: 4 },
            { code: 'ME403', title: 'Mechanical Measurements & Metrology', credits: 3 },
            { code: 'ME404', title: 'Industrial Engineering & Plant Layout', credits: 3 },
            { code: 'ME405', title: 'Machine Shop & Manufacturing Lab', credits: 2 }
        ],
        5: [
            { code: 'ME501', title: 'Dynamics of Machinery & Balancing', credits: 4 },
            { code: 'ME502', title: 'Design of Machine Elements I', credits: 4 },
            { code: 'ME503', title: 'Heat and Mass Transfer', credits: 4 },
            { code: 'ME504', title: 'Internal Combustion Engines & Gas Turbines', credits: 3 },
            { code: 'ME505', title: 'Heat Transfer & Dynamics Lab', credits: 2 }
        ],
        6: [
            { code: 'ME601', title: 'Design of Machine Elements II (Gear & Bearings)', credits: 4 },
            { code: 'ME602', title: 'Computational Fluid Dynamics (CFD)', credits: 4 },
            { code: 'ME603', title: 'Finite Element Analysis (FEA) for Engineers', credits: 3 },
            { code: 'ME604', title: 'Turbo Machinery & Power Plant Engineering', credits: 3 },
            { code: 'ME605', title: 'FEA & CFD Simulation Lab', credits: 2 }
        ],
        7: [
            { code: 'ME701', title: 'Robotics & Industrial Automation', credits: 4 },
            { code: 'ME702', title: 'Mechatronics & Programmable Logic Controllers', credits: 4 },
            { code: 'ME703', title: 'Renewable Energy & Solar Thermal Systems', credits: 3 },
            { code: 'ME704', title: 'Total Quality Management & Operations Research', credits: 3 },
            { code: 'ME705', title: 'Major Capstone Project - Phase 1', credits: 2 }
        ],
        8: [
            { code: 'ME801', title: 'Automobile Engineering & Electric Vehicles', credits: 4 },
            { code: 'ME802', title: 'Supply Chain Management & Smart Logistics', credits: 4 },
            { code: 'ME803', title: 'Industrial Safety & Environmental Auditing', credits: 3 },
            { code: 'ME804', title: 'Major Capstone Project - Phase 2 (Fabrication)', credits: 6 },
            { code: 'ME805', title: 'Comprehensive Technical Defense & Viva', credits: 2 }
        ]
    },
    CE: {
        1: [
            { code: 'CE101', title: 'Engineering Mechanics & Statics', credits: 4 },
            { code: 'MA101', title: 'Engineering Mathematics I', credits: 4 },
            { code: 'PH101', title: 'Engineering Physics', credits: 3 },
            { code: 'CE102', title: 'Basic Surveying Fieldwork I', credits: 3 },
            { code: 'CE103', title: 'Civil Engineering Drawing & CAD Lab', credits: 2 }
        ],
        2: [
            { code: 'CE201', title: 'Building Materials & Modern Construction', credits: 4 },
            { code: 'MA102', title: 'Engineering Mathematics II', credits: 4 },
            { code: 'CH101', title: 'Environmental Chemistry', credits: 3 },
            { code: 'CE202', title: 'Mechanics of Deformable Solids', credits: 3 },
            { code: 'CE203', title: 'Building Materials Testing Lab', credits: 2 }
        ],
        3: [
            { code: 'CE301', title: 'Advanced Surveying & Geomatics', credits: 4 },
            { code: 'CE302', title: 'Fluid Mechanics & Open Channel Hydraulics', credits: 4 },
            { code: 'CE303', title: 'Structural Analysis I (Determinate Structures)', credits: 3 },
            { code: 'CE304', title: 'Engineering Geology & Rock Mechanics', credits: 3 },
            { code: 'CE305', title: 'Surveying Field Camp & Fluid Lab', credits: 2 }
        ],
        4: [
            { code: 'CE401', title: 'Concrete Technology & Mix Proportioning', credits: 4 },
            { code: 'CE402', title: 'Structural Analysis II (Indeterminate Structures)', credits: 4 },
            { code: 'CE403', title: 'Soil Mechanics & Geotechnical Engineering I', credits: 3 },
            { code: 'CE404', title: 'Transportation & Highway Engineering', credits: 3 },
            { code: 'CE405', title: 'Concrete & Soil Testing Lab', credits: 2 }
        ],
        5: [
            { code: 'CE501', title: 'Design of Reinforced Concrete Structures (IS456)', credits: 4 },
            { code: 'CE502', title: 'Foundation Engineering & Geotechnical II', credits: 4 },
            { code: 'CE503', title: 'Hydrology & Water Resources Engineering', credits: 3 },
            { code: 'CE504', title: 'Environmental Engineering I (Water Supply)', credits: 3 },
            { code: 'CE505', title: 'Geotechnical & Environmental Lab', credits: 2 }
        ],
        6: [
            { code: 'CE601', title: 'Design of Steel Structures (IS800)', credits: 4 },
            { code: 'CE602', title: 'Railway, Airport & Harbor Engineering', credits: 4 },
            { code: 'CE603', title: 'Environmental Engineering II (Wastewater & Air)', credits: 3 },
            { code: 'CE604', title: 'Estimation, Costing & Construction Contracts', credits: 3 },
            { code: 'CE605', title: 'Structural Design & Analysis Studio', credits: 2 }
        ],
        7: [
            { code: 'CE701', title: 'Earthquake Resistant Structural Design', credits: 4 },
            { code: 'CE702', title: 'Irrigation Engineering & Hydraulic Structures', credits: 4 },
            { code: 'CE703', title: 'Ground Improvement Techniques & Geosynthetics', credits: 3 },
            { code: 'CE704', title: 'Construction Planning & CPM/PERT Management', credits: 3 },
            { code: 'CE705', title: 'Major Capstone Project - Phase 1', credits: 2 }
        ],
        8: [
            { code: 'CE801', title: 'Bridge & Tunnel Engineering', credits: 4 },
            { code: 'CE802', title: 'Remote Sensing & GIS in Infrastructure', credits: 4 },
            { code: 'CE803', title: 'Smart Cities & Sustainable Infrastructure', credits: 3 },
            { code: 'CE804', title: 'Major Capstone Project - Phase 2 (Implementation)', credits: 6 },
            { code: 'CE805', title: 'Comprehensive Viva Voce & Technical Defense', credits: 2 }
        ]
    },
    EE: {
        1: [
            { code: 'EE101', title: 'Electric Circuit Theory & Network Analysis', credits: 4 },
            { code: 'MA101', title: 'Engineering Mathematics I', credits: 4 },
            { code: 'PH101', title: 'Engineering Physics & Electromagnetics', credits: 3 },
            { code: 'EE102', title: 'Basic Electrical Engineering Workshop', credits: 3 },
            { code: 'CS101', title: 'Programming Fundamentals in C', credits: 2 }
        ],
        2: [
            { code: 'EE201', title: 'Electromagnetic Field Theory & Wave Equations', credits: 4 },
            { code: 'MA102', title: 'Engineering Mathematics II', credits: 4 },
            { code: 'EE202', title: 'Analog Electronics & Semiconductor Devices', credits: 3 },
            { code: 'EE203', title: 'Electrical Measurements & Transducers', credits: 3 },
            { code: 'EE204', title: 'Circuits & Measurements Lab', credits: 2 }
        ],
        3: [
            { code: 'EE301', title: 'DC Electrical Machines & Transformers', credits: 4 },
            { code: 'EE302', title: 'Network Synthesis & State Variable Analysis', credits: 4 },
            { code: 'EE303', title: 'Digital Electronics & Microprocessor Basics', credits: 3 },
            { code: 'EE304', title: 'Conventional & Renewable Power Generation', credits: 3 },
            { code: 'EE305', title: 'Electrical Machines Laboratory I', credits: 2 }
        ],
        4: [
            { code: 'EE401', title: 'AC Electrical Machines (Induction & Synchronous)', credits: 4 },
            { code: 'EE402', title: 'Transmission & Distribution of Electrical Energy', credits: 4 },
            { code: 'EE403', title: 'Linear Automatic Control Systems', credits: 3 },
            { code: 'EE404', title: 'Signals, Systems & Frequency Analysis', credits: 3 },
            { code: 'EE405', title: 'Electrical Machines Laboratory II', credits: 2 }
        ],
        5: [
            { code: 'EE501', title: 'Power System Analysis & Load Flow Studies', credits: 4 },
            { code: 'EE502', title: 'Power Electronics Converters & Inverters', credits: 4 },
            { code: 'EE503', title: 'Microcontrollers (ARM/PIC) & Embedded Systems', credits: 3 },
            { code: 'EE504', title: 'Design of Electrical Apparatus & Transformers', credits: 3 },
            { code: 'EE505', title: 'Power Electronics & Drives Lab', credits: 2 }
        ],
        6: [
            { code: 'EE601', title: 'Power System Switchgear & Relay Protection', credits: 4 },
            { code: 'EE602', title: 'Renewable Solar PV & Wind Energy Systems', credits: 4 },
            { code: 'EE603', title: 'Digital Signal Processing in Power Systems', credits: 3 },
            { code: 'EE604', title: 'High Voltage Engineering & Insulation Design', credits: 3 },
            { code: 'EE605', title: 'Power Systems Simulation & Protection Lab', credits: 2 }
        ],
        7: [
            { code: 'EE701', title: 'Electric Vehicle Powertrains, Motors & Charging', credits: 4 },
            { code: 'EE702', title: 'Smart Grid Architecture & Energy Management', credits: 4 },
            { code: 'EE703', title: 'Industrial Automation, PLC & SCADA Systems', credits: 3 },
            { code: 'EE704', title: 'Power Quality & Flexible AC Transmission (FACTS)', credits: 3 },
            { code: 'EE705', title: 'Major Capstone Project - Phase 1', credits: 2 }
        ],
        8: [
            { code: 'EE801', title: 'High Voltage Direct Current (HVDC) Transmission', credits: 4 },
            { code: 'EE802', title: 'Utilization of Electrical Energy & Electric Traction', credits: 4 },
            { code: 'EE803', title: 'Energy Auditing, Conservation & Grid Economics', credits: 3 },
            { code: 'EE804', title: 'Major Capstone Project - Phase 2 (Implementation)', credits: 6 },
            { code: 'EE805', title: 'Comprehensive Technical Defense & Viva', credits: 2 }
        ]
    },
    IT: {
        1: [
            { code: 'IT101', title: 'Programming in Python & Problem Solving', credits: 4 },
            { code: 'MA101', title: 'Engineering Mathematics I', credits: 4 },
            { code: 'PH101', title: 'Physics for Information Technology', credits: 3 },
            { code: 'IT102', title: 'Digital Logic & Computer Foundations', credits: 3 },
            { code: 'IT103', title: 'Python Programming Laboratory', credits: 2 }
        ],
        2: [
            { code: 'IT201', title: 'Object-Oriented Programming with C++', credits: 4 },
            { code: 'MA102', title: 'Engineering Mathematics II', credits: 4 },
            { code: 'IT202', title: 'Discrete Mathematical Foundations for IT', credits: 3 },
            { code: 'IT203', title: 'Computer Organization & Architecture', credits: 3 },
            { code: 'IT204', title: 'OOP & Data Structures Laboratory', credits: 2 }
        ],
        3: [
            { code: 'IT301', title: 'Data Structures & Algorithms in Practice', credits: 4 },
            { code: 'IT302', title: 'Relational Database Management Systems', credits: 4 },
            { code: 'IT303', title: 'Operating Systems & System Architecture', credits: 3 },
            { code: 'IT304', title: 'Computer Networks & TCP/IP Protocols', credits: 3 },
            { code: 'IT305', title: 'DBMS & Advanced SQL Laboratory', credits: 2 }
        ],
        4: [
            { code: 'IT401', title: 'Web Technologies & Modern Frontend Frameworks', credits: 4 },
            { code: 'IT402', title: 'Software Engineering & DevOps Methodologies', credits: 4 },
            { code: 'IT403', title: 'Java Enterprise Application Development', credits: 3 },
            { code: 'IT404', title: 'Formal Languages & Automata Theory', credits: 3 },
            { code: 'IT405', title: 'Web Applications & Full-Stack Lab', credits: 2 }
        ],
        5: [
            { code: 'IT501', title: 'Information Security & Cryptography', credits: 4 },
            { code: 'IT502', title: 'Cloud Computing Platforms & Microservices', credits: 4 },
            { code: 'IT503', title: 'Applied Machine Learning & Data Mining', credits: 3 },
            { code: 'IT504', title: 'Mobile Application Development (Flutter/Android)', credits: 3 },
            { code: 'IT505', title: 'Cloud Platforms & Security Lab', credits: 2 }
        ],
        6: [
            { code: 'IT601', title: 'Big Data Engineering & Distributed Analytics', credits: 4 },
            { code: 'IT602', title: 'Cyber Defense & Ethical Hacking', credits: 4 },
            { code: 'IT603', title: 'Artificial Intelligence & Predictive Analytics', credits: 3 },
            { code: 'IT604', title: 'Internet of Things Architecture & Protocols', credits: 3 },
            { code: 'IT605', title: 'Big Data Analytics Practicum Lab', credits: 2 }
        ],
        7: [
            { code: 'IT701', title: 'Full-Stack Cloud-Native Architecture', credits: 4 },
            { code: 'IT702', title: 'Deep Learning & Computer Vision Applications', credits: 4 },
            { code: 'IT703', title: 'Blockchain Technology & Smart Contract Systems', credits: 3 },
            { code: 'IT704', title: 'Agile Project Management & Software Testing', credits: 3 },
            { code: 'IT705', title: 'Major Capstone Project - Phase 1', credits: 2 }
        ],
        8: [
            { code: 'IT801', title: 'High Performance & Quantum Computing', credits: 4 },
            { code: 'IT802', title: 'Natural Language Processing & Generative AI', credits: 4 },
            { code: 'IT803', title: 'IT Law, Ethics, Privacy & Cyber Policies', credits: 3 },
            { code: 'IT804', title: 'Major Capstone Project - Phase 2 (Deployment)', credits: 6 },
            { code: 'IT805', title: 'Comprehensive Technical Defense & Viva', credits: 2 }
        ]
    },
    BT: {
        1: [
            { code: 'BT101', title: 'Biochemistry & Biomolecules I', credits: 4 },
            { code: 'MA101', title: 'Mathematics for Biologists', credits: 4 },
            { code: 'CH101', title: 'General & Organic Chemistry', credits: 3 },
            { code: 'BT102', title: 'Cell Biology & Cellular Architecture', credits: 3 },
            { code: 'BT103', title: 'Biochemistry & Analytical Methods Lab', credits: 2 }
        ],
        2: [
            { code: 'BT201', title: 'Microbiology & Virology Principles', credits: 4 },
            { code: 'BT202', title: 'Molecular Biology Fundamentals', credits: 4 },
            { code: 'BT203', title: 'Biophysics & Structural Analysis', credits: 3 },
            { code: 'CH201', title: 'Physical Chemistry for Life Sciences', credits: 3 },
            { code: 'BT204', title: 'Microbiology & Microscopy Lab', credits: 2 }
        ],
        3: [
            { code: 'BT301', title: 'Genetics & Genomics Engineering', credits: 4 },
            { code: 'BT302', title: 'Immunology & Immunotechnology', credits: 4 },
            { code: 'BT303', title: 'Chemical Thermodynamics for Biotechnology', credits: 3 },
            { code: 'BT304', title: 'Bioanalytical Instrumentation & Spectroscopy', credits: 3 },
            { code: 'BT305', title: 'Molecular Biology & Genetics Lab', credits: 2 }
        ],
        4: [
            { code: 'BT401', title: 'Genetic Engineering & Recombinant DNA', credits: 4 },
            { code: 'BT402', title: 'Bioprocess Principles & Enzyme Kinetics', credits: 4 },
            { code: 'BT403', title: 'Enzyme Technology & Industrial Biocatalysis', credits: 3 },
            { code: 'BT404', title: 'Structural Biology & Protein Folding', credits: 3 },
            { code: 'BT405', title: 'Genetic Engineering & Recombinant Lab', credits: 2 }
        ],
        5: [
            { code: 'BT501', title: 'Bioinformatics & Computational Sequence Analysis', credits: 4 },
            { code: 'BT502', title: 'Bioreactor Design, Fermentation & Scale-up', credits: 4 },
            { code: 'BT503', title: 'Plant Biotechnology & Genetic Modification', credits: 3 },
            { code: 'BT504', title: 'Animal Cell Culture & Regenerative Medicine', credits: 3 },
            { code: 'BT505', title: 'Bioinformatics & Computational Biology Lab', credits: 2 }
        ],
        6: [
            { code: 'BT601', title: 'Downstream Processing & Bioseparation', credits: 4 },
            { code: 'BT602', title: 'Computational Proteomics & Structural Modeling', credits: 4 },
            { code: 'BT603', title: 'Medical Biotechnology & Molecular Diagnostics', credits: 3 },
            { code: 'BT604', title: 'Environmental Biotechnology & Bioremediation', credits: 3 },
            { code: 'BT605', title: 'Bioprocess & Bioseparation Laboratory', credits: 2 }
        ],
        7: [
            { code: 'BT701', title: 'Stem Cell Biology & Tissue Engineering', credits: 4 },
            { code: 'BT702', title: 'Biopharmaceutical Formulation & Regulatory Affairs', credits: 4 },
            { code: 'BT703', title: 'Nanobiotechnology & Targeted Drug Delivery', credits: 3 },
            { code: 'BT704', title: 'Bioethics, Biosafety & Intellectual Property', credits: 3 },
            { code: 'BT705', title: 'Major Capstone Project - Phase 1', credits: 2 }
        ],
        8: [
            { code: 'BT801', title: 'Synthetic Biology & Metabolic Engineering', credits: 4 },
            { code: 'BT802', title: 'Computer-Aided Drug Design & Pharmacogenomics', credits: 4 },
            { code: 'BT803', title: 'Clinical Trials, Good Laboratory Practices & Management', credits: 3 },
            { code: 'BT804', title: 'Major Capstone Project - Phase 2 (Experimental)', credits: 6 },
            { code: 'BT805', title: 'Comprehensive Technical Defense & Viva', credits: 2 }
        ]
    },
    MBA: {
        1: [
            { code: 'MB101', title: 'Principles of Management & Leadership Dynamics', credits: 4 },
            { code: 'MB102', title: 'Managerial Economics & Market Analysis', credits: 4 },
            { code: 'MB103', title: 'Financial Accounting & Reporting for Decision Makers', credits: 3 },
            { code: 'MB104', title: 'Organizational Behavior & Human Dynamics', credits: 3 },
            { code: 'MB105', title: 'Executive Communication & Soft Skills Lab', credits: 2 }
        ],
        2: [
            { code: 'MB201', title: 'Marketing Management & Consumer Insights', credits: 4 },
            { code: 'MB202', title: 'Corporate Finance & Capital Structure', credits: 4 },
            { code: 'MB203', title: 'Human Resource Management & Talent Strategy', credits: 3 },
            { code: 'MB204', title: 'Quantitative Methods & Business Statistics', credits: 3 },
            { code: 'MB205', title: 'Marketing Research & Analytics Lab', credits: 2 }
        ],
        3: [
            { code: 'MB301', title: 'Operations Management & Supply Chain Logistics', credits: 4 },
            { code: 'MB302', title: 'Business Analytics, PowerBI & Decision Science', credits: 4 },
            { code: 'MB303', title: 'Strategic Management & Competitive Advantage', credits: 3 },
            { code: 'MB304', title: 'Management Information Systems & Digital Transformation', credits: 3 },
            { code: 'MB305', title: 'Business Analytics & Data Modeling Lab', credits: 2 }
        ],
        4: [
            { code: 'MB401', title: 'Enterprise Resource Planning (ERP) & SAP Systems', credits: 4 },
            { code: 'MB402', title: 'International Business & Global Trade Strategy', credits: 4 },
            { code: 'MB403', title: 'Corporate Governance, Business Law & Ethics', credits: 3 },
            { code: 'MB404', title: 'Entrepreneurship & Venture Capital Funding', credits: 3 },
            { code: 'MB405', title: 'Industry Internship Project Defense', credits: 2 }
        ],
        5: [
            { code: 'MB501', title: 'Mergers, Acquisitions & Corporate Restructuring', credits: 4 },
            { code: 'MB502', title: 'Digital Marketing & Omni-Channel Campaign Strategy', credits: 4 },
            { code: 'MB503', title: 'Financial Derivatives, Risk Management & Hedging', credits: 3 },
            { code: 'MB504', title: 'Consumer Behavior & Brand Equity Management', credits: 3 },
            { code: 'MB505', title: 'FinTech & Digital Banking Simulation Lab', credits: 2 }
        ],
        6: [
            { code: 'MB601', title: 'Big Data & AI Strategy for Executives', credits: 4 },
            { code: 'MB602', title: 'Global Supply Chain Analytics & Optimization', credits: 4 },
            { code: 'MB603', title: 'Strategic HR Analytics & Workforce Planning', credits: 3 },
            { code: 'MB604', title: 'Investment Banking & Portfolio Wealth Management', credits: 3 },
            { code: 'MB605', title: 'Business Strategy Simulation Practicum', credits: 2 }
        ],
        7: [
            { code: 'MB701', title: 'Global Macroeconomics & Cross-Border Strategy', credits: 4 },
            { code: 'MB702', title: 'Artificial Intelligence & Robotic Automation in Business', credits: 4 },
            { code: 'MB703', title: 'Sustainable Business Practices & ESG Reporting', credits: 3 },
            { code: 'MB704', title: 'Private Equity & Venture Acceleration', credits: 3 },
            { code: 'MB705', title: 'Management Dissertation - Phase 1', credits: 2 }
        ],
        8: [
            { code: 'MB801', title: 'Cross-Cultural Leadership & High-Stakes Negotiations', credits: 4 },
            { code: 'MB802', title: 'Innovation Management & Design Thinking', credits: 4 },
            { code: 'MB803', title: 'Corporate Ethics, Social Impact & Public Policy', credits: 3 },
            { code: 'MB804', title: 'Executive Management Dissertation (Final Defense)', credits: 6 },
            { code: 'MB805', title: 'Comprehensive Viva Voce & Board Defense', credits: 2 }
        ]
    }
};

/**
 * Department code resolver
 */
function resolveDepartmentCode(dept) {
    if (!dept) return 'CSE';
    if (typeof dept === 'number') {
        const idMap = { 1: 'CSE', 2: 'ECE', 3: 'ME', 4: 'CE', 5: 'EE', 6: 'IT', 7: 'BT', 8: 'MBA' };
        return idMap[dept] || 'CSE';
    }
    const s = String(dept).trim().toUpperCase();
    if (CURRICULUM[s]) return s;
    if (s.includes('COMPUTER') || s.includes('CSE') || s.includes('CS')) return 'CSE';
    if (s.includes('ELECTRONIC') || s.includes('ECE') || s.includes('COMM')) return 'ECE';
    if (s.includes('MECHANIC') || s.includes('ME')) return 'ME';
    if (s.includes('CIVIL') || s.includes('CE')) return 'CE';
    if (s.includes('ELECTRICAL') || s.includes('EE')) return 'EE';
    if (s.includes('INFORMATION') || s.includes('IT')) return 'IT';
    if (s.includes('BIO') || s.includes('BT')) return 'BT';
    if (s.includes('MANAGE') || s.includes('BUSINESS') || s.includes('MBA')) return 'MBA';
    return 'CSE';
}

/**
 * Get courses list for a department and semester (1 to 8)
 */
function getCurriculumCourses(dept, semester) {
    const code = resolveDepartmentCode(dept);
    const sem = Math.max(1, Math.min(8, parseInt(semester) || 1));
    const deptCatalog = CURRICULUM[code] || CURRICULUM['CSE'];
    return deptCatalog[sem] || CURRICULUM['CSE'][sem];
}

module.exports = {
    CURRICULUM,
    resolveDepartmentCode,
    getCurriculumCourses
};

