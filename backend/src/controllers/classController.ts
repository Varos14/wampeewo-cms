import type { Request, Response } from 'express';
import { getDb } from '../config/database';

export async function listClasses(_req: Request, res: Response) {
  try {
    const db = getDb();
    
    const [rows] = await db.query(
      'SELECT id, name, stream, class_teacher_id as classTeacherId, student_count as studentCount FROM classes'
    );
    return res.json(rows);
  } catch (err) {
    console.error('[listClasses] DB error:', err);
    return res.status(500).json({ error: 'Internal server error listing classes' });
  }
}
