import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, KeyRound, Lock } from 'lucide-react';
import { Button } from '../../components/Button';
import { authService } from '../../services/authService';
import { useToast } from '../../components/Toast';

export function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.updateUserPassword(newPassword);
      showToast('Password updated successfully! Please sign in with your new password.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(`Password update failed: ${err.message}`, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F7FA] font-sans selection:bg-[#247C78]/20">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#DCE5EA] overflow-hidden">
        {/* Header */}
        <div className="bg-[#102B46] p-8 text-center text-white">
          <div className="w-12 h-12 rounded-xl bg-[#247C78] flex items-center justify-center text-white font-extrabold text-lg mx-auto mb-3 shadow-lg shadow-[#0B1E32]/40 tracking-wider">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Set New Password</h1>
          <p className="text-xs text-slate-300 mt-1 font-medium">NIRNAY Account Recovery</p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <p className="text-xs text-slate-600 mb-5 leading-relaxed">
            Please enter your new corporate password below. Passwords must be at least 6 characters.
          </p>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#102B46] mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#247C78]" />
                <span>New Password</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#F4F7FA] border border-[#DCE5EA] rounded-xl px-3.5 py-2.5 text-xs text-[#102B46] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#247C78] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102B46] mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#247C78]" />
                <span>Confirm New Password</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#F4F7FA] border border-[#DCE5EA] rounded-xl px-3.5 py-2.5 text-xs text-[#102B46] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#247C78] focus:bg-white transition"
              />
            </div>

            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#102B46] hover:bg-[#0B1E32] text-white py-3 rounded-xl font-semibold text-xs transition shadow-md shadow-[#102B46]/20 flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Updating Password...' : 'Save New Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#247C78] hover:text-[#1D6864] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          </form>

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
