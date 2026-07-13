import type { Request, Response } from 'express';
import { getDb } from '../config/database';
import { hashPassword } from '../utils/bcrypt';

export async function registerStudent(req: Request, res: Response) {
  const { name, email, password, gender, classId } = req.body;

  if (!name || !email || !password || !gender || !classId) {
    return res.status(400).json({ error: 'name, email, password, gender, and classId are required' });
  }

  const db = getDb();
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Check if email already registered
    const [existingStudentEmail] = await conn.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if ((existingStudentEmail as any[]).length > 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Auto-generate Registration Number
    const year = new Date().getFullYear();
    const [countRows] = await conn.query("SELECT COUNT(*) as count FROM students WHERE registration_number LIKE ?", [`WN-${year}-%`]);
    const count = (countRows as any[])[0].count + 1;
    const sequence = count.toString().padStart(3, '0');
    const registrationNumber = `WN-${year}-${sequence}`;

    const studentId = 'student_' + Math.random().toString(36).substring(2, 11);
    const studentHashedPass = await hashPassword(password);
    const studentAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    // Insert student into users table
    await conn.query(
      'INSERT INTO users (id, name, email, password_hash, role, avatar_url, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [studentId, name, email.toLowerCase().trim(), studentHashedPass, 'student', studentAvatarUrl, true]
    );

    // Insert student details
    await conn.query(
      'INSERT INTO students (id, class_id, registration_number, gender) VALUES (?, ?, ?, ?)',
      [studentId, classId, registrationNumber, gender]
    );

    // Increment class student count
    await conn.query('UPDATE classes SET student_count = student_count + 1 WHERE id = ?', [classId]);

    // Initialize standard generic skills
    const skills = ['Critical Thinking', 'Creativity', 'Collaboration', 'Communication', 'Self-direction'];
    for (const skill of skills) {
      await conn.query(
        'INSERT INTO generic_skills (student_id, name, value) VALUES (?, ?, ?)',
        [studentId, skill, 2] // Start with default competency of 2
      );
    }

    await conn.commit();

    return res.status(201).json({
      message: 'Student registered successfully',
      student: {
        id: studentId,
        name,
        email,
        role: 'student',
        avatarUrl: studentAvatarUrl,
        registrationNumber,
        gender,
        classId,
      }
    });

  } catch (err) {
    await conn.rollback();
    console.error('[registerStudent] DB error:', err);
    return res.status(500).json({ error: 'Internal server error during student registration' });
  } finally {
    conn.release();
  }
}

export async function registerTeacher(req: Request, res: Response) {
  const { name, email, password, subjects, classIds } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }

  const db = getDb();
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Check if email already registered
    const [existingEmail] = await conn.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if ((existingEmail as any[]).length > 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Email already registered' });
    }

    const teacherId = 'teacher_' + Math.random().toString(36).substring(2, 11);
    const teacherHashedPass = await hashPassword(password);
    const teacherAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    await conn.query(
      'INSERT INTO users (id, name, email, password_hash, role, avatar_url, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [teacherId, name, email.toLowerCase().trim(), teacherHashedPass, 'teacher', teacherAvatarUrl, true]
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
        role: 'teacher',
        subjects: subjects ?? [],
        classIds: classIds ?? []
      }
    });
  } catch (err) {
    await conn.rollback();
    console.error('[registerTeacher] DB error:', err);
    return res.status(500).json({ error: 'Internal server error during teacher registration' });
  } finally {
    conn.release();
  }
}

export async function deleteUser(req: Request, res: Response) {
  const { userId } = req.params;

  try {
    const db = getDb();
    const [result] = await db.query('UPDATE users SET is_active = FALSE WHERE id = ?', [userId]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    console.error('[deleteUser] DB error:', err);
    return res.status(500).json({ error: 'Internal server error during user deletion' });
  }
}

export async function updateAssignmentStatus(req: Request, res: Response) {
  const { aoiId } = req.params;
  const { status, feedback } = req.body;

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'status must be approved or rejected' });
  }

  try {
    const db = getDb();
    
    // check if it exists
    const [aoiRows] = await db.query('SELECT id FROM aois WHERE id = ?', [aoiId]);
    if ((aoiRows as any[]).length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    await db.query('UPDATE aois SET status = ?, feedback = ? WHERE id = ?', [status, feedback || null, aoiId]);

    return res.json({ message: `Assignment ${status} successfully` });
  } catch (err) {
    console.error('[updateAssignmentStatus] DB error:', err);
    return res.status(500).json({ error: 'Internal server error updating assignment status' });
  }
}

// Basic Subject CRUD for Admin
export async function createSubject(req: Request, res: Response) {
  const { name, code, classId } = req.body;
  
  if (!name || !code || !classId) {
    return res.status(400).json({ error: 'name, code, and classId are required' });
  }

  try {
    const db = getDb();
    const id = 's' + Math.random().toString(36).substring(2, 9);
    
    await db.query(
      'INSERT INTO subjects (id, name, code, class_id) VALUES (?, ?, ?, ?)',
      [id, name, code, classId]
    );

    return res.status(201).json({ id, name, code, classId });
  } catch (err) {
    console.error('[createSubject] DB error:', err);
    return res.status(500).json({ error: 'Internal server error creating subject' });
  }
}
