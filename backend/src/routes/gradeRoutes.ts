import { Router } from 'express';
import { saveQuickGrade, getQuickGrade, getAllQuickGrades } from '../controllers/gradeController';

export const gradeRoutes = Router();

gradeRoutes.post('/quick', saveQuickGrade);
gradeRoutes.get('/quick', getAllQuickGrades);
gradeRoutes.get('/quick/:studentId', getQuickGrade);
