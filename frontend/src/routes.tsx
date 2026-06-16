import { RouteObject, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import { RoleGuard } from './components/guards/RoleGuard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminTeachers from './pages/admin/Teachers';
import AdminClasses from './pages/admin/Classes';
import AdminSubjects from './pages/admin/Subjects';
import AdminAttendance from './pages/admin/Attendance';
import AdminExams from './pages/admin/Exams';
import AdminResults from './pages/admin/Results';
import AdminFees from './pages/admin/Fees';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherAssignments from './pages/teacher/Assignments';
import TeacherGradeBook from './pages/teacher/GradeBook';
import TeacherMyClasses from './pages/teacher/MyClasses';
import TeacherTimetable from './pages/teacher/Timetable';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentSubjects from './pages/student/Subjects';
import StudentAssignments from './pages/student/Assignments';
import StudentAttendance from './pages/student/Attendance';
import StudentResults from './pages/student/Results';
import StudentNotes from './pages/student/Notes';
import StudentTimetable from './pages/student/Timetable';

// Parent Pages
import ParentDashboard from './pages/parent/Dashboard';
import ParentResults from './pages/parent/Results';
import ParentAttendance from './pages/parent/Attendance';
import ParentFeeStatements from './pages/parent/FeeStatements';

export const routes: RouteObject[] = [
  // Public Routes (Auth)
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: '', element: <Navigate to="/login" replace /> },
      { path: 'login', element: <Login /> },
    ],
  },

  // Admin Portal Subtree
  {
    path: '/admin',
    element: <RoleGuard allowedRoles={['admin']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '', element: <AdminDashboard /> },
          { path: 'students', element: <AdminStudents /> },
          { path: 'teachers', element: <AdminTeachers /> },
          { path: 'classes', element: <AdminClasses /> },
          { path: 'subjects', element: <AdminSubjects /> },
          { path: 'attendance', element: <AdminAttendance /> },
          { path: 'exams', element: <AdminExams /> },
          { path: 'results', element: <AdminResults /> },
          { path: 'fees', element: <AdminFees /> },
          { path: 'reports', element: <AdminReports /> },
          { path: 'settings', element: <AdminSettings /> },
        ],
      },
    ],
  },

  // Teacher Portal Subtree
  {
    path: '/teacher',
    element: <RoleGuard allowedRoles={['teacher']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '', element: <TeacherDashboard /> },
          { path: 'attendance', element: <TeacherAttendance /> },
          { path: 'assignments', element: <TeacherAssignments /> },
          { path: 'gradebook', element: <TeacherGradeBook /> },
          { path: 'classes', element: <TeacherMyClasses /> },
          { path: 'timetable', element: <TeacherTimetable /> },
        ],
      },
    ],
  },

  // Student Portal Subtree
  {
    path: '/student',
    element: <RoleGuard allowedRoles={['student']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '', element: <StudentDashboard /> },
          { path: 'subjects', element: <StudentSubjects /> },
          { path: 'assignments', element: <StudentAssignments /> },
          { path: 'attendance', element: <StudentAttendance /> },
          { path: 'results', element: <StudentResults /> },
          { path: 'notes', element: <StudentNotes /> },
          { path: 'timetable', element: <StudentTimetable /> },
        ],
      },
    ],
  },

  // Parent Portal Subtree
  {
    path: '/parent',
    element: <RoleGuard allowedRoles={['parent']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '', element: <ParentDashboard /> },
          { path: 'results', element: <ParentResults /> },
          { path: 'attendance', element: <ParentAttendance /> },
          { path: 'fees', element: <ParentFeeStatements /> },
        ],
      },
    ],
  },

  // Fallback Catch-all Route
  {
    path: '*',
    element: <NotFound />,
  },
];
