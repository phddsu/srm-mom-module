import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import {
  getMyProfile, updateMyProfile, submitMyProfile, listSupervisors,
} from '../../api/mom';

const BATCHES = [
  'January 2023', 'July 2023',
  'January 2024', 'July 2024',
  'January 2025', 'July 2025',
  'January 2026', 'July 2026',
];

const statusStyle = (s: string) => {
  if (s === 'APPROVED') return 'text-green-700 bg-green-50 border-green-200';
  if (s === 'PENDING_APPROVAL') return 'text-blue-700 bg-blue-50 border-blue-200';
  if (s === 'REJECTED') return 'text-red-700 bg-red-50 border-red-200';
  return 'text-gray-600 bg-gray-50 border-gray-200';
};

const statusLabel = (s: string) => String(s || '').replace(/_/g, ' ');

export default function Profile() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [form, setForm] = useState({
    universityRegId: '',
    batch: '',
    mode: '',
    tentativeTopic: '',
    universityEmail: '',
    supervisorId: '',
  });
  const [error, setError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [p, s] = await Promise.all([getMyProfile(), listSupervisors()]);
      setProfile(p.data);
      setSupervisors(s.data);
      setForm({
        universityRegId: p.data.universityRegId || '',
        batch: p.data.batch || '',
        mode: p.data.mode || '',
        tentativeTopic: p.data.tentativeTopic || '',
        universityEmail: p.data.universityEmail || '',
        supervisorId: p.data.supervisorId ? String(p.data.supervisorId) : '',
      });
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const isLocked = profile && (profile.status === 'APPROVED' || profile.status === 'PENDING_APPROVAL');

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const payload = {
        ...form,
        supervisorId: form.supervisorId ? Number(form.supervisorId) : null,
      };
      const r = await updateMyProfile(payload);
      setProfile(r.data);
      setSuccess('Profile saved.');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirm('Submit your profile to your supervisor for approval?\n\nOnce approved, you will not be able to edit it.')) return;
    setError(''); setSuccess('');
    try {
      await updateMyProfile({
        ...form,
        supervisorId: form.supervisorId ? Number(form.supervisorId) : null,
      });
      const r = await submitMyProfile();
      setProfile(r.data);
      setSuccess('Profile submitted to your supervisor for approval.');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Submit failed');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingAvatar(true);
    setError('');
    setSuccess('');
    
    const fd = new FormData();
    fd.append('file', file);
    
    try {
      const r = await client.post('/api/user/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      setProfile((prev: any) => ({ ...prev, avatarUrl: r.data.avatarUrl }));
      
      if (refreshUser) await refreshUser(); 
      
      setSuccess('Profile picture updated!');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Upload failed: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Loading profile...</div>;
  }

  const getAvatarUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('localhost:8081')) {
      return url.replace('localhost:8081', 'localhost:8081');
    }
    if (url.startsWith('http')) return url;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${import.meta.env.VITE_API_BASE || 'import.meta.env.VITE_API_BASE_URL'}${path}`;
  };

  return (
    <div className="p-8 w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-srm-blueLight border-4 border-white ring-2 ring-srm-blue shadow-lg flex items-center justify-center overflow-hidden">
              {profile?.avatarUrl ? (
                <img 
                  src={getAvatarUrl(profile.avatarUrl)} 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-full" 
                />
              ) : (
                <span className="text-4xl font-bold text-srm-blue">
                  {(profile?.scholarFullName || 'S').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <label className="absolute bottom-1 right-1 bg-srm-blue text-white border-2 border-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer shadow-md hover:bg-srm-blueMid transition">
              {uploadingAvatar ? '...' : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>}
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
            </label>
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-800">My Profile</h1>
            <p className="text-sm text-gray-500 mt-1">
              Fill in your details and submit to your supervisor for approval.
            </p>
          </div>
        </div>
        {profile ? (
          <span className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full border ${statusStyle(profile.status)}`}>
            {statusLabel(profile.status)}
          </span>
        ) : null}
      </div>

      {profile?.status === 'APPROVED' ? (
        <div className="mb-5 p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg">
          Your profile has been approved and is now locked. Contact your supervisor if a change is required.
        </div>
      ) : null}

      {profile?.status === 'PENDING_APPROVAL' ? (
        <div className="mb-5 p-4 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg">
          Your profile is awaiting approval from your supervisor. You cannot edit it now.
        </div>
      ) : null}

      {profile?.status === 'REJECTED' && profile?.rejectionRemarks ? (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg">
          <p className="font-semibold mb-1">Returned for correction:</p>
          <p>{profile.rejectionRemarks}</p>
        </div>
      ) : null}

      {error ? <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div> : null}
      {success ? <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{success}</div> : null}

      <div className="bg-white rounded-xl border border-srm-border shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
            <input className="srm-input bg-gray-50" value={profile?.scholarFullName || ''} disabled />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Username</label>
            <input className="srm-input bg-gray-50" value={profile?.scholarUsername || ''} disabled />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">University Registration ID</label>
            <input className="srm-input" value={form.universityRegId} disabled={!!isLocked}
              onChange={(e) => setForm({ ...form, universityRegId: e.target.value })}
              placeholder="e.g. 1234567890" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Batch</label>
            <select className="srm-input" value={form.batch} disabled={!!isLocked}
              onChange={(e) => setForm({ ...form, batch: e.target.value })}>
              <option value="">-- Select --</option>
              {BATCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mode</label>
            <select className="srm-input" value={form.mode} disabled={!!isLocked}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}>
              <option value="">-- Select --</option>
              <option>Full-Time</option>
              <option>Part-Time</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Supervisor</label>
            <select className="srm-input" value={form.supervisorId} disabled={!!isLocked}
              onChange={(e) => setForm({ ...form, supervisorId: e.target.value })}>
              <option value="">-- Select --</option>
              {supervisors.map((s: any) => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.username})</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tentative Topic</label>
          <input className="srm-input" value={form.tentativeTopic} disabled={!!isLocked}
            onChange={(e) => setForm({ ...form, tentativeTopic: e.target.value })}
            placeholder="Working title of your PhD research" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">University Email ID</label>
          <input type="email" className="srm-input" value={form.universityEmail} disabled={!!isLocked}
            onChange={(e) => setForm({ ...form, universityEmail: e.target.value })}
            placeholder="e.g. scholar1@srm.edu.in" />
        </div>
      </div>

      {!isLocked ? (
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-srm-border text-gray-700 hover:bg-gray-50 disabled:opacity-40">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={handleSubmit}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-srm-blue text-white hover:bg-srm-blue/90">
            Submit for Approval
          </button>
        </div>
      ) : (
        <div className="flex justify-end mt-6">
          <button onClick={() => navigate('/scholar')}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-srm-border text-gray-700 hover:bg-gray-50">
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
