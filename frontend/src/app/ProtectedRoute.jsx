import { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { authService } from '../services/authService';

export function ProtectedRoute({ children }) {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#247C78]"></div>
      </div>
    );
  }

  // Not logged in -> redirect to /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
