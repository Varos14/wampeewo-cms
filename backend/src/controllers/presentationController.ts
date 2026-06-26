import type { Request, Response } from 'express';
import { getDb } from '../config/database';

export async function listPresentations(req: Request, res: Response) {
  const classId = req.query.classId as string | undefined;
  const teacherId = req.query.teacherId as string | undefined;

  try {
    const db = getDb();
    let query = 'SELECT id, teacher_id as teacherId, class_id as classId, title, meet_link as meetLink, scheduled_at as scheduledAt FROM presentations WHERE 1=1';
    const params: any[] = [];

    if (classId) {
      query += ' AND class_id = ?';
      params.push(classId);
    }
    if (teacherId) {
      query += ' AND teacher_id = ?';
      params.push(teacherId);
    }

    const [rows] = await db.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error('[listPresentations] DB error:', err);
    return res.status(500).json({ error: 'Internal server error listing presentations' });
  }
}

export async function createPresentation(req: Request, res: Response) {
  const { teacherId, classId, title, meetLink, scheduledAt } = req.body;

  if (!teacherId || !classId || !title || !meetLink || !scheduledAt) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const db = getDb();
    const id = 'pres_' + Date.now();

    await db.query(
      'INSERT INTO presentations (id, teacher_id, class_id, title, meet_link, scheduled_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, teacherId, classId, title, meetLink, scheduledAt]
    );

    return res.status(201).json({ id, teacherId, classId, title, meetLink, scheduledAt });
  } catch (err) {
    console.error('[createPresentation] DB error:', err);
    return res.status(500).json({ error: 'Internal server error creating presentation' });
  }
}

export async function deletePresentation(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const db = getDb();
    await db.query('DELETE FROM presentations WHERE id = ?', [id]);
    return res.json({ success: true });
  } catch (err) {
    console.error('[deletePresentation] DB error:', err);
    return res.status(500).json({ error: 'Internal server error deleting presentation' });
  }
}
