import type { Request, Response } from 'express';
import { getDb } from '../config/database';

export async function listSubjects(req: Request, res: Response) {
  const classId = req.query.classId as string | undefined;

  try {
    const db = getDb();
    
    let query = 'SELECT id, name, code, class_id as classId FROM subjects';
    const params: any[] = [];

    if (classId) {
      query += ' WHERE class_id = ?';
      params.push(classId);
    }

    const [rows] = await db.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error('[listSubjects] DB error:', err);
    return res.status(500).json({ error: 'Internal server error listing subjects' });
  }
}
