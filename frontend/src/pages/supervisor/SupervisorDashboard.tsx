import { useEffect, useState } from 'react';
import { getGuidePending, guideAction, getMomById, getAllMoms } from '../../api/mom';
import type { MinutesOfMeeting } from '../../types/mom';
import MomReviewPanel from '../../components/MomReviewPanel';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import ViewButton from '../../components/ViewButton';

const SCORE_FIELDS = [
  { key: 'overall', label: 'Overall Performance' },
  { key: 'timely', label: 'Timely Completion of Tasks' },
  { key: 'publication', label: 'Publication Progress' },
  { key: 'technical', label: 'Technical Competency' },
  { key: 'research', label: 'Research Progress' },
  { key: 'attendance', label: 'Attendance and Regularity' },
];

const statusColor = (s: string) => {
  if (s === 'DEAN_APPROVED') return 'text-green-700 bg-green-50 border-green-200';
  if (s === 'DRAFT') return 'text-gray-600 bg-gray-50 border-gray-200';
  if (s.endsWith('_RETURNED') || s === 'DEAN_REJECTED') return 'text-red-700 bg-red-50 border-red-200';
  return 'text-blue-700 bg-blue-50 border-blue-200';
};

const stageLabel = (s: string) => String(s || '').replace(/_/g, ' ');

const StatusIcon = ({ status }: { status: string }) => {
  const cls = 'w-3 h-3';
  if (status === 'DEAN_APPROVED') return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>;
  if (status === 'DRAFT') return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
  if (status.endsWith('_RETURNED') || status === 'DEAN_REJECTED') return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
  return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
};

