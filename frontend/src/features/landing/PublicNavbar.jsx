import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, LogIn, Menu, X } from 'lucide-react';
import { authService } from '../../services/authService';

export function PublicNavbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const u = await authService.getCurrentUser();
        if (isMounted) setCurrentUser(u);
      } catch {
        if (isMounted) setCurrentUser(null);
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#0F2942]/95 backdrop-blur-md border-b border-[#247C78]/20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#247C78] flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-[#247C78]/30 group-hover:scale-105 transition-transform tracking-wider">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-[#2DD4BF] transition-colors">
                NIRNAY
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#247C78]/25 text-[#2DD4BF] border border-[#247C78]/40">
                Enterprise Cloud
              </span>
            </div>
            <p className="hidden md:block text-[10px] text-slate-300 font-medium tracking-normal -mt-0.5">
              SaaS Transformation & Decision Platform
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#102B46]/60 p-1.5 rounded-xl border border-white/10">
          <Link
            to="/"
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive('/')
                ? 'bg-[#247C78] text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive('/about')
                ? 'bg-[#247C78] text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            About NIRNAY
          </Link>
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-[#247C78] hover:bg-[#1D6864] text-white text-xs font-bold transition-all shadow-md shadow-[#247C78]/30 flex items-center gap-2"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-2 hover:border-[#2DD4BF]/50"
            >
              <LogIn className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-2">
          {currentUser ? (
            <Link
              to="/dashboard"
              className="p-2 rounded-lg bg-[#247C78] text-white text-xs font-bold"
              aria-label="Dashboard"
            >
              <LayoutDashboard className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="p-2 rounded-lg bg-white/10 text-white text-xs font-bold"
              aria-label="Sign in"
            >
              <LogIn className="w-4 h-4" />
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F2942] border-b border-white/10 px-4 py-3 space-y-2 animate-fadeIn">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
              isActive('/') ? 'bg-[#247C78] text-white' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
              isActive('/about') ? 'bg-[#247C78] text-white' : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            About NIRNAY
          </Link>
          <div className="pt-2 border-t border-white/10">
            {currentUser ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#247C78] text-white text-xs font-bold"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold"
              >
                <LogIn className="w-4 h-4 text-[#2DD4BF]" />
                <span>Sign In to Workspace</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
