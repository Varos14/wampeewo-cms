import type { Request, Response } from 'express';
import { getDb } from '../config/database';

export async function listMaterials(req: Request, res: Response) {
  const teacherId = req.query.teacherId as string | undefined;

  try {
    const db = getDb();
    let query = 'SELECT id, teacher_id as teacherId, title, description, file_url as fileUrl, uploaded_at as uploadedAt FROM materials WHERE 1=1';
    const params: any[] = [];

    if (teacherId) {
      query += ' AND teacher_id = ?';
      params.push(teacherId);
    }

    const [rows] = await db.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error('[listMaterials] DB error:', err);
    return res.status(500).json({ error: 'Internal server error listing materials' });
  }
}

export async function createMaterial(req: Request, res: Response) {
  const { teacherId, title, description, fileUrl } = req.body;

  if (!teacherId || !title || !fileUrl) {
    return res.status(400).json({ error: 'teacherId, title, and fileUrl are required' });
  }

  try {
    const db = getDb();
    const id = 'mat_' + Date.now();
    const uploadedAt = new Date().toISOString();

    await db.query(
      'INSERT INTO materials (id, teacher_id, title, description, file_url, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, teacherId, title, description, fileUrl, uploadedAt]
    );

    return res.status(201).json({ id, teacherId, title, description, fileUrl, uploadedAt });
  } catch (err) {
    console.error('[createMaterial] DB error:', err);
    return res.status(500).json({ error: 'Internal server error creating material' });
  }
}

export async function deleteMaterial(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const db = getDb();
    await db.query('DELETE FROM materials WHERE id = ?', [id]);
    return res.json({ success: true });
  } catch (err) {
    console.error('[deleteMaterial] DB error:', err);
    return res.status(500).json({ error: 'Internal server error deleting material' });
  }
}
