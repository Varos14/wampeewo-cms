import { Router } from 'express';
import { createAOI, listAOIs, approveAOI } from '../controllers/aoiController';
import { requireRole } from '../middleware/roleCheck';

export const aoiRoutes = Router();

aoiRoutes.get('/', listAOIs);
aoiRoutes.post('/', requireRole(['admin', 'teacher']), createAOI);
aoiRoutes.put('/:id/approve', requireRole(['admin']), approveAOI);
