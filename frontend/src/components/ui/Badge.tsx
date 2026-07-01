import React from 'react';

export type BadgeColor = 'blue' | 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  variant?: 'solid' | 'subtle' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'blue',
  variant = 'subtle',
  className = '',
}) => {
  const colors = {
    blue: {
      solid: 'bg-blue-600 text-white',
      subtle: 'bg-blue-500/15 text-blue-700 border border-blue-500/20',
      outline: 'bg-transparent text-blue-600 border border-blue-500/30',
    },
    emerald: {
      solid: 'bg-emerald-600 text-white',
      subtle: 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/20',
      outline: 'bg-transparent text-emerald-600 border border-emerald-500/30',
    },
    amber: {
      solid: 'bg-amber-600 text-white',
      subtle: 'bg-amber-500/15 text-amber-700 border border-amber-500/20',
      outline: 'bg-transparent text-amber-600 border border-amber-500/30',
    },
    rose: {
      solid: 'bg-rose-600 text-white',
      subtle: 'bg-rose-500/15 text-rose-700 border border-rose-500/20',
      outline: 'bg-transparent text-rose-600 border border-rose-500/30',
    },
    slate: {
      solid: 'bg-slate-600 text-white',
      subtle: 'bg-slate-500/15 text-slate-700 border border-slate-500/20',
      outline: 'bg-transparent text-slate-600 border border-slate-500/30',
    },
    indigo: {
      solid: 'bg-indigo-600 text-white',
      subtle: 'bg-indigo-500/15 text-indigo-700 border border-indigo-500/20',
      outline: 'bg-transparent text-indigo-600 border border-indigo-500/30',
    },
    purple: {
      solid: 'bg-purple-600 text-white',
      subtle: 'bg-purple-500/15 text-purple-700 border border-purple-500/20',
      outline: 'bg-transparent text-purple-600 border border-purple-500/30',
    },
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${colors[color][variant]} ${className}`}
    >
      {children}
    </span>
  );
};

// Competency grade helper badge
export const RubricBadge: React.FC<{ grade?: 1 | 2 | 3 | number }> = ({ grade }) => {
  if (grade === 3) {
    return <Badge color="emerald">Achieved</Badge>;
  } else if (grade === 2) {
    return <Badge color="amber">Progressing</Badge>;
  } else if (grade === 1) {
    return <Badge color="rose">Not Achieved</Badge>;
  }
  return <Badge color="slate">Not Graded</Badge>;
};

