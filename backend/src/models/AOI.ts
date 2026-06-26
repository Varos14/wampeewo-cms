export type AOIStatus = 'pending' | 'approved' | 'rejected';
export type AOIType = 'assignment' | 'exam' | 'quiz' | 'scenario';

export type AOI = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  classId: string;
  teacherId: string;
  rubric: any;
  status: AOIStatus;
  type: AOIType;
};
