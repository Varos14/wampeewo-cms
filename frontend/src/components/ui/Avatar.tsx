import React, { useState } from 'react';
import { getInitials } from '../../utils/helpers';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const [error, setError] = useState(false);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const hasImage = src && !error;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-slate-800 border border-slate-700/60 overflow-hidden shrink-0 select-none ${sizes[size]} ${className}`}
    >
      {hasImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-bold text-slate-300 tracking-wider">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};
