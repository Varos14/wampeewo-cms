import { getDb } from '../config/database';
import { hashPassword } from '../utils/bcrypt';

export async function seedInitialData() {
  try {
    const db = getDb();

    // 1. Create Tables
    console.log('[seed] Creating tables if they do not exist...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'teacher', 'student', 'parent') NOT NULL,
        avatar_url VARCHAR(255)
      )
    `);

    // Migration: ensure avatar_url exists in case the table was created earlier
    try {
      await db.query('ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255)');
      console.log('[seed] Added missing avatar_url column to users table.');
    } catch (err: any) {
      // Error 1060 is ER_DUP_FIELDNAME (Duplicate column name)
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.error('[seed] Migration error on users table:', err.message);
      }
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        stream VARCHAR(50),
        class_teacher_id VARCHAR(50),
        student_count INT DEFAULT 0
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) NOT NULL,
        class_id VARCHAR(50) NOT NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(50) PRIMARY KEY,
        class_id VARCHAR(50) NOT NULL,
        registration_number VARCHAR(100) UNIQUE NOT NULL,
        gender ENUM('Male', 'Female') NOT NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS parents (
        id VARCHAR(50) PRIMARY KEY
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS student_parents (
        student_id VARCHAR(50) NOT NULL,
        parent_id VARCHAR(50) NOT NULL,
        PRIMARY KEY (student_id, parent_id)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS generic_skills (
        student_id VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        value INT NOT NULL,
        PRIMARY KEY (student_id, name)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS teacher_classes (
        teacher_id VARCHAR(50) NOT NULL,
        class_id VARCHAR(50) NOT NULL,
        PRIMARY KEY (teacher_id, class_id)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS teacher_subjects (
        teacher_id VARCHAR(50) NOT NULL,
        subject_name VARCHAR(100) NOT NULL,
        PRIMARY KEY (teacher_id, subject_name)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS aois (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        deadline VARCHAR(50) NOT NULL,
        class_id VARCHAR(50) NOT NULL,
        teacher_id VARCHAR(50) NOT NULL,
        rubric JSON NOT NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(50) PRIMARY KEY,
        aoi_id VARCHAR(50) NOT NULL,
        student_id VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        grade INT,
        feedback TEXT,
        submitted_at VARCHAR(50) NOT NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id VARCHAR(50) PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        class_id VARCHAR(50) NOT NULL,
        date VARCHAR(20) NOT NULL,
        status ENUM('present', 'absent', 'excused') NOT NULL,
        marked_by VARCHAR(50) NOT NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        term INT NOT NULL,
        year INT NOT NULL,
        class_id VARCHAR(50) NOT NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS exam_results (
        id VARCHAR(50) PRIMARY KEY,
        exam_id VARCHAR(50) NOT NULL,
        student_id VARCHAR(50) NOT NULL,
        subject_id VARCHAR(50) NOT NULL,
        score INT NOT NULL,
        grade VARCHAR(10) NOT NULL,
        remarks VARCHAR(255)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS fee_statements (
        student_id VARCHAR(50) PRIMARY KEY,
        billed_amount INT NOT NULL,
        paid_amount INT NOT NULL,
        balance INT NOT NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS fee_payments (
        id VARCHAR(50) PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        amount INT NOT NULL,
        receipt_number VARCHAR(100) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_date VARCHAR(50) NOT NULL,
        term INT NOT NULL,
        year INT NOT NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS timetables (
        id VARCHAR(50) PRIMARY KEY,
        class_id VARCHAR(50) NOT NULL,
        subject_id VARCHAR(50) NOT NULL,
        subject_name VARCHAR(100) NOT NULL,
        teacher_name VARCHAR(100) NOT NULL,
        day_of_week INT NOT NULL,
        start_time VARCHAR(20) NOT NULL,
        end_time VARCHAR(20) NOT NULL,
        room VARCHAR(50)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_id VARCHAR(50) NOT NULL,
        author_name VARCHAR(100) NOT NULL,
        target_roles JSON NOT NULL,
        created_at VARCHAR(50) NOT NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id VARCHAR(50) PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        tags JSON NOT NULL,
        created_at VARCHAR(50) NOT NULL,
        updated_at VARCHAR(50) NOT NULL
      )
    `);

    // 2. Check if already seeded
    const [userRows] = await db.query('SELECT COUNT(*) as count FROM users');
    const userCount = (userRows as any)[0].count;

    if (userCount > 0) {
      console.log('[seed] Database tables exist and are already seeded.');
      return;
    }

    console.log('[seed] Seeding initial mock data into database...');

    // Hash passwords
    const adminPass = await hashPassword('admin123');
    const teacherPass = await hashPassword('teacher123');
    const studentPass = await hashPassword('student123');
    const parentPass = await hashPassword('parent123');

    // Seed Users
    const users = [
      { id: '1', name: 'Nalule Margaret', email: 'admin@wampeewo.com', role: 'admin', password_hash: adminPass, avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Nalule%20Margaret' },
      { id: '2', name: 'Okello John', email: 'teacher@wampeewo.com', role: 'teacher', password_hash: teacherPass, avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Okello%20John' },
      { id: '3', name: 'Kato Paul', email: 'student@wampeewo.com', role: 'student', password_hash: studentPass, avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Kato%20Paul' },
      { id: '4', name: 'Mukasa Ronald', email: 'parent@wampeewo.com', role: 'parent', password_hash: parentPass, avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Mukasa%20Ronald' },
      { id: '5', name: 'Nsubuga David', email: 'david@wampeewo.com', role: 'teacher', password_hash: teacherPass, avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Nsubuga%20David' },
      { id: '6', name: 'Babirye Sarah', email: 'sarah@wampeewo.com', role: 'student', password_hash: studentPass, avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Babirye%20Sarah' },
      { id: '7', name: 'Wasswa Peter', email: 'peter@wampeewo.com', role: 'student', password_hash: studentPass, avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Wasswa%20Peter' }
    ];

    for (const u of users) {
      await db.query(
        'INSERT INTO users (id, name, email, password_hash, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
        [u.id, u.name, u.email, u.password_hash, u.role, u.avatar_url]
      );
    }

    // Seed Parents
    await db.query('INSERT INTO parents (id) VALUES (?)', ['4']);

    // Seed Classes
    const classes = [
      { id: 'c1', name: 'Senior 1 Blue', stream: 'Blue', class_teacher_id: '2', student_count: 45 },
      { id: 'c2', name: 'Senior 2 Red', stream: 'Red', class_teacher_id: '5', student_count: 42 },
      { id: 'c3', name: 'Senior 3 East', stream: 'East', class_teacher_id: '2', student_count: 38 },
      { id: 'c4', name: 'Senior 4 West', stream: 'West', class_teacher_id: '5', student_count: 40 }
    ];

    for (const c of classes) {
      await db.query(
        'INSERT INTO classes (id, name, stream, class_teacher_id, student_count) VALUES (?, ?, ?, ?, ?)',
        [c.id, c.name, c.stream, c.class_teacher_id, c.student_count]
      );
    }

    // Seed Students
    const students = [
      { id: '3', class_id: 'c1', registration_number: 'WNS/2026/089', gender: 'Male' },
      { id: '6', class_id: 'c1', registration_number: 'WNS/2026/090', gender: 'Female' },
      { id: '7', class_id: 'c2', registration_number: 'WNS/2025/112', gender: 'Male' }
    ];

    for (const s of students) {
      await db.query(
        'INSERT INTO students (id, class_id, registration_number, gender) VALUES (?, ?, ?, ?)',
        [s.id, s.class_id, s.registration_number, s.gender]
      );
    }

    // Seed Student Parents
    await db.query('INSERT INTO student_parents (student_id, parent_id) VALUES (?, ?)', ['3', '4']);
    await db.query('INSERT INTO student_parents (student_id, parent_id) VALUES (?, ?)', ['6', '4']);

    // Seed Generic Skills
    const genericSkills = [
      { student_id: '3', name: 'Critical Thinking', value: 3 },
      { student_id: '3', name: 'Creativity', value: 2 },
      { student_id: '3', name: 'Collaboration', value: 3 },
      { student_id: '3', name: 'Communication', value: 2 },
      { student_id: '3', name: 'Self-direction', value: 3 },
      { student_id: '6', name: 'Critical Thinking', value: 2 },
      { student_id: '6', name: 'Creativity', value: 3 },
      { student_id: '6', name: 'Collaboration', value: 2 },
      { student_id: '6', name: 'Communication', value: 3 },
      { student_id: '6', name: 'Self-direction', value: 2 }
    ];

    for (const gs of genericSkills) {
      await db.query(
        'INSERT INTO generic_skills (student_id, name, value) VALUES (?, ?, ?)',
        [gs.student_id, gs.name, gs.value]
      );
    }

    // Seed Teacher Classes & Subjects mapping
    await db.query('INSERT INTO teacher_classes (teacher_id, class_id) VALUES (?, ?)', ['2', 'c1']);
    await db.query('INSERT INTO teacher_classes (teacher_id, class_id) VALUES (?, ?)', ['2', 'c2']);
    await db.query('INSERT INTO teacher_classes (teacher_id, class_id) VALUES (?, ?)', ['5', 'c1']);
    await db.query('INSERT INTO teacher_classes (teacher_id, class_id) VALUES (?, ?)', ['5', 'c3']);

    await db.query('INSERT INTO teacher_subjects (teacher_id, subject_name) VALUES (?, ?)', ['2', 'Mathematics']);
    await db.query('INSERT INTO teacher_subjects (teacher_id, subject_name) VALUES (?, ?)', ['2', 'Physics']);
    await db.query('INSERT INTO teacher_subjects (teacher_id, subject_name) VALUES (?, ?)', ['5', 'English Literature']);
    await db.query('INSERT INTO teacher_subjects (teacher_id, subject_name) VALUES (?, ?)', ['5', 'History']);

    // Seed Subjects
    const subjects = [
      { id: 's1', name: 'Mathematics', code: 'MTH', class_id: 'c1' },
      { id: 's2', name: 'Physics', code: 'PHY', class_id: 'c1' },
      { id: 's3', name: 'English Literature', code: 'ENG', class_id: 'c1' },
      { id: 's4', name: 'History', code: 'HST', class_id: 'c1' },
      { id: 's5', name: 'Mathematics', code: 'MTH', class_id: 'c2' },
      { id: 's6', name: 'Geography', code: 'GEO', class_id: 'c2' }
    ];

    for (const s of subjects) {
      await db.query(
        'INSERT INTO subjects (id, name, code, class_id) VALUES (?, ?, ?, ?)',
        [s.id, s.name, s.code, s.class_id]
      );
    }

    // Seed AOIs
    const aois = [
      {
        id: 'aoi1',
        title: 'Renewable Energy Project',
        description: 'Design a simple solar-powered water heater layout using locally sourced materials and calculate its efficiency.',
        deadline: '2026-06-30T17:00:00.000Z',
        class_id: 'c1',
        teacher_id: '2',
        rubric: JSON.stringify([
          { skill: 'Critical Thinking', maxScore: 3 },
          { skill: 'Creativity', maxScore: 3 },
          { skill: 'Technical Drawing', maxScore: 3 }
        ])
      },
      {
        id: 'aoi2',
        title: 'Statistics of local crop yields',
        description: 'Collect yield data of maize and beans from five farmers in Wampeewo village and plot comparative bar graphs.',
        deadline: '2026-07-05T17:00:00.000Z',
        class_id: 'c1',
        teacher_id: '2',
        rubric: JSON.stringify([
          { skill: 'Data Collection', maxScore: 3 },
          { skill: 'Graphical Presentation', maxScore: 3 }
        ])
      },
      {
        id: 'aoi3',
        title: 'Ugandan Pre-colonial Trade Analysis',
        description: 'Write an essay highlighting the impact of the Long Distance Trade on the Buganda Kingdom.',
        deadline: '2026-06-25T12:00:00.000Z',
        class_id: 'c1',
        teacher_id: '5',
        rubric: JSON.stringify([
          { skill: 'Historical Accuracy', maxScore: 3 },
          { skill: 'Analytical Writing', maxScore: 3 }
        ])
      }
    ];

    for (const a of aois) {
      await db.query(
        'INSERT INTO aois (id, title, description, deadline, class_id, teacher_id, rubric) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [a.id, a.title, a.description, a.deadline, a.class_id, a.teacher_id, a.rubric]
      );
    }

    // Seed Submissions
    const submissions = [
      { id: 'sub1', aoi_id: 'aoi1', student_id: '3', content: 'My solar heater project uses black painted plastic bottles connected in a series. I placed them in a wooden box lined with aluminum foil to trap heat. The test showed water temperature rose from 22C to 45C in 3 hours under direct sunlight.', grade: 3, feedback: 'Excellent design and calculation! Very creative use of local materials.', submitted_at: '2026-06-12T10:30:00.000Z' },
      { id: 'sub2', aoi_id: 'aoi2', student_id: '3', content: 'I visited 5 farms. Farmer Mukasa harvested 10 bags of maize, Farmer Nakato 8 bags, Farmer Sempa 12 bags... (attached charts)', grade: null, feedback: null, submitted_at: '2026-06-15T15:20:00.000Z' },
      { id: 'sub3', aoi_id: 'aoi1', student_id: '6', content: 'Solar heater design draft with zinc sheet and copper tube coils... water heated by thermo-siphoning.', grade: 2, feedback: 'Good theoretical concept, but calculations for efficiency were missing. Please include them next time.', submitted_at: '2026-06-14T08:15:00.000Z' }
    ];

    for (const s of submissions) {
      await db.query(
        'INSERT INTO submissions (id, aoi_id, student_id, content, grade, feedback, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [s.id, s.aoi_id, s.student_id, s.content, s.grade, s.feedback, s.submitted_at]
      );
    }

    // Seed Notes
    const notes = [
      { id: 'note1', student_id: '3', title: 'Physics - Heat Transfer Formulas', content: 'Conduction: Q/t = kA(T_hot - T_cold)/d\nConvection: Q/t = hA(T_s - T_f)\nRadiation: P = e * sigma * A * T^4\nRemember: Wampeewo weather averages 25C.', tags: JSON.stringify(['Physics', 'Thermodynamics']), created_at: '2026-06-10T09:00:00.000Z', updated_at: '2026-06-10T09:30:00.000Z' },
      { id: 'note2', student_id: '3', title: 'Math - Summary of Statistics', content: 'Mean = Sum of all values / Total values\nMedian = Middle value when sorted\nMode = Most frequent value\nUseful for the crop yield crop project.', tags: JSON.stringify(['Mathematics', 'Statistics']), created_at: '2026-06-11T14:00:00.000Z', updated_at: '2026-06-11T14:00:00.000Z' }
    ];

    for (const n of notes) {
      await db.query(
        'INSERT INTO notes (id, student_id, title, content, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [n.id, n.student_id, n.title, n.content, n.tags, n.created_at, n.updated_at]
      );
    }

    // Seed Attendance
    const attendance = [
      { id: 'att1', student_id: '3', class_id: 'c1', date: '2026-06-16', status: 'present', marked_by: '2' },
      { id: 'att2', student_id: '6', class_id: 'c1', date: '2026-06-16', status: 'present', marked_by: '2' },
      { id: 'att3', student_id: '3', class_id: 'c1', date: '2026-06-15', status: 'present', marked_by: '2' },
      { id: 'att4', student_id: '6', class_id: 'c1', date: '2026-06-15', status: 'absent', marked_by: '2' },
      { id: 'att5', student_id: '3', class_id: 'c1', date: '2026-06-12', status: 'present', marked_by: '2' },
      { id: 'att6', student_id: '6', class_id: 'c1', date: '2026-06-12', status: 'present', marked_by: '2' },
      { id: 'att7', student_id: '3', class_id: 'c1', date: '2026-06-11', status: 'excused', marked_by: '2' },
      { id: 'att8', student_id: '6', class_id: 'c1', date: '2026-06-11', status: 'present', marked_by: '2' }
    ];

    for (const a of attendance) {
      await db.query(
        'INSERT INTO attendance (id, student_id, class_id, date, status, marked_by) VALUES (?, ?, ?, ?, ?, ?)',
        [a.id, a.student_id, a.class_id, a.date, a.status, a.marked_by]
      );
    }

    // Seed Exams
    const exams = [
      { id: 'ex1', name: 'Mid of Term I Exams 2026', term: 1, year: 2026, class_id: 'c1' },
      { id: 'ex2', name: 'End of Term I Exams 2026', term: 1, year: 2026, class_id: 'c1' }
    ];

    for (const e of exams) {
      await db.query(
        'INSERT INTO exams (id, name, term, year, class_id) VALUES (?, ?, ?, ?, ?)',
        [e.id, e.name, e.term, e.year, e.class_id]
      );
    }

    // Seed Exam Results
    const examResults = [
      { id: 'er1', exam_id: 'ex2', student_id: '3', subject_id: 's1', score: 85, grade: 'D1', remarks: 'Excellent performance' },
      { id: 'er2', exam_id: 'ex2', student_id: '3', subject_id: 's2', score: 78, grade: 'D2', remarks: 'Good analytical skills' },
      { id: 'er3', exam_id: 'ex2', student_id: '3', subject_id: 's3', score: 62, grade: 'C4', remarks: 'Can improve essay writing' },
      { id: 'er4', exam_id: 'ex2', student_id: '6', subject_id: 's1', score: 72, grade: 'C3', remarks: 'Consistent worker' },
      { id: 'er5', exam_id: 'ex2', student_id: '6', subject_id: 's2', score: 81, grade: 'D2', remarks: 'Great practical layout' },
      { id: 'er6', exam_id: 'ex2', student_id: '6', subject_id: 's3', score: 88, grade: 'D1', remarks: 'Outstanding literature insights' }
    ];

    for (const er of examResults) {
      await db.query(
        'INSERT INTO exam_results (id, exam_id, student_id, subject_id, score, grade, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [er.id, er.exam_id, er.student_id, er.subject_id, er.score, er.grade, er.remarks]
      );
    }

    // Seed Fee Statements
    const feeStatements = [
      { student_id: '3', billed_amount: 1200000, paid_amount: 850000, balance: 350000 },
      { student_id: '6', billed_amount: 1200000, paid_amount: 1200000, balance: 0 }
    ];

    for (const fs of feeStatements) {
      await db.query(
        'INSERT INTO fee_statements (student_id, billed_amount, paid_amount, balance) VALUES (?, ?, ?, ?)',
        [fs.student_id, fs.billed_amount, fs.paid_amount, fs.balance]
      );
    }

    // Seed Fee Payments
    const feePayments = [
      { id: 'pay1', student_id: '3', amount: 500000, receipt_number: 'REC-9081', payment_method: 'Bank Slip', payment_date: '2026-05-10', term: 1, year: 2026 },
      { id: 'pay2', student_id: '3', amount: 350000, receipt_number: 'REC-9243', payment_method: 'Mobile Money', payment_date: '2026-06-01', term: 1, year: 2026 },
      { id: 'pay3', student_id: '6', amount: 1200000, receipt_number: 'REC-8991', payment_method: 'Bank Slip', payment_date: '2026-05-08', term: 1, year: 2026 }
    ];

    for (const fp of feePayments) {
      await db.query(
        'INSERT INTO fee_payments (id, student_id, amount, receipt_number, payment_method, payment_date, term, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [fp.id, fp.student_id, fp.amount, fp.receipt_number, fp.payment_method, fp.payment_date, fp.term, fp.year]
      );
    }

    // Seed Timetables
    const timetables = [
      { id: 't1', class_id: 'c1', subject_id: 's1', subject_name: 'Mathematics', teacher_name: 'Okello John', day_of_week: 1, start_time: '08:30', end_time: '10:00', room: 'Room 3' },
      { id: 't2', class_id: 'c1', subject_id: 's2', subject_name: 'Physics', teacher_name: 'Okello John', day_of_week: 1, start_time: '10:30', end_time: '12:00', room: 'Lab A' },
      { id: 't3', class_id: 'c1', subject_id: 's3', subject_name: 'English Literature', teacher_name: 'Nsubuga David', day_of_week: 2, start_time: '09:00', end_time: '10:30', room: 'Room 3' },
      { id: 't4', class_id: 'c1', subject_id: 's4', subject_name: 'History', teacher_name: 'Nsubuga David', day_of_week: 3, start_time: '11:00', end_time: '12:30', room: 'Room 3' },
      { id: 't5', class_id: 'c1', subject_id: 's1', subject_name: 'Mathematics', teacher_name: 'Okello John', day_of_week: 4, start_time: '08:30', end_time: '10:00', room: 'Room 3' },
      { id: 't6', class_id: 'c1', subject_id: 's2', subject_name: 'Physics', teacher_name: 'Okello John', day_of_week: 5, start_time: '14:00', end_time: '15:30', room: 'Lab A' }
    ];

    for (const t of timetables) {
      await db.query(
        'INSERT INTO timetables (id, class_id, subject_id, subject_name, teacher_name, day_of_week, start_time, end_time, room) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [t.id, t.class_id, t.subject_id, t.subject_name, t.teacher_name, t.day_of_week, t.start_time, t.end_time, t.room]
      );
    }

    // Seed Announcements
    const announcements = [
      {
        id: 'ann1',
        title: 'Visitation Day Details',
        content: 'We welcome parents for our Term I Visitation Day on Sunday, June 21, 2026. Gate opens at 9:00 AM. Please clear pending fees.',
        author_id: '1',
        author_name: 'Nalule Margaret (Admin)',
        target_roles: JSON.stringify(['student', 'parent']),
        created_at: '2026-06-12T08:00:00.000Z'
      },
      {
        id: 'ann2',
        title: 'Mid-Term Examinations Rescheduled',
        content: 'Please note that mid-term tests will begin on Monday, June 29 instead of June 22. Timetables will be uploaded by the end of this week.',
        author_id: '1',
        author_name: 'Nalule Margaret (Admin)',
        target_roles: JSON.stringify(['student', 'teacher', 'parent']),
        created_at: '2026-06-14T11:30:00.000Z'
      },
      {
        id: 'ann3',
        title: 'Staff Meeting on Curriculum Guidelines',
        content: 'A mandatory staff assembly to align on the lower secondary competence-based grading rubric will be held in the library tomorrow at 4:30 PM.',
        author_id: '1',
        author_name: 'Nalule Margaret (Admin)',
        target_roles: JSON.stringify(['teacher']),
        created_at: '2026-06-15T09:00:00.000Z'
      }
    ];

    for (const a of announcements) {
      await db.query(
        'INSERT INTO announcements (id, title, content, author_id, author_name, target_roles, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [a.id, a.title, a.content, a.author_id, a.author_name, a.target_roles, a.created_at]
      );
    }

    console.log('[seed] Seeding completed successfully!');
  } catch (err) {
    console.error('[seed] Fatal error in seeder:', err);
    throw err;
  }
}
