import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md',
  fullPage = false,
}) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div
        className={`animate-spin rounded-full border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent border-solid ${sizes[size]} border-slate-700/60 mb-4`}
      />
      {message && <p className="text-sm font-semibold text-slate-400 animate-pulse-subtle">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-school-bg/85 backdrop-blur-md">
        {spinner}
      </div>
    );
  }

  return spinner;
};
