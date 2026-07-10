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

export let BYPASS_OFFLINE = false;
export const setBypassOffline = (val: boolean) => {
  BYPASS_OFFLINE = val;
};

const isOnline = () => {
  if (typeof window !== 'undefined' && (window as any).__isOnline) {
    return (window as any).__isOnline();
  }
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

const addToSyncQueue = (item: any) => {
  if (typeof window !== 'undefined' && (window as any).__addToSyncQueue) {
    (window as any).__addToSyncQueue(item);
  }
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  const cacheKey = `wampeewo_cache_${path.replace(/[^a-zA-Z0-9]/g, '_')}`;

  if (isGet && !isOnline() && !BYPASS_OFFLINE) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      console.log(`[Offline Cache] Serving GET ${path}`);
      return JSON.parse(cached) as T;
    }
    throw new Error('Connection lost. This data is not available offline.');
  }

  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 && !path.includes('/auth/login')) {
        useAuthStore.getState().logout();
        throw new Error('Session expired. Please log in again.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    if (isGet) {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    }
    return data as T;
  } catch (err) {
    if (isGet && (err instanceof TypeError || !isOnline()) && !BYPASS_OFFLINE) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        console.warn(`[Network Fail] Serving cached GET ${path}`, err);
        return JSON.parse(cached) as T;
      }
    }
    throw err;
  }
}

async function handleMutation<T>(
  serviceName: string,
  methodName: string,
  args: any[],
  description: string,
  tempIdPrefix: string | null,
  offlineMockBuilder: (tempId: string | null) => T,
  onlineCall: () => Promise<T>
): Promise<T> {
  if (!isOnline() && !BYPASS_OFFLINE) {
    const tempId = tempIdPrefix 
      ? `${tempIdPrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` 
      : null;
    const mockRes = offlineMockBuilder(tempId);
    
    addToSyncQueue({
      serviceName,
      methodName,
      args,
      tempId,
      description,
    });

    console.log(`[Offline Queue] Queued mutation: ${description} (temp ID: ${tempId})`);
    return mockRes;
  }
  return onlineCall();
}

