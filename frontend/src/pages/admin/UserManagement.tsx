import { useEffect, useState, useRef } from 'react';
import {
  listAllUsers, listRoles, createUser, updateUser, deactivateUser,
} from '../../api/mom';

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  SCHOLAR: 'Scholar',
  SUPERVISOR: 'Supervisor',
  INSTITUTIONAL_RESEARCH_COORDINATOR: 'Research Coordinator',
  HEAD_OF_INSTITUTE: 'Head of Institute',
  DEAN_RESEARCH: 'Dean Research',
};

const ROLE_ORDER = [
  'SCHOLAR', 'SUPERVISOR', 'INSTITUTIONAL_RESEARCH_COORDINATOR',
  'HEAD_OF_INSTITUTE', 'DEAN_RESEARCH', 'SUPER_ADMIN',
];

const emptyForm = {
  username: '', password: '', fullName: '', email: '',
  department: '', designation: '', phone: '', officeLocation: '',
  role: 'SCHOLAR', active: 'true',
};

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [filterRole, setFilterRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  // --- NEW: Excel Upload Logic ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Assuming you store JWT in localStorage. Adjust if needed.
      const token = localStorage.getItem('token'); 
      const res = await fetch((import.meta.env.VITE_API_BASE || 'import.meta.env.VITE_API_BASE_URL') + '/api/admin/users/bulk-upload', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });

      const text = await res.text();
      if (res.ok) {
        setSuccess(text); // Shows the success message from backend
        await load(); // Refresh the list automatically
      } else {
        setError("Upload failed: " + text);
      }
    } catch (err: any) {
      setError("Error uploading file: " + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    }
  };
  // -------------------------------

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [u, r] = await Promise.all([listAllUsers(filterRole || undefined), listRoles()]);
      setUsers(u.data);
      setRoles(r.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load users');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filterRole]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
    setError(''); setSuccess('');
  };

  const openEdit = (u: any) => {
    setEditingId(u.id);
    setForm({
      username: u.username || '',
      password: '',
      fullName: u.fullName || '',
      email: u.email || '',
      department: u.department || '',
      designation: u.designation || '',
      phone: u.phone || '',
      officeLocation: u.officeLocation || '',
      role: u.role || 'SCHOLAR',
      active: String(u.active ?? true),
    });
    setShowForm(true);
    setError(''); setSuccess('');
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      if (editingId) {
        const payload: any = { ...form };
        if (!payload.password) delete payload.password;
        const r = await updateUser(editingId, payload);
        setUsers(users.map(u => u.id === editingId ? r.data : u));
        setSuccess('User updated.');
      } else {
        const r = await createUser(form);
        setUsers([r.data, ...users]);
        setSuccess('User created.');
      }
      closeForm();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDeactivate = async (u: any) => {
    if (!confirm(`Deactivate ${u.fullName} (${u.username})? They will no longer be able to log in.`)) return;
    try {
      await deactivateUser(u.id);
      setSuccess('User deactivated.');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Deactivate failed');
    }
  };

  const filtered = filterRole ? users.filter(u => u.role === filterRole) : users;

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-srm-blue">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create, edit, and manage users across all roles</p>
        </div>
        
        {/* --- NEW: Action Buttons with Excel Upload --- */}
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload Excel'}
          </button>
          
          <button onClick={openCreate} className="srm-btn srm-btn-primary">
            + Add User
          </button>
        </div>
      </div>

      {error ? <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div> : null}
      {success ? <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{success}</div> : null}

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFilterRole('')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${!filterRole ? 'bg-srm-blue text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-srm-blue/40'}`}>
          All ({users.length})
        </button>
        {ROLE_ORDER.map((r) => {
          const count = users.filter(u => u.role === r).length;
          return (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${filterRole === r ? 'bg-srm-blue text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-srm-blue/40'}`}>
              {ROLE_LABEL[r] || r} ({count})
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-srm-border shadow-sm overflow-hidden">
        <table className="srm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-500">Loading…</td></tr>
            ) : null}
            {!loading && filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-500">No users found.</td></tr>
            ) : null}
            {!loading && filtered.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/60">
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-srm-blueMid to-srm-blue text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {(u.fullName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-800">{u.fullName}</span>
                  </div>
                </td>
                <td className="font-mono text-xs text-gray-700">{u.username}</td>
                <td className="text-xs text-gray-600">{u.email || '—'}</td>
                <td>
                  <span className="srm-badge srm-badge-active">{ROLE_LABEL[u.role] || u.role}</span>
                </td>
                <td className="text-xs text-gray-600">{u.department || '—'}</td>
                <td>
                  <span className={`srm-badge ${u.active ? 'srm-badge-completed' : 'srm-badge-danger'}`}>
                    {u.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="text-right whitespace-nowrap">
                  <button onClick={() => openEdit(u)} className="srm-btn srm-btn-secondary !py-1.5 !px-3 !text-xs mr-2">
                    Edit
                  </button>
                  {u.active ? (
                    <button onClick={() => handleDeactivate(u)} className="srm-btn srm-btn-secondary !py-1.5 !px-3 !text-xs !text-red-700 !border-red-200 hover:!bg-red-50">
                      Deactivate
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl my-8">
            <h3 className="font-serif text-lg font-bold text-gray-800 mb-5">
              {editingId ? 'Edit User' : 'Create New User'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Username <span className="text-red-600">*</span></label>
                <input className="srm-input" value={form.username} disabled={!!editingId}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="e.g. scholar10" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Password {editingId ? '(leave blank to keep)' : <span className="text-red-600">*</span>}
                </label>
                <input type="password" className="srm-input" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name <span className="text-red-600">*</span></label>
                <input className="srm-input" value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role <span className="text-red-600">*</span></label>
                <select className="srm-input" value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLE_ORDER.map((r) => <option key={r} value={r}>{ROLE_LABEL[r] || r}</option>)}
                </select>
              </div>

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

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Office Location</label>
                <input className="srm-input" value={form.officeLocation}
                  onChange={(e) => setForm({ ...form, officeLocation: e.target.value })}
                  placeholder="e.g. Block C, Room 302" />
              </div>

              {editingId ? (
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select className="srm-input" value={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.value })}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-srm-border">
              <button onClick={closeForm} disabled={saving} className="srm-btn srm-btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="srm-btn srm-btn-primary">
                {saving ? 'Saving…' : (editingId ? 'Update User' : 'Create User')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}