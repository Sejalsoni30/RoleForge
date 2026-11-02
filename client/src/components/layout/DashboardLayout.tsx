import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { IntegrationSetupBanner } from '../ui/IntegrationSetupBanner';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { RoleForgeLogo } from '../ui/RoleForgeLogo';
import {
  Layers,
  LayoutDashboard,
  FileText,
  Briefcase,
  GitCompare,
  TrendingUp,
  Sparkles,
  Edit3,
  Mail,
  Mic,
  CalendarCheck,
  Compass,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout, deleteAccount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigationItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Resumes', href: '/resumes', icon: FileText },
    { label: 'Job Descriptions', href: '/jobs', icon: Briefcase },
    { label: 'Match & Evidence', href: '/matching', icon: GitCompare },
    { label: 'Skill Gap & Roadmap', href: '/skill-gaps', icon: TrendingUp },
    { label: 'Optimization Studio', href: '/optimizations', icon: Sparkles },
    { label: 'Resume Builder', href: '/builder', icon: Edit3 },
    { label: 'Cover Letters', href: '/cover-letters', icon: Mail },
    { label: 'Interview Studio', href: '/interviews', icon: Mic },
    { label: 'Application Tracker', href: '/tracker', icon: CalendarCheck },
    { label: 'Career Switch', href: '/career-switch', icon: Compass },
    { label: 'Account Settings', href: '/settings', icon: User },
  ];

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      navigate('/login');
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col font-sans">
      {/* Top Integration Setup Banner */}
      <IntegrationSetupBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/80 bg-white shadow-soft">
          {/* Brand header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <Link to="/dashboard" className="group">
              <RoleForgeLogo size="md" showWordmark={true} />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User profile footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {user?.name.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Header & Drawer */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <RoleForgeLogo size="sm" showWordmark={true} />
          </Link>
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)}>
            <div className="w-64 bg-white h-full p-4 flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <span className="font-bold text-slate-900">Navigation</span>
                  <button onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                          isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-rose-600 font-medium text-xs w-full p-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 mt-14 lg:mt-0">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account & All Data"
        message="This will permanently delete your account, resumes, job descriptions, match results, and notes. This cannot be undone."
        confirmText="Permanently Delete Everything"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

