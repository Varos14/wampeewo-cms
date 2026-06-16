import { Router } from 'express';
import { listTeachers, createTeacher } from '../controllers/teacherController';
import { requireRole } from '../middleware/roleCheck';

export const teacherRoutes = Router();

teacherRoutes.get('/', listTeachers);
teacherRoutes.post('/', requireRole(['admin']), createTeacher);
