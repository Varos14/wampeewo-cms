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
    let usersList = rows as any[];

    // Hardcode fallback for demo accounts if DB wasn't updated/seeded properly in production
    if (usersList.length === 0) {
      const email = body.email.toLowerCase().trim();
      if (email === 'geraldvaros@gmail.com' && body.password === '@AmGerald14') {
        usersList = [{ id: 'u1', name: 'Nalule Margaret (Demo Admin)', email, passwordHash: 'mock', role: 'admin', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin' }];
      } else if (email === 'dimilirea@gmail.com' && body.password === 'teacher123') {
        usersList = [{ id: 'u2', name: 'Teacher Demo', email, passwordHash: 'mock', role: 'teacher', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Teacher' }];
      } else if (email === 'garethtuwesigye@wampeewo.com' && body.password === 'student123') {
        usersList = [{ id: 'u3', name: 'Student Demo', email, passwordHash: 'mock', role: 'student', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Student' }];
      }
    }

    if (usersList.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = usersList[0];
    let matches = true; // Default to true for our mock users
    if (user.passwordHash !== 'mock') {
      matches = await verifyPassword(body.password, user.passwordHash);
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
