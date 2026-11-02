import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  getMyProfile, getMyUserProfile, updateMyUserProfile,
  getGuidePendingProfiles, approveScholarProfile, rejectScholarProfile,
} from '../api/mom';

const ROLE_LABELS: Record<string, string> = {
  SCHOLAR: 'Scholar Information',
  SUPERVISOR: 'Supervisor Information',
  COORDINATOR: 'Coordinator Information',
  INSTITUTIONAL_RESEARCH_COORDINATOR: 'Coordinator Information',
  HOI: 'Head of Institute Information',
  HEAD_OF_INSTITUTE: 'Head of Institute Information',
  DEAN_RESEARCH: 'Dean Research Information',
  ADMIN: 'Admin Information',
  SUPER_ADMIN: 'Admin Information',
};


const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="py-3">
    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-800 break-words">{value}</p>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [scholarProfile, setScholarProfile] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    email: '', department: '', designation: '', phone: '', officeLocation: '',
  });

  const [pending, setPending] = useState<any[]>([]);
  const [rejecting, setRejecting] = useState<any | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const isScholar = user?.role === 'SCHOLAR';
  const isGuide = user?.role === 'SUPERVISOR';

  const loadPending = async () => {
    if (!isGuide) return;
    try { const r = await getGuidePendingProfiles(); setPending(r.data); } catch {}
  };

  useEffect(() => {
    if (!user) return;
    if (isScholar) {
      getMyProfile().then((r) => setScholarProfile(r.data)).catch(() => {});
    } else {
      getMyUserProfile().then((r) => {
        setUserProfile(r.data);
        setForm({
          email: r.data.email || '',
          department: r.data.department || '',
          designation: r.data.designation || '',
          phone: r.data.phone || '',
          officeLocation: r.data.officeLocation || '',
        });
      }).catch(() => {});
    }
    if (isGuide) loadPending();
  }, [user, isScholar, isGuide]);

  const startEdit = () => {
    setError(''); setSuccess('');
    if (userProfile) {
      setForm({
        email: userProfile.email || '',
        department: userProfile.department || '',
        designation: userProfile.designation || '',
        phone: userProfile.phone || '',
        officeLocation: userProfile.officeLocation || '',
      });
    }
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setError(''); };

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const r = await updateMyUserProfile(form);
      setUserProfile(r.data);
      setEditing(false);
      setSuccess('Profile updated successfully.');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleApprove = async (profileId: number) => {
    if (!confirm('Approve this scholar profile?\n\nOnce approved, the scholar will not be able to edit it.')) return;
    setError(''); setSuccess(''); setBusyId(profileId);
    try {
      await approveScholarProfile(profileId);
      setSuccess('Profile approved.');
      await loadPending();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Approve failed');
    } finally { setBusyId(null); }
  };

  const openReject = (profile: any) => { setRejecting(profile); setRejectRemarks(''); };

  const handleReject = async () => {
    if (!rejecting) return;
    setError(''); setSuccess(''); setBusyId(rejecting.id);
    try {
      await rejectScholarProfile(rejecting.id, rejectRemarks);
      setSuccess('Profile returned for correction.');
      setRejecting(null);
      await loadPending();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Reject failed');
    } finally { setBusyId(null); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      await updateMyUserProfile({ ...userProfile, avatarFile: file }); // Fallback
      
      const formData = new FormData();
      formData.append('file', file);
      await client.post('/api/user/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      setSuccess('Profile picture updated!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };
  if (!user) return null;

  const dash = '—';
  const cardTitle = ROLE_LABELS[user.role] || 'User Information';
  const profileIncomplete = isScholar && (!scholarProfile?.universityRegId || !scholarProfile?.batch || !scholarProfile?.mode || !scholarProfile?.supervisorId);
  const profileStatus = scholarProfile?.status || 'DRAFT';

  const statusStyle = (s: string) => {
    if (s === 'APPROVED') return 'srm-badge-completed';
    if (s === 'PENDING_APPROVAL') return 'srm-badge-active';
    if (s === 'REJECTED') return 'srm-badge-danger';
    return 'srm-badge-draft';
  };


  return (
    <div className="p-8 max-w-[1280px] mx-auto">


      {/* ---- Banners ---- */}
      {profileIncomplete ? (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-amber-200 text-amber-900 text-sm rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-amber-600"><path d="M12 9v4"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <div>
              <p className="font-semibold">Complete your profile</p>
              <p className="text-xs mt-0.5 text-amber-800">Fill in your University Registration ID, batch, mode, and supervisor to proceed.</p>
            </div>
          </div>
          <Link to="/profile" className="srm-btn srm-btn-primary ml-4 whitespace-nowrap">
            Complete Profile
          </Link>
        </div>
      ) : null}

      {isScholar && profileStatus === 'PENDING_APPROVAL' ? (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-xl flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>Your profile is awaiting approval from your supervisor.</span>
        </div>
      ) : null}

      {isScholar && profileStatus === 'APPROVED' ? (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-green-600"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Your profile is approved and locked.</span>
        </div>
      ) : null}

      {error ? <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div> : null}
      {success ? <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{success}</div> : null}


      {/* ---- Guide: Pending profile approvals ---- */}
      

      {/* ---- Information card ---- */}
      <div className="srm-card mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-srm-border bg-gradient-to-r from-srm-blue to-srm-blueMid flex items-center justify-between">
          <h2 className="text-white font-semibold text-xs uppercase tracking-widest">{cardTitle}</h2>
          <div className="flex items-center gap-3">
            {isScholar && scholarProfile ? (
              <span className={`srm-badge bg-white/95 !border-transparent ${statusStyle(profileStatus)}`}>
                {profileStatus.replace(/_/g, ' ')}
              </span>
            ) : null}
            {!isScholar && !editing && userProfile ? (
              <button onClick={startEdit}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/95 text-srm-blue hover:bg-white shadow-sm">
                Edit Profile
              </button>
            ) : null}
          </div>
        </div>

        {isScholar ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-x-8">
            <InfoRow label="Scholar Name" value={scholarProfile?.scholarFullName || user.fullName || dash} />
            <InfoRow label="University Registration ID" value={scholarProfile?.universityRegId || dash} />
            <InfoRow label="Batch" value={scholarProfile?.batch || dash} />
            <InfoRow label="Mode" value={scholarProfile?.mode || dash} />
            <InfoRow label="Department" value={user.department || dash} />
            <InfoRow label="Supervisor" value={scholarProfile?.supervisorName || dash} />
            <div className="md:col-span-2">
              <InfoRow label="Tentative Topic" value={scholarProfile?.tentativeTopic || dash} />
            </div>
            <InfoRow label="University Email" value={scholarProfile?.universityEmail || user.email || dash} />
          </div>
        ) : (
          <div className="p-6">
            {editing ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                    <input className="srm-input bg-gray-50" value={userProfile?.fullName || ''} disabled />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Username</label>
                    <input className="srm-input bg-gray-50" value={userProfile?.username || ''} disabled />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                    <input type="email" className="srm-input" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                    <input className="srm-input" value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Designation</label>
                    <select className="srm-input" value={form.designation}
                      onChange={(e) => setForm({ ...form, designation: e.target.value })}>
                      <option value="">-- Select --</option>
                      <option>Professor</option>
                      <option>Associate Professor</option>
                      <option>Assistant Professor</option>
                      <option>Professor & Head</option>
                      <option>Dean</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                    <input className="srm-input" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Office Location</label>
                  <input className="srm-input" value={form.officeLocation}
                    onChange={(e) => setForm({ ...form, officeLocation: e.target.value })}
                    placeholder="e.g. Block C, Room 302" />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-srm-border">
                  <button onClick={cancelEdit} disabled={saving} className="srm-btn srm-btn-secondary">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="srm-btn srm-btn-primary">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
                <InfoRow label="Full Name" value={userProfile?.fullName || user.fullName || dash} />
                <InfoRow label="Username" value={userProfile?.username || dash} />
                <InfoRow label="Role" value={(user.role || '').replace(/_/g, ' ')} />
                <InfoRow label="Email" value={userProfile?.email || user.email || dash} />
                <InfoRow label="Department" value={userProfile?.department || user.department || dash} />
                <InfoRow label="Designation" value={userProfile?.designation || dash} />
                <InfoRow label="Phone" value={userProfile?.phone || dash} />
                <div className="md:col-span-2">
                  <InfoRow label="Office Location" value={userProfile?.officeLocation || dash} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
        {isGuide ? (
        <div className="bg-white rounded-xl border border-srm-border overflow-hidden shadow-card mb-6">
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-srm-border bg-gradient-to-r from-amber-50 to-yellow-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600"><path d="M12 9v4"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>
              </div>
              <div>
                <h2 className="font-serif text-base font-bold text-gray-800">Pending Scholar Profiles</h2>
                <p className="text-[11px] text-gray-500">Scholars awaiting your approval to proceed</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-white text-amber-800 px-3 py-1 rounded-full border border-amber-200">
              {pending.length} pending
            </span>
          </div>
          {pending.length === 0 ? (
            <div className="p-10 text-sm text-gray-500 text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 mx-auto flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              No profiles pending your approval.
            </div>
          ) : (
            <table className="srm-table">
              <thead>
                <tr>
                  <th>Scholar</th>
                  <th>Reg ID</th>
                  <th>Batch</th>
                  <th>Mode</th>
                  <th>Tentative Topic</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-srm-blueMid to-srm-blue text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {(p.scholarFullName || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{p.scholarFullName}</p>
                          <p className="text-[11px] text-gray-500 font-mono">{p.scholarUsername} · {p.scholarEmail || dash}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-gray-700">{p.universityRegId || dash}</td>
                    <td className="text-xs text-gray-700">{p.batch || dash}</td>
                    <td className="text-xs text-gray-700">{p.mode || dash}</td>
                    <td className="text-xs text-gray-700 max-w-[280px] truncate" title={p.tentativeTopic || ''}>{p.tentativeTopic || dash}</td>
                    <td className="text-right whitespace-nowrap">
                      <button onClick={() => handleApprove(p.id)} disabled={busyId === p.id}
                        className="srm-btn srm-btn-primary !py-1.5 !px-3 !text-xs mr-2 disabled:opacity-40">
                        Approve
                      </button>
                      <button onClick={() => openReject(p)} disabled={busyId === p.id}
                        className="srm-btn srm-btn-secondary !py-1.5 !px-3 !text-xs !text-red-700 !border-red-200 hover:!bg-red-50 disabled:opacity-40">
                        Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}

      {/* ---- Quick links ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isScholar ? (
          <>
            <Link to="/profile" className="srm-card p-5 cursor-pointer group block">
              <div className="w-10 h-10 rounded-lg bg-srm-blueLight flex items-center justify-center mb-3 group-hover:bg-srm-blue group-hover:text-white transition">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-srm-blue group-hover:text-white transition"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <p className="font-semibold text-gray-800 mb-1">My Profile</p>
              <p className="text-xs text-gray-500">Update your registration details and supervisor</p>
            </Link>
            <Link to="/scholar" className="srm-card p-5 cursor-pointer group block">
              <div className="w-10 h-10 rounded-lg bg-srm-blueLight flex items-center justify-center mb-3 group-hover:bg-srm-blue transition">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-srm-blue group-hover:text-white transition"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <p className="font-semibold text-gray-800 mb-1">My MoMs</p>
              <p className="text-xs text-gray-500">Create and submit your monthly progress reports</p>
            </Link>
          </>
        ) : null}
        {isGuide ? (
          <Link to="/supervisor" className="srm-card p-5 cursor-pointer group block">
            <div className="w-10 h-10 rounded-lg bg-srm-blueLight flex items-center justify-center mb-3 group-hover:bg-srm-blue transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-srm-blue group-hover:text-white transition"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <p className="font-semibold text-gray-800 mb-1">My Scholars</p>
            <p className="text-xs text-gray-500">Review MoMs submitted by your scholars</p>
          </Link>
        ) : null}
        <Link to="/notifications" className="srm-card p-5 cursor-pointer group block">
          <div className="w-10 h-10 rounded-lg bg-srm-blueLight flex items-center justify-center mb-3 group-hover:bg-srm-blue transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-srm-blue group-hover:text-white transition"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
          <p className="font-semibold text-gray-800 mb-1">Notifications</p>
          <p className="text-xs text-gray-500">View all your alerts and updates</p>
        </Link>
      </div>

      {/* ---- Reject dialog ---- */}
      {rejecting ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-serif text-lg font-bold text-gray-800 mb-1">Return Profile for Correction</h3>
            <p className="text-xs text-gray-500 mb-4">
              Returning profile of <strong>{rejecting.scholarFullName}</strong>. Provide a reason.
            </p>
            <textarea className="srm-input" rows={4} value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              placeholder="Reason for returning (visible to scholar)" />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setRejecting(null)} className="srm-btn srm-btn-secondary">Cancel</button>
              <button onClick={handleReject} disabled={busyId === rejecting.id}
                className="srm-btn srm-btn-primary !bg-red-600 hover:!bg-red-700">
                {busyId === rejecting.id ? 'Returning…' : 'Return to Scholar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}