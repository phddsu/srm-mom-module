import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { User } from '../types';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem('srm_remember_username') || '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(!!localStorage.getItem('srm_remember_username'));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user: User = await login(username, password);
      if (remember) {
        localStorage.setItem('srm_remember_username', username);
      } else {
        localStorage.removeItem('srm_remember_username');
      }
      navigate(getHomeRoute(user.role));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-srm-blue text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/5"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5"></div>
        <div className="absolute top-1/2 right-8 w-32 h-32 rounded-full bg-white/5"></div>

        <div className="relative z-10">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition">
            <span className="text-lg leading-none">&larr;</span>
            <span>Home</span>
          </a>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-2xl">
            <img
              src="/srm-logo.jpg"
              alt="SRM"
              className="w-48 h-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).outerHTML = '<div class="text-4xl font-bold text-srm-blue font-serif px-8 py-4">SRM</div>';
              }}
            />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-wide mb-3 leading-tight">
            SRM Institute of Science<br />and Technology
          </h1>
          <div className="w-16 h-0.5 bg-white/40 my-4"></div>
          <p className="text-sm tracking-[0.35em] text-white/80 font-medium">
            PHD RESEARCH PORTAL
          </p>
        </div>

        <div className="relative z-10 text-center text-xs text-white/50">
          &copy; 2026 SRM Institute of Science and Technology
        </div>
      </div>

      {/* RIGHT PANEL - Login */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo (only shows on small screens) */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <img src="/srm-logo.jpg" alt="SRM" className="h-16 w-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
            <h2 className="font-serif text-2xl font-bold text-center text-srm-blue tracking-wide mb-2">
              Portal Account Login
            </h2>
            <p className="text-center text-sm text-gray-500 mb-8">
              Enter your credentials to continue
            </p>

            {error ? (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Username / Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-srm-blue focus:ring-2 focus:ring-srm-blue/20"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Please contact your administrator to reset your password.')}
                    className="text-xs text-srm-blue hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-srm-blue focus:ring-2 focus:ring-srm-blue/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Remember my session
              </label>

              <button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full bg-srm-blue text-white py-3 rounded-md font-bold tracking-wider text-sm uppercase transition hover:bg-srm-maroonDark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Login to Dashboard'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Need help? Contact your SRM PhD Coordinator.
          </p>
        </div>
      </div>
    </div>
  );
}

export function getHomeRoute(role: string): string {
  switch (role) {
    case 'SUPERVISOR': return '/supervisor';
    case 'INSTITUTIONAL_RESEARCH_COORDINATOR': return '/coordinator';
    case 'HEAD_OF_INSTITUTE': return '/hoi';
    case 'DEAN_RESEARCH': return '/dean';
    case 'SCHOLAR': return '/scholar';
    default: return '/';
  }
}