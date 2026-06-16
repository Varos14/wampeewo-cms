import { Router } from 'express';
import { createNote, listNotes, updateNote, deleteNote } from '../controllers/noteController';
import { requireRole } from '../middleware/roleCheck';

export const noteRoutes = Router();

noteRoutes.get('/', listNotes);
noteRoutes.post('/', requireRole(['student']), createNote);
noteRoutes.put('/:id', requireRole(['student']), updateNote);
noteRoutes.delete('/:id', requireRole(['student']), deleteNote);
