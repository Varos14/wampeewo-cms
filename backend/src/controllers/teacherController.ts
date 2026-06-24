import type { Request, Response } from 'express';
import { getDb } from '../config/database';
import { hashPassword } from '../utils/bcrypt';

export async function listTeachers(_req: Request, res: Response) {
  try {
    const db = getDb();
    
    // Fetch all user accounts with role = 'teacher'
    const [rows] = await db.query(
      'SELECT id, name, email, role, avatar_url as avatarUrl FROM users WHERE role = "teacher"'
    );
    const teachers = rows as any[];

    const results = [];

    for (const t of teachers) {
      // Query subjects
      const [subjectsRows] = await db.query(
        'SELECT subject_name as subjectName FROM teacher_subjects WHERE teacher_id = ?',
        [t.id]
      );
      const subjects = (subjectsRows as any[]).map(s => s.subjectName);

      // Query classIds
      const [classesRows] = await db.query(
        'SELECT class_id as classId FROM teacher_classes WHERE teacher_id = ?',
        [t.id]
      );
      const classIds = (classesRows as any[]).map(c => c.classId);

      results.push({
        ...t,
        subjects,
        classIds
      });
    }

    return res.json(results);
  } catch (err: any) {
    console.error('[listTeachers] DB error:', err);
    return res.status(500).json({ error: 'Internal server error listing teachers: ' + (err.message || 'Unknown error') });
  }
}

export async function createTeacher(req: Request, res: Response) {
  const { name, email, password, subjects, classIds } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }

  const db = getDb();
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Check if email already registered
    const [existingUser] = await conn.query(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    if ((existingUser as any[]).length > 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Email already registered' });
    }

    const teacherId = 'teacher_' + Math.random().toString(36).substring(2, 11);
    const hashedPass = await hashPassword(password);
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    // Insert into users
    await conn.query(
      'INSERT INTO users (id, name, email, password_hash, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
      [teacherId, name, email.toLowerCase().trim(), hashedPass, 'teacher', avatarUrl]
    );

    // Link subjects if provided
    if (Array.isArray(subjects)) {
      for (const subj of subjects) {
        if (subj && typeof subj === 'string') {
          await conn.query(
            'INSERT INTO teacher_subjects (teacher_id, subject_name) VALUES (?, ?)',
            [teacherId, subj.trim()]
          );
        }
      }
    }

    // Link classes if provided
    if (Array.isArray(classIds)) {
      for (const cid of classIds) {
        if (cid && typeof cid === 'string') {
          await conn.query(
            'INSERT INTO teacher_classes (teacher_id, class_id) VALUES (?, ?)',
            [teacherId, cid.trim()]
          );
        }
      }
    }

    await conn.commit();

    return res.status(201).json({
      message: 'Teacher registered successfully',
      teacher: {
        id: teacherId,
        name,
        email,
        subjects: subjects ?? [],
        classIds: classIds ?? []
      }
    });

  } catch (err) {
    await conn.rollback();
    console.error('[createTeacher] DB error:', err);
    return res.status(500).json({ error: 'Internal server error registering teacher' });
  } finally {
    conn.release();
  }
}
