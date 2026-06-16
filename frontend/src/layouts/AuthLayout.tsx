import { Outlet } from 'react-router-dom';
import { SCHOOL_NAME, SCHOOL_MOTTO } from '../utils/constants';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-radial-auth flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* School Crest Placeholder / Branding */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-blue-600/15 border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/5 mb-3 text-2xl font-black text-blue-400">
            W
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">{SCHOOL_NAME}</h1>
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mt-1">{SCHOOL_MOTTO}</p>
        </div>

        {/* Content Panel */}
        <div className="glass-panel rounded-2xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Subtle decoration gradient */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 font-medium mt-6">
          &copy; {new Date().getFullYear()} {SCHOOL_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
}