import { format } from 'date-fns';

export function formatDate(dateString: string | Date, pattern = 'PPP'): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, pattern);
  } catch (error) {
    return 'N/A';
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

export function getGradeColor(grade: string): string {
  if (grade.startsWith('D')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (grade.startsWith('C')) return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
  if (grade.startsWith('P')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
}
