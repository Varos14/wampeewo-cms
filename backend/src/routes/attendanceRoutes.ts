import { Router } from 'express';
import { listAttendance, markAttendance, getAttendanceStats } from '../controllers/attendanceController';
import { requireRole } from '../middleware/roleCheck';

export const attendanceRoutes = Router();

attendanceRoutes.get('/stats', getAttendanceStats);
attendanceRoutes.get('/', listAttendance);
attendanceRoutes.post('/', requireRole(['admin', 'teacher']), markAttendance);
