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
  const { teacherId, title, description, fileUrl, fileData, fileName } = req.body;

  if (!teacherId || !title) {
    return res.status(400).json({ error: 'teacherId and title are required' });
  }

  try {
    const db = getDb();
    const id = 'mat_' + Date.now();
    const uploadedAt = new Date().toISOString();
    let finalFileUrl = fileUrl || '';

    // If base64 file data is uploaded, save it to disk
    if (fileData && fileName) {
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(__dirname, '../../uploads'); // backend/uploads
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const base64Content = fileData.split(';base64,').pop();
      const uniqueFileName = `${Date.now()}_${fileName}`;
      const filePath = path.join(uploadDir, uniqueFileName);
      
      fs.writeFileSync(filePath, base64Content, { encoding: 'base64' });
      finalFileUrl = `/uploads/${uniqueFileName}`;
    }

    if (!finalFileUrl) {
      return res.status(400).json({ error: 'A file upload or valid fileUrl is required' });
    }

    await db.query(
      'INSERT INTO materials (id, teacher_id, title, description, file_url, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, teacherId, title, description, finalFileUrl, uploadedAt]
    );

    return res.status(201).json({ id, teacherId, title, description, fileUrl: finalFileUrl, uploadedAt });
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
