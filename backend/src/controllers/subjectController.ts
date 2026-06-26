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

export async function createSubject(req: Request, res: Response) {
  const { name, code, classId } = req.body;
  if (!name || !classId) return res.status(400).json({ error: 'Name and classId required' });
  
  try {
    const db = getDb();
    const id = 's' + Date.now();
    await db.query(
      'INSERT INTO subjects (id, name, code, class_id) VALUES (?, ?, ?, ?)',
      [id, name, code, classId]
    );
    return res.status(201).json({ id, name, code, classId });
  } catch (err) {
    console.error('[createSubject] DB error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateSubject(req: Request, res: Response) {
  const { id } = req.params;
  const { name, code, classId } = req.body;
  try {
    const db = getDb();
    await db.query(
      'UPDATE subjects SET name = ?, code = ?, class_id = ? WHERE id = ?',
      [name, code, classId, id]
    );
    return res.json({ id, name, code, classId });
  } catch (err) {
    console.error('[updateSubject] DB error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteSubject(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const db = getDb();
    await db.query('DELETE FROM subjects WHERE id = ?', [id]);
    return res.json({ success: true });
  } catch (err) {
    console.error('[deleteSubject] DB error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
