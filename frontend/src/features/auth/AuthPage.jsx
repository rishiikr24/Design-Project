import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { Button } from '../../components/Button';
import { authService } from '../../services/authService';
import { companyService } from '../../services/companyService';
import { shouldUseMocks } from '../../lib/supabase';
import { useToast } from '../../components/Toast';

export function AuthPage() {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
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
  }, [isMockMode]);

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F7FA] font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#DCE5EA] overflow-hidden">
        {/* Header */}
        <div className="bg-[#102B46] p-8 text-center text-white">
          <div className="w-12 h-12 rounded-xl bg-[#247C78] flex items-center justify-center text-white font-extrabold text-lg mx-auto mb-3 shadow-lg shadow-[#0B1E32]/40 tracking-wider">
            N
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">NIRNAY</h1>
          <p className="text-xs text-slate-300 mt-1 font-medium">Enterprise Transformation Platform</p>
        </div>

        {/* Tab Switcher */}
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

        {/* Form Body */}
        <div className="p-6 pt-3">
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
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
                  <span className="text-[11px] text-[#247C78] hover:underline cursor-pointer">Forgot password?</span>
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
            </form>
          ) : (
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
            </form>
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
