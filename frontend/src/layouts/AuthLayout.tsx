import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-radial-auth">
      <div className="w-full max-w-[420px] animate-slide-up flex flex-col items-center z-10">
        
        {/* Shield Logo & Branding */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="flex items-center gap-3">
            {/* Actual school logo image */}
            <img src="/logo.png" alt="Wampeewo School Logo" className="w-14 h-14 object-contain" />
            <div className="text-left">
              <h1 className="text-3xl font-bold text-slate-900 tracking-wide leading-tight">Wampeewo</h1>
              <p className="text-md font-normal text-slate-600 tracking-wider">Competency CMS</p>
            </div>
          </div>
          <p className="text-lg text-slate-700 mt-4 font-normal">Welcome Back!</p>
        </div>

        {/* Content Panel (Login Card) */}
        <div className="w-full bg-white/70 rounded-[24px] p-8 border border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-md relative overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}