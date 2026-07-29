import { Router } from 'express';
import { listClasses, createClass, updateClass, deleteClass } from '../controllers/classController';

import { downloadClassReport } from '../controllers/reportController';
import { requireRole } from '../middleware/roleCheck';

export const classRoutes = Router();

classRoutes.get('/', listClasses);
classRoutes.post('/', createClass);
classRoutes.put('/:id', updateClass);
classRoutes.delete('/:id', deleteClass);
classRoutes.get('/:classId/reports/download', requireRole(['admin', 'teacher']), downloadClassReport);