export default function SupervisorDashboard() {
  const [pending, setPending] = useState<MinutesOfMeeting[]>([]);
  const [all, setAll] = useState<MinutesOfMeeting[]>([]);
  const [selected, setSelected] = useState<MinutesOfMeeting | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'pending' | 'all'>('pending');
  const [month, setMonth] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({ overall: 3, timely: 3, publication: 3, technical: 3, research: 3, attendance: 3 });
  const [remarks, setRemarks] = useState('');
  const [typedName, setTypedName] = useState('');
  const [dialog, setDialog] = useState<{ open: boolean; action: 'RECOMMEND' | 'RETURN' }>({ open: false, action: 'RECOMMEND' });

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [p, a] = await Promise.all([getGuidePending(), getAllMoms()]);
      setPending(p.data);
      setAll(a.data);
    } catch (e: any) { setError(e?.response?.data?.message || 'Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openMom = async (id: number) => {
    try {
      const res = await getMomById(id);
      setSelected(res.data);
      setMonth(res.data.sectionHMonth || '');
      setRemarks(res.data.sectionHRecommendation || '');
      setTypedName('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) { setError(e?.response?.data?.message || 'Failed to load'); }
  };

  const doAction = async () => {
    if (!selected || !typedName.trim()) { setError('Please type your full name to sign.'); return; }
    try {
      await guideAction(selected.id, dialog.action, remarks, typedName, month, JSON.stringify(scores));
      setDialog({ open: false, action: 'RECOMMEND' });
      setSelected(null); setTypedName(''); setRemarks('');
      await load();
    } catch (e: any) { setError(e?.response?.data?.message || 'Action failed'); }
  };

  const list = view === 'pending' ? pending : all;
  const canAct = selected && selected.currentStage === 'GUIDE';

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* SRM Header */}
      <div className="bg-white rounded-xl border border-srm-border p-4 mb-6 flex items-center gap-5 shadow-sm">
        <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
          <img
            src="/srm-logo.jpg"
            alt="SRM"
            className="h-16 w-auto object-contain"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = 'none';
              const parent = el.parentElement;
              if (parent && !parent.querySelector('.fallback')) {
                const div = document.createElement('div');
                div.className = 'fallback text-xl font-bold text-srm-blue font-serif px-6 py-3';
                div.textContent = 'SRM';
                parent.appendChild(div);
              }
            }}
          />
        </div>
        <div className="flex-1 border-l-2 border-srm-blue pl-5">
          <h1 className="font-serif text-lg font-bold text-srm-blue leading-tight">SRM Institute of Science and Technology</h1>
          <p className="text-xs text-gray-500 mt-0.5">Supervisor Dashboard &middot; Directorate of Research</p>
        </div>
      </div>

      {error ? (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <span>{error}</span>
        </div>
      ) : null}

      {!selected ? (
        <>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="font-serif text-3xl font-bold text-gray-800 leading-tight">Scholars in Pipeline</h2>
              <p className="text-sm text-gray-500 mt-1">All MoMs from your scholars and their current status</p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-srm-blue uppercase tracking-wider">
                {pending.length} Pending / {all.length} Total
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setView('pending')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${view === 'pending' ? 'bg-srm-blue text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-srm-blue/40'}`}
            >
              Pending My Action ({pending.length})
            </button>
            <button
              onClick={() => setView('all')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${view === 'all' ? 'bg-srm-blue text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-srm-blue/40'}`}
            >
              All Scholars ({all.length})
            </button>
          </div>

          <div className="bg-white rounded-xl border border-srm-border shadow-sm overflow-hidden">
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
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Loading submissions...
                      </div>
                    </td>
                  </tr>
                ) : null}

                {!loading && list.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
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
                    </td>
                  </tr>
                ) : null}

                {!loading && list.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                    <td>
                      <span className="font-mono text-xs font-bold text-gray-800">{m.momNumber}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-srm-blueLight text-srm-blue flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {(m.sectionAScholarName || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{m.sectionAScholarName || ('Scholar #' + m.scholarId)}</p>
                          <p className="text-[11px] text-gray-500">ID: {m.scholarId}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs text-gray-600 font-medium">{m.periodMonth}/{m.periodYear}</span>
                    </td>
                    <td>
                      <span className="text-[11px] font-medium text-gray-700">{stageLabel(m.currentStage)}</span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColor(m.currentStatus)}`}>
                        <StatusIcon status={m.currentStatus} />
                        {m.currentStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
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
        <div className="bg-white rounded-xl border border-srm-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-srm-border bg-gray-50/60 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelected(null)}
                className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-800">
                  {canAct ? 'Review: ' : 'View: '}{selected.momNumber}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selected.sectionAScholarName || ('Scholar #' + selected.scholarId)} &middot; Stage: {stageLabel(selected.currentStage)} &middot; {selected.currentStatus.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColor(selected.currentStatus)}`}>
              <StatusIcon status={selected.currentStatus} />
              {selected.currentStatus.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="border-r border-srm-border max-h-[720px] overflow-y-auto p-6 bg-gray-50/30">
              <MomReviewPanel mom={selected} />
            </div>

            {canAct ? (
              <div className="p-6">
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1 h-5 bg-srm-blue rounded"></div>
                    <h4 className="font-bold text-srm-blue text-sm uppercase tracking-wider">Section H â€” Supervisor Assessment</h4>
                  </div>
                  <p className="text-xs text-gray-500 ml-3">Provide your assessment scores (1-5) and final recommendation</p>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Month</label>
                  <input className="srm-input" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="e.g. October 2026" />
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Assessment Scores (1-5)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {SCORE_FIELDS.map((f) => (
                      <div key={f.key}>
                        <label className="block text-[11px] text-gray-600 mb-1">{f.label}</label>
                        <select className="srm-input" value={scores[f.key]} onChange={(e) => setScores({ ...scores, [f.key]: Number(e.target.value) })}>
                          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Remarks</label>
                  <textarea className="srm-input" rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add your observations..." />
                </div>

                <div className="mb-5 pb-5 border-b border-gray-200">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Type your full name to sign <span className="text-red-500">*</span>
                  </label>
                  <input className="srm-input" value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder="e.g. Guide One" />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setDialog({ open: true, action: 'RECOMMEND' })} disabled={!typedName.trim()} className="srm-btn srm-btn-primary flex-1 justify-center disabled:opacity-40">
                    Recommend
                  </button>
                  <button onClick={() => setDialog({ open: true, action: 'RETURN' })} disabled={!typedName.trim()} className="srm-btn srm-btn-secondary flex-1 justify-center disabled:opacity-40">
                    Return
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-white mx-auto flex items-center justify-center mb-3 shadow-sm">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-2">Read-only View</h4>
                  <p className="text-sm text-gray-600">
                    This MoM is currently at stage <strong>{stageLabel(selected.currentStage)}</strong> with status <strong>{selected.currentStatus.replace(/_/g, ' ')}</strong>.
                    No action is required from you.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <ConfirmationDialog
        open={dialog.open}
        title={dialog.action === 'RECOMMEND' ? 'Recommend this MoM?' : 'Return to Scholar?'}
        message={dialog.action === 'RECOMMEND'
          ? 'This will forward the MoM to the Institutional Research Coordinator for their review.'
          : 'This will return the MoM to the Scholar with your remarks for correction.'}
        confirmLabel={dialog.action === 'RECOMMEND' ? 'Recommend' : 'Return'}
        onCancel={() => setDialog({ open: false, action: 'RECOMMEND' })}
        onConfirm={doAction}
      />
    </div>
  );
}