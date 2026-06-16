export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
};
