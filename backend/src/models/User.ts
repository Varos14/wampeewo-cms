export type UserRole = 'admin' | 'teacher' | 'student';

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
};
