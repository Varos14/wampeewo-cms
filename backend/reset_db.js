require('dotenv').config();
const mysql = require('mysql2/promise');

async function resetDb() {
  console.log('Connecting to database...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306')
  });

  const tables = [
    'users', 'classes', 'subjects', 'students', 'generic_skills', 
    'teacher_classes', 'teacher_subjects', 'aois', 'submissions', 
    'attendance', 'exams', 'exam_results', 'timetables', 
    'announcements', 'notes', 'materials', 'presentations',
    'fee_payments', 'fee_statements', 'student_parents', 'parents'
  ];

  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  
  for (const table of tables) {
    try {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
      console.log(`Dropped table: ${table}`);
    } catch (e) {
      console.log(`Error dropping ${table}: ${e.message}`);
    }
  }

  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  await connection.end();
  
  console.log('\nDatabase has been wiped. Restart your Render server to re-seed it with the correct data!');
}

resetDb().catch(console.error);
