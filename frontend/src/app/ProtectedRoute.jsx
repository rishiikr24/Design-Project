import { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { authService } from '../services/authService';
import { ShieldAlert } from 'lucide-react';

const ROLE_HIERARCHY = {
  Admin: 4,
  Manager: 3,
  Analyst: 2,
  Viewer: 1
};

export function ProtectedRoute({ requiredRole, children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let unsubscribe;

    async function checkAuth() {
      const current = await authService.getCurrentUser();
      setUser(current);
      setLoading(false);
    }

    checkAuth();

    unsubscribe = authService.onAuthStateChange((_event, updatedUser) => {
      setUser(updatedUser);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Not logged in -> redirect to /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role hierarchy check
  if (requiredRole) {
    const userLevel = ROLE_HIERARCHY[user.role] || 1;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 1;

    if (userLevel < requiredLevel) {
      return (
        <div className="max-w-xl mx-auto my-12 p-8 text-center bg-slate-900 border border-amber-500/30 rounded-2xl shadow-xl">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Restricted Access</h3>
          <p className="text-sm text-slate-400 mb-6">
            Your current role <span className="text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">{user.role}</span> does not have sufficient permissions to access this page. This resource requires <span className="text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">{requiredRole}</span> or higher.
          </p>
          <div className="flex justify-center gap-3">
            <a
              href="/dashboard"
              className="px-4 py-2 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      );
    }
  }

  return children ? children : <Outlet />;
}
