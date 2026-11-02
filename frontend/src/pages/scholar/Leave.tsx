import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getMyMoms, getMomById } from '../../api/mom';
import { client } from '../../api/client';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const LEAVE_TYPES = ['Casual Leave','Medical Leave','OD (On Duty)','Vacation','Other'];
const MAX_FILE_MB = 10;

export default function Leave() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [draftMom, setDraftMom] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const r = await getMyMoms();
      const moms = r.data;
      const draft = moms.find((m: any) =>
        m.currentStatus === 'DRAFT' || String(m.currentStatus).endsWith('_RETURNED'));
      setDraftMom(draft || null);

      if (draft) {
        const full = await getMomById(draft.id);
        let arr: any[] = [];
        try { arr = full.data.sectionGLeaves ? JSON.parse(full.data.sectionGLeaves) : []; } catch {}
        if (!arr.length) arr = [{ fromDate: '', toDate: '', type: 'Casual Leave', reason: '' }];
        setLeaves(arr);
      }

      // Build history from older MoMs
      const hist: any[] = [];
      for (const m of moms) {
        if (draft && m.id === draft.id) continue;
        if (!m.sectionGLeaves) continue;
        try {
          const parsed = JSON.parse(m.sectionGLeaves);
          if (!Array.isArray(parsed)) continue;
          for (const l of parsed) {
            if (l && (l.fromDate || l.toDate || l.reason)) {
              hist.push({
                month: `${MONTHS[(m.periodMonth || 1) - 1].slice(0,3)} ${m.periodYear}`,
                ...l,
              });
            }
          }
        } catch {}
      }
      setHistory(hist);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load leaves');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!draftMom) return;
    if (!confirm('Are you sure you want to submit these leave requests to your Supervisor?')) return;
    
    setSubmitting(true); setError(''); setSuccess('');
    try {
      await client.post(`/api/mom/${draftMom.id}/leaves`, { leaves, submit: true });
      setSuccess('Leave request submitted successfully and routed to your Supervisor.');
      
      setTimeout(() => navigate('/scholar'), 2000);
      
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  };
  const updateLeaf = (idx: number, key: string, val: any) => {
    const next = [...leaves];
    next[idx] = { ...next[idx], [key]: val };
    setLeaves(next);
  };

  const addLeaf = () => setLeaves([...leaves, { fromDate: '', toDate: '', type: 'Casual Leave', reason: '' }]);

  const removeLeaf = (idx: number) => {
    const arr = leaves.filter((_, i) => i !== idx);
    setLeaves(arr.length ? arr : [{ fromDate: '', toDate: '', type: 'Casual Leave', reason: '' }]);
  };

  if (loading) return <div className="p-8 text-sm text-gray-500">Loading leaves…</div>;

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-srm-blue">Leave Requests</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your leave entries for the current MoM period</p>
      </div>

      {error ? <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div> : null}
      {success ? <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{success}</div> : null}

      {!draftMom ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg p-4 mb-6">
          You don't have an open draft MoM. Leaves are added to your current draft.
          <button onClick={() => navigate('/scholar')} className="ml-3 underline font-semibold">Go to My MoMs →</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-srm-border shadow-sm overflow-hidden mb-8">
          <div className="px-5 py-3.5 border-b border-srm-border bg-gradient-to-r from-srm-blue to-srm-blueMid">
            <h2 className="text-white font-semibold text-xs uppercase tracking-widest">
              Leaves for {MONTHS[(draftMom.periodMonth || 1) - 1]} {draftMom.periodYear}
            </h2>
          </div>
          <div className="p-5">
            <p className="text-xs text-gray-500 mb-4">
              Attach approval email or letter for each leave (max {MAX_FILE_MB} MB). Edit these in the MoM editor to save.
            </p>
            <table className="srm-table">
              <thead>
                <tr>
                  <th>From</th><th>To</th><th>Type</th><th>Reason</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((r, i) => (
                  <tr key={i}>
                    <td className="w-40"><input type="date" className="srm-input" value={r.fromDate} onChange={(e) => updateLeaf(i, 'fromDate', e.target.value)} /></td>
                    <td className="w-40"><input type="date" className="srm-input" value={r.toDate} onChange={(e) => updateLeaf(i, 'toDate', e.target.value)} /></td>
                    <td className="w-40">
                      <select className="srm-input" value={r.type} onChange={(e) => updateLeaf(i, 'type', e.target.value)}>
                        {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </td>
                    <td><input className="srm-input" value={r.reason} onChange={(e) => updateLeaf(i, 'reason', e.target.value)} placeholder="Reason" /></td>
                    <td className="w-12">
                      <button onClick={() => removeLeaf(i)} className="text-red-600 font-bold">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex justify-between items-center">
              <button onClick={addLeaf} className="text-xs font-semibold text-srm-blue hover:underline">+ Add Leave</button>
              <button onClick={handleSubmit} disabled={submitting} className="srm-btn srm-btn-primary">
                {submitting ? 'Submitting...' : 'Submit Leave Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {history.length > 0 ? (
        <div className="bg-white rounded-xl border border-srm-border shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-srm-border bg-gray-50/70">
            <h2 className="text-xs uppercase tracking-widest font-bold text-gray-600">Past Leaves</h2>
          </div>
          <table className="srm-table">
            <thead>
              <tr><th>#</th><th>MoM Month</th><th>From</th><th>To</th><th>Type</th><th>Reason</th></tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td className="text-gray-400">{i + 1}</td>
                  <td className="text-gray-500 whitespace-nowrap">{h.month}</td>
                  <td>{h.fromDate || '—'}</td>
                  <td>{h.toDate || '—'}</td>
                  <td>{h.type || '—'}</td>
                  <td className="text-gray-600">{h.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}