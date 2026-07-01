import React from 'react';
import { Card } from './Card';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <Card className={`p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto ${className}`} variant="glass">
      {icon && (
        <div className="p-4 bg-slate-800/40 rounded-full border border-slate-700/40 text-slate-600 mb-4">
          {icon}
        </div>
      )}
      <h5 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h5>
      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all duration-200"
        >
          {action.label}
        </button>
      )}
    </Card>
  );
};

