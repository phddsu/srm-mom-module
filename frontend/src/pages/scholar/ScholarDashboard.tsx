import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getMyMoms, createDraft } from '../../api/mom';
import type { MinutesOfMeeting } from '../../types/mom';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR + 1, CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3];

const statusStyle = (s: string) => {
  if (s === 'DEAN_APPROVED') return 'srm-badge-completed';
  if (s === 'DRAFT') return 'srm-badge-draft';
  if (s.endsWith('_RETURNED') || s === 'DEAN_REJECTED') return 'srm-badge-danger';
  return 'srm-badge-active';
};

export default function ScholarDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [moms, setMoms] = useState<MinutesOfMeeting[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const now = new Date();
  const [showPicker, setShowPicker] = useState(false);
  const [pickMonth, setPickMonth] = useState(now.getMonth() + 1);
  const [pickYear, setPickYear] = useState(now.getFullYear());
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try {
      const r = await getMyMoms();
      setMoms(r.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load');
    }
  };
  useEffect(() => { load(); }, []);

  const openPicker = () => {
    setPickMonth(new Date().getMonth() + 1);
    setPickYear(new Date().getFullYear());
    setError(''); setSuccess('');
    setShowPicker(true);
  };

  const handleCreate = async () => {
    setCreating(true); setError(''); setSuccess('');
    try {
      const payload = { periodMonth: pickMonth, periodYear: pickYear };
      const res = await createDraft(payload);
      setShowPicker(false);
      navigate(`/mom/${res.data.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  const alreadyExists = moms.some(m => m.periodMonth === pickMonth && m.periodYear === pickYear);

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="bg-white rounded-xl border border-srm-border p-4 mb-6 flex items-center gap-5 shadow-sm">
        <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
          <img src="/srm-logo.jpg" alt="SRM" className="h-16 w-auto object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div className="flex-1 border-l-2 border-srm-blue pl-5">
          <h1 className="font-serif text-lg font-bold text-srm-blue leading-tight">SRM Institute of Science and Technology</h1>
          <p className="text-xs text-gray-500 mt-0.5">Directorate of Research &middot; Monthly Progress Review of Full-Time Scholars</p>
        </div>
      </div>

      {error ? <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div> : null}
      {success ? <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{success}</div> : null}

      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-gray-800 leading-tight">My Minutes of Meetings</h2>
          <p className="text-sm text-gray-500 mt-1">Create and submit your monthly progress reports for review</p>
        </div>
        <button onClick={openPicker} className="srm-btn srm-btn-primary shadow-sm">+ Create New MoM</button>
      </div>

      <div className="bg-white rounded-xl border border-srm-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-srm-border bg-gray-50/70 flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-widest font-bold text-gray-600">My Submissions</h3>
          <span className="text-xs font-bold text-srm-blue bg-blue-50 px-2.5 py-1 rounded-full">{moms.length}</span>
        </div>
        <div>
          {moms.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No MoMs yet</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {moms.map((m) => (
                <li key={m.id}>
                  <button onClick={() => navigate(`/mom/${m.id}`)}
                    className="w-full text-left px-5 py-4 transition-all border-l-4 border-transparent hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-mono text-[11px] font-bold text-gray-700">{m.momNumber}</p>
                      <span className={`srm-badge ${statusStyle(m.currentStatus)}`}>
                        {m.currentStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">{MONTHS[(m.periodMonth || 1) - 1]} {m.periodYear}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ---- Month/Year Picker Dialog ---- */}
      {showPicker ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-serif text-lg font-bold text-gray-800 mb-1">Create New MoM</h3>
            <p className="text-xs text-gray-500 mb-5">
              Select the month and year this Minutes of Meeting covers.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <select className="srm-input" value={pickMonth}
                  onChange={(e) => setPickMonth(Number(e.target.value))}>
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                <select className="srm-input" value={pickYear}
                  onChange={(e) => setPickYear(Number(e.target.value))}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {alreadyExists ? (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-lg">
                You already have a MoM for <strong>{MONTHS[pickMonth - 1]} {pickYear}</strong>. Creating another will add a duplicate. You can cancel and open the existing one from the list instead.
              </div>
            ) : null}

            <div className="flex justify-end gap-3 pt-4 border-t border-srm-border">
              <button onClick={() => setShowPicker(false)} disabled={creating} className="srm-btn srm-btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={creating} className="srm-btn srm-btn-primary">
                {creating ? 'Creating…' : `Create for ${MONTHS[pickMonth - 1].slice(0,3)} ${pickYear}`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}