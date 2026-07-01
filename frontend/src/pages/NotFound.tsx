import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full rounded-2xl p-8 border border-black/5 shadow-2xl text-center">
        <h1 className="text-7xl font-extrabold text-blue-500 tracking-wider">404</h1>
        <h2 className="text-xl font-bold text-slate-800 mt-4">Page Not Found</h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button
          variant="primary"
          className="mt-6 w-full"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};
export default NotFound;

