import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, KeyRound, LogIn, UserPlus } from 'lucide-react';
import { Button } from '../../components/Button';
import { authService } from '../../services/authService';
import { companyService } from '../../services/companyService';
import { shouldUseMocks } from '../../lib/supabase';
import { useToast } from '../../components/Toast';

export function AuthPage() {
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'forgot_password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot password form state
  const [resetEmail, setResetEmail] = useState('');

  // Registration form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCompany, setRegCompany] = useState('comp-apex-global');
  const [companies, setCompanies] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMockMode = shouldUseMocks();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    async function checkExistingAuth() {
      const current = await authService.getCurrentUser();
      if (current && (!isMockMode || localStorage.getItem('saas_auth_logged_out') !== 'true')) {
        navigate('/dashboard', { replace: true });
      }
    }
    checkExistingAuth();

    async function loadCompanies() {
      try {
        const data = await companyService.getCompanies();
        if (data?.companies && data.companies.length > 0) {
          setCompanies(data.companies);
          setRegCompany(data.companies[0].ID || data.companies[0].id);
        }
      } catch {
        // Fallback
      }
    }
    loadCompanies();

    if (isMockMode) {
      setEmail('rishi.kumar@apexglobal.com');
      setPassword('Password123!');
    }
  }, [isMockMode, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await authService.login(email, password);
      showToast(`Welcome back, ${user.fullName || user.email}!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(`Login failed: ${err.message}`, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim() || !regPassword.trim()) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      const newUser = await authService.register({
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
        company_ID: regCompany
      });
      showToast(`Account created! Welcome, ${newUser.fullName || newUser.email}`, 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(`Registration failed: ${err.message}`, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      showToast('Please enter your email address', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.resetPassword(resetEmail);
      showToast('Password reset link sent! Check your email inbox.', 'success');
      setTab('login');
      setEmail(resetEmail);
    } catch (err) {
      showToast(`Reset failed: ${err.message}`, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const res = await authService.signInWithGoogle();
      if (res) {
        showToast('Signed in with Google!', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      showToast(`Google Sign In: ${err.message}`, 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F7FA] font-sans selection:bg-[#247C78]/20">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#DCE5EA] overflow-hidden">
        {/* Header */}
        <div className="bg-[#102B46] p-8 text-center text-white relative">
          <Link
            to="/"
            className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold flex items-center gap-1"
            title="Return to Public Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <div className="w-12 h-12 rounded-xl bg-[#247C78] flex items-center justify-center text-white font-extrabold text-lg mx-auto mb-3 shadow-lg shadow-[#0B1E32]/40 tracking-wider">
            N
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">NIRNAY</h1>
          <p className="text-xs text-slate-300 mt-1 font-medium">Enterprise Transformation Platform</p>
        </div>

        {/* Tab Switcher (Only visible when not in forgot_password mode) */}
        {tab !== 'forgot_password' && (
          <div className="p-6 pb-2">
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F4F7FA] rounded-xl border border-[#DCE5EA]">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'login'
                    ? 'bg-white text-[#102B46] shadow-sm font-bold border border-[#DCE5EA]'
                    : 'text-slate-500 hover:text-[#102B46]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'register'
                    ? 'bg-white text-[#102B46] shadow-sm font-bold border border-[#DCE5EA]'
                    : 'text-slate-500 hover:text-[#102B46]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className={`p-6 ${tab !== 'forgot_password' ? 'pt-3' : 'pt-6'}`}>
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {isMockMode && (
                <div className="p-3 bg-[#F4F7FA] border border-[#DCE5EA] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#102B46] uppercase tracking-wider">Demo Quick Personas</span>
                    <span className="text-[10px] bg-[#247C78]/10 text-[#247C78] px-1.5 py-0.5 rounded font-medium border border-[#247C78]/20">Mock Mode</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setEmail('rishi.kumar@apexglobal.com'); setPassword('Password123!'); }}
                      className="text-left p-2 rounded-lg bg-white border border-[#DCE5EA] hover:border-[#247C78] text-[11px] transition text-[#102B46] shadow-sm"
                    >
                      <span className="font-semibold block truncate">Rishi Kumar</span>
                      <span className="text-[10px] text-slate-500">Admin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEmail('aarushi.joshi@apexglobal.com'); setPassword('Password123!'); }}
                      className="text-left p-2 rounded-lg bg-white border border-[#DCE5EA] hover:border-[#247C78] text-[11px] transition text-[#102B46] shadow-sm"
                    >
                      <span className="font-semibold block truncate">Aarushi Joshi</span>
                      <span className="text-[10px] text-slate-500">Manager</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEmail('pradyumn.bisen@apexglobal.com'); setPassword('Password123!'); }}
                      className="text-left p-2 rounded-lg bg-white border border-[#DCE5EA] hover:border-[#247C78] text-[11px] transition text-[#102B46] shadow-sm"
                    >
                      <span className="font-semibold block truncate">Pradyumn Bisen</span>
                      <span className="text-[10px] text-slate-500">Analyst</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEmail('akshayadevi.k@apexglobal.com'); setPassword('Password123!'); }}
                      className="text-left p-2 rounded-lg bg-white border border-[#DCE5EA] hover:border-[#247C78] text-[11px] transition text-[#102B46] shadow-sm"
                    >
                      <span className="font-semibold block truncate">Akshayadevi K</span>
                      <span className="text-[10px] text-slate-500">Viewer</span>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#102B46] mb-1.5">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F4F7FA] border border-[#DCE5EA] rounded-xl px-3.5 py-2.5 text-xs text-[#102B46] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#247C78] focus:bg-white transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#102B46]">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setTab('forgot_password');
                    }}
                    className="text-[11px] font-medium text-[#247C78] hover:text-[#1D6864] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F4F7FA] border border-[#DCE5EA] rounded-xl px-3.5 py-2.5 text-xs text-[#102B46] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#247C78] focus:bg-white transition"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#102B46] hover:bg-[#0B1E32] text-white py-3 rounded-xl font-semibold text-xs transition shadow-md shadow-[#102B46]/20 flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* OR Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#DCE5EA]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                  <span className="bg-white px-2">Or continue with</span>
                </div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-[#102B46] border border-[#DCE5EA] hover:border-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2.5 shadow-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#102B46] mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full bg-[#F4F7FA] border border-[#DCE5EA] rounded-xl px-3.5 py-2 text-xs text-[#102B46] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#247C78] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102B46] mb-1.5">Corporate Email *</label>
                <input
                  type="email"
                  required
                  placeholder="jane.doe@enterprise.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-[#F4F7FA] border border-[#DCE5EA] rounded-xl px-3.5 py-2 text-xs text-[#102B46] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#247C78] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102B46] mb-1.5">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-[#F4F7FA] border border-[#DCE5EA] rounded-xl px-3.5 py-2 text-xs text-[#102B46] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#247C78] focus:bg-white transition"
                />
              </div>

              {companies.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-[#102B46] mb-1.5">Organization</label>
                  <select
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    className="w-full bg-[#F4F7FA] border border-[#DCE5EA] rounded-xl px-3.5 py-2 text-xs text-[#102B46] focus:outline-none focus:ring-2 focus:ring-[#247C78] focus:bg-white transition"
                  >
                    {companies.map((c) => (
                      <option key={c.ID || c.id} value={c.ID || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#247C78] hover:bg-[#1D6864] text-white py-3 rounded-xl font-semibold text-xs transition shadow-md shadow-[#247C78]/20 flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* OR Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#DCE5EA]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                  <span className="bg-white px-2">Or continue with</span>
                </div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-[#102B46] border border-[#DCE5EA] hover:border-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2.5 shadow-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          )}

          {tab === 'forgot_password' && (
            <div className="space-y-4">
              <div className="text-center pb-2">
                <div className="w-10 h-10 rounded-full bg-[#247C78]/10 text-[#247C78] flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#102B46]">Reset Your Password</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your registered email and we will send you an account recovery link.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#102B46] mb-1.5">Corporate Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-[#F4F7FA] border border-[#DCE5EA] rounded-xl px-3.5 py-2.5 text-xs text-[#102B46] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#247C78] focus:bg-white transition"
                  />
                </div>

                <div className="pt-2 space-y-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#247C78] hover:bg-[#1D6864] text-white py-3 rounded-xl font-semibold text-xs transition shadow-md shadow-[#247C78]/20 flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? 'Sending Link...' : 'Send Reset Link'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setTab('login')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#247C78] hover:text-[#1D6864] hover:underline"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-[#DCE5EA] text-center">
            <p className="text-[11px] text-slate-400">
              Enterprise security protected by SSL/TLS encryption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
