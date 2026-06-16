import type { Request, Response } from 'express';
import { getDb } from '../config/database';

export async function listAttendance(req: Request, res: Response) {
  const classId = req.query.classId as string | undefined;
  const date = req.query.date as string | undefined;

  if (!classId || !date) {
    return res.status(400).json({ error: 'classId and date query parameters are required' });
  }

  try {
    const db = getDb();
    
    const [rows] = await db.query(
      'SELECT id, student_id as studentId, class_id as classId, date, status, marked_by as markedBy FROM attendance WHERE class_id = ? AND date = ?',
      [classId, date]
    );

    return res.json(rows);
  } catch (err) {
    console.error('[listAttendance] DB error:', err);
    return res.status(500).json({ error: 'Internal server error listing attendance' });
  }
}

export async function markAttendance(req: Request, res: Response) {
  const { records } = req.body;

  if (!Array.isArray(records)) {
    return res.status(400).json({ error: 'records array is required' });
  }

  try {
    const db = getDb();
    const results: any[] = [];

    for (const record of records) {
      const { studentId, classId, date, status, markedBy } = record;

      if (!studentId || !classId || !date || !status || !markedBy) {
        continue;
      }

      // Check if existing record exists
      const [existing] = await db.query(
        'SELECT id FROM attendance WHERE student_id = ? AND class_id = ? AND date = ?',
        [studentId, classId, date]
      );
      const list = existing as any[];

      if (list.length > 0) {
        // Update
        const id = list[0].id;
        await db.query(
          'UPDATE attendance SET status = ?, marked_by = ? WHERE id = ?',
          [status, markedBy, id]
        );
        results.push({ id, studentId, classId, date, status, markedBy });
      } else {
        // Insert new
        const id = `att_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        await db.query(
          'INSERT INTO attendance (id, student_id, class_id, date, status, marked_by) VALUES (?, ?, ?, ?, ?, ?)',
          [id, studentId, classId, date, status, markedBy]
        );
        results.push({ id, studentId, classId, date, status, markedBy });
      }
    }

    return res.json(results);
  } catch (err) {
    console.error('[markAttendance] DB error:', err);
    return res.status(500).json({ error: 'Internal server error marking attendance' });
  }
}
