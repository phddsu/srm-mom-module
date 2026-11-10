import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await client.post('/api/auth/login', { username, password });
      
      const { token, user } = res.data;
      if (!token) throw new Error("Invalid response from server");

      login(token, user);

      if (user.requiresPasswordChange) navigate('/change-password');
      else if (user.role === 'SUPER_ADMIN') navigate('/admin/users');
      else if (user.role === 'SCHOLAR') navigate('/scholar');
      else if (user.role === 'SUPERVISOR') navigate('/supervisor');
      else if (user.role === 'INSTITUTIONAL_RESEARCH_COORDINATOR') navigate('/coordinator');
      else if (user.role === 'HEAD_OF_INSTITUTE') navigate('/hoi');
      else if (user.role === 'DEAN_RESEARCH') navigate('/dean');
      else navigate('/');
      
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-[#003366] selection:text-white">
      {/* LEFT SIDE - PREMIUM HERO BRANDING */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-[#001a33] to-[#003b73] flex-col justify-between p-16 relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-blue-500 opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-cyan-400 opacity-10 blur-3xl"></div>
        
        <div className="relative z-10">
          <button onClick={() => navigate('/')} className="text-blue-200/80 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Home
          </button>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-1 bg-[#D4AF37] mb-8 rounded-full"></div>
          <h1 className="font-serif text-5xl font-bold text-white leading-[1.15] mb-6">
            PhD Progress Review <br/>
            <span className="text-blue-300">Portal System.</span>
          </h1>
          <p className="text-blue-100/70 text-lg font-light leading-relaxed">
            A centralized platform for Scholars, Supervisors, and Administrators to seamlessly track, manage, and approve academic milestones.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-blue-200/50 text-sm">
          <p>© 2026 SRM Institute of Science and Technology</p>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-[45%] bg-gray-50 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px]">
          
          {/* Official Logo - Placed cleanly above the form */}
          <div className="flex flex-col items-center mb-10">
            <img 
              src="/srm-logo.jpg" 
              alt="SRM Logo" 
              className="h-24 w-auto object-contain mb-6"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <h2 className="font-serif text-2xl font-bold text-gray-900 text-center">
              Portal Account Login
            </h2>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Please enter your credentials to continue.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-8 sm:p-10">
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                  Username / Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-11 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                    placeholder="e.g. scholar1"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Password
                  </label>
                  <a href="#" className="text-xs font-semibold text-[#003366] hover:text-[#D4AF37] transition-colors">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full pl-11 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center pt-1">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#003366] focus:ring-[#003366] border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                  Remember my session
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-[#003366] hover:bg-[#002244] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003366] disabled:opacity-50 transition-colors uppercase tracking-wider mt-2"
              >
                {loading ? 'Authenticating...' : 'Secure Login'}
              </button>
            </form>
          </div>
          
          <p className="text-center text-xs text-gray-400 mt-8">
            Need help? Contact your SRM PhD Coordinator.
          </p>
        </div>
      </div>
    </div>
  );
}