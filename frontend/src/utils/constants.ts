import { UserRole } from '../types';

export const SCHOOL_NAME = 'Wampeewo Ntake Secondary School';
export const SCHOOL_MOTTO = 'Strive for Excellence';
export const SCHOOL_SHORT_NAME = 'Wampeewo Ntake SS';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
};

export const ROLE_THEMES: Record<UserRole, { primary: string; bg: string; text: string }> = {
  admin: {
    primary: 'indigo-500',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
  },
  teacher: {
    primary: 'emerald-500',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
  },
  student: {
    primary: 'sky-500',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
  },
  parent: {
    primary: 'amber-500',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
  },
};

export const GRADES = {
  D1: { label: 'Distinction 1', points: 1, type: 'distinction' },
  D2: { label: 'Distinction 2', points: 2, type: 'distinction' },
  C3: { label: 'Credit 3', points: 3, type: 'credit' },
  C4: { label: 'Credit 4', points: 4, type: 'credit' },
  C5: { label: 'Credit 5', points: 5, type: 'credit' },
  C6: { label: 'Credit 6', points: 6, type: 'credit' },
  P7: { label: 'Pass 7', points: 7, type: 'pass' },
  P8: { label: 'Pass 8', points: 8, type: 'pass' },
  F9: { label: 'Fail 9', points: 9, type: 'fail' },
};

export const COMPETENCY_GRADES = {
  3: { label: 'Achieved', color: 'emerald', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  2: { label: 'Progressing', color: 'amber', bg: 'bg-amber-500/20', text: 'text-amber-400' },
  1: { label: 'Not Achieved', color: 'rose', bg: 'bg-rose-500/20', text: 'text-rose-400' },
};

export const DAYS_OF_WEEK = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
};
