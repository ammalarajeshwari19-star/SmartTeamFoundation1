import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  FolderPlus,
  Layers,
  Users,
  UserCheck,
  Bell,
  Settings,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Explore Projects', to: '/projects', icon: FolderGit2 },
    { label: 'My Projects', to: '/my-projects', icon: Layers },
    { label: 'Create Project', to: '/projects/create', icon: FolderPlus },
    { label: 'Discover Teammates', to: '/teammates', icon: Users },
    { label: 'My Profile', to: '/profile', icon: UserCheck },
    { label: 'Notifications', to: '/notifications', icon: Bell },
    { label: 'Settings', to: '/settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full py-4 px-3">
          <div className="px-3 mb-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation
            </p>
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Engine Banner */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs mt-auto">
            <div className="flex items-center gap-2 mb-1.5 text-navy-900 font-semibold">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Skill Match Engine</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Algorithmic team formation active. 6 weighted parameters calculating synergy.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
