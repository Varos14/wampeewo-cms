import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/database';
import { hashPassword, verifyPassword } from '../utils/bcrypt';

type RegisterBody = {
  id?: string;
  name?: string;
  email: string;
  password: string;
  role?: string;
  avatarUrl?: string;
};

type LoginBody = {
  email: string;
  password: string;
};

export async function register(req: Request, res: Response) {
  const body = req.body as RegisterBody;

  if (!body?.email || !body?.password || !body?.name) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }

  const role = body.role ?? 'student';
  const id = body.id ?? `user_${Date.now()}`;
  const avatarUrl = body.avatarUrl ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(body.name)}`;
  const hashed = await hashPassword(body.password);

  try {
    const db = getDb();

    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [body.email]);
    if ((existing as any[]).length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    await db.query(
      'INSERT INTO users (id, name, email, password_hash, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
      [id, body.name, body.email, hashed, role, avatarUrl]
    );

    return res.status(201).json({
      message: 'User created successfully',
      user: { id, name: body.name, email: body.email, role, avatarUrl },
    });
  } catch (err) {
    console.error('[register] DB error:', err);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
}

export async function login(req: Request, res: Response) {
  const body = req.body as LoginBody;

  if (!body?.email || !body?.password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  console.log(`[LOGIN ATTEMPT] email: "${body.email}", password: "${body.password}"`);

  try {
    const db = getDb();

    // Load user from DB
    const [rows] = await db.query(
      'SELECT id, name, email, password_hash as passwordHash, role, avatar_url as avatarUrl FROM users WHERE email = ?',
      [body.email.toLowerCase().trim()]
    );
    const usersList = rows as any[];
    let user = usersList.length > 0 ? usersList[0] : null;
    const emailStr = body.email.toLowerCase().trim();
    const pass = body.password;

    const isDemoAdmin = emailStr === 'geraldvaros@gmail.com' && pass === '@AmGerald14';
    const isDemoTeacher = emailStr === 'mrlochaderrick@wampeewo.com' && pass === 'teacher123';
    const isDemoStudent = emailStr === 'garethtuwesigye@wampeewo.com' && pass === 'student123';

    if (!user) {
      if (isDemoAdmin) {
        user = { id: 'u1', name: 'Mutwezi Gelard(Admin)', email: emailStr, passwordHash: 'mock', role: 'admin', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin' };
      } else if (isDemoTeacher) {
        user = { id: 't1', name: 'Mr. Locha Derrick', email: emailStr, passwordHash: 'mock', role: 'teacher', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Mr.%20Locha%20Derrick' };
      } else if (isDemoStudent) {
        user = { id: 's1', name: 'Student Demo', email: emailStr, passwordHash: 'mock', role: 'student', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Student' };
      } else {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    let matches = false;
    if (isDemoAdmin || isDemoTeacher || isDemoStudent) {
      matches = true;
    } else if (user.passwordHash !== 'mock') {
      matches = await verifyPassword(pass, user.passwordHash);
    }

    if (!matches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET ?? 'change_me_super_secret',
      { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as any },
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (err) {
    console.error('[login] DB error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
}
