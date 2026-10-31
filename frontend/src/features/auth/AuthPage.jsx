import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/Card';
import { Button } from '../../components/Button';
import { authService } from '../../services/authService';
import { useToast } from '../../components/Toast';

export function AuthPage() {
  const [email, setEmail] = useState('rishi.kumar@apexglobal.com');
  const [password, setPassword] = useState('••••••••');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await authService.login(email);
      showToast(`Welcome back, ${user.fullName}!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(`Login failed: ${err.message}`, 'danger');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <Card className="w-full max-w-md border-slate-800 shadow-2xl bg-slate-900/90">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl">Platform Sign In</CardTitle>
          <p className="text-xs text-slate-400 mt-1">Enterprise SaaS Transformation Platform (Design Project-I)</p>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Corporate Email</label>
              <input
                type="email"
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button type="submit" variant="primary" className="w-full">
              <span>Sign In to Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
