import type { Request, Response } from 'express';
import { getDb } from '../config/database';

export async function sendMessage(req: Request, res: Response) {
  const senderId = (req as any).auth?.sub;
  const { receiverId, content } = req.body;

  if (!senderId) return res.status(401).json({ error: 'Unauthorized' });
  if (!receiverId || !content) return res.status(400).json({ error: 'receiverId and content are required' });

  try {
    const db = getDb();
    const id = 'msg_' + Math.random().toString(36).substring(2, 11);
    const createdAt = new Date().toISOString();

    await db.query(
      'INSERT INTO messages (id, sender_id, receiver_id, content, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, senderId, receiverId, content, false, createdAt]
    );

    return res.status(201).json({
      id,
      senderId,
      receiverId,
      content,
      isRead: false,
      createdAt
    });
  } catch (err) {
    console.error('[sendMessage] DB error:', err);
    return res.status(500).json({ error: 'Internal server error sending message' });
  }
}

export async function getConversations(req: Request, res: Response) {
  const userId = (req as any).auth?.sub;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const db = getDb();
    
    // Get the latest message for every distinct user the current user has chatted with
    const query = `
      SELECT 
        m.id, m.sender_id, m.receiver_id, m.content, m.is_read, m.created_at,
        u.id as other_user_id, u.name as other_user_name, u.avatar_url as other_user_avatar
      FROM messages m
      JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
      WHERE m.id IN (
        SELECT MAX(id)
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
      )
      ORDER BY m.created_at DESC
    `;
    
    const [rows] = await db.query(query, [userId, userId, userId, userId]);
    
    const conversations = (rows as any[]).map(r => ({
      otherUserId: r.other_user_id,
      otherUserName: r.other_user_name,
      otherUserAvatar: r.other_user_avatar,
      lastMessage: {
        id: r.id,
        senderId: r.sender_id,
        receiverId: r.receiver_id,
        content: r.content,
        isRead: r.is_read === 1 || r.is_read === true,
        createdAt: r.created_at
      }
    }));

    return res.json(conversations);
  } catch (err) {
    console.error('[getConversations] DB error:', err);
    return res.status(500).json({ error: 'Internal server error fetching conversations' });
  }
}

export async function getMessages(req: Request, res: Response) {
  const currentUserId = (req as any).auth?.sub;
  const { userId } = req.params;

  if (!currentUserId) return res.status(401).json({ error: 'Unauthorized' });
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  try {
    const db = getDb();
    
    // Mark unread messages as read
    await db.query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
      [userId, currentUserId]
    );

    const [rows] = await db.query(
      `SELECT id, sender_id as senderId, receiver_id as receiverId, content, is_read as isRead, created_at as createdAt 
       FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) 
       ORDER BY created_at ASC`,
      [currentUserId, userId, userId, currentUserId]
    );

    const messages = (rows as any[]).map(r => ({
      ...r,
      isRead: r.isRead === 1 || r.isRead === true
    }));

    return res.json(messages);
  } catch (err) {
    console.error('[getMessages] DB error:', err);
    return res.status(500).json({ error: 'Internal server error fetching messages' });
  }
}
