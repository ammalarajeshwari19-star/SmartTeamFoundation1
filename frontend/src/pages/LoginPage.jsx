import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, AlertCircle, LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Backend API not reached (404 Not Found). The frontend cannot communicate with the backend server. Please ensure the backend is deployed (e.g. on Render) and VITE_API_URL is configured in your Vercel project environment variables.');
      } else if (!err.response && err.message?.includes('Network Error')) {
        setError('Network error: Unable to connect to backend server. Please verify backend is running and CORS is enabled.');
      } else {
        setError(err.response?.data?.message || err.message || 'Invalid email or password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass = 'password123') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-navy-900 text-brand-400 flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to SmartTeamFoundation
          </h2>
          <p className="text-xs text-slate-500">
            Access your student projects, teammate recommendations, and applications.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@campus.edu"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Accounts for Testing */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
              Quick Demo Accounts (Password: password123)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoFill('alice@campus.edu')}
                className="p-2 text-left bg-slate-50 hover:bg-brand-50 border border-slate-200/80 hover:border-brand-200 rounded-lg transition-colors"
              >
                <div className="font-semibold text-slate-800">Alice Chen</div>
                <div className="text-[10px] text-slate-500">Full Stack Lead</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('bob@campus.edu')}
                className="p-2 text-left bg-slate-50 hover:bg-brand-50 border border-slate-200/80 hover:border-brand-200 rounded-lg transition-colors"
              >
                <div className="font-semibold text-slate-800">Bob Miller</div>
                <div className="text-[10px] text-slate-500">AI / ML Specialist</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('clara@campus.edu')}
                className="p-2 text-left bg-slate-50 hover:bg-brand-50 border border-slate-200/80 hover:border-brand-200 rounded-lg transition-colors"
              >
                <div className="font-semibold text-slate-800">Clara Patel</div>
                <div className="text-[10px] text-slate-500">UI/UX Designer</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('david@campus.edu')}
                className="p-2 text-left bg-slate-50 hover:bg-brand-50 border border-slate-200/80 hover:border-brand-200 rounded-lg transition-colors"
              >
                <div className="font-semibold text-slate-800">David Kumar</div>
                <div className="text-[10px] text-slate-500">Backend / DB</div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
