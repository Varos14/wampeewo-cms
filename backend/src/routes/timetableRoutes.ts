import { Router } from 'express';
import { getClassTimetable } from '../controllers/timetableController';

export const timetableRoutes = Router();

timetableRoutes.get('/', getClassTimetable);
timetableRoutes.get('/:classId', getClassTimetable);
