import { Router } from 'express';
import { listPresentations, createPresentation, deletePresentation } from '../controllers/presentationController';
import { requireRole } from '../middleware/roleCheck';

export const presentationRoutes = Router();

presentationRoutes.get('/', listPresentations);
presentationRoutes.post('/', requireRole(['teacher']), createPresentation);
presentationRoutes.delete('/:id', requireRole(['teacher', 'admin']), deletePresentation);
