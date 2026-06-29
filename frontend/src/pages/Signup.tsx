import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Mock registration success
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4 text-emerald-400">Account Created!</h2>
        <p className="text-sm text-slate-300 mb-6">
          Your registration request has been submitted successfully. Please proceed to login.
        </p>
        <Button onClick={() => navigate('/login')} className="w-full">
          Go to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-6 text-center text-slate-100 tracking-wide">
        Create your account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-normal text-slate-300 mb-1.5">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-blue-500/20 bg-slate-950/70 px-3.5 py-2.5 text-sm font-normal text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
            placeholder="e.g. John Doe"
            required
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-normal text-slate-300 mb-1.5">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-blue-500/20 bg-slate-950/70 px-3.5 py-2.5 text-sm font-normal text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
            placeholder="mail@example.com"
            required
            disabled={loading}
          />
        </div>

        {/* Role Selector */}
        <div>
          <label className="block text-sm font-normal text-slate-300 mb-1.5">Register As</label>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-blue-500/20 bg-slate-950/70 px-3 py-2.5 text-sm font-normal text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer"
            >
              <option value="student" className="bg-slate-950">Student</option>
              <option value="teacher" className="bg-slate-950">Teacher</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-normal text-slate-300 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-blue-500/20 bg-slate-950/70 px-3.5 py-2.5 text-sm font-normal text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
            placeholder="••••••••"
            required
            disabled={loading}
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-normal text-slate-300 mb-1.5">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-blue-500/20 bg-slate-950/70 px-3.5 py-2.5 text-sm font-normal text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
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

        {/* Submit */}
        <Button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all mt-4"
          loading={loading}
        >
          Register
        </Button>

        {/* Back link */}
        <div className="text-center text-xs text-slate-400 mt-4">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-blue-500 hover:text-blue-400 transition-colors font-medium focus:outline-none"
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
}
