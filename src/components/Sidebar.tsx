import React from 'react';
import { toast } from 'react-hot-toast';
import { LayoutDashboard, Ticket as TicketIcon, Users, LogOut, HelpCircle, Headphones } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const comingSoon = (feature: string) =>
  toast(`${feature} — Coming Soon!`, {
    icon: '🚧',
    style: {
      borderRadius: '14px',
      background: '#0f172a',
      color: '#f8fafc',
      fontSize: '13px',
      fontWeight: '700',
      padding: '12px 18px',
      boxShadow: '0 20px 60px -10px rgba(0,0,0,0.35)',
    },
    duration: 2500,
  });

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview',     icon: LayoutDashboard },
    { id: 'tickets',   label: 'Ticket Board', icon: TicketIcon },
    { id: 'customers', label: 'Customers',    icon: Users },
  ];

  return (
    <aside className="w-[240px] h-screen fixed left-0 top-0 border-r border-slate-200 dark:border-[#3c4043] bg-white dark:bg-[#1e1f20] flex flex-col p-3 shadow-sm z-50 transition-colors">
      {/* Brand */}
      <div className="flex items-center gap-3 px-3 py-6 mb-1">
        <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-indigo-500 flex items-center justify-center text-white">
          <Headphones className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-[#e3e3e3] leading-none tracking-tight">Helpdesk</h1>
          <p className="text-slate-500 dark:text-[#9aa0a6] text-xs font-semibold uppercase tracking-wider">Support</p>
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
              activeTab === item.id
                ? 'bg-slate-100 dark:bg-[#2d2e30] text-slate-900 dark:text-[#e3e3e3] shadow-sm'
                : 'text-slate-500 dark:text-[#9aa0a6] hover:text-slate-900 dark:hover:text-[#e3e3e3] hover:bg-slate-50 dark:hover:bg-[#2d2e30]/50'
            )}
          >
            <item.icon className={cn('w-5 h-5 transition-colors', activeTab === item.id ? 'text-slate-900 dark:text-indigo-400' : 'text-slate-400 dark:text-[#9aa0a6]')} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom utility links */}
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-[#3c4043] space-y-1 transition-colors">
        {/* Help Center — Coming Soon */}
        <button
          onClick={() => comingSoon('Help Center')}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-[#9aa0a6] hover:text-slate-900 dark:hover:text-[#e3e3e3] hover:bg-slate-50 dark:hover:bg-[#2d2e30]/50 rounded-lg text-sm font-medium transition-all"
        >
          <HelpCircle className="w-5 h-5 text-slate-400 dark:text-[#9aa0a6]" />
          Help Center
        </button>

        {/* Logout — placeholder, no action yet */}
        <button
          onClick={() => comingSoon('Logout')}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-[#9aa0a6] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-[#2d2e30]/50 rounded-lg text-sm font-medium transition-all"
        >
          <LogOut className="w-5 h-5 text-slate-400 dark:text-[#9aa0a6] group-hover:text-red-500 dark:group-hover:text-red-400" />
          Logout
        </button>
      </div>
    </aside>
  );
};
