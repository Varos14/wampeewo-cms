import { getDb, connectDatabase } from '../config/database';
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
        role VARCHAR(50) NOT NULL,
        avatar_url VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    try {
      await db.query('ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255)');
    } catch (err: any) {}
    try {
      await db.query('ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE');
    } catch (err: any) {}

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
        gender VARCHAR(50) NOT NULL
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
        rubric JSON NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        type VARCHAR(50) DEFAULT 'assignment',
        feedback TEXT
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
        status VARCHAR(50) NOT NULL,
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

    await db.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id VARCHAR(50) PRIMARY KEY,
        teacher_id VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_url VARCHAR(255) NOT NULL,
        uploaded_at VARCHAR(50) NOT NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS presentations (
        id VARCHAR(50) PRIMARY KEY,
        teacher_id VARCHAR(50) NOT NULL,
        class_id VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        meet_link VARCHAR(255) NOT NULL,
        scheduled_at VARCHAR(50) NOT NULL
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(50) PRIMARY KEY,
        sender_id VARCHAR(50) NOT NULL,
        receiver_id VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at VARCHAR(50) NOT NULL
      )
    `);

    // Optionally drop the parent and fee tables if they exist from a previous run
    await db.query('DROP TABLE IF EXISTS fee_payments');
    await db.query('DROP TABLE IF EXISTS fee_statements');
    await db.query('DROP TABLE IF EXISTS student_parents');
    await db.query('DROP TABLE IF EXISTS parents');

    // 2. Check if already seeded
    const [userRows] = await db.query('SELECT COUNT(*) as count FROM users');
    const userCount = (userRows as any)[0].count;

    if (userCount > 0) {
      console.log('[seed] Database tables exist and are already seeded. Skipping seed process.');
      try {
        await db.query("ALTER TABLE aois ADD COLUMN status VARCHAR(50) DEFAULT 'pending'");
        await db.query("ALTER TABLE aois ADD COLUMN type VARCHAR(50) DEFAULT 'assignment'");
        await db.query("ALTER TABLE aois ADD COLUMN feedback TEXT");
        await db.query('ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE');
        
        await db.query(`
          CREATE TABLE IF NOT EXISTS messages (
            id VARCHAR(50) PRIMARY KEY,
            sender_id VARCHAR(50) NOT NULL,
            receiver_id VARCHAR(50) NOT NULL,
            content TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at VARCHAR(50) NOT NULL
          )
        `);
      } catch(e) {}
      
      return;
    }

    console.log('[seed] Seeding initial mock data into database...');

    // Hash passwords
    const adminPass = await hashPassword('@AmGerald14');
    const teacherPass = await hashPassword('teacher123');
    const studentPass = await hashPassword('student123');

    // Users base
    let userIdCount = 1;
    const users: any[] = [];
    const pushUser = (name: string, role: string, pass: string, emailStr: string) => {
        const id = 'u' + userIdCount++;
        const email = emailStr.includes('@') ? emailStr : emailStr + '@wampeewo.com';
        users.push({ id, name, email, password_hash: pass, role, avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(name) });
        return id;
    };

    // Seed Admin
    pushUser('Nalule Margaret', 'admin', adminPass, 'geraldvaros@gmail.com');

    // Seed Teachers
    const teacherNames = [
        {name: 'DOS Saaz Jonathan', subj: 'DOS'},
        {name: 'Mr. Locha Derrick', subj: 'English'},
        {name: 'Mrs. Aringo Diana', subj: 'English'},
        {name: 'Mr. Musisi Deo', subj: 'Mathematics'},
        {name: 'Mr. Sembatya Dancan', subj: 'Mathematics'},
        {name: 'Mrs. Asiimwe Doreen', subj: 'Geography'},
        {name: 'Ms. Ameri Faith', subj: 'Geography'},
        {name: 'Madam Eve Najego', subj: 'History'},
        {name: 'Ms. Kakumakati Brenda', subj: 'History'},
        {name: 'Mr. Wairagala John-Fisher', subj: 'Physics'},
        {name: 'Mrs. Bafaki Gift', subj: 'Biology'}
    ];
    
    const teachersMap: Record<string, {id: string, subj: string}> = {};
    for (const t of teacherNames) {
        const emailP = t.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
        const id = pushUser(t.name, 'teacher', teacherPass, emailP);
        teachersMap[t.name] = { id, subj: t.subj };
    }

    // Seed Students
    const studentNames = [
        {name: 'Gareth Tuwesigye', class: 's1', gender: 'Male'},
        {name: 'Farouk Ssekabira', class: 's1', gender: 'Male'},
        {name: 'Jonathan Kirungi', class: 's1', gender: 'Male'},
        {name: 'Derrick Akeba', class: 's1', gender: 'Male'},
        {name: 'Clevous Akoragye', class: 's1', gender: 'Male'},
        {name: 'Ismail Nsamba', class: 's2', gender: 'Male'},
        {name: 'Hillary Tulinawe', class: 's2', gender: 'Male'},
        {name: 'Mercy Kharono', class: 's2', gender: 'Female'},
        {name: 'Rogers Wanyama', class: 's2', gender: 'Male'},
        {name: 'Walter Ochan', class: 's3', gender: 'Male'},
        {name: 'Naula Habiiba Abass', class: 's3', gender: 'Female'},
        {name: 'Radley Byamugisha', class: 's3', gender: 'Male'},
        {name: 'Erias Mulisa Nsereko', class: 's3', gender: 'Male'},
        {name: 'Matha Bamuhamye', class: 's4', gender: 'Female'},
        {name: 'Peter Erikosi', class: 's4', gender: 'Male'},
        {name: 'Samuel Asianut', class: 's4', gender: 'Male'},
        {name: 'Patrick Ngabongiza', class: 's4', gender: 'Male'}
    ];
    
    const studentsArr = [];
    for (const s of studentNames) {
        const emailP = s.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
        const id = pushUser(s.name, 'student', studentPass, emailP);
        studentsArr.push({ id, classGroup: s.class, gender: s.gender });
    }

    // Insert all users
    for (const u of users) {
      await db.query(
        'INSERT INTO users (id, name, email, password_hash, role, avatar_url, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [u.id, u.name, u.email, u.password_hash, u.role, u.avatar_url, true]
      );
    }

    // Seed Classes
    const classes = [
      { id: 'c1', name: 'Senior 1', stream: 'Blue', class_teacher_id: teachersMap['Mr. Musisi Deo'].id, student_count: 5 },
      { id: 'c2', name: 'Senior 2', stream: 'Red', class_teacher_id: teachersMap['Mrs. Asiimwe Doreen'].id, student_count: 4 },
      { id: 'c3', name: 'Senior 3', stream: 'East', class_teacher_id: teachersMap['Madam Eve Najego'].id, student_count: 4 },
      { id: 'c4', name: 'Senior 4', stream: 'West', class_teacher_id: teachersMap['Mr. Wairagala John-Fisher'].id, student_count: 4 }
    ];

    for (const c of classes) {
      await db.query(
        'INSERT INTO classes (id, name, stream, class_teacher_id, student_count) VALUES (?, ?, ?, ?, ?)',
        [c.id, c.name, c.stream, c.class_teacher_id, c.student_count]
      );
    }

    // Map student to class and insert
    let regNumCount = 1;
    for (const s of studentsArr) {
        let classId = 'c1';
        if (s.classGroup === 's2') classId = 'c2';
        if (s.classGroup === 's3') classId = 'c3';
        if (s.classGroup === 's4') classId = 'c4';

        await db.query(
            'INSERT INTO students (id, class_id, registration_number, gender) VALUES (?, ?, ?, ?)',
            [s.id, classId, 'WNS/2026/' + String(100+regNumCount++), s.gender]
        );
    }

    // Insert teacher classes and subjects
    for (const tName of Object.keys(teachersMap)) {
        const t = teachersMap[tName];
        if (t.subj !== 'DOS') {
            await db.query('INSERT INTO teacher_subjects (teacher_id, subject_name) VALUES (?, ?)', [t.id, t.subj]);
            await db.query('INSERT INTO teacher_classes (teacher_id, class_id) VALUES (?, ?)', [t.id, 'c1']);
            await db.query('INSERT INTO teacher_classes (teacher_id, class_id) VALUES (?, ?)', [t.id, 'c2']);
        }
    }

    // Subjects
    const subjects = [
      { id: 's1', name: 'Mathematics', code: 'MTH', class_id: 'c1' },
      { id: 's2', name: 'English', code: 'ENG', class_id: 'c1' },
      { id: 's3', name: 'Geography', code: 'GEO', class_id: 'c1' },
      { id: 's4', name: 'History', code: 'HST', class_id: 'c1' },
      { id: 's5', name: 'Physics', code: 'PHY', class_id: 'c1' },
      { id: 's6', name: 'Biology', code: 'BIO', class_id: 'c1' }
    ];

    for (const s of subjects) {
      await db.query(
        'INSERT INTO subjects (id, name, code, class_id) VALUES (?, ?, ?, ?)',
        [s.id, s.name, s.code, s.class_id]
      );
    }

    console.log('[seed] Seeding completed successfully!');
  } catch (err) {
    console.error('[seed] Fatal error in seeder:', err);
    throw err;
  }
}

// Execute the seed function when this file is run directly
if (require.main === module) {
  connectDatabase().then(() => seedInitialData()).then(() => {
    console.log('Seed process finished');
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
