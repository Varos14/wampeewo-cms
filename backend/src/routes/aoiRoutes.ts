import { Router } from 'express';
import { createAOI, listAOIs } from '../controllers/aoiController';
import { requireRole } from '../middleware/roleCheck';

export const aoiRoutes = Router();

aoiRoutes.get('/', listAOIs);
aoiRoutes.post('/', requireRole(['admin', 'teacher']), createAOI);
