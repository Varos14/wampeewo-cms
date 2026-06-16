import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  className = '',
}) => {
  const colors = {
    blue: {
      bg: 'bg-blue-500/10 border-blue-500/20',
      text: 'text-blue-400',
    },
    emerald: {
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      text: 'text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-500/10 border-amber-500/20',
      text: 'text-amber-400',
    },
    rose: {
      bg: 'bg-rose-500/10 border-rose-500/20',
      text: 'text-rose-400',
    },
    indigo: {
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      text: 'text-indigo-400',
    },
    purple: {
      bg: 'bg-purple-500/10 border-purple-500/20',
      text: 'text-purple-400',
    },
  };

  return (
    <Card className={`flex items-center p-6 ${className}`} variant="glass">
      <div className={`p-4 rounded-xl border mr-5 ${colors[color].bg} ${colors[color].text}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-400 truncate">{title}</p>
        <h4 className="text-2xl font-bold text-slate-100 tracking-tight mt-1 truncate">{value}</h4>
        {trend && (
          <div className="flex items-center mt-2 text-xs font-semibold">
            <span
              className={trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            {trend.label && (
              <span className="text-slate-500 ml-1.5 truncate">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
