import { 
  User, Student, Teacher, Class, Subject, 
  AOI, Submission, Note, GenericSkill, Attendance, 
  ExamResult, Announcement, TimetableEntry 
} from '../types';
import * as mock from '../utils/mockData';
import { useAuthStore } from '../store/authStore';

const MOCK_MODE = false;
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().logout();
      throw new Error('Session expired. Please log in again.');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}



export const authService = {
  login: async (email: string, password: string) => {
    if (MOCK_MODE) {
      await delay(600);
      const user = mock.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      // For mock purposes, password is just their role + '123' (e.g. 'student123')
      if (!user || password !== `${user.role}123`) {
        throw new Error('Invalid credentials');
      }
      return { user, token: 'mock-jwt-token-wNS-ss-2026' };
    }
    const data = await request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return data;
  }
};

export const studentService = {
  list: async (filters?: { classId?: string }): Promise<Student[]> => {
    if (MOCK_MODE) {
      await delay();
      let res = mock.mockStudents;
      if (filters?.classId) res = res.filter(s => s.classId === filters.classId);
      return res;
    }
    const params = new URLSearchParams();
    if (filters?.classId) params.append('classId', filters.classId);
    return request<Student[]>(`/students${params.toString() ? `?${params.toString()}` : ''}`);
  },
  getById: async (id: string): Promise<Student | undefined> => {
    if (MOCK_MODE) {
      await delay();
      return mock.mockStudents.find(s => s.id === id);
    }
    return request<Student>(`/students/${id}`);
  },
  getSkills: async (studentId: string): Promise<GenericSkill[]> => {
    if (MOCK_MODE) {
      await delay();
      return mock.mockGenericSkills[studentId] || [];
    }
    return request<GenericSkill[]>(`/students/${studentId}/skills`);
  },
  create: async (data: any): Promise<any> => {
    if (MOCK_MODE) {
      await delay();
      const newStudent = { ...data, id: `student_${Date.now()}` };
      mock.mockStudents.push(newStudent);
      return newStudent;
    }
    return request<any>('/students', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

export const teacherService = {
  list: async (): Promise<Teacher[]> => {
    if (MOCK_MODE) {
      await delay();
      return mock.mockTeachers;
    }
    return request<Teacher[]>('/teachers');
  },
  create: async (data: any): Promise<any> => {
    if (MOCK_MODE) {
      await delay();
      const newTeacher = { ...data, id: `teacher_${Date.now()}` };
      mock.mockTeachers.push(newTeacher);
      return newTeacher;
    }
    return request<any>('/teachers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

export const classService = {
  list: async (): Promise<Class[]> => {
    if (MOCK_MODE) {
      await delay();
      return mock.mockClasses;
    }
    return request<Class[]>('/classes');
  },
  create: async (data: any): Promise<Class> => {
    if (MOCK_MODE) {
      await delay();
      return { id: 'c' + Date.now(), studentCount: 0, ...data };
    }
    return request<Class>('/classes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  delete: async (id: string): Promise<void> => {
    if (MOCK_MODE) {
      await delay();
      return;
    }
    await request<void>(`/classes/${id}`, { method: 'DELETE' });
  }
};

export const subjectService = {
  list: async (classId?: string): Promise<Subject[]> => {
    if (MOCK_MODE) {
      await delay();
      if (classId) return mock.mockSubjects.filter(s => s.classId === classId);
      return mock.mockSubjects;
    }
    return request<Subject[]>(`/subjects${classId ? `?classId=${classId}` : ''}`);
  },
  create: async (data: any): Promise<Subject> => {
    if (MOCK_MODE) {
      await delay();
      return { id: 's' + Date.now(), ...data };
    }
    return request<Subject>('/subjects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  delete: async (id: string): Promise<void> => {
    if (MOCK_MODE) {
      await delay();
      return;
    }
    await request<void>(`/subjects/${id}`, { method: 'DELETE' });
  }
};

export const aoiService = {
  list: async (classId?: string, teacherId?: string): Promise<AOI[]> => {
    if (MOCK_MODE) {
      await delay();
      let items = [...mock.mockAOIs];
      if (classId) items = items.filter(a => a.classId === classId);
      if (teacherId) items = items.filter(a => a.teacherId === teacherId);
      return items;
    }
    const params = new URLSearchParams();
    if (classId) params.append('classId', classId);
    if (teacherId) params.append('teacherId', teacherId);
    return request<AOI[]>(`/aoi?${params.toString()}`);
  },
  create: async (data: Omit<AOI, 'id'>): Promise<AOI> => {
    if (MOCK_MODE) {
      await delay();
      const newAoi: AOI = {
        ...data,
        id: `aoi${mock.mockAOIs.length + 1}`
      };
      mock.mockAOIs.push(newAoi);
      return newAoi;
    }
    return request<AOI>('/aoi', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  listSubmissions: async (aoiId: string): Promise<Submission[]> => {
    if (MOCK_MODE) {
      await delay();
      return mock.mockSubmissions.filter(s => s.aoiId === aoiId);
    }
    return request<Submission[]>(`/submissions?aoiId=${aoiId}`);
  },
  submitAssignment: async (aoiId: string, studentId: string, content: string): Promise<Submission> => {
    if (MOCK_MODE) {
      await delay();
      const newSub: Submission = {
        id: `sub${mock.mockSubmissions.length + 1}`,
        aoiId,
        studentId,
        content,
        submittedAt: new Date().toISOString()
      };
      mock.mockSubmissions.push(newSub);
      return newSub;
    }
    return request<Submission>('/submissions', {
      method: 'POST',
      body: JSON.stringify({ aoiId, studentId, content })
    });
  },
  gradeSubmission: async (id: string, grade: 1 | 2 | 3, feedback: string): Promise<Submission> => {
    if (MOCK_MODE) {
      await delay();
      const sub = mock.mockSubmissions.find(s => s.id === id);
      if (!sub) throw new Error('Submission not found');
      sub.grade = grade;
      sub.feedback = feedback;
      return sub;
    }
    return request<Submission>(`/submissions/${id}/grade`, {
      method: 'POST',
      body: JSON.stringify({ grade, feedback })
    });
  },
  approve: async (id: string, status: string = 'approved'): Promise<AOI> => {
    if (MOCK_MODE) {
      await delay();
      const aoi = mock.mockAOIs.find(a => a.id === id);
      if (aoi) aoi.status = status as any;
      return aoi as any;
    }
    return request<AOI>(`/aoi/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }
};

export const attendanceService = {
  list: async (classId: string, date: string): Promise<Attendance[]> => {
    if (MOCK_MODE) {
      await delay();
      return mock.mockAttendance.filter(a => a.classId === classId && a.date === date);
    }
    return request<Attendance[]>(`/attendance?classId=${classId}&date=${date}`);
  },
  mark: async (records: Omit<Attendance, 'id'>[]): Promise<Attendance[]> => {
    if (MOCK_MODE) {
      await delay();
      const newRecords = records.map((r, i) => ({
        ...r,
        id: `att_new_${Date.now()}_${i}`
      }));
      mock.mockAttendance.push(...newRecords);
      return newRecords;
    }
    return request<Attendance[]>('/attendance', {
      method: 'POST',
      body: JSON.stringify({ records })
    });
  },
  getStudentStats: async (studentId: string): Promise<{ percentage: number; present: number; absent: number; excused: number }> => {
    await delay();
    const records = mock.mockAttendance.filter(a => a.studentId === studentId);
    const total = records.length;
    if (total === 0) return { percentage: 100, present: 0, absent: 0, excused: 0 };
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const excused = records.filter(r => r.status === 'excused').length;
    return {
      percentage: Math.round(((present + excused * 0.5) / total) * 100),
      present,
      absent,
      excused
    };
  }
};

export const examService = {
  listResults: async (studentId: string): Promise<ExamResult[]> => {
    if (MOCK_MODE) {
      await delay();
      return mock.mockExamResults.filter(r => r.studentId === studentId);
    }
    return request<ExamResult[]>(`/results?studentId=${studentId}`);
  }
};


export const announcementService = {
  list: async (role: string): Promise<Announcement[]> => {
    if (MOCK_MODE) {
      await delay();
      return mock.mockAnnouncements.filter(a => a.targetRoles.includes(role as any));
    }
    return request<Announcement[]>(`/announcements?role=${role}`);
  }
};

export const noteService = {
  list: async (studentId: string): Promise<Note[]> => {
    if (MOCK_MODE) {
      await delay();
      return mock.mockNotes.filter(n => n.studentId === studentId);
    }
    return request<Note[]>(`/notes?studentId=${studentId}`);
  },
  create: async (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
    if (MOCK_MODE) {
      await delay();
      const now = new Date().toISOString();
      const newNote: Note = {
        ...data,
        id: `note${mock.mockNotes.length + 1}`,
        createdAt: now,
        updatedAt: now
      };
      mock.mockNotes.push(newNote);
      return newNote;
    }
    return request<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  update: async (id: string, content: string): Promise<Note> => {
    if (MOCK_MODE) {
      await delay();
      const note = mock.mockNotes.find(n => n.id === id);
      if (!note) throw new Error('Note not found');
      note.content = content;
      note.updatedAt = new Date().toISOString();
      return note;
    }
    return request<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    });
  },
  delete: async (id: string): Promise<void> => {
    if (MOCK_MODE) {
      await delay();
      const index = mock.mockNotes.findIndex(n => n.id === id);
      if (index !== -1) mock.mockNotes.splice(index, 1);
      return;
    }
    return request<void>(`/notes/${id}`, { method: 'DELETE' });
  }
};

export const timetableService = {
  getByClass: async (classId: string): Promise<TimetableEntry[]> => {
    if (MOCK_MODE) {
      await delay();
      return mock.mockTimetables.filter(t => t.classId === classId);
    }
    return request<TimetableEntry[]>(`/timetable?classId=${classId}`);
  },
  create: async (data: Omit<TimetableEntry, 'id'>): Promise<TimetableEntry> => {
    if (MOCK_MODE) {
      await delay();
      const newEntry: TimetableEntry = { ...data, id: `t${Date.now()}` };
      mock.mockTimetables.push(newEntry);
      return newEntry;
    }
    return request<TimetableEntry>('/timetable', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

export const gradeService = {
  saveQuickGrade: async (studentId: string, subject: string, grade: string): Promise<{ message: string }> => {
    if (MOCK_MODE) {
      await delay();
      return { message: 'Mock grade saved successfully' };
    }
    return request<{ message: string }>('/grades/quick', {
      method: 'POST',
      body: JSON.stringify({ studentId, subject, grade })
    });
  },
  getQuickGrade: async (studentId: string): Promise<{ grades: { subject: string, grade: string }[] }> => {
    if (MOCK_MODE) {
      await delay();
      return { grades: [] };
    }
    return request<{ grades: { subject: string, grade: string }[] }>(`/grades/quick?studentId=${studentId}`);
  }
};

export const materialService = {
  list: async (filters?: { teacherId?: string }): Promise<any[]> => {
    if (MOCK_MODE) {
      await delay();
      return [];
    }
    const params = new URLSearchParams();
    if (filters?.teacherId) params.append('teacherId', filters.teacherId);
    return request<any[]>(`/materials?${params.toString()}`);
  },
  create: async (data: any): Promise<any> => {
    if (MOCK_MODE) {
      await delay();
      return { id: 'm1', ...data, uploadedAt: new Date().toISOString() };
    }
    return request<any>('/materials', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

export const presentationService = {
  list: async (filters?: { classId?: string; teacherId?: string }): Promise<any[]> => {
    if (MOCK_MODE) {
      await delay();
      return [];
    }
    const params = new URLSearchParams();
    if (filters?.classId) params.append('classId', filters.classId);
    if (filters?.teacherId) params.append('teacherId', filters.teacherId);
    return request<any[]>(`/presentations?${params.toString()}`);
  },
  create: async (data: any): Promise<any> => {
    if (MOCK_MODE) {
      await delay();
      return { id: 'p1', ...data };
    }
    return request<any>('/presentations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
