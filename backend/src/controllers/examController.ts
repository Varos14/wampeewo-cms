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
