import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import NotificationBell from '../components/NotificationBell';
import UserMenu from '../components/UserMenu';
import type { Role } from '../types';

interface NavItem { label: string; to: string; roles: Role[]; }

const NAV: NavItem[] = [
  { label: 'Dashboard', to: '/', roles: ['SUPER_ADMIN','SCHOLAR','SUPERVISOR','INSTITUTIONAL_RESEARCH_COORDINATOR','HEAD_OF_INSTITUTE','DEAN_RESEARCH'] },
  { label: 'My MoMs', to: '/scholar', roles: ['SCHOLAR'] },
  { label: 'My Scholars', to: '/supervisor', roles: ['SUPERVISOR'] },
  { label: 'Pending MoMs', to: '/coordinator', roles: ['INSTITUTIONAL_RESEARCH_COORDINATOR'] },
  { label: 'Pending Endorsements', to: '/hoi', roles: ['HEAD_OF_INSTITUTE'] },
  { label: 'Approvals', to: '/dean', roles: ['DEAN_RESEARCH'] },
  { label: 'Notifications', to: '/notifications', roles: ['SUPER_ADMIN','SCHOLAR','SUPERVISOR','INSTITUTIONAL_RESEARCH_COORDINATOR','HEAD_OF_INSTITUTE','DEAN_RESEARCH'] },
];

export default function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const visibleNav = NAV.filter((n) => n.roles.includes(user.role));

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-white border-r border-srm-border flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-srm-border">
          <Link to="/" className="block">
            <img src="/srm-logo.jpg" alt="SRM" className="h-14 w-auto object-contain mx-auto"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2 text-center font-semibold">PhD Progress Review</p>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {visibleNav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}
              className={({ isActive }) =>
                `block px-3.5 py-2.5 rounded-md text-[13px] font-medium transition ${
                  isActive ? 'bg-srm-blueLight text-srm-blue font-semibold border-l-[3px] border-srm-blue' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-srm-border text-xs">
          <p className="font-semibold text-gray-800 truncate">{user.fullName}</p>
          <p className="text-gray-400 truncate text-[10px] uppercase tracking-wider mt-0.5">{user.role.replace(/_/g, ' ')}</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-srm-border px-6 py-3 flex justify-between items-center">
          <div>
            <h2 className="text-[11px] text-gray-400 uppercase tracking-wider">Welcome back</h2>
            <p className="font-semibold text-gray-800 text-sm">{user.fullName}</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="h-8 w-px bg-gray-200"></div>
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-srm-bg"><Outlet /></main>
      </div>
    </div>
  );
}