export const authService = {
  login: async (email: string, password: string) => {
    if (MOCK_MODE) {
      await delay(600);
      const user = mock.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
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
    return handleMutation<any>(
      'studentService',
      'create',
      [data],
      `Create Student: ${data.name || 'New Student'}`,
      'temp_stu',
      (tempId) => ({ ...data, id: tempId }),
      async () => {
        if (MOCK_MODE) {
          await delay();
          const newStudent = { ...data, id: `student_${Date.now()}` };
          mock.mockStudents.push(newStudent);
          return newStudent;
        }
        return request<any>('/admin/students', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
    );
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
    return handleMutation<any>(
      'teacherService',
      'create',
      [data],
      `Create Teacher: ${data.name || 'New Teacher'}`,
      'temp_tch',
      (tempId) => ({ ...data, id: tempId }),
      async () => {
        if (MOCK_MODE) {
          await delay();
          const newTeacher = { ...data, id: `teacher_${Date.now()}` };
          mock.mockTeachers.push(newTeacher);
          return newTeacher;
        }
        return request<any>('/admin/teachers', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
    );
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
    return handleMutation<Class>(
      'classService',
      'create',
      [data],
      `Create Class: ${data.name || 'New Class'}`,
      'temp_cls',
      (tempId) => ({ id: tempId!, studentCount: 0, ...data }),
      async () => {
        if (MOCK_MODE) {
          await delay();
          return { id: 'c' + Date.now(), studentCount: 0, ...data };
        }
        return request<Class>('/classes', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
    );
  },
  delete: async (id: string): Promise<void> => {
    return handleMutation<void>(
      'classService',
      'delete',
      [id],
      `Delete Class: ${id}`,
      null,
      () => {},
      async () => {
        if (MOCK_MODE) {
          await delay();
          return;
        }
        await request<void>(`/classes/${id}`, { method: 'DELETE' });
      }
    );
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
    return handleMutation<Subject>(
      'subjectService',
      'create',
      [data],
      `Create Subject: ${data.name || 'New Subject'}`,
      'temp_sbj',
      (tempId) => ({ id: tempId!, ...data }),
      async () => {
        if (MOCK_MODE) {
          await delay();
          return { id: 's' + Date.now(), ...data };
        }
        return request<Subject>('/admin/subjects', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
    );
  },
  delete: async (id: string): Promise<void> => {
    return handleMutation<void>(
      'subjectService',
      'delete',
      [id],
      `Delete Subject: ${id}`,
      null,
      () => {},
      async () => {
        if (MOCK_MODE) {
          await delay();
          return;
        }
        await request<void>(`/subjects/${id}`, { method: 'DELETE' });
      }
    );
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
    return handleMutation<AOI>(
      'aoiService',
      'create',
      [data],
      `Create AOI: ${data.title || 'New AOI'}`,
      'temp_aoi',
      (tempId) => ({ ...data, id: tempId! }),
      async () => {
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
      }
    );
  },
  listSubmissions: async (aoiId: string): Promise<Submission[]> => {
    if (MOCK_MODE) {
      await delay();
      return mock.mockSubmissions.filter(s => s.aoiId === aoiId);
    }
    return request<Submission[]>(`/submissions?aoiId=${aoiId}`);
  },
  submitAssignment: async (aoiId: string, studentId: string, content: string): Promise<Submission> => {
    return handleMutation<Submission>(
      'aoiService',
      'submitAssignment',
      [aoiId, studentId, content],
      `Submit Assignment for AOI: ${aoiId}`,
      'temp_sub',
      (tempId) => ({
        id: tempId!,
        aoiId,
        studentId,
        content,
        submittedAt: new Date().toISOString()
      }),
      async () => {
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
      }
    );
  },
  gradeSubmission: async (id: string, grade: 1 | 2 | 3, feedback: string): Promise<Submission> => {
    return handleMutation<Submission>(
      'aoiService',
      'gradeSubmission',
      [id, grade, feedback],
      `Grade Submission ${id}: Grade ${grade}`,
      null,
      () => ({
        id,
        grade,
        feedback,
        aoiId: '',
        studentId: '',
        content: '',
        submittedAt: new Date().toISOString()
      }),
      async () => {
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
      }
    );
  },
  gradeDirect: async (studentId: string, aoiId: string, grade: number, feedback?: string): Promise<any> => {
    return handleMutation<any>(
      'aoiService',
      'gradeDirect',
      [studentId, aoiId, grade, feedback],
      `Direct Grade for Student ${studentId} on AOI ${aoiId}`,
      null,
      () => {
        const existing = mock.mockSubmissions.find(s => s.studentId === studentId && s.aoiId === aoiId);
        if (existing) {
          existing.grade = grade as any;
          if (feedback !== undefined) existing.feedback = feedback;
          return existing;
        } else {
          const newSub = {
            id: `sub_${Date.now()}`,
            studentId,
            aoiId,
            grade: grade as any,
            feedback: feedback || '',
            content: 'Direct evaluation',
            submittedAt: new Date().toISOString()
          };
          mock.mockSubmissions.push(newSub);
          return newSub;
        }
      },
      async () => {
        if (MOCK_MODE) {
          await delay();
          const existing = mock.mockSubmissions.find(s => s.studentId === studentId && s.aoiId === aoiId);
          if (existing) {
            existing.grade = grade as any;
            if (feedback !== undefined) existing.feedback = feedback;
            return existing;
          } else {
            const newSub = {
              id: `sub_${Date.now()}`,
              studentId,
              aoiId,
              grade: grade as any,
              feedback: feedback || '',
              content: 'Direct evaluation',
              submittedAt: new Date().toISOString()
            };
            mock.mockSubmissions.push(newSub);
            return newSub;
          }
        }
        return request<any>('/submissions/grade-direct', {
          method: 'POST',
          body: JSON.stringify({ studentId, aoiId, grade, feedback })
        });
      }
    );
  },
  approve: async (id: string, status: string = 'approved', feedback?: string): Promise<AOI> => {
    return handleMutation<AOI>(
      'aoiService',
      'approve',
      [id, status, feedback],
      `Approve AOI ${id} as ${status}`,
      null,
      () => ({
        id,
        status: status as any,
        feedback,
        title: '',
        description: '',
        classId: '',
        subjectId: '',
        teacherId: '',
        dueDate: '',
        deadline: '',
        rubric: []
      }),
      async () => {
        if (MOCK_MODE) {
          await delay();
          const aoi = mock.mockAOIs.find(a => a.id === id);
          if (aoi) {
            aoi.status = status as any;
            (aoi as any).feedback = feedback;
          }
          return aoi as any;
        }
        return request<AOI>(`/admin/assignments/${id}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status, feedback })
        });
      }
    );
  }
};

export const adminService = {
  deleteUser: async (userId: string): Promise<void> => {
    return handleMutation<void>(
      'adminService',
      'deleteUser',
      [userId],
      `Delete user: ${userId}`,
      null,
      () => {},
      async () => {
        if (MOCK_MODE) {
          await delay();
          return;
        }
        await request<void>(`/admin/users/${userId}`, { method: 'DELETE' });
      }
    );
  }
};

export const attendanceService = {
  getStats: async (): Promise<{ attendancePercentage: number; attendanceTrends: { date: string; value: number }[] }> => {
    if (MOCK_MODE) {
      await delay();
      return {
        attendancePercentage: mock.getAdminStats().attendancePercentage,
        attendanceTrends: mock.getAdminStats().attendanceTrends
      };
    }
    return request<{ attendancePercentage: number; attendanceTrends: { date: string; value: number }[] }>('/attendance/stats');
  },
  list: async (classId: string, date: string): Promise<Attendance[]> => {
    if (MOCK_MODE) {
      await delay();
      return mock.mockAttendance.filter(a => a.classId === classId && a.date === date);
    }
    return request<Attendance[]>(`/attendance?classId=${classId}&date=${date}`);
  },
  mark: async (records: Omit<Attendance, 'id'>[]): Promise<Attendance[]> => {
    const dateStr = records[0]?.date || new Date().toISOString().split('T')[0];
    return handleMutation<Attendance[]>(
      'attendanceService',
      'mark',
      [records],
      `Mark Attendance for ${records.length} students on ${dateStr}`,
      null,
      () => records.map((r, i) => ({ ...r, id: `temp_att_${Date.now()}_${i}` })),
      async () => {
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
      }
    );
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
  },
  listScheduled: async (): Promise<any[]> => {
    if (MOCK_MODE) {
      await delay();
      return mock.mockExams;
    }
    return request<any[]>('/results/schedule');
  },
  schedule: async (data: any): Promise<any> => {
    return handleMutation<any>(
      'examService',
      'schedule',
      [data],
      `Schedule Exam: ${data.name} - ${data.subjectName}`,
      'temp_ex',
      (tempId) => ({ ...data, id: tempId }),
      async () => {
        if (MOCK_MODE) {
          await delay();
          const newExam = { ...data, id: `exam_${Date.now()}` };
          mock.mockExams.push(newExam);
          return newExam;
        }
        return request<any>('/results/schedule', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
    );
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
    return handleMutation<Note>(
      'noteService',
      'create',
      [data],
      `Create Note for Student`,
      'temp_note',
      (tempId) => ({
        ...data,
        id: tempId!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      async () => {
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
      }
    );
  },
  update: async (id: string, content: string): Promise<Note> => {
    return handleMutation<Note>(
      'noteService',
      'update',
      [id, content],
      `Update Note: ${id}`,
      null,
      () => ({
        id,
        content,
        title: '',
        tags: [],
        studentId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      async () => {
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
      }
    );
  },
  delete: async (id: string): Promise<void> => {
    return handleMutation<void>(
      'noteService',
      'delete',
      [id],
      `Delete Note: ${id}`,
      null,
      () => {},
      async () => {
        if (MOCK_MODE) {
          await delay();
          const index = mock.mockNotes.findIndex(n => n.id === id);
          if (index !== -1) mock.mockNotes.splice(index, 1);
          return;
        }
        return request<void>(`/notes/${id}`, { method: 'DELETE' });
      }
    );
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
    return handleMutation<TimetableEntry>(
      'timetableService',
      'create',
      [data],
      `Create Timetable Entry`,
      'temp_tt',
      (tempId) => ({ ...data, id: tempId! }),
      async () => {
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
    );
  }
};

export const gradeService = {
  saveQuickGrade: async (studentId: string, subject: string, grade: string): Promise<{ message: string }> => {
    return handleMutation<{ message: string }>(
      'gradeService',
      'saveQuickGrade',
      [studentId, subject, grade],
      `Save Quick Grade ${grade} for Subject ${subject}`,
      null,
      () => ({ message: 'Mock grade saved successfully' }),
      async () => {
        if (MOCK_MODE) {
          await delay();
          return { message: 'Mock grade saved successfully' };
        }
        return request<{ message: string }>('/grades/quick', {
          method: 'POST',
          body: JSON.stringify({ studentId, subject, grade })
        });
      }
    );
  },
  getQuickGrade: async (studentId: string): Promise<{ grades: { subject: string, grade: string }[] }> => {
    if (MOCK_MODE) {
      await delay();
      return { grades: [] };
    }
    return request<{ grades: { subject: string, grade: string }[] }>(`/grades/quick?studentId=${studentId}`);
  }
};

export const skillService = {
  list: async (studentId: string): Promise<any[]> => {
    if (MOCK_MODE) {
      await delay();
      return [];
    }
    return request<any>(`/skills?studentId=${studentId}`).then(res => res.items || []);
  },
  create: async (data: { studentId: string, name: string, value: number }): Promise<any> => {
    return handleMutation<any>(
      'skillService',
      'create',
      [data],
      `Update Skill: ${data.name} to ${data.value} for student ${data.studentId}`,
      null,
      () => data,
      async () => {
        if (MOCK_MODE) {
          await delay();
          return data;
        }
        return request<any>('/skills', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
    );
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
    return handleMutation<any>(
      'materialService',
      'create',
      [data],
      `Upload Material: ${data.title || 'New Material'}`,
      'temp_mat',
      (tempId) => ({ id: tempId!, ...data, uploadedAt: new Date().toISOString() }),
      async () => {
        if (MOCK_MODE) {
          await delay();
          return { id: 'm1', ...data, uploadedAt: new Date().toISOString() };
        }
        return request<any>('/materials', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
    );
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
    return handleMutation<any>(
      'presentationService',
      'create',
      [data],
      `Create Presentation: ${data.topic || 'New Presentation'}`,
      'temp_pres',
      (tempId) => ({ id: tempId!, ...data }),
      async () => {
        if (MOCK_MODE) {
          await delay();
          return { id: 'p1', ...data };
        }
        return request<any>('/presentations', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
    );
  }
};

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string;
  lastMessage: Message;
}

export const messageService = {
  sendMessage: async (receiverId: string, content: string): Promise<Message> => {
    return handleMutation<Message>(
      'messageService',
      'sendMessage',
      [receiverId, content],
      `Send message to ${receiverId}`,
      null,
      () => ({
        id: 'msg_' + Date.now(),
        senderId: 'mock_sender',
        receiverId,
        content,
        isRead: false,
        createdAt: new Date().toISOString()
      }),
      async () => {
        if (MOCK_MODE) {
          await delay();
          return {
            id: 'msg_' + Date.now(),
            senderId: 'mock_sender',
            receiverId,
            content,
            isRead: false,
            createdAt: new Date().toISOString()
          };
        }
        return request<Message>('/messages', {
          method: 'POST',
          body: JSON.stringify({ receiverId, content })
        });
      }
    );
  },
  getConversations: async (): Promise<Conversation[]> => {
    if (MOCK_MODE) {
      await delay();
      return [];
    }
    return request<Conversation[]>('/messages/conversations');
  },
  getMessages: async (userId: string): Promise<Message[]> => {
    if (MOCK_MODE) {
      await delay();
      return [];
    }
    return request<Message[]>(`/messages/${userId}`);
  }
};
