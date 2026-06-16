export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Admin extends User {
  role: 'admin';
}

export interface Teacher extends User {
  role: 'teacher';
  subjects: string[]; // Subject IDs/names
  classIds: string[];  // Class IDs they teach
}

export interface Student extends User {
  role: 'student';
  classId: string;
  registrationNumber: string;
  gender: 'Male' | 'Female';
  parentIds: string[]; // Parent user IDs
}

export interface Parent extends User {
  role: 'parent';
  childIds: string[]; // Student user IDs
}

export interface Class {
  id: string;
  name: string;      // e.g., "Senior 1", "Senior 4 Blue"
  stream?: string;    // e.g., "Blue", "Red"
  classTeacherId: string;
  studentCount: number;
}

export interface Subject {
  id: string;
  name: string;      // e.g., "Mathematics", "Physics"
  code: string;      // e.g., "MTH", "PHY"
  classId: string;   // Applicable class
}

export interface AOI {
  id: string;
  title: string;
  description: string;
  deadline: string;
  classId: string;
  teacherId: string;
  rubric: { skill: string; maxScore: number }[];
}

export interface Submission {
  id: string;
  aoiId: string;
  studentId: string;
  content: string;
  attachments?: string[];
  grade?: 1 | 2 | 3; // 1 = Not Achieved, 2 = Progressing, 3 = Achieved
  feedback?: string;
  submittedAt: string;
}

export interface Note {
  id: string;
  studentId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GenericSkill {
  name: string;
  value: 1 | 2 | 3;
}

export type AttendanceStatus = 'present' | 'absent' | 'excused';

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedBy: string; // Teacher ID
}

export interface Exam {
  id: string;
  name: string; // e.g. "End of Term I Exams 2026"
  term: 1 | 2 | 3;
  year: number;
  classId: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  subjectId: string;
  score: number; // 0 to 100
  grade: 'D1' | 'D2' | 'C3' | 'C4' | 'C5' | 'C6' | 'P7' | 'P8' | 'F9';
  remarks?: string;
}

export interface FeeStatement {
  studentId: string;
  billedAmount: number;
  paidAmount: number;
  balance: number;
  payments: FeePayment[];
}

export interface FeePayment {
  id: string;
  amount: number;
  receiptNumber: string;
  paymentMethod: 'Bank Slip' | 'Mobile Money' | 'Cash';
  paymentDate: string; // YYYY-MM-DD
  term: 1 | 2 | 3;
  year: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  targetRoles: UserRole[];
  createdAt: string;
}

export interface TimetableEntry {
  id: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  teacherName: string;
  dayOfWeek: 1 | 2 | 3 | 4 | 5; // Monday to Friday
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  room?: string;
}