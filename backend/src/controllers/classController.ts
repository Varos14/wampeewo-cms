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

export async function createClass(req: Request, res: Response) {
  const { name, stream, classTeacherId } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  
  try {
    const db = getDb();
    const id = 'c' + Date.now();
    await db.query(
      'INSERT INTO classes (id, name, stream, class_teacher_id) VALUES (?, ?, ?, ?)',
      [id, name, stream, classTeacherId]
    );
    return res.status(201).json({ id, name, stream, classTeacherId });
  } catch (err) {
    console.error('[createClass] DB error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateClass(req: Request, res: Response) {
  const { id } = req.params;
  const { name, stream, classTeacherId } = req.body;
  
  try {
    const db = getDb();
    await db.query(
      'UPDATE classes SET name = ?, stream = ?, class_teacher_id = ? WHERE id = ?',
      [name, stream, classTeacherId, id]
    );
    return res.json({ id, name, stream, classTeacherId });
  } catch (err) {
    console.error('[updateClass] DB error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteClass(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const db = getDb();
    await db.query('DELETE FROM classes WHERE id = ?', [id]);
    return res.json({ success: true });
  } catch (err) {
    console.error('[deleteClass] DB error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
