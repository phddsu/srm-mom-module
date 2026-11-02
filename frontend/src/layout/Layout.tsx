import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import NotificationBell from '../components/NotificationBell';
import UserMenu from '../components/UserMenu';
import type { Role } from '../types';

const Icons = {
  dashboard: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  mom: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>,
  scholars: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 5-3.5 9-9 9s-9-4-9-9 3.5-9 9-9 9 4 9 9z"/></svg>,
  users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  bell: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
};

interface NavItem { label: string; to: string; roles: Role[]; icon: JSX.Element; }

const NAV: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: Icons.dashboard, roles: ['SUPER_ADMIN','SCHOLAR','SUPERVISOR','INSTITUTIONAL_RESEARCH_COORDINATOR','HEAD_OF_INSTITUTE','DEAN_RESEARCH'] },
  { label: 'User Management', to: '/admin/users', icon: Icons.users, roles: ['SUPER_ADMIN'] },
  { label: 'My MoMs', to: '/scholar', icon: Icons.mom, roles: ['SCHOLAR'] },
  { label: 'Leave', to: '/leave', icon: Icons.calendar, roles: ['SCHOLAR'] },
  { label: 'My Scholars', to: '/supervisor', icon: Icons.scholars, roles: ['SUPERVISOR'] },
  { label: 'Leave Requests', to: '/supervisor/leaves', icon: Icons.calendar, roles: ['SUPERVISOR'] },
  { label: 'Pending MoMs', to: '/coordinator', icon: Icons.clock, roles: ['INSTITUTIONAL_RESEARCH_COORDINATOR'] },
  { label: 'Pending Endorsements', to: '/hoi', icon: Icons.clock, roles: ['HEAD_OF_INSTITUTE'] },
  { label: 'Approvals', to: '/dean', icon: Icons.check, roles: ['DEAN_RESEARCH'] },
  { label: 'Notifications', to: '/notifications', icon: Icons.bell, roles: ['SUPER_ADMIN','SCHOLAR','SUPERVISOR','INSTITUTIONAL_RESEARCH_COORDINATOR','HEAD_OF_INSTITUTE','DEAN_RESEARCH'] },
];

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  SCHOLAR: 'Scholar',
  SUPERVISOR: 'Supervisor',
  INSTITUTIONAL_RESEARCH_COORDINATOR: 'Research Coordinator',
  HEAD_OF_INSTITUTE: 'Head of Institute',
  DEAN_RESEARCH: 'Dean Research',
};

export default function Layout() {
  const { user } = useAuth();
  if (!user) return null;
  const visibleNav = NAV.filter((n) => n.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-srm-bg">
      {/* ---- Sidebar ---- */}
      <aside className="w-60 bg-white border-r border-srm-border flex-shrink-0 flex flex-col">

        {/* Brand header — bigger logo, cleaner spacing */}
        <div className="px-4 py-4 border-b border-srm-border">
          <Link to="/" className="flex flex-col items-center gap-2">
            <img
              src="/srm-logo.jpg"
              alt="SRM"
              className="h-16 w-auto object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="text-center leading-tight">
              <p className="text-[10px] font-bold text-srm-blue uppercase tracking-widest">PhD Progress Review</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {visibleNav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-srm-blueLight text-srm-blue font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-srm-blue rounded-r-full"></span> : null}
                  <span className={isActive ? 'text-srm-blue' : 'text-gray-400 group-hover:text-gray-600'}>{n.icon}</span>
                  <span className="truncate">{n.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-srm-border">
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-srm-blueMid to-srm-blue text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm overflow-hidden border border-srm-border">
              {(user as any).avatarUrl ? (
                <img src={`${(user as any).avatarUrl}?t=${Date.now()}`} alt="" className="w-full h-full object-cover" />
              ) : (
                user.fullName?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 truncate">{user.fullName}</p>
              <p className="text-[10px] text-gray-500 truncate">{ROLE_LABEL[user.role] || user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ---- Main content ---- */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-srm-border px-6 py-2.5 flex justify-between items-center sticky top-0 z-20 shadow-header">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold leading-none mb-0.5">Welcome back</p>
              <p className="font-serif font-bold text-gray-800 text-sm leading-tight">{user.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="h-6 w-px bg-gray-200"></div>
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}