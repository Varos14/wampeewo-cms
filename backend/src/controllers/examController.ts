import type { Request, Response } from 'express';
import { getDb } from '../config/database';

export async function listResults(req: Request, res: Response) {
  const studentId = req.query.studentId as string | undefined;

  if (!studentId) {
    return res.status(400).json({ error: 'studentId query parameter is required' });
  }

  try {
    const db = getDb();
    
    const [rows] = await db.query(
      'SELECT id, exam_id as examId, student_id as studentId, subject_id as subjectId, score, grade, remarks FROM exam_results WHERE student_id = ?',
      [studentId]
    );

    return res.json(rows);
  } catch (err) {
    console.error('[listResults] DB error:', err);
    return res.status(500).json({ error: 'Internal server error listing results' });
  }
}

export async function listExams(req: Request, res: Response) {
  try {
    const db = getDb();
    
    // Ensure exams table is upgraded with needed columns
    await db.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        term INT NOT NULL,
        year INT NOT NULL,
        class_id VARCHAR(50) NOT NULL
      )
    `);
    
    try { await db.query('ALTER TABLE exams ADD COLUMN subject_id VARCHAR(50) NOT NULL'); } catch(e) {}
    try { await db.query('ALTER TABLE exams ADD COLUMN subject_name VARCHAR(255) NOT NULL'); } catch(e) {}
    try { await db.query('ALTER TABLE exams ADD COLUMN date VARCHAR(50) NOT NULL'); } catch(e) {}
    try { await db.query('ALTER TABLE exams ADD COLUMN start_time VARCHAR(20) NOT NULL'); } catch(e) {}
    try { await db.query('ALTER TABLE exams ADD COLUMN end_time VARCHAR(20) NOT NULL'); } catch(e) {}

    const [rows] = await db.query(
      'SELECT id, name, term, year, class_id as classId, subject_id as subjectId, subject_name as subjectName, date, start_time as startTime, end_time as endTime FROM exams'
    );

    return res.json(rows);
  } catch (err) {
    console.error('[listExams] DB error:', err);
    return res.status(500).json({ error: 'Internal server error listing exams' });
  }
}

export async function scheduleExam(req: Request, res: Response) {
  const { name, term, year, classId, className, subjectId, subjectName, date, startTime, endTime } = req.body;

  if (!name || !term || !year || !classId || !subjectId || !subjectName || !date || !startTime || !endTime) {
    return res.status(400).json({ error: 'All fields are required to schedule an exam' });
  }

  try {
    const db = getDb();

    // 1. Insert into exams table
    const examId = `exam_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await db.query(
      `INSERT INTO exams (id, name, term, year, class_id, subject_id, subject_name, date, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [examId, name, term, year, classId, subjectId, subjectName, date, startTime, endTime]
    );

    // 2. Post notification / announcement
    const annId = `ann_exam_${Date.now()}`;
    const targetRoles = JSON.stringify(['teacher', 'student']);
    const annTitle = `Exam Scheduled: ${name} - ${subjectName}`;
    const annContent = `A ${name} examination has been scheduled for class ${className || 'target class'} on ${date} from ${startTime} to ${endTime}. Please update your timetables accordingly.`;
    await db.query(
      `INSERT INTO announcements (id, title, content, author_id, author_name, target_roles, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [annId, annTitle, annContent, 'admin', 'Administrator', targetRoles, new Date().toISOString()]
    );

    // 3. Inject into timetable
    const timeId = `time_exam_${Date.now()}`;
    const dateObj = new Date(date);
    let dayOfWeek = dateObj.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    if (dayOfWeek === 0) dayOfWeek = 7; // Map Sunday to 7

    await db.query(
      `INSERT INTO timetables (id, class_id, subject_id, subject_name, teacher_name, day_of_week, start_time, end_time, room)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [timeId, classId, subjectId, `[EXAM] ${subjectName}`, 'Invigilator', dayOfWeek, startTime, endTime, 'Exam Room']
    );

    return res.status(201).json({ message: 'Exam scheduled successfully', examId });
  } catch (err) {
    console.error('[scheduleExam] DB error:', err);
    return res.status(500).json({ error: 'Internal server error scheduling exam' });
  }
}
