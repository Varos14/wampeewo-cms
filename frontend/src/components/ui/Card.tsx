import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'outlined' | 'gradient';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  hoverable = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'rounded-2xl border transition-all duration-300 overflow-hidden';
  
  const variants = {
    default: 'bg-school-surface border-school-border text-slate-100',
    glass: 'glass-panel text-slate-100',
    outlined: 'bg-transparent border-slate-700/50 text-slate-100',
    gradient: 'bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border-blue-900/30 text-slate-100',
  };

  const hoverStyle = hoverable ? 'glass-panel-hover cursor-pointer' : '';

  return (
    <div
      className={`${baseStyle} ${variants[variant]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
