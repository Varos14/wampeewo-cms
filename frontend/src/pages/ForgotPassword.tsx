import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mock sending link
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4 text-emerald-400">Email Sent!</h2>
        <p className="text-sm text-slate-700 mb-6">
          If an account exists for <strong>{email}</strong>, we have sent instructions to reset your password.
        </p>
        <Button onClick={() => navigate('/login')} className="w-full">
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-2 text-center text-slate-900 tracking-wide">
        Reset your password
      </h2>
      <p className="text-xs text-slate-600 text-center mb-6 leading-relaxed">
        Enter your registered email address below and we will email you a password reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-normal text-slate-700 mb-1.5">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-blue-500/20 bg-slate-950/70 px-3.5 py-2.5 text-sm font-normal text-slate-800 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
            placeholder="mail@example.com"
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
          Send Reset Link
        </Button>

        {/* Back link */}
        <div className="text-center text-xs text-slate-600 mt-4">
          Remember your password?{' '}
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

