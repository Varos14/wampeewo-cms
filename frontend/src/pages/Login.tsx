import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { authService } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setAuth(user, token);
      navigate(`/${user.role}`);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleEmail: string, rolePass: string) => {
    setLoading(true);
    setError('');
    setEmail(roleEmail);
    setPassword(rolePass);
    try {
      const { user, token } = await authService.login(roleEmail, rolePass);
      setAuth(user, token);
      navigate(`/${user.role}`);
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-1 text-center text-slate-100 tracking-tight">
        Portal Sign In
      </h2>
      <p className="text-2xs text-slate-500 text-center uppercase tracking-widest font-semibold mb-6">
        Access your portal account
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/5 bg-slate-950/45 px-3 py-2.5 text-sm font-semibold text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            placeholder="e.g. user@wampeewo.com"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/5 bg-slate-950/45 px-3 py-2.5 text-sm font-semibold text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            placeholder="••••••••"
            required
            disabled={loading}
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-400">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full mt-2"
          loading={loading}
        >
          Sign In
        </Button>
      </form>

      {/* Quick Access Grid */}
      <div className="mt-8 border-t border-white/5 pt-6">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mb-3">
          Quick Demo Accounts (Click to login)
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleQuickLogin('admin@wampeewo.com', 'admin123')}
            disabled={loading}
            className="p-2 border border-indigo-500/10 hover:border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-xl text-[10px] font-bold text-indigo-400 transition-all text-center focus:outline-none"
          >
            Administrator
          </button>
          <button
            onClick={() => handleQuickLogin('mrlochaderrick@wampeewo.com', 'teacher123')}
            disabled={loading}
            className="p-2 border border-emerald-500/10 hover:border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-xl text-[10px] font-bold text-emerald-400 transition-all text-center focus:outline-none"
          >
            Teacher Portal
          </button>
          <button
            onClick={() => handleQuickLogin('garethtuwesigye@wampeewo.com', 'student123')}
            disabled={loading}
            className="p-2 border border-sky-500/10 hover:border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10 rounded-xl text-[10px] font-bold text-sky-400 transition-all text-center focus:outline-none"
          >
            Student Portal
          </button>
        </div>
      </div>
    </div>
  );
}