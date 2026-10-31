import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastProvider } from '../components/Toast';

export function Layout() {
  return (
    <ToastProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6 bg-slate-900/60">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
