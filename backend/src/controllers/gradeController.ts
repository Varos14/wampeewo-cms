import { Request, Response } from 'express';
import { getDb } from '../config/database';

export const saveQuickGrade = async (req: Request, res: Response) => {
  try {
    const { studentId, subject, grade } = req.body;
    
    if (!studentId || !subject || !grade) {
      return res.status(400).json({ error: 'Missing studentId, subject, or grade' });
    }

    const db = getDb();

    // Ensure the table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS student_subject_grades (
        student_id VARCHAR(50),
        subject_name VARCHAR(100),
        grade VARCHAR(10) NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (student_id, subject_name)
      )
    `);

    // Upsert the grade for the student and subject
    await db.query(`
      INSERT INTO student_subject_grades (student_id, subject_name, grade) 
      VALUES (?, ?, ?) 
      ON DUPLICATE KEY UPDATE grade = VALUES(grade)
    `, [studentId, subject, grade]);

    res.json({ message: 'Grade saved successfully' });
  } catch (error) {
    console.error('Failed to save quick grade:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getQuickGrade = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const db = getDb();

    const [rows] = await db.query(
      'SELECT subject_name as subject, grade FROM student_subject_grades WHERE student_id = ?',
      [studentId]
    ) as any[];

    res.json({ grades: rows });
  } catch (error) {
    console.error('Failed to get quick grades:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
