// src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import CloudSyncControls from './CloudSyncControls';
import Logo from '../common/Logo';

interface SidebarProps {
  className?: string;
}

const navItems = [
  {
    name: 'Dashboard',
    path: '/',
    exact: true,
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
  },
  {
    name: 'Analytics',
    path: '/analytics',
    exact: false,
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    name: 'Mistake Vault',
    path: '/mistakes',
    exact: false,
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function Sidebar({ className = '' }: SidebarProps) {
  return (
    <aside
      className={`hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-void-raised border-r border-edge z-40 ${className}`}
    >
      {/* Header / Logo */}
      <div className="flex items-center h-16 px-5 border-b border-edge shrink-0">
        <Logo size={34} caption="GATE 2027" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-6 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold text-ink-faint uppercase tracking-widest">
          Core
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 border-l-2 ${
                isActive
                  ? 'bg-panel text-ink border-signal'
                  : 'text-ink-muted hover:bg-panel hover:text-ink border-transparent'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-edge pt-3 pb-3">
        <CloudSyncControls />
      </div>
    </aside>
  );
}
