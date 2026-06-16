import { Router } from 'express';
import { createSubmission, listSubmissions, gradeSubmission } from '../controllers/submissionController';
import { requireRole } from '../middleware/roleCheck';

export const submissionRoutes = Router();

submissionRoutes.get('/', listSubmissions);
submissionRoutes.post('/', requireRole(['student']), createSubmission);
submissionRoutes.post('/:id/grade', requireRole(['admin', 'teacher']), gradeSubmission);
