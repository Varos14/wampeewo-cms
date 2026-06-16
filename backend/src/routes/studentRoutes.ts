import { Router } from 'express';
import { listStudents, getStudentById, getStudentSkills, createStudent } from '../controllers/studentController';
import { requireRole } from '../middleware/roleCheck';

export const studentRoutes = Router();

studentRoutes.get('/', listStudents);
studentRoutes.post('/', requireRole(['admin']), createStudent);
studentRoutes.get('/:id', getStudentById);
studentRoutes.get('/:studentId/skills', getStudentSkills);
