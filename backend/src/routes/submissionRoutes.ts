import { Router } from 'express';
import { createSubmission, listSubmissions, gradeSubmission, gradeDirect } from '../controllers/submissionController';
import { requireRole } from '../middleware/roleCheck';

export const submissionRoutes = Router();

submissionRoutes.get('/', listSubmissions);
submissionRoutes.post('/', requireRole(['student']), createSubmission);
submissionRoutes.post('/grade-direct', requireRole(['admin', 'teacher']), gradeDirect);
submissionRoutes.post('/:id/grade', requireRole(['admin', 'teacher']), gradeSubmission);
