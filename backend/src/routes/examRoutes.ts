import { Router } from 'express';
import { listResults, listExams, scheduleExam } from '../controllers/examController';
import { requireRole } from '../middleware/roleCheck';

export const examRoutes = Router();

examRoutes.get('/schedule', listExams);
examRoutes.post('/schedule', requireRole(['admin']), scheduleExam);
examRoutes.get('/', listResults);
