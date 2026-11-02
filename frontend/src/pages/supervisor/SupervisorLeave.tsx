import { useEffect, useState } from 'react';
import { getGuidePending, getAllMoms } from '../../api/mom';
import { client } from '../../api/client';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const statusColor = (s: string) => {
  if (s === 'DEAN_APPROVED') return 'srm-badge-completed';
  if (s === 'DRAFT') return 'srm-badge-draft';
  if (s.endsWith('_RETURNED') || s === 'DEAN_REJECTED') return 'srm-badge-danger';
  return 'srm-badge-active';
};

export default function SupervisorLeave() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [dialog, setDialog] = useState<{ open: boolean; momId: number; action: 'RECOMMEND' | 'RETURN' | ''; period: string }>({ open: false, momId: 0, action: '', period: '' });
  const [remarks, setRemarks] = useState('');
  const [typedName, setTypedName] = useState('');
  const [busy, setBusy] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([getGuidePending(), getAllMoms()]);
      const allMoms = [...p.data, ...a.data.filter((m: any) => !p.data.find((pd: any) => pd.id === m.id))];
      
      const extractedLeaves: any[] = [];
      for (const mom of allMoms) {
        if (!mom.sectionGLeaves) continue;
        try {
          const parsed = JSON.parse(mom.sectionGLeaves);
          if (!Array.isArray(parsed) || parsed.length === 0) continue;
          
          const validLeaves = parsed.filter((l: any) => l.fromDate || l.reason);
          
          if (validLeaves.length > 0) {
            extractedLeaves.push({
              momId: mom.id,
              momNumber: mom.momNumber,
              scholarName: mom.sectionAScholarName || mom.scholarName || `Scholar #${mom.scholarId}`,
              period: `${MONTHS[(mom.periodMonth || 1) - 1]} ${mom.periodYear}`,
              status: mom.leaveStatus || 'DRAFT',
              leaves: validLeaves
            });
          }
        } catch {}
      }
      setLeaves(extractedLeaves);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDialog = (momId: number, period: string, action: 'RECOMMEND' | 'RETURN') => {
    setDialog({ open: true, momId, action, period });
    setRemarks('');
    setTypedName('');
  };

  const handleActionSubmit = async () => {
    if (!typedName.trim()) {
      alert('Please type your full name to sign.');
      return;
    }
    setBusy(true);
    try {
      // Default scores for fast approval via Leave Requests page
      const defaultScores = JSON.stringify({ overall: 3, timely: 3, publication: 3, technical: 3, research: 3, attendance: 3 });
      await client.post('/api/mom/' + dialog.momId + '/leave-action', { action: dialog.action === 'RECOMMEND' ? 'APPROVE' : 'REJECT', remarks });
      
      setDialog({ open: false, momId: 0, action: '', period: '' });
      await loadData(); // Refresh list
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-srm-blue">Leave Requests</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage leave requests submitted by your scholars</p>
      </div>

      <div className="bg-white rounded-xl border border-srm-border shadow-sm overflow-hidden">
        <table className="srm-table">
          <thead>
            <tr>
              <th>Scholar</th>
              <th>MoM Period</th>
              <th>Leave Dates</th>
              <th>Type & Reason</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">Loading leave requests...</td></tr>
            ) : null}
            {!loading && leaves.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">No leave requests found.</td></tr>
            ) : null}
            {!loading && leaves.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <p className="font-semibold text-gray-800">{item.scholarName}</p>
                  <p className="text-xs text-gray-500 font-mono">{item.momNumber}</p>
                </td>
                <td className="text-sm text-gray-700">{item.period}</td>
                <td>
                  {item.leaves.map((l: any, i: number) => (
                    <div key={i} className="text-xs text-gray-700 mb-1 last:mb-0">
                      <span className="font-medium">{l.fromDate || '?'}</span> to <span className="font-medium">{l.toDate || '?'}</span>
                    </div>
                  ))}
                </td>
                <td>
                  {item.leaves.map((l: any, i: number) => (
                    <div key={i} className="text-xs text-gray-600 mb-1 last:mb-0">
                      <span className="font-semibold">{l.type}</span> - {l.reason}
                    </div>
                  ))}
                </td>
                <td>
                  <span className={`srm-badge ${statusColor(item.status)}`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="text-right whitespace-nowrap">
                  {item.status === 'SUBMITTED' ? (
                    <>
                      <button onClick={() => openDialog(item.momId, item.period, 'RECOMMEND')} 
                        className="srm-btn !py-1.5 !px-3 !text-xs mr-2 bg-green-600 hover:bg-green-700 text-white border-none shadow-sm">
                        Approve
                      </button>
                      <button onClick={() => openDialog(item.momId, item.period, 'RETURN')} 
                        className="srm-btn !py-1.5 !px-3 !text-xs border border-red-200 text-red-700 hover:bg-red-50 shadow-sm">
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No action required</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Signature Modal */}
      {dialog.open ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-serif text-lg font-bold text-gray-800 mb-1">
              {dialog.action === 'RECOMMEND' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              You are about to {dialog.action === 'RECOMMEND' ? 'approve' : 'reject'} the MoM for <strong>{dialog.period}</strong>.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Remarks</label>
              <textarea className="srm-input" rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add your observations (optional)" />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Type your full name to sign <span className="text-red-500">*</span></label>
              <input className="srm-input" value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder="e.g. Guide One" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-srm-border">
              <button onClick={() => setDialog({ open: false, momId: 0, action: '', period: '' })} disabled={busy} className="srm-btn srm-btn-secondary">
                Cancel
              </button>
              <button onClick={handleActionSubmit} disabled={busy} className={`srm-btn ${dialog.action === 'RECOMMEND' ? '!bg-green-600 hover:!bg-green-700' : '!bg-red-600 hover:!bg-red-700'} text-white`}>
                {busy ? 'Processing...' : dialog.action === 'RECOMMEND' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
