import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { authService } from '../services/authService';

export function ProtectedRoute({ requiredRole, children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const current = await authService.getCurrentUser();
      setUser(current);
      setLoading(false);
    }
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'Admin') {
    return (
      <div className="p-8 text-center bg-slate-800/40 border border-slate-700/60 rounded-xl">
        <h3 className="text-lg font-bold text-amber-400">Restricted Access</h3>
        <p className="text-sm text-slate-400 mt-2">
          Your current role ({user?.role}) does not have permissions to access this page. Required role: {requiredRole}.
        </p>
      </div>
    );
  }

  return children ? children : <Outlet />;
}
