import { useEffect, useState } from 'react';
import { getDeanPending, deanAction, getMomById, downloadMomPdf, uploadSignedCopy, getAllMoms } from '../../api/mom';
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

export default function DeanResearchDashboard() {
  const [pending, setPending] = useState<MinutesOfMeeting[]>([]);
  const [all, setAll] = useState<MinutesOfMeeting[]>([]);
  const [selected, setSelected] = useState<MinutesOfMeeting | null>(null);
  const [remarks, setRemarks] = useState('');
  const [typedName, setTypedName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'pending' | 'all'>('pending');
  const [dialog, setDialog] = useState<{ open: boolean; action: 'APPROVE' | 'REJECT' }>({ open: false, action: 'APPROVE' });

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [p, a] = await Promise.all([getDeanPending(), getAllMoms()]);
      setPending(p.data);
      setAll(a.data);
    } catch (e: any) { setError(e?.response?.data?.message || 'Load failed'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openMom = async (id: number) => {
    try {
      const res = await getMomById(id);
      setSelected(res.data); setRemarks(res.data.sectionIDeanRemarks || ''); setTypedName('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) { setError(e?.response?.data?.message || 'Load failed'); }
  };

  const doAction = async () => {
    if (!selected || !typedName.trim()) { setError('Please type your full name to sign.'); return; }
    try {
      await deanAction(selected.id, dialog.action, remarks, typedName);
      setDialog({ open: false, action: 'APPROVE' });
      setSelected(null); setTypedName('');
      await load();
    } catch (e: any) { setError(e?.response?.data?.message || 'Action failed'); }
  };

  const handlePdf = async () => {
    if (!selected) return;
    try {
      const res = await downloadMomPdf(selected.id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (e: any) { setError(e?.response?.data?.message || 'PDF download failed'); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selected || !e.target.files || !e.target.files[0]) return;
    try {
      await uploadSignedCopy(selected.id, e.target.files[0]);
      alert('Signed copy uploaded successfully.');
    } catch (err: any) { setError(err?.response?.data?.message || 'Upload failed'); }
  };

  const list = view === 'pending' ? pending : all;
  const canAct = selected && selected.currentStage === 'DEAN_RESEARCH';

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex items-center gap-5 shadow-sm">
        <img src="/srm-logo.jpg" alt="SRM" className="h-20 w-auto object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <div className="flex-1 border-l-2 border-srm-blue pl-5">
          <h1 className="font-serif text-xl font-bold text-srm-blue leading-tight">SRM Institute of Science and Technology</h1>
          <p className="text-xs text-gray-500 mt-1">Dean Research - Final Approval</p>
        </div>
      </div>

      {error ? <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div> : null}

      {!selected ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-gray-800">Scholars in Pipeline</h2>
              <p className="text-sm text-gray-500 mt-0.5">All MoMs and their current status</p>
            </div>
            <span className="bg-srm-blue/10 text-srm-blue px-4 py-1.5 rounded-full text-xs font-bold">
              {pending.length} Pending / {all.length} Total
            </span>
          </div>

          <div className="flex gap-2 mb-4">
            <button onClick={() => setView('pending')}
              className={`px-4 py-2 rounded text-xs font-semibold transition ${view === 'pending' ? 'bg-srm-blue text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-srm-blue/40'}`}>
              Pending My Action ({pending.length})
            </button>
            <button onClick={() => setView('all')}
              className={`px-4 py-2 rounded text-xs font-semibold transition ${view === 'all' ? 'bg-srm-blue text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-srm-blue/40'}`}>
              All Scholars ({all.length})
            </button>
          </div>

          <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
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
                {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr> : null}
                {!loading && list.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-500">
                    {view === 'pending' ? 'No pending approvals' : 'No MoMs yet'}
                  </td></tr>
                ) : null}
                {!loading && list.map((m) => (
                  <tr key={m.id}>
                    <td className="font-mono text-xs font-semibold">{m.momNumber}</td>
                    <td>
                      <p className="font-semibold text-gray-800">{m.sectionAScholarName || ('Scholar #' + m.scholarId)}</p>
                      <p className="text-xs text-gray-500">ID: {m.scholarId}</p>
                    </td>
                    <td className="text-xs">{m.periodMonth}/{m.periodYear}</td>
                    <td className="text-xs font-medium">{stageLabel(m.currentStage)}</td>
                    <td><span className={`srm-badge ${statusClass(m.currentStatus)}`}>{m.currentStatus.replace(/_/g, ' ')}</span></td>
                    <td className="text-right">
                      <ViewButton onClick={() => openMom(m.id)} label="View" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {selected ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5 pb-4 border-b">
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-800">{canAct ? 'Final Approval: ' : 'View: '}{selected.momNumber}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Scholar: {selected.sectionAScholarName || ('#' + selected.scholarId)} | Stage: {stageLabel(selected.currentStage)} | Status: {selected.currentStatus.replace(/_/g, ' ')}
              </p>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 text-xl">x</button>
          </div>

          <div className="flex gap-3 flex-wrap mb-4">
            <button onClick={handlePdf} className="srm-btn srm-btn-primary">Print / Download PDF</button>
            <label className="srm-btn srm-btn-secondary cursor-pointer">
              Upload Signed Copy
              <input type="file" accept="application/pdf" className="hidden" onChange={handleUpload} />
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="max-h-[700px] overflow-y-auto pr-2"><MomReviewPanel mom={selected} /></div>
            {canAct ? (
              <div className="bg-srm-bg rounded-lg p-5">
                <h4 className="font-bold text-srm-blue text-sm uppercase tracking-wider mb-4">Section I - Dean Research Final Remarks</h4>
                <label className="block text-xs font-medium text-gray-600 mb-1">Directorate Remarks</label>
                <textarea className="srm-input mb-4" rows={4} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                <label className="block text-xs font-medium text-gray-600 mb-1">Type your full name to sign</label>
                <input className="srm-input mb-4" value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder="e.g. Dean Research" />
                <div className="flex gap-3">
                  <button onClick={() => setDialog({ open: true, action: 'APPROVE' })} className="srm-btn srm-btn-primary flex-1 justify-center">Approve</button>
                  <button onClick={() => setDialog({ open: true, action: 'REJECT' })} className="srm-btn srm-btn-secondary flex-1 justify-center">Reject</button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-3">Read-only View</h4>
                <p className="text-sm text-gray-600">
                  This MoM is at stage <strong>{stageLabel(selected.currentStage)}</strong> with status <strong>{selected.currentStatus.replace(/_/g, ' ')}</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <ConfirmationDialog
        open={dialog.open}
        title={dialog.action === 'APPROVE' ? 'Approve MoM?' : 'Reject MoM?'}
        message={dialog.action === 'APPROVE' ? 'This will complete the MoM workflow and notify all stakeholders.' : 'This will reject the MoM and close the workflow.'}
        confirmLabel={dialog.action === 'APPROVE' ? 'Approve' : 'Reject'}
        onCancel={() => setDialog({ open: false, action: 'APPROVE' })}
        onConfirm={doAction}
      />
    </div>
  );
}