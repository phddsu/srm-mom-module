import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getMyMoms } from '../api/mom';
import type { MinutesOfMeeting } from '../types/mom';

export default function DashboardPage() {
  const { user } = useAuth();
  const [myMom, setMyMom] = useState<MinutesOfMeeting | null>(null);

  useEffect(() => {
    if (user?.role === 'SCHOLAR') {
      getMyMoms().then((r) => {
        const latest = r.data.find((m) => m.sectionAScholarName) || r.data[0];
        if (latest) setMyMom(latest);
      }).catch(() => {});
    }
  }, [user]);

  if (!user) return null;

  const profileName = (myMom && myMom.sectionAScholarName) || user.fullName || '—';
  const profileDept = (myMom && myMom.sectionADepartment) || user.department || '—';
  const profileSupervisor = (myMom && myMom.sectionASupervisorName) || '—';
  const profileTitle = (myMom && myMom.sectionAPhdTitle) || '—';
  const profileScopus = (myMom && myMom.sectionAScopusId) || '—';
  const profileOrcid = (myMom && myMom.sectionAOrcidId) || '—';
  const profileRegDate = (myMom && myMom.sectionARegistrationDate) || '—';
  const profileSession = (myMom && myMom.sectionASessionYear) || '—';

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-srm-blue">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome to your SRM PhD Progress Portal</p>
      </div>

      {/* Scholar Profile Card */}
      <div className="bg-white rounded-lg border border-srm-border overflow-hidden shadow-sm mb-6">
        <div className="bg-srm-blue px-6 py-3">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Scholar Information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-8">
          <div><p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Scholar Name</p><p className="text-sm font-semibold text-gray-800">{profileName}</p></div>
          <div><p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Department</p><p className="text-sm font-medium text-gray-800">{profileDept}</p></div>
          <div><p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Supervisor</p><p className="text-sm font-medium text-gray-800">{profileSupervisor}</p></div>
          <div className="lg:col-span-2"><p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">PhD Work Title</p><p className="text-sm font-medium text-gray-800">{profileTitle}</p></div>
          <div><p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Session</p><p className="text-sm font-medium text-gray-800">{profileSession}</p></div>
          <div><p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Registration Date</p><p className="text-sm font-medium text-gray-800">{profileRegDate}</p></div>
          <div><p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Scopus ID</p><p className="text-sm font-mono text-gray-700">{profileScopus}</p></div>
          <div><p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">ORCID ID</p><p className="text-sm font-mono text-gray-700">{profileOrcid}</p></div>
          <div><p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Role</p><p className="text-sm font-medium text-gray-800">{user.role.replace(/_/g, ' ')}</p></div>
          <div><p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Email</p><p className="text-sm font-medium text-gray-800">{user.email || '—'}</p></div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {user.role === 'SCHOLAR' ? (
          <a href="/scholar" className="srm-card p-5 hover:border-srm-blue transition cursor-pointer">
            <p className="font-semibold text-gray-800 mb-1">My MoMs</p>
            <p className="text-xs text-gray-500">Create and submit your monthly progress reports</p>
          </a>
        ) : null}
        <a href="/notifications" className="srm-card p-5 hover:border-srm-blue transition cursor-pointer">
          <p className="font-semibold text-gray-800 mb-1">Notifications</p>
          <p className="text-xs text-gray-500">View all your alerts and updates</p>
        </a>
      </div>
    </div>
  );
}