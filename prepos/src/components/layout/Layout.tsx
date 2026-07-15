// src/components/layout/Layout.tsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Logo from '../common/Logo';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-void flex font-body text-ink">
      <Sidebar />

      {/* Mobile Drawer — only mounted when open, so it can never get stuck */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 md:hidden shadow-2xl animate-fade-in">
            <Sidebar className="!flex w-64 h-full shadow-none" />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-[-44px] w-9 h-9 flex items-center justify-center bg-void-raised border border-edge rounded-lg text-ink-muted"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 min-h-screen">
        {/* Mobile Header */}
        <header className="flex items-center justify-between h-16 px-4 bg-void-raised border-b border-edge md:hidden shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-ink-muted rounded-xl hover:bg-panel transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
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
