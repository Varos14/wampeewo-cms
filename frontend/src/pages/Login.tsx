import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { authService } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user, token } = await authService.login(email, password);
      // Auto-assign role mapping if not selected, or validate
      if (role && user.role !== role) {
        throw new Error(`Account role is ${user.role}, not ${role}`);
      }
      setAuth(user, token);
      navigate(`/${user.role}`);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // const handleQuickLogin = async (roleEmail: string, rolePass: string, selectedRole: string) => {
  //   setLoading(true);
  //   setError('');
  //   setEmail(roleEmail);
  //   setPassword(rolePass);
  //   setRole(selectedRole);
  //   try {
  //     const { user, token } = await authService.login(roleEmail, rolePass);
  //     setAuth(user, token);
  //     navigate(`/${user.role}`);
  //   } catch (err: any) {
  //     setError(err.message || 'Quick login failed');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-6 text-center text-slate-900 tracking-wide">
        Sign In to your account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-normal text-slate-700 mb-1.5">Email Address</label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-blue-500/20 bg-white/50 pl-10 pr-3 py-2.5 text-sm font-normal text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
              placeholder="mail@example.com"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-normal text-slate-700 mb-1.5">Password</label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-blue-500/20 bg-white/50 pl-10 pr-10 py-2.5 text-sm font-normal text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
              placeholder="••••••••••"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Role Field */}
        {/* <div>
          <label className="block text-sm font-normal text-slate-700 mb-1.5">Role</label>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-blue-500/20 bg-white/50 px-3 py-2.5 text-sm font-normal text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-white">Select Role</option>
              <option value="admin" className="bg-white">Admin</option>
              <option value="teacher" className="bg-white">Teacher</option>
              <option value="student" className="bg-white">Student</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-600">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div> */}

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-blue-500/20 bg-white text-blue-600 focus:ring-0 focus:ring-offset-0 mr-2 accent-blue-600 cursor-pointer"
            />
            Remember me
          </label>
          {/* <Link to="/forgot-password" className="text-blue-500 hover:text-blue-400 font-normal transition-colors">
            Forgot Password?
          </Link> */}
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-400">
            {error}
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-md shadow-blue-600/10 mt-4"
          loading={loading}
        >
          Sign In
        </Button>

        {/* Sign up link */}
        {/* <div className="text-center text-xs text-slate-600 mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-500 hover:text-blue-400 transition-colors font-medium">
            Sign Up
          </Link>
        </div> */}
      </form>

      {/* Footer copyright */}
      <div className="mt-8 pt-4 border-t border-black/5 text-center text-[10px] text-slate-500">
        &copy; 2026 Wampeewo. All rights reserved. <span className="hover:underline cursor-pointer">Terms</span> | <span className="hover:underline cursor-pointer">Privacy</span>
      </div>

      {/* Collapsible Quick Access panel for testing/demo */}
      {/* <div className="mt-4 pt-2 border-t border-dashed border-black/5">
        <details className="cursor-pointer group">
          <summary className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center list-none select-none group-open:mb-2 hover:text-slate-600 transition-colors">
            Quick Demo Logins (Click to view)
          </summary>
          <div className="grid grid-cols-3 gap-1.5 mt-2">
            <button
              onClick={() => handleQuickLogin('geraldvaros@gmail.com', '@AmGerald14', 'admin')}
              disabled={loading}
              className="p-1.5 border border-indigo-500/10 hover:border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-lg text-[9px] font-bold text-indigo-400 transition-all text-center focus:outline-none"
            >
              Admin
            </button>
            <button
              onClick={() => handleQuickLogin('mrlochaderrick@wampeewo.com', 'teacher123', 'teacher')}
              disabled={loading}
              className="p-1.5 border border-emerald-500/10 hover:border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-lg text-[9px] font-bold text-emerald-400 transition-all text-center focus:outline-none"
            >
              Teacher
            </button>
            <button
              onClick={() => handleQuickLogin('garethtuwesigye@wampeewo.com', 'student123', 'student')}
              disabled={loading}
              className="p-1.5 border border-sky-500/10 hover:border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10 rounded-lg text-[9px] font-bold text-sky-400 transition-all text-center focus:outline-none"
            >
              Student
            </button>
          </div>
        </details>
      </div> */}
    </div>
  );
}

