import { Router } from 'express';
import { listMaterials, createMaterial, deleteMaterial } from '../controllers/materialController';
import { requireRole } from '../middleware/roleCheck';

export const materialRoutes = Router();

materialRoutes.get('/', listMaterials);
materialRoutes.post('/', requireRole(['teacher']), createMaterial);
materialRoutes.delete('/:id', requireRole(['teacher', 'admin']), deleteMaterial);
