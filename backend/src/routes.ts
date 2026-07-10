import type { Express } from 'express';
import { authRoutes } from './routes/authRoutes';
import { aoiRoutes } from './routes/aoiRoutes';
import { submissionRoutes } from './routes/submissionRoutes';
import { noteRoutes } from './routes/noteRoutes';
import { skillRoutes } from './routes/skillRoutes';
import { attendanceRoutes } from './routes/attendanceRoutes';
import { studentRoutes } from './routes/studentRoutes';
import { teacherRoutes } from './routes/teacherRoutes';
import { classRoutes } from './routes/classRoutes';
import { subjectRoutes } from './routes/subjectRoutes';
import { examRoutes } from './routes/examRoutes';
import { announcementRoutes } from './routes/announcementRoutes';
import { timetableRoutes } from './routes/timetableRoutes';
import { gradeRoutes } from './routes/gradeRoutes';
import { materialRoutes } from './routes/materialRoutes';
import { presentationRoutes } from './routes/presentationRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { messageRoutes } from './routes/messageRoutes';
import { requireAuth } from './middleware/auth';

export function registerRoutes(app: Express) {
  app.use('/api/auth', authRoutes);
  
  // Enforce authentication globally on all subsequent /api endpoints
  app.use('/api', requireAuth);

  app.use('/api/aoi', aoiRoutes);
  app.use('/api/submissions', submissionRoutes);
  app.use('/api/notes', noteRoutes);
  app.use('/api/skills', skillRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/teachers', teacherRoutes);
  app.use('/api/classes', classRoutes);
  app.use('/api/subjects', subjectRoutes);
  app.use('/api/results', examRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/timetable', timetableRoutes);
  app.use('/api/grades', gradeRoutes);
  app.use('/api/materials', materialRoutes);
  app.use('/api/presentations', presentationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/messages', messageRoutes);
}
