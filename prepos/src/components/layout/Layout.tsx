// src/components/layout/Layout.tsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Logo from '../common/Logo';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-void flex font-body text-ink">
      <Sidebar />

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:hidden shadow-2xl`}
      >
        <Sidebar className="!flex w-64 h-full shadow-none" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 min-h-screen transition-all duration-300">
        {/* Mobile Header */}
        <header className="flex items-center justify-between h-16 px-4 bg-void-raised border-b border-edge md:hidden shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-ink-muted rounded-xl hover:bg-panel transition-colors"
              aria-label="Open navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Logo size={30} showWordmark={true} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden relative p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
