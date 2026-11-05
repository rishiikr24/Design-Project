import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastProvider } from '../components/Toast';

export function Layout() {
  return (
    <ToastProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-[#F4F7FA] text-[#102B46] font-sans">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6 bg-[#F4F7FA]">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
