import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastProvider } from '../components/Toast';

export function Layout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-[#F4F7FA] text-[#102B46] font-sans antialiased">
        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-[#102B46]/60 backdrop-blur-xs lg:hidden transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar (Desktop persistent, Mobile drawer) */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar onClose={() => setMobileSidebarOpen(false)} />
        </div>

        {/* Content Pane */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F4F7FA] min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
