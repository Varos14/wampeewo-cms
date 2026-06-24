import { Router } from 'express';
import { saveQuickGrade, getQuickGrade } from '../controllers/gradeController';

export const gradeRoutes = Router();

gradeRoutes.post('/quick', saveQuickGrade);
gradeRoutes.get('/quick/:studentId', getQuickGrade);
