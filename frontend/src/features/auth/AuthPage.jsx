import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, UserPlus, LogIn, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
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
  const [regRole, setRegRole] = useState('Viewer');
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
        // Continue with default
      }
    }
    loadCompanies();

    // Default mock inputs if in mock mode
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
      showToast(`Welcome back, ${user.fullName} (${user.role})!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(`Login failed: ${err.message}`, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (userRole) => {
    try {
      const user = await authService.switchRole(userRole);
      showToast(`Signed in as ${user.fullName} [${user.role}]`, 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(`Quick switch failed: ${err.message}`, 'danger');
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
        role: isMockMode ? regRole : 'Viewer', // Remote Supabase defaults to Viewer
        company_ID: regCompany
      });
      showToast(`Account created! Welcome, ${newUser.fullName} [${newUser.role}]`, 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(`Registration failed: ${err.message}`, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <Card className="w-full max-w-lg border-slate-800 shadow-2xl bg-slate-900/90">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant={isMockMode ? 'warning' : 'cyan'}>
              {isMockMode ? 'Mock Mode' : 'Supabase Auth'}
            </Badge>
            <Badge variant="cyan">Module 1</Badge>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl">Authentication & RBAC Gateway</CardTitle>
          <p className="text-xs text-slate-400 mt-1">Enterprise SaaS Transformation Platform (Design Project-I, E1ITA306)</p>

          {/* Tab selector */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-slate-800/80 rounded-lg">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`py-1.5 text-xs font-semibold rounded-md transition flex items-center justify-center gap-1.5 ${
                tab === 'login' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`py-1.5 text-xs font-semibold rounded-md transition flex items-center justify-center gap-1.5 ${
                tab === 'register' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Account</span>
            </button>
          </div>
        </CardHeader>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Quick Persona Logins (Only shown in mock mode) */}
              {isMockMode && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Quick-Sign In with Seed Roles (RBAC Sandbox):</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('Admin')}
                      className="p-2 text-left bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs transition"
                    >
                      <div className="font-semibold text-white flex items-center justify-between">
                        <span>Admin</span>
                        <span className="text-[10px] text-red-400 font-mono">Full</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Rishi Kumar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('Manager')}
                      className="p-2 text-left bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs transition"
                    >
                      <div className="font-semibold text-white flex items-center justify-between">
                        <span>Manager</span>
                        <span className="text-[10px] text-amber-400 font-mono">CRUD</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Aarushi Joshi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('Analyst')}
                      className="p-2 text-left bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs transition"
                    >
                      <div className="font-semibold text-white flex items-center justify-between">
                        <span>Analyst</span>
                        <span className="text-[10px] text-blue-400 font-mono">Sim</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Pradyumn Bisen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('Viewer')}
                      className="p-2 text-left bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs transition"
                    >
                      <div className="font-semibold text-white flex items-center justify-between">
                        <span>Viewer</span>
                        <span className="text-[10px] text-slate-400 font-mono">Read</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Akshayadevi K</span>
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2">
              <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                <span>{isSubmitting ? 'Signing In...' : 'Sign In to Platform'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-3.5 pt-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Corporate Email *</label>
                <input
                  type="email"
                  required
                  placeholder="jane.doe@enterprise.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isMockMode ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Role</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Admin">Admin (Full Control)</option>
                      <option value="Manager">Manager (Assessment CRUD)</option>
                      <option value="Analyst">Analyst (Evaluation & Sim)</option>
                      <option value="Viewer">Viewer (Read-only)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Initial Role</label>
                    <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 text-xs text-slate-400">
                      Viewer (Default on signup)
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Organization *</label>
                  <select
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {companies.length > 0 ? (
                      companies.map(c => (
                        <option key={c.ID || c.id} value={c.ID || c.id}>{c.name}</option>
                      ))
                    ) : (
                      <option value="comp-apex-global">Apex Global Enterprises</option>
                    )}
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button type="submit" variant="success" className="w-full" disabled={isSubmitting}>
                <span>{isSubmitting ? 'Creating Account...' : 'Create Account & Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
