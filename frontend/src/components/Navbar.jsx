import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  Users,
  FolderGit2,
  Sparkles,
  LogOut,
  User,
  Settings,
  Menu,
  X,
  PlusCircle
} from 'lucide-react';
import api from '../api/client';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications')
        .then(res => {
          if (res.data.success) {
            setUnreadCount(res.data.unreadCount || 0);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center text-white shadow-sm ring-1 ring-white/10">
                <Sparkles className="w-5 h-5 text-brand-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg leading-none">
                  SmartTeam<span className="text-brand-600 font-black">Foundation</span>
                </span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                  AI Team Formation & Skill Match
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation Links (when not logged in) */}
          {!isAuthenticated ? (
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/#features" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                Features
              </Link>
              <Link to="/#algorithm" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                Matching Algorithm
              </Link>
              <Link to="/projects" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                Explore Projects
              </Link>
            </nav>
          ) : null}

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/projects/create"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  New Project
                </Link>

                {/* Notifications Bell */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-rose-600 rounded-full flex items-center justify-center ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 hidden md:inline">
                      {user?.name}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-40 text-xs font-medium text-slate-700">
                        <div className="px-3.5 py-2 border-b border-slate-100">
                          <p className="font-semibold text-slate-900 truncate">{user?.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          View My Profile
                        </Link>
                        <Link
                          to="/profile/edit"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          Edit Profile & Skills
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          Application Settings
                        </Link>

                        <div className="border-t border-slate-100 my-1" />

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
