import { Router } from 'express';
import { getClassTimetable, createTimetableEntry } from '../controllers/timetableController';
import { requireRole } from '../middleware/roleCheck';

export const timetableRoutes = Router();

timetableRoutes.get('/', getClassTimetable);
timetableRoutes.get('/:classId', getClassTimetable);
timetableRoutes.post('/', requireRole(['admin', 'teacher']), createTimetableEntry);
