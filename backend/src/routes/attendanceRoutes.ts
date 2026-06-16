import { Router } from 'express';
import { listAttendance, markAttendance } from '../controllers/attendanceController';
import { requireRole } from '../middleware/roleCheck';

export const attendanceRoutes = Router();

attendanceRoutes.get('/', listAttendance);
attendanceRoutes.post('/', requireRole(['admin', 'teacher']), markAttendance);
