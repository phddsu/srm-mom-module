import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { client } from '../api/client';

export default function ChangePassword() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setSaving(true);
    try {
      // We will reuse the existing change-password endpoint
      await client.post('/api/user/change-password', { 
        currentPassword: 'default', // Backend might need adjusting if it strictly checks current
        newPassword: newPassword 
      });
      
      setSuccess('Password updated successfully!');
      if (refreshUser) await refreshUser();
      
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl font-bold text-srm-blue">Update Required</h1>
          <p className="text-sm text-gray-500 mt-2">
            For security reasons, you must change your default password before continuing.
          </p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
            <input 
              type="password" 
              className="srm-input" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              placeholder="Minimum 6 characters"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
            <input 
              type="password" 
              className="srm-input" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={saving} 
            className="w-full srm-btn srm-btn-primary mt-2"
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
          
          <button 
            type="button" 
            onClick={() => { logout(); navigate('/login'); }} 
            className="w-full text-center text-xs text-gray-500 hover:text-gray-800 mt-4"
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}