import { Router } from 'express';
import { 
  registerStudent, 
  registerTeacher, 
  deleteUser, 
  updateAssignmentStatus,
  createSubject
} from '../controllers/adminController';
import { requireRole } from '../middleware/auth';

export const adminRoutes = Router();

// Middleware to enforce admin role for all routes in this router
adminRoutes.use(requireRole(['admin']));

// Users
adminRoutes.post('/students', registerStudent);
adminRoutes.post('/teachers', registerTeacher);
adminRoutes.delete('/users/:userId', deleteUser);

// Subjects
adminRoutes.post('/subjects', createSubject);

// Assignments
adminRoutes.put('/assignments/:aoiId/status', updateAssignmentStatus);
