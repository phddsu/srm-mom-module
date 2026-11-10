import { useEffect, useState } from 'react';
import { getCoordinatorPending, coordinatorAction, getMomById, getAllMoms } from '../../api/mom';
import { client } from '../../api/client';
import type { MinutesOfMeeting } from '../../types/mom';
import MomReviewPanel from '../../components/MomReviewPanel';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import ViewButton from '../../components/ViewButton';

const statusClass = (s: string) => {
  if (s === 'DEAN_APPROVED') return 'srm-badge-completed';
  if (s === 'DRAFT') return 'srm-badge-draft';
  if (s.endsWith('_RETURNED') || s === 'DEAN_REJECTED') return 'srm-badge-danger';
  return 'srm-badge-active';
};

const stageLabel = (s: string) => String(s || '').replace(/_/g, ' ');

export default function CoordinatorDashboard() {
  const [pending, setPending] = useState<MinutesOfMeeting[]>([]);
  const [all, setAll] = useState<MinutesOfMeeting[]>([]);
  const [selected, setSelected] = useState<MinutesOfMeeting | null>(null);
  const [remarks, setRemarks] = useState('');
  const [typedName, setTypedName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'pending' | 'all'>('pending');
  const [dialog, setDialog] = useState<{ open: boolean; action: 'RECOMMEND' | 'RETURN' }>({ open: false, action: 'RECOMMEND' });

  // --- OFFICIAL NOTICE STATE ---
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  // FIXED: Added momId to the state type
  const [selectedScholar, setSelectedScholar] = useState<{ id: number; momId: number; name: string } | null>(null);
  const [noticeMessage, setNoticeMessage] = useState('Dear Scholar,\n\nThis is a formal reminder to complete your pending MoM submission and update your PhD progress at the earliest. Please ensure all details are filled correctly and submitted to your supervisor.\n\nRegards,\nResearch Coordinator');
  const [sendingNotice, setSendingNotice] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [p, a] = await Promise.all([getCoordinatorPending(), getAllMoms()]);
      setPending(p.data);
      setAll(a.data);
    } catch (e: any) { setError(e?.response?.data?.message || 'Load failed'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openMom = async (id: number) => {
    try {
      const res = await getMomById(id);
      setSelected(res.data); setRemarks(''); setTypedName('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) { setError(e?.response?.data?.message || 'Load failed'); }
  };

  const doAction = async () => {
    if (!selected || !typedName.trim()) { setError('Please type your full name to sign.'); return; }
    try {
      await coordinatorAction(selected.id, dialog.action, remarks, typedName);
      setDialog({ open: false, action: 'RECOMMEND' });
      setSelected(null); setTypedName(''); setRemarks('');
      await load();
    } catch (e: any) { setError(e?.response?.data?.message || 'Action failed'); }
  };

  // --- HANDLE SEND NOTICE ---
    const handleSendNotice = async () => {
    if (!selectedScholar) return;
    setSendingNotice(true);
    try {
      await client.post('/api/notifications/send-alert', { 
        userId: selectedScholar.id, 
        momId: selectedScholar.momId, 
        message: noticeMessage 
      });
      alert('Official notice sent successfully to the scholar.'); 
      setShowNoticeModal(false); 
    } catch (err: any) { 
      alert('Error: ' + (err.response?.data || err.message)); 
    } finally { 
      setSendingNotice(false); 
    }
  };

  const list = view === 'pending' ? pending : all;

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex items-center gap-5 shadow-sm">
        <img src="/srm-logo.jpg" alt="SRM" className="h-20 w-auto object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <div className="flex-1 border-l-2 border-srm-blue pl-5">
          <h1 className="font-serif text-xl font-bold text-srm-blue leading-tight">SRM Institute of Science and Technology</h1>
          <p className="text-xs text-gray-500 mt-1">Institutional Research Coordinator</p>
        </div>
      </div>

      {error ? <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div> : null}

      {!selected ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setView('pending')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${view === 'pending' ? 'bg-srm-blue text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-srm-blue/40'}`}>
                Pending My Action ({pending.length})
              </button>
              <button
                onClick={() => setView('all')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${view === 'all' ? 'bg-srm-blue text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-srm-blue/40'}`}>
                All Submissions ({all.length})
              </button>
            </div>
            {pending.length > 0 ? (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-[11px] font-bold text-srm-blue uppercase tracking-wider">
                  {pending.length} awaiting review
                </span>
              </div>
            ) : null}
          </div>

          <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
            <table className="srm-table">
              <thead>
                <tr>
                  <th>MoM Number</th>
                  <th>Scholar</th>
                  <th>Period</th>
                  <th>Current Stage</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-16">
                    <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Loading submissions...
                    </div>
                  </td></tr>
                ) : null}
                {!loading && list.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-green-50 mx-auto flex items-center justify-center mb-3">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      {view === 'pending' ? 'All caught up!' : 'No MoMs yet'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {view === 'pending' ? 'No pending submissions to review.' : 'Nothing has been submitted so far.'}
                    </p>
                  </td></tr>
                ) : null}
                {!loading && list.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="font-mono text-xs font-semibold">{m.momNumber}</td>
                    <td>
                      <p className="font-semibold text-gray-800">{m.sectionAScholarName || ('Scholar #' + m.scholarId)}</p>
                      <p className="text-xs text-gray-500">ID: {m.scholarId}</p>
                    </td>
                    <td className="text-xs">{m.periodMonth}/{m.periodYear}</td>
                    <td className="text-xs font-medium">{stageLabel(m.currentStage)}</td>
                    <td><span className={`srm-badge ${statusClass(m.currentStatus)}`}>{m.currentStatus.replace(/_/g, ' ')}</span></td>
                    <td className="text-right whitespace-nowrap">
                      <ViewButton onClick={() => openMom(m.id)} label="View" />
                      
                      {/* PROFESSIONAL NOTICE BUTTON */}
                      {(m.currentStatus === 'DRAFT' || m.currentStatus.includes('RETURNED')) && (
                        <button 
                          onClick={() => { 
                            // FIXED: passing m.id as momId
                            setSelectedScholar({ id: (m as any).scholarUserId || (m as any).userId || m.scholarId, momId: m.id, name: m.sectionAScholarName || 'Scholar' }); 
                            setShowNoticeModal(true); 
                          }} 
                          className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase tracking-wide ml-4 px-3 py-1.5 rounded bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                        >
                          Send Notice
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {selected ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm w-full">
          <div className="flex justify-between items-center mb-5 pb-4 border-b">
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-800">Review: {selected.momNumber}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Scholar: {selected.sectionAScholarName || ('#' + selected.scholarId)} | Stage: {stageLabel(selected.currentStage)} | Status: {selected.currentStatus.replace(/_/g, ' ')}
              </p>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 text-xl font-bold px-2 hover:bg-gray-100 rounded">×</button>
          </div>

          <div className="w-full">
            <MomReviewPanel mom={selected} />
          </div>
        </div>
      ) : null}

      {/* PROFESSIONAL NOTICE MODAL */}
      {showNoticeModal && selectedScholar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-serif text-xl font-bold text-gray-800">Official Communication</h3>
              <p className="text-sm text-gray-500 mt-1">
                Send a formal notice or reminder to <span className="font-semibold text-gray-700">{selectedScholar.name}</span>.
                This will appear in their portal's notification center.
              </p>
            </div>
            
            <textarea 
              className="w-full h-48 resize-none p-3 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-srm-blue focus:border-transparent"
              value={noticeMessage}
              onChange={(e) => setNoticeMessage(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-5">
              <button 
                onClick={() => setShowNoticeModal(false)} 
                className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendNotice} 
                disabled={sendingNotice} 
                className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-srm-blue text-white hover:bg-srm-blue/90 disabled:opacity-50"
              >
                {sendingNotice ? 'Sending...' : 'Send Notice to Scholar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        open={dialog.open}
        title={dialog.action === 'RECOMMEND' ? 'Recommend to HOI?' : 'Unrecommend to Scholar?'}
        message={dialog.action === 'RECOMMEND' ? 'This will forward the MoM to the Head of Institute for endorsement.' : 'This will return the MoM to the Scholar with remarks.'}
        confirmLabel={dialog.action === 'RECOMMEND' ? 'Recommend' : 'Unrecommend'}
        onCancel={() => setDialog({ open: false, action: 'RECOMMEND' })}
        onConfirm={doAction}
      />
    </div>
  );
}