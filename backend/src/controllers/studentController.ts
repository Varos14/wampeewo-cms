import type { Request, Response } from 'express';
import { getDb } from '../config/database';
import { hashPassword } from '../utils/bcrypt';

export async function listStudents(req: Request, res: Response) {
  const classId = req.query.classId as string | undefined;
  const parentId = req.query.parentId as string | undefined;

  try {
    const db = getDb();
    
    let query = `
      SELECT u.id, u.name, u.email, u.role, u.avatar_url as avatarUrl, 
             s.class_id as classId, s.registration_number as registrationNumber, s.gender
      FROM users u
      JOIN students s ON u.id = s.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (classId) {
      conditions.push('s.class_id = ?');
      params.push(classId);
    }
    
    if (parentId) {
      query += ' JOIN student_parents sp ON s.id = sp.student_id';
      conditions.push('sp.parent_id = ?');
      params.push(parentId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const [rows] = await db.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error('[listStudents] DB error:', err);
    return res.status(500).json({ error: 'Internal server error listing students' });
  }
}

export async function getStudentById(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const db = getDb();
    
    const [rows] = await db.query(`
      SELECT u.id, u.name, u.email, u.role, u.avatar_url as avatarUrl, 
             s.class_id as classId, s.registration_number as registrationNumber, s.gender
      FROM users u
      JOIN students s ON u.id = s.id
      WHERE u.id = ?
    `, [id]);

    const list = rows as any[];
    if (list.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    return res.json(list[0]);
  } catch (err) {
    console.error('[getStudentById] DB error:', err);
    return res.status(500).json({ error: 'Internal server error fetching student' });
  }
}

export async function getStudentSkills(req: Request, res: Response) {
  const { studentId } = req.params;

  try {
    const db = getDb();
    
    const [rows] = await db.query(
      'SELECT name, value FROM generic_skills WHERE student_id = ?',
      [studentId]
    );

    return res.json(rows);
  } catch (err) {
    console.error('[getStudentSkills] DB error:', err);
    return res.status(500).json({ error: 'Internal server error fetching student skills' });
  }
}

export async function createStudent(req: Request, res: Response) {
  const {
    name,
    email,
    password,
    registrationNumber,
    gender,
    classId,
    parentName,
    parentEmail,
    parentPassword,
  } = req.body;

  if (!name || !email || !password || !registrationNumber || !gender || !classId) {
    return res.status(400).json({ error: 'name, email, password, registrationNumber, gender, and classId are required' });
  }

  const db = getDb();
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Check if email already registered for student
    const [existingStudentEmail] = await conn.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if ((existingStudentEmail as any[]).length > 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Student email already registered' });
    }

    // Check if registration number is unique
    const [existingReg] = await conn.query('SELECT id FROM students WHERE registration_number = ?', [registrationNumber.trim()]);
    if ((existingReg as any[]).length > 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Registration number already exists' });
    }

    const studentId = 'student_' + Math.random().toString(36).substring(2, 11);
    const studentHashedPass = await hashPassword(password);
    const studentAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    // Insert student into users table
    await conn.query(
      'INSERT INTO users (id, name, email, password_hash, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
      [studentId, name, email.toLowerCase().trim(), studentHashedPass, 'student', studentAvatarUrl]
    );

    // Insert student details
    await conn.query(
      'INSERT INTO students (id, class_id, registration_number, gender) VALUES (?, ?, ?, ?)',
      [studentId, classId, registrationNumber.trim(), gender]
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

    // Handle optional parent creation/linking
    let parentId: string | null = null;
    if (parentName && parentEmail && parentPassword) {
      // Check if parent email already exists
      const [existingParentUser] = await conn.query(
        'SELECT id, role FROM users WHERE email = ?',
        [parentEmail.toLowerCase().trim()]
      );
      const parentUserRows = existingParentUser as any[];

      if (parentUserRows.length > 0) {
        if (parentUserRows[0].role !== 'parent') {
          await conn.rollback();
          return res.status(400).json({ error: 'Parent email is already registered with another role' });
        }
        parentId = parentUserRows[0].id;
      } else {
        // Create new parent user
        parentId = 'parent_' + Math.random().toString(36).substring(2, 11);
        const parentHashedPass = await hashPassword(parentPassword);
        const parentAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(parentName)}`;

        await conn.query(
          'INSERT INTO users (id, name, email, password_hash, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
          [parentId, parentName, parentEmail.toLowerCase().trim(), parentHashedPass, 'parent', parentAvatarUrl]
        );

        await conn.query('INSERT INTO parents (id) VALUES (?)', [parentId]);
      }

      // Link student and parent
      await conn.query(
        'INSERT INTO student_parents (student_id, parent_id) VALUES (?, ?)',
        [studentId, parentId]
      );
    }

    await conn.commit();

    return res.status(201).json({
      message: 'Student registered successfully',
      student: {
        id: studentId,
        name,
        email,
        registrationNumber,
        gender,
        classId,
        parentId,
      }
    });

  } catch (err) {
    await conn.rollback();
    console.error('[createStudent] DB error:', err);
    return res.status(500).json({ error: 'Internal server error during student registration' });
  } finally {
    conn.release();
  }
}
