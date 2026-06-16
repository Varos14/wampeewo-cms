import type { Request, Response } from 'express';
import { getDb } from '../config/database';

export async function listNotes(req: Request, res: Response) {
  const studentId = req.query.studentId as string | undefined;

  if (!studentId) {
    return res.status(400).json({ error: 'studentId query parameter is required' });
  }

  try {
    const db = getDb();
    
    const [rows] = await db.query(
      'SELECT id, student_id as studentId, title, content, tags, created_at as createdAt, updated_at as updatedAt FROM notes WHERE student_id = ? ORDER BY created_at DESC',
      [studentId]
    );

    const items = (rows as any[]).map(r => ({
      ...r,
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags
    }));

    return res.json(items);
  } catch (err) {
    console.error('[listNotes] DB error:', err);
    return res.status(500).json({ error: 'Internal server error listing notes' });
  }
}

export async function createNote(req: Request, res: Response) {
  const { studentId, title, content, tags } = req.body;

  if (!studentId || !title || !content) {
    return res.status(400).json({ error: 'studentId, title, and content are required' });
  }

  const id = `note_${Date.now()}`;
  const now = new Date().toISOString();
  const tagsStr = JSON.stringify(tags ?? []);

  try {
    const db = getDb();

    await db.query(
      'INSERT INTO notes (id, student_id, title, content, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, studentId, title, content, tagsStr, now, now]
    );

    return res.status(201).json({
      id,
      studentId,
      title,
      content,
      tags,
      createdAt: now,
      updatedAt: now
    });
  } catch (err) {
    console.error('[createNote] DB error:', err);
    return res.status(500).json({ error: 'Internal server error creating note' });
  }
}

export async function updateNote(req: Request, res: Response) {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'content is required' });
  }

  const now = new Date().toISOString();

  try {
    const db = getDb();

    // Check if exists
    const [existing] = await db.query('SELECT id, student_id, title, tags, created_at FROM notes WHERE id = ?', [id]);
    const list = existing as any[];
    if (list.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await db.query(
      'UPDATE notes SET content = ?, updated_at = ? WHERE id = ?',
      [content, now, id]
    );

    const note = list[0];
    return res.json({
      id,
      studentId: note.student_id,
      title: note.title,
      content,
      tags: typeof note.tags === 'string' ? JSON.parse(note.tags) : note.tags,
      createdAt: note.created_at,
      updatedAt: now
    });
  } catch (err) {
    console.error('[updateNote] DB error:', err);
    return res.status(500).json({ error: 'Internal server error updating note' });
  }
}

export async function deleteNote(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const db = getDb();

    const [existing] = await db.query('SELECT id FROM notes WHERE id = ?', [id]);
    if ((existing as any[]).length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await db.query('DELETE FROM notes WHERE id = ?', [id]);

    return res.status(204).send();
  } catch (err) {
    console.error('[deleteNote] DB error:', err);
    return res.status(500).json({ error: 'Internal server error deleting note' });
  }
}
