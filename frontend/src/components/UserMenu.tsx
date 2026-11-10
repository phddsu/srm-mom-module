import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { client } from '../api/client'; // <-- FIXED: Changed ../../ to ../

export default function UserMenu() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Change Password State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(''); setPwdSuccess('');
    
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }

    setSaving(true);
    try {
      await client.post('/api/user/change-password', { currentPassword, newPassword });
      setPwdSuccess('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => { setShowPasswordModal(false); setPwdSuccess(''); }, 2000);
    } catch (err: any) {
      setPwdError(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const fd = new FormData(); fd.append("file", file); try { await client.post("/api/user/avatar", fd, { headers: { "Content-Type": "multipart/form-data" } }); await refreshUser(); } catch (err: any) { alert("Upload failed: " + (err?.response?.data?.message || err.message)); } setOpen(false); };

  if (!user) return null;

  // Determine the correct image URL
  const avatarUrl = (user as any)?.avatarUrl;
  let finalImageUrl = "";
  
  if (avatarUrl) {
    if (avatarUrl.includes('localhost:8081')) {
      finalImageUrl = avatarUrl.replace('localhost:8081', 'localhost:8081');
    } else if (avatarUrl.startsWith('http')) {
      finalImageUrl = avatarUrl;
    } else {
      const path = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
      finalImageUrl = `${import.meta.env.VITE_API_BASE || 'import.meta.env.VITE_API_BASE_URL'}${path}`;
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-3 focus:outline-none">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-srm-blueMid to-srm-blue text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden">
          {avatarUrl ? (
            <img 
              src={finalImageUrl} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          ) : (
            user.fullName?.charAt(0).toUpperCase()
          )}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-semibold text-gray-800 leading-tight">{user.fullName}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{user.role.replace(/_/g, ' ')}</p>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-srm-border overflow-hidden z-50">
          <div className="p-4 border-b border-srm-border bg-gray-50">
            <p className="font-semibold text-gray-800 text-sm">{user.fullName}</p>
            <p className="text-xs text-gray-500 font-mono mt-0.5">@{user.username}</p>
            <p className="text-[10px] text-gray-400 mt-1">{user.email}</p>
          </div>
          <div className="py-2">
            <label className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer">Change Photo<input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} /></label>
            <button onClick={() => { setOpen(false); setShowPasswordModal(true); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               ⚙️ Change Password
            </button>
            <button onClick={() => { setOpen(false); navigate('/notifications'); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
               🔔 Notifications
            </button>
          </div>
          <div className="border-t border-srm-border py-2">
            <button onClick={() => { logout(); navigate('/login'); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
               🚪 Logout
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-lg font-bold text-gray-800 mb-1">Change Password</h3>
            <p className="text-xs text-gray-500 mb-4">Update your account password securely.</p>
            
            {pwdError && <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">{pwdError}</div>}
            {pwdSuccess && <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 text-xs rounded">{pwdSuccess}</div>}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
                <input type="password" required className="srm-input" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
                <input type="password" required className="srm-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
                <input type="password" required className="srm-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
              
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="srm-btn srm-btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="srm-btn srm-btn-primary">
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
