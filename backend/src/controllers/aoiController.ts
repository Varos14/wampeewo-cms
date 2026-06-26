import type { Request, Response } from 'express';
import { getDb } from '../config/database';

export async function listAOIs(req: Request, res: Response) {
  const classId = req.query.classId as string | undefined;
  const teacherId = req.query.teacherId as string | undefined;

  try {
    const db = getDb();
    
    let query = 'SELECT id, title, description, deadline, class_id as classId, teacher_id as teacherId, rubric, status, type FROM aois WHERE 1=1';
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
    
    // Parse rubric JSON strings
    const items = (rows as any[]).map(r => ({
      ...r,
      rubric: typeof r.rubric === 'string' ? JSON.parse(r.rubric) : r.rubric
    }));

    return res.json(items);
  } catch (err) {
    console.error('[listAOIs] DB error:', err);
    return res.status(500).json({ error: 'Internal server error listing AOIs' });
  }
}

export async function createAOI(req: Request, res: Response) {
  const { title, description, deadline, classId, teacherId, rubric, type } = req.body;

  if (!title || !description || !deadline || !classId || !teacherId) {
    return res.status(400).json({ error: 'title, description, deadline, classId, and teacherId are required' });
  }

  const aoiType = type || 'assignment';
  const status = 'pending';

  const id = `aoi_${Date.now()}`;
  const rubricStr = JSON.stringify(rubric ?? []);

  try {
    const db = getDb();

    await db.query(
      'INSERT INTO aois (id, title, description, deadline, class_id, teacher_id, rubric, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, description, deadline, classId, teacherId, rubricStr, aoiType, status]
    );

    return res.status(201).json({
      id,
      title,
      description,
      deadline,
      classId,
      teacherId,
      rubric,
      type: aoiType,
      status
    });
  } catch (err) {
    console.error('[createAOI] DB error:', err);
    return res.status(500).json({ error: 'Internal server error creating AOI' });
  }
}

export async function approveAOI(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body; // 'approved' | 'rejected'

  if (status !== 'approved' && status !== 'rejected') {
    return res.status(400).json({ error: 'Status must be approved or rejected' });
  }

  try {
    const db = getDb();
    await db.query('UPDATE aois SET status = ? WHERE id = ?', [status, id]);
    return res.json({ id, status });
  } catch (err) {
    console.error('[approveAOI] DB error:', err);
    return res.status(500).json({ error: 'Internal server error approving AOI' });
  }
}
