import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-white tracking-tight">404 - Page Not Found</h2>
      <p className="text-sm text-slate-400 max-w-md mt-2">
        The requested transformation module or view does not exist in the platform catalog.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
