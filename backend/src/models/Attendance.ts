export type Attendance = {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent';
  createdAt: Date;
};
