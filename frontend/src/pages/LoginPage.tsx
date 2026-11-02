import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // CAPTCHA State
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Step 1: Check credentials and show CAPTCHA
    if (!showCaptcha) {
      if (!username.trim() || !password.trim()) {
        setError('Please enter your username and password.');
        return;
      }
      setShowCaptcha(true);
      generateCaptcha();
      return;
    }

    // Step 2: Verify CAPTCHA
    if (captchaInput.toUpperCase() !== captchaCode) {
      setError('Invalid CAPTCHA. Please try again.');
      generateCaptcha();
      return;
    }

    // Step 3: Login
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed. Please check credentials.');
      setShowCaptcha(false); // Hide captcha if login fails so they can fix credentials
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-srm-blue p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <circle cx="0" cy="0" r="50" fill="white" />
            <circle cx="100" cy="100" r="40" fill="white" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <a href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition text-sm font-medium">
            ← Home
          </a>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="bg-white p-4 rounded-2xl shadow-xl mb-8">
            <img src="/srm-logo.jpg" alt="SRM" className="h-20 w-auto object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <h1 className="font-serif text-4xl font-bold text-white leading-tight mb-2">
            SRM Institute of Science<br />and Technology
          </h1>
          <div className="w-16 h-0.5 bg-srm-gold my-5"></div>
          <p className="text-white/80 uppercase tracking-[0.3em] text-sm font-semibold mt-2">
            PhD Research Portal
          </p>
        </div>

        <div className="relative z-10 text-center text-white/50 text-xs">
          © 2026 SRM Institute of Science and Technology
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-srm-bg">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-srm-border">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl font-bold text-srm-blue">Portal Account Login</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your credentials to continue</p>
          </div>

          {error ? (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!showCaptcha ? (
              // STEP 1: Credentials Only
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Username / Email</label>
                  <input 
                    type="text" 
                    className="srm-input" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                    placeholder="e.g. scholar1"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</label>
                    <a href="#" className="text-xs text-srm-blue hover:underline">Forgot Password?</a>
                  </div>
                  <input 
                    type="password" 
                    className="srm-input" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 pb-2">
                  <input type="checkbox" id="remember" className="rounded border-gray-300 text-srm-blue focus:ring-srm-blue" />
                  <label htmlFor="remember" className="text-sm text-gray-600">Remember my session</label>
                </div>

                <button type="submit" className="srm-btn srm-btn-primary w-full justify-center py-3 text-sm shadow-md">
                  Continue
                </button>
              </>
            ) : (
              // STEP 2: CAPTCHA Only
              <>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 flex justify-between items-center">
                  <span>Logging in as <strong className="text-srm-blue">{username}</strong></span>
                  <button type="button" onClick={() => setShowCaptcha(false)} className="text-srm-blue hover:underline text-xs font-semibold">
                    Edit
                  </button>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Security Check</label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2.5 flex-1 flex items-center justify-center font-mono text-xl font-bold text-gray-800 tracking-widest select-none"
                      style={{ textDecoration: 'line-through', textDecorationColor: 'rgba(0,0,0,0.3)' }}
                    >
                      {captchaCode}
                    </div>
                    <button 
                      type="button" 
                      onClick={generateCaptcha}
                      className="p-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600"
                      title="Refresh CAPTCHA"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                    </button>
                  </div>
                  <input 
                    type="text" 
                    className="srm-input mt-2" 
                    value={captchaInput} 
                    onChange={(e) => setCaptchaInput(e.target.value)} 
                    required 
                    placeholder="Enter the code above"
                    autoFocus
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="srm-btn srm-btn-primary w-full justify-center py-3 text-sm shadow-md mt-4"
                >
                  {loading ? 'VERIFYING...' : 'VERIFY & LOGIN'}
                </button>
              </>
            )}
          </form>
          
          <p className="text-center text-xs text-gray-500 mt-6">
            Need help? Contact your SRM PhD Coordinator.
          </p>
        </div>
      </div>
    </div>
  );
}